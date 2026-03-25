import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { sign } from "hono/jwt";
import { sql } from "../db/client";
import { env } from "../env";
import { app, authHeader, createTestOrg } from "../test-utils";

let testOrg: Awaited<ReturnType<typeof createTestOrg>>;

beforeAll(async () => {
	testOrg = await createTestOrg("auth-flow");
});

afterAll(async () => {
	await sql`DELETE FROM api_tokens WHERE org_id = ${testOrg.orgId}`;
	await sql`DELETE FROM users WHERE email = ${testOrg.email}`;
	await sql`DELETE FROM orgs WHERE id = ${testOrg.orgId}`;
});

describe("auth edge cases", () => {
	test("register duplicate email returns 409", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/auth/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					org_name: `New Org ${crypto.randomUUID().slice(0, 8)}`,
					name: "New User",
					email: testOrg.email,
					password: "test1234",
				}),
			}),
		);

		expect(res.status).toBe(409);
	});

	test("login with wrong password returns 401", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: testOrg.email, password: "wrongwrong" }),
			}),
		);

		expect(res.status).toBe(401);
	});

	test("login with non-existent email returns 401", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: "nope@nope.com", password: "test1234" }),
			}),
		);

		expect(res.status).toBe(401);
	});

	test("access protected endpoint without token returns 401", async () => {
		const res = await app.fetch(new Request("http://localhost/api/insights"));
		expect(res.status).toBe(401);
	});

	test("access with invalid JWT returns 401", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/insights", {
				headers: { Authorization: "Bearer invalid.jwt.token" },
			}),
		);

		expect(res.status).toBe(401);
	});

	test("access with invalid API token returns 401", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/insights", {
				headers: { Authorization: "Bearer pulse_invalidtoken123" },
			}),
		);

		expect(res.status).toBe(401);
	});

	test("expired JWT is rejected by endpoint", async () => {
		const now = Math.floor(Date.now() / 1000);
		const expired = await sign(
			{ user_id: "u1", org_id: testOrg.orgId, role: "owner", iat: now - 200, exp: now - 100 },
			env.JWT_SECRET,
			"HS256",
		);

		const res = await app.fetch(
			new Request("http://localhost/api/insights", {
				headers: { Authorization: `Bearer ${expired}` },
			}),
		);
		expect(res.status).toBe(401);
	});

	test("API token is stateless — works across multiple requests", async () => {
		// Create API token
		const tokenRes = await app.fetch(
			new Request("http://localhost/api/auth/token", {
				method: "POST",
				headers: authHeader(testOrg.token),
			}),
		);
		const { token: apiToken } = await tokenRes.json();

		// First request
		const res1 = await app.fetch(
			new Request("http://localhost/api/insights", { headers: authHeader(apiToken) }),
		);
		expect(res1.status).toBe(200);

		// Second request
		const res2 = await app.fetch(
			new Request("http://localhost/api/insights", { headers: authHeader(apiToken) }),
		);
		expect(res2.status).toBe(200);
	});
});
