import OpenAI from "openai";
import { getOpenAIKey } from "../credentials";
import { parseInsightResponse } from "./parse";
import { SYSTEM_PROMPT, buildUserPrompt } from "./prompt";
import type { GeneratedInsight, InsightContext, LLMProvider } from "./types";

/**
 * SDK-based OpenAI provider. Requires OPENAI_API_KEY env var.
 * For subscription-based usage (GPT Teams), use CodexCliProvider instead.
 */
export class OpenAIProvider implements LLMProvider {
	private client: OpenAI;
	private model: string;

	constructor(model: string) {
		const apiKey = getOpenAIKey();
		if (!apiKey) {
			throw new Error("OpenAIProvider requires OPENAI_API_KEY env var.");
		}
		this.client = new OpenAI({ apiKey });
		this.model = model;
	}

	async generate(systemPrompt: string, userPrompt: string): Promise<string> {
		const response = await this.client.chat.completions.create({
			model: this.model,
			max_tokens: 2048,
			messages: [
				{ role: "system", content: systemPrompt },
				{ role: "user", content: userPrompt },
			],
		});

		const text = response.choices[0]?.message?.content;
		if (!text) throw new Error("OpenAI returned empty response");
		return text;
	}

	async generateInsight(context: InsightContext): Promise<GeneratedInsight> {
		const response = await this.client.chat.completions.create({
			model: this.model,
			max_tokens: 2048,
			response_format: { type: "json_object" },
			messages: [
				{ role: "system", content: SYSTEM_PROMPT },
				{ role: "user", content: buildUserPrompt(context) },
			],
		});

		const text = response.choices[0]?.message?.content;
		if (!text) throw new Error("OpenAI returned empty response");
		return parseInsightResponse(text);
	}
}
