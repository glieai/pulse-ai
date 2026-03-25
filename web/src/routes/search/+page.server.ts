import { apiGet } from "$lib/api";
import type { Insight } from "@pulse/shared";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url, locals, fetch }) => {
	const q = url.searchParams.get("q") || "";
	const limit = Number(url.searchParams.get("limit")) || 20;
	const offset = Number(url.searchParams.get("offset")) || 0;

	if (!q.trim() || !locals.token) {
		return { q, insights: [] as Insight[], total: 0, limit, offset };
	}

	try {
		const data = await apiGet<{ insights: Insight[]; total: number }>(
			fetch,
			`/api/search?q=${encodeURIComponent(q)}&limit=${limit}&offset=${offset}`,
			locals.token,
		);
		return { q, insights: data.insights, total: data.total, limit, offset };
	} catch (err) {
		console.error("Search failed:", err);
		return { q, insights: [] as Insight[], total: 0, limit, offset };
	}
};
