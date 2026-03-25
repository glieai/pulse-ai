/**
 * Streaming LLM provider for server-side RAG responses.
 *
 * Mirrors provider.ts structure but returns AsyncIterable<string>
 * instead of Promise<string>. Uses SSE parsing for API providers.
 * CLI providers spawn local subprocesses (Solo Mode).
 */

import type { CliProviderType } from "@pulse/shared";
import { runCliCommand } from "./cli-subprocess";

// ═══════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════

export interface LlmStreamProvider {
	generateStream(system: string, user: string): AsyncIterable<string>;
}

// ═══════════════════════════════════════════════
// SSE PARSER (shared by both providers)
// ═══════════════════════════════════════════════

interface SSEEvent {
	event?: string;
	data: string;
}

async function* parseSSEStream(body: ReadableStream<Uint8Array>): AsyncIterable<SSEEvent> {
	const reader = body.getReader();
	const decoder = new TextDecoder();
	let buffer = "";

	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			buffer += decoder.decode(value, { stream: true });

			const lines = buffer.split("\n");
			buffer = lines.pop() ?? "";

			let currentEvent: string | undefined;
			const currentData: string[] = [];

			for (const line of lines) {
				if (line.startsWith("event: ")) {
					currentEvent = line.slice(7);
				} else if (line.startsWith("data: ")) {
					currentData.push(line.slice(6));
				} else if (line === "") {
					if (currentData.length > 0) {
						yield { event: currentEvent, data: currentData.join("\n") };
					}
					currentEvent = undefined;
					currentData.length = 0;
				}
			}
		}
	} finally {
		reader.releaseLock();
	}
}

// ═══════════════════════════════════════════════
// ANTHROPIC
// ═══════════════════════════════════════════════

class AnthropicStreamProvider implements LlmStreamProvider {
	constructor(
		private apiKey: string,
		private model: string,
	) {}

	async *generateStream(system: string, user: string): AsyncIterable<string> {
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
				stream: true,
				system,
				messages: [{ role: "user", content: user }],
			}),
		});

		if (!res.ok) {
			const body = await res.text().catch(() => "");
			throw new Error(`Anthropic API ${res.status}: ${body || res.statusText}`);
		}

		if (!res.body) throw new Error("Response body is null");
		for await (const chunk of parseSSEStream(res.body)) {
			if (chunk.event === "content_block_delta") {
				const data = JSON.parse(chunk.data);
				if (data.delta?.type === "text_delta" && data.delta.text) {
					yield data.delta.text;
				}
			}
			if (chunk.event === "message_stop") break;
		}
	}
}

// ═══════════════════════════════════════════════
// OPENAI
// ═══════════════════════════════════════════════

class OpenAIStreamProvider implements LlmStreamProvider {
	constructor(
		private apiKey: string,
		private model: string,
	) {}

	async *generateStream(system: string, user: string): AsyncIterable<string> {
		const res = await fetch("https://api.openai.com/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${this.apiKey}`,
			},
			body: JSON.stringify({
				model: this.model,
				max_completion_tokens: 2048,
				stream: true,
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

		if (!res.body) throw new Error("Response body is null");
		for await (const chunk of parseSSEStream(res.body)) {
			if (chunk.data === "[DONE]") break;
			const data = JSON.parse(chunk.data);
			const text = data.choices?.[0]?.delta?.content;
			if (text) yield text;
		}
	}
}

// ═══════════════════════════════════════════════
// CLAUDE CLI (subprocess — Solo Mode)
// ═══════════════════════════════════════════════

class ClaudeCliStreamProvider implements LlmStreamProvider {
	constructor(private model?: string) {}

	async *generateStream(system: string, user: string): AsyncIterable<string> {
		const args = [
			"-p",
			"--system-prompt",
			system,
			"--output-format",
			"text",
			"--no-session-persistence",
		];
		if (this.model) {
			args.push("--model", this.model);
		}
		const output = await runCliCommand("claude", args, user);
		yield output;
	}
}

// ═══════════════════════════════════════════════
// CODEX CLI (subprocess — Solo Mode)
// ═══════════════════════════════════════════════

class CodexCliStreamProvider implements LlmStreamProvider {
	constructor(private model?: string) {}

	async *generateStream(system: string, user: string): AsyncIterable<string> {
		const combined = `${system}\n\n---\n\n${user}`;
		const args = ["exec", "-", "-s", "read-only"];
		if (this.model) {
			args.push("-m", this.model);
		}
		const output = await runCliCommand("codex", args, combined);
		yield output;
	}
}

// ═══════════════════════════════════════════════
// FACTORY
// ═══════════════════════════════════════════════

const DEFAULT_MODELS: Record<string, string> = {
	anthropic: "claude-sonnet-4-5-20250929",
	openai: "gpt-4o",
};

export function createLlmStreamProvider(
	provider: CliProviderType,
	apiKey?: string,
	model?: string,
): LlmStreamProvider {
	switch (provider) {
		case "claude-cli":
			return new ClaudeCliStreamProvider(model);
		case "codex-cli":
			return new CodexCliStreamProvider(model);
		case "anthropic": {
			if (!apiKey) throw new Error("Anthropic API key required");
			return new AnthropicStreamProvider(apiKey, model || DEFAULT_MODELS.anthropic);
		}
		case "openai": {
			if (!apiKey) throw new Error("OpenAI API key required");
			return new OpenAIStreamProvider(apiKey, model || DEFAULT_MODELS.openai);
		}
		default:
			throw new Error(`Unknown provider: ${provider}`);
	}
}
