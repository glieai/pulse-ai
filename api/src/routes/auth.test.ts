import { afterAll, describe, expect, test } from "bun:test";
import { sql } from "../db/client";

const { app } = await import("../index");

async function register(body: Record<string, unknown>) {
	return app.fetch(
		new Request("http://localhost/api/auth/register", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		}),
	);
}

async function login(body: Record<string, unknown>) {
	return app.fetch(
		new Request("http://localhost/api/auth/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		}),
	);
}

const testEmail = `test-${crypto.randomUUID()}@test.com`;
const testOrg = `Test Org ${crypto.randomUUID().slice(0, 8)}`;

afterAll(async () => {
	// Cleanup test data
	await sql`DELETE FROM users WHERE email = ${testEmail}`;
	await sql`DELETE FROM orgs WHERE name = ${testOrg}`;
});

describe("POST /api/auth/register", () => {
	test("creates org and user, returns 201 with token", async () => {
		const res = await register({
			org_name: testOrg,
			name: "Test User",
			email: testEmail,
			password: "test1234",
		});
		const body = await res.json();

		expect(res.status).toBe(201);
		expect(body.token).toBeString();
		expect(body.org.name).toBe(testOrg);
		expect(body.org.slug).toBeString();
		expect(body.user.email).toBe(testEmail);
		expect(body.user.role).toBe("owner");
		expect(body.user.password_hash).toBeUndefined();
	});

	test("returns 409 for duplicate email", async () => {
		const res = await register({
			org_name: `Another Org ${crypto.randomUUID().slice(0, 8)}`,
			name: "Test User",
			email: testEmail,
			password: "test1234",
		});

		expect(res.status).toBe(409);
		const body = await res.json();
		expect(body.error).toContain("Email");
	});

	test("returns 400 for invalid input", async () => {
		const res = await register({ org_name: "", email: "not-email" });
		expect(res.status).toBe(400);
	});
});

describe("POST /api/auth/login", () => {
	test("returns 200 with token for valid credentials", async () => {
		const res = await login({ email: testEmail, password: "test1234" });
		const body = await res.json();

		expect(res.status).toBe(200);
		expect(body.token).toBeString();
		expect(body.user.email).toBe(testEmail);
		expect(body.user.password_hash).toBeUndefined();
	});

	test("returns 401 for wrong password", async () => {
		const res = await login({ email: testEmail, password: "wrongpass" });
		expect(res.status).toBe(401);
	});

	test("returns 401 for non-existent email", async () => {
		const res = await login({
			email: "nope@nope.com",
			password: "test1234",
		});
		expect(res.status).toBe(401);
	});
});

describe("POST /api/auth/token", () => {
	test("returns 401 without auth", async () => {
		const res = await app.fetch(new Request("http://localhost/api/auth/token", { method: "POST" }));
		expect(res.status).toBe(401);
	});

	test("returns 201 with API token when authenticated", async () => {
		// Login first
		const loginRes = await login({ email: testEmail, password: "test1234" });
		const { token: jwt } = await loginRes.json();

		const res = await app.fetch(
			new Request("http://localhost/api/auth/token", {
				method: "POST",
				headers: { Authorization: `Bearer ${jwt}` },
			}),
		);
		const body = await res.json();

		expect(res.status).toBe(201);
		expect(body.token).toStartWith("pulse_");
		expect(body.created_at).toBeDefined();
	});

	test("API token can authenticate requests", async () => {
		// Login and create API token
		const loginRes = await login({ email: testEmail, password: "test1234" });
		const { token: jwt } = await loginRes.json();

		const tokenRes = await app.fetch(
			new Request("http://localhost/api/auth/token", {
				method: "POST",
				headers: { Authorization: `Bearer ${jwt}` },
			}),
		);
		const { token: apiToken } = await tokenRes.json();

		// Use API token to access health (any authenticated endpoint)
		const healthRes = await app.fetch(
			new Request("http://localhost/api/health", {
				headers: { Authorization: `Bearer ${apiToken}` },
			}),
		);

		expect(healthRes.status).toBe(200);
	});
});
