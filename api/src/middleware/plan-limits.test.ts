import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { sql } from "../db/client";
import { env } from "../env";
import { app, authHeader, createTestOrg } from "../test-utils";

// Plan enforcement is skipped in solo mode — force team mode for these tests
env.PULSE_MODE = "team";

type TestOrg = Awaited<ReturnType<typeof createTestOrg>>;

let freeOrg: TestOrg;
let proOrg: TestOrg;

const orgIds: string[] = [];
const userIds: string[] = [];

beforeAll(async () => {
	// Create a free-plan org (default)
	freeOrg = await createTestOrg(`planlim-f-${crypto.randomUUID().slice(0, 6)}`);
	orgIds.push(freeOrg.orgId);
	userIds.push(freeOrg.userId);

	// Create a pro-plan org (will be upgraded via SQL)
	proOrg = await createTestOrg(`planlim-p-${crypto.randomUUID().slice(0, 6)}`);
	orgIds.push(proOrg.orgId);
	userIds.push(proOrg.userId);

	await sql`UPDATE orgs SET plan = 'pro' WHERE id = ${proOrg.orgId}`;
});

afterAll(async () => {
	// orgIds/userIds include all orgs created during tests (freeOrg, proOrg, inviteOrg)
	if (orgIds.length === 0) return;
	await sql`DELETE FROM audit_log WHERE org_id = ANY(${orgIds})`;
	await sql`DELETE FROM invitations WHERE org_id = ANY(${orgIds})`;
	await sql`DELETE FROM insights WHERE org_id = ANY(${orgIds})`;
	await sql`DELETE FROM api_tokens WHERE user_id = ANY(${userIds})`;
	await sql`DELETE FROM users WHERE org_id = ANY(${orgIds})`;
	await sql`DELETE FROM orgs WHERE id = ANY(${orgIds})`;
});

// ─── Free plan: max_repos = 3 ────────────────────────────────────────────────

describe("free plan: max_repos limit", () => {
	test("can create insights for 3 different repos", async () => {
		const repos = ["free-test/repo1", "free-test/repo2", "free-test/repo3"];
		for (const repo of repos) {
			const res = await app.fetch(
				new Request("http://localhost/api/insights", {
					method: "POST",
					headers: authHeader(freeOrg.token),
					body: JSON.stringify({
						kind: "context",
						title: `Insight for ${repo}`,
						body: `Testing repo limit with ${repo}`,
						repo,
						trigger_type: "manual",
						status: "published",
					}),
				}),
			);

			expect(res.status).toBe(201);
		}
	});

	test("creating insight for a 4th repo returns 402 with upgrade_required", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/insights", {
				method: "POST",
				headers: authHeader(freeOrg.token),
				body: JSON.stringify({
					kind: "context",
					title: "Insight for repo4",
					body: "This should be blocked by the repo limit",
					repo: "free-test/repo4",
					trigger_type: "manual",
					status: "published",
				}),
			}),
		);

		expect(res.status).toBe(402);
		const body = await res.json();
		expect(body.upgrade_required).toBe(true);
		expect(body.plan).toBe("free");
		expect(body.limit).toBe(3);
		expect(body.current).toBe(3);
		expect(body.error).toContain("repos");
	});

	test("at repo limit, even existing repo is blocked (middleware is pre-check)", async () => {
		// The middleware checks `current >= max` before the handler runs.
		// It cannot know if the new insight targets an existing repo or a new one,
		// so it blocks all insight creation once the repo limit is reached.
		const res = await app.fetch(
			new Request("http://localhost/api/insights", {
				method: "POST",
				headers: authHeader(freeOrg.token),
				body: JSON.stringify({
					kind: "context",
					title: "Another insight for repo1",
					body: "Same repo but middleware blocks pre-emptively",
					repo: "free-test/repo1",
					trigger_type: "manual",
					status: "published",
				}),
			}),
		);

		expect(res.status).toBe(402);
		const body = await res.json();
		expect(body.upgrade_required).toBe(true);
	});
});

// ─── Free plan: max_users = 3 (via invite endpoint) ──────────────────────────

describe("free plan: max_users limit on invite", () => {
	let inviteOrg: TestOrg;

	beforeAll(async () => {
		inviteOrg = await createTestOrg(`planlim-inv-${crypto.randomUUID().slice(0, 6)}`);
		orgIds.push(inviteOrg.orgId);
		userIds.push(inviteOrg.userId);

		// Org already has 1 user (the owner). Add 2 more to reach the limit of 3.
		for (let i = 1; i <= 2; i++) {
			const email = `extra-user-${crypto.randomUUID().slice(0, 8)}@test.com`;
			await sql`
				INSERT INTO users (org_id, name, email, password_hash, role, is_active)
				VALUES (${inviteOrg.orgId}, ${`Extra User ${i}`}, ${email}, 'unused', 'member', true)
			`;
		}
	});

	test("inviting a 4th user returns 402 when at max_users limit", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/org/invite", {
				method: "POST",
				headers: authHeader(inviteOrg.token),
				body: JSON.stringify({
					email: "fourth-user@test.com",
					role: "member",
				}),
			}),
		);

		expect(res.status).toBe(402);
		const body = await res.json();
		expect(body.upgrade_required).toBe(true);
		expect(body.plan).toBe("free");
		expect(body.limit).toBe(3);
		expect(body.current).toBe(3);
		expect(body.error).toContain("users");
	});
});

// ─── Pro plan: can exceed free limits ────────────────────────────────────────

describe("pro plan: exceeds free limits", () => {
	test("can create insights for more than 3 repos", async () => {
		const repos = [
			"pro-test/repo1",
			"pro-test/repo2",
			"pro-test/repo3",
			"pro-test/repo4",
			"pro-test/repo5",
		];

		for (const repo of repos) {
			const res = await app.fetch(
				new Request("http://localhost/api/insights", {
					method: "POST",
					headers: authHeader(proOrg.token),
					body: JSON.stringify({
						kind: "context",
						title: `Pro insight for ${repo}`,
						body: `Pro plan should have unlimited repos: ${repo}`,
						repo,
						trigger_type: "manual",
						status: "published",
					}),
				}),
			);

			expect(res.status).toBe(201);
		}
	});
});

// ─── 402 response format ─────────────────────────────────────────────────────

describe("402 response format", () => {
	test("contains all required fields", async () => {
		// Use the free org that already has 3 repos — try a 4th
		const res = await app.fetch(
			new Request("http://localhost/api/insights", {
				method: "POST",
				headers: authHeader(freeOrg.token),
				body: JSON.stringify({
					kind: "context",
					title: "Format check insight",
					body: "Checking 402 response format",
					repo: "free-test/format-check-repo",
					trigger_type: "manual",
					status: "published",
				}),
			}),
		);

		expect(res.status).toBe(402);
		const body = await res.json();

		// Verify all expected fields
		expect(body).toHaveProperty("error");
		expect(body).toHaveProperty("limit");
		expect(body).toHaveProperty("current");
		expect(body).toHaveProperty("plan");
		expect(body).toHaveProperty("upgrade_required");

		expect(typeof body.error).toBe("string");
		expect(typeof body.limit).toBe("number");
		expect(typeof body.current).toBe("number");
		expect(typeof body.plan).toBe("string");
		expect(body.upgrade_required).toBe(true);
		expect(body.plan).toBe("free");
	});
});
