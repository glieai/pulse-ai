import { describe, expect, it } from "bun:test";
import { parseInsightResponse } from "./parse";

describe("parseInsightResponse", () => {
	const validJson = JSON.stringify({
		kind: "decision",
		title: "Use Bun over Node",
		body: "We chose Bun for its speed.",
		structured: { why: "performance" },
		sourceFiles: ["package.json"],
	});

	it("parses valid JSON", () => {
		const result = parseInsightResponse(validJson);
		expect(result.kind).toBe("decision");
		expect(result.title).toBe("Use Bun over Node");
		expect(result.body).toBe("We chose Bun for its speed.");
		expect(result.structured).toEqual({ why: "performance" });
		expect(result.sourceFiles).toEqual(["package.json"]);
	});

	it("strips ```json code blocks", () => {
		const wrapped = `\`\`\`json\n${validJson}\n\`\`\``;
		const result = parseInsightResponse(wrapped);
		expect(result.kind).toBe("decision");
	});

	it("strips ``` code blocks without language tag", () => {
		const wrapped = `\`\`\`\n${validJson}\n\`\`\``;
		const result = parseInsightResponse(wrapped);
		expect(result.kind).toBe("decision");
	});

	it("handles whitespace around JSON", () => {
		const result = parseInsightResponse(`  \n${validJson}\n  `);
		expect(result.kind).toBe("decision");
	});

	it("defaults structured to empty object when missing", () => {
		const json = JSON.stringify({ kind: "pattern", title: "T", body: "B" });
		const result = parseInsightResponse(json);
		expect(result.structured).toEqual({});
	});

	it("passes through undefined sourceFiles when missing", () => {
		const json = JSON.stringify({ kind: "pattern", title: "T", body: "B" });
		const result = parseInsightResponse(json);
		expect(result.sourceFiles).toBeUndefined();
	});

	it("throws on missing kind", () => {
		const json = JSON.stringify({ title: "T", body: "B" });
		expect(() => parseInsightResponse(json)).toThrow("missing required fields");
	});

	it("throws on missing title", () => {
		const json = JSON.stringify({ kind: "decision", body: "B" });
		expect(() => parseInsightResponse(json)).toThrow("missing required fields");
	});

	it("throws on missing body", () => {
		const json = JSON.stringify({ kind: "decision", title: "T" });
		expect(() => parseInsightResponse(json)).toThrow("missing required fields");
	});

	it("throws on invalid JSON", () => {
		expect(() => parseInsightResponse("not json")).toThrow();
	});
});
