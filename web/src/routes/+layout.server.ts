import { apiGet } from "$lib/api";
import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

const PUBLIC_ROUTES = ["/", "/login", "/register", "/pricing", "/forgot-password"];
const PUBLIC_PREFIXES = ["/reset-password/", "/invite/", "/auth/"];

function isPublicRoute(pathname: string): boolean {
	return PUBLIC_ROUTES.includes(pathname) || PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
}

export const load: LayoutServerLoad = async ({ locals, url, fetch }) => {
	if (!locals.soloMode && !locals.user && !isPublicRoute(url.pathname)) {
		redirect(302, "/login");
	}

	// Fetch draft count for sidebar badge (non-blocking)
	let draftCount = 0;
	if (locals.token && !isPublicRoute(url.pathname)) {
		try {
			const data = await apiGet<{ total: number }>(
				fetch,
				"/api/insights?status=draft&limit=0",
				locals.token,
			);
			draftCount = data.total;
		} catch {
			// Silently fail — sidebar badge is non-critical
		}
	}

	return {
		user: locals.user,
		soloMode: locals.soloMode,
		draftCount,
	};
};
