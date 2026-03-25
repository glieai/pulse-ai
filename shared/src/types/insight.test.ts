import { describe, expect, test } from "bun:test";
import type { Insight, InsightKind } from "./insight";

describe("Insight types", () => {
	test("InsightKind covers all valid kinds", () => {
		const kinds: InsightKind[] = [
			"decision",
			"dead_end",
			"pattern",
			"context",
			"progress",
			"business",
		];
		expect(kinds).toHaveLength(6);
	});

	test("Insight shape is correct", () => {
		const insight: Insight = {
			id: "test-id",
			org_id: "org-id",
			kind: "decision",
			title: "Test",
			body: "Test body",
			structured: {},
			repo: "test/repo",
			author_id: "author-id",
			trigger_type: "manual",
			content_hash: "hash",
			status: "published",
			created_at: new Date().toISOString(),
		};
		expect(insight.kind).toBe("decision");
	});
});
