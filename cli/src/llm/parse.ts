import type { GeneratedInsight } from "./types";

/**
 * Parse raw LLM text into a structured GeneratedInsight.
 * Handles markdown code block wrapping and validates required fields.
 *
 * Used by: AnthropicProvider, OpenAIProvider, ClaudeCliProvider, CodexCliProvider, extension.
 */
export function parseInsightResponse(text: string): GeneratedInsight {
	let json = text.trim();

	// Strip markdown code blocks if present (```json ... ``` or ``` ... ```)
	if (json.startsWith("```")) {
		json = json.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
	}

	// If the response doesn't start with '{', try to extract JSON from prose
	if (!json.startsWith("{")) {
		const match = json.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
		if (match) {
			json = match[1];
		} else {
			// Last resort: find the first { ... } block
			const start = json.indexOf("{");
			const end = json.lastIndexOf("}");
			if (start !== -1 && end > start) {
				json = json.slice(start, end + 1);
			}
		}
	}

	const parsed = JSON.parse(json);

	if (!parsed.kind || !parsed.title || !parsed.body) {
		throw new Error("LLM response missing required fields (kind, title, body)");
	}

	return {
		kind: parsed.kind,
		title: parsed.title,
		body: parsed.body,
		structured: parsed.structured ?? {},
		sourceFiles: parsed.sourceFiles,
	};
}
