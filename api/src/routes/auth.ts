import { Hono } from "hono";
import { z } from "zod";
import { sql } from "../db/client";
import { env } from "../env";
import { authRateLimit } from "../middleware";
import { auth } from "../middleware/auth";
import { loginSchema, registerSchema } from "../schemas/auth";
import { audit, getIp } from "../services/audit";
import {
	createApiToken,
	createPasswordResetToken,
	loginUser,
	registerUser,
	resetPassword,
	signJwt,
	validatePasswordResetToken,
	verifyTwoFALogin,
} from "../services/auth";
import { passwordResetEmail, sendEmail } from "../services/email";
import {
	generateBackupCodes,
	generateQRCode,
	generateSecret,
	hashBackupCodes,
	verifyTOTP,
} from "../services/two-factor";
import type { AppEnv } from "../types/app";

const authRouter = new Hono<AppEnv>();

authRouter.post("/auth/register", authRateLimit, async (c) => {
	const body = await c.req.json();
	const input = registerSchema.parse(body);

	try {
		const result = await registerUser(input);
		return c.json(result, 201);
	} catch (err: unknown) {
		if (err instanceof Error && err.message.includes("duplicate key")) {
			const detail = err.message;
			if (detail.includes("email")) {
				return c.json({ error: "Email already registered" }, 409);
			}
			if (detail.includes("slug")) {
				return c.json({ error: "Organization name already taken" }, 409);
			}
			return c.json({ error: "Already exists" }, 409);
		}
		throw err;
	}
});

authRouter.post("/auth/login", authRateLimit, async (c) => {
	const body = await c.req.json();
	const input = loginSchema.parse(body);

	const result = await loginUser(input);

	if (!result) {
		await audit({
			orgId: "00000000-0000-0000-0000-000000000000",
			action: "user.login_failed",
			metadata: { email: input.email },
			ip: getIp(c),
		});
		return c.json({ error: "Invalid credentials" }, 401);
	}

	if ("deactivated" in result) {
		return c.json({ error: "Your account has been deactivated. Contact your administrator." }, 403);
	}

	if ("requires2FA" in result) {
		// Don't audit here — not yet authenticated
		return c.json({ requires2FA: true, temp_token: result.temp_token });
	}

	await audit({
		orgId: result.user.org_id as string,
		userId: result.user.id as string,
		action: "user.login",
		ip: getIp(c),
	});

	return c.json(result);
});

authRouter.post("/auth/token", auth, async (c) => {
	const { user_id, org_id } = c.get("auth");
	const result = await createApiToken(user_id, org_id);
	return c.json(result, 201);
});

// ─── Password Reset ───────────────────────────────────────────────────────────

authRouter.post("/auth/forgot-password", authRateLimit, async (c) => {
	const body = await c.req.json();
	const { email } = z.object({ email: z.string().email() }).parse(body);

	const result = await createPasswordResetToken(email);

	if (result) {
		const resetUrl = `${env.FRONTEND_URL}/reset-password/${result.token}`;
		await sendEmail(passwordResetEmail(email, resetUrl));
		await audit({
			orgId: result.orgId,
			userId: result.userId,
			action: "user.password_reset_requested",
			resourceType: "user",
			resourceId: result.userId,
			ip: getIp(c),
		});
	}

	// Always return 200 — do not reveal whether email exists
	return c.json({ message: "If that email exists, a reset link has been sent." });
});

authRouter.get("/auth/reset-password/validate/:token", async (c) => {
	const token = c.req.param("token");
	const user = await validatePasswordResetToken(token);

	if (!user) {
		return c.json({ valid: false }, 400);
	}

	return c.json({ valid: true, email: user.email });
});

authRouter.post("/auth/reset-password", authRateLimit, async (c) => {
	const body = await c.req.json();
	const { token, password } = z
		.object({ token: z.string(), password: z.string().min(8) })
		.parse(body);

	const result = await resetPassword(token, password);

	if (!result) {
		return c.json({ error: "Invalid or expired reset token." }, 400);
	}

	await audit({
		orgId: result.orgId,
		userId: result.userId,
		action: "user.password_reset_completed",
		resourceType: "user",
		resourceId: result.userId,
		ip: getIp(c),
	});

	return c.json({ message: "Password updated successfully." });
});

