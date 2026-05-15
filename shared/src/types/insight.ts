export type InsightKind = "decision" | "dead_end" | "pattern" | "context" | "progress" | "business";

export type InsightStatus = "draft" | "published";

export type TriggerType = "commit" | "size" | "manual" | "push" | "api";

export interface QualitySignals {
	has_alternatives: boolean;
	has_source_files: boolean;
	has_structured: boolean;
	body_length: number;
	is_self_contained: boolean;
}

export interface LlmEnrichment {
	contradiction_analysis?: string;
	suggested_links?: string[];
	quality_score?: number;
	enriched_at: string;
}

export interface InsightEnrichment {
	quality_signals: QualitySignals;
	related_ids?: string[];
	supersedes_id?: string;
	superseded_by_id?: string;
	contradicts_ids?: string[];
	llm_enrichment?: LlmEnrichment;
	enriched_at: string;
}

export interface InsightHints {
	missing?: string[];
	supersedes_id?: string;
	related_count: number;
	enrichment_enabled?: boolean;
}

export interface Insight {
	id: string;
	org_id: string;
	kind: InsightKind;
	title: string;
	body: string;
	structured: Record<string, unknown>;
	embedding?: number[];
	repo: string;
	branch?: string;
	source_files?: string[];
	commit_hashes?: string[];
	session_refs?: Record<string, unknown>[];
	author_id: string;
	author_name?: string;
	trigger_type: TriggerType;
	status: InsightStatus;
	content_hash: string;
	enrichment?: InsightEnrichment;
	supersedes_id?: string;
	created_at: string;
}

export interface InsightCreate {
	kind: InsightKind;
	title: string;
	body: string;
	structured?: Record<string, unknown>;
	embedding?: number[];
	repo: string;
	branch?: string;
	source_files?: string[];
	commit_hashes?: string[];
	session_refs?: Record<string, unknown>[];
	trigger_type: TriggerType;
	status?: InsightStatus;
}
