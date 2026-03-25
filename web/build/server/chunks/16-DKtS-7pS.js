import { t as __exportAll } from "./chunk-BdHzlgOL.js";
import { i as redirect, n as fail } from "./exports-DwueHvwd.js";
import { a as apiPost, i as apiPatch, r as apiGet, t as ApiError } from "./api-D4JXw0uZ.js";

//#region .svelte-kit/adapter-bun/entries/pages/settings/account/_page.server.ts.js
var _page_server_ts_exports = /* @__PURE__ */ __exportAll({
	actions: () => actions,
	load: () => load
});
const load = async ({ locals, fetch }) => {
	if (locals.soloMode) redirect(302, "/settings");
	if (!locals.token) redirect(302, "/login");
	let me = null;
	try {
		me = (await apiGet(fetch, "/api/auth/me", locals.token)).user;
	} catch {}
	return {
		user: locals.user,
		me
	};
};
const actions = {
	createToken: async ({ locals, fetch }) => {
		if (!locals.token) return fail(401, { tokenError: "Unauthorized" });
		try {
			return { token: (await apiPost(fetch, "/api/auth/token", {}, locals.token)).token };
		} catch (err) {
			if (err instanceof ApiError) return fail(err.status, { tokenError: err.message });
			return fail(500, { tokenError: "Failed to create token" });
		}
	},
	updateProfile: async ({ request, locals, fetch }) => {
		if (!locals.token) return fail(401, { error: "Unauthorized" });
		const name = (await request.formData()).get("name")?.trim();
		if (!name) return fail(400, { profileError: "Name is required." });
		try {
			await apiPatch(fetch, "/api/auth/profile", { name }, locals.token);
			return { profileSaved: true };
		} catch (err) {
			if (err instanceof ApiError) return fail(err.status, { profileError: err.message });
			return fail(500, { profileError: "Failed to update profile." });
		}
	},
	changePassword: async ({ request, locals, fetch }) => {
		if (!locals.token) return fail(401, { error: "Unauthorized" });
		const data = await request.formData();
		const current_password = data.get("current_password");
		const new_password = data.get("new_password");
		const confirm_password = data.get("confirm_password");
		if (!current_password || !new_password) return fail(400, { passwordError: "All fields are required." });
		if (new_password.length < 8) return fail(400, { passwordError: "New password must be at least 8 characters." });
		if (new_password !== confirm_password) return fail(400, { passwordError: "New passwords do not match." });
		try {
			await apiPost(fetch, "/api/auth/change-password", {
				current_password,
				new_password
			}, locals.token);
			return { passwordSaved: true };
		} catch (err) {
			if (err instanceof ApiError) return fail(err.status, { passwordError: err.message });
			return fail(500, { passwordError: "Failed to change password." });
		}
	},
	setup2fa: async ({ locals, fetch }) => {
		if (!locals.token) return fail(401, { error: "Unauthorized" });
		try {
			const result = await apiPost(fetch, "/api/auth/2fa/setup", {}, locals.token);
			return {
				setup2fa: true,
				secret: result.secret,
				qrCode: result.qrCode
			};
		} catch (err) {
			if (err instanceof ApiError) return fail(err.status, { twoFaError: err.message });
			return fail(500, { twoFaError: "Failed to start 2FA setup." });
		}
	},
	confirm2fa: async ({ request, locals, fetch }) => {
		if (!locals.token) return fail(401, { error: "Unauthorized" });
		const code = (await request.formData()).get("code")?.trim();
		if (!code || !/^\d{6}$/.test(code)) return fail(400, { confirmError: "Enter the 6-digit code from your authenticator app." });
		try {
			return {
				twoFaEnabled: true,
				backupCodes: (await apiPost(fetch, "/api/auth/2fa/confirm", { code }, locals.token)).backupCodes
			};
		} catch (err) {
			if (err instanceof ApiError) return fail(err.status, { confirmError: err.message });
			return fail(500, { confirmError: "Failed to confirm 2FA." });
		}
	},
	disable2fa: async ({ request, locals, fetch }) => {
		if (!locals.token) return fail(401, { error: "Unauthorized" });
		const code = (await request.formData()).get("code")?.trim();
		if (!code) return fail(400, { disableError: "Code is required to disable 2FA." });
		try {
			await apiPost(fetch, "/api/auth/2fa/disable", { code }, locals.token);
			return { twoFaDisabled: true };
		} catch (err) {
			if (err instanceof ApiError) return fail(err.status, { disableError: err.message });
			return fail(500, { disableError: "Failed to disable 2FA." });
		}
	}
};

//#endregion
//#region .svelte-kit/adapter-bun/nodes/16.js
const index = 16;
let component_cache;
const component = async () => component_cache ??= (await import("./_page.svelte-Co156p9j.js")).default;
const server_id = "src/routes/settings/account/+page.server.ts";
const imports = [
	"_app/immutable/nodes/16.DpmCIpzf.js",
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
	"_app/immutable/chunks/CGJNfCq1.js",
	"_app/immutable/chunks/E1QDJU-i.js",
	"_app/immutable/chunks/CliavseV.js",
	"_app/immutable/chunks/k6vOMknB.js",
	"_app/immutable/chunks/Bu6apKgh.js",
	"_app/immutable/chunks/Df33DIVP.js",
	"_app/immutable/chunks/WXyJnVC9.js"
];
const stylesheets = [];
const fonts = [];

//#endregion
export { component, fonts, imports, index, _page_server_ts_exports as server, server_id, stylesheets };
//# sourceMappingURL=16-DKtS-7pS.js.map