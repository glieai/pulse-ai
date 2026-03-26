import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import * as vscode from "vscode";

export interface PulseExtensionConfig {
	apiUrl: string;
	token: string;
	repo: string;
}

const CONFIG_PATH = join(homedir(), ".pulse", "config.json");

const SOLO_DEFAULTS: PulseExtensionConfig = {
	apiUrl: "http://localhost:3000",
	token: "",
	repo: "",
};

/**
 * Config resolution — single source of truth:
 * 1. ~/.pulse/config.json (created by `pulse init`)
 * 2. Env vars overlay (for CI/containers)
 *
 * Always returns a valid config. Solo mode needs zero configuration.
 */
export function resolveConfig(): PulseExtensionConfig {
	const config: PulseExtensionConfig = { ...SOLO_DEFAULTS };

	// ~/.pulse/config.json — shared with CLI
	if (existsSync(CONFIG_PATH)) {
		try {
			const raw = readFileSync(CONFIG_PATH, "utf-8");
			const parsed = JSON.parse(raw);
			if (parsed.apiUrl) config.apiUrl = parsed.apiUrl;
			if (parsed.token) config.token = parsed.token;
			if (parsed.repo) config.repo = parsed.repo;
		} catch {}
	}

	// Env vars override (CI, containers)
	if (process.env.PULSE_API_URL) config.apiUrl = process.env.PULSE_API_URL;
	if (process.env.PULSE_TOKEN) config.token = process.env.PULSE_TOKEN;

	return config;
}

/** Returns true if pulse has been configured (config.json exists with token or solo mode). */
export function isConfigured(): boolean {
	return existsSync(CONFIG_PATH);
}

/** Extract repo name from git remote. Returns empty string if not in a git repo. */
export function detectRepoFromGit(cwd: string): string {
	try {
		const remote = execSync("git remote get-url origin", {
			encoding: "utf-8",
			timeout: 5000,
			cwd,
		}).trim();
		const match = remote.match(/[/:]([\w.-]+\/[\w.-]+?)(?:\.git)?$/);
		if (!match) return "";
		// Return just the repo name (e.g. "pulse"), not "org/repo"
		const parts = match[1].split("/");
		return parts[parts.length - 1];
	} catch {
		return "";
	}
}

/**
 * Listen for config changes in VS Code settings.
 * Returns a disposable to clean up the listener.
 */
export function onConfigChange(callback: () => void): vscode.Disposable {
	return vscode.workspace.onDidChangeConfiguration((e) => {
		if (e.affectsConfiguration("pulse")) {
			callback();
		}
	});
}
