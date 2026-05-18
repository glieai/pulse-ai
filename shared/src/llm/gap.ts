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

import type { GapInsightStructured, GapType } from "../types/insight";

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
