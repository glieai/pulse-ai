import { Hono } from "hono";
import { auth } from "../middleware/auth";
import { searchSchema } from "../schemas/search";
import { searchFts } from "../services/search";
import type { AppEnv } from "../types/app";

const search = new Hono<AppEnv>();

search.use("/*", auth);

search.get("/search", async (c) => {
	const params = searchSchema.parse(c.req.query());
	const { org_id } = c.get("auth");

	const { insights, total } = await searchFts(org_id, params.q, params.limit, params.offset);
	return c.json({
		insights,
		total,
		limit: params.limit,
		offset: params.offset,
	});
});

export { search };
