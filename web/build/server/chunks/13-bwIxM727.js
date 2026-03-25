import { t as __exportAll } from "./chunk-BdHzlgOL.js";
import { n as fail } from "./exports-DwueHvwd.js";
import { a as apiPost, r as apiGet, t as ApiError } from "./api-D4JXw0uZ.js";

//#region .svelte-kit/adapter-bun/entries/pages/reset-password/_token_/_page.server.ts.js
var _page_server_ts_exports = /* @__PURE__ */ __exportAll({
	actions: () => actions,
	load: () => load
});
const load = async ({ params, fetch }) => {
	const { token } = params;
	try {
		const result = await apiGet(fetch, `/api/auth/reset-password/validate/${token}`);
		return {
			valid: result.valid,
			email: result.email ?? null,
			token
		};
	} catch {
		return {
			valid: false,
			email: null,
			token
		};
	}
};
const actions = { default: async ({ request, params, fetch }) => {
	const password = (await request.formData()).get("password");
	const { token } = params;
	if (!password || password.length < 8) return fail(400, { error: "Password must be at least 8 characters." });
	try {
		await apiPost(fetch, "/api/auth/reset-password", {
			token,
			password
		});
		return { success: true };
	} catch (err) {
		if (err instanceof ApiError) return fail(err.status, { error: err.message });
		return fail(500, { error: "Something went wrong. Please try again." });
	}
} };

//#endregion
//#region .svelte-kit/adapter-bun/nodes/13.js
const index = 13;
let component_cache;
const component = async () => component_cache ??= (await import("./_page.svelte-DzuSCiQC.js")).default;
const server_id = "src/routes/reset-password/[token]/+page.server.ts";
const imports = [
	"_app/immutable/nodes/13.DVlOmaOa.js",
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
//# sourceMappingURL=13-bwIxM727.js.map