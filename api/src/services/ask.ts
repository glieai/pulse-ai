/**
 * RAG service — Ask Pulse.
 *
 * Orchestrates: search (retrieval) → prompt build → LLM stream (generation).
 * Returns sources eagerly + an async stream of tokens.
 */

import type { Insight } from "@pulse/shared";
import { ASK_SYSTEM_PROMPT, buildAskUserPrompt } from "@pulse/shared";
import { HTTPException } from "hono/http-exception";
import { createLlmStreamProvider } from "../llm/provider-stream";
import { getOrgSettings, resolveActiveLlm } from "./org";
import { searchFtsOr } from "./search";

// ═══════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════

export interface AskSource {
	id: string;
	kind: string;
	title: string;
	repo: string;
}

export interface AskResult {
	sources: AskSource[];
	stream: AsyncIterable<string>;
}

// ═══════════════════════════════════════════════
// SERVICE
// ═══════════════════════════════════════════════

const CONTEXT_LIMIT = 10;

export async function askPulse(
	orgId: string,
	query: string,
	repo?: string,
	kind?: string,
): Promise<AskResult> {
	// 1. Search for context (FTS with OR semantics — better recall for natural questions)
	const rows = await searchFtsOr(orgId, query, CONTEXT_LIMIT, repo, kind);
	const insights = rows as unknown as Insight[];

	// 2. Build sources (lightweight metadata for the UI)
	const sources: AskSource[] = insights.map((i) => ({
		id: i.id,
		kind: i.kind,
		title: i.title,
		repo: i.repo,
	}));

	// 3. Build RAG prompts
	const systemPrompt = ASK_SYSTEM_PROMPT;
	const userPrompt = buildAskUserPrompt(query, insights);

	// 4. Resolve LLM — CLI tools first, then API keys
	const settings = await getOrgSettings(orgId);
	const cliProvider = settings.cli_provider;

	if (cliProvider === "claude-cli" || cliProvider === "codex-cli") {
		const llm = createLlmStreamProvider(cliProvider);
		return { sources, stream: llm.generateStream(systemPrompt, userPrompt) };
	}

	// API provider path — needs API key
	const resolved = await resolveActiveLlm(orgId);
	if (!resolved) {
		throw new HTTPException(503, {
			message: "LLM not configured. Select a CLI provider in Settings, or set an API key.",
		});
	}

	const llm = createLlmStreamProvider(resolved.provider, resolved.api_key, resolved.model);
	return { sources, stream: llm.generateStream(systemPrompt, userPrompt) };
}
