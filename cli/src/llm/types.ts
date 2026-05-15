import type { DuplicateCandidate, InsightKind } from "@pulse/shared";

export interface InsightContext {
	repo: string;
	branch: string;
	transcript: string;
	diff?: string;
	recentCommits?: string;
	sourceFiles?: string[];
	existingInsights?: string;
	commitMessage?: string;
	/**
	 * Raw candidates returned by /context/related — kept alongside the
	 * prompt-formatted `existingInsights` so the watcher can run a
	 * pre-flight dedup check before invoking the LLM.
	 */
	relatedInsights?: DuplicateCandidate[];
}

export interface GeneratedInsight {
	kind: InsightKind;
	title: string;
	body: string;
	structured: Record<string, unknown>;
	sourceFiles?: string[];
}

export interface LLMProvider {
	generateInsight(context: InsightContext): Promise<GeneratedInsight>;
	generate(systemPrompt: string, userPrompt: string): Promise<string>;
}
