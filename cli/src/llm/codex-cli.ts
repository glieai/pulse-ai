import { parseInsightResponse } from "./parse";
import { SYSTEM_PROMPT, buildUserPrompt } from "./prompt";
import { runSubprocess } from "./subprocess";
import type { GeneratedInsight, InsightContext, LLMProvider } from "./types";

/**
 * LLM provider that spawns `codex` CLI as a subprocess.
 * Uses the user's OpenAI/GPT Teams subscription — no API key needed.
 *
 * Codex has no --system-prompt flag, so system + user prompts are combined.
 * `codex exec -` reads the prompt from stdin.
 * `-s read-only` limits the sandbox to prevent file modifications.
 */
export class CodexCliProvider implements LLMProvider {
	constructor(private model?: string) {}

	async generate(systemPrompt: string, userPrompt: string): Promise<string> {
		const combined = `${systemPrompt}\n\n---\n\n${userPrompt}`;
		const args = ["exec", "-", "-s", "read-only"];

		if (this.model) {
			args.push("-m", this.model);
		}

		const result = await runSubprocess({
			command: "codex",
			args,
			stdin: combined,
			timeoutMs: 120_000,
		});

		if (!result.stdout.trim()) {
			throw new Error("Codex CLI returned empty output");
		}

		return result.stdout.trim();
	}

	async generateInsight(context: InsightContext): Promise<GeneratedInsight> {
		const text = await this.generate(SYSTEM_PROMPT, buildUserPrompt(context));
		return parseInsightResponse(text);
	}
}
