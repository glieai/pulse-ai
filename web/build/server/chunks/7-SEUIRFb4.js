import { t as __exportAll } from "./chunk-BdHzlgOL.js";
import { n as fail } from "./exports-DwueHvwd.js";
import { n as apiDelete, r as apiGet, t as ApiError } from "./api-D4JXw0uZ.js";

//#region .svelte-kit/adapter-bun/entries/pages/insights/drafts/_page.server.ts.js
var _page_server_ts_exports = /* @__PURE__ */ __exportAll({
	actions: () => actions,
	load: () => load
});
const load = async ({ locals, fetch }) => {
	if (!locals.token) return {
		drafts: [],
		total: 0
	};
	try {
		const data = await apiGet(fetch, "/api/insights?status=draft&limit=100", locals.token);
		return {
			drafts: data.insights,
			total: data.total
		};
	} catch {
		return {
			drafts: [],
			total: 0
		};
	}
};
const actions = { delete: async ({ request, locals, fetch }) => {
	if (!locals.token) return fail(401, { error: "Unauthorized" });
	const id = (await request.formData()).get("id");
	if (!id) return fail(400, { error: "Missing insight id" });
	try {
		await apiDelete(fetch, `/api/insights/${id}`, locals.token);
		return { deleted: id };
	} catch (err) {
		if (err instanceof ApiError) return fail(err.status, { error: err.message });
		return fail(500, { error: "Failed to delete draft" });
	}
} };

//#endregion
//#region .svelte-kit/adapter-bun/nodes/7.js
const index = 7;
let component_cache;
const component = async () => component_cache ??= (await import("./_page.svelte-GPmkai-r.js")).default;
const server_id = "src/routes/insights/drafts/+page.server.ts";
const imports = [
	"_app/immutable/nodes/7.BXUqYtOM.js",
	"_app/immutable/chunks/DsnmJJEf.js",
	"_app/immutable/chunks/Bws4SZbu.js",
	"_app/immutable/chunks/DWM5xL3m.js",
	"_app/immutable/chunks/CVudaATA.js",
	"_app/immutable/chunks/Bf2mrWYS.js",
	"_app/immutable/chunks/BtpFzMAW.js",
	"_app/immutable/chunks/B0jxRZm2.js",
	"_app/immutable/chunks/BLejWXTo.js",
	"_app/immutable/chunks/DJoCdHo2.js",
	"_app/immutable/chunks/DKDm_2X4.js",
	"_app/immutable/chunks/B2BvnOrD.js",
	"_app/immutable/chunks/BGDGJX9A.js",
	"_app/immutable/chunks/Cf-irfjs.js",
	"_app/immutable/chunks/qANfsgeN.js",
	"_app/immutable/chunks/BH_J3ZZs.js"
];
const stylesheets = [];
const fonts = [];

//#endregion
export { component, fonts, imports, index, _page_server_ts_exports as server, server_id, stylesheets };
//# sourceMappingURL=7-SEUIRFb4.js.map