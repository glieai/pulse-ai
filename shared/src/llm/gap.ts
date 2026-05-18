/**
 * Gap-extraction helpers.
 *
 * The flow:
 *   1. parseTranscriptTurns(transcript)   → ordered list of (role, text)
 *   2. extractHumanInterventions(turns)   → array of windows around each human turn
 *   3. buildGapUserPrompt(window)         → string to send as user message
 *   4. (LLM call with GAP_INSIGHT_SYSTEM_PROMPT)
 *   5. parseGapResponse(raw)              → GapResponse | null
 *
 * The transcript format expected here matches what `formatTranscript`
 * produces in @pulse/cli/context/session: alternating `[USER] ...` and
 * `[ASSISTANT] ...` blocks separated by blank lines.
 */

import type { GapInsightStructured, GapType, InsightCreate, TriggerType } from "../types/insight";

// ─── Types ────────────────────────────────────────

export interface TranscriptTurn {
	role: "user" | "assistant";
	text: string;
}

export interface InterventionWindow {
	idx: number; // 1-based index among human turns
	human_text: string;
	before: TranscriptTurn[];
	after: TranscriptTurn[];
}

export type GapResponse =
	| ({ rejected: false } & GapInsightStructured & {
				title: string;
				for_next_session: string;
			})
	| { rejected: true; reason: string };

// ─── Parsing ──────────────────────────────────────

const TURN_PREFIX_RE = /^\[(USER|ASSISTANT)\]\s*/i;

/** Parse a formatted transcript ([USER] ... / [ASSISTANT] ...) into turns. */
export function parseTranscriptTurns(transcript: string): TranscriptTurn[] {
	if (!transcript || !transcript.trim()) return [];
	const turns: TranscriptTurn[] = [];
	let currentRole: TranscriptTurn["role"] | null = null;
	let buf: string[] = [];

	const flush = () => {
		if (currentRole && buf.length > 0) {
			const text = buf.join("\n").trim();
			if (text) turns.push({ role: currentRole, text });
		}
		buf = [];
	};

	for (const raw of transcript.split("\n")) {
		const line = raw.trimEnd();
		const match = line.match(TURN_PREFIX_RE);
		if (match) {
			flush();
			currentRole = match[1].toLowerCase() === "user" ? "user" : "assistant";
			buf.push(line.slice(match[0].length));
		} else if (currentRole) {
			buf.push(line);
		}
	}
	flush();
	return turns;
}

// ─── Window extraction ────────────────────────────

/**
 * Heuristic: messages that are not real interventions. We try to reject
 * these BEFORE the LLM call to save tokens; the LLM rejects further with
 * its own filter for anything that slips through.
 */
const NOISE_PATTERNS: RegExp[] = [
	/^(ok|okay|yes|yep|sim|claro|perfect|perfeito|certo|done|ready|nice|great|good|optimo|óptimo|fixe)[\s.!?]*$/i,
	/^(continue|continua|go|vai|avante|next|próximo|proximo|avança|avanca)[\s.!?]*$/i,
	/^ultrathink[\s.,]*(go|vai|continue|continua)?[\s.!?]*$/i,
	/^(thanks|obrigado|obrigada|ty)[\s.!?]*$/i,
];

const MIN_TURN_CHARS = 15;
// Number of turns to include in the window before/after the intervention,
// counted regardless of role. 2 before + 1 after gives the LLM enough to
// reconstruct what the AI was doing without inflating the prompt budget.
const DEFAULT_WINDOW_BEFORE = 2;
const DEFAULT_WINDOW_AFTER = 1;

/** True if a human message is clearly noise (pure confirmation, unblock, etc). */
export function isNoiseMessage(text: string): boolean {
	const trimmed = text.trim();
	if (trimmed.length < MIN_TURN_CHARS) return true;
	return NOISE_PATTERNS.some((re) => re.test(trimmed));
}

/**
 * Build a window for every non-noise human message after the first one.
 * The first human turn is the problem framing — not an intervention.
 */
export function extractHumanInterventions(
	turns: readonly TranscriptTurn[],
	opts: { before?: number; after?: number } = {},
): InterventionWindow[] {
	const before = opts.before ?? DEFAULT_WINDOW_BEFORE;
	const after = opts.after ?? DEFAULT_WINDOW_AFTER;

	const windows: InterventionWindow[] = [];
	let humanCount = 0;
	for (let i = 0; i < turns.length; i++) {
		const t = turns[i];
		if (t.role !== "user") continue;
		humanCount++;
		// Skip the first human turn — it's the problem definition, not a gap.
		if (humanCount === 1) continue;
		if (isNoiseMessage(t.text)) continue;

		windows.push({
			idx: humanCount,
			human_text: t.text,
			before: turns.slice(Math.max(0, i - before), i),
			after: turns.slice(i + 1, i + 1 + after),
		});
	}
	return windows;
}

// ─── Prompt building ──────────────────────────────

const MAX_TURN_CHARS_IN_PROMPT = 1500;

