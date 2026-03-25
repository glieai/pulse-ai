/**
 * Server-side insight generation from raw data.
 *
 * This is the "remote generate" path — for external sources (WhatsApp, email,
 * PM tools) that send raw data and let the Pulse API process it with an LLM.
 *
 * Flow: validate → fetch existing (dedup) → build prompt → LLM call → parse → createInsight
 */

import { HTTPException } from "hono/http-exception";
import { INSIGHT_SYSTEM_PROMPT, buildGeneratePrompt, parseInsightResponse } from "../llm/prompt";
import { createLlmProvider } from "../llm/provider";
import type { LlmProvider } from "../llm/provider";
import type { GenerateInput } from "../schemas/generate";
import { createInsight } from "./insight";
import { getOrgSettings, resolveActiveLlm } from "./org";
import { extractKeywords, findRelatedContext, formatContextForPrompt } from "./search";

export async function generateInsight(
	orgId: string,
	authorId: string,
	authorName: string,
	input: GenerateInput,
) {
	// ── 1. Resolve LLM config — CLI tools first, then API keys ───
	const settings = await getOrgSettings(orgId);
	const cliProvider = settings.cli_provider;

	let llm: LlmProvider;

	if (cliProvider === "claude-cli" || cliProvider === "codex-cli") {
		llm = createLlmProvider(cliProvider);
	} else {
		const resolved = await resolveActiveLlm(orgId);
		if (!resolved) {
			throw new HTTPException(503, {
				message: "LLM not configured. Select a CLI provider in Settings, or set an API key.",
			});
		}
		llm = createLlmProvider(resolved.provider, resolved.api_key, resolved.model);
	}

	// ── 2. Fetch related insights (context-aware, multi-signal scoring) ──
	const keywords = input.raw_data ? extractKeywords(input.raw_data.slice(0, 2000)) : "";
	const related = await findRelatedContext(orgId, {
		repo: input.repo,
		branch: input.branch,
		keywords,
		limit: 10,
	});

	const existingInsights = related.length > 0 ? formatContextForPrompt(related) : undefined;

	// ── 3. Build prompt ─────────────────────────────
	const userPrompt = buildGeneratePrompt({
		repo: input.repo,
		branch: input.branch,
		sourceType: input.source_type,
		sourceName: input.source_name,
		rawData: input.raw_data,
		existingInsights,
	});

	// ── 4. Call LLM ─────────────────────────────────
	const rawResponse = await llm.generate(INSIGHT_SYSTEM_PROMPT, userPrompt);

	// ── 5. Parse response ───────────────────────────
	const generated = parseInsightResponse(rawResponse);

	// ── 6. Create insight via existing service ──────
	return createInsight(orgId, authorId, authorName, {
		kind: generated.kind,
		title: generated.title,
		body: generated.body,
		structured: generated.structured,
		repo: input.repo,
		branch: input.branch,
		source_files: generated.sourceFiles,
		session_refs: [
			{
				source_type: input.source_type,
				source_name: input.source_name,
				tool: "api_generate",
			},
		],
		trigger_type: "api",
		status: input.auto_approve ? "published" : "draft",
	});
}
