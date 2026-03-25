import { hostname } from "node:os";
import type { TriggerType } from "@pulse/shared";
import { loadConfig } from "../config";
import { gatherContext } from "../context/gather";
import { getActiveSessionInfo } from "../context/session";
import { getProviderWithSetup } from "../llm/provider";
import { resolveLlmConfig } from "../llm/resolve-provider";
import type { GeneratedInsight } from "../llm/types";
import { banner, info, warn } from "../output";
import { ask, closePrompt } from "../prompt";
import { displayInsight, saveInsightDraft } from "./insight-shared";

function parseTrigger(args: string[]): TriggerType {
	for (const arg of args) {
		if (arg.startsWith("--trigger=")) {
			const value = arg.split("=")[1];
			if (["commit", "size", "manual", "push"].includes(value)) {
				return value as TriggerType;
			}
		}
	}
	return "manual";
}

function isNonInteractive(args: string[]): boolean {
	return args.includes("--non-interactive");
}

export async function insightCommand(args: string[]): Promise<void> {
	const trigger = parseTrigger(args);
	const nonInteractive = isNonInteractive(args);
	const config = loadConfig();

	const llmConfig = await resolveLlmConfig(config);

	banner(`Insight (trigger: ${trigger})`);
	info("Gathering context...");

	const context = await gatherContext(config);

	if (!context.transcript && !context.diff) {
		warn("No conversation transcript or git changes found.");
		info("Start a coding session or make some changes first.");
		return;
	}

	info(
		`Context: ${context.transcript ? "transcript" : "no transcript"}, ${context.diff ? "diff" : "no diff"}, ${context.recentCommits ? "commits" : "no commits"}`,
	);
	info("Generating insight via LLM...");

	const provider = await getProviderWithSetup(llmConfig);
	let insight: GeneratedInsight;

	try {
		insight = await provider.generateInsight(context);
	} catch (err) {
		throw new Error(`LLM generation failed: ${err instanceof Error ? err.message : "unknown"}`);
	}

	displayInsight(insight);

	// Non-interactive mode: auto-approve
	let approved: boolean;
	if (nonInteractive) {
		approved = true;
		info("Auto-approved (non-interactive mode)");
	} else {
		const answer = await ask("Save draft? (y/n)", "y");
		approved = answer.toLowerCase() === "y";

		if (!approved) {
			warn("Insight discarded.");
			closePrompt();
			return;
		}
	}

	// Build session refs for tracking
	const sessionInfo = getActiveSessionInfo(process.cwd());
	const sessionRefs = sessionInfo
		? [{ session_id: sessionInfo.sessionId, device: hostname(), tool: "cli" }]
		: undefined;

	try {
		await saveInsightDraft(
			config,
			insight,
			{
				branch: context.branch,
				triggerType: trigger,
				sessionRefs,
			},
			provider,
		);
	} catch (err) {
		throw new Error(`Failed to save draft: ${err instanceof Error ? err.message : "unknown"}`);
	}

	closePrompt();
}

// Backward compat: git hooks call `pulse generate` which resolves to `generateCommand`
export const generateCommand = insightCommand;
