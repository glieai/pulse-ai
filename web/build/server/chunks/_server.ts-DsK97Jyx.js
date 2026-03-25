import { i as redirect } from "./exports-DwueHvwd.js";

//#region .svelte-kit/adapter-bun/entries/endpoints/insights/export/_server.ts.js
const API_BASE = process.env.API_BASE_URL || `http://localhost:${process.env.API_PORT || "3000"}`;
const GET = async ({ locals }) => {
	if (!locals.token) redirect(302, "/login");
	const res = await fetch(`${API_BASE}/api/insights/export`, { headers: { Authorization: `Bearer ${locals.token}` } });
	if (!res.ok) return new Response(JSON.stringify({ error: "Export failed" }), { status: res.status });
	return new Response(res.body, { headers: {
		"Content-Type": "application/json",
		"Content-Disposition": res.headers.get("Content-Disposition") ?? "attachment; filename=\"insights.json\""
	} });
};

//#endregion
export { GET };
//# sourceMappingURL=_server.ts-DsK97Jyx.js.map