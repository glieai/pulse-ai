import { INSIGHT_SYSTEM_PROMPT } from "@pulse/shared";
import type { InsightContext } from "./types";

/** Re-export for backward compatibility within CLI */
export const SYSTEM_PROMPT = INSIGHT_SYSTEM_PROMPT;

export function buildUserPrompt(context: InsightContext): string {
	const parts: string[] = [];

	parts.push(`## Repository: ${context.repo} (branch: ${context.branch})`);

	if (context.existingInsights) {
		const hasHeader = context.existingInsights.startsWith("## ");
		parts.push(
			hasHeader
				? context.existingInsights
				: `## Existing Insights (DO NOT REPEAT)\n${context.existingInsights}`,
		);
	}

	if (context.transcript) {
		parts.push(`## Conversation Transcript (most recent)\n${context.transcript}`);
	}

	if (context.commitMessage) {
		parts.push(`## Commit Message\n${context.commitMessage}`);
	}

	if (context.diff) {
		parts.push(`## Git Diff\n${context.diff}`);
	}

	if (context.recentCommits) {
		parts.push(`## Recent Commits\n${context.recentCommits}`);
	}

	if (context.sourceFiles?.length) {
		parts.push(`## Source Files\n${context.sourceFiles.join("\n")}`);
	}

	parts.push("\n## Task\nAnalyze the above and produce ONE valuable insight as JSON.");

	return parts.join("\n\n");
}
