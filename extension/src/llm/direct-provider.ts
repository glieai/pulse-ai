/**
 * Direct LLM provider for the extension — fetch-based, zero SDKs.
 * API-key-only. For subscription-based usage, use ClaudeCliProvider / CodexCliProvider.
 */

import { parseInsightResponse } from "@pulse/cli/llm/parse";
import { SYSTEM_PROMPT, buildUserPrompt } from "@pulse/cli/llm/prompt";
import type { GeneratedInsight, InsightContext } from "@pulse/cli/llm/types";

const DEFAULT_MODELS: Record<string, string> = {
	anthropic: "claude-sonnet-4-5-20250929",
	openai: "gpt-4o",
};

async function callAnthropic(
	apiKey: string,
	model: string,
	system: string,
	user: string,
): Promise<string> {
	const res = await fetch("https://api.anthropic.com/v1/messages", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"anthropic-version": "2023-06-01",
			"x-api-key": apiKey,
		},
		body: JSON.stringify({
			model,
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

async function callOpenAI(
	apiKey: string,
	model: string,
	system: string,
	user: string,
): Promise<string> {
	const res = await fetch("https://api.openai.com/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`,
		},
		body: JSON.stringify({
			model,
			max_tokens: 2048,
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

export async function generateInsightDirect(
	provider: "anthropic" | "openai",
	apiKey: string,
	model: string | undefined,
	context: InsightContext,
): Promise<GeneratedInsight> {
	const resolvedModel = model || DEFAULT_MODELS[provider];
	const userPrompt = buildUserPrompt(context);

	const rawText =
		provider === "anthropic"
			? await callAnthropic(apiKey, resolvedModel, SYSTEM_PROMPT, userPrompt)
			: await callOpenAI(apiKey, resolvedModel, SYSTEM_PROMPT, userPrompt);

	return parseInsightResponse(rawText);
}
