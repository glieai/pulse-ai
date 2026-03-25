export type UserRole = "owner" | "admin" | "member";

export type Plan = "free" | "pro" | "enterprise";

export type LlmProvider = "anthropic" | "openai";

/** Per-provider credentials stored in org settings */
export interface LlmProviderConfig {
	api_key: string;
	model?: string;
}

/** Multi-provider org LLM settings (stored in DB JSONB) */
export interface OrgLlmSettings {
	providers: Partial<Record<LlmProvider, LlmProviderConfig>>;
	active_provider: LlmProvider;
}

export interface AiFeatures {
	enrichment_enabled: boolean;
}

export type CliProviderType = "claude-cli" | "codex-cli" | "anthropic" | "openai";

export interface OrgSettings {
	llm?: OrgLlmSettings;
	ai_features?: AiFeatures;
	cli_provider?: CliProviderType;
}

// ─── LLM Status (returned by GET /api/org/settings) ───

export type LlmSource = "env" | "org_settings" | "pulse_env";

export interface LlmProviderStatus {
	available: boolean;
	source: LlmSource | null;
	api_key?: string; // redacted, only for org_settings
	model?: string;
}

export interface CliToolsStatus {
	claude_cli: boolean;
	codex_cli: boolean;
}

export interface LlmStatus {
	anthropic: LlmProviderStatus;
	openai: LlmProviderStatus;
	active_provider: LlmProvider | null;
	cli_tools?: CliToolsStatus;
	cli_provider?: CliProviderType;
}

export interface Org {
	id: string;
	name: string;
	slug: string;
	plan: Plan;
	settings: OrgSettings;
	created_at: string;
}

export interface User {
	id: string;
	org_id: string;
	name: string;
	email: string;
	role: UserRole;
	created_at: string;
}
