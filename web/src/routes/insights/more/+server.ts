import { apiGet } from "$lib/api";
import type { Insight } from "@pulse/shared";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

interface InsightListResponse {
	insights: Insight[];
	total: number;
	next_cursor: string | null;
	has_more: boolean;
}

export const GET: RequestHandler = async ({ url, locals, fetch: svelteFetch }) => {
	if (!locals.token) {
		return json({ insights: [], next_cursor: null, has_more: false }, { status: 401 });
	}

	const cursor = url.searchParams.get("cursor") || "";
	const limit = url.searchParams.get("limit") || "20";
	const kind = url.searchParams.get("kind") || "";
	const repo = url.searchParams.get("repo") || "";

	if (!cursor) {
		return json({ insights: [], next_cursor: null, has_more: false });
	}

	const params = new URLSearchParams({ cursor, limit, status: "published" });
	if (kind) params.set("kind", kind);
	if (repo) params.set("repo", repo);

	const data = await apiGet<InsightListResponse>(
		svelteFetch,
		`/api/insights?${params}`,
		locals.token,
	);

	return json({
		insights: data.insights,
		next_cursor: data.next_cursor,
		has_more: data.has_more,
	});
};
