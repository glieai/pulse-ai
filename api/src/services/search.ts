import { sql } from "../db/client";

export async function searchFts(orgId: string, query: string, limit: number, offset: number) {
	const rows = await sql`
		SELECT id, org_id, kind, title, body, structured,
			repo, branch, source_files, commit_hashes, session_refs,
			author_id, author_name, trigger_type, content_hash, status,
			enrichment, supersedes_id, created_at,
			ts_rank_cd(search_vector, plainto_tsquery('english', ${query})) AS rank,
			count(*) OVER()::int AS total_count
		FROM insights
		WHERE org_id = ${orgId}
			AND status = 'published'
			AND search_vector @@ plainto_tsquery('english', ${query})
		ORDER BY rank DESC
		LIMIT ${limit} OFFSET ${offset}
	`;

	const total = rows.length > 0 ? rows[0].total_count : 0;
	return { insights: rows, total };
}

/**
 * RAG-optimized FTS: OR semantics for better recall on natural language queries.
 * Each term is joined with | (OR) so "PostgreSQL database decisions" matches
 * insights containing any of those words. ts_rank_cd ranks by relevance.
 */
export async function searchFtsOr(
	orgId: string,
	query: string,
	limit: number,
	repo?: string,
	kind?: string,
) {
	const rows = await sql`
		SELECT id, org_id, kind, title, body, structured,
			repo, branch, source_files, commit_hashes, session_refs,
			author_id, author_name, trigger_type, content_hash, status,
			enrichment, supersedes_id, created_at,
			ts_rank_cd(search_vector, to_tsquery('english', ${toOrQuery(query)})) AS rank
		FROM insights
		WHERE org_id = ${orgId}
			AND status = 'published'
			AND search_vector @@ to_tsquery('english', ${toOrQuery(query)})
			AND (${repo ?? null}::text IS NULL OR repo = ${repo ?? null})
			AND (${kind ?? null}::text IS NULL OR kind = ${kind ?? null})
		ORDER BY rank DESC
		LIMIT ${limit}
	`;

	return rows;
}

/** Convert natural language to OR-joined tsquery: "PostgreSQL database" → "PostgreSQL | database" */
export function toOrQuery(query: string): string {
	return query
		.replace(/[^\w\s]/g, " ")
		.split(/\s+/)
		.filter((w) => w.length > 1)
		.join(" | ");
}

export async function searchVector(
	orgId: string,
	embedding: number[],
	limit: number,
	repo?: string,
	kind?: string,
) {
	const embeddingStr = `[${embedding.join(",")}]`;

	const insights = await sql`
		SELECT id, org_id, kind, title, body, structured,
			repo, branch, source_files, commit_hashes, session_refs,
			author_id, author_name, trigger_type, content_hash, status,
			enrichment, supersedes_id, created_at,
			1 - (embedding <=> ${embeddingStr}::vector) AS score
		FROM insights
		WHERE org_id = ${orgId}
			AND status = 'published'
			AND embedding IS NOT NULL
			AND (${repo ?? null}::text IS NULL OR repo = ${repo ?? null})
			AND (${kind ?? null}::text IS NULL OR kind = ${kind ?? null})
		ORDER BY embedding <=> ${embeddingStr}::vector
		LIMIT ${limit}
	`;

	return insights;
}

export async function searchHybrid(
	orgId: string,
	query: string,
	embedding: number[],
	limit: number,
	repo?: string,
	kind?: string,
) {
	const embeddingStr = `[${embedding.join(",")}]`;

	// RRF fusion: 0.4 FTS + 0.6 vector (from PLAN.md)
	const insights = await sql`
		WITH keyword_results AS (
			SELECT id,
				ts_rank_cd(search_vector, plainto_tsquery('english', ${query})) AS rank
			FROM insights
			WHERE org_id = ${orgId}
				AND status = 'published'
				AND search_vector @@ plainto_tsquery('english', ${query})
				AND (${repo ?? null}::text IS NULL OR repo = ${repo ?? null})
				AND (${kind ?? null}::text IS NULL OR kind = ${kind ?? null})
			ORDER BY rank DESC LIMIT 50
		),
		vector_results AS (
			SELECT id,
				1 - (embedding <=> ${embeddingStr}::vector) AS rank
			FROM insights
			WHERE org_id = ${orgId}
				AND status = 'published'
				AND embedding IS NOT NULL
				AND (${repo ?? null}::text IS NULL OR repo = ${repo ?? null})
				AND (${kind ?? null}::text IS NULL OR kind = ${kind ?? null})
			ORDER BY embedding <=> ${embeddingStr}::vector LIMIT 50
		),
		fused AS (
			SELECT id, 0.4 / (60 + ROW_NUMBER() OVER (ORDER BY rank DESC)) AS score
			FROM keyword_results
			UNION ALL
			SELECT id, 0.6 / (60 + ROW_NUMBER() OVER (ORDER BY rank DESC)) AS score
			FROM vector_results
		)
		SELECT i.id, i.org_id, i.kind, i.title, i.body, i.structured,
			i.repo, i.branch, i.source_files, i.commit_hashes, i.session_refs,
			i.author_id, i.author_name, i.trigger_type, i.content_hash, i.status,
			i.enrichment, i.supersedes_id, i.created_at,
			f.raw_score *
				CASE WHEN i.enrichment->>'superseded_by_id' IS NOT NULL THEN 0.3
				ELSE 0.7 + 0.3 * EXP(-EXTRACT(EPOCH FROM (NOW() - i.created_at)) / 2592000.0)
				END AS final_score
		FROM (SELECT id, SUM(score) AS raw_score FROM fused GROUP BY id) f
		JOIN insights i ON f.id = i.id
		WHERE i.org_id = ${orgId}
		ORDER BY final_score DESC
		LIMIT ${limit}
	`;

	return insights;
}

