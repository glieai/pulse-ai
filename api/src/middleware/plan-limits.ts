/**
 * Plan enforcement middleware.
 *
 * Use `checkLimit(resource)` as route middleware before any action that creates
 * a resource that counts against plan limits.
 *
 * Returns 402 Payment Required when the org is at its limit.
 *
 * When Stripe is integrated, this middleware already exists — just wire billing.
 */

import { createMiddleware } from "hono/factory";
import { sql } from "../db/client";
import { env } from "../env";
import type { AppEnv } from "../types/app";

// -1 means unlimited
interface PlanLimits {
	max_users: number;
	max_insights_total: number;
	max_repos: number;
}

const PLAN_LIMITS: Record<string, PlanLimits> = {
	free: { max_users: 3, max_insights_total: 500, max_repos: 3 },
	pro: { max_users: 25, max_insights_total: -1, max_repos: -1 },
	enterprise: { max_users: -1, max_insights_total: -1, max_repos: -1 },
};

type LimitResource = keyof PlanLimits;

export function checkLimit(resource: LimitResource) {
	return createMiddleware<AppEnv>(async (c, next) => {
		// Solo mode: self-hosted single user — no plan enforcement applies
		if (env.PULSE_MODE === "solo") {
			return next();
		}

		const { org_id } = c.get("auth");

		const [org] = await sql`
			SELECT plan FROM orgs WHERE id = ${org_id}
		`;

		if (!org) {
			return c.json({ error: "Organization not found" }, 404);
		}

		const limits = PLAN_LIMITS[org.plan] ?? PLAN_LIMITS.free;
		const max = limits[resource];

		if (max === -1) {
			// Unlimited on this plan
			return next();
		}

		let current = 0;

		if (resource === "max_users") {
			const [row] = await sql`
				SELECT COUNT(*)::int AS count FROM users
				WHERE org_id = ${org_id} AND is_active = true
			`;
			current = row?.count ?? 0;
		} else if (resource === "max_insights_total") {
			const [row] = await sql`
				SELECT COUNT(*)::int AS count FROM insights WHERE org_id = ${org_id}
			`;
			current = row?.count ?? 0;
		} else if (resource === "max_repos") {
			const [row] = await sql`
				SELECT COUNT(DISTINCT repo)::int AS count FROM insights
				WHERE org_id = ${org_id} AND repo IS NOT NULL
			`;
			current = row?.count ?? 0;
		}

		if (current >= max) {
			return c.json(
				{
					error: `Plan limit reached: ${resource.replace("max_", "").replace("_", " ")} (${current}/${max})`,
					limit: max,
					current,
					plan: org.plan,
					upgrade_required: true,
				},
				402,
			);
		}

		return next();
	});
}