function truncate(text: string, max = MAX_TURN_CHARS_IN_PROMPT): string {
	return text.length > max ? `${text.slice(0, max)}…` : text;
}

/** Build the user message for one gap-extraction LLM call. */
export function buildGapUserPrompt(w: InterventionWindow): string {
	const lines: string[] = ["# Context window for one human intervention", ""];

	lines.push("## Turns before the human's message");
	for (const t of w.before) {
		lines.push(`### [${t.role}]`);
		lines.push(truncate(t.text));
		lines.push("");
	}
	lines.push("## THE HUMAN'S MESSAGE");
	lines.push(w.human_text);
	lines.push("");
	lines.push("## Assistant's response after");
	for (const t of w.after) {
		lines.push(`### [${t.role}]`);
		lines.push(truncate(t.text));
		lines.push("");
	}
	lines.push("---");
	lines.push('Extract the gap, or return `{"rejected": true, "reason": "..."}` if there is none.');
	return lines.join("\n");
}

// ─── Response parsing ─────────────────────────────

const CODE_FENCE_RE = /^```(?:json)?\s*\n?([\s\S]*?)\n?```$/;

const VALID_GAP_TYPES: ReadonlySet<GapType> = new Set([
	"domain",
	"business",
	"strategic",
	"past-learning",
	"preference",
	"ambiguity",
	"methodology",
]);

/**
 * Strip code fences and parse the LLM response. Returns null on any error;
 * the caller decides whether to retry or drop. Validates required fields
 * for non-rejected responses and clamps an invalid `gap_type` to "methodology"
 * with a console warning rather than dropping the whole response.
 */
export function parseGapResponse(raw: string): GapResponse | null {
	const trimmed = raw.trim();
	if (!trimmed) return null;
	const cleaned = trimmed.match(CODE_FENCE_RE)?.[1]?.trim() ?? trimmed;

	let obj: unknown;
	try {
		obj = JSON.parse(cleaned);
	} catch {
		return null;
	}
	if (!obj || typeof obj !== "object") return null;
	const r = obj as Record<string, unknown>;

	if (r.rejected === true) {
		return { rejected: true, reason: String(r.reason ?? "no reason given") };
	}

	const title = typeof r.title === "string" ? r.title.trim() : "";
	const ai_assumption = typeof r.ai_assumption === "string" ? r.ai_assumption.trim() : "";
	const human_contribution =
		typeof r.human_contribution === "string" ? r.human_contribution.trim() : "";
	const why_invisible_to_ai =
		typeof r.why_invisible_to_ai === "string" ? r.why_invisible_to_ai.trim() : "";
	const for_next_session = typeof r.for_next_session === "string" ? r.for_next_session.trim() : "";

	if (
		!title ||
		!ai_assumption ||
		!human_contribution ||
		!why_invisible_to_ai ||
		!for_next_session
	) {
		return null;
	}

	const rawType = typeof r.gap_type === "string" ? r.gap_type : "";
	const gap_type: GapType = VALID_GAP_TYPES.has(rawType as GapType)
		? (rawType as GapType)
		: "methodology";

	return {
		rejected: false,
		title,
		gap_type,
		ai_assumption,
		human_contribution,
		why_invisible_to_ai,
		for_next_session,
	};
}

// ─── Privacy guard ────────────────────────────────

/**
 * Patterns that often signal a verbatim leak of the human's voice — the
 * privacy rule says the insight is the abstraction, not the words. We strip
 * these post-LLM as a belt-and-braces guard; the prompt also asks the model
 * to avoid them in the first place.
 */
