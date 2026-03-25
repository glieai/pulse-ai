import { ApiError, apiGet, apiPost } from "$lib/api";
import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, fetch }) => {
	const { token } = params;

	try {
		const result = await apiGet<{ valid: boolean; email?: string }>(
			fetch,
			`/api/auth/reset-password/validate/${token}`,
		);
		return { valid: result.valid, email: result.email ?? null, token };
	} catch {
		return { valid: false, email: null, token };
	}
};

export const actions = {
	default: async ({ request, params, fetch }) => {
		const data = await request.formData();
		const password = data.get("password") as string;
		const { token } = params;

		if (!password || password.length < 8) {
			return fail(400, { error: "Password must be at least 8 characters." });
		}

		try {
			await apiPost(fetch, "/api/auth/reset-password", { token, password });
			return { success: true };
		} catch (err) {
			if (err instanceof ApiError) {
				return fail(err.status, { error: err.message });
			}
			return fail(500, { error: "Something went wrong. Please try again." });
		}
	},
} satisfies Actions;
