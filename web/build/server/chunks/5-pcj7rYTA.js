import { t as __exportAll } from "./chunk-BdHzlgOL.js";
import { r as apiGet } from "./api-D4JXw0uZ.js";

//#region .svelte-kit/adapter-bun/entries/pages/insights/_page.server.ts.js
var _page_server_ts_exports = /* @__PURE__ */ __exportAll({ load: () => load });
const load = async ({ url, locals, fetch }) => {
	const limit = Number(url.searchParams.get("limit")) || 20;
	const kind = url.searchParams.get("kind") || "";
	const repo = url.searchParams.get("repo") || "";
	if (!locals.token) return {
		insights: [],
		total: 0,
		nextCursor: null,
		hasMore: false,
		repos: [],
		llmConfigured: false
	};
	const params = new URLSearchParams({ limit: String(limit) });
	params.set("status", "published");
	if (kind) params.set("kind", kind);
	if (repo) params.set("repo", repo);
	try {
		const data = await apiGet(fetch, `/api/insights?${params}`, locals.token);
		const repos = [...new Set(data.insights.map((i) => i.repo))].sort();
		let llmConfigured = false;
		try {
			const result = await apiGet(fetch, "/api/org/settings", locals.token);
			llmConfigured = !!result.settings?.llm || !!result.settings?.cli_provider;
		} catch {}
		return {
			insights: data.insights,
			total: data.total,
			nextCursor: data.next_cursor,
			hasMore: data.has_more,
			repos,
			llmConfigured
		};
	} catch (err) {
		console.error("Failed to load insights:", err);
		return {
			insights: [],
			total: 0,
			nextCursor: null,
			hasMore: false,
			repos: [],
			llmConfigured: false
		};
	}
};

//#endregion
//#region .svelte-kit/adapter-bun/nodes/5.js
const index = 5;
let component_cache;
const component = async () => component_cache ??= (await import("./_page.svelte-C-TdBp0f.js")).default;
const server_id = "src/routes/insights/+page.server.ts";
const imports = [
	"_app/immutable/nodes/5.BtfjTiJU.js",
	"_app/immutable/chunks/DsnmJJEf.js",
	"_app/immutable/chunks/Bws4SZbu.js",
	"_app/immutable/chunks/DWM5xL3m.js",
	"_app/immutable/chunks/CVudaATA.js",
	"_app/immutable/chunks/Bf2mrWYS.js",
	"_app/immutable/chunks/BtpFzMAW.js",
	"_app/immutable/chunks/B0jxRZm2.js",
	"_app/immutable/chunks/BLejWXTo.js",
	"_app/immutable/chunks/DJoCdHo2.js",
	"_app/immutable/chunks/DDzH388f.js",
	"_app/immutable/chunks/IwRER8k3.js",
	"_app/immutable/chunks/BB5gz5Xj.js",
	"_app/immutable/chunks/BGDGJX9A.js",
	"_app/immutable/chunks/Cf-irfjs.js",
	"_app/immutable/chunks/D1cnPWIj.js",
	"_app/immutable/chunks/7JDUULsq.js",
	"_app/immutable/chunks/k6vOMknB.js",
	"_app/immutable/chunks/zdPxcW3D.js",
	"_app/immutable/chunks/XxGNfMeX.js",
	"_app/immutable/chunks/DGIUsLMl.js",
	"_app/immutable/chunks/Bt7e3dqN.js",
	"_app/immutable/chunks/DGKeAb96.js",
	"_app/immutable/chunks/DxJGxwKx.js"
];
const stylesheets = [];
const fonts = [];

//#endregion
export { component, fonts, imports, index, _page_server_ts_exports as server, server_id, stylesheets };
//# sourceMappingURL=5-pcj7rYTA.js.map