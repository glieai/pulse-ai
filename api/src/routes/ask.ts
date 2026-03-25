import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { auth } from "../middleware/auth";
import { askSchema } from "../schemas/ask";
import { askPulse } from "../services/ask";
import type { AppEnv } from "../types/app";

const ask = new Hono<AppEnv>();
ask.use("/*", auth);

ask.post("/search/ask", async (c) => {
	const body = await c.req.json();
	const { query, repo, kind } = askSchema.parse(body);
	const { org_id } = c.get("auth");

	// Pre-flight: resolve LLM + search BEFORE starting SSE.
	// Errors here (503 no LLM, 400 bad input) return normal JSON.
	const { sources, stream } = await askPulse(org_id, query, repo, kind);

	return streamSSE(c, async (sse) => {
		// 1. Sources first (UI can render cards immediately)
		await sse.writeSSE({
			event: "sources",
			data: JSON.stringify({ sources }),
		});

		// 2. Stream LLM tokens
		try {
			for await (const text of stream) {
				await sse.writeSSE({
					event: "token",
					data: JSON.stringify({ text }),
				});
			}
		} catch (err) {
			await sse.writeSSE({
				event: "error",
				data: JSON.stringify({
					error: err instanceof Error ? err.message : "Stream failed",
				}),
			});
			return;
		}

		// 3. Done
		await sse.writeSSE({ event: "done", data: "{}" });
	});
});

export { ask };
