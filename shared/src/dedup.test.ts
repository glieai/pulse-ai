import { describe, expect, test } from "bun:test";
import { findDuplicateBySourceFiles, jaccardSimilarity } from "./dedup";

describe("jaccardSimilarity", () => {
	test("empty sets → 0", () => {
		expect(jaccardSimilarity([], [])).toBe(0);
		expect(jaccardSimilarity([], ["a"])).toBe(0);
		expect(jaccardSimilarity(["a"], [])).toBe(0);
	});

	test("identical sets → 1", () => {
		expect(jaccardSimilarity(["a", "b"], ["a", "b"])).toBe(1);
	});

	test("disjoint sets → 0", () => {
		expect(jaccardSimilarity(["a", "b"], ["c", "d"])).toBe(0);
	});

	test("half overlap → 0.5", () => {
		// {a,b,c} ∩ {b,c,d} = {b,c} (2); ∪ = {a,b,c,d} (4)
		expect(jaccardSimilarity(["a", "b", "c"], ["b", "c", "d"])).toBeCloseTo(0.5);
	});

	test("duplicates in input do not inflate the score", () => {
		expect(jaccardSimilarity(["a", "a", "b"], ["a", "b"])).toBe(1);
	});

	test("order-independent", () => {
		expect(jaccardSimilarity(["a", "b"], ["b", "a"])).toBe(1);
	});
});

describe("findDuplicateBySourceFiles", () => {
	test("empty currentFiles → null", () => {
		const candidates = [{ id: "x", title: "t", source_files: ["a"] }];
		expect(findDuplicateBySourceFiles([], candidates)).toBeNull();
	});

	test("empty candidates → null", () => {
		expect(findDuplicateBySourceFiles(["a"], [])).toBeNull();
	});

	test("candidate with null source_files is skipped", () => {
		const candidates = [{ id: "x", title: "t", source_files: null }];
		expect(findDuplicateBySourceFiles(["a"], candidates)).toBeNull();
	});

	test("candidate with empty source_files is skipped", () => {
		const candidates = [{ id: "x", title: "t", source_files: [] }];
		expect(findDuplicateBySourceFiles(["a"], candidates)).toBeNull();
	});

	test("returns the highest-scoring match above threshold", () => {
		const result = findDuplicateBySourceFiles(
			["src/auth.ts", "src/db.ts"],
			[
				{ id: "low", title: "low", source_files: ["other.ts"] },
				{ id: "exact", title: "exact", source_files: ["src/auth.ts", "src/db.ts"] },
				{ id: "mid", title: "mid", source_files: ["src/auth.ts", "src/other.ts"] },
			],
			0.5,
		);
		expect(result?.id).toBe("exact");
		expect(result?.score).toBe(1);
	});

	test("below threshold → null", () => {
		// jaccard = 1/4 = 0.25 < 0.5
		const result = findDuplicateBySourceFiles(
			["a", "b", "c", "d"],
			[{ id: "x", title: "t", source_files: ["a"] }],
			0.5,
		);
		expect(result).toBeNull();
	});

	test("at threshold counts as a match", () => {
		// jaccard = 2/4 = 0.5 = threshold
		const result = findDuplicateBySourceFiles(
			["a", "b", "c"],
			[{ id: "x", title: "t", source_files: ["b", "c", "d"] }],
			0.5,
		);
		expect(result?.id).toBe("x");
		expect(result?.score).toBeCloseTo(0.5);
	});

	test("custom threshold respected", () => {
		// jaccard = 1/3 ≈ 0.33 — below 0.5 but above 0.3
		const candidates = [{ id: "x", title: "t", source_files: ["a", "b"] }];
		expect(findDuplicateBySourceFiles(["a", "c"], candidates, 0.5)).toBeNull();
		expect(findDuplicateBySourceFiles(["a", "c"], candidates, 0.3)?.id).toBe("x");
	});

	test("realistic dup pattern (Stripe registration: 12× same files)", () => {
		// Reproduces the observed cluster: 12 insights all touch the same 2 files
		const result = findDuplicateBySourceFiles(
			["src/payments/stripe/register.ts", "src/payments/stripe/types.ts"],
			[
				{
					id: "older-9f3a",
					title: "Stripe registration flow",
					source_files: ["src/payments/stripe/register.ts", "src/payments/stripe/types.ts"],
				},
			],
			0.5,
		);
		expect(result?.id).toBe("older-9f3a");
		expect(result?.score).toBe(1);
	});
});
