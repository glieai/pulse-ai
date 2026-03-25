import { t as __exportAll } from "./chunk-BdHzlgOL.js";
import { n as fail } from "./exports-DwueHvwd.js";
import { a as apiPost, i as apiPatch, n as apiDelete, o as apiPut, r as apiGet, t as ApiError } from "./api-D4JXw0uZ.js";

//#region .svelte-kit/adapter-bun/entries/pages/settings/_page.server.ts.js
var _page_server_ts_exports = /* @__PURE__ */ __exportAll({
	actions: () => actions,
	load: () => load
});
const load = async ({ locals, fetch }) => {
	let llm = null;
	let aiFeatures = null;
	let llmStatus = null;
	if (locals.token) try {
		const result = await apiGet(fetch, "/api/org/settings", locals.token);
		llm = result.settings?.llm ?? null;
		aiFeatures = result.settings?.ai_features ?? null;
		llmStatus = result.llm_status ?? null;
	} catch {}
	return {
		user: locals.user,
		llm,
		aiFeatures,
		llmStatus
	};
};
const actions = {
	upsertProvider: async ({ request, locals, fetch }) => {
		if (!locals.token) return fail(401, { llmError: "Unauthorized" });
		const data = await request.formData();
		const provider = data.get("provider");
		const apiKey = data.get("api_key");
		const model = data.get("model");
		if (!provider || provider !== "anthropic" && provider !== "openai") return fail(400, { llmError: "Invalid provider." });
		const body = {};
		if (apiKey) body.api_key = apiKey;
		if (model) body.model = model;
		if (!body.api_key && !body.model) return fail(400, { llmError: "API key or model is required." });
		try {
			await apiPut(fetch, `/api/org/settings/llm/providers/${provider}`, body, locals.token);
			return { llmSaved: true };
		} catch (err) {
			if (err instanceof ApiError) return fail(err.status, { llmError: err.message });
			return fail(500, { llmError: "Failed to save provider settings" });
		}
	},
	removeProvider: async ({ request, locals, fetch }) => {
		if (!locals.token) return fail(401, { llmError: "Unauthorized" });
		const provider = (await request.formData()).get("provider");
		if (!provider || provider !== "anthropic" && provider !== "openai") return fail(400, { llmError: "Invalid provider." });
		try {
			await apiDelete(fetch, `/api/org/settings/llm/providers/${provider}`, locals.token);
			return { llmSaved: true };
		} catch (err) {
			if (err instanceof ApiError) return fail(err.status, { llmError: err.message });
			return fail(500, { llmError: "Failed to remove provider" });
		}
	},
	setActive: async ({ request, locals, fetch }) => {
		if (!locals.token) return fail(401, { llmError: "Unauthorized" });
		const activeProvider = (await request.formData()).get("active_provider");
		if (!activeProvider || activeProvider !== "anthropic" && activeProvider !== "openai") return fail(400, { llmError: "Invalid provider." });
		try {
			await apiPatch(fetch, "/api/org/settings/llm/active", { active_provider: activeProvider }, locals.token);
			return { llmSaved: true };
		} catch (err) {
			if (err instanceof ApiError) return fail(err.status, { llmError: err.message });
			return fail(500, { llmError: "Failed to set active provider" });
		}
	},
	setCliProvider: async ({ request, locals, fetch }) => {
		if (!locals.token) return fail(401, { llmError: "Unauthorized" });
		const cliProvider = (await request.formData()).get("cli_provider");
		if (!cliProvider || ![
			"claude-cli",
			"codex-cli",
			"anthropic",
			"openai"
		].includes(cliProvider)) return fail(400, { llmError: "Invalid provider." });
		try {
			await apiPatch(fetch, "/api/org/settings/cli-provider", { cli_provider: cliProvider }, locals.token);
			return { providerSaved: true };
		} catch (err) {
			if (err instanceof ApiError) return fail(err.status, { llmError: err.message });
			return fail(500, { llmError: "Failed to set provider" });
		}
	},
	installCliTool: async ({ request, locals, fetch }) => {
		if (!locals.token) return fail(401, { installError: "Unauthorized" });
		const tool = (await request.formData()).get("tool");
		if (!tool || tool !== "claude" && tool !== "codex") return fail(400, { installError: "Invalid tool." });
		try {
			await apiPost(fetch, "/api/org/cli-tools/install", { tool }, locals.token);
			return { installSuccess: tool };
		} catch (err) {
			if (err instanceof ApiError) return fail(err.status, { installError: err.message });
			return fail(500, { installError: `Failed to install ${tool}` });
		}
	},
	saveAiFeatures: async ({ request, locals, fetch }) => {
		if (!locals.token) return fail(401, { error: "Unauthorized" });
		const enrichmentEnabled = (await request.formData()).get("enrichment_enabled") === "on";
		try {
			await apiPatch(fetch, "/api/org/settings/ai", { enrichment_enabled: enrichmentEnabled }, locals.token);
			return { aiSaved: true };
		} catch (err) {
			if (err instanceof ApiError) return fail(err.status, { aiError: err.message });
			return fail(500, { aiError: "Failed to save AI features" });
		}
	}
};

//#endregion
//#region .svelte-kit/adapter-bun/nodes/15.js
const index = 15;
let component_cache;
const component = async () => component_cache ??= (await import("./_page.svelte-C2uZltDN.js")).default;
const server_id = "src/routes/settings/+page.server.ts";
const imports = [
	"_app/immutable/nodes/15.vzmU8d6T.js",
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
	"_app/immutable/chunks/CxJSgYGn.js",
	"_app/immutable/chunks/CliavseV.js",
	"_app/immutable/chunks/zdPxcW3D.js",
	"_app/immutable/chunks/k6vOMknB.js",
	"_app/immutable/chunks/DGKeAb96.js",
	"_app/immutable/chunks/BH_J3ZZs.js"
];
const stylesheets = [];
const fonts = [];

//#endregion
export { component, fonts, imports, index, _page_server_ts_exports as server, server_id, stylesheets };
//# sourceMappingURL=15-BZrRdeWS.js.map