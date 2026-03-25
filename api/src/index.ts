import { Hono } from "hono";
import { bootstrapSoloMode } from "./bootstrap";
import { sql } from "./db/client";
import { env } from "./env";
import { applyMiddleware } from "./middleware";
import { ask } from "./routes/ask";
import { authRouter } from "./routes/auth";
import { context } from "./routes/context";
import { health } from "./routes/health";
import { insights } from "./routes/insights";
import { org } from "./routes/org";
import { search } from "./routes/search";

await bootstrapSoloMode();

const app = new Hono().basePath("/api");

applyMiddleware(app);

app.route("/", health);
app.route("/", authRouter);
app.route("/", insights);
app.route("/", search);
app.route("/", context);
app.route("/", org);
app.route("/", ask);

// Named export for tests — they call app.fetch() directly without a real server
// No `export default` — Bun auto-serves any default export with a .fetch property,
// which conflicts with the explicit Bun.serve() below.
export { app };

// ─── Server + Graceful Shutdown ──────────────────────────────────────────────
// Only start the HTTP server when this file is the entrypoint (not when imported by tests)

if (import.meta.main) {
	console.log(`Pulse API running on ${env.API_HOST}:${env.API_PORT} [${env.PULSE_MODE} mode]`);

	const server = Bun.serve({
		port: env.API_PORT,
		hostname: env.API_HOST,
		idleTimeout: 120,
		fetch: app.fetch,
	});

	// ─── Org Deletion Background Job ─────────────────────────────────────────
	// Runs daily to hard-delete orgs past their grace period.
	// CASCADE constraints handle related data: insights, users, tokens, invitations, audit_log.

	async function runOrgDeletionJob(): Promise<void> {
		try {
			const expired = await sql`
				SELECT id, name FROM orgs
				WHERE deletion_scheduled_at IS NOT NULL
				  AND deletion_scheduled_at <= now()
			`;

			for (const org of expired) {
				await sql`DELETE FROM orgs WHERE id = ${org.id}`;
				console.log(`[org-deletion] Deleted org ${org.id} (${org.name})`);
			}
		} catch (err) {
			console.error("[org-deletion] Job failed:", err instanceof Error ? err.message : err);
		}
	}

	// Run once on startup, then every 24h
	runOrgDeletionJob();
	const deletionJob = setInterval(runOrgDeletionJob, 24 * 60 * 60 * 1000);
	deletionJob.unref(); // don't block process exit

	async function shutdown(signal: string): Promise<void> {
		console.log(`\n${signal} received — shutting down gracefully`);
		clearInterval(deletionJob);
		server.stop(true); // drain in-flight requests before stopping
		await sql.end({ timeout: 10 });
		console.log("Pulse API stopped.");
		process.exit(0);
	}

	process.on("SIGTERM", () => shutdown("SIGTERM"));
	process.on("SIGINT", () => shutdown("SIGINT"));
}
