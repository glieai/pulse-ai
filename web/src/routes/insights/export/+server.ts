import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

const API_BASE = process.env.API_BASE_URL || `http://localhost:${process.env.API_PORT || "3000"}`;

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.token) {
		redirect(302, "/login");
	}

	const res = await fetch(`${API_BASE}/api/insights/export`, {
		headers: { Authorization: `Bearer ${locals.token}` },
	});

	if (!res.ok) {
		return new Response(JSON.stringify({ error: "Export failed" }), { status: res.status });
	}

	// Stream the response directly to the browser with download headers
	return new Response(res.body, {
		headers: {
			"Content-Type": "application/json",
			"Content-Disposition":
				res.headers.get("Content-Disposition") ?? 'attachment; filename="insights.json"',
		},
	});
};
