import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { sql } from "../db/client";
import { env } from "../env";
import { app, authHeader, createTestOrg } from "../test-utils";

// Force team mode so auth middleware is exercised
env.PULSE_MODE = "team";

let token: string;
let orgId: string;
let userId: string;

let otherToken: string;
let otherOrgId: string;
let otherUserId: string;

const insightIds: string[] = [];
const orgIds: string[] = [];
const userIds: string[] = [];

beforeAll(async () => {
	// Primary org with several insights
	const primary = await createTestOrg("ctx-primary");
	token = primary.token;
	orgId = primary.orgId;
	userId = primary.userId;
	orgIds.push(orgId);
	userIds.push(userId);

	// Secondary org (for isolation tests)
	const secondary = await createTestOrg("ctx-secondary");
	otherToken = secondary.token;
	otherOrgId = secondary.orgId;
	otherUserId = secondary.userId;
	orgIds.push(otherOrgId);
	userIds.push(otherUserId);

	const headers = authHeader(token);

	// Insight 1: specific repo, branch, files
	const r1 = await app.fetch(
		new Request("http://localhost/api/insights", {
			method: "POST",
			headers,
			body: JSON.stringify({
				kind: "decision",
				title: "Use pgvector for embedding storage",
				body: "Chose pgvector over Pinecone for cost and latency reasons in the pulse project.",
				repo: "glieai/pulse",
				branch: "main",
				trigger_type: "manual",
				status: "published",
				source_files: ["src/db/client.ts", "src/services/search.ts"],
			}),
		}),
	);
	const b1 = await r1.json();
	insightIds.push(b1.id);

	// Insight 2: same repo, different branch and files
	const r2 = await app.fetch(
		new Request("http://localhost/api/insights", {
			method: "POST",
			headers,
			body: JSON.stringify({
				kind: "dead_end",
				title: "Redis caching abandoned for search layer",
				body: "Tried Redis but serialization overhead was too high for search results.",
				repo: "glieai/pulse",
				branch: "feat/cache",
				trigger_type: "manual",
				status: "published",
				source_files: ["src/cache/redis.ts", "src/services/search.ts"],
			}),
		}),
	);
	const b2 = await r2.json();
	insightIds.push(b2.id);

	// Insight 3: different repo entirely
	const r3 = await app.fetch(
		new Request("http://localhost/api/insights", {
			method: "POST",
			headers,
			body: JSON.stringify({
				kind: "pattern",
				title: "Always validate input with Zod schemas",
				body: "Standard pattern across all API endpoints for input validation using Zod.",
				repo: "glieai/dashboard",
				branch: "main",
				trigger_type: "manual",
				status: "published",
				source_files: ["src/routes/api.ts"],
			}),
		}),
	);
	const b3 = await r3.json();
	insightIds.push(b3.id);

	// Insight 4: same repo, no branch, different kind
	const r4 = await app.fetch(
		new Request("http://localhost/api/insights", {
			method: "POST",
			headers,
			body: JSON.stringify({
				kind: "context",
				title: "Monorepo structure for pulse project",
				body: "The pulse monorepo contains api, web, cli, extension, shared, and mcp packages.",
				repo: "glieai/pulse",
				trigger_type: "manual",
				status: "published",
				source_files: ["package.json"],
			}),
		}),
	);
	const b4 = await r4.json();
	insightIds.push(b4.id);

	// Insight in secondary org (should never leak to primary)
	const r5 = await app.fetch(
		new Request("http://localhost/api/insights", {
			method: "POST",
			headers: authHeader(otherToken),
			body: JSON.stringify({
				kind: "decision",
				title: "Secondary org pgvector decision",
				body: "This insight belongs to the secondary org and must not leak.",
				repo: "glieai/pulse",
				branch: "main",
				trigger_type: "manual",
				status: "published",
				source_files: ["src/db/client.ts"],
			}),
		}),
	);
	const b5 = await r5.json();
	insightIds.push(b5.id);
});

afterAll(async () => {
	await sql`DELETE FROM insights WHERE org_id IN ${sql(orgIds)}`;
	await sql`DELETE FROM users WHERE org_id IN ${sql(orgIds)}`;
	await sql`DELETE FROM orgs WHERE id IN ${sql(orgIds)}`;
});

