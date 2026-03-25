/**
 * LLM provider for server-side insight generation.
 *
 * Uses direct fetch() calls — zero external SDK dependencies.
 * Supports Anthropic (Claude), OpenAI (GPT) APIs, and local CLI tools.
 */

import type { CliProviderType } from "@pulse/shared";
import type { InsightKind } from "@pulse/shared/types/insight";
import { runCliCommand } from "./cli-subprocess";

// ═══════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════

export interface GeneratedInsight {
	kind: InsightKind;
	title: string;
	body: string;
	structured: Record<string, unknown>;
	sourceFiles?: string[];
}

export interface LlmProvider {
	generate(system: string, user: string): Promise<string>;
}

// ═══════════════════════════════════════════════
// ANTHROPIC
// ═══════════════════════════════════════════════

class AnthropicProvider implements LlmProvider {
	constructor(
		private apiKey: string,
		private model: string,
	) {}

	async generate(system: string, user: string): Promise<string> {
		const res = await fetch("https://api.anthropic.com/v1/messages", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-api-key": this.apiKey,
				"anthropic-version": "2023-06-01",
			},
			body: JSON.stringify({
				model: this.model,
				max_tokens: 2048,
				system,
				messages: [{ role: "user", content: user }],
			}),
		});

		if (!res.ok) {
			const body = await res.text().catch(() => "");
			throw new Error(`Anthropic API ${res.status}: ${body || res.statusText}`);
		}

		const data = (await res.json()) as {
			content: Array<{ type: string; text?: string }>;
		};
		const text = data.content
			.filter((b) => b.type === "text" && b.text)
			.map((b) => b.text)
			.join("");

		if (!text) throw new Error("Anthropic returned empty response");
		return text;
	}
}

// ═══════════════════════════════════════════════
// OPENAI
// ═══════════════════════════════════════════════

class OpenAIProvider implements LlmProvider {
	constructor(
		private apiKey: string,
		private model: string,
	) {}

	async generate(system: string, user: string): Promise<string> {
		const res = await fetch("https://api.openai.com/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${this.apiKey}`,
			},
			body: JSON.stringify({
				model: this.model,
				max_completion_tokens: 2048,
				response_format: { type: "json_object" },
				messages: [
					{ role: "system", content: system },
					{ role: "user", content: user },
				],
			}),
		});

		if (!res.ok) {
			const body = await res.text().catch(() => "");
			throw new Error(`OpenAI API ${res.status}: ${body || res.statusText}`);
		}

		const data = (await res.json()) as {
			choices: Array<{ message?: { content?: string } }>;
		};
		const text = data.choices[0]?.message?.content;

		if (!text) throw new Error("OpenAI returned empty response");
		return text;
	}
}

// ═══════════════════════════════════════════════
// CLAUDE CLI (subprocess — Solo Mode)
// ═══════════════════════════════════════════════

class ClaudeCliProvider implements LlmProvider {
	constructor(private model?: string) {}

	async generate(system: string, user: string): Promise<string> {
		const args = [
			"-p",
			"--system-prompt",
			system,
			"--output-format",
			"json",
			"--tools",
			"",
			"--no-session-persistence",
		];
		if (this.model) {
			args.push("--model", this.model);
		}
		const raw = await runCliCommand("claude", args, user, 300_000);
		// --output-format json wraps in { result: ... }
		// result can be a string or object (when --json-schema is used)
		try {
			const wrapper = JSON.parse(raw);
			const result = wrapper.result ?? raw;
			return typeof result === "string" ? result : JSON.stringify(result);
		} catch {
			return raw;
		}
	}
}

// ═══════════════════════════════════════════════
// CODEX CLI (subprocess — Solo Mode)
// ═══════════════════════════════════════════════

class CodexCliProvider implements LlmProvider {
	constructor(private model?: string) {}

	async generate(system: string, user: string): Promise<string> {
		const combined = `${system}\n\n---\n\n${user}`;
		const args = ["exec", "-", "-s", "read-only"];
		if (this.model) {
			args.push("-m", this.model);
		}
		return runCliCommand("codex", args, combined, 300_000);
	}
}

// ═══════════════════════════════════════════════
// FACTORY
// ═══════════════════════════════════════════════

const DEFAULT_MODELS: Record<string, string> = {
	anthropic: "claude-sonnet-4-5-20250929",
	openai: "gpt-4o",
};

export function createLlmProvider(
	provider: CliProviderType,
	apiKey?: string,
	model?: string,
): LlmProvider {
	switch (provider) {
		case "claude-cli":
			return new ClaudeCliProvider(model);
		case "codex-cli":
			return new CodexCliProvider(model);
		case "anthropic": {
			if (!apiKey) throw new Error("Anthropic API key required");
			return new AnthropicProvider(apiKey, model || DEFAULT_MODELS.anthropic);
		}
		case "openai": {
			if (!apiKey) throw new Error("OpenAI API key required");
			return new OpenAIProvider(apiKey, model || DEFAULT_MODELS.openai);
		}
		default:
			throw new Error(`Unknown provider: ${provider}`);
	}
}
