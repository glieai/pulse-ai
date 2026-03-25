import { t as __exportAll } from "./chunk-BdHzlgOL.js";
import { i as redirect } from "./exports-DwueHvwd.js";

//#region .svelte-kit/adapter-bun/entries/pages/logout/_page.server.ts.js
var _page_server_ts_exports = /* @__PURE__ */ __exportAll({ load: () => load });
const load = async ({ locals, cookies }) => {
	if (locals.soloMode) redirect(302, "/insights");
	cookies.delete("pulse_jwt", { path: "/" });
	redirect(302, "/login");
};

//#endregion
//#region .svelte-kit/adapter-bun/nodes/10.js
const index = 10;
const server_id = "src/routes/logout/+page.server.ts";
const imports = [];
const stylesheets = [];
const fonts = [];

//#endregion
export { fonts, imports, index, _page_server_ts_exports as server, server_id, stylesheets };
//# sourceMappingURL=10-klwmt_7Q.js.map