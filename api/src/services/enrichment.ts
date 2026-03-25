import type { InsightEnrichment, InsightHints, QualitySignals } from "@pulse/shared";
import type { JSONValue } from "postgres";
import { sql } from "../db/client";
import { ENRICHMENT_SYSTEM_PROMPT, buildEnrichmentPrompt } from "../llm/enrichment-prompt";
import { createLlmProvider } from "../llm/provider";
import type { InsightCreateInput } from "../schemas/insight";
import { getOrgSettings, resolveActiveLlm } from "./org";

// ─── Quality Signals (pure, no DB) ────────────

const SELF_REF_PATTERNS = [
	/\bas mentioned\b/i,
	/\bas discussed\b/i,
	/\bsee above\b/i,
	/\bthe above\b/i,
	/\bcomo mencionado\b/i,
	/\bcomo dito\b/i,
	/\bver acima\b/i,
];

export function computeQualitySignals(input: {
	kind: string;
	body: string;
	structured?: Record<string, unknown>;
	source_files?: string[];
}): QualitySignals {
	const structured = input.structured ?? {};
	const hasAlternatives =
		input.kind === "decision" &&
		Array.isArray(structured.alternatives) &&
		structured.alternatives.length > 0;

	return {
		has_alternatives: hasAlternatives,
		has_source_files: Array.isArray(input.source_files) && input.source_files.length > 0,
		has_structured: Object.keys(structured).length > 0,
		body_length: input.body.length,
		is_self_contained: !SELF_REF_PATTERNS.some((p) => p.test(input.body)),
	};
}

// ─── Related Insights (vector similarity) ──────

export async function findRelatedInsights(
	orgId: string,
	embedding: number[] | undefined,
	excludeId: string,
	limit = 5,
): Promise<string[]> {
	if (!embedding || embedding.length === 0) return [];

	const embeddingStr = `[${embedding.join(",")}]`;
	const rows = await sql`
		SELECT id, 1 - (embedding <=> ${embeddingStr}::vector) AS similarity
		FROM insights
		WHERE org_id = ${orgId}
			AND id != ${excludeId}
			AND embedding IS NOT NULL
			AND status = 'published'
		ORDER BY embedding <=> ${embeddingStr}::vector
		LIMIT ${limit}
	`;

	return rows.filter((r) => (r.similarity as number) > 0.7).map((r) => r.id as string);
}

// ─── Supersession Detection (heuristic) ────────

export async function detectSupersession(
	orgId: string,
	insight: { kind: string; repo: string; title: string },
): Promise<string | null> {
	const words = insight.title
		.replace(/[^\p{L}\p{N}\s]/gu, " ")
		.split(/\s+/)
		.filter((w) => w.length > 2)
		.slice(0, 5)
		.join(" & ");

	if (!words) return null;

	const rows = await sql`
		SELECT id, title
		FROM insights
		WHERE org_id = ${orgId}
			AND kind = ${insight.kind}
			AND repo = ${insight.repo}
			AND status = 'published'
			AND to_tsvector('english', title) @@ to_tsquery('english', ${words})
		ORDER BY created_at DESC
		LIMIT 3
	`;

	if (rows.length === 0) return null;

	for (const row of rows) {
		if (titleSimilarity(insight.title, row.title as string) > 0.6) {
			return row.id as string;
		}
	}

	return null;
}

function titleSimilarity(a: string, b: string): number {
	const normalize = (s: string) =>
		new Set(
			s
				.toLowerCase()
				.split(/\s+/)
				.filter((w) => w.length > 2),
		);
	const wordsA = normalize(a);
	const wordsB = normalize(b);
	if (wordsA.size === 0 || wordsB.size === 0) return 0;
	const intersection = [...wordsA].filter((w) => wordsB.has(w)).length;
	return intersection / Math.max(wordsA.size, wordsB.size);
}

// ─── Hints Builder ─────────────────────────────

