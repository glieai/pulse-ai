import type { CliProviderType, LlmStatus } from "@pulse/shared";
import { type LlmConfig, type PulseConfig, defaults } from "../config";
import { apiGet } from "../http";

/**
 * Fetch the CLI provider preference from the server.
 * Returns undefined if the server is unreachable or has no preference set.
 */
async function fetchCliPreference(
	apiUrl: string,
	token?: string,
): Promise<CliProviderType | undefined> {
	try {
		const result = await apiGet<{ llm_status: LlmStatus }>(apiUrl, "/org/settings", token);
		return result.llm_status?.cli_provider;
	} catch {
		return undefined;
	}
}

/**
 * Resolve the LLM config by checking the server preference first,
 * falling back to local config, then defaults.
 *
 * Priority: server preference → local config → defaults
 */
export async function resolveLlmConfig(config: PulseConfig): Promise<LlmConfig> {
	const preference = await fetchCliPreference(config.apiUrl, config.token);
	if (preference) {
		return {
			provider: preference,
			model: config.llm?.model ?? defaults.llm.model,
		};
	}
	return config.llm ?? defaults.llm;
}
