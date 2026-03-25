import { t as __exportAll } from "./chunk-BdHzlgOL.js";
import { n as fail } from "./exports-DwueHvwd.js";
import { a as apiPost, t as ApiError } from "./api-D4JXw0uZ.js";

//#region .svelte-kit/adapter-bun/entries/pages/forgot-password/_page.server.ts.js
var _page_server_ts_exports = /* @__PURE__ */ __exportAll({ actions: () => actions });
const actions = { default: async ({ request, fetch }) => {
	const email = (await request.formData()).get("email");
	if (!email) return fail(400, { error: "Email is required." });
	try {
		await apiPost(fetch, "/api/auth/forgot-password", { email });
	} catch (err) {
		if (err instanceof ApiError && err.status !== 200) return fail(err.status, { error: err.message });
	}
	return { success: "If that email exists, a reset link has been sent. Check your inbox." };
} };

//#endregion
//#region .svelte-kit/adapter-bun/nodes/4.js
const index = 4;
let component_cache;
const component = async () => component_cache ??= (await import("./_page.svelte-D-s7Aa9P.js")).default;
const server_id = "src/routes/forgot-password/+page.server.ts";
const imports = [
	"_app/immutable/nodes/4.Cd5D1rJO.js",
	"_app/immutable/chunks/DsnmJJEf.js",
	"_app/immutable/chunks/Bws4SZbu.js",
	"_app/immutable/chunks/DWM5xL3m.js",
	"_app/immutable/chunks/CVudaATA.js",
	"_app/immutable/chunks/DKDm_2X4.js",
	"_app/immutable/chunks/B2BvnOrD.js",
	"_app/immutable/chunks/BGDGJX9A.js",
	"_app/immutable/chunks/Cf-irfjs.js"
];
const stylesheets = [];
const fonts = [];

//#endregion
export { component, fonts, imports, index, _page_server_ts_exports as server, server_id, stylesheets };
//# sourceMappingURL=4-DjRuN6v9.js.map