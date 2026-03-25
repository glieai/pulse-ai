import { describe, expect, test } from "bun:test";
import { extractKeywords, formatContextForPrompt, toOrQuery } from "./search";
import type { RelatedContextResult } from "./search";

describe("toOrQuery", () => {
	test("joins words with OR pipe", () => {
		expect(toOrQuery("PostgreSQL database")).toBe("PostgreSQL | database");
	});

	test("strips punctuation", () => {
		expect(toOrQuery("hello, world! foo.bar")).toBe("hello | world | foo | bar");
	});

	test("filters single-char words", () => {
		expect(toOrQuery("a big test")).toBe("big | test");
	});

	test("handles empty string", () => {
		expect(toOrQuery("")).toBe("");
	});
});

describe("extractKeywords", () => {
	test("extracts keywords from git log --oneline format", () => {
		const log = ["a1b2c3d feat: add dark mode toggle", "d4e5f6g fix: auth token expiry bug"].join(
			"\n",
		);

		const result = extractKeywords(log);
		expect(result).toContain("dark");
		expect(result).toContain("mode");
		expect(result).toContain("toggle");
		expect(result).toContain("auth");
		expect(result).toContain("token");
		expect(result).toContain("expiry");
		expect(result).toContain("bug");
	});

	test("strips commit hash prefixes", () => {
		const log = "abc1234 some important change";
		const result = extractKeywords(log);
		expect(result).not.toContain("abc1234");
		expect(result).toContain("important");
		expect(result).toContain("change");
	});

	test("strips conventional commit prefixes", () => {
		const log = [
			"abc1234 feat: add search",
			"def5678 fix(auth): validate tokens",
			"aab9012 refactor!: clean up routes",
			"ccf3456 docs: update readme",
		].join("\n");

		const result = extractKeywords(log);
		// Conventional prefixes should not appear
		expect(result).not.toMatch(/\bfeat\b/);
		expect(result).not.toMatch(/\bfix\b/);
		expect(result).not.toMatch(/\brefactor\b/);
		expect(result).not.toMatch(/\bdocs\b/);
		// Content words should appear
		expect(result).toContain("search");
		expect(result).toContain("validate");
		expect(result).toContain("tokens");
		expect(result).toContain("clean");
		expect(result).toContain("routes");
		expect(result).toContain("readme");
	});

	test("filters stop words", () => {
		const log = "abc1234 add the new update to all settings";
		const result = extractKeywords(log);
		// Stop words should be removed
		expect(result).not.toMatch(/\bthe\b/);
		expect(result).not.toMatch(/\badd\b/);
		expect(result).not.toMatch(/\bnew\b/);
		expect(result).not.toMatch(/\ball\b/);
		// Content words should remain
		expect(result).toContain("settings");
	});

	test("deduplicates keywords", () => {
		const log = ["abc1234 feat: improve auth flow", "def5678 fix: auth validation broken"].join(
			"\n",
		);

		const result = extractKeywords(log);
		const words = result.split(" | ");
		const unique = new Set(words);
		expect(words.length).toBe(unique.size);
	});

	test("caps at 30 keywords", () => {
		// Generate 40 unique words
		const lines = Array.from(
			{ length: 40 },
			(_, i) => `abc${i.toString().padStart(4, "0")} feat: keyword${i} something${i}`,
		).join("\n");

		const result = extractKeywords(lines);
		const words = result.split(" | ");
		expect(words.length).toBeLessThanOrEqual(30);
	});

	test("returns empty string for empty input", () => {
		expect(extractKeywords("")).toBe("");
	});

	test("returns OR-joined format", () => {
		const log = "abc1234 feat: dark mode toggle";
		const result = extractKeywords(log);
		expect(result).toMatch(/^\w+( \| \w+)*$/);
	});
});

describe("formatContextForPrompt", () => {
	const mockInsights: RelatedContextResult[] = [
		{
			id: "1",
			kind: "decision",
			title: "Use SHA256 for API tokens",
			body_excerpt: "API tokens are hashed with SHA256 before storage for security.",
			branch: "dev",
			source_files: ["api/src/services/auth.ts", "api/src/middleware/auth.ts"],
			status: "published",
			score: 0.85,
		},
		{
			id: "2",
			kind: "dead_end",
			title: "Bun filter broken",
			body_excerpt: "Bun's built-in filter() does not handle async predicates.",
			branch: "dev",
			source_files: null,
			status: "draft",
			score: 0.6,
		},
	];

	test("formats insights with headers and metadata", () => {
		const result = formatContextForPrompt(mockInsights);

		expect(result).toStartWith("## Existing Insights — DO NOT REPEAT");
		expect(result).toContain("### [DECISION] Use SHA256 for API tokens");
		expect(result).toContain("branch: dev");
		expect(result).toContain("files: api/src/services/auth.ts, api/src/middleware/auth.ts");
		expect(result).toContain("### [DEAD_END] Bun filter broken");
		expect(result).toContain("draft");
	});

	test("truncates source_files to 3", () => {
		const insights: RelatedContextResult[] = [
			{
				id: "1",
				kind: "pattern",
				title: "Test",
				body_excerpt: "Body text",
				branch: null,
				source_files: ["a.ts", "b.ts", "c.ts", "d.ts", "e.ts"],
				status: "published",
				score: 0.5,
			},
		];

		const result = formatContextForPrompt(insights);
		expect(result).toContain("files: a.ts, b.ts, c.ts");
		expect(result).not.toContain("d.ts");
	});

	test("adds ellipsis for long body excerpts", () => {
		const insights: RelatedContextResult[] = [
			{
				id: "1",
				kind: "context",
				title: "Long body",
				body_excerpt: "x".repeat(300),
				branch: null,
				source_files: null,
				status: "published",
				score: 0.5,
			},
		];

		const result = formatContextForPrompt(insights);
		expect(result).toContain(`${"x".repeat(300)}...`);
	});

	test("returns empty string for empty array", () => {
		expect(formatContextForPrompt([])).toBe("");
	});
});