const VERBATIM_QUOTED_RE = /['"`«»][^'"`«»]{12,}['"`«»]/g;
const CAPS_RUN_RE = /\b[A-Z]{5,}(?:\s+[A-Z]{2,}){0,5}\b/g;
const REPEATED_PUNCT_RE = /([!?]){2,}/g;
const LAUGHTER_RE = /\b(k{4,}|h{4,}|a{4,}|j{4,})\b/gi;
const PROFANITY_RE =
	/\b(porra|caralho|merda|fds|wtf|fuck(?:ing)?|shit|fodasse|fodase|foda-se|cabrão|cabrao|puta)\b/gi;

export type GapInsightResolved = Extract<GapResponse, { rejected: false }>;

export interface SanitizationResult {
	sanitized: GapInsightResolved;
	privacyConcerns: string[];
}

/**
 * Strip likely-verbatim spans (quoted strings, ALL-CAPS runs, repeated
 * punctuation, profanity) from every text field of a non-rejected gap
 * response. Returns the cleaned response plus a list of human-readable
 * notes about what was redacted — the caller can store these on the
 * draft so a human reviewer can spot suspect outputs.
 */
export function sanitizeGapResponse(response: GapInsightResolved): SanitizationResult {
	const concerns: string[] = [];

	const sanitize = (input: string, field: string): string => {
		let out = input;
		out = out.replace(VERBATIM_QUOTED_RE, () => {
			concerns.push(`${field}: quoted span redacted`);
			return "[paraphrased]";
		});
		out = out.replace(CAPS_RUN_RE, (m) => {
			concerns.push(`${field}: caps run redacted (“${m.slice(0, 24)}”)`);
			return "[paraphrased]";
		});
		out = out.replace(REPEATED_PUNCT_RE, "$1");
		out = out.replace(LAUGHTER_RE, "");
		out = out.replace(PROFANITY_RE, () => {
			concerns.push(`${field}: profanity redacted`);
			return "[redacted]";
		});
		// Collapse any runs of whitespace introduced by redactions
		out = out.replace(/\s{2,}/g, " ").trim();
		return out;
	};

	const sanitized: GapInsightResolved = {
		...response,
		title: sanitize(response.title, "title"),
		ai_assumption: sanitize(response.ai_assumption, "ai_assumption"),
		human_contribution: sanitize(response.human_contribution, "human_contribution"),
		why_invisible_to_ai: sanitize(response.why_invisible_to_ai, "why_invisible_to_ai"),
		for_next_session: sanitize(response.for_next_session, "for_next_session"),
	};

	return { sanitized, privacyConcerns: concerns };
}

// ─── Multi-window generation ──────────────────────

/** Provider abstraction: a function that, given system+user prompts, returns raw LLM text. */
export type LlmCall = (systemPrompt: string, userPrompt: string) => Promise<string>;

export interface GapGenerationOptions {
	maxWindows?: number; // upper bound on LLM calls per generation; default unlimited
	onProgress?: (idx: number, total: number) => void;
}

export interface GapCaptureOutcome {
	window: InterventionWindow;
	response: GapInsightResolved;
	privacyConcerns: string[];
}

export interface GapRejectOutcome {
	window: InterventionWindow;
	reason: string;
}

export interface GapErrorOutcome {
	window: InterventionWindow;
	error: string;
}

export interface GapGenerationResult {
	captured: GapCaptureOutcome[];
	rejected: GapRejectOutcome[];
	errors: GapErrorOutcome[];
}

/**
 * Run gap extraction across every human-intervention window in a transcript.
 * Sequential by design — provider call rate-limits and retry semantics live
 * inside the LlmCall implementation, not here.
 */
export async function generateGapInsights(
	llm: LlmCall,
	systemPrompt: string,
	transcript: string,
	opts: GapGenerationOptions = {},
): Promise<GapGenerationResult> {
	const turns = parseTranscriptTurns(transcript);
	let windows = extractHumanInterventions(turns);
	if (opts.maxWindows !== undefined && windows.length > opts.maxWindows) {
		// Process the most recent N — older windows have likely been captured
		// in prior generations and the DB content_hash will dedupe regardless.
		windows = windows.slice(-opts.maxWindows);
	}

	const captured: GapCaptureOutcome[] = [];
	const rejected: GapRejectOutcome[] = [];
	const errors: GapErrorOutcome[] = [];

	for (let i = 0; i < windows.length; i++) {
		const w = windows[i];
		opts.onProgress?.(i + 1, windows.length);
		try {
			const raw = await llm(systemPrompt, buildGapUserPrompt(w));
			const parsed = parseGapResponse(raw);
			if (!parsed) {
				errors.push({ window: w, error: "could not parse LLM response" });
				continue;
			}
			if (parsed.rejected) {
				rejected.push({ window: w, reason: parsed.reason });
				continue;
			}
			const { sanitized, privacyConcerns } = sanitizeGapResponse(parsed);
			captured.push({ window: w, response: sanitized, privacyConcerns });
		} catch (err) {
			errors.push({ window: w, error: err instanceof Error ? err.message : String(err) });
		}
	}

	return { captured, rejected, errors };
}

// ─── Insight create mapper ────────────────────────

export interface GapInsightCreateContext {
	repo: string;
	branch?: string;
	triggerType: TriggerType;
	sourceFiles?: string[];
	sessionRefs?: Record<string, unknown>[];
	privacyConcerns?: string[];
}

/** Map a sanitized gap response into the shape the API/draft store accepts. */
export function gapResponseToInsightCreate(
	gap: GapInsightResolved,
	ctx: GapInsightCreateContext,
): InsightCreate {
	const structured: Record<string, unknown> = {
		gap_type: gap.gap_type,
		ai_assumption: gap.ai_assumption,
		human_contribution: gap.human_contribution,
		why_invisible_to_ai: gap.why_invisible_to_ai,
	};
	if (ctx.privacyConcerns && ctx.privacyConcerns.length > 0) {
		structured.privacy_concerns = ctx.privacyConcerns;
	}
	return {
		kind: "gap",
		title: gap.title,
		body: gap.for_next_session,
		structured,
		repo: ctx.repo,
		branch: ctx.branch,
		source_files: ctx.sourceFiles,
		session_refs: ctx.sessionRefs,
		trigger_type: ctx.triggerType,
		status: "draft",
	};
}
