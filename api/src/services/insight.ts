import type { JSONValue } from "postgres";
import { sql } from "../db/client";
import type { InsightCreateInput, InsightListInput } from "../schemas/insight";
import { buildHints, enrichInsightAsync, enrichInsightSync } from "./enrichment";
import { getOrgSettings } from "./org";

export function computeContentHash(
	orgId: string,
	repo: string,
	kind: string,
	title: string,
	body: string,
): string {
	return new Bun.CryptoHasher("sha256")
		.update(`${orgId}:${repo}:${kind}:${title}:${body}`)
		.digest("hex");
}

export async function createInsight(
	orgId: string,
	authorId: string,
	authorName: string,
	input: InsightCreateInput,
) {
	const contentHash = computeContentHash(orgId, input.repo, input.kind, input.title, input.body);

	const [inserted] = await sql`
		INSERT INTO insights (
			org_id, kind, title, body, structured, embedding,
			repo, branch, source_files, commit_hashes, session_refs,
			author_id, author_name, trigger_type, status, content_hash
		) VALUES (
			${orgId}, ${input.kind}, ${input.title}, ${input.body},
			${sql.json((input.structured ?? {}) as JSONValue)},
			${input.embedding ? JSON.stringify(input.embedding) : null}::vector,
			${input.repo}, ${input.branch ?? null},
			${input.source_files ?? null},
			${input.commit_hashes ?? null},
			${sql.json((input.session_refs ?? []) as JSONValue)},
			${authorId}, ${authorName}, ${input.trigger_type},
			${input.status ?? "draft"}, ${contentHash}
		)
		ON CONFLICT (org_id, content_hash) DO NOTHING
		RETURNING *
	`;

	if (inserted) {
		// Run Level 1 enrichment synchronously (deterministic, fast)
		const enrichment = await enrichInsightSync(orgId, inserted.id as string, input);
		const settings = await getOrgSettings(orgId);
		const enrichmentEnabled = settings.ai_features?.enrichment_enabled ?? false;
		const hints = buildHints(enrichment, input, { enrichment_enabled: enrichmentEnabled });

		// Fire-and-forget: Level 2 LLM enrichment (if org has LLM + opted in)
		enrichInsightAsync(
			orgId,
			inserted.id as string,
			{
				title: input.title,
				body: input.body,
				kind: input.kind,
				structured: input.structured ?? {},
			},
			enrichment.related_ids ?? [],
		);

		return {
			insight: { ...inserted, enrichment },
			created: true as const,
			hints,
		};
	}

	// Already exists — fetch existing
	const [existing] = await sql`
		SELECT * FROM insights WHERE org_id = ${orgId} AND content_hash = ${contentHash}
	`;

	return { insight: existing, created: false as const, hints: undefined };
}

