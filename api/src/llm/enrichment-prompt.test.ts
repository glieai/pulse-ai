import { describe, expect, test } from "bun:test";
import { buildEnrichmentPrompt } from "@pulse/shared";

describe("buildEnrichmentPrompt", () => {
	test("builds prompt with insight and related insights", () => {
		const result = buildEnrichmentPrompt(
			{
				title: "Use PostgreSQL for everything",
				body: "We chose PG for relational, FTS, and vector search.",
				kind: "decision",
				structured: { why: "simplicity" },
			},
			[
				{
					id: "abc-123",
					title: "Use MySQL for production",
					body: "We chose MySQL for its ecosystem.",
					kind: "decision",
				},
			],
		);

		expect(result).toContain("Use PostgreSQL for everything");
		expect(result).toContain("Use MySQL for production");
		expect(result).toContain("abc-123");
		expect(result).toContain("Detect contradictions");
		expect(result).toContain("Related Existing Insights");
	});

	test("builds prompt without related insights", () => {
		const result = buildEnrichmentPrompt(
			{
				title: "Pattern X",
				body: "Always do X for consistency.",
				kind: "pattern",
				structured: {},
			},
			[],
		);

		expect(result).toContain("Pattern X");
		expect(result).not.toContain("Related Existing Insights");
		expect(result).toContain("Detect contradictions");
	});

	test("includes structured data when present", () => {
		const result = buildEnrichmentPrompt(
			{
				title: "Decision Y",
				body: "Details here.",
				kind: "decision",
				structured: {
					why: "performance",
					alternatives: [{ what: "Option B", why_rejected: "too slow" }],
				},
			},
			[],
		);

		expect(result).toContain("performance");
		expect(result).toContain("Option B");
	});

	test("truncates long related insight bodies", () => {
		const longBody = "A".repeat(1000);
		const result = buildEnrichmentPrompt(
			{
				title: "New insight",
				body: "Short body.",
				kind: "context",
				structured: {},
			},
			[{ id: "xyz", title: "Long one", body: longBody, kind: "context" }],
		);

		// Body should be truncated to 500 chars (slice(0, 500))
		expect(result).not.toContain("A".repeat(501));
	});
});
