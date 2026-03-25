import { r as json } from "./exports-DwueHvwd.js";
import { r as apiGet } from "./api-D4JXw0uZ.js";

//#region .svelte-kit/adapter-bun/entries/endpoints/insights/more/_server.ts.js
const GET = async ({ url, locals, fetch: svelteFetch }) => {
	if (!locals.token) return json({
		insights: [],
		next_cursor: null,
		has_more: false
	}, { status: 401 });
	const cursor = url.searchParams.get("cursor") || "";
	const limit = url.searchParams.get("limit") || "20";
	const kind = url.searchParams.get("kind") || "";
	const repo = url.searchParams.get("repo") || "";
	if (!cursor) return json({
		insights: [],
		next_cursor: null,
		has_more: false
	});
	const params = new URLSearchParams({
		cursor,
		limit,
		status: "published"
	});
	if (kind) params.set("kind", kind);
	if (repo) params.set("repo", repo);
	const data = await apiGet(svelteFetch, `/api/insights?${params}`, locals.token);
	return json({
		insights: data.insights,
		next_cursor: data.next_cursor,
		has_more: data.has_more
	});
};

//#endregion
export { GET };
//# sourceMappingURL=_server.ts-md57myN4.js.map