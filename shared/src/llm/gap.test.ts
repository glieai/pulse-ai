import { describe, expect, test } from "bun:test";
import {
	buildGapUserPrompt,
	extractHumanInterventions,
	isNoiseMessage,
	parseGapResponse,
	parseTranscriptTurns,
} from "./gap";

describe("parseTranscriptTurns", () => {
	test("parses alternating USER/ASSISTANT blocks", () => {
		const t = "[USER] hello\n\n[ASSISTANT] hi there\n\n[USER] do X\n";
		const r = parseTranscriptTurns(t);
		expect(r).toEqual([
			{ role: "user", text: "hello" },
			{ role: "assistant", text: "hi there" },
			{ role: "user", text: "do X" },
		]);
	});

	test("handles multi-line bodies", () => {
		const t = "[USER] first line\nsecond line\n\n[ASSISTANT] reply";
		const r = parseTranscriptTurns(t);
		expect(r).toHaveLength(2);
		expect(r[0].text).toBe("first line\nsecond line");
	});

	test("empty/whitespace returns empty list", () => {
		expect(parseTranscriptTurns("")).toEqual([]);
		expect(parseTranscriptTurns("   \n  \n")).toEqual([]);
	});

	test("is case-insensitive on role tags", () => {
		const r = parseTranscriptTurns("[user] hello\n[Assistant] hi");
		expect(r).toEqual([
			{ role: "user", text: "hello" },
			{ role: "assistant", text: "hi" },
		]);
	});

	test("ignores leading text before first role tag", () => {
		const r = parseTranscriptTurns("preamble noise\n[USER] real message");
		expect(r).toEqual([{ role: "user", text: "real message" }]);
	});
});

describe("isNoiseMessage", () => {
	test("rejects pure confirmations", () => {
		expect(isNoiseMessage("ok")).toBe(true);
		expect(isNoiseMessage("yes")).toBe(true);
		expect(isNoiseMessage("sim claro")).toBe(true);
		expect(isNoiseMessage("perfeito")).toBe(true);
		expect(isNoiseMessage("ultrathink go")).toBe(true);
		expect(isNoiseMessage("ultrathink, continua")).toBe(true);
		expect(isNoiseMessage("continue")).toBe(true);
		expect(isNoiseMessage("obrigado")).toBe(true);
	});

	test("rejects messages under 15 chars", () => {
		expect(isNoiseMessage("hi")).toBe(true);
		expect(isNoiseMessage("abc")).toBe(true);
	});

	test("accepts substantive interventions", () => {
		expect(isNoiseMessage("but the client actually does X")).toBe(false);
		expect(isNoiseMessage("mas calma — isto é tratar a consequência")).toBe(false);
		expect(isNoiseMessage("no, use NextAuth, not Clerk")).toBe(false);
	});
});

describe("extractHumanInterventions", () => {
	test("skips the first human turn (problem definition)", () => {
		const turns = parseTranscriptTurns(
			"[USER] please build feature X\n\n[ASSISTANT] starting\n\n[USER] also the api must validate input thoroughly\n",
		);
		const w = extractHumanInterventions(turns);
		expect(w).toHaveLength(1);
		expect(w[0].human_text).toContain("api must validate");
	});

	test("skips noise messages", () => {
		const turns = parseTranscriptTurns(
			"[USER] build feature\n\n[ASSISTANT] starting\n\n[USER] ok\n\n[ASSISTANT] continuing\n\n[USER] actually wait, also support feature Y not just X\n",
		);
		const w = extractHumanInterventions(turns);
		expect(w).toHaveLength(1);
		expect(w[0].human_text).toContain("feature Y");
	});

	test("builds windows with proper before/after slicing", () => {
		const turns = parseTranscriptTurns(
			[
				"[USER] kick-off",
				"",
				"[ASSISTANT] A1",
				"",
				"[ASSISTANT] A2",
				"",
				"[ASSISTANT] A3",
				"",
				"[USER] correction with enough text to matter",
				"",
				"[ASSISTANT] noted",
			].join("\n"),
		);
		const w = extractHumanInterventions(turns, { before: 2, after: 1 });
		expect(w).toHaveLength(1);
		expect(w[0].before.map((t) => t.text)).toEqual(["A2", "A3"]);
		expect(w[0].after).toHaveLength(1);
		expect(w[0].after[0].text).toBe("noted");
	});
});