// ─── POST /api/context/related ──────────────────────────────────────────────

describe("POST /api/context/related", () => {
	test("returns related insights for a given repo", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/context/related", {
				method: "POST",
				headers: authHeader(token),
				body: JSON.stringify({
					repo: "glieai/pulse",
					limit: 10,
				}),
			}),
		);

		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.insights).toBeArray();
		expect(body.insights.length).toBeGreaterThanOrEqual(1);

		// Related context returns id, kind, title, body_excerpt, branch, source_files, status, score
		const first = body.insights[0];
		expect(first.id).toBeString();
		expect(first.kind).toBeString();
		expect(first.title).toBeString();
		expect(first.score).toBeNumber();
	});

	test("filters by branch when provided", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/context/related", {
				method: "POST",
				headers: authHeader(token),
				body: JSON.stringify({
					repo: "glieai/pulse",
					branch: "feat/cache",
					limit: 10,
				}),
			}),
		);

		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.insights).toBeArray();
		expect(body.insights.length).toBeGreaterThanOrEqual(1);

		// The feat/cache branch insight should rank high (branch match signal)
		const ids = body.insights.map((i: { id: string }) => i.id);
		expect(ids).toContain(insightIds[1]); // Redis caching insight on feat/cache
	});

	test("filters by source_files when provided", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/context/related", {
				method: "POST",
				headers: authHeader(token),
				body: JSON.stringify({
					repo: "glieai/pulse",
					source_files: ["src/db/client.ts"],
					limit: 10,
				}),
			}),
		);

		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.insights).toBeArray();
		expect(body.insights.length).toBeGreaterThanOrEqual(1);

		// The pgvector insight has src/db/client.ts in source_files — should rank high
		const ids = body.insights.map((i: { id: string }) => i.id);
		expect(ids).toContain(insightIds[0]);
	});

	test("uses recent_commits for keyword extraction", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/context/related", {
				method: "POST",
				headers: authHeader(token),
				body: JSON.stringify({
					repo: "glieai/pulse",
					recent_commits: "feat: add pgvector embedding storage for search",
					limit: 10,
				}),
			}),
		);

		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.insights).toBeArray();
		// Keywords from commit should boost pgvector-related insights
		expect(body.insights.length).toBeGreaterThanOrEqual(1);
	});

	test("respects limit parameter", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/context/related", {
				method: "POST",
				headers: authHeader(token),
				body: JSON.stringify({
					repo: "glieai/pulse",
					limit: 1,
				}),
			}),
		);

		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.insights).toBeArray();
		expect(body.insights.length).toBeLessThanOrEqual(1);
	});

	test("results are scoped to the authenticated org", async () => {
		// Query from secondary org — should NOT see primary org insights
		const res = await app.fetch(
			new Request("http://localhost/api/context/related", {
				method: "POST",
				headers: authHeader(otherToken),
				body: JSON.stringify({
					repo: "glieai/pulse",
					limit: 30,
				}),
			}),
		);

		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.insights).toBeArray();

		// None of the primary org insight IDs (first 4) should appear
		const returnedIds = body.insights.map((i: { id: string }) => i.id);
		for (const id of insightIds.slice(0, 4)) {
			expect(returnedIds).not.toContain(id);
		}
	});

	test("returns 400 when repo is missing", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/context/related", {
				method: "POST",
				headers: authHeader(token),
				body: JSON.stringify({ limit: 10 }),
			}),
		);

		expect(res.status).toBe(400);
	});

	test("returns 400 when repo is empty string", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/context/related", {
				method: "POST",
				headers: authHeader(token),
				body: JSON.stringify({ repo: "", limit: 10 }),
			}),
		);

		expect(res.status).toBe(400);
	});

	test("returns 400 when limit exceeds max (30)", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/context/related", {
				method: "POST",
				headers: authHeader(token),
				body: JSON.stringify({ repo: "glieai/pulse", limit: 31 }),
			}),
		);

		expect(res.status).toBe(400);
	});

	test("returns 400 when limit is 0", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/context/related", {
				method: "POST",
				headers: authHeader(token),
				body: JSON.stringify({ repo: "glieai/pulse", limit: 0 }),
			}),
		);

		expect(res.status).toBe(400);
	});

	test("returns empty for non-existent repo", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/context/related", {
				method: "POST",
				headers: authHeader(token),
				body: JSON.stringify({ repo: "nonexistent/repo-xyz-999" }),
			}),
		);

		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.insights).toBeArray();
		expect(body.insights).toHaveLength(0);
	});

	test("returns 401 without auth", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/context/related", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ repo: "glieai/pulse" }),
			}),
		);

		expect(res.status).toBe(401);
	});

	test("combines multiple signals (repo + branch + files + commits)", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/context/related", {
				method: "POST",
				headers: authHeader(token),
				body: JSON.stringify({
					repo: "glieai/pulse",
					branch: "main",
					source_files: ["src/db/client.ts", "src/services/search.ts"],
					recent_commits: "refactor: improve pgvector query performance",
					limit: 10,
				}),
			}),
		);

		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.insights).toBeArray();
		expect(body.insights.length).toBeGreaterThanOrEqual(1);

		// With all signals pointing at it, the pgvector insight should appear
		const ids = body.insights.map((i: { id: string }) => i.id);
		expect(ids).toContain(insightIds[0]);
	});

	test("session_id parameter is accepted", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/context/related", {
				method: "POST",
				headers: authHeader(token),
				body: JSON.stringify({
					repo: "glieai/pulse",
					session_id: "test-session-123",
					limit: 5,
				}),
			}),
		);

		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.insights).toBeArray();
	});

	test("default limit is 10 when not specified", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/context/related", {
				method: "POST",
				headers: authHeader(token),
				body: JSON.stringify({ repo: "glieai/pulse" }),
			}),
		);

		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.insights).toBeArray();
		expect(body.insights.length).toBeLessThanOrEqual(10);
	});
});