// ─── Profile & Password ───────────────────────────────────────────────────────

authRouter.get("/auth/me", auth, async (c) => {
	const { user_id } = c.get("auth");
	const [user] = await sql`
		SELECT id, org_id, name, email, role, is_active, two_factor_enabled, created_at
		FROM users WHERE id = ${user_id}
	`;
	if (!user) {
		return c.json({ error: "User not found" }, 404);
	}
	return c.json({ user });
});

authRouter.patch("/auth/profile", auth, async (c) => {
	const { user_id, org_id } = c.get("auth");
	const { name } = z.object({ name: z.string().min(1).max(100) }).parse(await c.req.json());

	const [updated] = await sql`
		UPDATE users SET name = ${name} WHERE id = ${user_id}
		RETURNING id, name, email, role
	`;

	await audit({
		orgId: org_id,
		userId: user_id,
		action: "user.profile_updated",
		resourceType: "user",
		resourceId: user_id,
		ip: getIp(c),
	});

	return c.json({ user: updated });
});

authRouter.post("/auth/change-password", auth, async (c) => {
	const { user_id, org_id } = c.get("auth");
	const { current_password, new_password } = z
		.object({ current_password: z.string(), new_password: z.string().min(8) })
		.parse(await c.req.json());

	const [user] = await sql`SELECT password_hash FROM users WHERE id = ${user_id}`;
	if (!user) {
		return c.json({ error: "User not found" }, 404);
	}

	const valid = await Bun.password.verify(current_password, user.password_hash);
	if (!valid) {
		return c.json({ error: "Current password is incorrect." }, 400);
	}

	const newHash = await Bun.password.hash(new_password, { algorithm: "bcrypt", cost: 10 });
	await sql`UPDATE users SET password_hash = ${newHash} WHERE id = ${user_id}`;

	await audit({
		orgId: org_id,
		userId: user_id,
		action: "user.password_changed",
		resourceType: "user",
		resourceId: user_id,
		ip: getIp(c),
	});

	return c.json({ message: "Password updated." });
});

// ─── 2FA Setup ────────────────────────────────────────────────────────────────

// Initiate 2FA setup — generates secret + QR code, stores pending secret
authRouter.post("/auth/2fa/setup", auth, async (c) => {
	const { user_id } = c.get("auth");

	// Get user email for QR code label
	const [user] = await sql`
		SELECT email, two_factor_enabled FROM users WHERE id = ${user_id}
	`;

	if (user?.two_factor_enabled) {
		return c.json({ error: "2FA is already enabled. Disable it first." }, 400);
	}

	const { secret, otpauthUrl } = generateSecret(user.email);
	const qrCode = await generateQRCode(otpauthUrl);

	// Store pending secret (not yet active — user must confirm with a valid code)
	await sql`UPDATE users SET two_factor_secret = ${secret} WHERE id = ${user_id}`;

	return c.json({ secret, qrCode });
});

// Confirm 2FA setup — validate TOTP code then activate
authRouter.post("/auth/2fa/confirm", auth, async (c) => {
	const { user_id, org_id } = c.get("auth");
	const { code } = z.object({ code: z.string().min(6).max(6) }).parse(await c.req.json());

	const [user] = await sql`
		SELECT two_factor_secret, two_factor_enabled FROM users WHERE id = ${user_id}
	`;

	if (!user?.two_factor_secret) {
		return c.json({ error: "No pending 2FA setup. Call /auth/2fa/setup first." }, 400);
	}

	if (user.two_factor_enabled) {
		return c.json({ error: "2FA is already enabled." }, 400);
	}

	if (!verifyTOTP(user.two_factor_secret, code)) {
		return c.json({ error: "Invalid code. Please try again." }, 400);
	}

	// Generate + store hashed backup codes
	const backupCodes = generateBackupCodes();
	const hashedCodes = hashBackupCodes(backupCodes);

	await sql`
		UPDATE users
		SET two_factor_enabled = true,
		    two_factor_backup_codes = ${JSON.stringify(hashedCodes)}::jsonb
		WHERE id = ${user_id}
	`;

	await audit({
		orgId: org_id,
		userId: user_id,
		action: "user.2fa_enabled",
		resourceType: "user",
		resourceId: user_id,
		ip: getIp(c),
	});

	return c.json({ enabled: true, backupCodes });
});

