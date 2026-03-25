import { ApiError, apiPost } from "$lib/api";
import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.soloMode) redirect(302, "/insights");
	return {
		googleOAuthEnabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
	};
};

export const actions = {
	login: async ({ request, cookies, fetch }) => {
		const data = await request.formData();
		const email = data.get("email") as string;
		const password = data.get("password") as string;

		if (!email || !password) {
			return fail(400, { error: "Email and password are required." });
		}

		try {
			const result = await apiPost<
				{ token: string; user: { name: string } } | { requires2FA: boolean; temp_token: string }
			>(fetch, "/api/auth/login", { email, password });

			// 2FA required — show code input
			if ("requires2FA" in result && result.requires2FA) {
				return { requires2FA: true, temp_token: result.temp_token };
			}

			const loginResult = result as { token: string; user: { name: string } };
			cookies.set("pulse_jwt", loginResult.token, {
				path: "/",
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax",
				maxAge: 60 * 60 * 24,
			});
		} catch (err) {
			if (err instanceof ApiError) {
				return fail(err.status, { error: err.message });
			}
			return fail(500, { error: "Something went wrong. Please try again." });
		}

		redirect(302, "/");
	},

	verify2fa: async ({ request, cookies, fetch }) => {
		const data = await request.formData();
		const temp_token = data.get("temp_token") as string;
		const code = data.get("code") as string;

		if (!temp_token || !code) {
			return fail(400, { error: "Code is required.", requires2FA: true, temp_token });
		}

		try {
			const result = await apiPost<{ token: string; user: { name: string } }>(
				fetch,
				"/api/auth/verify-2fa",
				{ temp_token, code },
			);

			cookies.set("pulse_jwt", result.token, {
				path: "/",
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax",
				maxAge: 60 * 60 * 24,
			});
		} catch (err) {
			if (err instanceof ApiError) {
				return fail(err.status, { error: err.message, requires2FA: true, temp_token });
			}
			return fail(500, {
				error: "Something went wrong. Please try again.",
				requires2FA: true,
				temp_token,
			});
		}

		redirect(302, "/");
	},
} satisfies Actions;