// ─── POST /api/context (hybrid search) ─────────────────────────────────────

describe("POST /api/context", () => {
	test("returns results with query only (no embedding, falls back to FTS)", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/context", {
				method: "POST",
				headers: authHeader(token),
				body: JSON.stringify({
					query: "pgvector embedding",
					strategy: "fts",
					limit: 10,
				}),
			}),
		);

		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.insights).toBeArray();
		expect(body.insights.length).toBeGreaterThanOrEqual(1);
	});

	test("hybrid strategy without embedding falls back to FTS", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/context", {
				method: "POST",
				headers: authHeader(token),
				body: JSON.stringify({
					query: "pgvector",
					strategy: "hybrid",
					limit: 10,
				}),
			}),
		);

		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.insights).toBeArray();
	});

	test("vector strategy with embedding returns results", async () => {
		const embedding = new Array(1536).fill(0.01);
		const res = await app.fetch(
			new Request("http://localhost/api/context", {
				method: "POST",
				headers: authHeader(token),
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

	test("returns 400 without query", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/context", {
				method: "POST",
				headers: authHeader(token),
				body: JSON.stringify({ strategy: "fts", limit: 10 }),
			}),
		);

		expect(res.status).toBe(400);
	});

	test("returns 400 with empty query", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/context", {
				method: "POST",
				headers: authHeader(token),
				body: JSON.stringify({ query: "", strategy: "fts" }),
			}),
		);

		expect(res.status).toBe(400);
	});

	test("returns 400 with invalid strategy", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/context", {
				method: "POST",
				headers: authHeader(token),
				body: JSON.stringify({ query: "test", strategy: "invalid" }),
			}),
		);

		expect(res.status).toBe(400);
	});

	test("returns 400 with wrong embedding dimension", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/context", {
				method: "POST",
				headers: authHeader(token),
				body: JSON.stringify({
					query: "test",
					embedding: [0.1, 0.2, 0.3], // wrong size, needs 1536
					strategy: "vector",
				}),
			}),
		);

		expect(res.status).toBe(400);
	});

	test("results are org-scoped (secondary org cannot see primary insights)", async () => {
		// Search from secondary org for "Redis caching" (primary org insight)
		const res = await app.fetch(
			new Request("http://localhost/api/context", {
				method: "POST",
				headers: authHeader(otherToken),
				body: JSON.stringify({
					query: "Redis caching abandoned search layer",
					strategy: "fts",
					limit: 10,
				}),
			}),
		);

		expect(res.status).toBe(200);
		const body = await res.json();
		// Should NOT find primary org's "Redis caching abandoned" insight
		const ids = body.insights.map((i: { id: string }) => i.id);
		expect(ids).not.toContain(insightIds[1]);
	});

	test("returns 401 without auth", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/context", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ query: "test" }),
			}),
		);

		expect(res.status).toBe(401);
	});
});

