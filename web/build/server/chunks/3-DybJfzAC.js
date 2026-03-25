import { t as __exportAll } from "./chunk-BdHzlgOL.js";
import { r as apiGet } from "./api-D4JXw0uZ.js";

//#region .svelte-kit/adapter-bun/entries/pages/analytics/_page.server.ts.js
var _page_server_ts_exports = /* @__PURE__ */ __exportAll({ load: () => load });
const load = async ({ locals, fetch }) => {
	if (!locals.token) return { analytics: null };
	try {
		return { analytics: await apiGet(fetch, "/api/insights/analytics", locals.token) };
	} catch {
		return { analytics: null };
	}
};

//#endregion
//#region .svelte-kit/adapter-bun/nodes/3.js
const index = 3;
let component_cache;
const component = async () => component_cache ??= (await import("./_page.svelte-4zK2x5Hr.js")).default;
const server_id = "src/routes/analytics/+page.server.ts";
const imports = [
	"_app/immutable/nodes/3.D7hAJpLw.js",
	"_app/immutable/chunks/DsnmJJEf.js",
	"_app/immutable/chunks/Bws4SZbu.js",
	"_app/immutable/chunks/DWM5xL3m.js",
	"_app/immutable/chunks/CVudaATA.js",
	"_app/immutable/chunks/Bf2mrWYS.js",
	"_app/immutable/chunks/BtpFzMAW.js",
	"_app/immutable/chunks/B0jxRZm2.js",
	"_app/immutable/chunks/BLejWXTo.js",
	"_app/immutable/chunks/DJoCdHo2.js",
	"_app/immutable/chunks/qANfsgeN.js",
	"_app/immutable/chunks/BYrbxNRK.js"
];
const stylesheets = [];
const fonts = [];

//#endregion
export { component, fonts, imports, index, _page_server_ts_exports as server, server_id, stylesheets };
//# sourceMappingURL=3-DybJfzAC.js.map