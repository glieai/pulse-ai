import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { sql } from "../db/client";
import { app, authHeader, createTestInsight, createTestOrg } from "../test-utils";

let testOrg: Awaited<ReturnType<typeof createTestOrg>>;

beforeAll(async () => {
	testOrg = await createTestOrg("search-q");

	// Create diverse insights
	await createTestInsight(testOrg.token, {
		kind: "decision",
		title: "PostgreSQL chosen as primary database",
		body: "Selected PostgreSQL 17 with pgvector for relational data, full-text search, and vector embeddings.",
		repo: "glieai/pulse",
		source_files: ["docker-compose.yml", "api/src/db/client.ts"],
	});

	await createTestInsight(testOrg.token, {
		kind: "dead_end",
		title: "Elasticsearch rejected for search",
		body: "Evaluated Elasticsearch but decided against it due to infrastructure overhead for our scale.",
		repo: "glieai/pulse",
	});

	await createTestInsight(testOrg.token, {
		kind: "pattern",
		title: "Idempotent database migrations",
		body: "All migrations use CREATE IF NOT EXISTS and ON CONFLICT patterns to be safely re-runnable.",
		repo: "glieai/pulse",
		source_files: ["api/src/db/migrate.ts"],
	});

	await createTestInsight(testOrg.token, {
		kind: "context",
		title: "API architecture decisions",
		body: "Hono framework chosen for ultralight HTTP handling with Bun runtime for fast cold starts.",
		repo: "glieai/pulse",
	});

	await createTestInsight(testOrg.token, {
		kind: "progress",
		title: "Phase 0 foundations complete",
		body: "Monorepo structure, CI pipeline, database schema, and tooling all operational.",
		repo: "glieai/pulse",
	});
});

afterAll(async () => {
	await sql`DELETE FROM insights WHERE org_id = ${testOrg.orgId}`;
	await sql`DELETE FROM users WHERE email = ${testOrg.email}`;
	await sql`DELETE FROM orgs WHERE id = ${testOrg.orgId}`;
});

describe("search quality", () => {
	test("FTS finds insight by title keyword", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/search?q=PostgreSQL+database", {
				headers: authHeader(testOrg.token),
			}),
		);
		const body = await res.json();

		expect(body.insights.length).toBeGreaterThanOrEqual(1);
		const titles = body.insights.map((i: { title: string }) => i.title);
		expect(titles).toContain("PostgreSQL chosen as primary database");
	});

	test("FTS finds insight by body keyword", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/search?q=Elasticsearch+infrastructure", {
				headers: authHeader(testOrg.token),
			}),
		);
		const body = await res.json();

		expect(body.insights.length).toBeGreaterThanOrEqual(1);
	});

	test("FTS returns no results for unrelated query", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/search?q=kubernetes+deployment+helm", {
				headers: authHeader(testOrg.token),
			}),
		);
		const body = await res.json();

		expect(body.insights).toHaveLength(0);
	});

	test("context retrieves relevant insights", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/context?query=database+migration+pattern", {
				headers: authHeader(testOrg.token),
			}),
		);
		const body = await res.json();

		expect(body.insights.length).toBeGreaterThanOrEqual(1);
	});

	test("file context returns insights for specific file", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/context/file/api/src/db/client.ts?repo=glieai/pulse", {
				headers: authHeader(testOrg.token),
			}),
		);
		const body = await res.json();

		expect(body.insights.length).toBeGreaterThanOrEqual(1);
		expect(body.insights[0].title).toBe("PostgreSQL chosen as primary database");
	});

	test("pagination works correctly", async () => {
		const res1 = await app.fetch(
			new Request("http://localhost/api/search?q=database&limit=2&offset=0", {
				headers: authHeader(testOrg.token),
			}),
		);
		const body1 = await res1.json();

		const res2 = await app.fetch(
			new Request("http://localhost/api/search?q=database&limit=2&offset=2", {
				headers: authHeader(testOrg.token),
			}),
		);
		const body2 = await res2.json();

		expect(body1.insights.length).toBeLessThanOrEqual(2);
		expect(body1.total).toBeGreaterThanOrEqual(3);

		// Ensure different pages have different results
		if (body2.insights.length > 0) {
			const ids1 = body1.insights.map((i: { id: string }) => i.id);
			const ids2 = body2.insights.map((i: { id: string }) => i.id);
			for (const id of ids2) {
				expect(ids1).not.toContain(id);
			}
		}
	});
});
