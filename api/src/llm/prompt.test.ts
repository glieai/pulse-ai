import { describe, expect, test } from "bun:test";
import { buildGeneratePrompt, parseInsightResponse } from "./prompt";

describe("buildGeneratePrompt", () => {
	test("includes repo and source", () => {
		const result = buildGeneratePrompt({
			repo: "glieai/pulse",
			sourceType: "whatsapp",
			rawData: "Some conversation",
		});

		expect(result).toContain("## Repository: glieai/pulse");
		expect(result).toContain("## Source: whatsapp");
		expect(result).toContain("## Raw Content\nSome conversation");
		expect(result).toContain("## Task");
	});

	test("includes branch when provided", () => {
		const result = buildGeneratePrompt({
			repo: "glieai/pulse",
			branch: "dev",
			sourceType: "email",
			rawData: "data",
		});

		expect(result).toContain("(branch: dev)");
	});

	test("includes source_name when provided", () => {
		const result = buildGeneratePrompt({
			repo: "glieai/pulse",
			sourceType: "whatsapp",
			sourceName: "Client Group",
			rawData: "data",
		});

		expect(result).toContain("## Source: whatsapp — Client Group");
	});

	test("includes existing insights for dedup", () => {
		const result = buildGeneratePrompt({
			repo: "glieai/pulse",
			sourceType: "meeting",
			rawData: "data",
			existingInsights: "- [decision] Use PostgreSQL\n- [pattern] Multi-tenant scoping",
		});

		expect(result).toContain("## Existing Insights (DO NOT REPEAT)");
		expect(result).toContain("Use PostgreSQL");
	});

	test("omits existing insights section when empty", () => {
		const result = buildGeneratePrompt({
			repo: "glieai/pulse",
			sourceType: "meeting",
			rawData: "data",
		});

		expect(result).not.toContain("Existing Insights");
	});
});

describe("parseInsightResponse", () => {
	test("parses valid JSON response", () => {
		const input = JSON.stringify({
			kind: "decision",
			title: "Use PostgreSQL for everything",
			body: "We chose PostgreSQL because...",
			structured: { why: "single DB simplicity" },
			sourceFiles: ["api/src/db/client.ts"],
		});

		const result = parseInsightResponse(input);

		expect(result.kind).toBe("decision");
		expect(result.title).toBe("Use PostgreSQL for everything");
		expect(result.body).toBe("We chose PostgreSQL because...");
		expect(result.structured).toEqual({ why: "single DB simplicity" });
		expect(result.sourceFiles).toEqual(["api/src/db/client.ts"]);
	});

	test("strips markdown code blocks", () => {
		const input = `\`\`\`json
{"kind": "pattern", "title": "Test", "body": "Body", "structured": {}}
\`\`\``;

		const result = parseInsightResponse(input);
		expect(result.kind).toBe("pattern");
		expect(result.title).toBe("Test");
	});

	test("defaults structured to empty object", () => {
		const input = JSON.stringify({
			kind: "context",
			title: "Background info",
			body: "Details here",
		});

		const result = parseInsightResponse(input);
		expect(result.structured).toEqual({});
	});

	test("throws on missing required fields", () => {
		expect(() => parseInsightResponse(JSON.stringify({ kind: "decision" }))).toThrow(
			"missing required fields",
		);
		expect(() => parseInsightResponse(JSON.stringify({ title: "x", body: "y" }))).toThrow(
			"missing required fields",
		);
	});

	test("falls back to context for invalid kind", () => {
		const input = JSON.stringify({
			kind: "invalid_kind",
			title: "Test",
			body: "Body",
		});

		const result = parseInsightResponse(input);
		expect(result.kind).toBe("context");
	});

	test("throws on invalid JSON", () => {
		expect(() => parseInsightResponse("not json")).toThrow();
	});
});
