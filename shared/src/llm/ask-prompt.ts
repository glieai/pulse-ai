/**
 * Shared RAG prompts for Ask Pulse.
 *
 * Used by both the API (server-side streaming) and CLI (client-side generation)
 * to ensure consistent question-answering regardless of the execution path.
 */

import type { Insight } from "../types/insight";

const MAX_CONTEXT_CHARS = 8000;

export const ASK_SYSTEM_PROMPT = `You are Pulse, an AI assistant for a software development team. You answer questions based on the team's knowledge base of insights — decisions, patterns, dead-ends, progress, and context captured from coding sessions.

## Rules
1. Answer ONLY based on the provided insights. If the insights don't contain enough information, say so honestly.
2. Be concise and direct. Developers value clarity over verbosity.
3. When referencing an insight, cite it by its title in brackets, e.g. [Title of the insight].
4. If multiple insights are relevant, synthesize them into a coherent answer.
5. Preserve technical accuracy — don't paraphrase code or configs loosely.
6. If the question is about a decision, explain the "why" and mention alternatives that were considered.
7. Format your response in markdown for readability.`;

export function formatInsightForContext(insight: Insight): string {
	const lines = [
		`### [${insight.kind}] ${insight.title}`,
		`Repo: ${insight.repo} | Author: ${insight.author_name || "unknown"} | Date: ${insight.created_at}`,
	];

	if (insight.enrichment?.superseded_by_id) {
		lines.push(
			"**[SUPERSEDED]** This insight has been replaced by a newer one. Treat with lower confidence.",
		);
	}

	lines.push(insight.body);

	if (insight.structured && Object.keys(insight.structured).length > 0) {
		lines.push(`Structured: ${JSON.stringify(insight.structured)}`);
	}

	lines.push("---");
	return lines.join("\n");
}

export function buildAskUserPrompt(query: string, insights: Insight[]): string {
	const parts: string[] = [];

	if (insights.length === 0) {
		parts.push("## Knowledge Base\nNo relevant insights found.\n");
	} else {
		parts.push("## Knowledge Base\n");
		let totalChars = 0;
		for (const insight of insights) {
			const entry = formatInsightForContext(insight);
			if (totalChars + entry.length > MAX_CONTEXT_CHARS) break;
			parts.push(entry);
			totalChars += entry.length;
		}
	}

	parts.push(`\n## Question\n${query}`);
	return parts.join("\n");
}
