import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { sql } from "../db/client";

const { app } = await import("../index");

let jwt: string;
let orgId: string;
const testEmail = `search-test-${crypto.randomUUID()}@test.com`;
const testOrg = `Search Test ${crypto.randomUUID().slice(0, 8)}`;

beforeAll(async () => {
	// Register test org
	const res = await app.fetch(
		new Request("http://localhost/api/auth/register", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				org_name: testOrg,
				name: "Search Tester",
				email: testEmail,
				password: "test1234",
			}),
		}),
	);
	const body = await res.json();
	jwt = body.token;
	orgId = body.org.id;

	// Create test insights for search
	const headers = { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" };

	await app.fetch(
		new Request("http://localhost/api/insights", {
			method: "POST",
			headers,
			body: JSON.stringify({
				kind: "decision",
				title: "PostgreSQL for vector search",
				body: "Using pgvector extension for embedding similarity search instead of Pinecone.",
				repo: "glieai/pulse",
				trigger_type: "manual",
				status: "published",
				source_files: ["src/db/client.ts", "src/services/search.ts"],
			}),
		}),
	);

	await app.fetch(
		new Request("http://localhost/api/insights", {
			method: "POST",
			headers,
			body: JSON.stringify({
				kind: "dead_end",
				title: "Redis cache abandoned",
				body: "Tried adding Redis cache layer but serialization overhead nullified gains.",
				repo: "glieai/pulse",
				trigger_type: "manual",
				status: "published",
				source_files: ["src/cache/redis.ts"],
			}),
		}),
	);

	await app.fetch(
		new Request("http://localhost/api/insights", {
			method: "POST",
			headers,
			body: JSON.stringify({
				kind: "pattern",
				title: "Always use transactions for multi-table writes",
				body: "Wrap INSERT operations that touch multiple tables in sql.begin() for atomicity.",
				repo: "glieai/pulse",
				trigger_type: "manual",
				status: "published",
			}),
		}),
	);
});

afterAll(async () => {
	await sql`DELETE FROM insights WHERE org_id = ${orgId}`;
	await sql`DELETE FROM users WHERE email = ${testEmail}`;
	await sql`DELETE FROM orgs WHERE id = ${orgId}`;
});

function authHeaders() {
	return { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" };
}

describe("GET /api/search", () => {
	test("returns FTS results for matching query", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/search?q=PostgreSQL", { headers: authHeaders() }),
		);
		const body = await res.json();

		expect(res.status).toBe(200);
		expect(body.insights.length).toBeGreaterThanOrEqual(1);
		expect(body.total).toBeGreaterThanOrEqual(1);
	});

	test("returns empty for non-matching query", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/search?q=xyznonexistent123", { headers: authHeaders() }),
		);
		const body = await res.json();

		expect(res.status).toBe(200);
		expect(body.insights).toHaveLength(0);
		expect(body.total).toBe(0);
	});

	test("returns 400 without query", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/search", { headers: authHeaders() }),
		);
		expect(res.status).toBe(400);
	});

	test("respects pagination", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/search?q=pulse&limit=1&offset=0", {
				headers: authHeaders(),
			}),
		);
		const body = await res.json();

		expect(res.status).toBe(200);
		expect(body.insights.length).toBeLessThanOrEqual(1);
		expect(body.limit).toBe(1);
	});
});

describe("GET /api/context", () => {
	test("returns FTS context results", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/context?query=Redis+cache", { headers: authHeaders() }),
		);
		const body = await res.json();

		expect(res.status).toBe(200);
		expect(body.insights).toBeArray();
		expect(body.insights.length).toBeGreaterThanOrEqual(1);
	});

	test("returns 400 without query", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/context", { headers: authHeaders() }),
		);
		expect(res.status).toBe(400);
	});
});

describe("GET /api/context/file/*", () => {
	test("returns insights for a specific file", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/context/file/src/db/client.ts?repo=glieai/pulse", {
				headers: authHeaders(),
			}),
		);
		const body = await res.json();

		expect(res.status).toBe(200);
		expect(body.insights).toBeArray();
		expect(body.insights.length).toBeGreaterThanOrEqual(1);
	});

	test("returns empty for non-existent file", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/context/file/nonexistent.ts?repo=glieai/pulse", {
				headers: authHeaders(),
			}),
		);
		const body = await res.json();

		expect(res.status).toBe(200);
		expect(body.insights).toHaveLength(0);
	});

	test("returns 400 without repo param", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/context/file/src/db/client.ts", {
				headers: authHeaders(),
			}),
		);
		expect(res.status).toBe(400);
	});

	test("path traversal via URL normalization returns 404 (no route match)", async () => {
		// URL parser resolves /../.. before reaching handler — Hono returns 404
		const res = await app.fetch(
			new Request("http://localhost/api/context/file/../../../etc/passwd?repo=glieai/pulse", {
				headers: authHeaders(),
			}),
		);
		expect(res.status).toBe(404);
	});
});

describe("search edge cases", () => {
	test("search handles SQL injection attempts safely", async () => {
		const res = await app.fetch(
			new Request(
				`http://localhost/api/search?q=${encodeURIComponent("'; DROP TABLE insights; --")}`,
				{ headers: authHeaders() },
			),
		);

		// Must not crash — returns 200 with 0 results
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.insights).toBeArray();
	});

	test("search handles special characters safely", async () => {
		const res = await app.fetch(
			new Request(`http://localhost/api/search?q=${encodeURIComponent("foo & bar | !baz")}`, {
				headers: authHeaders(),
			}),
		);

		expect(res.status).toBe(200);
	});

	test("limit=0 returns 400", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/search?q=test&limit=0", { headers: authHeaders() }),
		);
		expect(res.status).toBe(400);
	});

	test("limit=101 returns 400", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/search?q=test&limit=101", { headers: authHeaders() }),
		);
		expect(res.status).toBe(400);
	});

	test("offset beyond total returns empty", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/search?q=PostgreSQL&offset=10000", {
				headers: authHeaders(),
			}),
		);
		const body = await res.json();

		expect(res.status).toBe(200);
		expect(body.insights).toHaveLength(0);
	});
});

describe("POST /api/context (hybrid search)", () => {
	test("POST context with FTS fallback works when no embedding provided", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/context", {
				method: "POST",
				headers: authHeaders(),
				body: JSON.stringify({
					query: "PostgreSQL",
					strategy: "hybrid",
					limit: 10,
				}),
			}),
		);

		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.insights).toBeArray();
		expect(body.insights.length).toBeGreaterThanOrEqual(1);
	});

	test("POST context with embedding uses vector search", async () => {
		const embedding = new Array(1536).fill(0.01);
		const res = await app.fetch(
			new Request("http://localhost/api/context", {
				method: "POST",
				headers: authHeaders(),
				body: JSON.stringify({
					query: "database",
					embedding,
					strategy: "vector",
					limit: 10,
				}),
			}),
		);

		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.insights).toBeArray();
	});

	test("POST context returns 400 without query", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/context", {
				method: "POST",
				headers: authHeaders(),
				body: JSON.stringify({ strategy: "fts", limit: 10 }),
			}),
		);
		expect(res.status).toBe(400);
	});
});
