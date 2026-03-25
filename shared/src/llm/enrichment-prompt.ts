/**
 * Shared enrichment prompts for LLM-based insight analysis.
 *
 * Used by both the API (server-side enrichment) and CLI (client-side enrichment)
 * to ensure consistent enrichment regardless of the execution path.
 */

export const ENRICHMENT_SYSTEM_PROMPT = `You analyze knowledge base insights for a software development team. You detect contradictions with existing insights, suggest useful links, and assess quality.

Respond ONLY with a JSON object (no markdown, no backticks):
{
  "contradiction_analysis": "description of contradictions with existing insights, or null if none",
  "suggested_links": ["insight_id1", "insight_id2"],
  "quality_score": 7
}

Rules:
- contradiction_analysis: null if no contradictions found, otherwise explain clearly
- suggested_links: IDs of existing insights that should be explicitly linked (beyond similarity)
- quality_score: 1-10 based on completeness, clarity, and actionability`;

export function buildEnrichmentPrompt(
	insight: {
		title: string;
		body: string;
		kind: string;
		structured: Record<string, unknown>;
	},
	relatedInsights: Array<{
		id: string;
		title: string;
		body: string;
		kind: string;
	}>,
): string {
	const parts: string[] = [];

	parts.push(`## New Insight\n**[${insight.kind}]** ${insight.title}\n\n${insight.body}`);

	if (Object.keys(insight.structured).length > 0) {
		parts.push(`\nStructured: ${JSON.stringify(insight.structured)}`);
	}

	if (relatedInsights.length > 0) {
		parts.push("\n## Related Existing Insights");
		for (const r of relatedInsights) {
			parts.push(`\n### ID: ${r.id}\n**[${r.kind}]** ${r.title}\n${r.body.slice(0, 500)}`);
		}
	}

	parts.push(
		"\n## Task\nAnalyze the new insight against the existing ones. Detect contradictions, suggest links, and rate quality (1-10).",
	);
	return parts.join("\n");
}
