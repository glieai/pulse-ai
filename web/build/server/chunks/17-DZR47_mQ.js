import { t as __exportAll } from "./chunk-BdHzlgOL.js";
import { i as redirect, n as fail } from "./exports-DwueHvwd.js";
import { a as apiPost, i as apiPatch, n as apiDelete, r as apiGet, t as ApiError } from "./api-D4JXw0uZ.js";

//#region .svelte-kit/adapter-bun/entries/pages/settings/members/_page.server.ts.js
var _page_server_ts_exports = /* @__PURE__ */ __exportAll({
	actions: () => actions,
	load: () => load
});
const load = async ({ locals, fetch }) => {
	if (locals.soloMode) redirect(302, "/settings");
	if (!locals.token) redirect(302, "/login");
	let members = [];
	let invitations = [];
	try {
		const [membersData, invitationsData] = await Promise.all([apiGet(fetch, "/api/org/members", locals.token), apiGet(fetch, "/api/org/invitations", locals.token).catch(() => ({ invitations: [] }))]);
		members = membersData.members;
		invitations = invitationsData.invitations;
	} catch (err) {
		console.error("Failed to load members:", err);
	}
	return {
		user: locals.user,
		members,
		invitations
	};
};
const actions = {
	invite: async ({ request, locals, fetch }) => {
		if (!locals.token) return fail(401, { error: "Unauthorized" });
		const data = await request.formData();
		const email = data.get("email");
		const role = data.get("role");
		if (!email || !role) return fail(400, { inviteError: "Email and role are required." });
		try {
			await apiPost(fetch, "/api/org/invite", {
				email,
				role
			}, locals.token);
			return {
				inviteSent: true,
				invitedEmail: email
			};
		} catch (err) {
			if (err instanceof ApiError) return fail(err.status, { inviteError: err.message });
			return fail(500, { inviteError: "Failed to send invitation." });
		}
	},
	cancelInvitation: async ({ request, locals, fetch }) => {
		if (!locals.token) return fail(401, { error: "Unauthorized" });
		const id = (await request.formData()).get("id");
		try {
			await apiDelete(fetch, `/api/org/invitations/${id}`, locals.token);
			return { cancelled: true };
		} catch (err) {
			if (err instanceof ApiError) return fail(err.status, { error: err.message });
			return fail(500, { error: "Failed to cancel invitation." });
		}
	},
	deactivate: async ({ request, locals, fetch }) => {
		if (!locals.token) return fail(401, { error: "Unauthorized" });
		const userId = (await request.formData()).get("userId");
		try {
			await apiPatch(fetch, `/api/org/members/${userId}/deactivate`, {}, locals.token);
			return { deactivated: userId };
		} catch (err) {
			if (err instanceof ApiError) return fail(err.status, { error: err.message });
			return fail(500, { error: "Failed to deactivate member." });
		}
	},
	reactivate: async ({ request, locals, fetch }) => {
		if (!locals.token) return fail(401, { error: "Unauthorized" });
		const userId = (await request.formData()).get("userId");
		try {
			await apiPatch(fetch, `/api/org/members/${userId}/reactivate`, {}, locals.token);
			return { reactivated: userId };
		} catch (err) {
			if (err instanceof ApiError) return fail(err.status, { error: err.message });
			return fail(500, { error: "Failed to reactivate member." });
		}
	}
};

//#endregion
//#region .svelte-kit/adapter-bun/nodes/17.js
const index = 17;
let component_cache;
const component = async () => component_cache ??= (await import("./_page.svelte-B4yvPXSQ.js")).default;
const server_id = "src/routes/settings/members/+page.server.ts";
const imports = [
	"_app/immutable/nodes/17.mcIA_0n6.js",
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
	"_app/immutable/chunks/Gxflfror.js",
	"_app/immutable/chunks/Ca5_o9o8.js"
];
const stylesheets = [];
const fonts = [];

//#endregion
export { component, fonts, imports, index, _page_server_ts_exports as server, server_id, stylesheets };
//# sourceMappingURL=17-DZR47_mQ.js.map