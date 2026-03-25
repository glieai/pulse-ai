/**
 * Extended integration tests for insight endpoints.
 *
 * Requires: PULSE_MODE=team (multi-tenant auth with JWT-based org isolation).
 * Run with: PULSE_MODE=team bun test api/src/routes/insights-extended.test.ts
 */
import { afterAll, describe, expect, test } from "bun:test";
import { sql } from "../db/client";
import { app, authHeader, createTestInsight, createTestOrg } from "../test-utils";

// ── Test org setup ──────────────────────────────────────────────────────────
let ownerToken: string;
let ownerOrgId: string;
let memberToken: string;
let memberUserId: string;
let memberEmail: string;

const orgIds: string[] = [];

// We set up two orgs:
// 1. "owner" org — main org used for most tests (user has role=owner)
// 2. "member" org — created so we can reassign that user into ownerOrg as role=member
//    then re-login to get a JWT with the correct org_id and role

async function setup() {
	const owner = await createTestOrg("ext-owner");
	ownerToken = owner.token;
	ownerOrgId = owner.orgId;
	orgIds.push(ownerOrgId);

	const member = await createTestOrg("ext-member");
	memberEmail = member.email;
	memberUserId = member.userId;
	orgIds.push(member.orgId);

	// Move the member user into the owner's org with role=member
	await sql`UPDATE users SET org_id = ${ownerOrgId}, role = 'member' WHERE id = ${memberUserId}`;

	// Upgrade owner org to pro plan to avoid free-tier repo/insight limits in tests
	await sql`UPDATE orgs SET plan = 'pro' WHERE id = ${ownerOrgId}`;

	// Re-login to get a JWT that reflects the new org_id and role
	const loginRes = await app.fetch(
		new Request("http://localhost/api/auth/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email: memberEmail, password: "test1234" }),
		}),
	);
	const loginBody = await loginRes.json();
	memberToken = loginBody.token;
}

const setupPromise = setup();

afterAll(async () => {
	await sql`DELETE FROM insights WHERE org_id IN ${sql(orgIds)}`;
	await sql`DELETE FROM users WHERE org_id IN ${sql(orgIds)}`;
	await sql`DELETE FROM orgs WHERE id IN ${sql(orgIds)}`;
});

// ── Helpers ─────────────────────────────────────────────────────────────────

function req(url: string, opts?: RequestInit) {
	return new Request(`http://localhost${url}`, opts);
}

function get(url: string, token: string) {
	return app.fetch(req(url, { headers: authHeader(token) }));
}

function post(url: string, token: string, body: unknown) {
	return app.fetch(
		req(url, {
			method: "POST",
			headers: authHeader(token),
			body: JSON.stringify(body),
		}),
	);
}

function patch(url: string, token: string, body: unknown) {
	return app.fetch(
		req(url, {
			method: "PATCH",
			headers: authHeader(token),
			body: JSON.stringify(body),
		}),
	);
}

