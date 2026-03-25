import { ApiError, apiPost } from "$lib/api";
import { fail } from "@sveltejs/kit";
import type { Actions } from "./$types";

export const actions = {
	default: async ({ request, fetch }) => {
		const data = await request.formData();
		const email = data.get("email") as string;

		if (!email) {
			return fail(400, { error: "Email is required." });
		}

		try {
			await apiPost(fetch, "/api/auth/forgot-password", { email });
		} catch (err) {
			// Only fail on unexpected errors — 200 always returned for security
			if (err instanceof ApiError && err.status !== 200) {
				return fail(err.status, { error: err.message });
			}
		}

		return { success: "If that email exists, a reset link has been sent. Check your inbox." };
	},
} satisfies Actions;