// ─── GET /api/context ───────────────────────────────────────────────────────

describe("GET /api/context", () => {
	test("returns FTS results for matching query", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/context?query=pgvector", {
				headers: authHeader(token),
			}),
		);

		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.insights).toBeArray();
		expect(body.insights.length).toBeGreaterThanOrEqual(1);
	});

	test("returns empty for non-matching query", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/context?query=xyznonexistent999abc", {
				headers: authHeader(token),
			}),
		);

		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.insights).toBeArray();
		expect(body.insights).toHaveLength(0);
	});

	test("returns 400 without query param", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/context", {
				headers: authHeader(token),
			}),
		);

		expect(res.status).toBe(400);
	});

	test("supports strategy and limit params", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/context?query=pgvector&strategy=fts&limit=5", {
				headers: authHeader(token),
			}),
		);

		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.insights).toBeArray();
		expect(body.insights.length).toBeLessThanOrEqual(5);
	});

	test("returns 401 without auth", async () => {
		const res = await app.fetch(new Request("http://localhost/api/context?query=test"));

		expect(res.status).toBe(401);
	});
});

// ─── GET /api/context/file/* ────────────────────────────────────────────────

describe("GET /api/context/file/*", () => {
	test("returns insights matching a file path", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/context/file/src/db/client.ts?repo=glieai/pulse", {
				headers: authHeader(token),
			}),
		);

		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.insights).toBeArray();
		expect(body.insights.length).toBeGreaterThanOrEqual(1);
	});

	test("returns insights for a shared file across multiple insights", async () => {
		// src/services/search.ts is in insight 1 and insight 2
		const res = await app.fetch(
			new Request("http://localhost/api/context/file/src/services/search.ts?repo=glieai/pulse", {
				headers: authHeader(token),
			}),
		);

		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.insights).toBeArray();
		expect(body.insights.length).toBeGreaterThanOrEqual(2);
	});

	test("returns empty for non-existent file", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/context/file/does/not/exist.ts?repo=glieai/pulse", {
				headers: authHeader(token),
			}),
		);

		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.insights).toBeArray();
		expect(body.insights).toHaveLength(0);
	});

	test("returns 400 without repo param", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/context/file/src/db/client.ts", {
				headers: authHeader(token),
			}),
		);

		expect(res.status).toBe(400);
	});

	test("rejects path traversal via encoded dots", async () => {
		const res = await app.fetch(
			new Request(
				"http://localhost/api/context/file/src%2F..%2F..%2Fetc%2Fpasswd?repo=glieai/pulse",
				{
					headers: authHeader(token),
				},
			),
		);

		// Handler catches ".." in decoded path → 400
		expect(res.status).toBe(400);
	});

	test("path traversal via URL normalization returns 404 (no route match)", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/context/file/../../../etc/passwd?repo=glieai/pulse", {
				headers: authHeader(token),
			}),
		);

		// URL parser resolves /../.. before reaching handler — Hono returns 404
		expect(res.status).toBe(404);
	});

	test("rejects empty file path", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/context/file/?repo=glieai/pulse", {
				headers: authHeader(token),
			}),
		);

		// Empty path → 400 (handler checks !filePath)
		expect(res.status).toBe(400);
	});

	test("file context is org-scoped", async () => {
		// Secondary org should not see primary org file insights
		const res = await app.fetch(
			new Request("http://localhost/api/context/file/src/cache/redis.ts?repo=glieai/pulse", {
				headers: authHeader(otherToken),
			}),
		);

		expect(res.status).toBe(200);
		const body = await res.json();
		// Should NOT contain primary org's redis insight (insightIds[1])
		const ids = body.insights.map((i: { id: string }) => i.id);
		expect(ids).not.toContain(insightIds[1]);
	});

	test("returns 401 without auth", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/context/file/src/db/client.ts?repo=glieai/pulse"),
		);

		expect(res.status).toBe(401);
	});
});
