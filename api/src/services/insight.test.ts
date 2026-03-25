import { describe, expect, test } from "bun:test";
import { computeContentHash } from "./insight";

describe("insight service", () => {
	test("computeContentHash is deterministic", () => {
		const hash1 = computeContentHash("org1", "repo", "decision", "title", "body");
		const hash2 = computeContentHash("org1", "repo", "decision", "title", "body");
		expect(hash1).toBe(hash2);
	});

	test("computeContentHash changes with different inputs", () => {
		const hash1 = computeContentHash("org1", "repo", "decision", "title", "body");
		const hash2 = computeContentHash("org2", "repo", "decision", "title", "body");
		const hash3 = computeContentHash("org1", "repo", "decision", "title", "different body");
		expect(hash1).not.toBe(hash2);
		expect(hash1).not.toBe(hash3);
	});

	test("computeContentHash returns hex string", () => {
		const hash = computeContentHash("org1", "repo", "decision", "title", "body");
		expect(hash).toMatch(/^[a-f0-9]{64}$/);
	});
});
