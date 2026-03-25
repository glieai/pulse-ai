import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { sql } from "../db/client";
import { app, authHeader, createTestInsight, createTestOrg } from "../test-utils";

let orgA: Awaited<ReturnType<typeof createTestOrg>>;
let orgB: Awaited<ReturnType<typeof createTestOrg>>;
let insightAId: string;

beforeAll(async () => {
	orgA = await createTestOrg("iso-a");
	orgB = await createTestOrg("iso-b");

	// Create insight in org A
	const insight = await createTestInsight(orgA.token, {
		title: "Org A secret insight",
		body: "This should only be visible to org A users.",
		repo: "orgA/repo",
		source_files: ["secret.ts"],
	});
	insightAId = insight.id;
});

afterAll(async () => {
	await sql`DELETE FROM insights WHERE org_id IN (${orgA.orgId}, ${orgB.orgId})`;
	await sql`DELETE FROM users WHERE email IN (${orgA.email}, ${orgB.email})`;
	await sql`DELETE FROM orgs WHERE id IN (${orgA.orgId}, ${orgB.orgId})`;
});

describe("org isolation", () => {
	test("org B cannot list org A insights", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/insights", { headers: authHeader(orgB.token) }),
		);
		const body = await res.json();

		expect(body.total).toBe(0);
		expect(body.insights).toHaveLength(0);
	});

	test("org B cannot get org A insight by id", async () => {
		const res = await app.fetch(
			new Request(`http://localhost/api/insights/${insightAId}`, {
				headers: authHeader(orgB.token),
			}),
		);

		expect(res.status).toBe(404);
	});

	test("org B cannot find org A insights via search", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/search?q=secret+insight", {
				headers: authHeader(orgB.token),
			}),
		);
		const body = await res.json();

		expect(body.insights).toHaveLength(0);
	});

	test("org B cannot find org A insights via context", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/context?query=secret", {
				headers: authHeader(orgB.token),
			}),
		);
		const body = await res.json();

		expect(body.insights).toHaveLength(0);
	});

	test("org B cannot find org A insights via file context", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/context/file/secret.ts?repo=orgA/repo", {
				headers: authHeader(orgB.token),
			}),
		);
		const body = await res.json();

		expect(body.insights).toHaveLength(0);
	});

	test("dedup respects org boundary — same content creates separate insights", async () => {
		// Org B creates insight with identical content to org A's
		const insight = await createTestInsight(orgB.token, {
			title: "Org A secret insight",
			body: "This should only be visible to org A users.",
			repo: "orgA/repo",
			source_files: ["secret.ts"],
		});

		// Must be a different insight (different org = different content_hash namespace)
		expect(insight.id).not.toBe(insightAId);
	});

	test("org A can see its own insight", async () => {
		const res = await app.fetch(
			new Request(`http://localhost/api/insights/${insightAId}`, {
				headers: authHeader(orgA.token),
			}),
		);

		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.id).toBe(insightAId);
	});
});
