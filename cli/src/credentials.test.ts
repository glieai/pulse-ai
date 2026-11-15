import { afterEach, describe, expect, test } from "bun:test";
import { detectCredentials, getAnthropicKey, getOpenAIKey } from "./credentials";

// --- Env var readers ---

describe("getAnthropicKey", () => {
	const originalKey = process.env.ANTHROPIC_API_KEY;

	afterEach(() => {
		if (originalKey !== undefined) {
			process.env.ANTHROPIC_API_KEY = originalKey;
		} else {
			Reflect.deleteProperty(process.env, "ANTHROPIC_API_KEY");
		}
	});

	test("returns key when env var is set", () => {
		process.env.ANTHROPIC_API_KEY = "sk-ant-test-key";
		expect(getAnthropicKey()).toBe("sk-ant-test-key");
	});

	test("returns undefined when env var is not set", () => {
		Reflect.deleteProperty(process.env, "ANTHROPIC_API_KEY");
		expect(getAnthropicKey()).toBeUndefined();
	});
});

describe("getOpenAIKey", () => {
	const originalKey = process.env.OPENAI_API_KEY;

	afterEach(() => {
		if (originalKey !== undefined) {
			process.env.OPENAI_API_KEY = originalKey;
		} else {
			Reflect.deleteProperty(process.env, "OPENAI_API_KEY");
		}
	});

	test("returns key when env var is set", () => {
		process.env.OPENAI_API_KEY = "sk-test-key";
		expect(getOpenAIKey()).toBe("sk-test-key");
	});

	test("returns undefined when env var is not set", () => {
		Reflect.deleteProperty(process.env, "OPENAI_API_KEY");
		expect(getOpenAIKey()).toBeUndefined();
	});
});

// --- Credential report ---

describe("detectCredentials", () => {
	const originalAnthKey = process.env.ANTHROPIC_API_KEY;
	const originalOaiKey = process.env.OPENAI_API_KEY;

	afterEach(() => {
		if (originalAnthKey !== undefined) {
			process.env.ANTHROPIC_API_KEY = originalAnthKey;
		} else {
			Reflect.deleteProperty(process.env, "ANTHROPIC_API_KEY");
		}
		if (originalOaiKey !== undefined) {
			process.env.OPENAI_API_KEY = originalOaiKey;
		} else {
			Reflect.deleteProperty(process.env, "OPENAI_API_KEY");
		}
	});

	test("reports env sources when env vars are set", () => {
		process.env.ANTHROPIC_API_KEY = "sk-ant-test";
		process.env.OPENAI_API_KEY = "sk-test";
		const report = detectCredentials();
		expect(report.anthropic.source).toBe("env");
		expect(report.anthropic.available).toBe(true);
		expect(report.openai.source).toBe("env");
		expect(report.openai.available).toBe(true);
	});

	test("env var takes priority over CLI detection", () => {
		process.env.ANTHROPIC_API_KEY = "sk-ant-test";
		const report = detectCredentials();
		// Even if claude CLI is installed, env var source should win
		expect(report.anthropic.source).toBe("env");
	});

	test("reports null sources when nothing available", () => {
		Reflect.deleteProperty(process.env, "ANTHROPIC_API_KEY");
		Reflect.deleteProperty(process.env, "OPENAI_API_KEY");
		const report = detectCredentials();
		// CLI detection depends on actual binaries — but source should not be "env"
		if (!report.anthropic.available) {
			expect(report.anthropic.source).toBeNull();
		}
		if (!report.openai.available) {
			expect(report.openai.source).toBeNull();
		}
	});
});
