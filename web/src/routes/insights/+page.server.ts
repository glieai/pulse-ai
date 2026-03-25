import { apiGet } from "$lib/api";
import type { Insight, OrgSettings } from "@pulse/shared";
import type { PageServerLoad } from "./$types";

interface InsightListResponse {
	insights: Insight[];
	total: number;
	next_cursor: string | null;
	has_more: boolean;
}

export const load: PageServerLoad = async ({ url, locals, fetch }) => {
	const limit = Number(url.searchParams.get("limit")) || 20;
	const kind = url.searchParams.get("kind") || "";
	const repo = url.searchParams.get("repo") || "";

	if (!locals.token) {
		return {
			insights: [] as Insight[],
			total: 0,
			nextCursor: null as string | null,
			hasMore: false,
			repos: [] as string[],
			llmConfigured: false,
		};
	}

	const params = new URLSearchParams({ limit: String(limit) });
	params.set("status", "published");
	if (kind) params.set("kind", kind);
	if (repo) params.set("repo", repo);

	try {
		const data = await apiGet<InsightListResponse>(fetch, `/api/insights?${params}`, locals.token);

		const repos = [...new Set(data.insights.map((i) => i.repo))].sort();

		// Check if LLM is configured (for Ask Pulse)
		let llmConfigured = false;
		try {
			const result = await apiGet<{ settings: OrgSettings }>(
				fetch,
				"/api/org/settings",
				locals.token,
			);
			llmConfigured = !!result.settings?.llm || !!result.settings?.cli_provider;
		} catch {
			// Settings unavailable — show as unconfigured
		}

		return {
			insights: data.insights,
			total: data.total,
			nextCursor: data.next_cursor,
			hasMore: data.has_more,
			repos,
			llmConfigured,
		};
	} catch (err) {
		console.error("Failed to load insights:", err);
		return {
			insights: [] as Insight[],
			total: 0,
			nextCursor: null as string | null,
			hasMore: false,
			repos: [] as string[],
			llmConfigured: false,
		};
	}
};
