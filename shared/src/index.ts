export type {
	GapInsightStructured,
	GapType,
	Insight,
	InsightCreate,
	InsightEnrichment,
	InsightHints,
	InsightKind,
	InsightStatus,
	LlmEnrichment,
	QualitySignals,
	TriggerType,
} from "./types/insight";
export type {
	AiFeatures,
	CliProviderType,
	CliToolsStatus,
	LlmProvider,
	LlmProviderConfig,
	LlmProviderStatus,
	LlmSource,
	LlmStatus,
	Org,
	OrgLlmSettings,
	OrgSettings,
	User,
	UserRole,
} from "./types/org";
export { GAP_INSIGHT_SYSTEM_PROMPT, INSIGHT_SYSTEM_PROMPT } from "./llm/prompt";
export {
	buildGapUserPrompt,
	extractHumanInterventions,
	isNoiseMessage,
	parseGapResponse,
	parseTranscriptTurns,
} from "./llm/gap";
export type {
	GapResponse,
	InterventionWindow,
	TranscriptTurn,
} from "./llm/gap";
export {
	ASK_SYSTEM_PROMPT,
	buildAskUserPrompt,
	formatInsightForContext,
} from "./llm/ask-prompt";
export {
	ENRICHMENT_SYSTEM_PROMPT,
	buildEnrichmentPrompt,
} from "./llm/enrichment-prompt";
export { saveDraft, listDrafts, readDraft, deleteDraft, listAllDraftRepos } from "./drafts";
export type { LocalDraft } from "./drafts";
export { jaccardSimilarity, findDuplicateBySourceFiles } from "./dedup";
export type { DuplicateCandidate, DuplicateMatch } from "./dedup";
export {
	SOLO_ORG_ID,
	SOLO_ORG_NAME,
	SOLO_ORG_SLUG,
	SOLO_USER_EMAIL,
	SOLO_USER_ID,
	SOLO_USER_NAME,
} from "./solo";
