/**
 * Typed HTTP client for the Pulse API.
 * Thin wrapper — no business logic, just transport.
 */

import type { Insight } from "@pulse/shared/types/insight";

export interface PaginatedResponse {
	insights: Insight[];
	total: number;
	limit: number;
	offset: number;
}

export interface ContextResponse {
	insights: Insight[];
}

export interface PublishResponse {
	published: Insight[];
	count: number;
}

export interface CreateResponse {
	insight: Insight;
	created: boolean;
}

export class PulseApiClient {
	constructor(
		private baseUrl: string,
		private token: string,
	) {}

	private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
		const url = `${this.baseUrl}${path}`;
		console.error(`[Pulse MCP] fetch ${options.method || "GET"} ${url}`);
		try {
			const res = await fetch(url, {
				...options,
				headers: {
					Authorization: `Bearer ${this.token}`,
					"Content-Type": "application/json",
					...options.headers,
				},
			});

			console.error(`[Pulse MCP] response ${res.status} ${res.statusText}`);
			if (!res.ok) {
				const body = await res.text().catch(() => "");
				throw new Error(`Pulse API ${res.status}: ${body || res.statusText}`);
			}

			if (res.status === 204) return undefined as T;
			return res.json() as Promise<T>;
		} catch (err) {
			const detail = err instanceof Error ? err.message : String(err);
			console.error(`[Pulse MCP] fetch error: ${detail}`);
			throw new Error("Unable to connect. Is the computer able to access the url?");
		}
	}

	/** POST that also returns whether the resource was created (201) or already existed (200) */
	private async requestWithStatus(
		path: string,
		body: Record<string, unknown>,
	): Promise<CreateResponse> {
		const url = `${this.baseUrl}${path}`;
		const res = await fetch(url, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${this.token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
		});

		if (!res.ok) {
			const text = await res.text().catch(() => "");
			throw new Error(`Pulse API ${res.status}: ${text || res.statusText}`);
		}

		const insight = (await res.json()) as Insight;
		return { insight, created: res.status === 201 };
	}

	/** Full-text search (published insights only) */
	async search(
		q: string,
		opts: { limit?: number; offset?: number } = {},
	): Promise<PaginatedResponse> {
		const params = new URLSearchParams({ q });
		if (opts.limit) params.set("limit", String(opts.limit));
		if (opts.offset) params.set("offset", String(opts.offset));
		return this.request(`/search?${params}`);
	}

	/** Context retrieval — FTS, vector, or hybrid */
	async context(opts: {
		query: string;
		strategy?: "fts" | "vector" | "hybrid";
		repo?: string;
		kind?: string;
		limit?: number;
	}): Promise<ContextResponse> {
		const params = new URLSearchParams({ query: opts.query });
		if (opts.strategy) params.set("strategy", opts.strategy);
		if (opts.repo) params.set("repo", opts.repo);
		if (opts.kind) params.set("kind", opts.kind);
		if (opts.limit) params.set("limit", String(opts.limit));
		return this.request(`/context?${params}`);
	}

	/** Get insights related to a specific file */
	async fileContext(filePath: string, repo: string): Promise<ContextResponse> {
		const cleanPath = filePath.replace(/^\//, "");
		return this.request(`/context/file/${cleanPath}?repo=${encodeURIComponent(repo)}`);
	}

	/** List insights with filters */
	async list(
		opts: {
			kind?: string;
			repo?: string;
			branch?: string;
			status?: string;
			limit?: number;
			offset?: number;
		} = {},
	): Promise<PaginatedResponse> {
		const params = new URLSearchParams();
		for (const [k, v] of Object.entries(opts)) {
			if (v !== undefined) params.set(k, String(v));
		}
		return this.request(`/insights?${params}`);
	}

	/** Get a single insight by ID */
	async get(id: string): Promise<Insight> {
		return this.request(`/insights/${id}`);
	}

	/** Create a new insight (returns created=false if duplicate) */
	async create(insight: {
		kind: string;
		title: string;
		body: string;
		repo: string;
		branch?: string;
		source_files?: string[];
		commit_hashes?: string[];
		session_refs?: Record<string, unknown>[];
		structured?: Record<string, unknown>;
		trigger_type: string;
		status?: string;
	}): Promise<CreateResponse> {
		return this.requestWithStatus("/insights", insight);
	}

	/** Generate an insight from raw data using server-side LLM */
	async generate(opts: {
		raw_data: string;
		source_type: string;
		source_name?: string;
		repo: string;
		branch?: string;
		auto_approve?: boolean;
	}): Promise<CreateResponse> {
		return this.requestWithStatus("/insights/generate", opts);
	}

	/** Publish all draft insights for a repo */
	async publish(repo: string): Promise<PublishResponse> {
		return this.request("/insights/publish", {
			method: "POST",
			body: JSON.stringify({ repo }),
		});
	}
}
