//#region .svelte-kit/adapter-bun/chunks/api.js
const API_BASE = process.env.API_BASE_URL || `http://localhost:${process.env.API_PORT || "3000"}`;
var ApiError = class extends Error {
	constructor(status, message) {
		super(message);
		this.status = status;
	}
};
async function request(fetchFn, method, path, token, body) {
	const headers = {};
	if (token) headers.Authorization = `Bearer ${token}`;
	if (body !== void 0) headers["Content-Type"] = "application/json";
	const res = await fetchFn(`${API_BASE}${path}`, {
		method,
		headers,
		body: body !== void 0 ? JSON.stringify(body) : void 0
	});
	if (!res.ok) {
		const data = await res.json().catch(() => ({ error: res.statusText }));
		throw new ApiError(res.status, data.error || res.statusText);
	}
	return res.json();
}
function apiGet(fetchFn, path, token) {
	return request(fetchFn, "GET", path, token);
}
function apiPost(fetchFn, path, body, token) {
	return request(fetchFn, "POST", path, token, body);
}
function apiPatch(fetchFn, path, body, token) {
	return request(fetchFn, "PATCH", path, token, body);
}
function apiPut(fetchFn, path, body, token) {
	return request(fetchFn, "PUT", path, token, body);
}
function apiDelete(fetchFn, path, token) {
	return request(fetchFn, "DELETE", path, token);
}

//#endregion
export { apiPost as a, apiPatch as i, apiDelete as n, apiPut as o, apiGet as r, ApiError as t };
//# sourceMappingURL=api-D4JXw0uZ.js.map