export async function listInsights(orgId: string, params: InsightListInput) {
	const { limit, offset, cursor, kind, repo, branch, author_id, status, session_id } = params;

	// JSONB containment: session_refs @> '[{"session_id": "abc"}]'
	const sessionFilter = session_id ? JSON.stringify([{ session_id }]) : null;

	const rows = cursor
		? await sql`
			SELECT id, org_id, kind, title, body, structured,
				repo, branch, source_files, commit_hashes, session_refs,
				author_id, author_name, trigger_type, content_hash, status,
				enrichment, supersedes_id, created_at,
				count(*) OVER()::int AS total_count
			FROM insights
			WHERE org_id = ${orgId}
				AND created_at < ${cursor}::timestamptz
				AND (${kind ?? null}::text IS NULL OR kind = ${kind ?? null})
				AND (${repo ?? null}::text IS NULL OR repo = ${repo ?? null})
				AND (${branch ?? null}::text IS NULL OR branch = ${branch ?? null})
				AND (${author_id ?? null}::text IS NULL OR author_id::text = ${author_id ?? null})
				AND (${status ?? null}::text IS NULL OR status = ${status ?? null})
				AND (${sessionFilter}::jsonb IS NULL OR session_refs @> ${sessionFilter}::jsonb)
			ORDER BY created_at DESC
			LIMIT ${limit}
		`
		: await sql`
			SELECT id, org_id, kind, title, body, structured,
				repo, branch, source_files, commit_hashes, session_refs,
				author_id, author_name, trigger_type, content_hash, status,
				enrichment, supersedes_id, created_at,
				count(*) OVER()::int AS total_count
			FROM insights
			WHERE org_id = ${orgId}
				AND (${kind ?? null}::text IS NULL OR kind = ${kind ?? null})
				AND (${repo ?? null}::text IS NULL OR repo = ${repo ?? null})
				AND (${branch ?? null}::text IS NULL OR branch = ${branch ?? null})
				AND (${author_id ?? null}::text IS NULL OR author_id::text = ${author_id ?? null})
				AND (${status ?? null}::text IS NULL OR status = ${status ?? null})
				AND (${sessionFilter}::jsonb IS NULL OR session_refs @> ${sessionFilter}::jsonb)
			ORDER BY created_at DESC
			LIMIT ${limit} OFFSET ${offset}
		`;

	const total = rows.length > 0 ? rows[0].total_count : 0;
	const lastRow = rows.length > 0 ? rows[rows.length - 1] : null;
	const nextCursor = lastRow ? (lastRow.created_at as string) : null;
	const hasMore = cursor ? rows.length === limit : offset + rows.length < total;

	return { insights: rows, total, nextCursor, hasMore };
}

export async function getInsight(orgId: string, id: string) {
	const [insight] = await sql`
		SELECT * FROM insights WHERE org_id = ${orgId} AND id = ${id}
	`;
	return insight ?? null;
}

export async function getInsightNeighbors(
	orgId: string,
	insightId: string,
	createdAt: string,
	filters: { kind?: string; repo?: string },
) {
	const kind = filters.kind ?? null;
	const repo = filters.repo ?? null;

	const [[prev], [next]] = await Promise.all([
		sql`
			SELECT id FROM insights
			WHERE org_id = ${orgId}
				AND id != ${insightId}
				AND created_at >= ${createdAt}::timestamptz
				AND (${kind}::text IS NULL OR kind = ${kind})
				AND (${repo}::text IS NULL OR repo = ${repo})
			ORDER BY created_at ASC, id ASC LIMIT 1
		`,
		sql`
			SELECT id FROM insights
			WHERE org_id = ${orgId}
				AND id != ${insightId}
				AND created_at <= ${createdAt}::timestamptz
				AND (${kind}::text IS NULL OR kind = ${kind})
				AND (${repo}::text IS NULL OR repo = ${repo})
			ORDER BY created_at DESC, id DESC LIMIT 1
		`,
	]);

	return {
		prev_id: (prev?.id as string) ?? null,
		next_id: (next?.id as string) ?? null,
	};
}

export async function updateInsightEnrichment(
	orgId: string,
	insightId: string,
	authorId: string,
	llmEnrichment: {
		contradiction_analysis: string | null;
		suggested_links: string[];
		quality_score: number | null;
		enriched_at: string;
	},
) {
	const [updated] = await sql`
		UPDATE insights
		SET enrichment = jsonb_set(
			COALESCE(enrichment, '{}'),
			'{llm_enrichment}',
			${JSON.stringify(llmEnrichment)}::jsonb
		)
		WHERE org_id = ${orgId}
			AND id = ${insightId}
			AND author_id = ${authorId}
		RETURNING id
	`;
	return updated ?? null;
}

export async function publishInsights(orgId: string, authorId: string, repo?: string) {
	const published = await sql`
		UPDATE insights
		SET status = 'published'
		WHERE org_id = ${orgId}
			AND author_id = ${authorId}
			AND (${repo ?? null}::text IS NULL OR repo = ${repo ?? null})
			AND status = 'draft'
		RETURNING *
	`;

	return published;
}

export async function deleteInsight(orgId: string, insightId: string, authorId: string) {
	const [deleted] = await sql`
		DELETE FROM insights
		WHERE org_id = ${orgId}
			AND id = ${insightId}
			AND author_id = ${authorId}
			AND status = 'draft'
		RETURNING id
	`;

	return deleted ?? null;
}
