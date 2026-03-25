import { sign, verify } from "hono/jwt";
import { sql } from "../db/client";
import { env } from "../env";
import type { LoginInput, RegisterInput } from "../schemas/auth";
import type { AuthContext, JwtPayload } from "../types/auth";

const JWT_EXPIRY_SECONDS = 24 * 60 * 60; // 24h
const PASSWORD_RESET_EXPIRY_MS = 60 * 60 * 1000; // 1h
const TWO_FA_SESSION_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

export function generateSlug(name: string): string {
	return name
		.toLowerCase()
		.normalize("NFD")
		.replace(/\p{Diacritic}/gu, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
}

export async function signJwt(payload: {
	user_id: string;
	org_id: string;
	role: string;
	name: string;
	email: string;
	is_super_admin?: boolean;
}): Promise<string> {
	const now = Math.floor(Date.now() / 1000);
	return sign({ ...payload, iat: now, exp: now + JWT_EXPIRY_SECONDS }, env.JWT_SECRET, "HS256");
}

export async function verifyJwt(token: string): Promise<JwtPayload> {
	const payload = await verify(token, env.JWT_SECRET, "HS256");
	return payload as unknown as JwtPayload;
}

export async function registerUser(input: RegisterInput) {
	const slug = generateSlug(input.org_name);
	const passwordHash = await Bun.password.hash(input.password, {
		algorithm: "bcrypt",
		cost: 10,
	});

	const result = await sql.begin(async (tx) => {
		const [org] = await tx.unsafe(
			"INSERT INTO orgs (name, slug) VALUES ($1, $2) RETURNING id, name, slug, plan, created_at",
			[input.org_name, slug],
		);

		const [user] = await tx.unsafe(
			"INSERT INTO users (org_id, name, email, password_hash, role) VALUES ($1, $2, $3, $4, 'owner') RETURNING id, org_id, name, email, role, created_at",
			[org.id, input.name, input.email, passwordHash],
		);

		return { org, user };
	});

	const token = await signJwt({
		user_id: result.user.id,
		org_id: result.org.id,
		role: result.user.role,
		name: result.user.name,
		email: result.user.email,
	});

	return { token, org: result.org, user: result.user };
}

export async function loginUser(input: LoginInput) {
	const [user] = await sql`
		SELECT id, org_id, name, email, password_hash, role, is_active, is_super_admin,
		       two_factor_enabled, created_at
		FROM users WHERE email = ${input.email}
	`;

	if (!user) {
		return null;
	}

	if (!user.is_active) {
		return { deactivated: true } as const;
	}

	const valid = await Bun.password.verify(input.password, user.password_hash);
	if (!valid) {
		return null;
	}

	// If 2FA is enabled, issue a short-lived temp token instead of a full JWT
	if (user.two_factor_enabled) {
		const rawBytes = crypto.getRandomValues(new Uint8Array(32));
		const tempToken = Array.from(rawBytes, (b) => b.toString(16).padStart(2, "0")).join("");
		const expires = new Date(Date.now() + TWO_FA_SESSION_EXPIRY_MS);

		await sql`
			INSERT INTO two_factor_sessions (user_id, token, expires_at)
			VALUES (${user.id}, ${tempToken}, ${expires})
		`;

		return { requires2FA: true, temp_token: tempToken } as const;
	}

	const token = await signJwt({
		user_id: user.id,
		org_id: user.org_id,
		role: user.role,
		name: user.name,
		email: user.email,
		is_super_admin: user.is_super_admin ?? false,
	});

	const { password_hash: _, two_factor_enabled: __, ...safeUser } = user;
	return { token, user: safeUser };
}

export async function verifyTwoFALogin(
	tempToken: string,
	code: string,
): Promise<
	| { token: string; user: Record<string, unknown> }
	| { invalid: true }
	| { deactivated: true }
	| null
> {
	const [session] = await sql`
		SELECT s.user_id, s.id AS session_id
		FROM two_factor_sessions s
		WHERE s.token = ${tempToken} AND s.expires_at > now()
	`;

	if (!session) {
		return null; // expired or invalid
	}

	const [user] = await sql`
		SELECT id, org_id, name, email, role, is_active, is_super_admin,
		       two_factor_secret, two_factor_backup_codes
		FROM users WHERE id = ${session.user_id}
	`;

	if (!user) {
		return null;
	}

	if (!user.is_active) {
		return { deactivated: true } as const;
	}

	// Try TOTP first
	let valid = false;
	let updatedBackupCodes: string[] | null = null;

	if (/^\d{6}$/.test(code)) {
		const { verifyTOTP } = await import("./two-factor");
		valid = verifyTOTP(user.two_factor_secret, code);
	} else {
		// Backup code
		const { verifyBackupCode } = await import("./two-factor");
		const hashedCodes: string[] = user.two_factor_backup_codes ?? [];
		const result = verifyBackupCode(hashedCodes, code);
		valid = result.valid;
		if (result.valid) {
			updatedBackupCodes = result.remainingCodes;
		}
	}

	if (!valid) {
		return { invalid: true } as const;
	}

	// Delete the session (one-time use)
	await sql`DELETE FROM two_factor_sessions WHERE id = ${session.session_id}`;

	// Update backup codes if one was used
	if (updatedBackupCodes !== null) {
		await sql`
			UPDATE users SET two_factor_backup_codes = ${JSON.stringify(updatedBackupCodes)}::jsonb
			WHERE id = ${user.id}
		`;
	}

	const token = await signJwt({
		user_id: user.id,
		org_id: user.org_id,
		role: user.role,
		name: user.name,
		email: user.email,
		is_super_admin: user.is_super_admin ?? false,
	});

	const { two_factor_secret: _s, two_factor_backup_codes: _b, ...safeUser } = user;
	return { token, user: safeUser };
}

export async function createApiToken(userId: string, orgId: string) {
	const rawBytes = crypto.getRandomValues(new Uint8Array(32));
	const hex = Array.from(rawBytes, (b) => b.toString(16).padStart(2, "0")).join("");
	const rawToken = `pulse_${hex}`;

	const tokenHash = new Bun.CryptoHasher("sha256").update(rawToken).digest("hex");

	const [row] = await sql`
		INSERT INTO api_tokens (user_id, org_id, token_hash)
		VALUES (${userId}, ${orgId}, ${tokenHash})
		RETURNING created_at
	`;

	return { token: rawToken, created_at: row.created_at };
}

export async function validateApiToken(rawToken: string): Promise<AuthContext | null> {
	const tokenHash = new Bun.CryptoHasher("sha256").update(rawToken).digest("hex");

	const [row] = await sql`
		SELECT t.user_id, t.org_id, u.role, u.name, u.is_active, u.is_super_admin
		FROM api_tokens t
		JOIN users u ON u.id = t.user_id
		WHERE t.token_hash = ${tokenHash}
	`;

	if (!row || !row.is_active) {
		return null;
	}

	// Update last_used_at (fire and forget, log failures)
	sql`UPDATE api_tokens SET last_used_at = now() WHERE token_hash = ${tokenHash}`.catch(
		(err: Error) => {
			console.error("Failed to update api_token last_used_at:", err.message);
		},
	);

	return {
		user_id: row.user_id,
		org_id: row.org_id,
		role: row.role,
		author_name: row.name,
		is_super_admin: row.is_super_admin ?? false,
	};
}

// ─── Password Reset ───────────────────────────────────────────────────────────

export async function createPasswordResetToken(
	email: string,
): Promise<{ token: string; userId: string; orgId: string } | null> {
	const [user] = await sql`
		SELECT id, org_id FROM users WHERE email = ${email} AND is_active = true
	`;

	if (!user) {
		return null;
	}

	const rawBytes = crypto.getRandomValues(new Uint8Array(32));
	const token = Array.from(rawBytes, (b) => b.toString(16).padStart(2, "0")).join("");
	const expires = new Date(Date.now() + PASSWORD_RESET_EXPIRY_MS);

	await sql`
		UPDATE users
		SET password_reset_token = ${token}, password_reset_expires = ${expires}
		WHERE id = ${user.id}
	`;

	return { token, userId: user.id, orgId: user.org_id };
}

export async function validatePasswordResetToken(
	token: string,
): Promise<{ id: string; email: string; org_id: string } | null> {
	const [user] = await sql`
		SELECT id, email, org_id FROM users
		WHERE password_reset_token = ${token}
		  AND password_reset_expires > now()
		  AND is_active = true
	`;

	return (user as { id: string; email: string; org_id: string } | undefined) ?? null;
}

export async function resetPassword(
	token: string,
	newPassword: string,
): Promise<{ userId: string; orgId: string } | null> {
	const user = await validatePasswordResetToken(token);
	if (!user) {
		return null;
	}

	const passwordHash = await Bun.password.hash(newPassword, { algorithm: "bcrypt", cost: 10 });

	await sql`
		UPDATE users
		SET password_hash = ${passwordHash},
		    password_reset_token = NULL,
		    password_reset_expires = NULL
		WHERE id = ${user.id}
	`;

	return { userId: user.id, orgId: user.org_id };
}
