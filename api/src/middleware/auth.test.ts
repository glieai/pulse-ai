import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { sql } from "../db/client";
import { env } from "../env";
import { signJwt } from "../services/auth";
import { app, authHeader, createTestOrg } from "../test-utils";

// Force team mode so the auth middleware actually validates tokens
env.PULSE_MODE = "team";

const orgIds: string[] = [];
const userIds: string[] = [];

let validToken: string;
let validOrgId: string;
let validUserId: string;

beforeAll(async () => {
	const org = await createTestOrg("auth-mw");
	validToken = org.token;
	validOrgId = org.orgId;
	validUserId = org.userId;
	orgIds.push(validOrgId);
	userIds.push(validUserId);
});

afterAll(async () => {
	if (userIds.length > 0) {
		await sql`DELETE FROM api_tokens WHERE user_id IN ${sql(userIds)}`;
	}
	if (orgIds.length > 0) {
		await sql`DELETE FROM insights WHERE org_id IN ${sql(orgIds)}`;
		await sql`DELETE FROM users WHERE org_id IN ${sql(orgIds)}`;
		await sql`DELETE FROM orgs WHERE id IN ${sql(orgIds)}`;
	}
});

// Helper: hit a protected endpoint to exercise the auth middleware
async function fetchProtected(headers: Record<string, string> = {}) {
	return app.fetch(
		new Request("http://localhost/api/insights?limit=1", {
			headers: { "Content-Type": "application/json", ...headers },
		}),
	);
}

// ─── Missing / Malformed Authorization ──────────────────────────────────────

describe("missing or malformed authorization", () => {
	test("returns 401 when Authorization header is missing", async () => {
		const res = await fetchProtected();

		expect(res.status).toBe(401);
		const body = await res.json();
		expect(body.error).toBe("Missing authorization");
	});

	test("returns 401 when Authorization header has no Bearer prefix", async () => {
		const res = await fetchProtected({ Authorization: "Token some-value" });

		expect(res.status).toBe(401);
		const body = await res.json();
		expect(body.error).toBe("Missing authorization");
	});

	test("returns 401 when Authorization is 'Bearer' with no token value", async () => {
		// "Bearer" without trailing space+token — startsWith("Bearer ") is false
		const res = await fetchProtected({ Authorization: "Bearer" });

		expect(res.status).toBe(401);
		const body = await res.json();
		expect(body.error).toBe("Missing authorization");
	});

	test("returns 401 when Authorization header is empty string", async () => {
		const res = await fetchProtected({ Authorization: "" });

		expect(res.status).toBe(401);
		const body = await res.json();
		expect(body.error).toBe("Missing authorization");
	});

	test("returns 401 for Basic auth scheme", async () => {
		const encoded = btoa("user:pass");
		const res = await fetchProtected({ Authorization: `Basic ${encoded}` });

		expect(res.status).toBe(401);
		const body = await res.json();
		expect(body.error).toBe("Missing authorization");
	});

	test("case-sensitive Bearer prefix — lowercase rejected", async () => {
		const res = await fetchProtected({
			Authorization: `bearer ${validToken}`,
		});

		expect(res.status).toBe(401);
	});
});

// ─── JWT Authentication ─────────────────────────────────────────────────────

