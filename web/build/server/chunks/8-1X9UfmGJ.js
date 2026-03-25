import { t as __exportAll } from "./chunk-BdHzlgOL.js";
import { n as fail } from "./exports-DwueHvwd.js";
import { a as apiPost, r as apiGet, t as ApiError } from "./api-D4JXw0uZ.js";

//#region .svelte-kit/adapter-bun/entries/pages/invite/_token_/_page.server.ts.js
var _page_server_ts_exports = /* @__PURE__ */ __exportAll({
	actions: () => actions,
	load: () => load
});
const load = async ({ params, fetch }) => {
	const { token } = params;
	try {
		const result = await apiGet(fetch, `/api/auth/invitation/${token}`);
		return {
			valid: result.valid,
			reason: result.reason ?? null,
			email: result.email ?? "",
			org_name: result.org_name ?? "",
			token
		};
	} catch {
		return {
			valid: false,
			reason: "invalid",
			email: "",
			org_name: "",
			token
		};
	}
};
const actions = { default: async ({ request, params, fetch }) => {
	const data = await request.formData();
	const name = data.get("name");
	const password = data.get("password");
	const { token } = params;
	if (!name || !password) return fail(400, { error: "Name and password are required." });
	try {
		await apiPost(fetch, "/api/auth/accept-invitation", {
			token,
			name,
			password
		});
		return { success: true };
	} catch (err) {
		if (err instanceof ApiError) return fail(err.status, { error: err.message });
		return fail(500, { error: "Something went wrong. Please try again." });
	}
} };

//#endregion
//#region .svelte-kit/adapter-bun/nodes/8.js
const index = 8;
let component_cache;
const component = async () => component_cache ??= (await import("./_page.svelte-M2KxLLlK.js")).default;
const server_id = "src/routes/invite/[token]/+page.server.ts";
const imports = [
	"_app/immutable/nodes/8.DLZTLxFC.js",
	"_app/immutable/chunks/DsnmJJEf.js",
	"_app/immutable/chunks/Bws4SZbu.js",
	"_app/immutable/chunks/DWM5xL3m.js",
	"_app/immutable/chunks/CVudaATA.js",
	"_app/immutable/chunks/DKDm_2X4.js",
	"_app/immutable/chunks/B0jxRZm2.js",
	"_app/immutable/chunks/B2BvnOrD.js",
	"_app/immutable/chunks/BGDGJX9A.js",
	"_app/immutable/chunks/Cf-irfjs.js"
];
const stylesheets = [];
const fonts = [];

//#endregion
export { component, fonts, imports, index, _page_server_ts_exports as server, server_id, stylesheets };
//# sourceMappingURL=8-1X9UfmGJ.js.map