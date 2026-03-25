/**
 * Audit trail — append-only log of significant actions.
 *
 * Call `audit()` fire-and-forget in route handlers.
 * Failures are logged but never propagate to the caller.
 */

import type { Context } from "hono";
import { sql } from "../db/client";

export type AuditAction =
	| "user.login"
	| "user.login_failed"
	| "user.login_2fa"
	| "user.password_reset_requested"
	| "user.password_reset_completed"
	| "user.password_changed"
	| "user.profile_updated"
	| "user.deactivated"
	| "user.reactivated"
	| "user.invited"
	| "user.invitation_accepted"
	| "user.invitation_cancelled"
	| "user.2fa_enabled"
	| "user.2fa_disabled"
	| "insight.published"
	| "insight.deleted"
	| "org.settings_changed"
	| "org.llm_key_updated"
	| "org.name_updated"
	| "org.deletion_requested"
	| "org.deletion_cancelled";

export interface AuditParams {
	orgId: string;
	userId?: string;
	action: AuditAction;
	resourceType?: string;
	resourceId?: string;
	metadata?: Record<string, unknown>;
	ip?: string;
}

export async function audit(params: AuditParams): Promise<void> {
	try {
		await sql`
			INSERT INTO audit_log (org_id, user_id, action, resource_type, resource_id, metadata, ip_address)
			VALUES (
				${params.orgId},
				${params.userId ?? null},
				${params.action},
				${params.resourceType ?? null},
				${params.resourceId ?? null},
				${sql.json((params.metadata ?? {}) as never)},
				${params.ip ?? null}
			)
		`;
	} catch (err) {
		// Audit failures must never crash the request
		console.error("[audit] Failed to write audit log:", err instanceof Error ? err.message : err);
	}
}

/** Extract client IP from a Hono context (handles proxy headers) */
export function getIp(c: Context): string | undefined {
	return (
		c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ?? c.req.header("x-real-ip") ?? undefined
	);
}