describe("JWT authentication", () => {
	test("valid JWT grants access", async () => {
		const res = await fetchProtected({ Authorization: `Bearer ${validToken}` });

		expect(res.status).toBe(200);
	});

	test("expired JWT returns 401", async () => {
		const { sign } = await import("hono/jwt");
		const now = Math.floor(Date.now() / 1000);
		const expiredToken = await sign(
			{
				user_id: validUserId,
				org_id: validOrgId,
				role: "owner",
				name: "Test User",
				iat: now - 200,
				exp: now - 100,
			},
			env.JWT_SECRET,
			"HS256",
		);

		const res = await fetchProtected({ Authorization: `Bearer ${expiredToken}` });

		expect(res.status).toBe(401);
		const body = await res.json();
		expect(body.error).toBe("Invalid or expired token");
	});

	test("tampered JWT returns 401", async () => {
		const tamperedToken = `${validToken}tampered`;

		const res = await fetchProtected({ Authorization: `Bearer ${tamperedToken}` });

		expect(res.status).toBe(401);
		const body = await res.json();
		expect(body.error).toBe("Invalid or expired token");
	});

	test("JWT signed with wrong secret returns 401", async () => {
		const { sign } = await import("hono/jwt");
		const now = Math.floor(Date.now() / 1000);
		const badToken = await sign(
			{
				user_id: validUserId,
				org_id: validOrgId,
				role: "owner",
				name: "Test User",
				iat: now,
				exp: now + 3600,
			},
			"completely-wrong-secret-key-12345",
			"HS256",
		);

		const res = await fetchProtected({ Authorization: `Bearer ${badToken}` });

		expect(res.status).toBe(401);
		const body = await res.json();
		expect(body.error).toBe("Invalid or expired token");
	});

	test("JWT with garbage payload returns 401", async () => {
		const res = await fetchProtected({
			Authorization: "Bearer eyJhbGciOiJIUzI1NiJ9.dGhpcyBpcyBub3QganNvbg.invalid",
		});

		expect(res.status).toBe(401);
		const body = await res.json();
		expect(body.error).toBe("Invalid or expired token");
	});

	test("completely random string (not JWT format) returns 401", async () => {
		const res = await fetchProtected({
			Authorization: "Bearer some-random-string-not-jwt",
		});

		expect(res.status).toBe(401);
		const body = await res.json();
		expect(body.error).toBe("Invalid or expired token");
	});

	test("empty Bearer token (trailing space) returns 401", async () => {
		const res = await fetchProtected({
			Authorization: "Bearer ",
		});

		expect(res.status).toBe(401);
		// "Bearer " may be treated as missing (header trimming) or as empty JWT
		const body = await res.json();
		expect(["Missing authorization", "Invalid or expired token"]).toContain(body.error);
	});

	test("valid JWT for deactivated user returns 401 'Account deactivated'", async () => {
		// Create a separate user to deactivate
		const deactivateOrg = await createTestOrg("auth-mw-deactivate");
		orgIds.push(deactivateOrg.orgId);
		userIds.push(deactivateOrg.userId);

		// Verify the token works before deactivation
		const resBefore = await fetchProtected({
			Authorization: `Bearer ${deactivateOrg.token}`,
		});
		expect(resBefore.status).toBe(200);

		// Deactivate user via SQL
		await sql`UPDATE users SET is_active = false WHERE id = ${deactivateOrg.userId}`;

		// The same JWT should now fail
		const resAfter = await fetchProtected({
			Authorization: `Bearer ${deactivateOrg.token}`,
		});

		expect(resAfter.status).toBe(401);
		const body = await resAfter.json();
		expect(body.error).toBe("Account deactivated");

		// Reactivate so cleanup can proceed cleanly
		await sql`UPDATE users SET is_active = true WHERE id = ${deactivateOrg.userId}`;
	});

	test("JWT for non-existent user returns 401 'Account deactivated'", async () => {
		// signJwt with a user_id that doesn't exist in DB
		const fakeToken = await signJwt({
			user_id: "00000000-0000-0000-0000-000000000000",
			org_id: validOrgId,
			role: "owner",
			name: "Ghost User",
			email: "ghost@test.com",
		});

		const res = await fetchProtected({ Authorization: `Bearer ${fakeToken}` });

		expect(res.status).toBe(401);
		const body = await res.json();
		// Non-existent user → user is falsy → is_active check fails
		expect(body.error).toBe("Account deactivated");
	});
});

// ─── API Token Authentication ───────────────────────────────────────────────

