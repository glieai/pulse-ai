export class ApiError extends Error {
	constructor(
		public status: number,
		message: string,
	) {
		super(message);
		this.name = "ApiError";
	}
}

export async function apiGet<T>(baseUrl: string, path: string, token?: string): Promise<T> {
	const url = `${baseUrl}/api${path}`;
	const headers: Record<string, string> = {};
	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}
	const res = await fetch(url, { headers });

	if (!res.ok) {
		const body = await res.json().catch(() => ({ error: res.statusText }));
		throw new ApiError(res.status, (body as { error?: string }).error ?? res.statusText);
	}

	return res.json() as Promise<T>;
}

export async function apiPost<T>(
	baseUrl: string,
	path: string,
	body: unknown,
	token?: string,
): Promise<T> {
	const headers: Record<string, string> = { "Content-Type": "application/json" };
	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}

	const url = `${baseUrl}/api${path}`;
	const res = await fetch(url, {
		method: "POST",
		headers,
		body: JSON.stringify(body),
	});

	if (!res.ok) {
		const resBody = await res.json().catch(() => ({ error: res.statusText }));
		throw new ApiError(res.status, (resBody as { error?: string }).error ?? res.statusText);
	}

	return res.json() as Promise<T>;
}

export async function apiPatch<T>(
	baseUrl: string,
	path: string,
	body: unknown,
	token?: string,
): Promise<T> {
	const headers: Record<string, string> = { "Content-Type": "application/json" };
	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}

	const url = `${baseUrl}/api${path}`;
	const res = await fetch(url, {
		method: "PATCH",
		headers,
		body: JSON.stringify(body),
	});

	if (!res.ok) {
		const resBody = await res.json().catch(() => ({ error: res.statusText }));
		throw new ApiError(res.status, (resBody as { error?: string }).error ?? res.statusText);
	}

	return res.json() as Promise<T>;
}
