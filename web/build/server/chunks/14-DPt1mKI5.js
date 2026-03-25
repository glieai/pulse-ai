import { t as __exportAll } from "./chunk-BdHzlgOL.js";
import { r as apiGet } from "./api-D4JXw0uZ.js";

//#region .svelte-kit/adapter-bun/entries/pages/search/_page.server.ts.js
var _page_server_ts_exports = /* @__PURE__ */ __exportAll({ load: () => load });
const load = async ({ url, locals, fetch }) => {
	const q = url.searchParams.get("q") || "";
	const limit = Number(url.searchParams.get("limit")) || 20;
	const offset = Number(url.searchParams.get("offset")) || 0;
	if (!q.trim() || !locals.token) return {
		q,
		insights: [],
		total: 0,
		limit,
		offset
	};
	try {
		const data = await apiGet(fetch, `/api/search?q=${encodeURIComponent(q)}&limit=${limit}&offset=${offset}`, locals.token);
		return {
			q,
			insights: data.insights,
			total: data.total,
			limit,
			offset
		};
	} catch (err) {
		console.error("Search failed:", err);
		return {
			q,
			insights: [],
			total: 0,
			limit,
			offset
		};
	}
};

//#endregion
//#region .svelte-kit/adapter-bun/nodes/14.js
const index = 14;
let component_cache;
const component = async () => component_cache ??= (await import("./_page.svelte-BQ4zzVtQ.js")).default;
const server_id = "src/routes/search/+page.server.ts";
const imports = [
	"_app/immutable/nodes/14.JEOAnqm8.js",
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
	"_app/immutable/chunks/BGDGJX9A.js",
	"_app/immutable/chunks/Cf-irfjs.js",
	"_app/immutable/chunks/Bt7e3dqN.js",
	"_app/immutable/chunks/DGIUsLMl.js",
	"_app/immutable/chunks/7JDUULsq.js",
	"_app/immutable/chunks/BB5gz5Xj.js",
	"_app/immutable/chunks/zuCDeH7k.js"
];
const stylesheets = [];
const fonts = [];

//#endregion
export { component, fonts, imports, index, _page_server_ts_exports as server, server_id, stylesheets };
//# sourceMappingURL=14-DPt1mKI5.js.map