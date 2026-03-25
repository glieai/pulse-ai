import { describe, expect, test } from "bun:test";
import { createLlmProvider } from "./provider";

describe("createLlmProvider", () => {
	test("creates Anthropic provider with default model", () => {
		const provider = createLlmProvider("anthropic", "test-key");
		expect(provider).toBeDefined();
		expect(typeof provider.generate).toBe("function");
	});

	test("creates OpenAI provider with default model", () => {
		const provider = createLlmProvider("openai", "test-key");
		expect(provider).toBeDefined();
		expect(typeof provider.generate).toBe("function");
	});

	test("creates provider with custom model", () => {
		const provider = createLlmProvider("anthropic", "test-key", "claude-3-haiku-20240307");
		expect(provider).toBeDefined();
	});
});
