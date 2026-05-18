import { hostname } from "node:os";
import {
	GAP_INSIGHT_SYSTEM_PROMPT,
	type InsightCreate,
	type TriggerType,
	findDuplicateBySourceFiles,
	gapResponseToInsightCreate,
	generateGapInsights,
} from "@pulse/shared";
import { loadConfig } from "../config";
import { gatherContext } from "../context/gather";
import { getActiveSessionInfo } from "../context/session";
import { apiPost } from "../http";
import { getProviderWithSetup } from "../llm/provider";
import { resolveLlmConfig } from "../llm/resolve-provider";
import type { GeneratedInsight } from "../llm/types";
import { banner, info, success, warn } from "../output";
import { ask, closePrompt } from "../prompt";
import { displayInsight, saveInsightDraft } from "./insight-shared";

// Same threshold as the extension watcher — see watcher.ts for rationale.
const DEDUP_JACCARD_THRESHOLD = 0.5;

type InsightMode = "legacy" | "gap" | "both";

function getInsightMode(): InsightMode {
	const raw = process.env.PULSE_INSIGHT_MODE ?? "legacy";
	return raw === "gap" || raw === "both" ? raw : "legacy";
}

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

	// Pre-flight dedup for automatic triggers only. Manual `pulse insight`
	// always proceeds — the user explicitly invoked it.
	if (trigger !== "manual" && context.sourceFiles?.length && context.relatedInsights?.length) {
		const dup = findDuplicateBySourceFiles(
			context.sourceFiles,
			context.relatedInsights,
			DEDUP_JACCARD_THRESHOLD,
		);
		if (dup) {
			info(
				`Skipped duplicate (jaccard=${dup.score.toFixed(2)}) — covered by "${dup.title}" [${dup.id.slice(0, 8)}]`,
			);
			return;
		}
	}

	info(
		`Context: ${context.transcript ? "transcript" : "no transcript"}, ${context.diff ? "diff" : "no diff"}, ${context.recentCommits ? "commits" : "no commits"}`,
	);

	const provider = await getProviderWithSetup(llmConfig);
	const mode = getInsightMode();

	// Gap-extraction pipeline — one draft per human-intervention window.
	// Runs in `gap` and `both` modes; in `both` the legacy flow runs after.
	if (mode === "gap" || mode === "both") {
		if (!context.transcript) {
			warn("Gap mode requires a session transcript — skipping gap extraction");
		} else {
			info("Generating gap insights from transcript windows...");
			const sessionInfo = getActiveSessionInfo(process.cwd());
			const sessionRefs = sessionInfo
				? [{ session_id: sessionInfo.sessionId, device: hostname(), tool: "cli" }]
				: undefined;
			const result = await generateGapInsights(
				(systemPrompt, userPrompt) => provider.generate(systemPrompt, userPrompt),
				GAP_INSIGHT_SYSTEM_PROMPT,
				context.transcript,
				{
					onProgress: (idx, total) => info(`  gap ${idx}/${total}…`),
				},
			);
			for (const { response, privacyConcerns } of result.captured) {
				const payload: InsightCreate = gapResponseToInsightCreate(response, {
					repo: config.repo,
					branch: context.branch,
					triggerType: trigger,
					sourceFiles: context.sourceFiles,
					sessionRefs,
					privacyConcerns,
				});
				await apiPost(config.apiUrl, "/insights", payload, config.token);
			}
			success(
				`Gap pipeline: ${result.captured.length} captured · ${result.rejected.length} rejected · ${result.errors.length} errors`,
			);
		}
		if (mode === "gap") {
			closePrompt();
			return;
		}
	}

	info("Generating insight via LLM...");
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
