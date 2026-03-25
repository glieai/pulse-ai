import type { InsightCreate, InsightEnrichment, InsightHints } from "@pulse/shared";
import type { PulseConfig } from "../config";
import { apiPost } from "../http";
import { generateEmbedding } from "../llm/embedding";
import { enrichInsightClient } from "../llm/enrich";
import type { LLMProvider } from "../llm/types";
import type { GeneratedInsight } from "../llm/types";
import { c, info, kindBadge, success, warn } from "../output";

export function displayInsight(insight: GeneratedInsight): void {
	console.log("");
	console.log(`  ${kindBadge(insight.kind)} ${c.bold(insight.title)}`);
	console.log("");
	for (const line of insight.body.split("\n")) {
		console.log(`  ${c.dim(line)}`);
	}
	console.log("");

	if (Object.keys(insight.structured).length > 0) {
		console.log(`  ${c.cyan("Structured:")}`);
		for (const [key, value] of Object.entries(insight.structured)) {
			if (Array.isArray(value)) {
				console.log(`    ${c.dim(key)}:`);
				for (const item of value) {
					if (typeof item === "object" && item !== null) {
						const obj = item as Record<string, unknown>;
						const parts = Object.entries(obj)
							.map(([k, v]) => `${k}: ${v}`)
							.join(", ");
						console.log(`      - ${c.dim(parts)}`);
					} else {
						console.log(`      - ${c.dim(String(item))}`);
					}
				}
			} else {
				const display =
					typeof value === "object" && value !== null
						? JSON.stringify(value, null, 2)
						: String(value);
				console.log(`    ${c.dim(key)}: ${display}`);
			}
		}
		console.log("");
	}

	if (insight.sourceFiles?.length) {
		console.log(`  ${c.cyan("Files:")} ${c.dim(insight.sourceFiles.join(", "))}`);
		console.log("");
	}
}

interface SavedInsightResponse {
	id: string;
	enrichment?: InsightEnrichment;
	hints?: InsightHints;
	[key: string]: unknown;
}

export async function saveInsightDraft(
	config: PulseConfig,
	insight: GeneratedInsight,
	extra: {
		branch?: string;
		triggerType: InsightCreate["trigger_type"];
		sessionRefs?: Record<string, unknown>[];
	},
	llmProvider?: LLMProvider,
): Promise<void> {
	info("Generating embedding...");
	let embedding: number[] | undefined;
	try {
		embedding = await generateEmbedding(`${insight.title}\n${insight.body}`);
		if (embedding) {
			success("Embedding generated");
		} else {
			info("No OPENAI_API_KEY — skipping embedding");
		}
	} catch (err) {
		warn(`Embedding failed: ${err instanceof Error ? err.message : "unknown"}`);
	}

	info("Saving draft...");
	const payload: InsightCreate = {
		kind: insight.kind,
		title: insight.title,
		body: insight.body,
		structured: insight.structured,
		embedding,
		repo: config.repo,
		branch: extra.branch,
		source_files: insight.sourceFiles,
		session_refs: extra.sessionRefs,
		trigger_type: extra.triggerType,
		status: "draft",
	};

	const response = await apiPost<SavedInsightResponse>(
		config.apiUrl,
		"/insights",
		payload,
		config.token,
	);
	success("Draft saved — will be published on next 'pulse push'");

	// Client-side LLM enrichment (best-effort, only if provider + enrichment enabled)
	if (
		llmProvider &&
		response.id &&
		response.hints?.enrichment_enabled &&
		response.enrichment?.related_ids?.length
	) {
		info("Enriching insight with LLM...");
		const result = await enrichInsightClient(
			llmProvider,
			{
				id: response.id,
				kind: insight.kind,
				title: insight.title,
				body: insight.body,
				structured: insight.structured,
			},
			response.enrichment.related_ids,
			{ apiUrl: config.apiUrl, token: config.token },
		);

		if (result?.quality_score) {
			success(`Enriched (quality: ${result.quality_score}/10)`);
		}
	}
}
