import { describe, expect, test } from "bun:test";
import { buildHints, computeQualitySignals } from "./enrichment";

describe("computeQualitySignals", () => {
	test("decision with alternatives → has_alternatives true", () => {
		const result = computeQualitySignals({
			kind: "decision",
			body: "We chose PG for simplicity and vector support.",
			structured: {
				why: "simplicity",
				alternatives: [{ what: "MySQL", why_rejected: "no pgvector" }],
			},
			source_files: ["api/src/db/client.ts"],
		});
		expect(result.has_alternatives).toBe(true);
		expect(result.has_structured).toBe(true);
		expect(result.has_source_files).toBe(true);
	});

	test("decision without alternatives → has_alternatives false", () => {
		const result = computeQualitySignals({
			kind: "decision",
			body: "We chose PG.",
			structured: { why: "simplicity" },
		});
		expect(result.has_alternatives).toBe(false);
		expect(result.has_structured).toBe(true);
	});

	test("non-decision kind → has_alternatives always false", () => {
		const result = computeQualitySignals({
			kind: "pattern",
			body: "Multi-tenant scoping pattern.",
			structured: {
				alternatives: [{ what: "something" }],
			},
		});
		expect(result.has_alternatives).toBe(false);
	});

	test("body with 'as mentioned above' → is_self_contained false", () => {
		const result = computeQualitySignals({
			kind: "context",
			body: "As mentioned above, the architecture uses microservices.",
		});
		expect(result.is_self_contained).toBe(false);
	});

	test("body with 'see above' → is_self_contained false", () => {
		const result = computeQualitySignals({
			kind: "context",
			body: "See above for the full explanation.",
		});
		expect(result.is_self_contained).toBe(false);
	});

	test("body with Portuguese ref 'ver acima' → is_self_contained false", () => {
		const result = computeQualitySignals({
			kind: "context",
			body: "Ver acima a explicação completa.",
		});
		expect(result.is_self_contained).toBe(false);
	});

	test("self-contained body → is_self_contained true", () => {
		const result = computeQualitySignals({
			kind: "pattern",
			body: "All queries include WHERE org_id = $1 to enforce tenant isolation.",
		});
		expect(result.is_self_contained).toBe(true);
	});

	test("body_length computed correctly", () => {
		const body = "A".repeat(500);
		const result = computeQualitySignals({ kind: "context", body });
		expect(result.body_length).toBe(500);
	});

	test("no source_files → has_source_files false", () => {
		const result = computeQualitySignals({
			kind: "pattern",
			body: "Details.",
		});
		expect(result.has_source_files).toBe(false);
	});

	test("empty source_files → has_source_files false", () => {
		const result = computeQualitySignals({
			kind: "pattern",
			body: "Details.",
			source_files: [],
		});
		expect(result.has_source_files).toBe(false);
	});

	test("no structured → has_structured false", () => {
		const result = computeQualitySignals({
			kind: "context",
			body: "Some context.",
		});
		expect(result.has_structured).toBe(false);
	});

	test("empty structured → has_structured false", () => {
		const result = computeQualitySignals({
			kind: "context",
			body: "Some context.",
			structured: {},
		});
		expect(result.has_structured).toBe(false);
	});
});

describe("buildHints", () => {
	test("decision missing alternatives", () => {
		const hints = buildHints(
			{
				quality_signals: {
					has_alternatives: false,
					has_source_files: true,
					has_structured: true,
					body_length: 200,
					is_self_contained: true,
				},
				enriched_at: new Date().toISOString(),
			},
			{ kind: "decision" },
		);
		expect(hints.missing).toContain("alternatives");
		expect(hints.missing).not.toContain("source_files");
	});

	test("pattern missing source_files", () => {
		const hints = buildHints(
			{
				quality_signals: {
					has_alternatives: false,
					has_source_files: false,
					has_structured: true,
					body_length: 200,
					is_self_contained: true,
				},
				enriched_at: new Date().toISOString(),
			},
			{ kind: "pattern" },
		);
		expect(hints.missing).toContain("source_files");
		expect(hints.missing).not.toContain("alternatives");
	});

	test("complete insight → no missing", () => {
		const hints = buildHints(
			{
				quality_signals: {
					has_alternatives: true,
					has_source_files: true,
					has_structured: true,
					body_length: 500,
					is_self_contained: true,
				},
				related_ids: ["a", "b"],
				enriched_at: new Date().toISOString(),
			},
			{ kind: "decision" },
		);
		expect(hints.missing).toBeUndefined();
		expect(hints.related_count).toBe(2);
	});

	test("supersession detected in hints", () => {
		const hints = buildHints(
			{
				quality_signals: {
					has_alternatives: false,
					has_source_files: false,
					has_structured: false,
					body_length: 100,
					is_self_contained: true,
				},
				supersedes_id: "some-uuid",
				enriched_at: new Date().toISOString(),
			},
			{ kind: "context" },
		);
		expect(hints.supersedes_id).toBe("some-uuid");
	});
});
