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
import { banner, info, success, warn } from "../output";
import { closePrompt } from "../prompt";

// Same threshold as the extension watcher — see watcher.ts for rationale.
const DEDUP_JACCARD_THRESHOLD = 0.5;

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

	if (!context.transcript) {
		warn("No transcript — nothing to extract.");
		closePrompt();
		return;
	}

	const provider = await getProviderWithSetup(llmConfig);
	const sessionInfo = getActiveSessionInfo(process.cwd());
	const sessionRefs = sessionInfo
		? [{ session_id: sessionInfo.sessionId, device: hostname(), tool: "cli" }]
		: undefined;

	info("Extracting gaps from transcript windows...");
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
		`Gaps captured: ${result.captured.length} · rejected: ${result.rejected.length} · errors: ${result.errors.length}`,
	);

	// Suppress unused-variable warning during transition — nonInteractive still
	// parsed for backwards compat with hooks that pass --non-interactive.
	void nonInteractive;

	closePrompt();
}

// Backward compat: git hooks call `pulse generate` which resolves to `generateCommand`
export const generateCommand = insightCommand;
