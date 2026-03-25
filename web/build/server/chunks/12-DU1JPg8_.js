import { t as __exportAll } from "./chunk-BdHzlgOL.js";
import { i as redirect } from "./exports-DwueHvwd.js";

//#region .svelte-kit/adapter-bun/entries/pages/register/_page.server.ts.js
var _page_server_ts_exports = /* @__PURE__ */ __exportAll({ load: () => load });
const load = async ({ locals }) => {
	if (locals.soloMode) redirect(302, "/insights");
	redirect(302, "/login");
};

//#endregion
//#region .svelte-kit/adapter-bun/nodes/12.js
const index = 12;
let component_cache;
const component = async () => component_cache ??= (await import("./_page.svelte-CT7dlRxH.js")).default;
const server_id = "src/routes/register/+page.server.ts";
const imports = [
	"_app/immutable/nodes/12.DSUnS3GH.js",
	"_app/immutable/chunks/DsnmJJEf.js",
	"_app/immutable/chunks/BtpFzMAW.js",
	"_app/immutable/chunks/Bws4SZbu.js"
];
const stylesheets = [];
const fonts = [];

//#endregion
export { component, fonts, imports, index, _page_server_ts_exports as server, server_id, stylesheets };
//# sourceMappingURL=12-DU1JPg8_.js.map