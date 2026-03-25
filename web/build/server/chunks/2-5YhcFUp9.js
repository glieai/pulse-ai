import { t as __exportAll } from "./chunk-BdHzlgOL.js";
import { i as redirect } from "./exports-DwueHvwd.js";

//#region .svelte-kit/adapter-bun/entries/pages/_page.server.ts.js
var _page_server_ts_exports = /* @__PURE__ */ __exportAll({ load: () => load });
const load = async ({ locals, url }) => {
	if ((locals.soloMode || locals.user) && !url.searchParams.has("preview")) redirect(302, "/insights");
	return {};
};

//#endregion
//#region .svelte-kit/adapter-bun/nodes/2.js
const index = 2;
let component_cache;
const component = async () => component_cache ??= (await import("./_page.svelte-B2kNANYO.js")).default;
const server_id = "src/routes/+page.server.ts";
const imports = [
	"_app/immutable/nodes/2.DxoW0iuA.js",
	"_app/immutable/chunks/DsnmJJEf.js",
	"_app/immutable/chunks/Cf-irfjs.js",
	"_app/immutable/chunks/Bws4SZbu.js",
	"_app/immutable/chunks/DWM5xL3m.js",
	"_app/immutable/chunks/1D5Xwdqr.js",
	"_app/immutable/chunks/DKDm_2X4.js",
	"_app/immutable/chunks/B0jxRZm2.js",
	"_app/immutable/chunks/DJoCdHo2.js",
	"_app/immutable/chunks/BGDGJX9A.js",
	"_app/immutable/chunks/CVudaATA.js",
	"_app/immutable/chunks/Bf2mrWYS.js",
	"_app/immutable/chunks/BtpFzMAW.js",
	"_app/immutable/chunks/BLejWXTo.js",
	"_app/immutable/chunks/DDzH388f.js",
	"_app/immutable/chunks/TZebtHj_.js",
	"_app/immutable/chunks/XxGNfMeX.js",
	"_app/immutable/chunks/DzmLCJCY.js",
	"_app/immutable/chunks/Bt7e3dqN.js",
	"_app/immutable/chunks/DxJGxwKx.js",
	"_app/immutable/chunks/DGKeAb96.js",
	"_app/immutable/chunks/Gxflfror.js",
	"_app/immutable/chunks/zdPxcW3D.js"
];
const stylesheets = [];
const fonts = [];

//#endregion
export { component, fonts, imports, index, _page_server_ts_exports as server, server_id, stylesheets };
//# sourceMappingURL=2-5YhcFUp9.js.map