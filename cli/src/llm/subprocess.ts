import { type ChildProcess, execSync, spawn } from "node:child_process";

const DEFAULT_TIMEOUT_MS = 120_000;

export interface SubprocessResult {
	stdout: string;
	stderr: string;
	exitCode: number;
}

export interface SpawnOptions {
	command: string;
	args: string[];
	/** Data to pipe into stdin (for large prompts). */
	stdin?: string;
	/** Timeout in ms. Default: 120_000 (2 minutes). */
	timeoutMs?: number;
}

// ── CLI detection (cached) ──────────────────────────────────

let claudeCache: boolean | undefined;
let codexCache: boolean | undefined;

/** Check if a CLI binary is available on PATH. */
export function whichBinary(name: string): string | null {
	try {
		return execSync(`which ${name}`, { encoding: "utf-8", timeout: 5_000 }).trim() || null;
	} catch {
		return null;
	}
}

export function isClaudeCliAvailable(): boolean {
	if (claudeCache === undefined) {
		claudeCache = whichBinary("claude") !== null;
	}
	return claudeCache;
}

export function isCodexCliAvailable(): boolean {
	if (codexCache === undefined) {
		codexCache = whichBinary("codex") !== null;
	}
	return codexCache;
}

/** Reset cache (for testing). */
export function resetCliCache(): void {
	claudeCache = undefined;
	codexCache = undefined;
}

// ── Subprocess runner ───────────────────────────────────────

/**
 * Spawn a subprocess, optionally pipe stdin, collect stdout/stderr.
 *
 * Uses Node.js child_process.spawn for cross-runtime compatibility.
 * Rejects on: binary not found, timeout, non-zero exit code.
 */
export function runSubprocess(options: SpawnOptions): Promise<SubprocessResult> {
	const { command, args, stdin, timeoutMs = DEFAULT_TIMEOUT_MS } = options;

	return new Promise((resolve, reject) => {
		const proc: ChildProcess = spawn(command, args, {
			stdio: ["pipe", "pipe", "pipe"],
			env: { ...process.env },
		});

		let stdout = "";
		let stderr = "";
		let killed = false;

		proc.stdout?.on("data", (data: Buffer) => {
			stdout += data.toString();
		});
		proc.stderr?.on("data", (data: Buffer) => {
			stderr += data.toString();
		});

		// biome-ignore lint: @types/bun strips EventEmitter from ChildProcess
		(proc as any).on("error", (err: Error) => {
			if (err.message.includes("ENOENT")) {
				reject(new Error(`"${command}" not found. Install it and try again.`));
			} else {
				reject(new Error(`"${command}" spawn error: ${err.message}`));
			}
		});

		// biome-ignore lint: @types/bun strips EventEmitter from ChildProcess
		(proc as any).on("close", (code: number | null) => {
			if (killed) return;
			const exitCode = code ?? 1;
			if (exitCode !== 0) {
				reject(
					new Error(
						`"${command}" exited with code ${exitCode}${stderr ? `: ${stderr.slice(0, 500)}` : ""}`,
					),
				);
				return;
			}
			resolve({ stdout, stderr, exitCode });
		});

		// Write stdin if provided, then close
		if (stdin) {
			proc.stdin?.write(stdin);
		}
		proc.stdin?.end();

		// Timeout
		setTimeout(() => {
			killed = true;
			proc.kill();
			reject(new Error(`"${command}" timed out after ${timeoutMs / 1000}s`));
		}, timeoutMs);
	});
}
