import { ApiError, apiGet } from "$lib/api";
import type { Insight } from "@pulse/shared";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

interface InsightWithNav extends Insight {
	nav: { prev_id: string | null; next_id: string | null } | null;
}

export interface RelatedInsight {
	id: string;
	title: string;
	kind: string;
}

export const load: PageServerLoad = async ({ params, url, locals, fetch }) => {
	if (!locals.token) {
		error(401, "Unauthorized");
	}
	const token = locals.token;

	// Forward nav + filter params for neighbor navigation
	const wantsNav = url.searchParams.get("nav") === "1";
	const kind = url.searchParams.get("kind") || "";
	const repo = url.searchParams.get("repo") || "";

	const navParams = new URLSearchParams();
	if (wantsNav) navParams.set("nav", "1");
	if (kind) navParams.set("kind", kind);
	if (repo) navParams.set("repo", repo);

	const qs = navParams.toString();
	const apiPath = `/api/insights/${params.id}${qs ? `?${qs}` : ""}`;

	try {
		const data = await apiGet<InsightWithNav>(fetch, apiPath, locals.token);

		// Fetch related insight titles for enrichment display
		let relatedInsights: RelatedInsight[] = [];
		const relatedIds = data.enrichment?.related_ids;
		if (relatedIds && relatedIds.length > 0) {
			const fetches = relatedIds.slice(0, 5).map(async (id) => {
				try {
					const r = await apiGet<Insight>(fetch, `/api/insights/${id}`, token);
					return { id: r.id, title: r.title, kind: r.kind } as RelatedInsight;
				} catch {
					return null; // May have been deleted
				}
			});
			relatedInsights = (await Promise.all(fetches)).filter((r): r is RelatedInsight => r !== null);
		}

		// Fetch superseded-by insight title if exists
		let supersededByInsight: RelatedInsight | null = null;
		const supersededById = data.enrichment?.superseded_by_id;
		if (supersededById) {
			try {
				const r = await apiGet<Insight>(fetch, `/api/insights/${supersededById}`, token);
				supersededByInsight = { id: r.id, title: r.title, kind: r.kind };
			} catch {
				// May have been deleted
			}
		}

		// Fetch supersedes insight title if exists
		let supersedesInsight: RelatedInsight | null = null;
		if (data.supersedes_id) {
			try {
				const r = await apiGet<Insight>(fetch, `/api/insights/${data.supersedes_id}`, token);
				supersedesInsight = { id: r.id, title: r.title, kind: r.kind };
			} catch {
				// May have been deleted
			}
		}

		return {
			insight: data,
			nav: data.nav ?? null,
			filterParams: qs ? `?${qs}` : "",
			relatedInsights,
			supersededByInsight,
			supersedesInsight,
		};
	} catch (err) {
		if (err instanceof ApiError) {
			error(err.status, err.status === 404 ? "Insight not found" : err.message);
		}
		console.error("Failed to load insight:", err);
		error(500, "Failed to load insight");
	}
};
