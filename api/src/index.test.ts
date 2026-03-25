import { describe, expect, test } from "bun:test";

describe("API", () => {
	test("health endpoint returns ok", async () => {
		const { app } = await import("./index");
		const res = await app.fetch(new Request("http://localhost/api/health"));
		const body = await res.json();

		expect(res.status).toBe(200);
		expect(body.status).toBe("ok");
		expect(body.db).toBe("connected");
	});
});
