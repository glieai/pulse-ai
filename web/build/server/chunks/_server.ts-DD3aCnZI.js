//#region .svelte-kit/adapter-bun/entries/endpoints/sse/ask/_server.ts.js
const API_BASE = `http://localhost:${process.env.API_PORT || "3000"}`;
const POST = async ({ request, locals }) => {
	if (!locals.token) return new Response(JSON.stringify({ error: "Unauthorized" }), {
		status: 401,
		headers: { "Content-Type": "application/json" }
	});
	const body = await request.text();
	const res = await fetch(`${API_BASE}/api/search/ask`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${locals.token}`
		},
		body
	});
	if (!res.ok) {
		const data = await res.text();
		return new Response(data, {
			status: res.status,
			headers: { "Content-Type": "application/json" }
		});
	}
	return new Response(res.body, {
		status: 200,
		headers: {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache",
			Connection: "keep-alive"
		}
	});
};

//#endregion
export { POST };
//# sourceMappingURL=_server.ts-DD3aCnZI.js.map