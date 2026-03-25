import { hostname } from "node:os";
import { loadConfig } from "../config";
import { gatherGitContext } from "../context/git";
import {
	getAllActiveSessions,
	getSessionTitle,
	getSessionTranscriptExpanded,
} from "../context/session";
import { apiPost } from "../http";
import { getProviderWithSetup } from "../llm/provider";
import { resolveLlmConfig } from "../llm/resolve-provider";
import type { GeneratedInsight, InsightContext } from "../llm/types";
import { banner, c, info, warn } from "../output";
import { ask, closePrompt } from "../prompt";
import { displayInsight, saveInsightDraft } from "./insight-shared";

function parseSessionArg(args: string[]): string | undefined {
	for (const arg of args) {
		if (!arg.startsWith("--")) return arg;
	}
	return undefined;
}

function isListMode(args: string[]): boolean {
	return args.includes("--list") || args.includes("-l");
}

function isNonInteractive(args: string[]): boolean {
	return args.includes("--non-interactive");
}

async function listSessions(): Promise<void> {
	const sessions = getAllActiveSessions(process.cwd(), 7 * 24 * 3600_000);
	if (sessions.length === 0) {
		warn("No sessions found.");
		info("Start a coding session first.");
		return;
	}

	console.log("");
	console.log(`  ${c.bold("Available sessions")} (last 7 days)`);
	console.log("");
	for (const s of sessions) {
		const title = getSessionTitle(s.filePath);
		const sizeKb = Math.round(s.size / 1024);
		const titleStr = title ? c.dim(` — ${title}`) : "";
		console.log(`  ${c.cyan(s.sessionId)}  ${c.dim(`${sizeKb} KB`)}${titleStr}`);
	}
	console.log("");
	info("Usage: pulse reflect <session-id>");
}

export async function reflectCommand(args: string[]): Promise<void> {
	if (isListMode(args)) {
		await listSessions();
		return;
	}

	const sessionArg = parseSessionArg(args);
	const nonInteractive = isNonInteractive(args);
	const config = loadConfig();
	const llmConfig = await resolveLlmConfig(config);
	const cwd = process.cwd();

	banner("Reflect");

	// Resolve session
	info(sessionArg ? `Loading session ${sessionArg}...` : "Loading most recent session...");

	const result = getSessionTranscriptExpanded(cwd, sessionArg);
	if (!result || !result.transcript) {
		if (sessionArg) {
			warn(`Session "${sessionArg}" not found.`);
			info("Run 'pulse reflect --list' to see available sessions.");
		} else {
			warn("No session transcript found.");
			info("Start a coding session first.");
		}
		return;
	}

	const { transcript, sessionId } = result;
	const transcriptKb = Math.round(transcript.length / 1024);
	info(`Session ${c.cyan(sessionId)} — ${transcriptKb} KB of context`);

	// Gather git context
	const git = gatherGitContext();

	// Fetch related insights — all signals combined in a single unified call
	let existingInsights = "";
	try {
		const data = await apiPost<{
			insights: Array<{
				kind: string;
				title: string;
				body_excerpt: string;
				branch: string | null;
				source_files: string[] | null;
				status: string;
				score: number;
			}>;
		}>(
			config.apiUrl,
			"/context/related",
			{
				repo: config.repo || git.repo,
				branch: git.branch,
				source_files: git.sourceFiles.length > 0 ? git.sourceFiles : undefined,
				recent_commits: git.recentCommits || undefined,
				session_id: sessionId,
				limit: 15,
			},
			config.token,
		);
		if (data.insights.length > 0) {
			const formatted = data.insights
				.map((i) => {
					const meta: string[] = [];
					if (i.branch) meta.push(`branch: ${i.branch}`);
					if (i.source_files?.length) {
						meta.push(`files: ${i.source_files.slice(0, 3).join(", ")}`);
					}
					if (i.status === "draft") meta.push("draft");
					const metaStr = meta.length > 0 ? `  (${meta.join(", ")})` : "";
					const excerpt = i.body_excerpt.length >= 300 ? `${i.body_excerpt}...` : i.body_excerpt;
					return `### [${i.kind.toUpperCase()}] ${i.title}${metaStr}\n${excerpt}`;
				})
				.join("\n\n");
			existingInsights = `## Existing Insights — DO NOT REPEAT\n\n${formatted}`;
			info(`${data.insights.length} related insights loaded (session + files + branch + keywords)`);
		}
	} catch {
		// Not critical — proceed without existing insights
	}

	// Build context for LLM
	const context: InsightContext = {
		repo: config.repo || git.repo,
		branch: git.branch,
		transcript,
		diff: git.diff || undefined,
		recentCommits: git.recentCommits || undefined,
		sourceFiles: git.sourceFiles.length > 0 ? git.sourceFiles : undefined,
		existingInsights: existingInsights || undefined,
	};

	info("Generating insight via LLM...");

	const provider = await getProviderWithSetup(llmConfig);
	let insight: GeneratedInsight;

	try {
		insight = await provider.generateInsight(context);
	} catch (err) {
		throw new Error(`LLM generation failed: ${err instanceof Error ? err.message : "unknown"}`);
	}

	displayInsight(insight);

	// Approval
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

	// Save with session tracking
	const sessionRefs = [{ session_id: sessionId, device: hostname(), tool: "cli" }];

	try {
		await saveInsightDraft(
			config,
			insight,
			{
				branch: context.branch,
				triggerType: "manual",
				sessionRefs,
			},
			provider,
		);
	} catch (err) {
		throw new Error(`Failed to save draft: ${err instanceof Error ? err.message : "unknown"}`);
	}

	closePrompt();
}