describe("API token authentication", () => {
	test("valid API token grants access", async () => {
		// Create API token via endpoint
		const tokenRes = await app.fetch(
			new Request("http://localhost/api/auth/token", {
				method: "POST",
				headers: { Authorization: `Bearer ${validToken}` },
			}),
		);

		expect(tokenRes.status).toBe(201);
		const { token: apiToken } = await tokenRes.json();
		expect(apiToken).toStartWith("pulse_");

		// Use the API token to access a protected endpoint
		const res = await fetchProtected({ Authorization: `Bearer ${apiToken}` });

		expect(res.status).toBe(200);
	});

	test("invalid API token (non-existent hash) returns 401", async () => {
		const res = await fetchProtected({
			Authorization:
				"Bearer pulse_0000000000000000000000000000000000000000000000000000000000000000",
		});

		expect(res.status).toBe(401);
		const body = await res.json();
		expect(body.error).toBe("Invalid API token");
	});

	test("truncated API token returns 401", async () => {
		const res = await fetchProtected({
			Authorization: "Bearer pulse_abc123",
		});

		expect(res.status).toBe(401);
		const body = await res.json();
		expect(body.error).toBe("Invalid API token");
	});

	test("API token for deactivated user returns 401 'Invalid API token'", async () => {
		// Create a separate user for this test
		const deactivateOrg = await createTestOrg("auth-mw-apitoken-deact");
		orgIds.push(deactivateOrg.orgId);
		userIds.push(deactivateOrg.userId);

		// Create API token
		const tokenRes = await app.fetch(
			new Request("http://localhost/api/auth/token", {
				method: "POST",
				headers: { Authorization: `Bearer ${deactivateOrg.token}` },
			}),
		);
		expect(tokenRes.status).toBe(201);
		const { token: apiToken } = await tokenRes.json();

		// Verify it works before deactivation
		const resBefore = await fetchProtected({ Authorization: `Bearer ${apiToken}` });
		expect(resBefore.status).toBe(200);

		// Deactivate user
		await sql`UPDATE users SET is_active = false WHERE id = ${deactivateOrg.userId}`;

		// API token should now fail
		const resAfter = await fetchProtected({ Authorization: `Bearer ${apiToken}` });

		expect(resAfter.status).toBe(401);
		const body = await resAfter.json();
		// validateApiToken checks is_active and returns null when inactive
		expect(body.error).toBe("Invalid API token");

		// Reactivate so cleanup can proceed
		await sql`UPDATE users SET is_active = true WHERE id = ${deactivateOrg.userId}`;
	});

	test("API token authenticates with correct org context", async () => {
		// Create API token
		const tokenRes = await app.fetch(
			new Request("http://localhost/api/auth/token", {
				method: "POST",
				headers: { Authorization: `Bearer ${validToken}` },
			}),
		);
		const { token: apiToken } = await tokenRes.json();

		// Create an insight with JWT
		const insightRes = await app.fetch(
			new Request("http://localhost/api/insights", {
				method: "POST",
				headers: authHeader(validToken),
				body: JSON.stringify({
					kind: "context",
					title: "API token org context test insight",
					body: "Created via JWT, should be visible via API token of same org.",
					repo: "test/auth-mw",
					trigger_type: "manual",
					status: "published",
				}),
			}),
		);
		const insight = await insightRes.json();

		// List insights using API token — should see the insight
		const listRes = await app.fetch(
			new Request("http://localhost/api/insights?limit=50", {
				headers: { Authorization: `Bearer ${apiToken}`, "Content-Type": "application/json" },
			}),
		);

		expect(listRes.status).toBe(200);
		const listBody = await listRes.json();
		const ids = listBody.insights.map((i: { id: string }) => i.id);
		expect(ids).toContain(insight.id);
	});

	test("API token from org A cannot see org B insights", async () => {
		// Create a second org
		const orgB = await createTestOrg("auth-mw-orgb");
		orgIds.push(orgB.orgId);
		userIds.push(orgB.userId);

		// Create insight in org B
		await app.fetch(
			new Request("http://localhost/api/insights", {
				method: "POST",
				headers: authHeader(orgB.token),
				body: JSON.stringify({
					kind: "context",
					title: "Org B secret insight for auth test",
					body: "This should not be visible to org A.",
					repo: "test/orgb",
					trigger_type: "manual",
					status: "published",
				}),
			}),
		);

		// Create API token for org A (validToken is org A)
		const tokenRes = await app.fetch(
			new Request("http://localhost/api/auth/token", {
				method: "POST",
				headers: { Authorization: `Bearer ${validToken}` },
			}),
		);
		const { token: apiTokenA } = await tokenRes.json();

		// List org A insights — should not see org B content
		const listRes = await app.fetch(
			new Request("http://localhost/api/insights?limit=100", {
				headers: { Authorization: `Bearer ${apiTokenA}`, "Content-Type": "application/json" },
			}),
		);

		expect(listRes.status).toBe(200);
		const listBody = await listRes.json();
		const repos = listBody.insights.map((i: { repo: string }) => i.repo);
		expect(repos).not.toContain("test/orgb");
	});
});

// ─── Concurrent Requests ────────────────────────────────────────────────────

describe("concurrent auth requests", () => {
	test("multiple valid requests with same JWT all succeed", async () => {
		const results = await Promise.all([
			fetchProtected({ Authorization: `Bearer ${validToken}` }),
			fetchProtected({ Authorization: `Bearer ${validToken}` }),
			fetchProtected({ Authorization: `Bearer ${validToken}` }),
		]);

		for (const res of results) {
			expect(res.status).toBe(200);
		}
	});

	test("mixed valid and invalid requests are handled correctly", async () => {
		const [validRes, invalidRes, missingRes] = await Promise.all([
			fetchProtected({ Authorization: `Bearer ${validToken}` }),
			fetchProtected({ Authorization: "Bearer invalid.jwt.here" }),
			fetchProtected(),
		]);

		expect(validRes.status).toBe(200);
		expect(invalidRes.status).toBe(401);
		expect(missingRes.status).toBe(401);
	});
});
