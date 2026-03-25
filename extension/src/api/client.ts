import type { Insight, InsightCreate } from "@pulse/shared";

export class ApiError extends Error {
	constructor(
		public status: number,
		message: string,
	) {
		super(message);
		this.name = "ApiError";
	}
}

export interface SearchResult {
	insights: Insight[];
	total: number;
	page: number;
	limit: number;
}

export interface InsightsListResult {
	insights: Insight[];
	total: number;
	page: number;
	limit: number;
}

export interface FileContextResult {
	insights: Insight[];
}

export interface PublishResult {
	published: Insight[];
	count: number;
}

export interface RelatedContextResult {
	id: string;
	kind: string;
	title: string;
	body_excerpt: string;
	branch: string | null;
	source_files: string[] | null;
	status: string;
	score: number;
}

export class PulseApiClient {
	constructor(
		private apiUrl: string,
		private token: string,
	) {}

	/** Update credentials (e.g. after config change). */
	configure(apiUrl: string, token: string): void {
		this.apiUrl = apiUrl;
		this.token = token;
	}

	/** Health check — verifies API is reachable and token is valid. */
	async ping(): Promise<boolean> {
		try {
			await this.get<{ insights: unknown[] }>("/insights?limit=1");
			return true;
		} catch {
			return false;
		}
	}

	/** Full-text search. */
	async search(query: string, page = 1, limit = 20): Promise<SearchResult> {
		return this.get<SearchResult>(
			`/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
		);
	}

	/** List insights with optional filters. */
	async getInsights(params?: {
		kind?: string;
		repo?: string;
		status?: string;
		page?: number;
		limit?: number;
	}): Promise<InsightsListResult> {
		const qs = new URLSearchParams();
		if (params?.kind) qs.set("kind", params.kind);
		if (params?.repo) qs.set("repo", params.repo);
		if (params?.status) qs.set("status", params.status);
		if (params?.page) qs.set("page", String(params.page));
		qs.set("limit", String(params?.limit ?? 20));
		return this.get<InsightsListResult>(`/insights?${qs.toString()}`);
	}

	/** Get a single insight by ID. */
	async getInsight(id: string): Promise<Insight> {
		return this.get<Insight>(`/insights/${id}`);
	}

	/** Get insights related to a file path. */
	async getFileContext(filePath: string, repo: string): Promise<FileContextResult> {
		return this.get<FileContextResult>(
			`/context/file/${encodeURIComponent(filePath)}?repo=${encodeURIComponent(repo)}`,
		);
	}

	/** Create a new insight. */
	async createInsight(data: InsightCreate): Promise<Insight> {
		return this.post<Insight>("/insights", data);
	}

	/** Publish drafts. If repo is provided, only that repo. Otherwise all drafts. */
	async publishDrafts(repo?: string): Promise<PublishResult> {
		return this.post<PublishResult>("/insights/publish", repo ? { repo } : {});
	}

	/** Delete a draft insight. */
	async deleteInsight(id: string): Promise<void> {
		await this.del(`/insights/${id}`);
	}

	/** Find related insights using multi-signal scoring (session, files, branch, keywords). */
	async getRelatedContext(input: {
		repo: string;
		branch?: string;
		source_files?: string[];
		recent_commits?: string;
		session_id?: string;
		limit?: number;
	}): Promise<{ insights: RelatedContextResult[] }> {
		return this.post<{ insights: RelatedContextResult[] }>("/context/related", input);
	}

	// --- Private helpers ---

	private async get<T>(path: string): Promise<T> {
		const headers: Record<string, string> = {};
		if (this.token) {
			headers.Authorization = `Bearer ${this.token}`;
		}
		const res = await fetch(`${this.apiUrl}/api${path}`, { headers });
		if (!res.ok) {
			const body = await res.json().catch(() => ({ error: res.statusText }));
			throw new ApiError(res.status, (body as { error?: string }).error ?? res.statusText);
		}
		return res.json() as Promise<T>;
	}

	private async post<T>(path: string, body: unknown): Promise<T> {
		const headers: Record<string, string> = { "Content-Type": "application/json" };
		if (this.token) {
			headers.Authorization = `Bearer ${this.token}`;
		}
		const res = await fetch(`${this.apiUrl}/api${path}`, {
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

	private async del(path: string): Promise<void> {
		const headers: Record<string, string> = {};
		if (this.token) {
			headers.Authorization = `Bearer ${this.token}`;
		}
		const res = await fetch(`${this.apiUrl}/api${path}`, {
			method: "DELETE",
			headers,
		});
		if (!res.ok) {
			const body = await res.json().catch(() => ({ error: res.statusText }));
			throw new ApiError(res.status, (body as { error?: string }).error ?? res.statusText);
		}
	}
}