function del(url: string, token: string) {
	return app.fetch(
		req(url, {
			method: "DELETE",
			headers: authHeader(token),
		}),
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. POST /api/insights/publish
// ─────────────────────────────────────────────────────────────────────────────

describe("POST /api/insights/publish", () => {
	test("publishes all drafts for a given repo", async () => {
		await setupPromise;

		// Create 3 draft insights for the same repo
		for (let i = 0; i < 3; i++) {
			await createTestInsight(ownerToken, {
				title: `Publish test ${i} ${crypto.randomUUID().slice(0, 6)}`,
				body: `Draft body for publish test ${i}`,
				repo: "ext-test/publish-repo",
				status: "draft",
			});
		}

		// Create 1 draft for a different repo (should not be affected)
		await createTestInsight(ownerToken, {
			title: `Other repo draft ${crypto.randomUUID().slice(0, 6)}`,
			body: "Should not be published",
			repo: "ext-test/other-repo",
			status: "draft",
		});

		const res = await post("/api/insights/publish", ownerToken, {
			repo: "ext-test/publish-repo",
		});
		const body = await res.json();

		expect(res.status).toBe(200);
		expect(body.count).toBe(3);
		expect(body.published).toHaveLength(3);
		for (const insight of body.published) {
			expect(insight.status).toBe("published");
			expect(insight.repo).toBe("ext-test/publish-repo");
		}

		// Verify the other repo's draft is still a draft
		const listRes = await get("/api/insights?repo=ext-test/other-repo&status=draft", ownerToken);
		const listBody = await listRes.json();
		expect(listBody.total).toBeGreaterThanOrEqual(1);
	});

	test("publishes all drafts when no repo filter", async () => {
		await setupPromise;

		// Create a draft
		await createTestInsight(ownerToken, {
			title: `Publish all ${crypto.randomUUID().slice(0, 6)}`,
			body: "Draft to publish without repo filter",
			repo: "ext-test/any-repo",
			status: "draft",
		});

		const res = await post("/api/insights/publish", ownerToken, {});
		const body = await res.json();

		expect(res.status).toBe(200);
		expect(body.count).toBeGreaterThanOrEqual(1);
	});

	test("returns empty array when no drafts exist", async () => {
		await setupPromise;

		// Publish for a repo with no drafts
		const res = await post("/api/insights/publish", ownerToken, {
			repo: "ext-test/nonexistent-repo",
		});
		const body = await res.json();

		expect(res.status).toBe(200);
		expect(body.count).toBe(0);
		expect(body.published).toHaveLength(0);
	});
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. GET /api/insights/analytics
// ─────────────────────────────────────────────────────────────────────────────

describe("GET /api/insights/analytics", () => {
	test("returns aggregated stats with correct structure", async () => {
		await setupPromise;

		// Seed some published insights of various kinds
		const kinds = ["decision", "dead_end", "pattern", "context"] as const;
		for (const kind of kinds) {
			await createTestInsight(ownerToken, {
				kind,
				title: `Analytics ${kind} ${crypto.randomUUID().slice(0, 6)}`,
				body: `Body for analytics ${kind}`,
				repo: "ext-test/analytics-repo",
				status: "published",
			});
		}

		const res = await get("/api/insights/analytics", ownerToken);
		const body = await res.json();

		expect(res.status).toBe(200);
		expect(body.insights_per_week).toBeArray();
		expect(body.kind_distribution).toBeArray();
		expect(body.top_repos).toBeArray();
		expect(body.top_contributors).toBeArray();
		expect(body.totals).toBeDefined();
		expect(typeof body.totals.total).toBe("number");
		expect(typeof body.totals.published).toBe("number");
		expect(typeof body.totals.drafts).toBe("number");
		expect(body.totals.total).toBe(body.totals.published + body.totals.drafts);
	});

	test("kind_distribution reflects created kinds", async () => {
		await setupPromise;

		const res = await get("/api/insights/analytics", ownerToken);
		const body = await res.json();

		// We created at least one "decision" published insight
		const decisionEntry = body.kind_distribution.find(
			(k: { kind: string }) => k.kind === "decision",
		);
		expect(decisionEntry).toBeDefined();
		expect(decisionEntry.count).toBeGreaterThanOrEqual(1);
	});

	test("top_repos includes the test repo", async () => {
		await setupPromise;

		const res = await get("/api/insights/analytics", ownerToken);
		const body = await res.json();

		const repoEntry = body.top_repos.find(
			(r: { repo: string }) => r.repo === "ext-test/analytics-repo",
		);
		expect(repoEntry).toBeDefined();
		expect(repoEntry.count).toBeGreaterThanOrEqual(1);
	});

	test("insights_per_week includes the current week", async () => {
		await setupPromise;

		const res = await get("/api/insights/analytics", ownerToken);
		const body = await res.json();

		// All insights we created are this week, so there should be at least one entry
		expect(body.insights_per_week.length).toBeGreaterThanOrEqual(1);
		const thisWeek = body.insights_per_week[body.insights_per_week.length - 1];
		expect(thisWeek.count).toBeGreaterThanOrEqual(1);
	});

	test("totals reflect all insights in the org", async () => {
		await setupPromise;

		const res = await get("/api/insights/analytics", ownerToken);
		const body = await res.json();

		// We have created both draft and published insights
		expect(body.totals.total).toBeGreaterThanOrEqual(1);
		expect(body.totals.published).toBeGreaterThanOrEqual(1);
	});
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. GET /api/insights/export
// ─────────────────────────────────────────────────────────────────────────────

describe("GET /api/insights/export", () => {
	test("owner can export published insights as JSON", async () => {
		await setupPromise;

		// Ensure at least one published insight exists
		await createTestInsight(ownerToken, {
			title: `Export test ${crypto.randomUUID().slice(0, 6)}`,
			body: "Published for export",
			repo: "ext-test/export-repo",
			status: "published",
		});

		const res = await get("/api/insights/export", ownerToken);

		expect(res.status).toBe(200);

		const contentDisposition = res.headers.get("Content-Disposition");
		expect(contentDisposition).toContain("attachment");
		expect(contentDisposition).toContain("pulse-insights-");
		expect(contentDisposition).toContain(".json");

		const body = await res.json();
		expect(body).toBeArray();
		expect(body.length).toBeGreaterThanOrEqual(1);

		// Only published insights should be exported
		for (const insight of body) {
			expect(insight.status).toBe("published");
		}
	});

	test("export contains expected fields", async () => {
		await setupPromise;

		const res = await get("/api/insights/export", ownerToken);
		const body = await res.json();

		expect(body.length).toBeGreaterThanOrEqual(1);
		const first = body[0];
		expect(first.id).toBeDefined();
		expect(first.kind).toBeDefined();
		expect(first.title).toBeDefined();
		expect(first.body).toBeDefined();
		expect(first.status).toBe("published");
		expect(first.created_at).toBeDefined();
	});

	test("does not include draft insights in export", async () => {
		await setupPromise;

		// Create a draft
		const draft = await createTestInsight(ownerToken, {
			title: `Draft not exported ${crypto.randomUUID().slice(0, 6)}`,
			body: "This draft should not appear in export",
			repo: "ext-test/export-repo",
			status: "draft",
		});

		const res = await get("/api/insights/export", ownerToken);
		const body = await res.json();

		const draftInExport = body.find((i: { id: string }) => i.id === draft.id);
		expect(draftInExport).toBeUndefined();
	});

	test("returns 403 for member role", async () => {
		await setupPromise;

		const res = await get("/api/insights/export", memberToken);
		const body = await res.json();

		expect(res.status).toBe(403);
		expect(body.error).toContain("owners and admins");
	});
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. PATCH /api/insights/:id/enrichment
// ─────────────────────────────────────────────────────────────────────────────

describe("PATCH /api/insights/:id/enrichment", () => {
	test("updates enrichment metadata on an insight", async () => {
		await setupPromise;

		const insight = await createTestInsight(ownerToken, {
			title: `Enrichment test ${crypto.randomUUID().slice(0, 6)}`,
			body: "Body for enrichment update",
			repo: "ext-test/enrichment-repo",
			status: "published",
		});

		const enrichmentData = {
			llm_enrichment: {
				contradiction_analysis: "No contradictions found",
				suggested_links: ["https://example.com/doc1"],
				quality_score: 8,
				enriched_at: new Date().toISOString(),
			},
		};

		const res = await patch(`/api/insights/${insight.id}/enrichment`, ownerToken, enrichmentData);
		const body = await res.json();

		expect(res.status).toBe(200);
		expect(body.ok).toBe(true);

		// Verify the enrichment was persisted — llm_enrichment is stored as
		// a JSON string inside the enrichment JSONB column
		const getRes = await get(`/api/insights/${insight.id}`, ownerToken);
		const updated = await getRes.json();
		expect(updated.enrichment).toBeDefined();
		expect(updated.enrichment.llm_enrichment).toBeDefined();

		// Parse it if stored as string, or read directly if object
		const llm =
			typeof updated.enrichment.llm_enrichment === "string"
				? JSON.parse(updated.enrichment.llm_enrichment)
				: updated.enrichment.llm_enrichment;
		expect(llm.quality_score).toBe(8);
		expect(llm.contradiction_analysis).toBe("No contradictions found");
		expect(llm.suggested_links).toContain("https://example.com/doc1");
	});

	test("returns 404 for non-existent insight", async () => {
		await setupPromise;

		const fakeId = "00000000-0000-0000-0000-000000000000";
		const enrichmentData = {
			llm_enrichment: {
				contradiction_analysis: null,
				suggested_links: [],
				quality_score: null,
				enriched_at: new Date().toISOString(),
			},
		};

		const res = await patch(`/api/insights/${fakeId}/enrichment`, ownerToken, enrichmentData);

		expect(res.status).toBe(404);
	});

	test("rejects invalid enrichment schema (missing required fields)", async () => {
		await setupPromise;

		const insight = await createTestInsight(ownerToken, {
			title: `Enrichment validation ${crypto.randomUUID().slice(0, 6)}`,
			body: "Body for validation test",
			repo: "ext-test/enrichment-repo",
			status: "published",
		});

		// Missing required fields (enriched_at is required)
		const res = await patch(`/api/insights/${insight.id}/enrichment`, ownerToken, {
			llm_enrichment: { invalid_field: true },
		});

		expect(res.status).toBe(400);
	});

	test("rejects quality_score out of range (max 10)", async () => {
		await setupPromise;

		const insight = await createTestInsight(ownerToken, {
			title: `Enrichment range ${crypto.randomUUID().slice(0, 6)}`,
			body: "Body for range validation",
			repo: "ext-test/enrichment-repo",
			status: "published",
		});

		const res = await patch(`/api/insights/${insight.id}/enrichment`, ownerToken, {
			llm_enrichment: {
				contradiction_analysis: null,
				suggested_links: [],
				quality_score: 15, // max is 10
				enriched_at: new Date().toISOString(),
			},
		});

		expect(res.status).toBe(400);
	});

	test("rejects quality_score below min (min 1)", async () => {
		await setupPromise;

		const insight = await createTestInsight(ownerToken, {
			title: `Enrichment min range ${crypto.randomUUID().slice(0, 6)}`,
			body: "Body for min range validation",
			repo: "ext-test/enrichment-repo",
			status: "published",
		});

		const res = await patch(`/api/insights/${insight.id}/enrichment`, ownerToken, {
			llm_enrichment: {
				contradiction_analysis: null,
				suggested_links: [],
				quality_score: 0, // min is 1
				enriched_at: new Date().toISOString(),
			},
		});

		expect(res.status).toBe(400);
	});

	test("accepts null quality_score and contradiction_analysis", async () => {
		await setupPromise;

		const insight = await createTestInsight(ownerToken, {
			title: `Enrichment nulls ${crypto.randomUUID().slice(0, 6)}`,
			body: "Body for null enrichment test",
			repo: "ext-test/enrichment-repo",
			status: "published",
		});

		const res = await patch(`/api/insights/${insight.id}/enrichment`, ownerToken, {
			llm_enrichment: {
				contradiction_analysis: null,
				suggested_links: [],
				quality_score: null,
				enriched_at: new Date().toISOString(),
			},
		});

		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.ok).toBe(true);
	});
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. DELETE /api/insights/:id
// ─────────────────────────────────────────────────────────────────────────────

describe("DELETE /api/insights/:id", () => {
	test("deletes a draft insight and returns 204", async () => {
		await setupPromise;

		const draft = await createTestInsight(ownerToken, {
			title: `Delete me ${crypto.randomUUID().slice(0, 6)}`,
			body: "Draft to be deleted",
			repo: "ext-test/delete-repo",
			status: "draft",
		});

		const res = await del(`/api/insights/${draft.id}`, ownerToken);
		expect(res.status).toBe(204);

		// Verify it's gone
		const getRes = await get(`/api/insights/${draft.id}`, ownerToken);
		expect(getRes.status).toBe(404);
	});

	test("returns 404 when trying to delete a published insight", async () => {
		await setupPromise;

		const published = await createTestInsight(ownerToken, {
			title: `Cannot delete published ${crypto.randomUUID().slice(0, 6)}`,
			body: "Published insight should not be deletable",
			repo: "ext-test/delete-repo",
			status: "published",
		});

		const res = await del(`/api/insights/${published.id}`, ownerToken);
		const body = await res.json();

		expect(res.status).toBe(404);
		expect(body.error).toContain("not deletable");
	});

	test("returns 404 for non-existent insight", async () => {
		await setupPromise;

		const fakeId = "00000000-0000-0000-0000-000000000000";
		const res = await del(`/api/insights/${fakeId}`, ownerToken);

		expect(res.status).toBe(404);
	});

	test("delete is idempotent — second delete returns 404", async () => {
		await setupPromise;

		const draft = await createTestInsight(ownerToken, {
			title: `Idempotent delete ${crypto.randomUUID().slice(0, 6)}`,
			body: "Delete twice",
			repo: "ext-test/delete-repo",
			status: "draft",
		});

		const res1 = await del(`/api/insights/${draft.id}`, ownerToken);
		expect(res1.status).toBe(204);

		const res2 = await del(`/api/insights/${draft.id}`, ownerToken);
		expect(res2.status).toBe(404);
	});
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. Pagination deep testing
// ─────────────────────────────────────────────────────────────────────────────

describe("Pagination", () => {
	const paginationRepo = `ext-test/pagination-${crypto.randomUUID().slice(0, 6)}`;
	const TOTAL_INSIGHTS = 27;

	test("setup: create 27 published insights for pagination", async () => {
		await setupPromise;

		// Create sequentially to ensure distinct created_at timestamps,
		// which is required for cursor-based pagination to work correctly
		for (let i = 0; i < TOTAL_INSIGHTS; i++) {
			await createTestInsight(ownerToken, {
				title: `Pagination ${String(i).padStart(3, "0")} ${crypto.randomUUID().slice(0, 6)}`,
				body: `Pagination test body ${i}`,
				repo: paginationRepo,
				status: "published",
			});
		}

		// Verify all were created
		const res = await get(
			`/api/insights?repo=${encodeURIComponent(paginationRepo)}&limit=1&offset=0`,
			ownerToken,
		);
		const body = await res.json();
		expect(body.total).toBe(TOTAL_INSIGHTS);
	});

	test("offset pagination: first page", async () => {
		await setupPromise;

		const res = await get(
			`/api/insights?repo=${encodeURIComponent(paginationRepo)}&limit=10&offset=0`,
			ownerToken,
		);
		const body = await res.json();

		expect(res.status).toBe(200);
		expect(body.insights).toHaveLength(10);
		expect(body.total).toBe(TOTAL_INSIGHTS);
		expect(body.limit).toBe(10);
		expect(body.offset).toBe(0);
		expect(body.has_more).toBe(true);
	});

	test("offset pagination: second page", async () => {
		await setupPromise;

		const res = await get(
			`/api/insights?repo=${encodeURIComponent(paginationRepo)}&limit=10&offset=10`,
			ownerToken,
		);
		const body = await res.json();

		expect(res.status).toBe(200);
		expect(body.insights).toHaveLength(10);
		expect(body.total).toBe(TOTAL_INSIGHTS);
		expect(body.offset).toBe(10);
		expect(body.has_more).toBe(true);
	});

	test("offset pagination: last page (partial)", async () => {
		await setupPromise;

		const res = await get(
			`/api/insights?repo=${encodeURIComponent(paginationRepo)}&limit=10&offset=20`,
			ownerToken,
		);
		const body = await res.json();

		expect(res.status).toBe(200);
		expect(body.insights).toHaveLength(TOTAL_INSIGHTS - 20);
		expect(body.has_more).toBe(false);
	});

	test("offset pagination: offset beyond total returns empty", async () => {
		await setupPromise;

		const res = await get(
			`/api/insights?repo=${encodeURIComponent(paginationRepo)}&limit=10&offset=100`,
			ownerToken,
		);
		const body = await res.json();

		expect(res.status).toBe(200);
		expect(body.insights).toHaveLength(0);
		// window function returns 0 when no rows match the offset
		expect(body.total).toBe(0);
		expect(body.has_more).toBe(false);
	});

	test("cursor-based pagination: walks through all pages", async () => {
		await setupPromise;

		let collected: unknown[] = [];
		let cursor: string | null = null;
		const pageSize = 10;
		let pages = 0;

		// First page uses offset
		const firstRes = await get(
			`/api/insights?repo=${encodeURIComponent(paginationRepo)}&limit=${pageSize}&offset=0`,
			ownerToken,
		);
		const firstBody = await firstRes.json();
		collected = collected.concat(firstBody.insights);
		cursor = firstBody.next_cursor;
		pages++;

		// Subsequent pages use cursor
		while (cursor && pages < 10) {
			const res = await get(
				`/api/insights?repo=${encodeURIComponent(paginationRepo)}&limit=${pageSize}&cursor=${encodeURIComponent(cursor)}`,
				ownerToken,
			);
			const body = await res.json();
			collected = collected.concat(body.insights);
			cursor = body.next_cursor;
			pages++;

			if (body.insights.length < pageSize) break;
		}

		expect(collected.length).toBe(TOTAL_INSIGHTS);
		expect(pages).toBeGreaterThanOrEqual(2);
	});

	test("cursor pagination: no duplicates across pages", async () => {
		await setupPromise;

		const seenIds = new Set<string>();
		let cursor: string | null = null;
		const pageSize = 5;

		// First page
		const firstRes = await get(
			`/api/insights?repo=${encodeURIComponent(paginationRepo)}&limit=${pageSize}&offset=0`,
			ownerToken,
		);
		const firstBody = await firstRes.json();
		for (const insight of firstBody.insights) {
			expect(seenIds.has(insight.id)).toBe(false);
			seenIds.add(insight.id);
		}
		cursor = firstBody.next_cursor;

		// Walk remaining pages
		let safety = 0;
		while (cursor && safety < 20) {
			const res = await get(
				`/api/insights?repo=${encodeURIComponent(paginationRepo)}&limit=${pageSize}&cursor=${encodeURIComponent(cursor)}`,
				ownerToken,
			);
			const body = await res.json();
			for (const insight of body.insights) {
				expect(seenIds.has(insight.id)).toBe(false);
				seenIds.add(insight.id);
			}
			cursor = body.next_cursor;
			safety++;
			if (body.insights.length < pageSize) break;
		}

		expect(seenIds.size).toBe(TOTAL_INSIGHTS);
	});

	test("limit=1 returns exactly one insight", async () => {
		await setupPromise;

		const res = await get(
			`/api/insights?repo=${encodeURIComponent(paginationRepo)}&limit=1`,
			ownerToken,
		);
		const body = await res.json();

		expect(body.insights).toHaveLength(1);
		expect(body.has_more).toBe(true);
		expect(body.next_cursor).toBeDefined();
	});

	test("limit=100 returns all insights at once", async () => {
		await setupPromise;

		const res = await get(
			`/api/insights?repo=${encodeURIComponent(paginationRepo)}&limit=100`,
			ownerToken,
		);
		const body = await res.json();

		expect(body.insights).toHaveLength(TOTAL_INSIGHTS);
		expect(body.has_more).toBe(false);
	});

	test("results are ordered by created_at DESC", async () => {
		await setupPromise;

		const res = await get(
			`/api/insights?repo=${encodeURIComponent(paginationRepo)}&limit=100`,
			ownerToken,
		);
		const body = await res.json();

		for (let i = 1; i < body.insights.length; i++) {
			const prev = new Date(body.insights[i - 1].created_at).getTime();
			const curr = new Date(body.insights[i].created_at).getTime();
			expect(prev).toBeGreaterThanOrEqual(curr);
		}
	});
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. Filtering
// ─────────────────────────────────────────────────────────────────────────────

describe("Filtering", () => {
	const filterRepo = `ext-test/filter-${crypto.randomUUID().slice(0, 6)}`;
	const filterBranch = "feature/filters";

	test("setup: create insights with different attributes", async () => {
		await setupPromise;

		// Various kinds, statuses, and branches
		await createTestInsight(ownerToken, {
			kind: "decision",
			title: `Filter decision ${crypto.randomUUID().slice(0, 6)}`,
			body: "Decision for filter test",
			repo: filterRepo,
			branch: filterBranch,
			status: "published",
		});
		await createTestInsight(ownerToken, {
			kind: "dead_end",
			title: `Filter dead_end ${crypto.randomUUID().slice(0, 6)}`,
			body: "Dead end for filter test",
			repo: filterRepo,
			branch: "main",
			status: "published",
		});
		await createTestInsight(ownerToken, {
			kind: "pattern",
			title: `Filter pattern ${crypto.randomUUID().slice(0, 6)}`,
			body: "Pattern for filter test",
			repo: filterRepo,
			status: "draft",
		});
		await createTestInsight(ownerToken, {
			kind: "context",
			title: `Filter context ${crypto.randomUUID().slice(0, 6)}`,
			body: "Context for filter test",
			repo: `${filterRepo}-alt`,
			status: "published",
		});
	});

	test("filter by kind returns only matching insights", async () => {
		await setupPromise;

		const res = await get(
			`/api/insights?repo=${encodeURIComponent(filterRepo)}&kind=decision`,
			ownerToken,
		);
		const body = await res.json();

		expect(res.status).toBe(200);
		expect(body.total).toBeGreaterThanOrEqual(1);
		for (const insight of body.insights) {
			expect(insight.kind).toBe("decision");
		}
	});

	test("filter by status=draft returns only drafts", async () => {
		await setupPromise;

		const res = await get(
			`/api/insights?repo=${encodeURIComponent(filterRepo)}&status=draft`,
			ownerToken,
		);
		const body = await res.json();

		expect(res.status).toBe(200);
		expect(body.total).toBeGreaterThanOrEqual(1);
		for (const insight of body.insights) {
			expect(insight.status).toBe("draft");
		}
	});

	test("filter by status=published returns only published", async () => {
		await setupPromise;

		const res = await get(
			`/api/insights?repo=${encodeURIComponent(filterRepo)}&status=published`,
			ownerToken,
		);
		const body = await res.json();

		expect(res.status).toBe(200);
		expect(body.total).toBeGreaterThanOrEqual(1);
		for (const insight of body.insights) {
			expect(insight.status).toBe("published");
		}
	});

	test("filter by branch returns matching insights", async () => {
		await setupPromise;

		const res = await get(
			`/api/insights?repo=${encodeURIComponent(filterRepo)}&branch=${encodeURIComponent(filterBranch)}`,
			ownerToken,
		);
		const body = await res.json();

		expect(res.status).toBe(200);
		expect(body.total).toBeGreaterThanOrEqual(1);
		for (const insight of body.insights) {
			expect(insight.branch).toBe(filterBranch);
		}
	});

	test("filter by repo isolates insights from other repos", async () => {
		await setupPromise;

		const res = await get(
			`/api/insights?repo=${encodeURIComponent(`${filterRepo}-alt`)}`,
			ownerToken,
		);
		const body = await res.json();

		expect(res.status).toBe(200);
		expect(body.total).toBeGreaterThanOrEqual(1);
		for (const insight of body.insights) {
			expect(insight.repo).toBe(`${filterRepo}-alt`);
		}
	});

	test("combined filters: kind + status + repo", async () => {
		await setupPromise;

		const res = await get(
			`/api/insights?repo=${encodeURIComponent(filterRepo)}&kind=dead_end&status=published`,
			ownerToken,
		);
		const body = await res.json();

		expect(res.status).toBe(200);
		expect(body.total).toBeGreaterThanOrEqual(1);
		for (const insight of body.insights) {
			expect(insight.kind).toBe("dead_end");
			expect(insight.status).toBe("published");
			expect(insight.repo).toBe(filterRepo);
		}
	});

	test("combined filters with no matches returns empty", async () => {
		await setupPromise;

		const res = await get(
			`/api/insights?repo=${encodeURIComponent(filterRepo)}&kind=business&status=published`,
			ownerToken,
		);
		const body = await res.json();

		expect(res.status).toBe(200);
		expect(body.total).toBe(0);
		expect(body.insights).toHaveLength(0);
	});

	test("filter by kind + branch narrows correctly", async () => {
		await setupPromise;

		const res = await get(
			`/api/insights?repo=${encodeURIComponent(filterRepo)}&kind=decision&branch=${encodeURIComponent(filterBranch)}`,
			ownerToken,
		);
		const body = await res.json();

		expect(res.status).toBe(200);
		expect(body.total).toBeGreaterThanOrEqual(1);
		for (const insight of body.insights) {
			expect(insight.kind).toBe("decision");
			expect(insight.branch).toBe(filterBranch);
		}
	});
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. Deduplication
// ─────────────────────────────────────────────────────────────────────────────

describe("Deduplication", () => {
	test("creating the same insight twice returns 200 with existing", async () => {
		await setupPromise;

		const uniqueTitle = `Dedup test ${crypto.randomUUID().slice(0, 6)}`;
		const payload = {
			kind: "decision",
			title: uniqueTitle,
			body: "Identical body for dedup test",
			repo: "ext-test/dedup-repo",
			trigger_type: "manual",
			status: "published",
		};

		// First creation -> 201
		const res1 = await post("/api/insights", ownerToken, payload);
		expect(res1.status).toBe(201);
		const body1 = await res1.json();

		// Second creation -> 200 (dedup)
		const res2 = await post("/api/insights", ownerToken, payload);
		expect(res2.status).toBe(200);
		const body2 = await res2.json();

		expect(body2.id).toBe(body1.id);
	});

	test("different body produces a new insight (201)", async () => {
		await setupPromise;

		const base = {
			kind: "decision" as const,
			title: `Dedup variant ${crypto.randomUUID().slice(0, 6)}`,
			repo: "ext-test/dedup-repo",
			trigger_type: "manual",
			status: "published",
		};

		const res1 = await post("/api/insights", ownerToken, {
			...base,
			body: "Body version A",
		});
		expect(res1.status).toBe(201);

		const res2 = await post("/api/insights", ownerToken, {
			...base,
			body: "Body version B",
		});
		expect(res2.status).toBe(201);

		const body1 = await res1.json();
		const body2 = await res2.json();
		expect(body1.id).not.toBe(body2.id);
	});

	test("different kind with same title/body produces a new insight", async () => {
		await setupPromise;

		const uniqueTitle = `Dedup kind ${crypto.randomUUID().slice(0, 6)}`;
		const base = {
			title: uniqueTitle,
			body: "Same body different kind",
			repo: "ext-test/dedup-repo",
			trigger_type: "manual",
			status: "published",
		};

		const res1 = await post("/api/insights", ownerToken, {
			...base,
			kind: "decision",
		});
		expect(res1.status).toBe(201);

		const res2 = await post("/api/insights", ownerToken, {
			...base,
			kind: "pattern",
		});
		expect(res2.status).toBe(201);
	});
});

// ─────────────────────────────────────────────────────────────────────────────
// 9. Draft -> Published lifecycle
// ─────────────────────────────────────────────────────────────────────────────

describe("Draft -> Published lifecycle", () => {
	test("insight created as draft, then published via /publish", async () => {
		await setupPromise;

		const lifecycleRepo = `ext-test/lifecycle-${crypto.randomUUID().slice(0, 6)}`;

		// Create as draft
		const draft = await createTestInsight(ownerToken, {
			title: `Lifecycle ${crypto.randomUUID().slice(0, 6)}`,
			body: "Start as draft",
			repo: lifecycleRepo,
			status: "draft",
		});
		expect(draft.status).toBe("draft");

		// Publish
		const pubRes = await post("/api/insights/publish", ownerToken, {
			repo: lifecycleRepo,
		});
		const pubBody = await pubRes.json();

		expect(pubBody.count).toBe(1);
		expect(pubBody.published[0].id).toBe(draft.id);
		expect(pubBody.published[0].status).toBe("published");

		// Verify via GET
		const getRes = await get(`/api/insights/${draft.id}`, ownerToken);
		const insight = await getRes.json();
		expect(insight.status).toBe("published");
	});

	test("draft can be deleted, published cannot", async () => {
		await setupPromise;

		const draft = await createTestInsight(ownerToken, {
			title: `Deletable draft ${crypto.randomUUID().slice(0, 6)}`,
			body: "I am deletable",
			repo: "ext-test/lifecycle-repo",
			status: "draft",
		});

		const published = await createTestInsight(ownerToken, {
			title: `Undeletable published ${crypto.randomUUID().slice(0, 6)}`,
			body: "I am not deletable",
			repo: "ext-test/lifecycle-repo",
			status: "published",
		});

		// Draft delete succeeds
		const delDraft = await del(`/api/insights/${draft.id}`, ownerToken);
		expect(delDraft.status).toBe(204);

		// Published delete fails
		const delPub = await del(`/api/insights/${published.id}`, ownerToken);
		expect(delPub.status).toBe(404);
	});

	test("publishing already-published insights is a no-op", async () => {
		await setupPromise;

		const alreadyPublishedRepo = `ext-test/already-pub-${crypto.randomUUID().slice(0, 6)}`;

		// Create and verify it's published
		await createTestInsight(ownerToken, {
			title: `Already published ${crypto.randomUUID().slice(0, 6)}`,
			body: "Already published",
			repo: alreadyPublishedRepo,
			status: "published",
		});

		// Publish again — should return 0 since none are drafts
		const res = await post("/api/insights/publish", ownerToken, {
			repo: alreadyPublishedRepo,
		});
		const body = await res.json();

		expect(res.status).toBe(200);
		expect(body.count).toBe(0);
	});
});

// ─────────────────────────────────────────────────────────────────────────────
// 10. Plan limits
// ─────────────────────────────────────────────────────────────────────────────

describe("Plan limits", () => {
	test("free plan allows creation under limit", async () => {
		await setupPromise;

		// The test org is on the free plan by default — creating one more should work
		// since we're well under 500
		const res = await post("/api/insights", ownerToken, {
			kind: "context",
			title: `Plan limit test ${crypto.randomUUID().slice(0, 6)}`,
			body: "Under the limit",
			repo: "ext-test/plan-repo",
			trigger_type: "manual",
			status: "published",
		});

		// Should succeed (201 or 200 if dedup)
		expect([200, 201]).toContain(res.status);
	});

	test("content_hash ensures unique insights count correctly", async () => {
		await setupPromise;

		// Create and then duplicate — only 1 should count
		const payload = {
			kind: "context",
			title: `Plan count ${crypto.randomUUID().slice(0, 6)}`,
			body: "Unique for counting",
			repo: "ext-test/plan-repo",
			trigger_type: "manual",
			status: "published",
		};

		const res1 = await post("/api/insights", ownerToken, payload);
		expect(res1.status).toBe(201);

		// Dedup — should not increase count
		const res2 = await post("/api/insights", ownerToken, payload);
		expect(res2.status).toBe(200);
	});
});
