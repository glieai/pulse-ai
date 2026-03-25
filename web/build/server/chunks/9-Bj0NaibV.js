import { t as __exportAll } from "./chunk-BdHzlgOL.js";
import { i as redirect, n as fail } from "./exports-DwueHvwd.js";
import { a as apiPost, t as ApiError } from "./api-D4JXw0uZ.js";

//#region .svelte-kit/adapter-bun/entries/pages/login/_page.server.ts.js
var _page_server_ts_exports = /* @__PURE__ */ __exportAll({
	actions: () => actions,
	load: () => load
});
const load = async ({ locals }) => {
	if (locals.soloMode) redirect(302, "/insights");
	return { googleOAuthEnabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) };
};
const actions = {
	login: async ({ request, cookies, fetch }) => {
		const data = await request.formData();
		const email = data.get("email");
		const password = data.get("password");
		if (!email || !password) return fail(400, { error: "Email and password are required." });
		try {
			const result = await apiPost(fetch, "/api/auth/login", {
				email,
				password
			});
			if ("requires2FA" in result && result.requires2FA) return {
				requires2FA: true,
				temp_token: result.temp_token
			};
			const loginResult = result;
			cookies.set("pulse_jwt", loginResult.token, {
				path: "/",
				httpOnly: true,
				secure: false,
				sameSite: "lax",
				maxAge: 3600 * 24
			});
		} catch (err) {
			if (err instanceof ApiError) return fail(err.status, { error: err.message });
			return fail(500, { error: "Something went wrong. Please try again." });
		}
		redirect(302, "/");
	},
	verify2fa: async ({ request, cookies, fetch }) => {
		const data = await request.formData();
		const temp_token = data.get("temp_token");
		const code = data.get("code");
		if (!temp_token || !code) return fail(400, {
			error: "Code is required.",
			requires2FA: true,
			temp_token
		});
		try {
			const result = await apiPost(fetch, "/api/auth/verify-2fa", {
				temp_token,
				code
			});
			cookies.set("pulse_jwt", result.token, {
				path: "/",
				httpOnly: true,
				secure: false,
				sameSite: "lax",
				maxAge: 3600 * 24
			});
		} catch (err) {
			if (err instanceof ApiError) return fail(err.status, {
				error: err.message,
				requires2FA: true,
				temp_token
			});
			return fail(500, {
				error: "Something went wrong. Please try again.",
				requires2FA: true,
				temp_token
			});
		}
		redirect(302, "/");
	}
};

//#endregion
//#region .svelte-kit/adapter-bun/nodes/9.js
const index = 9;
let component_cache;
const component = async () => component_cache ??= (await import("./_page.svelte-5KBQj4RF.js")).default;
const server_id = "src/routes/login/+page.server.ts";
const imports = [
	"_app/immutable/nodes/9.DhuQMmy6.js",
	"_app/immutable/chunks/DsnmJJEf.js",
	"_app/immutable/chunks/Bws4SZbu.js",
	"_app/immutable/chunks/DWM5xL3m.js",
	"_app/immutable/chunks/CVudaATA.js",
	"_app/immutable/chunks/DKDm_2X4.js",
	"_app/immutable/chunks/B0jxRZm2.js",
	"_app/immutable/chunks/B2BvnOrD.js",
	"_app/immutable/chunks/BGDGJX9A.js",
	"_app/immutable/chunks/Cf-irfjs.js",
	"_app/immutable/chunks/BB5gz5Xj.js",
	"_app/immutable/chunks/Bu6apKgh.js",
	"_app/immutable/chunks/BtpFzMAW.js",
	"_app/immutable/chunks/Bf2mrWYS.js",
	"_app/immutable/chunks/BLejWXTo.js",
	"_app/immutable/chunks/DJoCdHo2.js"
];
const stylesheets = [];
const fonts = [];

//#endregion
export { component, fonts, imports, index, _page_server_ts_exports as server, server_id, stylesheets };
//# sourceMappingURL=9-Bj0NaibV.js.map