import { execSync } from "node:child_process";

function exec(cmd: string): string {
	try {
		return execSync(cmd, { encoding: "utf-8", timeout: 10000 }).trim();
	} catch {
		return "";
	}
}

export function getGitRemote(): string | null {
	const remote = exec("git remote get-url origin");
	if (!remote) return null;
	const match = remote.match(/[/:]([\w.-]+\/[\w.-]+?)(?:\.git)?$/);
	return match ? (match[1].split("/").pop() ?? null) : null;
}

export function getGitBranch(): string {
	return exec("git branch --show-current") || "unknown";
}

export function getGitDiff(): string {
	// Staged + unstaged, summary only (keep it compact)
	const stat = exec("git diff --stat HEAD");
	const diff = exec("git diff HEAD --no-color -U3");
	// Truncate to avoid blowing up LLM context
	const maxLen = 8000;
	if (diff.length > maxLen) {
		return `${stat}\n\n${diff.slice(0, maxLen)}\n... (truncated)`;
	}
	return stat ? `${stat}\n\n${diff}` : diff;
}

export function getRecentCommits(count = 10): string {
	return exec(`git log --oneline -${count}`);
}

export function getModifiedFiles(): string[] {
	const files = exec("git diff --name-only HEAD");
	return files ? files.split("\n").filter(Boolean) : [];
}

export interface GitContext {
	repo: string;
	branch: string;
	diff: string;
	recentCommits: string;
	sourceFiles: string[];
}

export function gatherGitContext(): GitContext {
	return {
		repo: getGitRemote() ?? "unknown",
		branch: getGitBranch(),
		diff: getGitDiff(),
		recentCommits: getRecentCommits(),
		sourceFiles: getModifiedFiles(),
	};
}
