// In Docker, API_BASE_URL should be set to http://api:3000 (service name on internal network)
// In local dev, defaults to http://localhost:3000
const API_BASE = process.env.API_BASE_URL || `http://localhost:${process.env.API_PORT || "3000"}`;

export class ApiError extends Error {
	constructor(
		public status: number,
		message: string,
	) {
		super(message);
	}
}

async function request<T>(
	fetchFn: typeof globalThis.fetch,
	method: string,
	path: string,
	token?: string | null,
	body?: unknown,
): Promise<T> {
	const headers: Record<string, string> = {};

	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}

	if (body !== undefined) {
		headers["Content-Type"] = "application/json";
	}

	const res = await fetchFn(`${API_BASE}${path}`, {
		method,
		headers,
		body: body !== undefined ? JSON.stringify(body) : undefined,
	});

	if (!res.ok) {
		const data = await res.json().catch(() => ({ error: res.statusText }));
		throw new ApiError(res.status, data.error || res.statusText);
	}

	return res.json() as Promise<T>;
}

export function apiGet<T>(
	fetchFn: typeof globalThis.fetch,
	path: string,
	token?: string | null,
): Promise<T> {
	return request<T>(fetchFn, "GET", path, token);
}

export function apiPost<T>(
	fetchFn: typeof globalThis.fetch,
	path: string,
	body: unknown,
	token?: string | null,
): Promise<T> {
	return request<T>(fetchFn, "POST", path, token, body);
}

export function apiPatch<T>(
	fetchFn: typeof globalThis.fetch,
	path: string,
	body: unknown,
	token?: string | null,
): Promise<T> {
	return request<T>(fetchFn, "PATCH", path, token, body);
}

export function apiPut<T>(
	fetchFn: typeof globalThis.fetch,
	path: string,
	body: unknown,
	token?: string | null,
): Promise<T> {
	return request<T>(fetchFn, "PUT", path, token, body);
}

export function apiDelete<T>(
	fetchFn: typeof globalThis.fetch,
	path: string,
	token?: string | null,
): Promise<T> {
	return request<T>(fetchFn, "DELETE", path, token);
}
