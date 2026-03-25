import { Hono } from "hono";
import { auth } from "../middleware/auth";
import { relatedContextSchema } from "../schemas/related-context";
import { contextGetSchema, contextPostSchema, fileContextSchema } from "../schemas/search";
import {
	extractKeywords,
	findRelatedContext,
	getFileContext,
	searchContext,
} from "../services/search";
import type { AppEnv } from "../types/app";

const context = new Hono<AppEnv>();

context.use("/*", auth);

// GET — FTS-only context (no embedding in query string)
context.get("/context", async (c) => {
	const params = contextGetSchema.parse(c.req.query());
	const { org_id } = c.get("auth");

	const insights = await searchContext(
		org_id,
		params.query,
		params.strategy,
		params.limit,
		undefined,
		params.repo,
		params.kind,
	);

	return c.json({ insights });
});

// POST — hybrid context (embedding in body)
context.post("/context", async (c) => {
	const body = await c.req.json();
	const params = contextPostSchema.parse(body);
	const { org_id } = c.get("auth");

	const insights = await searchContext(
		org_id,
		params.query,
		params.strategy,
		params.limit,
		params.embedding,
		params.repo,
		params.kind,
	);

	return c.json({ insights });
});

// GET — insights for a specific file
context.get("/context/file/*", async (c) => {
	const filePath = c.req.path.replace("/api/context/file/", "");

	if (!filePath || filePath.includes("..") || filePath.startsWith("/")) {
		return c.json({ error: "Invalid file path" }, 400);
	}

	const query = fileContextSchema.parse(c.req.query());
	const { org_id } = c.get("auth");

	const insights = await getFileContext(org_id, filePath, query.repo);
	return c.json({ insights });
});

// POST — related context for generation (multi-signal relevance scoring)
context.post("/context/related", async (c) => {
	const body = await c.req.json();
	const params = relatedContextSchema.parse(body);
	const { org_id } = c.get("auth");

	const keywords = params.recent_commits ? extractKeywords(params.recent_commits) : "";

	const insights = await findRelatedContext(org_id, {
		repo: params.repo,
		branch: params.branch,
		sourceFiles: params.source_files,
		sessionId: params.session_id,
		keywords,
		limit: params.limit,
	});

	return c.json({ insights });
});

export { context };
