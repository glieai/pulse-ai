/**
 * SvelteKit SSE proxy for Ask Pulse.
 *
 * Proxies POST requests to the Hono API, injecting the JWT from the httpOnly cookie.
 * This avoids exposing the token to client-side JS.
 */

import type { RequestHandler } from "./$types";

const API_PORT = process.env.API_PORT || "3000";
const API_BASE = `http://localhost:${API_PORT}`;

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.token) {
		return new Response(JSON.stringify({ error: "Unauthorized" }), {
			status: 401,
			headers: { "Content-Type": "application/json" },
		});
	}

	const body = await request.text();

	const res = await fetch(`${API_BASE}/api/search/ask`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${locals.token}`,
		},
		body,
	});

	// Pass through errors as-is (JSON)
	if (!res.ok) {
		const data = await res.text();
		return new Response(data, {
			status: res.status,
			headers: { "Content-Type": "application/json" },
		});
	}

	// Pass through SSE stream
	return new Response(res.body, {
		status: 200,
		headers: {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache",
			Connection: "keep-alive",
		},
	});
};
