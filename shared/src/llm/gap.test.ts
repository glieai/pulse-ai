import { describe, expect, test } from "bun:test";
import {
	buildGapUserPrompt,
	extractHumanInterventions,
	gapResponseToInsightCreate,
	generateGapInsights,
	isNoiseMessage,
	parseGapResponse,
	parseTranscriptTurns,
	sanitizeGapResponse,
} from "./gap";
import type { GapInsightResolved } from "./gap";

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

// Test fixture builder for sanitize/generate/mapper tests.
function makeResolved(overrides: Partial<GapInsightResolved> = {}): GapInsightResolved {
	return {
		rejected: false,
		title: "Sample gap",
		gap_type: "domain",
		ai_assumption: "AI was assuming the obvious default.",
		human_contribution: "Human clarified the actual constraint.",
		why_invisible_to_ai: "The constraint lives only in domain experts' heads.",
		for_next_session: "Ask about the constraint up front.",
		...overrides,
	};
}

describe("sanitizeGapResponse", () => {
	test("strips long quoted spans and records the concern", () => {
		const input = makeResolved({
			human_contribution: 'Said "this is a long verbatim quote we want stripped" with frustration.',
		});
		const { sanitized, privacyConcerns } = sanitizeGapResponse(input);
		expect(sanitized.human_contribution).not.toContain("long verbatim quote");
		expect(sanitized.human_contribution).toContain("[paraphrased]");
		expect(privacyConcerns.some((c) => c.includes("quoted span"))).toBe(true);
	});

	test("strips ALL-CAPS runs", () => {
		const input = makeResolved({ title: "Remove THIS LOUD SHOUTING from the title please" });
		const { sanitized, privacyConcerns } = sanitizeGapResponse(input);
		expect(sanitized.title).not.toContain("LOUD SHOUTING");
		expect(privacyConcerns.some((c) => c.startsWith("title: caps run"))).toBe(true);
	});

	test("collapses repeated punctuation", () => {
		const input = makeResolved({ for_next_session: "Just do it!!!! Now???" });
		const { sanitized } = sanitizeGapResponse(input);
		expect(sanitized.for_next_session).toBe("Just do it! Now?");
	});

	test("redacts profanity tokens", () => {
		const input = makeResolved({ human_contribution: "Indicated that the previous fix was shit." });
		const { sanitized, privacyConcerns } = sanitizeGapResponse(input);
		expect(sanitized.human_contribution.toLowerCase()).not.toContain("shit");
		expect(sanitized.human_contribution).toContain("[redacted]");
		expect(privacyConcerns.some((c) => c.includes("profanity"))).toBe(true);
	});

	test("leaves clean input untouched and reports no concerns", () => {
		const input = makeResolved();
		const { sanitized, privacyConcerns } = sanitizeGapResponse(input);
		expect(sanitized).toEqual(input);
		expect(privacyConcerns).toEqual([]);
	});
});

describe("generateGapInsights", () => {
	test("processes every non-noise window and sanitises outputs", async () => {
		const transcript = [
			"[USER] kick-off — please build feature X",
			"[ASSISTANT] starting work on X with default approach",
			"[USER] no, use approach Y because the client requires Y",
			"[ASSISTANT] switching to Y",
			"[USER] ok",
			"[ASSISTANT] noted",
			"[USER] also: domain validation must happen on the server side",
		].join("\n\n");

		let callIdx = 0;
		const responses = [
			JSON.stringify(makeResolved({ title: "Use Y not default approach" })),
			JSON.stringify(makeResolved({ title: "Domain validation belongs on the server" })),
		];

		const llm = async () => {
			const r = responses[callIdx++ % responses.length];
			return r;
		};

		const result = await generateGapInsights(llm, "system", transcript);
		expect(result.captured.length).toBe(2);
		expect(result.captured[0].response.title).toBe("Use Y not default approach");
		expect(result.captured[1].response.title).toBe("Domain validation belongs on the server");
		expect(result.rejected).toEqual([]);
		expect(result.errors).toEqual([]);
	});

	test("records rejections from the LLM and parse failures separately", async () => {
		const transcript = [
			"[USER] kick-off",
			"[ASSISTANT] A1",
			"[USER] actually wait the constraint is different from what I said",
			"[ASSISTANT] noted",
			"[USER] one more thing: data residency is important",
		].join("\n\n");

		const outputs = [
			JSON.stringify({ rejected: true, reason: "deemed redundant" }),
			"not json at all",
		];
		let i = 0;
		const llm = async () => outputs[i++ % outputs.length];

		const result = await generateGapInsights(llm, "system", transcript);
		expect(result.captured).toEqual([]);
		expect(result.rejected).toHaveLength(1);
		expect(result.rejected[0].reason).toBe("deemed redundant");
		expect(result.errors).toHaveLength(1);
		expect(result.errors[0].error).toContain("parse");
	});

	test("respects maxWindows by keeping the most recent N", async () => {
		const transcript = [
			"[USER] kick-off",
			"[ASSISTANT] A1",
			"[USER] first intervention with enough text to pass the noise filter",
			"[ASSISTANT] noted A",
			"[USER] second intervention with enough text to pass the noise filter",
			"[ASSISTANT] noted B",
			"[USER] third intervention with enough text to pass the noise filter",
		].join("\n\n");

		const seen: string[] = [];
		const llm = async (_sys: string, user: string) => {
			seen.push(user);
			return JSON.stringify(makeResolved({ title: "x" }));
		};

		const result = await generateGapInsights(llm, "system", transcript, { maxWindows: 1 });
		expect(result.captured).toHaveLength(1);
		expect(seen[0]).toContain("third intervention");
	});
});

describe("gapResponseToInsightCreate", () => {
	test("maps fields into an InsightCreate of kind=gap", () => {
		const gap = makeResolved({ title: "T", for_next_session: "Do X next time." });
		const ic = gapResponseToInsightCreate(gap, {
			repo: "manager",
			branch: "main",
			triggerType: "size",
			sourceFiles: ["a.ts"],
		});
		expect(ic.kind).toBe("gap");
		expect(ic.title).toBe("T");
		expect(ic.body).toBe("Do X next time.");
		expect(ic.structured?.gap_type).toBe("domain");
		expect(ic.structured?.ai_assumption).toBe("AI was assuming the obvious default.");
		expect(ic.repo).toBe("manager");
		expect(ic.branch).toBe("main");
		expect(ic.trigger_type).toBe("size");
		expect(ic.source_files).toEqual(["a.ts"]);
		expect(ic.status).toBe("draft");
	});

	test("includes privacy_concerns in structured when provided", () => {
		const gap = makeResolved();
		const ic = gapResponseToInsightCreate(gap, {
			repo: "x",
			triggerType: "manual",
			privacyConcerns: ["title: caps run redacted"],
		});
		expect(ic.structured?.privacy_concerns).toEqual(["title: caps run redacted"]);
	});

	test("omits privacy_concerns when empty/undefined", () => {
		const gap = makeResolved();
		const ic = gapResponseToInsightCreate(gap, { repo: "x", triggerType: "manual" });
		expect(ic.structured?.privacy_concerns).toBeUndefined();
	});
});