// Complete 2FA login — exchange temp_token + TOTP/backup code for full JWT
authRouter.post("/auth/verify-2fa", authRateLimit, async (c) => {
	const { temp_token, code } = z
		.object({ temp_token: z.string(), code: z.string().min(6) })
		.parse(await c.req.json());

	const result = await verifyTwoFALogin(temp_token, code);

	if (result === null) {
		return c.json({ error: "Session expired. Please sign in again." }, 401);
	}

	if ("deactivated" in result) {
		return c.json({ error: "Your account has been deactivated." }, 403);
	}

	if ("invalid" in result) {
		return c.json({ error: "Invalid code. Please try again." }, 400);
	}

	await audit({
		orgId: result.user.org_id as string,
		userId: result.user.id as string,
		action: "user.login_2fa",
		ip: getIp(c),
	});

	return c.json(result);
});

// ─── Google OAuth ────────────────────────────────────────────────────────────
// Called by the SvelteKit callback after Google returns an authorization code.
// Finds the user by google_id or by email (and links google_id).
// Does NOT create new accounts — user must be invited first.

const googleLoginSchema = z.object({
	google_id: z.string().min(1),
	email: z.string().email(),
	name: z.string().min(1),
});

authRouter.post("/auth/google-login", authRateLimit, async (c) => {
	const body = await c.req.json();
	const { google_id, email } = googleLoginSchema.parse(body);

	// Find user by google_id first
	let [user] = await sql`
		SELECT id, org_id, name, email, role, is_active, is_super_admin, two_factor_enabled
		FROM users WHERE google_id = ${google_id}
	`;

	if (!user) {
		// Try to find by email and link
		[user] = await sql`
			SELECT id, org_id, name, email, role, is_active, is_super_admin, two_factor_enabled
			FROM users WHERE email = ${email}
		`;
		if (user) {
			// Link Google account
			await sql`UPDATE users SET google_id = ${google_id} WHERE id = ${user.id}`;
		}
	}

	if (!user) {
		return c.json(
			{ error: "No account found for this Google account. You must be invited first." },
			404,
		);
	}

	if (!user.is_active) {
		return c.json({ error: "Your account has been deactivated." }, 403);
	}

	// Google already provides strong auth — skip Pulse 2FA for OAuth logins

	const token = await signJwt({
		user_id: user.id,
		org_id: user.org_id,
		role: user.role,
		name: user.name,
		email: user.email,
		is_super_admin: user.is_super_admin ?? false,
	});

	await audit({
		orgId: user.org_id,
		userId: user.id,
		action: "user.login",
		metadata: { method: "google_oauth" },
		ip: getIp(c),
	});

	const { is_active: _, is_super_admin: __, two_factor_enabled: ___, ...safeUser } = user;
	return c.json({ token, user: safeUser });
});

// Disable 2FA — POST instead of DELETE because we need to send a body (TOTP code)
authRouter.post("/auth/2fa/disable", auth, async (c) => {
	const { user_id, org_id } = c.get("auth");
	const { code } = z.object({ code: z.string().min(6) }).parse(await c.req.json());

	const [user] = await sql`
		SELECT two_factor_enabled, two_factor_secret FROM users WHERE id = ${user_id}
	`;

	if (!user?.two_factor_enabled) {
		return c.json({ error: "2FA is not enabled." }, 400);
	}

	// Require valid TOTP to disable (prevents attacker with stolen session from disabling)
	if (!verifyTOTP(user.two_factor_secret, code)) {
		return c.json({ error: "Invalid code." }, 400);
	}

	await sql`
		UPDATE users
		SET two_factor_enabled = false,
		    two_factor_secret = NULL,
		    two_factor_backup_codes = NULL
		WHERE id = ${user_id}
	`;

	await audit({
		orgId: org_id,
		userId: user_id,
		action: "user.2fa_disabled",
		resourceType: "user",
		resourceId: user_id,
		ip: getIp(c),
	});

	return c.json({ disabled: true });
});

export { authRouter };
