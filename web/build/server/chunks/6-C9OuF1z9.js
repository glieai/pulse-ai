import { t as __exportAll } from "./chunk-BdHzlgOL.js";
import { t as error } from "./exports-DwueHvwd.js";
import { r as apiGet, t as ApiError } from "./api-D4JXw0uZ.js";

//#region .svelte-kit/adapter-bun/entries/pages/insights/_id_/_page.server.ts.js
var _page_server_ts_exports = /* @__PURE__ */ __exportAll({ load: () => load });
const load = async ({ params, url, locals, fetch }) => {
	if (!locals.token) error(401, "Unauthorized");
	const token = locals.token;
	const wantsNav = url.searchParams.get("nav") === "1";
	const kind = url.searchParams.get("kind") || "";
	const repo = url.searchParams.get("repo") || "";
	const navParams = new URLSearchParams();
	if (wantsNav) navParams.set("nav", "1");
	if (kind) navParams.set("kind", kind);
	if (repo) navParams.set("repo", repo);
	const qs = navParams.toString();
	const apiPath = `/api/insights/${params.id}${qs ? `?${qs}` : ""}`;
	try {
		const data = await apiGet(fetch, apiPath, locals.token);
		let relatedInsights = [];
		const relatedIds = data.enrichment?.related_ids;
		if (relatedIds && relatedIds.length > 0) {
			const fetches = relatedIds.slice(0, 5).map(async (id) => {
				try {
					const r = await apiGet(fetch, `/api/insights/${id}`, token);
					return {
						id: r.id,
						title: r.title,
						kind: r.kind
					};
				} catch {
					return null;
				}
			});
			relatedInsights = (await Promise.all(fetches)).filter((r) => r !== null);
		}
		let supersededByInsight = null;
		const supersededById = data.enrichment?.superseded_by_id;
		if (supersededById) try {
			const r = await apiGet(fetch, `/api/insights/${supersededById}`, token);
			supersededByInsight = {
				id: r.id,
				title: r.title,
				kind: r.kind
			};
		} catch {}
		let supersedesInsight = null;
		if (data.supersedes_id) try {
			const r = await apiGet(fetch, `/api/insights/${data.supersedes_id}`, token);
			supersedesInsight = {
				id: r.id,
				title: r.title,
				kind: r.kind
			};
		} catch {}
		return {
			insight: data,
			nav: data.nav ?? null,
			filterParams: qs ? `?${qs}` : "",
			relatedInsights,
			supersededByInsight,
			supersedesInsight
		};
	} catch (err) {
		if (err instanceof ApiError) error(err.status, err.status === 404 ? "Insight not found" : err.message);
		console.error("Failed to load insight:", err);
		error(500, "Failed to load insight");
	}
};

//#endregion
//#region .svelte-kit/adapter-bun/nodes/6.js
const index = 6;
let component_cache;
const component = async () => component_cache ??= (await import("./_page.svelte-NQDiNxqv.js")).default;
const server_id = "src/routes/insights/[id]/+page.server.ts";
const imports = [
	"_app/immutable/nodes/6.DAmctMAw.js",
	"_app/immutable/chunks/DsnmJJEf.js",
	"_app/immutable/chunks/Bws4SZbu.js",
	"_app/immutable/chunks/DWM5xL3m.js",
	"_app/immutable/chunks/CVudaATA.js",
	"_app/immutable/chunks/Bf2mrWYS.js",
	"_app/immutable/chunks/BtpFzMAW.js",
	"_app/immutable/chunks/B0jxRZm2.js",
	"_app/immutable/chunks/BLejWXTo.js",
	"_app/immutable/chunks/DJoCdHo2.js",
	"_app/immutable/chunks/D1cnPWIj.js",
	"_app/immutable/chunks/BGDGJX9A.js",
	"_app/immutable/chunks/Cf-irfjs.js",
	"_app/immutable/chunks/zuCDeH7k.js",
	"_app/immutable/chunks/7JDUULsq.js",
	"_app/immutable/chunks/E1QDJU-i.js",
	"_app/immutable/chunks/Df33DIVP.js",
	"_app/immutable/chunks/CxJSgYGn.js",
	"_app/immutable/chunks/zdPxcW3D.js",
	"_app/immutable/chunks/DzmLCJCY.js"
];
const stylesheets = [];
const fonts = [];

//#endregion
export { component, fonts, imports, index, _page_server_ts_exports as server, server_id, stylesheets };
//# sourceMappingURL=6-C9OuF1z9.js.map