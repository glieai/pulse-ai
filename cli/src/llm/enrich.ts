import type { Insight, LlmEnrichment } from "@pulse/shared";
import { ENRICHMENT_SYSTEM_PROMPT, buildEnrichmentPrompt } from "@pulse/shared";
import { apiGet, apiPatch } from "../http";
import type { LLMProvider } from "./types";

/**
 * Client-side LLM enrichment for an insight.
 *
 * Flow:
 * 1. Fetch related insights (max 5) from API
 * 2. Build enrichment prompt
 * 3. Call LLM via local provider
 * 4. Parse JSON response
 * 5. PATCH result to server
 *
 * Best-effort: returns null on any failure (never throws).
 */
export async function enrichInsightClient(
	provider: LLMProvider,
	insight: {
		id: string;
		kind: string;
		title: string;
		body: string;
		structured: Record<string, unknown>;
	},
	relatedIds: string[],
	config: { apiUrl: string; token?: string },
): Promise<LlmEnrichment | null> {
	try {
		// 1. Fetch related insights (individual try/catch per fetch)
		const relatedInsights: Array<{
			id: string;
			title: string;
			body: string;
			kind: string;
		}> = [];

		for (const id of relatedIds.slice(0, 5)) {
			try {
				const r = await apiGet<Insight>(config.apiUrl, `/insights/${id}`, config.token);
				relatedInsights.push({
					id: r.id,
					title: r.title,
					body: r.body,
					kind: r.kind,
				});
			} catch {
				// May have been deleted — skip
			}
		}

		// 2. Build prompt
		const userPrompt = buildEnrichmentPrompt(
			{
				title: insight.title,
				body: insight.body,
				kind: insight.kind,
				structured: insight.structured,
			},
			relatedInsights,
		);

		// 3. Call LLM
		const raw = await provider.generate(ENRICHMENT_SYSTEM_PROMPT, userPrompt);

		// 4. Parse JSON (strip markdown fences if present)
		const cleaned = raw
			.replace(/^```(?:json)?\s*/m, "")
			.replace(/\s*```$/m, "")
			.trim();
		const parsed = JSON.parse(cleaned) as {
			contradiction_analysis?: string | null;
			suggested_links?: string[];
			quality_score?: number | null;
		};

		const llmEnrichment: LlmEnrichment = {
			contradiction_analysis: parsed.contradiction_analysis ?? undefined,
			suggested_links: parsed.suggested_links ?? [],
			quality_score: parsed.quality_score ?? undefined,
			enriched_at: new Date().toISOString(),
		};

		// 5. PATCH to server
		await apiPatch(
			config.apiUrl,
			`/insights/${insight.id}/enrichment`,
			{
				llm_enrichment: {
					contradiction_analysis: llmEnrichment.contradiction_analysis ?? null,
					suggested_links: llmEnrichment.suggested_links ?? [],
					quality_score: llmEnrichment.quality_score ?? null,
					enriched_at: llmEnrichment.enriched_at,
				},
			},
			config.token,
		);

		return llmEnrichment;
	} catch {
		// Best-effort — silently return null
		return null;
	}
}
