import { Hono } from "hono";
import { sql } from "../db/client";
import { auth } from "../middleware/auth";
import { checkLimit } from "../middleware/plan-limits";
import { clientEnrichmentSchema } from "../schemas/enrichment";
import { generateSchema } from "../schemas/generate";
import {
	insightCreateSchema,
	insightListSchema,
	insightNeighborSchema,
	publishSchema,
} from "../schemas/insight";
import { generateInsight } from "../services/generate";
import {
	createInsight,
	deleteInsight,
	getInsight,
	getInsightNeighbors,
	listInsights,
	publishInsights,
	updateInsightEnrichment,
} from "../services/insight";
import type { AppEnv } from "../types/app";

const insights = new Hono<AppEnv>();

insights.use("/*", auth);

// ── Named routes MUST be registered before /insights/:id to avoid route conflict ──

insights.post("/insights/publish", async (c) => {
	const body = await c.req.json();
	const { repo } = publishSchema.parse(body);
	const { user_id, org_id } = c.get("auth");

	const published = await publishInsights(org_id, user_id, repo);
	return c.json({ published, count: published.length });
});

insights.post("/insights/generate", async (c) => {
	const body = await c.req.json();
	const input = generateSchema.parse(body);
	const { user_id, org_id, author_name } = c.get("auth");

	const { insight, created } = await generateInsight(org_id, user_id, author_name, input);
	return c.json(insight, created ? 201 : 200);
});

// ─── Analytics ──────────────────────────────────────────────────────────────
// Aggregated stats for the analytics dashboard.

insights.get("/insights/analytics", async (c) => {
	const { org_id } = c.get("auth");

	// Insights per week (last 12 weeks)
	const insightsPerWeek = await sql`
		SELECT date_trunc('week', created_at)::date AS week,
		       COUNT(*)::int AS count
		FROM insights
		WHERE org_id = ${org_id}
		  AND created_at >= now() - interval '12 weeks'
		GROUP BY 1
		ORDER BY 1
	`;

	// Distribution by kind
	const kindDistribution = await sql`
		SELECT kind, COUNT(*)::int AS count
		FROM insights
		WHERE org_id = ${org_id} AND status = 'published'
		GROUP BY kind
		ORDER BY count DESC
	`;

	// Top repos by insight count
	const topRepos = await sql`
		SELECT repo, COUNT(*)::int AS count
		FROM insights
		WHERE org_id = ${org_id} AND status = 'published' AND repo IS NOT NULL
		GROUP BY repo
		ORDER BY count DESC
		LIMIT 10
	`;

	// Active contributors (top authors)
	const topContributors = await sql`
		SELECT author_name, COUNT(*)::int AS count
		FROM insights
		WHERE org_id = ${org_id} AND status = 'published' AND author_name IS NOT NULL
		GROUP BY author_name
		ORDER BY count DESC
		LIMIT 10
	`;

	// Total counts
	const [totals] = await sql`
		SELECT
			COUNT(*)::int AS total,
			COUNT(*) FILTER (WHERE status = 'published')::int AS published,
			COUNT(*) FILTER (WHERE status = 'draft')::int AS drafts
		FROM insights
		WHERE org_id = ${org_id}
	`;

	return c.json({
		insights_per_week: insightsPerWeek,
		kind_distribution: kindDistribution,
		top_repos: topRepos,
		top_contributors: topContributors,
		totals,
	});
});

// ─── Export (admin only) ─────────────────────────────────────────────────────
// Returns all published insights for the org as a JSON array (streamed).

insights.get("/insights/export", async (c) => {
	const { org_id, role } = c.get("auth");

	if (role !== "owner" && role !== "admin") {
		return c.json({ error: "Only owners and admins can export insights" }, 403);
	}

	const rows = await sql`
		SELECT id, kind, title, body, repo, branch, source_files, structured,
		       trigger_type, status, author_name, created_at
		FROM insights
		WHERE org_id = ${org_id} AND status = 'published'
		ORDER BY created_at DESC
	`;

	const filename = `pulse-insights-${new Date().toISOString().slice(0, 10)}.json`;
	const body = JSON.stringify(rows, null, 2);

	return c.body(body, 200, {
		"Content-Type": "application/json",
		"Content-Disposition": `attachment; filename="${filename}"`,
	});
});

// ── CRUD routes (parametric :id routes MUST come after named routes) ────────

insights.post("/insights", checkLimit("max_insights_total"), checkLimit("max_repos"), async (c) => {
	const body = await c.req.json();
	const input = insightCreateSchema.parse(body);
	const { user_id, org_id, author_name } = c.get("auth");

	const result = await createInsight(org_id, user_id, author_name, input);
	if (result.created) {
		return c.json({ ...result.insight, hints: result.hints }, 201);
	}
	return c.json(result.insight, 200);
});

insights.get("/insights", async (c) => {
	const params = insightListSchema.parse(c.req.query());
	const { org_id, user_id } = c.get("auth");

	// Drafts are private — each user only sees their own
	if (params.status === "draft") {
		params.author_id = user_id;
	}

	const { insights: rows, total, nextCursor, hasMore } = await listInsights(org_id, params);
	return c.json({
		insights: rows,
		total,
		limit: params.limit,
		offset: params.offset,
		next_cursor: nextCursor,
		has_more: hasMore,
	});
});

insights.get("/insights/:id", async (c) => {
	const id = c.req.param("id");
	const { org_id } = c.get("auth");

	const insight = await getInsight(org_id, id);
	if (!insight) {
		return c.json({ error: "Insight not found" }, 404);
	}

	const wantsNav = c.req.query("nav") === "1";

	if (wantsNav && insight.created_at) {
		const filters = insightNeighborSchema.parse(c.req.query());
		const nav = await getInsightNeighbors(org_id, id, insight.created_at as string, filters);
		return c.json({ ...insight, nav });
	}

	return c.json({ ...insight, nav: null });
});

insights.patch("/insights/:id/enrichment", async (c) => {
	const id = c.req.param("id");
	const body = await c.req.json();
	const input = clientEnrichmentSchema.parse(body);
	const { user_id, org_id } = c.get("auth");

	const updated = await updateInsightEnrichment(org_id, id, user_id, input.llm_enrichment);

	if (!updated) {
		return c.json({ error: "Not found or not authorized" }, 404);
	}
	return c.json({ ok: true });
});

insights.delete("/insights/:id", async (c) => {
	const id = c.req.param("id");
	const { user_id, org_id } = c.get("auth");

	const deleted = await deleteInsight(org_id, id, user_id);
	if (!deleted) {
		return c.json({ error: "Draft not found or not deletable" }, 404);
	}
	return c.body(null, 204);
});

export { insights };
