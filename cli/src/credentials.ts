import { isClaudeCliAvailable, isCodexCliAvailable } from "./llm/subprocess";

// --- Types ---

export interface CredentialReport {
	anthropic: { source: "env" | "claude-cli" | null; available: boolean };
	openai: { source: "env" | "codex-cli" | null; available: boolean };
}

// --- Env var readers ---

export function getAnthropicKey(): string | undefined {
	return process.env.ANTHROPIC_API_KEY;
}

export function getOpenAIKey(): string | undefined {
	return process.env.OPENAI_API_KEY;
}

// --- Credential report for UI ---

/**
 * Detect all available LLM providers and report their sources.
 * Used by `pulse init` and `pulse config` for display.
 */
export function detectCredentials(): CredentialReport {
	const anthropicKey = getAnthropicKey();
	const openaiKey = getOpenAIKey();

	return {
		anthropic: {
			source: anthropicKey ? "env" : isClaudeCliAvailable() ? "claude-cli" : null,
			available: !!(anthropicKey || isClaudeCliAvailable()),
		},
		openai: {
			source: openaiKey ? "env" : isCodexCliAvailable() ? "codex-cli" : null,
			available: !!(openaiKey || isCodexCliAvailable()),
		},
	};
}
