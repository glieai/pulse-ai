import Anthropic from "@anthropic-ai/sdk";
import { getAnthropicKey } from "../credentials";
import { parseInsightResponse } from "./parse";
import { SYSTEM_PROMPT, buildUserPrompt } from "./prompt";
import type { GeneratedInsight, InsightContext, LLMProvider } from "./types";

/**
 * SDK-based Anthropic provider. Requires ANTHROPIC_API_KEY env var.
 * For subscription-based usage (Claude Pro Max), use ClaudeCliProvider instead.
 */
export class AnthropicProvider implements LLMProvider {
	private client: Anthropic;
	private model: string;

	constructor(model: string) {
		const apiKey = getAnthropicKey();
		if (!apiKey) {
			throw new Error("AnthropicProvider requires ANTHROPIC_API_KEY env var.");
		}
		this.client = new Anthropic({ apiKey });
		this.model = model;
	}

	async generate(systemPrompt: string, userPrompt: string): Promise<string> {
		const response = await this.client.messages.create({
			model: this.model,
			max_tokens: 2048,
			system: systemPrompt,
			messages: [{ role: "user", content: userPrompt }],
		});

		const text = response.content
			.filter((block): block is Anthropic.TextBlock => block.type === "text")
			.map((block) => block.text)
			.join("");

		if (!text) throw new Error("Anthropic returned empty response");
		return text;
	}

	async generateInsight(context: InsightContext): Promise<GeneratedInsight> {
		const text = await this.generate(SYSTEM_PROMPT, buildUserPrompt(context));
		return parseInsightResponse(text);
	}
}
