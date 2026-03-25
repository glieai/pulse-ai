import {
	closeSync,
	existsSync,
	openSync,
	readFileSync,
	readSync,
	readdirSync,
	statSync,
} from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

interface SessionMessage {
	role: "user" | "assistant";
	text: string;
	timestamp: string;
}

/**
 * Derive the Claude Code project directory hash from a working directory.
 * Claude Code uses the path with `/` replaced by `-`.
 * E.g., `/home/ubuntu/pulse` → `-home-ubuntu-pulse`
 *
 * On Windows/WSL the workspace path may use backslashes or a drive letter
 * (e.g. `c:\Users\foo\pulse`). Normalise to forward slashes first.
 */
function projectHash(cwd: string): string {
	// Normalise Windows paths: backslash → slash, strip drive letter (C:)
	const normalised = cwd.replace(/\\/g, "/").replace(/^[A-Za-z]:/, "");
	return normalised.replace(/\//g, "-");
}

/**
 * Find the Claude Code projects directory for the given working directory.
 */
function getProjectDir(cwd: string): string | null {
	const hash = projectHash(cwd);
	const dir = join(homedir(), ".claude", "projects", hash);
	return existsSync(dir) ? dir : null;
}

/**
 * Find the most recent .jsonl session file in the project directory.
 */
function findActiveSession(projectDir: string): string | null {
	const files = readdirSync(projectDir)
		.filter((f) => f.endsWith(".jsonl"))
		.map((f) => ({
			name: f,
			path: join(projectDir, f),
			mtime: statSync(join(projectDir, f)).mtimeMs,
		}))
		.sort((a, b) => b.mtime - a.mtime);

	return files.length > 0 ? files[0].path : null;
}

/**
 * Read the last `maxBytes` from a file. Returns UTF-8 string.
 * Discards the first (potentially partial) line.
 */
function readFileTail(filePath: string, maxBytes: number): string {
	const size = statSync(filePath).size;
	if (size <= maxBytes) {
		return readFileSync(filePath, "utf-8");
	}
	const fd = openSync(filePath, "r");
	const offset = size - maxBytes;
	const buf = Buffer.alloc(maxBytes);
	const bytesRead = readSync(fd, buf, 0, maxBytes, offset);
	closeSync(fd);
	const raw = buf.toString("utf-8", 0, bytesRead);
	// Discard first partial line
	const firstNewline = raw.indexOf("\n");
	return firstNewline === -1 ? raw : raw.slice(firstNewline + 1);
}

/**
 * Parse JSONL content string and extract user/assistant messages.
 */
function parseMessagesFromContent(content: string): SessionMessage[] {
	const lines = content.split("\n").filter(Boolean);

	const messages: SessionMessage[] = [];

	for (const line of lines) {
		try {
			const entry = JSON.parse(line);

			// Skip non-message entries
			if (entry.type !== "user" && entry.type !== "assistant") continue;

			const role = entry.type as "user" | "assistant";
			const msg = entry.message;
			if (!msg?.content) continue;

			// Extract text from content blocks
			let text = "";
			if (typeof msg.content === "string") {
				text = msg.content;
			} else if (Array.isArray(msg.content)) {
				text = msg.content
					.filter(
						(block: { type: string; text?: string; thinking?: string }) =>
							block.type === "text" || block.type === "thinking",
					)
					.map(
						(block: { type: string; text?: string; thinking?: string }) =>
							block.text || block.thinking || "",
					)
					.join("\n");
			}

			if (text.trim()) {
				messages.push({
					role,
					text: text.trim(),
					timestamp: entry.timestamp || "",
				});
			}
		} catch {
			// Skip malformed lines
		}
	}

	return messages;
}

/**
 * Parse a .jsonl session file and extract user/assistant messages.
 * Returns the last N messages (by user message count).
 */
function parseSessionMessages(filePath: string, maxUserMessages: number): SessionMessage[] {
	const content = readFileSync(filePath, "utf-8");
	const messages = parseMessagesFromContent(content);

	// Take last N user messages and their surrounding context
	const userIndices: number[] = [];
	for (let i = 0; i < messages.length; i++) {
		if (messages[i].role === "user") {
			userIndices.push(i);
		}
	}

	const startIdx =
		userIndices.length > maxUserMessages ? userIndices[userIndices.length - maxUserMessages] : 0;

	return messages.slice(startIdx);
}

/**
 * Format session messages into a readable transcript.
 */
function formatTranscript(messages: SessionMessage[], maxLen = 15_000): string {
	let result = "";

	for (const msg of messages) {
		const prefix = msg.role === "user" ? "USER" : "ASSISTANT";
		// Truncate very long assistant messages (often contain code)
		const text = msg.text.length > 2000 ? `${msg.text.slice(0, 2000)}... (truncated)` : msg.text;
		const entry = `[${prefix}] ${text}\n\n`;

		if (result.length + entry.length > maxLen) {
			result += "... (remaining messages truncated)\n";
			break;
		}
		result += entry;
	}

	return result;
}

export interface SessionInfo {
	sessionId: string;
	filePath: string;
}

export interface ActiveSession {
	sessionId: string;
	filePath: string;
	size: number;
	title?: string;
}

/**
 * Extract a human-readable title from a session file.
 * Reads only the first ~8 KB looking for the first user text message.
 * Returns the first non-IDE-context text, truncated to 60 chars.
 */
export function getSessionTitle(filePath: string): string | null {
	try {
		const fd = openSync(filePath, "r");
		const buf = Buffer.alloc(8192);
		const bytesRead = readSync(fd, buf, 0, 8192, 0);
		closeSync(fd);

		const chunk = buf.toString("utf-8", 0, bytesRead);
		const lines = chunk.split("\n");

		for (const line of lines) {
			if (!line.trim()) continue;
			try {
				const entry = JSON.parse(line);
				if (entry.type !== "user") continue;

				const content = entry.message?.content;
				if (!Array.isArray(content)) continue;

				for (const block of content) {
					if (block.type !== "text") continue;
					const text = block.text?.trim();
					if (!text || text.startsWith("<")) continue;
					return text.length > 60 ? `${text.slice(0, 57)}...` : text;
				}
			} catch {
				// malformed line, skip
			}
		}
	} catch {
		// file read error
	}
	return null;
}

/**
 * Get transcript from the most recent Claude Code session.
 * Returns empty string if no session found.
 */
export function getSessionTranscript(cwd: string, maxUserMessages = 30): string {
	const projectDir = getProjectDir(cwd);
	if (!projectDir) return "";

	const sessionPath = findActiveSession(projectDir);
	if (!sessionPath) return "";

	const messages = parseSessionMessages(sessionPath, maxUserMessages);
	return formatTranscript(messages);
}

/**
 * Get info about the active session (for watcher display).
 * No file I/O — only reads directory metadata.
 */
export function getActiveSessionInfo(cwd: string): SessionInfo | null {
	const projectDir = getProjectDir(cwd);
	if (!projectDir) return null;

	const sessionPath = findActiveSession(projectDir);
	if (!sessionPath) return null;

	const filename = sessionPath.split("/").pop() ?? "";
	const sessionId = filename.replace(".jsonl", "").slice(0, 8);

	return { sessionId, filePath: sessionPath };
}

/**
 * Get all active session files for the project.
 * Returns sessions modified within maxAgeMs, sorted by most recent.
 * Each entry includes current file size (from the same statSync used for mtime).
 */
export function getAllActiveSessions(cwd: string, maxAgeMs = 3600_000): ActiveSession[] {
	const projectDir = getProjectDir(cwd);
	if (!projectDir) return [];

	const now = Date.now();
	return readdirSync(projectDir)
		.filter((f) => f.endsWith(".jsonl"))
		.map((f) => {
			const filePath = join(projectDir, f);
			const stat = statSync(filePath);
			return {
				sessionId: f.replace(".jsonl", "").slice(0, 8),
				filePath,
				size: stat.size,
				mtime: stat.mtimeMs,
			};
		})
		.filter((f) => now - f.mtime < maxAgeMs)
		.sort((a, b) => b.mtime - a.mtime)
		.map(({ mtime: _, ...rest }) => rest);
}

/**
 * Find a session file by ID prefix (supports partial IDs like "59db593c").
 * Returns full session info or null if not found.
 */
export function findSessionById(cwd: string, sessionId: string): SessionInfo | null {
	const projectDir = getProjectDir(cwd);
	if (!projectDir) return null;

	const files = readdirSync(projectDir).filter((f) => f.endsWith(".jsonl"));
	const match = files.find((f) => f.startsWith(sessionId));
	if (!match) return null;

	return {
		sessionId: match.replace(".jsonl", "").slice(0, 8),
		filePath: join(projectDir, match),
	};
}

/**
 * Get an expanded transcript for reflect mode.
 * Reads the last `maxBytes` of the session file (default 256KB).
 * If `sessionId` is provided, loads that specific session; otherwise the most recent.
 */
export function getSessionTranscriptExpanded(
	cwd: string,
	sessionId?: string,
	maxBytes = 262_144,
): { transcript: string; sessionId: string } | null {
	let filePath: string;
	let resolvedId: string;

	if (sessionId) {
		const found = findSessionById(cwd, sessionId);
		if (!found) return null;
		filePath = found.filePath;
		resolvedId = found.sessionId;
	} else {
		const projectDir = getProjectDir(cwd);
		if (!projectDir) return null;
		const active = findActiveSession(projectDir);
		if (!active) return null;
		filePath = active;
		const filename = active.split("/").pop() ?? "";
		resolvedId = filename.replace(".jsonl", "").slice(0, 8);
	}

	const content = readFileTail(filePath, maxBytes);
	const messages = parseMessagesFromContent(content);
	const transcript = formatTranscript(messages, maxBytes);

	return { transcript, sessionId: resolvedId };
}
