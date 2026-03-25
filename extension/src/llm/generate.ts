/**
 * Insight generation orchestrator with fallback chain.
 *
 * auto mode:  vscode.lm → Claude CLI → Codex CLI → manual API key → actionable error
 * explicit:   direct API (anthropic|openai) → error if no key
 */

import { spawn } from "node:child_process";
import { execSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { SYSTEM_PROMPT, buildUserPrompt } from "@pulse/cli/llm/prompt";
import type { GeneratedInsight, InsightContext } from "@pulse/cli/llm/types";
import * as vscode from "vscode";
import { generateInsightDirect } from "./direct-provider";
import { parseInsightResponse } from "./parse";
import { generateInsightVscodeLm } from "./vscode-lm";

/**
 * Find Claude Code CLI binary from the installed VS Code extension.
 * The binary is at: <extensionPath>/resources/native-binary/claude
 * This is needed because the extension installs the binary outside of PATH.
 */
function findClaudeCodeBinary(): string | null {
	// Check PATH first
	try {
		const onPath = execSync("which claude", { encoding: "utf-8", timeout: 5_000 }).trim();
		if (onPath) return onPath;
	} catch {}

	// Check Claude Code extension's bundled binary via VS Code API
	const claudeExt = vscode.extensions.getExtension("anthropic.claude-code");
	if (claudeExt) {
		const binaryPath = join(claudeExt.extensionPath, "resources", "native-binary", "claude");
		if (existsSync(binaryPath)) return binaryPath;
	}

	// Fallback: scan common extension paths (WSL, remote, local)
	const home = homedir();
	const searchDirs = [
		join(home, ".vscode-server", "extensions"),
		join(home, ".vscode", "extensions"),
		join(home, ".cursor", "extensions"),
	];
	for (const dir of searchDirs) {
		try {
			if (!existsSync(dir)) continue;
			const entries = readdirSync(dir);
			for (const entry of entries) {
				if (entry.startsWith("anthropic.claude-code")) {
					const bin = join(dir, entry, "resources", "native-binary", "claude");
					if (existsSync(bin)) return bin;
				}
			}
		} catch {}
	}

	return null;
}

/**
 * Run Claude CLI using Node.js child_process (not Bun.spawn).
 * This is the extension-specific implementation — the CLI uses Bun.spawn
 * which doesn't exist in the VS Code Node.js runtime.
 */
function runClaudeCli(
	binary: string,
	systemPrompt: string,
	userPrompt: string,
	model?: string,
): Promise<string> {
	return new Promise((resolve, reject) => {
		const args = [
			"-p",
			"--system-prompt",
			systemPrompt,
			"--max-turns",
			"1",
			"--tools",
			"",
			"--output-format",
			"text",
			"--no-session-persistence",
		];
		if (model) {
			args.push("--model", model);
		}

		const proc = spawn(binary, args, {
			stdio: ["pipe", "pipe", "pipe"],
			env: { ...process.env },
			timeout: 120_000,
		});

		let stdout = "";
		let stderr = "";

		proc.stdout.on("data", (data: Buffer) => {
			stdout += data.toString();
		});
		proc.stderr.on("data", (data: Buffer) => {
			stderr += data.toString();
		});

		proc.on("error", (err: Error) => {
			reject(new Error(`Claude CLI spawn error: ${err.message}`));
		});

		proc.on("close", (code: number | null) => {
			if (code !== 0) {
				reject(
					new Error(
						`Claude CLI exited with code ${code}${stderr ? `: ${stderr.slice(0, 500)}` : ""}`,
					),
				);
				return;
			}
			if (!stdout.trim()) {
				reject(new Error("Claude CLI returned empty output"));
				return;
			}
			resolve(stdout.trim());
		});

		// Write prompt to stdin and close
		proc.stdin.write(userPrompt);
		proc.stdin.end();

		// Timeout fallback (in case spawn timeout doesn't work on all platforms)
		setTimeout(() => {
			proc.kill();
			reject(new Error("Claude CLI timed out after 120s"));
		}, 125_000);
	});
}

/** Check if codex CLI is on PATH (Node.js compatible). */
function isCodexOnPath(): boolean {
	try {
		execSync("which codex", { encoding: "utf-8", timeout: 5_000 });
		return true;
	} catch {
		return false;
	}
}

/** Run Codex CLI using Node.js child_process. */
function runCodexCli(userPrompt: string, model?: string): Promise<string> {
	return new Promise((resolve, reject) => {
		const args = ["-q", "--full-context"];
		if (model) args.push("-m", model);

		const proc = spawn("codex", args, {
			stdio: ["pipe", "pipe", "pipe"],
			env: { ...process.env },
			timeout: 120_000,
		});

		let stdout = "";
		let stderr = "";

		proc.stdout.on("data", (data: Buffer) => {
			stdout += data.toString();
		});
		proc.stderr.on("data", (data: Buffer) => {
			stderr += data.toString();
		});

		proc.on("error", (err: Error) => {
			reject(new Error(`Codex CLI spawn error: ${err.message}`));
		});

		proc.on("close", (code: number | null) => {
			if (code !== 0) {
				reject(
					new Error(
						`Codex CLI exited with code ${code}${stderr ? `: ${stderr.slice(0, 500)}` : ""}`,
					),
				);
				return;
			}
			if (!stdout.trim()) {
				reject(new Error("Codex CLI returned empty output"));
				return;
			}
			resolve(stdout.trim());
		});

		proc.stdin.write(userPrompt);
		proc.stdin.end();

		setTimeout(() => {
			proc.kill();
			reject(new Error("Codex CLI timed out after 120s"));
		}, 125_000);
	});
}

/** Thrown when no LLM credentials are found. Handled in insight command for actionable UX. */
export class NoLlmError extends Error {
	constructor() {
		super("No LLM credentials found");
		this.name = "NoLlmError";
	}
}

function inferProvider(apiKey: string): "anthropic" | "openai" {
	return apiKey.startsWith("sk-ant-") ? "anthropic" : "openai";
}

export async function generateInsight(context: InsightContext): Promise<GeneratedInsight> {
	const config = vscode.workspace.getConfiguration("pulse");
	const provider = config.get<string>("llmProvider") ?? "auto";
	const apiKey = config.get<string>("llmApiKey") ?? "";
	const model = config.get<string>("llmModel") || undefined;

	// Explicit provider — use direct API with manual key
	if (provider === "anthropic" || provider === "openai") {
		if (!apiKey) {
			throw new Error(
				`LLM provider set to "${provider}" but no API key configured. Set pulse.llmApiKey in VS Code settings.`,
			);
		}
		return generateInsightDirect(provider, apiKey, model, context);
	}

	// Auto mode — waterfall through available options

	// 1. vscode.lm (GitHub Copilot, etc.)
	try {
		return await generateInsightVscodeLm(context);
	} catch (err) {
		// Fall through to next provider on any vscode.lm failure (no models, quota, auth, etc.)
		console.warn(
			`vscode.lm failed, trying next provider: ${err instanceof Error ? err.message : "unknown"}`,
		);
	}

	// 2. Claude Code CLI — check PATH and VS Code extension bundle
	const claudeBinary = findClaudeCodeBinary();
	if (claudeBinary) {
		try {
			const text = await runClaudeCli(claudeBinary, SYSTEM_PROMPT, buildUserPrompt(context), model);
			return parseInsightResponse(text);
		} catch (err) {
			console.warn(`Claude CLI failed: ${err instanceof Error ? err.message : "unknown"}`);
		}
	}

	// 3. Codex CLI subprocess (uses GPT Teams subscription)
	if (isCodexOnPath()) {
		try {
			const text = await runCodexCli(buildUserPrompt(context), model);
			return parseInsightResponse(text);
		} catch (err) {
			console.warn(`Codex CLI failed: ${err instanceof Error ? err.message : "unknown"}`);
		}
	}

	// 4. Manual API key from VS Code settings
	if (apiKey) {
		const inferred = inferProvider(apiKey);
		return generateInsightDirect(inferred, apiKey, model, context);
	}

	// 5. Nothing available
	throw new NoLlmError();
}
