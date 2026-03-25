import { execSync } from "node:child_process";
import { getActiveSessionInfo, getSessionTranscript } from "@pulse/cli/context/session";
import type { InsightContext } from "@pulse/cli/llm/types";
import * as vscode from "vscode";
import type { PulseApiClient } from "../api/client";

function exec(cmd: string, cwd: string): string {
	try {
		return execSync(cmd, { encoding: "utf-8", timeout: 10000, cwd }).trim();
	} catch {
		return "";
	}
}

function getWorkspaceCwd(): string | null {
	return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? null;
}

function gatherGitContext(
	cwd: string,
	commitHash?: string,
): {
	repo: string;
	branch: string;
	diff: string;
	recentCommits: string;
	sourceFiles: string[];
	commitMessage: string;
} {
	const remote = exec("git remote get-url origin", cwd);
	const match = remote.match(/[/:]([\w.-]+\/[\w.-]+?)(?:\.git)?$/);
	const repo = match ? (match[1].split("/").pop() ?? "unknown") : "unknown";

	const branch = exec("git branch --show-current", cwd) || "unknown";

	// If triggered by a specific commit, show that commit's diff
	// Otherwise show working tree diff (uncommitted changes)
	let stat: string;
	let diff: string;
	let files: string;
	let commitMessage = "";

	if (commitHash) {
		stat = exec(`git show --stat --format="" ${commitHash}`, cwd);
		diff = exec(`git show --no-color -U3 --format="" ${commitHash}`, cwd);
		files = exec(`git diff-tree --no-commit-id --name-only -r ${commitHash}`, cwd);
		commitMessage = exec(`git log -1 --format=%B ${commitHash}`, cwd);
	} else {
		stat = exec("git diff --stat HEAD", cwd);
		diff = exec("git diff HEAD --no-color -U3", cwd);
		files = exec("git diff --name-only HEAD", cwd);
	}

	const maxLen = 8000;
	const fullDiff =
		diff.length > maxLen
			? `${stat}\n\n${diff.slice(0, maxLen)}\n... (truncated)`
			: stat
				? `${stat}\n\n${diff}`
				: diff;

	const recentCommits = exec("git log --oneline -10", cwd);
	const sourceFiles = files ? files.split("\n").filter(Boolean) : [];

	return { repo, branch, diff: fullDiff, recentCommits, sourceFiles, commitMessage };
}

interface RelatedContextResult {
	id: string;
	kind: string;
	title: string;
	body_excerpt: string;
	branch: string | null;
	source_files: string[] | null;
	status: string;
	score: number;
}

/** Format related context results into a prompt-ready string with body excerpts. */
function formatContextForPrompt(insights: RelatedContextResult[]): string {
	const formatted = insights
		.map((i) => {
			const meta: string[] = [];
			if (i.branch) meta.push(`branch: ${i.branch}`);
			if (i.source_files?.length) {
				meta.push(`files: ${i.source_files.slice(0, 3).join(", ")}`);
			}
			if (i.status === "draft") meta.push("draft");

			const metaStr = meta.length > 0 ? `  (${meta.join(", ")})` : "";
			const excerpt = i.body_excerpt.length >= 300 ? `${i.body_excerpt}...` : i.body_excerpt;

			return `### [${i.kind.toUpperCase()}] ${i.title}${metaStr}\n${excerpt}`;
		})
		.join("\n\n");

	return `## Existing Insights — DO NOT REPEAT\n\n${formatted}`;
}

/**
 * Gather all context for insight generation from VS Code workspace.
 */
export async function gatherContext(
	client: PulseApiClient,
	configRepo: string,
	commitHash?: string,
): Promise<InsightContext> {
	const cwd = getWorkspaceCwd();
	if (!cwd) {
		throw new Error("No workspace folder open.");
	}

	const git = gatherGitContext(cwd, commitHash);

	let transcript = "";
	try {
		transcript = getSessionTranscript(cwd);
	} catch {
		// No session found — proceed without transcript
	}

	// Get active session ID for context scoring
	const sessionInfo = getActiveSessionInfo(cwd);

	// Fetch related insights — all signals combined (session, files, branch, keywords)
	let existingInsights = "";
	try {
		const data = await client.getRelatedContext({
			repo: configRepo || git.repo,
			branch: git.branch,
			source_files: git.sourceFiles.length > 0 ? git.sourceFiles : undefined,
			recent_commits: git.recentCommits || undefined,
			session_id: sessionInfo?.sessionId,
			limit: 15,
		});
		if (data.insights.length > 0) {
			existingInsights = formatContextForPrompt(data.insights);
		}
	} catch {
		// Not critical — proceed without existing insights
	}

	return {
		repo: configRepo || git.repo,
		branch: git.branch,
		transcript,
		diff: git.diff || undefined,
		recentCommits: git.recentCommits || undefined,
		sourceFiles: git.sourceFiles.length > 0 ? git.sourceFiles : undefined,
		existingInsights: existingInsights || undefined,
		commitMessage: git.commitMessage || undefined,
	};
}
