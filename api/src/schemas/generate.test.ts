import { describe, expect, test } from "bun:test";
import { generateSchema } from "./generate";

describe("generateSchema", () => {
	test("parses valid input", () => {
		const input = {
			raw_data: "Meeting notes: we decided to use PostgreSQL...",
			source_type: "meeting",
			repo: "glieai/pulse",
		};

		const result = generateSchema.parse(input);

		expect(result.raw_data).toBe(input.raw_data);
		expect(result.source_type).toBe("meeting");
		expect(result.repo).toBe("glieai/pulse");
		expect(result.auto_approve).toBe(false);
		expect(result.branch).toBeUndefined();
		expect(result.source_name).toBeUndefined();
	});

	test("parses with all optional fields", () => {
		const input = {
			raw_data: "data",
			source_type: "whatsapp",
			source_name: "Client Project Group",
			repo: "glieai/pulse",
			branch: "dev",
			auto_approve: true,
		};

		const result = generateSchema.parse(input);
		expect(result.source_name).toBe("Client Project Group");
		expect(result.branch).toBe("dev");
		expect(result.auto_approve).toBe(true);
	});

	test("rejects empty raw_data", () => {
		expect(() =>
			generateSchema.parse({ raw_data: "", source_type: "meeting", repo: "x" }),
		).toThrow();
	});

	test("rejects missing required fields", () => {
		expect(() => generateSchema.parse({ raw_data: "data" })).toThrow();
		expect(() => generateSchema.parse({ source_type: "x", repo: "x" })).toThrow();
	});
});
