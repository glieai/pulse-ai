import { ApiError, apiGet, apiPatch, apiPost } from "$lib/api";
import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

interface UserMe {
	id: string;
	name: string;
	email: string;
	role: string;
	two_factor_enabled: boolean;
}

export const load: PageServerLoad = async ({ locals, fetch }) => {
	if (locals.soloMode) {
		redirect(302, "/settings");
	}

	if (!locals.token) {
		redirect(302, "/login");
	}

	let me: UserMe | null = null;
	try {
		const data = await apiGet<{ user: UserMe }>(fetch, "/api/auth/me", locals.token);
		me = data.user;
	} catch {
		// failed
	}

	return {
		user: locals.user,
		me,
	};
};

export const actions = {
	createToken: async ({ locals, fetch }) => {
		if (!locals.token) return fail(401, { tokenError: "Unauthorized" });

		try {
			const result = await apiPost<{ token: string }>(fetch, "/api/auth/token", {}, locals.token);
			return { token: result.token };
		} catch (err) {
			if (err instanceof ApiError) {
				return fail(err.status, { tokenError: err.message });
			}
			return fail(500, { tokenError: "Failed to create token" });
		}
	},

	updateProfile: async ({ request, locals, fetch }) => {
		if (!locals.token) return fail(401, { error: "Unauthorized" });

		const data = await request.formData();
		const name = (data.get("name") as string)?.trim();

		if (!name) {
			return fail(400, { profileError: "Name is required." });
		}

		try {
			await apiPatch(fetch, "/api/auth/profile", { name }, locals.token);
			return { profileSaved: true };
		} catch (err) {
			if (err instanceof ApiError) {
				return fail(err.status, { profileError: err.message });
			}
			return fail(500, { profileError: "Failed to update profile." });
		}
	},

	changePassword: async ({ request, locals, fetch }) => {
		if (!locals.token) return fail(401, { error: "Unauthorized" });

		const data = await request.formData();
		const current_password = data.get("current_password") as string;
		const new_password = data.get("new_password") as string;
		const confirm_password = data.get("confirm_password") as string;

		if (!current_password || !new_password) {
			return fail(400, { passwordError: "All fields are required." });
		}

		if (new_password.length < 8) {
			return fail(400, { passwordError: "New password must be at least 8 characters." });
		}

		if (new_password !== confirm_password) {
			return fail(400, { passwordError: "New passwords do not match." });
		}

		try {
			await apiPost(
				fetch,
				"/api/auth/change-password",
				{ current_password, new_password },
				locals.token,
			);
			return { passwordSaved: true };
		} catch (err) {
			if (err instanceof ApiError) {
				return fail(err.status, { passwordError: err.message });
			}
			return fail(500, { passwordError: "Failed to change password." });
		}
	},

	setup2fa: async ({ locals, fetch }) => {
		if (!locals.token) return fail(401, { error: "Unauthorized" });

		try {
			const result = await apiPost<{ secret: string; qrCode: string }>(
				fetch,
				"/api/auth/2fa/setup",
				{},
				locals.token,
			);
			return { setup2fa: true, secret: result.secret, qrCode: result.qrCode };
		} catch (err) {
			if (err instanceof ApiError) {
				return fail(err.status, { twoFaError: err.message });
			}
			return fail(500, { twoFaError: "Failed to start 2FA setup." });
		}
	},

	confirm2fa: async ({ request, locals, fetch }) => {
		if (!locals.token) return fail(401, { error: "Unauthorized" });

		const data = await request.formData();
		const code = (data.get("code") as string)?.trim();

		if (!code || !/^\d{6}$/.test(code)) {
			return fail(400, { confirmError: "Enter the 6-digit code from your authenticator app." });
		}

		try {
			const result = await apiPost<{ enabled: boolean; backupCodes: string[] }>(
				fetch,
				"/api/auth/2fa/confirm",
				{ code },
				locals.token,
			);
			return { twoFaEnabled: true, backupCodes: result.backupCodes };
		} catch (err) {
			if (err instanceof ApiError) {
				return fail(err.status, { confirmError: err.message });
			}
			return fail(500, { confirmError: "Failed to confirm 2FA." });
		}
	},

	disable2fa: async ({ request, locals, fetch }) => {
		if (!locals.token) return fail(401, { error: "Unauthorized" });

		const data = await request.formData();
		const code = (data.get("code") as string)?.trim();

		if (!code) {
			return fail(400, { disableError: "Code is required to disable 2FA." });
		}

		try {
			await apiPost(fetch, "/api/auth/2fa/disable", { code }, locals.token);
			return { twoFaDisabled: true };
		} catch (err) {
			if (err instanceof ApiError) {
				return fail(err.status, { disableError: err.message });
			}
			return fail(500, { disableError: "Failed to disable 2FA." });
		}
	},
} satisfies Actions;
