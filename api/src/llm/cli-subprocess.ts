/**
 * Server-side CLI subprocess runner.
 *
 * Spawns CLI tools (claude, codex) as subprocesses with an expanded PATH
 * that includes nvm, ~/.local/bin, ~/.bun/bin, etc.
 *
 * Solo Mode only — the server IS the developer's machine.
 */

import { getExtraBinPaths } from "../services/org";

const DEFAULT_TIMEOUT_MS = 120_000;

/** Build a PATH string that includes common global binary locations. */
function buildExpandedPath(): string {
	const extra = getExtraBinPaths().join(":");
	return `${extra}:${process.env.PATH ?? ""}`;
}

/**
 * Spawn a CLI command, pipe stdin, collect stdout.
 *
 * @returns The trimmed stdout output.
 * @throws On binary not found, non-zero exit, or timeout.
 */
export async function runCliCommand(
	command: string,
	args: string[],
	stdin?: string,
	timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<string> {
	const expandedPath = buildExpandedPath();

	const proc = Bun.spawn([command, ...args], {
		stdin: "pipe",
		stdout: "pipe",
		stderr: "pipe",
		env: { ...process.env, PATH: expandedPath },
	});

	// Write stdin if provided, then close
	if (stdin) {
		proc.stdin.write(stdin);
	}
	proc.stdin.end();

	// Race between process completion and timeout
	const timeoutPromise = new Promise<never>((_, reject) => {
		setTimeout(() => {
			proc.kill();
			reject(new Error(`"${command}" timed out after ${timeoutMs / 1000}s`));
		}, timeoutMs);
	});

	let exitCode: number;
	try {
		exitCode = await Promise.race([proc.exited, timeoutPromise]);
	} catch (err) {
		if (err instanceof Error && err.message.includes("not found")) {
			throw new Error(`"${command}" not found. Install it first.`);
		}
		throw err;
	}

	const stdout = await new Response(proc.stdout).text();
	const stderr = await new Response(proc.stderr).text();

	if (exitCode !== 0) {
		throw new Error(
			`"${command}" exited with code ${exitCode}${stderr ? `: ${stderr.slice(0, 500)}` : ""}`,
		);
	}

	const trimmed = stdout.trim();
	if (!trimmed) {
		throw new Error(`"${command}" returned empty output`);
	}

	return trimmed;
}
