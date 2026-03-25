import { SYSTEM_PROMPT, buildUserPrompt } from "@pulse/cli/llm/prompt";
import type { GeneratedInsight, InsightContext } from "@pulse/cli/llm/types";
import * as vscode from "vscode";
import { parseInsightResponse } from "./parse";

const MODEL_PREFERENCE: vscode.LanguageModelChatSelector[] = [
	{ family: "claude-sonnet-4" },
	{ family: "claude-3.5-sonnet" },
	{ family: "gpt-4o" },
];

let cachedModel: vscode.LanguageModelChat | undefined;

/**
 * Register listener to invalidate model cache when available models change.
 * Call this once from activate().
 */
export function registerModelChangeListener(): vscode.Disposable {
	return vscode.lm.onDidChangeChatModels(() => {
		cachedModel = undefined;
	});
}

async function selectModel(): Promise<vscode.LanguageModelChat> {
	if (cachedModel) return cachedModel;

	// Try preferred models in order
	for (const selector of MODEL_PREFERENCE) {
		const models = await vscode.lm.selectChatModels(selector);
		if (models.length > 0) {
			cachedModel = models[0];
			return cachedModel;
		}
	}

	// Fallback: any available model
	const all = await vscode.lm.selectChatModels({});
	if (all.length > 0) {
		cachedModel = all[0];
		return cachedModel;
	}

	throw new Error("No language models available. Install GitHub Copilot or another LM provider.");
}

/**
 * Generate an insight using VS Code's Language Model API.
 * Uses whatever LLM the user has available (Copilot, Claude Code, etc.)
 */
export async function generateInsightVscodeLm(context: InsightContext): Promise<GeneratedInsight> {
	const model = await selectModel();

	const messages = [
		vscode.LanguageModelChatMessage.User(SYSTEM_PROMPT),
		vscode.LanguageModelChatMessage.User(buildUserPrompt(context)),
	];

	const response = await model.sendRequest(messages, {
		justification:
			"Pulse uses LLM to generate development knowledge insights from your coding session.",
	});

	// Collect streaming response
	const parts: string[] = [];
	for await (const fragment of response.text) {
		parts.push(fragment);
	}

	const fullText = parts.join("");
	return parseInsightResponse(fullText);
}
