import type { LlmConfig } from "../config";
import { getAnthropicKey, getOpenAIKey } from "../credentials";
import { AnthropicProvider } from "./anthropic";
import { promptLlmSetupCli } from "./auth-flow";
import { ClaudeCliProvider } from "./claude-cli";
import { CodexCliProvider } from "./codex-cli";
import { OpenAIProvider } from "./openai";
import { isClaudeCliAvailable, isCodexCliAvailable } from "./subprocess";
import type { LLMProvider } from "./types";

/**
 * Resolve LLM provider based on explicit config.
 * No waterfall — each provider type maps to exactly one implementation.
 */
export function getProvider(config: LlmConfig): LLMProvider {
	switch (config.provider) {
		case "claude-cli": {
			if (!isClaudeCliAvailable()) {
				throw new Error(
					"Claude Code CLI not found.\nInstall it or choose a different provider in Settings.",
				);
			}
			return new ClaudeCliProvider(config.model);
		}

		case "codex-cli": {
			if (!isCodexCliAvailable()) {
				throw new Error("Codex CLI not found.\nInstall it: npm i -g @openai/codex");
			}
			return new CodexCliProvider(config.model);
		}

		case "anthropic": {
			const key = getAnthropicKey();
			if (!key) {
				throw new Error(
					"Anthropic API key not found.\nSet ANTHROPIC_API_KEY or configure in Settings.",
				);
			}
			return new AnthropicProvider(config.model);
		}

		case "openai": {
			const key = getOpenAIKey();
			if (!key) {
				throw new Error("OpenAI API key not found.\nSet OPENAI_API_KEY or configure in Settings.");
			}
			return new OpenAIProvider(config.model);
		}

		default:
			throw new Error(`Unknown provider: ${config.provider}\nConfigure a provider in Settings.`);
	}
}

/**
 * Try to get an LLM provider. If nothing found, launch
 * the guided setup flow and retry on success.
 */
export async function getProviderWithSetup(config: LlmConfig): Promise<LLMProvider> {
	try {
		return getProvider(config);
	} catch {
		const configured = await promptLlmSetupCli();
		if (!configured) {
			process.exit(1);
		}
		return getProvider(config);
	}
}