export async function searchContext(
	orgId: string,
	query: string,
	strategy: "hybrid" | "vector" | "fts",
	limit: number,
	embedding?: number[],
	repo?: string,
	kind?: string,
) {
	// If hybrid/vector requested but no embedding, fall back to FTS
	const effectiveStrategy =
		(strategy === "hybrid" || strategy === "vector") && !embedding ? "fts" : strategy;

	if (effectiveStrategy === "fts") {
		const { insights } = await searchFts(orgId, query, limit, 0);
		return insights;
	}

	if (effectiveStrategy === "vector" && embedding) {
		return searchVector(orgId, embedding, limit, repo, kind);
	}

	if (effectiveStrategy === "hybrid" && embedding) {
		return searchHybrid(orgId, query, embedding, limit, repo, kind);
	}

	// Fallback
	const { insights } = await searchFts(orgId, query, limit, 0);
	return insights;
}

// ── Context-Aware Generation ────────────────────────────────
// Multi-signal relevance scoring for pre-generation context.
// Finds insights related to the current work context using
// source_files overlap, branch match, and FTS keyword signals.

const COMMIT_PREFIX_RE = /^[a-f0-9]{7,}\s+/;
const CONVENTIONAL_RE =
	/^(feat|fix|refactor|test|docs|chore|style|perf|ci|build|revert)(\(.+?\))?[!:]*\s*/i;
const STOP_WORDS = new Set([
	"the",
	"a",
	"an",
	"and",
	"or",
	"but",
	"in",
	"on",
	"at",
	"to",
	"for",
	"of",
	"with",
	"by",
	"is",
	"it",
	"this",
	"that",
	"was",
	"are",
	"be",
	"has",
	"had",
	"not",
	"from",
	"add",
	"update",
	"remove",
	"use",
	"move",
	"into",
	"also",
	"more",
	"some",
	"new",
	"all",
	"set",
	"get",
	"now",
]);

/**
 * Extract meaningful keywords from git log --oneline output.
 * Strips hashes, conventional commit prefixes, and stop words.
 * Returns OR-joined tsquery format: "dark | mode | toggle"
 */
export function extractKeywords(commitLog: string): string {
	const words = commitLog
		.split("\n")
		.filter(Boolean)
		.map((line) => line.replace(COMMIT_PREFIX_RE, ""))
		.map((line) => line.replace(CONVENTIONAL_RE, ""))
		.join(" ")
		.replace(/[^\w\s]/g, " ")
		.split(/\s+/)
		.filter((w) => w.length > 2 && !STOP_WORDS.has(w.toLowerCase()))
		.map((w) => w.toLowerCase())
		.slice(0, 30);

	// Deduplicate
	return [...new Set(words)].join(" | ");
}

export interface RelatedContextInput {
	repo: string;
	branch?: string;
	sourceFiles?: string[];
	keywords?: string; // pre-processed OR query, e.g. "dark | mode | toggle"
	sessionId?: string; // active session ID — strongest dedup signal
	limit?: number;
}

export interface RelatedContextResult {
	id: string;
	kind: string;
	title: string;
	body_excerpt: string;
	branch: string | null;
	source_files: string[] | null;
	status: string;
	score: number;
}

/**
 * Find insights related to the current work context using multi-signal scoring.
 *
 * This is the intelligence layer of Pulse. Every signal contributes additively
 * to paint the fullest picture of what the LLM already knows about the current
 * work context. The goal isn't just dedup — it's giving the LLM awareness of
 * the existing knowledge landscape so it generates the most valuable insight.
 *
 * Signals (additive weights):
 *   - session match (1.0) — same session = same narrative arc
 *   - source_files overlap (0.8) — same files = same code territory
 *   - branch match (0.5) — same branch = same workstream
 *   - FTS keywords (0.4) — topical relevance from commit messages
 *
 * An insight matching multiple signals accumulates score from all of them.
 * Includes both draft and published insights.
 * Falls back to recent-by-repo if no signals are available.
 */
