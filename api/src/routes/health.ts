import { Hono } from "hono";
import { sql } from "../db/client";
import { register } from "../instrumentation/metrics";

const health = new Hono();

health.get("/health", async (c) => {
	try {
		await sql`SELECT 1`;
		return c.json({ status: "ok", db: "connected" });
	} catch {
		return c.json({ status: "error", db: "disconnected" }, 503);
	}
});

// Prometheus scrape endpoint — no auth required (restrict access via Caddy/network if needed)
health.get("/metrics", async (c) => {
	const metrics = await register.metrics();
	return c.text(metrics, 200, { "Content-Type": register.contentType });
});

export { health };
