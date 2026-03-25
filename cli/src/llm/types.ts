import type { InsightKind } from "@pulse/shared";

export interface InsightContext {
	repo: string;
	branch: string;
	transcript: string;
	diff?: string;
	recentCommits?: string;
	sourceFiles?: string[];
	existingInsights?: string;
	commitMessage?: string;
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
