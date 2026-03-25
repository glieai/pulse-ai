import { SOLO_ORG_ID, SOLO_USER_ID, SOLO_USER_NAME } from "@pulse/shared";
import { createMiddleware } from "hono/factory";
import { sql } from "../db/client";
import { env } from "../env";
import { validateApiToken, verifyJwt } from "../services/auth";
import type { AppEnv } from "../types/app";

export const auth = createMiddleware<AppEnv>(async (c, next) => {
	if (env.PULSE_MODE === "solo") {
		c.set("auth", {
			user_id: SOLO_USER_ID,
			org_id: SOLO_ORG_ID,
			role: "owner",
			author_name: SOLO_USER_NAME,
			is_super_admin: false,
		});
		return next();
	}

	const header = c.req.header("Authorization");
	if (!header?.startsWith("Bearer ")) {
		return c.json({ error: "Missing authorization" }, 401);
	}

	const token = header.slice(7);

	if (token.startsWith("pulse_")) {
		// validateApiToken already checks is_active
		const ctx = await validateApiToken(token);
		if (!ctx) {
			return c.json({ error: "Invalid API token" }, 401);
		}
		c.set("auth", ctx);
	} else {
		try {
			const payload = await verifyJwt(token);

			// JWT doesn't invalidate on deactivation — must verify is_active in DB
			const [user] = await sql`
				SELECT is_active FROM users WHERE id = ${payload.user_id}
			`;
			if (!user?.is_active) {
				return c.json({ error: "Account deactivated" }, 401);
			}

			c.set("auth", {
				user_id: payload.user_id,
				org_id: payload.org_id,
				role: payload.role,
				author_name: payload.name ?? "",
				is_super_admin: payload.is_super_admin ?? false,
			});
		} catch {
			return c.json({ error: "Invalid or expired token" }, 401);
		}
	}

	await next();
});