describe("buildGapUserPrompt", () => {
	test("includes context, the human's message, and after-turn", () => {
		const prompt = buildGapUserPrompt({
			idx: 2,
			human_text: "no, use approach Y instead",
			before: [
				{ role: "user", text: "build X" },
				{ role: "assistant", text: "implementing X with approach Z" },
			],
			after: [{ role: "assistant", text: "switching to Y" }],
		});
		expect(prompt).toContain("THE HUMAN'S MESSAGE");
		expect(prompt).toContain("no, use approach Y instead");
		expect(prompt).toContain("implementing X with approach Z");
		expect(prompt).toContain("switching to Y");
		expect(prompt).toContain("rejected");
	});

	test("truncates very long turns in context", () => {
		const longText = "A".repeat(3000);
		const prompt = buildGapUserPrompt({
			idx: 2,
			human_text: "ok",
			before: [{ role: "assistant", text: longText }],
			after: [],
		});
		expect(prompt).toContain("…");
		expect(prompt.length).toBeLessThan(3500);
	});
});

describe("parseGapResponse", () => {
	test("parses a well-formed JSON response", () => {
		const raw = JSON.stringify({
			title: "Email sender domain is glie.ai, not pulse.glie.ai",
			gap_type: "domain",
			ai_assumption: "Used pulse.glie.ai as the email sender domain.",
			human_contribution: "Indicated the sender domain should be glie.ai (root domain).",
			why_invisible_to_ai: "AI cannot inspect the deployed env file.",
			for_next_session: "Use @glie.ai for outbound email, not @pulse.glie.ai.",
			rejected: false,
		});
		const r = parseGapResponse(raw);
		expect(r).not.toBeNull();
		if (!r || r.rejected) throw new Error("expected non-rejected");
		expect(r.title).toContain("glie.ai");
		expect(r.gap_type).toBe("domain");
	});

	test("parses a code-fenced JSON response", () => {
		const obj = {
			title: "T",
			gap_type: "preference",
			ai_assumption: "A",
			human_contribution: "C",
			why_invisible_to_ai: "W",
			for_next_session: "F",
			rejected: false,
		};
		const raw = `\`\`\`json\n${JSON.stringify(obj)}\n\`\`\``;
		const r = parseGapResponse(raw);
		expect(r).not.toBeNull();
		if (!r || r.rejected) throw new Error("expected non-rejected");
		expect(r.title).toBe("T");
	});

	test("returns null on malformed JSON", () => {
		expect(parseGapResponse("not json")).toBeNull();
		expect(parseGapResponse("")).toBeNull();
	});

	test("returns null when required fields are missing", () => {
		const raw = JSON.stringify({ title: "T", gap_type: "domain", rejected: false });
		expect(parseGapResponse(raw)).toBeNull();
	});

	test("recognises a rejected response", () => {
		const r = parseGapResponse(JSON.stringify({ rejected: true, reason: "pure confirmation" }));
		expect(r).toEqual({ rejected: true, reason: "pure confirmation" });
	});

	test("clamps an invalid gap_type to methodology rather than dropping", () => {
		const raw = JSON.stringify({
			title: "T",
			gap_type: "made-up-type",
			ai_assumption: "A",
			human_contribution: "C",
			why_invisible_to_ai: "W",
			for_next_session: "F",
			rejected: false,
		});
		const r = parseGapResponse(raw);
		expect(r).not.toBeNull();
		if (!r || r.rejected) throw new Error("expected non-rejected");
		expect(r.gap_type).toBe("methodology");
	});
});
