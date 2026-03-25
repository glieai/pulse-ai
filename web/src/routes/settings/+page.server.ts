import { ApiError, apiDelete, apiGet, apiPatch, apiPost, apiPut } from "$lib/api";
import type { AiFeatures, LlmStatus, OrgSettings } from "@pulse/shared";
import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, fetch }) => {
	let llm: OrgSettings["llm"] | null = null;
	let aiFeatures: AiFeatures | null = null;
	let llmStatus: LlmStatus | null = null;

	if (locals.token) {
		try {
			const result = await apiGet<{
				settings: OrgSettings;
				llm_status: LlmStatus;
			}>(fetch, "/api/org/settings", locals.token);
			llm = result.settings?.llm ?? null;
			aiFeatures = result.settings?.ai_features ?? null;
			llmStatus = result.llm_status ?? null;
		} catch {
			// Settings not available — show as unconfigured
		}
	}

	return {
		user: locals.user,
		llm,
		aiFeatures,
		llmStatus,
	};
};

export const actions = {
	upsertProvider: async ({ request, locals, fetch }) => {
		if (!locals.token) {
			return fail(401, { llmError: "Unauthorized" });
		}

		const data = await request.formData();
		const provider = data.get("provider") as string;
		const apiKey = data.get("api_key") as string;
		const model = data.get("model") as string;

		if (!provider || (provider !== "anthropic" && provider !== "openai")) {
			return fail(400, { llmError: "Invalid provider." });
		}

		const body: Record<string, string> = {};
		if (apiKey) body.api_key = apiKey;
		if (model) body.model = model;

		if (!body.api_key && !body.model) {
			return fail(400, { llmError: "API key or model is required." });
		}

		try {
			await apiPut(fetch, `/api/org/settings/llm/providers/${provider}`, body, locals.token);
			return { llmSaved: true };
		} catch (err) {
			if (err instanceof ApiError) {
				return fail(err.status, { llmError: err.message });
			}
			return fail(500, { llmError: "Failed to save provider settings" });
		}
	},

	removeProvider: async ({ request, locals, fetch }) => {
		if (!locals.token) {
			return fail(401, { llmError: "Unauthorized" });
		}

		const data = await request.formData();
		const provider = data.get("provider") as string;

		if (!provider || (provider !== "anthropic" && provider !== "openai")) {
			return fail(400, { llmError: "Invalid provider." });
		}

		try {
			await apiDelete(fetch, `/api/org/settings/llm/providers/${provider}`, locals.token);
			return { llmSaved: true };
		} catch (err) {
			if (err instanceof ApiError) {
				return fail(err.status, { llmError: err.message });
			}
			return fail(500, { llmError: "Failed to remove provider" });
		}
	},

	setActive: async ({ request, locals, fetch }) => {
		if (!locals.token) {
			return fail(401, { llmError: "Unauthorized" });
		}

		const data = await request.formData();
		const activeProvider = data.get("active_provider") as string;

		if (!activeProvider || (activeProvider !== "anthropic" && activeProvider !== "openai")) {
			return fail(400, { llmError: "Invalid provider." });
		}

		try {
			await apiPatch(
				fetch,
				"/api/org/settings/llm/active",
				{ active_provider: activeProvider },
				locals.token,
			);
			return { llmSaved: true };
		} catch (err) {
			if (err instanceof ApiError) {
				return fail(err.status, { llmError: err.message });
			}
			return fail(500, { llmError: "Failed to set active provider" });
		}
	},

	setCliProvider: async ({ request, locals, fetch }) => {
		if (!locals.token) {
			return fail(401, { llmError: "Unauthorized" });
		}

		const data = await request.formData();
		const cliProvider = data.get("cli_provider") as string;
		const valid = ["claude-cli", "codex-cli", "anthropic", "openai"];

		if (!cliProvider || !valid.includes(cliProvider)) {
			return fail(400, { llmError: "Invalid provider." });
		}

		try {
			await apiPatch(
				fetch,
				"/api/org/settings/cli-provider",
				{ cli_provider: cliProvider },
				locals.token,
			);
			return { providerSaved: true };
		} catch (err) {
			if (err instanceof ApiError) {
				return fail(err.status, { llmError: err.message });
			}
			return fail(500, { llmError: "Failed to set provider" });
		}
	},

	installCliTool: async ({ request, locals, fetch }) => {
		if (!locals.token) {
			return fail(401, { installError: "Unauthorized" });
		}

		const data = await request.formData();
		const tool = data.get("tool") as string;

		if (!tool || (tool !== "claude" && tool !== "codex")) {
			return fail(400, { installError: "Invalid tool." });
		}

		try {
			await apiPost(fetch, "/api/org/cli-tools/install", { tool }, locals.token);
			return { installSuccess: tool };
		} catch (err) {
			if (err instanceof ApiError) {
				return fail(err.status, { installError: err.message });
			}
			return fail(500, { installError: `Failed to install ${tool}` });
		}
	},

	saveAiFeatures: async ({ request, locals, fetch }) => {
		if (!locals.token) {
			return fail(401, { error: "Unauthorized" });
		}

		const data = await request.formData();
		const enrichmentEnabled = data.get("enrichment_enabled") === "on";

		try {
			await apiPatch(
				fetch,
				"/api/org/settings/ai",
				{ enrichment_enabled: enrichmentEnabled },
				locals.token,
			);
			return { aiSaved: true };
		} catch (err) {
			if (err instanceof ApiError) {
				return fail(err.status, { aiError: err.message });
			}
			return fail(500, { aiError: "Failed to save AI features" });
		}
	},
} satisfies Actions;
