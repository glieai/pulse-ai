import { createMiddleware } from "hono/factory";
import { httpRequestDuration, httpRequestsTotal } from "../instrumentation/metrics";
import type { AppEnv } from "../types/app";

/**
 * Replace UUIDs and numeric segments with :id to avoid Prometheus label cardinality explosion.
 * Example: /api/insights/3f2504e0-4f89-11d3-9a0c-0305e82c3301  →  /api/insights/:id
 */
export function normalizeRoute(path: string): string {
	return (
		path
			// Remove /api prefix for shorter labels
			.replace(/^\/api/, "")
			// Replace UUIDs
			.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, ":id")
			// Replace hex tokens (reset tokens, invite tokens — 64 hex chars)
			.replace(/\/[0-9a-f]{32,}/gi, "/:token")
			// Replace numeric IDs
			.replace(/\/\d+/g, "/:id")
			// Remove trailing slash
			.replace(/\/$/, "") || "/"
	);
}

export const metricsMiddleware = createMiddleware<AppEnv>(async (c, next) => {
	// Don't instrument the metrics endpoint itself
	if (c.req.path === "/api/metrics") {
		return next();
	}

	const start = performance.now();

	await next();

	const duration = (performance.now() - start) / 1000; // seconds
	const route = normalizeRoute(c.req.path);
	const method = c.req.method;
	const status = String(c.res.status);

	httpRequestsTotal.inc({ method, route, status });
	httpRequestDuration.observe({ method, route, status }, duration);
});