export function buildHints(
	enrichment: InsightEnrichment,
	input: { kind: string },
	options?: { enrichment_enabled?: boolean },
): InsightHints {
	const missing: string[] = [];
	const qs = enrichment.quality_signals;

	if (!qs.has_alternatives && input.kind === "decision") {
		missing.push("alternatives");
	}
	if (!qs.has_source_files) {
		missing.push("source_files");
	}
	if (!qs.has_structured) {
		missing.push("structured_data");
	}
	if (!qs.is_self_contained) {
		missing.push("self_contained_body");
	}

	return {
		missing: missing.length > 0 ? missing : undefined,
		supersedes_id: enrichment.supersedes_id,
		related_count: enrichment.related_ids?.length ?? 0,
		enrichment_enabled: options?.enrichment_enabled,
	};
}

// ─── Sync Enrichment (Level 1) ─────────────────

export async function enrichInsightSync(
	orgId: string,
	insightId: string,
	input: InsightCreateInput,
): Promise<InsightEnrichment> {
	const qualitySignals = computeQualitySignals(input);

	const [relatedIds, supersedesId] = await Promise.all([
		findRelatedInsights(orgId, input.embedding, insightId),
		detectSupersession(orgId, {
			kind: input.kind,
			repo: input.repo,
			title: input.title,
		}),
	]);

	const enrichment: InsightEnrichment = {
		quality_signals: qualitySignals,
		related_ids: relatedIds.length > 0 ? relatedIds : undefined,
		supersedes_id: supersedesId ?? undefined,
		enriched_at: new Date().toISOString(),
	};

	// Persist enrichment + supersedes_id atomically
	await sql`
		UPDATE insights
		SET enrichment = ${sql.json(enrichment as unknown as JSONValue)},
			supersedes_id = ${supersedesId}
		WHERE id = ${insightId} AND org_id = ${orgId}
	`;

	// If superseding, mark the old insight as superseded_by
	if (supersedesId) {
		await sql`
			UPDATE insights
			SET enrichment = jsonb_set(
				COALESCE(enrichment, '{}'),
				'{superseded_by_id}',
				${JSON.stringify(insightId)}::jsonb
			)
			WHERE id = ${supersedesId} AND org_id = ${orgId}
		`;
	}

	return enrichment;
}

// ─── Async Enrichment (Level 2 — LLM, opt-in) ──

export async function enrichInsightAsync(
	orgId: string,
	insightId: string,
	insight: {
		title: string;
		body: string;
		kind: string;
		structured: Record<string, unknown>;
	},
	relatedIds: string[],
): Promise<void> {
	try {
		// 1. Check if org has enrichment enabled + LLM available
		const settings = await getOrgSettings(orgId);
		if (!settings.ai_features?.enrichment_enabled) return;

		const resolved = await resolveActiveLlm(orgId);
		if (!resolved) return;

		// 2. Fetch related insights for context
		const relatedInsights =
			relatedIds.length > 0
				? await sql`
					SELECT id, title, body, kind
					FROM insights
					WHERE id = ANY(${relatedIds}) AND org_id = ${orgId}
				`
				: [];

		// 3. Build prompt and call LLM
		const llm = createLlmProvider(resolved.provider, resolved.api_key, resolved.model);
		const userPrompt = buildEnrichmentPrompt(
			insight,
			relatedInsights.map((r) => ({
				id: r.id as string,
				title: r.title as string,
				body: r.body as string,
				kind: r.kind as string,
			})),
		);

		const rawResponse = await llm.generate(ENRICHMENT_SYSTEM_PROMPT, userPrompt);
		const parsed = JSON.parse(rawResponse.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, ""));

		// 4. Merge LLM enrichment into existing enrichment JSONB
		const llmEnrichment = {
			contradiction_analysis: parsed.contradiction_analysis || null,
			suggested_links: Array.isArray(parsed.suggested_links) ? parsed.suggested_links : [],
			quality_score: typeof parsed.quality_score === "number" ? parsed.quality_score : null,
			enriched_at: new Date().toISOString(),
		};

		await sql`
			UPDATE insights
			SET enrichment = jsonb_set(
				COALESCE(enrichment, '{}'),
				'{llm_enrichment}',
				${sql.json(llmEnrichment as unknown as JSONValue)}::jsonb
			)
			WHERE id = ${insightId} AND org_id = ${orgId}
		`;
	} catch (err) {
		// LLM enrichment is best-effort — log and continue
		console.error(`[enrichment] LLM enrichment failed for ${insightId}:`, err);
	}
}
