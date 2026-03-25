import type { PulseConfig } from "../config";
import { apiPost } from "../http";
import type { InsightContext } from "../llm/types";
import { gatherGitContext } from "./git";
import { getActiveSessionInfo, getSessionTranscript } from "./session";

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
 * Gather all context for insight generation:
 * - Git info (diff, commits, branch, files)
 * - Session transcript (Claude Code conversation)
 * - Related insights (context-aware, multi-signal scoring)
 */
export async function gatherContext(config: PulseConfig): Promise<InsightContext> {
	const cwd = process.cwd();
	const git = gatherGitContext();
	const transcript = getSessionTranscript(cwd);

	// Get active session ID for context scoring
	const sessionInfo = getActiveSessionInfo(cwd);

	// Fetch related insights — all signals combined (session, files, branch, keywords)
	let existingInsights = "";
	try {
		const data = await apiPost<{ insights: RelatedContextResult[] }>(
			config.apiUrl,
			"/context/related",
			{
				repo: config.repo || git.repo,
				branch: git.branch,
				source_files: git.sourceFiles.length > 0 ? git.sourceFiles : undefined,
				recent_commits: git.recentCommits || undefined,
				session_id: sessionInfo?.sessionId,
				limit: 15,
			},
			config.token,
		);
		if (data.insights.length > 0) {
			existingInsights = formatContextForPrompt(data.insights);
		}
	} catch {
		// Not critical — proceed without existing insights
	}

	return {
		repo: config.repo || git.repo,
		branch: git.branch,
		transcript,
		diff: git.diff || undefined,
		recentCommits: git.recentCommits || undefined,
		sourceFiles: git.sourceFiles.length > 0 ? git.sourceFiles : undefined,
		existingInsights: existingInsights || undefined,
	};
}
