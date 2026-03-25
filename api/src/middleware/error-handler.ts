import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";
import { env } from "../env";

export function errorHandler(err: Error, c: Context): Response {
	const requestId = c.req.header("X-Request-Id") ?? "unknown";

	if (err instanceof HTTPException) {
		return c.json({ error: err.message }, err.status);
	}

	if (err instanceof ZodError) {
		return c.json(
			{
				error: "Validation failed",
				details: err.issues.map((i) => ({
					path: i.path.join("."),
					message: i.message,
				})),
			},
			400,
		);
	}

	console.error(`[${requestId}] Unhandled error:`, err);

	return c.json(
		{
			error: env.NODE_ENV === "production" ? "Internal server error" : err.message,
		},
		500,
	);
}
