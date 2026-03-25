const { app } = await import("./index");

export { app };

export function authHeader(token: string): Record<string, string> {
	return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

export async function createTestOrg(suffix?: string) {
	const id = crypto.randomUUID().slice(0, 8);
	const email = `test-${suffix ?? id}@test.com`;
	const orgName = `Test Org ${id}`;

	const res = await app.fetch(
		new Request("http://localhost/api/auth/register", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				org_name: orgName,
				name: "Test User",
				email,
				password: "test1234",
			}),
		}),
	);

	const body = await res.json();
	return {
		token: body.token as string,
		orgId: body.org.id as string,
		userId: body.user.id as string,
		email,
	};
}

export async function createTestInsight(token: string, overrides?: Record<string, unknown>) {
	const res = await app.fetch(
		new Request("http://localhost/api/insights", {
			method: "POST",
			headers: authHeader(token),
			body: JSON.stringify({
				kind: "decision",
				title: `Test insight ${crypto.randomUUID().slice(0, 8)}`,
				body: "Test insight body for integration testing.",
				repo: "test/repo",
				trigger_type: "manual",
				status: "published",
				...overrides,
			}),
		}),
	);

	return res.json();
}
