import { parseInsightResponse } from "./parse";
import { SYSTEM_PROMPT, buildUserPrompt } from "./prompt";
import { runSubprocess } from "./subprocess";
import type { GeneratedInsight, InsightContext, LLMProvider } from "./types";

/**
 * LLM provider that spawns `claude` CLI as a subprocess.
 * Uses the user's Claude subscription — no API key needed.
 *
 * Flags:
 * - `-p`: non-interactive print mode
 * - `--system-prompt`: separate system prompt
 * - `--max-turns 1`: single generation, no agentic loops
 * - `--tools ""`: disable all tools, pure text generation
 * - `--output-format text`: raw LLM output to stdout
 * - `--no-session-persistence`: ephemeral, no session saved
 */
export class ClaudeCliProvider implements LLMProvider {
	constructor(
		private model?: string,
		private binaryPath?: string,
	) {}

	async generate(systemPrompt: string, userPrompt: string): Promise<string> {
		const args = [
			"-p",
			"--system-prompt",
			systemPrompt,
			"--max-turns",
			"1",
			"--tools",
			"",
			"--output-format",
			"text",
			"--no-session-persistence",
		];

		if (this.model) {
			args.push("--model", this.model);
		}

		const result = await runSubprocess({
			command: this.binaryPath ?? "claude",
			args,
			stdin: userPrompt,
			timeoutMs: 120_000,
		});

		if (!result.stdout.trim()) {
			throw new Error("Claude CLI returned empty output");
		}

		return result.stdout.trim();
	}

	async generateInsight(context: InsightContext): Promise<GeneratedInsight> {
		const text = await this.generate(SYSTEM_PROMPT, buildUserPrompt(context));
		return parseInsightResponse(text);
	}
}
