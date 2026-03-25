import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { sql } from "../db/client";

const { app } = await import("../index");

let jwt: string;
let orgId: string;
const testEmail = `insight-test-${crypto.randomUUID()}@test.com`;
const testOrg = `Insight Test ${crypto.randomUUID().slice(0, 8)}`;

beforeAll(async () => {
	const res = await app.fetch(
		new Request("http://localhost/api/auth/register", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				org_name: testOrg,
				name: "Insight Tester",
				email: testEmail,
				password: "test1234",
			}),
		}),
	);
	const body = await res.json();
	jwt = body.token;
	orgId = body.org.id;
});

afterAll(async () => {
	await sql`DELETE FROM insights WHERE org_id = ${orgId}`;
	await sql`DELETE FROM users WHERE email = ${testEmail}`;
	await sql`DELETE FROM orgs WHERE id = ${orgId}`;
});

function authHeaders() {
	return {
		Authorization: `Bearer ${jwt}`,
		"Content-Type": "application/json",
	};
}

const sampleInsight = {
	kind: "decision",
	title: "Use PostgreSQL for everything",
	body: "Single database for relational, FTS, and vector search.",
	structured: { why: "No extra infra" },
	repo: "glieai/pulse",
	trigger_type: "manual",
};

describe("POST /api/insights", () => {
	test("creates insight and returns 201", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/insights", {
				method: "POST",
				headers: authHeaders(),
				body: JSON.stringify(sampleInsight),
			}),
		);
		const body = await res.json();

		expect(res.status).toBe(201);
		expect(body.id).toBeDefined();
		expect(body.kind).toBe("decision");
		expect(body.title).toBe(sampleInsight.title);
		expect(body.content_hash).toBeDefined();
		expect(body.org_id).toBe(orgId);
		expect(body.author_name).toBe("Insight Tester");
	});

	test("returns 200 for duplicate (dedup via content_hash)", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/insights", {
				method: "POST",
				headers: authHeaders(),
				body: JSON.stringify(sampleInsight),
			}),
		);

		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.id).toBeDefined();
	});

	test("returns 400 for invalid input", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/insights", {
				method: "POST",
				headers: authHeaders(),
				body: JSON.stringify({ kind: "invalid" }),
			}),
		);

		expect(res.status).toBe(400);
	});

	test("returns 401 without auth", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/insights", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(sampleInsight),
			}),
		);

		expect(res.status).toBe(401);
	});
});

describe("GET /api/insights", () => {
	test("returns paginated list", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/insights?limit=10&offset=0", {
				headers: authHeaders(),
			}),
		);
		const body = await res.json();

		expect(res.status).toBe(200);
		expect(body.insights).toBeArray();
		expect(body.total).toBeGreaterThanOrEqual(1);
		expect(body.limit).toBe(10);
		expect(body.offset).toBe(0);
	});

	test("filters by kind", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/insights?kind=decision", {
				headers: authHeaders(),
			}),
		);
		const body = await res.json();

		expect(res.status).toBe(200);
		for (const insight of body.insights) {
			expect(insight.kind).toBe("decision");
		}
	});

	test("filters by repo", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/insights?repo=glieai/pulse", {
				headers: authHeaders(),
			}),
		);
		const body = await res.json();

		expect(res.status).toBe(200);
		for (const insight of body.insights) {
			expect(insight.repo).toBe("glieai/pulse");
		}
	});
});

describe("GET /api/insights/:id", () => {
	test("returns insight by id", async () => {
		// First get an insight id
		const listRes = await app.fetch(
			new Request("http://localhost/api/insights?limit=1", {
				headers: authHeaders(),
			}),
		);
		const { insights: list } = await listRes.json();
		const insightId = list[0].id;

		const res = await app.fetch(
			new Request(`http://localhost/api/insights/${insightId}`, {
				headers: authHeaders(),
			}),
		);
		const body = await res.json();

		expect(res.status).toBe(200);
		expect(body.id).toBe(insightId);
	});

	test("returns 404 for non-existent id", async () => {
		const fakeId = "00000000-0000-0000-0000-000000000000";
		const res = await app.fetch(
			new Request(`http://localhost/api/insights/${fakeId}`, {
				headers: authHeaders(),
			}),
		);

		expect(res.status).toBe(404);
	});
});

describe("org isolation", () => {
	test("user from another org cannot see insights", async () => {
		// Register a second org
		const otherEmail = `other-${crypto.randomUUID()}@test.com`;
		const regRes = await app.fetch(
			new Request("http://localhost/api/auth/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					org_name: `Other Org ${crypto.randomUUID().slice(0, 8)}`,
					name: "Other User",
					email: otherEmail,
					password: "test1234",
				}),
			}),
		);
		const { token: otherJwt, org: otherOrg } = await regRes.json();

		// Try to list insights — should see none from first org
		const listRes = await app.fetch(
			new Request("http://localhost/api/insights", {
				headers: {
					Authorization: `Bearer ${otherJwt}`,
					"Content-Type": "application/json",
				},
			}),
		);
		const body = await listRes.json();

		expect(body.total).toBe(0);
		expect(body.insights).toHaveLength(0);

		// Cleanup
		await sql`DELETE FROM users WHERE email = ${otherEmail}`;
		await sql`DELETE FROM orgs WHERE id = ${otherOrg.id}`;
	});
});
