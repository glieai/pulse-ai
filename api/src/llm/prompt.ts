/**
 * Prompt builder for server-side insight generation (remote generate path).
 *
 * Unlike the CLI which has local context (session transcript, git diff),
 * the API receives raw data from external sources (WhatsApp, email, PM tools).
 * The system prompt is shared; only the user prompt differs.
 */

import type { InsightKind } from "@pulse/shared/types/insight";
// Re-export shared prompt for runtime use (workspace type-only imports don't resolve at runtime)
export { INSIGHT_SYSTEM_PROMPT } from "../../../shared/src/llm/prompt";
import type { GeneratedInsight } from "./provider";

interface GeneratePromptOpts {
	repo: string;
	branch?: string;
	sourceType: string;
	sourceName?: string;
	rawData: string;
	existingInsights?: string;
}

export function buildGeneratePrompt(opts: GeneratePromptOpts): string {
	const parts: string[] = [];

	parts.push(`## Repository: ${opts.repo}${opts.branch ? ` (branch: ${opts.branch})` : ""}`);

	const sourceLabel = opts.sourceName ? `${opts.sourceType} — ${opts.sourceName}` : opts.sourceType;
	parts.push(`## Source: ${sourceLabel}`);

	if (opts.existingInsights) {
		// existingInsights may already be pre-formatted with headers (from formatContextForPrompt)
		// or a simple list (legacy). Pass through as-is.
		const hasHeader = opts.existingInsights.startsWith("## ");
		parts.push(
			hasHeader
				? opts.existingInsights
				: `## Existing Insights (DO NOT REPEAT)\n${opts.existingInsights}`,
		);
	}

	parts.push(`## Raw Content\n${opts.rawData}`);

	parts.push(
		"\n## Task\nAnalyze the above content and extract ONE valuable insight as JSON.\n" +
			"Focus on decisions, learnings, dead-ends, and patterns that would be useful for the team.",
	);

	return parts.join("\n\n");
}

const VALID_KINDS = new Set<string>([
	"decision",
	"dead_end",
	"pattern",
	"context",
	"progress",
	"business",
]);

export function parseInsightResponse(text: string): GeneratedInsight {
	let json = text.trim();

	// Strip markdown code blocks if present
	if (json.startsWith("```")) {
		json = json.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
	}

	// If the response doesn't start with '{', try to extract JSON from prose
	if (!json.startsWith("{")) {
		const match = json.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
		if (match) {
			json = match[1];
		} else {
			// Last resort: find the first { ... } block
			const start = json.indexOf("{");
			const end = json.lastIndexOf("}");
			if (start !== -1 && end > start) {
				json = json.slice(start, end + 1);
			}
		}
	}

	const parsed = JSON.parse(json);

	if (!parsed.kind || !parsed.title || !parsed.body) {
		throw new Error("LLM response missing required fields (kind, title, body)");
	}

	if (!VALID_KINDS.has(parsed.kind)) {
		// Normalize common LLM variants (e.g. "dead-end" → "dead_end", "learning" → "pattern")
		const KIND_MAP: Record<string, string> = {
			"dead-end": "dead_end",
			deadend: "dead_end",
			learning: "pattern",
			lesson: "pattern",
			architecture: "decision",
			insight: "context",
			milestone: "progress",
			requirement: "business",
			constraint: "business",
		};
		const normalized = KIND_MAP[parsed.kind.toLowerCase()];
		if (normalized) {
			parsed.kind = normalized;
		} else {
			parsed.kind = "context"; // safe fallback
		}
	}

	return {
		kind: parsed.kind as InsightKind,
		title: parsed.title,
		body: parsed.body,
		structured: parsed.structured ?? {},
		sourceFiles: parsed.sourceFiles,
	};
}
