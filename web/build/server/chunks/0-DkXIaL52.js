import { t as __exportAll } from "./chunk-BdHzlgOL.js";
import { i as redirect } from "./exports-DwueHvwd.js";
import { r as apiGet } from "./api-D4JXw0uZ.js";

//#region .svelte-kit/adapter-bun/entries/pages/_layout.server.ts.js
var _layout_server_ts_exports = /* @__PURE__ */ __exportAll({ load: () => load });
const PUBLIC_ROUTES = [
	"/",
	"/login",
	"/register",
	"/pricing",
	"/forgot-password"
];
const PUBLIC_PREFIXES = [
	"/reset-password/",
	"/invite/",
	"/auth/"
];
function isPublicRoute(pathname) {
	return PUBLIC_ROUTES.includes(pathname) || PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
}
const load = async ({ locals, url, fetch }) => {
	if (!locals.soloMode && !locals.user && !isPublicRoute(url.pathname)) redirect(302, "/login");
	let draftCount = 0;
	if (locals.token && !isPublicRoute(url.pathname)) try {
		draftCount = (await apiGet(fetch, "/api/insights?status=draft&limit=0", locals.token)).total;
	} catch {}
	return {
		user: locals.user,
		soloMode: locals.soloMode,
		draftCount
	};
};

//#endregion
//#region .svelte-kit/adapter-bun/nodes/0.js
const index = 0;
let component_cache;
const component = async () => component_cache ??= (await import("./_layout.svelte-2aK76kaM.js")).default;
const server_id = "src/routes/+layout.server.ts";
const imports = [
	"_app/immutable/nodes/0.CbNODAhb.js",
	"_app/immutable/chunks/DsnmJJEf.js",
	"_app/immutable/chunks/Bws4SZbu.js",
	"_app/immutable/chunks/DWM5xL3m.js",
	"_app/immutable/chunks/CVudaATA.js",
	"_app/immutable/chunks/1D5Xwdqr.js",
	"_app/immutable/chunks/Cf-irfjs.js",
	"_app/immutable/chunks/Bf2mrWYS.js",
	"_app/immutable/chunks/BtpFzMAW.js",
	"_app/immutable/chunks/B0jxRZm2.js",
	"_app/immutable/chunks/BLejWXTo.js",
	"_app/immutable/chunks/DJoCdHo2.js",
	"_app/immutable/chunks/DDzH388f.js",
	"_app/immutable/chunks/BB5gz5Xj.js",
	"_app/immutable/chunks/BGDGJX9A.js",
	"_app/immutable/chunks/DxJGxwKx.js",
	"_app/immutable/chunks/Bt7e3dqN.js",
	"_app/immutable/chunks/BYrbxNRK.js",
	"_app/immutable/chunks/qANfsgeN.js",
	"_app/immutable/chunks/CZHrM0hL.js",
	"_app/immutable/chunks/E1QDJU-i.js",
	"_app/immutable/chunks/CGJNfCq1.js"
];
const stylesheets = ["_app/immutable/assets/0.CiFSLyxR.css"];
const fonts = [
	"_app/immutable/assets/inter-cyrillic-ext-wght-normal.BOeWTOD4.woff2",
	"_app/immutable/assets/inter-cyrillic-wght-normal.DqGufNeO.woff2",
	"_app/immutable/assets/inter-greek-ext-wght-normal.DlzME5K_.woff2",
	"_app/immutable/assets/inter-greek-wght-normal.CkhJZR-_.woff2",
	"_app/immutable/assets/inter-vietnamese-wght-normal.CBcvBZtf.woff2",
	"_app/immutable/assets/inter-latin-ext-wght-normal.DO1Apj_S.woff2",
	"_app/immutable/assets/inter-latin-wght-normal.Dx4kXJAl.woff2"
];

//#endregion
export { component, fonts, imports, index, _layout_server_ts_exports as server, server_id, stylesheets };
//# sourceMappingURL=0-DkXIaL52.js.map