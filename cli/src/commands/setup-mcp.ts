import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { c, error, info, success, warn } from "../output";

const HOME = homedir();
const CODEX_DIR = join(HOME, ".codex");
const CODEX_CONFIG_PATH = join(CODEX_DIR, "config.toml");

/** Normalize API URL to always end with /api */
function normalizeApiUrl(apiUrl: string): string {
	let url = apiUrl.replace(/\/+$/, "");
	if (!url.endsWith("/api")) url += "/api";
	return url;
}

/** Find the claude CLI binary (PATH or VS Code extension bundle). */
function findClaudeBinary(): string | null {
	try {
		return execSync("which claude", { encoding: "utf-8", timeout: 5_000 }).trim();
	} catch {}

	const searchDirs = [
		join(HOME, ".vscode-server", "extensions"),
		join(HOME, ".vscode", "extensions"),
		join(HOME, ".cursor", "extensions"),
	];
	for (const dir of searchDirs) {
		try {
			if (!existsSync(dir)) continue;
			for (const entry of require("node:fs").readdirSync(dir)) {
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
 * Configure Pulse MCP server globally for Claude Code.
 * Uses `claude mcp add --scope user` (writes to ~/.claude.json).
 */
function setupClaudeCode(normalizedUrl: string, token: string): boolean {
	const claude = findClaudeBinary();
	if (!claude) {
		warn("Claude Code not found — skipping Claude Code MCP setup");
		info("  Install Claude Code and re-run: pulse setup-mcp");
		return false;
	}

	// Remove existing pulse MCP (ignore errors if not present)
	try {
		execSync(`${JSON.stringify(claude)} mcp remove pulse --scope user`, {
			encoding: "utf-8",
			timeout: 10_000,
			stdio: "pipe",
		});
	} catch {}

	// Add with user scope (global, all projects)
	execSync(
		[
			JSON.stringify(claude),
			"mcp",
			"add",
			"pulse",
			"--scope",
			"user",
			"--transport",
			"stdio",
			"-e",
			`PULSE_API_URL=${normalizedUrl}`,
			"-e",
			`PULSE_API_TOKEN=${token}`,
			"--",
			"npx",
			"-y",
			"@glie/pulse-mcp@latest",
		].join(" "),
		{ encoding: "utf-8", timeout: 10_000, stdio: "pipe" },
	);
	return true;
}

/**
 * Configure Pulse MCP server globally for Codex.
 * Appends/updates [mcp_servers.pulse] in ~/.codex/config.toml.
 */
function setupCodex(normalizedUrl: string, token: string): void {
	if (!existsSync(CODEX_DIR)) {
		mkdirSync(CODEX_DIR, { recursive: true });
	}

	let toml = "";
	if (existsSync(CODEX_CONFIG_PATH)) {
		toml = readFileSync(CODEX_CONFIG_PATH, "utf-8");
	}

	const block = [
		"[mcp_servers.pulse]",
		'command = "npx"',
		'args = ["-y", "@glie/pulse-mcp@latest"]',
		"",
		"[mcp_servers.pulse.env]",
		`PULSE_API_URL = "${normalizedUrl}"`,
		`PULSE_API_TOKEN = "${token}"`,
	].join("\n");

	if (toml.includes("[mcp_servers.pulse]")) {
		const replaced = toml.replace(
			/\[mcp_servers\.pulse\][\s\S]*?(?=\n\[(?!mcp_servers\.pulse)|$)/,
			`${block}\n`,
		);
		if (replaced !== toml) {
			writeFileSync(CODEX_CONFIG_PATH, replaced);
		}
	} else {
		const separator = toml.length > 0 && !toml.endsWith("\n\n") ? "\n\n" : "\n";
		writeFileSync(CODEX_CONFIG_PATH, `${toml}${separator}${block}\n`);
	}
}

/**
 * Configure Pulse MCP server globally for both Claude Code and Codex.
 * Uses the official `claude mcp add --scope user` API.
 */
export function setupGlobalMcp(apiUrl: string, token: string): boolean {
	const normalizedUrl = normalizeApiUrl(apiUrl);
	let ok = false;

	try {
		ok = setupClaudeCode(normalizedUrl, token);
	} catch (err) {
		warn(`Claude Code MCP setup failed: ${err instanceof Error ? err.message : "unknown"}`);
	}

	try {
		setupCodex(normalizedUrl, token);
		ok = true;
	} catch {}

	return ok;
}

/** Standalone command for setting up MCP integration */
export default async function setupMcpCommand(args: string[]): Promise<void> {
	const apiUrl = args[0];
	const token = args[1];

	if (!apiUrl || !token) {
		error("Usage: pulse setup-mcp <api-url> <token>");
		info("  Or run 'pulse init' for full interactive setup");
		process.exit(1);
	}

	const ok = setupGlobalMcp(apiUrl, token);
	if (ok) {
		success("MCP server registered globally (~/.claude.json)");
		info("  Pulse tools available in Claude Code & Codex across all repos");
	}
}
