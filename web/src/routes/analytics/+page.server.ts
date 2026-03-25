import { apiGet } from "$lib/api";
import type { PageServerLoad } from "./$types";

interface AnalyticsData {
	insights_per_week: { week: string; count: number }[];
	kind_distribution: { kind: string; count: number }[];
	top_repos: { repo: string; count: number }[];
	top_contributors: { author_name: string; count: number }[];
	totals: { total: number; published: number; drafts: number };
}

export const load: PageServerLoad = async ({ locals, fetch }) => {
	if (!locals.token) {
		return {
			analytics: null,
		};
	}

	try {
		const analytics = await apiGet<AnalyticsData>(fetch, "/api/insights/analytics", locals.token);
		return { analytics };
	} catch {
		return { analytics: null };
	}
};
