import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { requestId } from "hono/request-id";
import { z } from "zod";
import { errorHandler } from "./error-handler";

function createApp() {
	const app = new Hono();
	app.use("*", requestId());
	app.onError(errorHandler);
	return app;
}

describe("error-handler", () => {
	test("HTTPException returns its status and message", async () => {
		const app = createApp();
		app.get("/test", () => {
			throw new HTTPException(403, { message: "Forbidden" });
		});

		const res = await app.fetch(new Request("http://localhost/test"));
		const body = await res.json();

		expect(res.status).toBe(403);
		expect(body.error).toBe("Forbidden");
	});

	test("ZodError returns 400 with validation details", async () => {
		const app = createApp();
		app.get("/test", () => {
			const schema = z.object({ name: z.string(), age: z.number() });
			schema.parse({ name: 123, age: "not a number" });
			return new Response("unreachable");
		});

		const res = await app.fetch(new Request("http://localhost/test"));
		const body = await res.json();

		expect(res.status).toBe(400);
		expect(body.error).toBe("Validation failed");
		expect(body.details).toBeArray();
		expect(body.details.length).toBe(2);
		expect(body.details[0].path).toBeDefined();
		expect(body.details[0].message).toBeDefined();
	});

	test("unknown error returns 500", async () => {
		const app = createApp();
		app.get("/test", () => {
			throw new Error("something broke");
		});

		const res = await app.fetch(new Request("http://localhost/test"));
		const body = await res.json();

		expect(res.status).toBe(500);
		expect(body.error).toBeDefined();
	});

	test("response includes X-Request-Id header", async () => {
		const app = createApp();
		app.get("/test", (c) => c.json({ ok: true }));

		const res = await app.fetch(new Request("http://localhost/test"));

		expect(res.headers.get("X-Request-Id")).toBeDefined();
	});
});
