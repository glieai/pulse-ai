/**
 * Auto-configure Pulse MCP server for Claude Code and Codex.
 *
 * When the extension activates with a valid API URL + token,
 * it writes/updates:
 *   - ~/.claude/.mcp.json   + ~/.claude/settings.json   (Claude Code)
 *   - ~/.codex/config.toml                               (Codex)
 *
 * so that Pulse tools are available globally — across all repos.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

interface McpServerEntry {
	type: string;
	command: string;
	args: string[];
	env?: Record<string, string>;
}

interface McpConfig {
	mcpServers: Record<string, McpServerEntry>;
}

interface SettingsJson {
	env?: Record<string, string>;
	[key: string]: unknown;
}

const HOME = homedir();
const CLAUDE_DIR = join(HOME, ".claude");
const MCP_JSON_PATH = join(CLAUDE_DIR, ".mcp.json");
const SETTINGS_JSON_PATH = join(CLAUDE_DIR, "settings.json");
const CODEX_DIR = join(HOME, ".codex");
const CODEX_CONFIG_PATH = join(CODEX_DIR, "config.toml");

function readJson<T>(path: string, fallback: T): T {
	if (!existsSync(path)) return fallback;
	try {
		return JSON.parse(readFileSync(path, "utf-8")) as T;
	} catch {
		return fallback;
	}
}

function writeJson(path: string, data: unknown, indent: string | number = "\t"): void {
	writeFileSync(path, `${JSON.stringify(data, null, indent)}\n`);
}

/** Normalize API URL to always end with /api */
function normalizeApiUrl(apiUrl: string): string {
	let url = apiUrl.replace(/\/+$/, "");
	if (!url.endsWith("/api")) url += "/api";
	return url;
}

/**
 * Ensure Pulse MCP server is registered globally for Claude Code.
 * Writes ~/.claude/.mcp.json and ~/.claude/settings.json.
 */
function ensureClaudeCodeMcp(normalizedUrl: string, token: string): void {
	if (!existsSync(CLAUDE_DIR)) {
		mkdirSync(CLAUDE_DIR, { recursive: true });
	}

	// 1. Update .mcp.json — add/update pulse server
	const mcpConfig = readJson<McpConfig>(MCP_JSON_PATH, { mcpServers: {} });

	const desired: McpServerEntry = {
		type: "stdio",
		command: "npx",
		args: ["-y", "@glie/pulse-mcp@latest"],
		env: {
			PULSE_API_URL: normalizedUrl,
			PULSE_API_TOKEN: token,
		},
	};

	const existing = mcpConfig.mcpServers.pulse;
	const needsUpdate =
		!existing ||
		existing.command !== desired.command ||
		JSON.stringify(existing.args) !== JSON.stringify(desired.args) ||
		existing.env?.PULSE_API_URL !== desired.env?.PULSE_API_URL ||
		existing.env?.PULSE_API_TOKEN !== desired.env?.PULSE_API_TOKEN;

	if (needsUpdate) {
		mcpConfig.mcpServers.pulse = desired;
		writeJson(MCP_JSON_PATH, mcpConfig);
	}
}

/**
 * Ensure Pulse MCP server is registered globally for Codex.
 * Appends/updates [mcp_servers.pulse] in ~/.codex/config.toml.
 */
function ensureCodexMcp(normalizedUrl: string, token: string): void {
	if (!existsSync(CODEX_DIR)) {
		mkdirSync(CODEX_DIR, { recursive: true });
	}

	let toml = "";
	if (existsSync(CODEX_CONFIG_PATH)) {
		toml = readFileSync(CODEX_CONFIG_PATH, "utf-8");
	}

	// Build the desired TOML block
	const block = [
		"[mcp_servers.pulse]",
		'command = "npx"',
		'args = ["-y", "@glie/pulse-mcp"]',
		"",
		"[mcp_servers.pulse.env]",
		`PULSE_API_URL = "${normalizedUrl}"`,
		`PULSE_API_TOKEN = "${token}"`,
	].join("\n");

	// Check if pulse section already exists
	if (toml.includes("[mcp_servers.pulse]")) {
		// Replace existing pulse block — match from [mcp_servers.pulse] to next section or EOF
		const replaced = toml.replace(
			/\[mcp_servers\.pulse\][\s\S]*?(?=\n\[(?!mcp_servers\.pulse)|$)/,
			`${block}\n`,
		);
		if (replaced !== toml) {
			writeFileSync(CODEX_CONFIG_PATH, replaced);
		}
	} else {
		// Append pulse block
		const separator = toml.length > 0 && !toml.endsWith("\n\n") ? "\n\n" : "\n";
		writeFileSync(CODEX_CONFIG_PATH, `${toml}${separator}${block}\n`);
	}
}

/**
 * Ensure Pulse MCP is configured in the current workspace folder.
 * Creates a LOCAL .mcp.json (Claude Code reads this per-folder).
 * Also configures global ~/.claude and ~/.codex for fallback.
 */
export function ensureGlobalMcp(apiUrl: string, token: string, workspaceFolder?: string): void {
	if (!apiUrl || !token) return;

	const normalizedUrl = normalizeApiUrl(apiUrl);

	// Local .mcp.json in workspace — this is what Claude Code actually reads reliably
	if (workspaceFolder) {
		try {
			ensureLocalMcp(normalizedUrl, token, workspaceFolder);
		} catch {
			// Non-critical
		}
	}

	// Global configs as fallback
	try {
		ensureClaudeCodeMcp(normalizedUrl, token);
	} catch {
		// Non-critical — don't break extension activation
	}

	try {
		ensureCodexMcp(normalizedUrl, token);
	} catch {
		// Non-critical — don't break extension activation
	}
}

/**
 * Create/update .mcp.json in the workspace folder.
 * This is the most reliable way — Claude Code reads local .mcp.json per-folder.
 */
function ensureLocalMcp(normalizedUrl: string, token: string, workspaceFolder: string): void {
	const localMcpPath = join(workspaceFolder, ".mcp.json");
	const mcpConfig = readJson<McpConfig>(localMcpPath, { mcpServers: {} });

	const desired: McpServerEntry = {
		type: "stdio",
		command: "npx",
		args: ["-y", "@glie/pulse-mcp@latest"],
		env: {
			PULSE_API_URL: normalizedUrl,
			PULSE_API_TOKEN: token,
		},
	};

	const existing = mcpConfig.mcpServers.pulse;
	const needsUpdate =
		!existing ||
		existing.env?.PULSE_API_URL !== desired.env?.PULSE_API_URL ||
		existing.env?.PULSE_API_TOKEN !== desired.env?.PULSE_API_TOKEN;

	if (needsUpdate) {
		mcpConfig.mcpServers.pulse = desired;
		writeJson(localMcpPath, mcpConfig);
	}
}