export async function findRelatedContext(
	orgId: string,
	input: RelatedContextInput,
): Promise<RelatedContextResult[]> {
	const {
		repo,
		branch = null,
		sourceFiles = [],
		keywords = "",
		sessionId = null,
		limit = 10,
	} = input;

	const safeKeywords = keywords || "";

	// No signals at all → fall back to recent by repo
	if (!branch && sourceFiles.length === 0 && !safeKeywords && !sessionId) {
		return fallbackRecentByRepo(orgId, repo, limit);
	}

	const sourceFilesParam = sourceFiles.length > 0 ? sourceFiles : null;
	const sessionFilter = sessionId ? JSON.stringify([{ session_id: sessionId }]) : null;

	const rows = await sql`
		WITH
		session_matches AS (
			SELECT id, 1.0::float AS signal_score
			FROM insights
			WHERE org_id = ${orgId}
				AND repo = ${repo}
				AND ${sessionFilter}::jsonb IS NOT NULL
				AND session_refs @> ${sessionFilter}::jsonb
			LIMIT 20
		),
		file_matches AS (
			SELECT id, 1.0::float AS signal_score
			FROM insights
			WHERE org_id = ${orgId}
				AND repo = ${repo}
				AND ${sourceFilesParam}::text[] IS NOT NULL
				AND source_files IS NOT NULL
				AND source_files && ${sourceFilesParam}
			LIMIT 20
		),
		branch_matches AS (
			SELECT id, 0.7::float AS signal_score
			FROM insights
			WHERE org_id = ${orgId}
				AND repo = ${repo}
				AND ${branch}::text IS NOT NULL
				AND branch = ${branch}
			ORDER BY created_at DESC
			LIMIT 20
		),
		keyword_matches AS (
			SELECT id,
				ts_rank_cd(search_vector, to_tsquery('english', ${safeKeywords})) AS signal_score
			FROM insights
			WHERE org_id = ${orgId}
				AND repo = ${repo}
				AND ${safeKeywords} != ''
				AND search_vector @@ to_tsquery('english', ${safeKeywords})
			ORDER BY signal_score DESC
			LIMIT 20
		),
		scored AS (
			SELECT id, 1.0 * signal_score AS score FROM session_matches
			UNION ALL
			SELECT id, 0.8 * signal_score AS score FROM file_matches
			UNION ALL
			SELECT id, 0.5 * signal_score AS score FROM branch_matches
			UNION ALL
			SELECT id, 0.4 * signal_score AS score FROM keyword_matches
		)
		SELECT i.id, i.kind, i.title,
			LEFT(i.body, 300) AS body_excerpt,
			i.branch, i.source_files, i.status,
			SUM(s.score) * (0.5 + 0.5 * EXP(
				-EXTRACT(EPOCH FROM (NOW() - i.created_at)) / 2592000.0
			)) AS score
		FROM scored s
		JOIN insights i ON s.id = i.id
		WHERE i.org_id = ${orgId}
		GROUP BY i.id, i.kind, i.title, i.body, i.branch, i.source_files,
			i.status, i.created_at
		ORDER BY score DESC
		LIMIT ${limit}
	`;

	return rows as unknown as RelatedContextResult[];
}

/** Fallback: no metadata signals, return recent insights by repo. */
async function fallbackRecentByRepo(
	orgId: string,
	repo: string,
	limit: number,
): Promise<RelatedContextResult[]> {
	const rows = await sql`
		SELECT id, kind, title,
			LEFT(body, 300) AS body_excerpt,
			branch, source_files, status,
			0.0::float AS score
		FROM insights
		WHERE org_id = ${orgId} AND repo = ${repo}
		ORDER BY created_at DESC
		LIMIT ${limit}
	`;
	return rows as unknown as RelatedContextResult[];
}

/**
 * Format related context results into a prompt-ready string.
 * Includes kind, title, body excerpt, and metadata for maximum LLM signal.
 */
export function formatContextForPrompt(insights: RelatedContextResult[]): string {
	if (insights.length === 0) return "";

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

export async function getFileContext(orgId: string, filePath: string, repo: string) {
	const insights = await sql`
		SELECT id, org_id, kind, title, body, structured,
			repo, branch, source_files, commit_hashes, session_refs,
			author_id, author_name, trigger_type, content_hash, status,
			enrichment, supersedes_id, created_at
		FROM insights
		WHERE org_id = ${orgId}
			AND status = 'published'
			AND repo = ${repo}
			AND ${filePath} = ANY(source_files)
		ORDER BY created_at DESC
		LIMIT 50
	`;

	return insights;
}
