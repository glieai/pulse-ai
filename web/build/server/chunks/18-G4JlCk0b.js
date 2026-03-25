import { t as __exportAll } from "./chunk-BdHzlgOL.js";
import { i as redirect, n as fail } from "./exports-DwueHvwd.js";
import { a as apiPost, i as apiPatch, n as apiDelete, r as apiGet, t as ApiError } from "./api-D4JXw0uZ.js";

//#region .svelte-kit/adapter-bun/entries/pages/settings/org/_page.server.ts.js
var _page_server_ts_exports = /* @__PURE__ */ __exportAll({
	actions: () => actions,
	load: () => load
});
const load = async ({ locals, fetch }) => {
	if (locals.soloMode) redirect(302, "/settings");
	if (!locals.token) redirect(302, "/login");
	let org = null;
	try {
		org = (await apiGet(fetch, "/api/org/info", locals.token)).org;
	} catch {}
	return {
		user: locals.user,
		org
	};
};
const actions = {
	updateName: async ({ request, locals, fetch }) => {
		if (!locals.token) return fail(401, { error: "Unauthorized" });
		const name = (await request.formData()).get("name")?.trim();
		if (!name || name.length < 2) return fail(400, { nameError: "Name must be at least 2 characters." });
		try {
			await apiPatch(fetch, "/api/org/info", { name }, locals.token);
			return { nameSaved: true };
		} catch (err) {
			if (err instanceof ApiError) return fail(err.status, { nameError: err.message });
			return fail(500, { nameError: "Failed to update org name." });
		}
	},
	requestDeletion: async ({ locals, fetch }) => {
		if (!locals.token) return fail(401, { error: "Unauthorized" });
		try {
			return {
				deletionScheduled: true,
				scheduledAt: (await apiPost(fetch, "/api/org/delete-request", {}, locals.token)).deletion_scheduled_at
			};
		} catch (err) {
			if (err instanceof ApiError) return fail(err.status, { deletionError: err.message });
			return fail(500, { deletionError: "Failed to schedule deletion." });
		}
	},
	cancelDeletion: async ({ locals, fetch }) => {
		if (!locals.token) return fail(401, { error: "Unauthorized" });
		try {
			await apiDelete(fetch, "/api/org/delete-request", locals.token);
			return { deletionCancelled: true };
		} catch (err) {
			if (err instanceof ApiError) return fail(err.status, { deletionError: err.message });
			return fail(500, { deletionError: "Failed to cancel deletion." });
		}
	}
};

//#endregion
//#region .svelte-kit/adapter-bun/nodes/18.js
const index = 18;
let component_cache;
const component = async () => component_cache ??= (await import("./_page.svelte-_vrhl3Kp.js")).default;
const server_id = "src/routes/settings/org/+page.server.ts";
const imports = [
	"_app/immutable/nodes/18.BhSUtQ40.js",
	"_app/immutable/chunks/DsnmJJEf.js",
	"_app/immutable/chunks/Bws4SZbu.js",
	"_app/immutable/chunks/DWM5xL3m.js",
	"_app/immutable/chunks/CVudaATA.js",
	"_app/immutable/chunks/DKDm_2X4.js",
	"_app/immutable/chunks/B0jxRZm2.js",
	"_app/immutable/chunks/IwRER8k3.js",
	"_app/immutable/chunks/B2BvnOrD.js",
	"_app/immutable/chunks/BGDGJX9A.js",
	"_app/immutable/chunks/Cf-irfjs.js",
	"_app/immutable/chunks/CGJNfCq1.js",
	"_app/immutable/chunks/CZHrM0hL.js",
	"_app/immutable/chunks/BtpFzMAW.js",
	"_app/immutable/chunks/Bf2mrWYS.js",
	"_app/immutable/chunks/BLejWXTo.js",
	"_app/immutable/chunks/DJoCdHo2.js",
	"_app/immutable/chunks/BH_J3ZZs.js",
	"_app/immutable/chunks/k6vOMknB.js",
	"_app/immutable/chunks/Ca5_o9o8.js"
];
const stylesheets = [];
const fonts = [];

//#endregion
export { component, fonts, imports, index, _page_server_ts_exports as server, server_id, stylesheets };
//# sourceMappingURL=18-G4JlCk0b.js.map