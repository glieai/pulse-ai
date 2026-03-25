import { afterAll, describe, expect, test } from "bun:test";
import { sql } from "../db/client";
import { app, authHeader } from "../test-utils";

let orgId: string;
let userId: string;
let jwt: string;
let apiToken: string;
let insightId: string;
const email = `lifecycle-${crypto.randomUUID()}@test.com`;

afterAll(async () => {
	await sql`DELETE FROM api_tokens WHERE org_id = ${orgId}`;
	await sql`DELETE FROM insights WHERE org_id = ${orgId}`;
	await sql`DELETE FROM users WHERE email = ${email}`;
	await sql`DELETE FROM orgs WHERE id = ${orgId}`;
});

describe("full lifecycle", () => {
	test("1. register org + user", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/auth/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					org_name: `Lifecycle ${crypto.randomUUID().slice(0, 8)}`,
					name: "Lifecycle Tester",
					email,
					password: "test1234",
				}),
			}),
		);

		expect(res.status).toBe(201);
		const body = await res.json();
		jwt = body.token;
		orgId = body.org.id;
		userId = body.user.id;
	});

	test("2. login with same credentials", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password: "test1234" }),
			}),
		);

		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.token).toBeString();
		expect(body.user.id).toBe(userId);
	});

	test("3. create API token", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/auth/token", {
				method: "POST",
				headers: authHeader(jwt),
			}),
		);

		expect(res.status).toBe(201);
		const body = await res.json();
		apiToken = body.token;
		expect(apiToken).toStartWith("pulse_");
	});

	test("4. create insight with API token", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/insights", {
				method: "POST",
				headers: authHeader(apiToken),
				body: JSON.stringify({
					kind: "decision",
					title: "Lifecycle test insight",
					body: "Created during lifecycle integration test to verify full flow.",
					repo: "test/lifecycle",
					trigger_type: "manual",
					status: "published",
					source_files: ["src/test.ts"],
				}),
			}),
		);

		expect(res.status).toBe(201);
		const body = await res.json();
		insightId = body.id;
		expect(body.org_id).toBe(orgId);
		expect(body.author_name).toBe("Lifecycle Tester");
	});

	test("5. list insights — contains created insight", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/insights", { headers: authHeader(jwt) }),
		);

		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.total).toBeGreaterThanOrEqual(1);
		const found = body.insights.find((i: { id: string }) => i.id === insightId);
		expect(found).toBeDefined();
	});

	test("6. get insight by id", async () => {
		const res = await app.fetch(
			new Request(`http://localhost/api/insights/${insightId}`, {
				headers: authHeader(jwt),
			}),
		);

		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.id).toBe(insightId);
		expect(body.title).toBe("Lifecycle test insight");
	});

	test("7. search insight via FTS", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/search?q=lifecycle+integration", {
				headers: authHeader(jwt),
			}),
		);

		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.insights.length).toBeGreaterThanOrEqual(1);
	});

	test("8. context retrieval via FTS", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/context?query=lifecycle", {
				headers: authHeader(jwt),
			}),
		);

		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.insights.length).toBeGreaterThanOrEqual(1);
	});

	test("9. file context", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/context/file/src/test.ts?repo=test/lifecycle", {
				headers: authHeader(jwt),
			}),
		);

		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.insights.length).toBeGreaterThanOrEqual(1);
	});

	test("10. dedup — same insight returns 200", async () => {
		const res = await app.fetch(
			new Request("http://localhost/api/insights", {
				method: "POST",
				headers: authHeader(apiToken),
				body: JSON.stringify({
					kind: "decision",
					title: "Lifecycle test insight",
					body: "Created during lifecycle integration test to verify full flow.",
					repo: "test/lifecycle",
					trigger_type: "manual",
				}),
			}),
		);

		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.id).toBe(insightId);
	});
});
