import { ApiError, apiDelete, apiGet } from "$lib/api";
import type { Insight } from "@pulse/shared";
import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, fetch }) => {
	if (!locals.token) {
		return { drafts: [] as Insight[], total: 0 };
	}

	try {
		const data = await apiGet<{ insights: Insight[]; total: number }>(
			fetch,
			"/api/insights?status=draft&limit=100",
			locals.token,
		);
		return { drafts: data.insights, total: data.total };
	} catch {
		return { drafts: [] as Insight[], total: 0 };
	}
};

export const actions = {
	delete: async ({ request, locals, fetch }) => {
		if (!locals.token) {
			return fail(401, { error: "Unauthorized" });
		}

		const data = await request.formData();
		const id = data.get("id") as string;

		if (!id) {
			return fail(400, { error: "Missing insight id" });
		}

		try {
			await apiDelete(fetch, `/api/insights/${id}`, locals.token);
			return { deleted: id };
		} catch (err) {
			if (err instanceof ApiError) {
				return fail(err.status, { error: err.message });
			}
			return fail(500, { error: "Failed to delete draft" });
		}
	},
} satisfies Actions;
