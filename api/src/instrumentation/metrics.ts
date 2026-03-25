import { Counter, Histogram, Registry, collectDefaultMetrics } from "prom-client";

export const register = new Registry();

// Collect Node.js / Bun default metrics (GC, memory, event loop lag)
if (process.env.NODE_ENV !== "test") {
	collectDefaultMetrics({ register });
}

// ─── HTTP ─────────────────────────────────────────────────────────────────────

export const httpRequestsTotal = new Counter({
	name: "pulse_http_requests_total",
	help: "Total HTTP requests",
	labelNames: ["method", "route", "status"] as const,
	registers: [register],
});

export const httpRequestDuration = new Histogram({
	name: "pulse_http_request_duration_seconds",
	help: "HTTP request duration in seconds",
	labelNames: ["method", "route", "status"] as const,
	buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
	registers: [register],
});

// ─── Insights ─────────────────────────────────────────────────────────────────

export const insightsCreatedTotal = new Counter({
	name: "pulse_insights_created_total",
	help: "Total insights created",
	labelNames: ["kind", "status"] as const,
	registers: [register],
});

export const insightsDeletedTotal = new Counter({
	name: "pulse_insights_deleted_total",
	help: "Total insights deleted",
	registers: [register],
});

// ─── Search ───────────────────────────────────────────────────────────────────

export const searchQueriesTotal = new Counter({
	name: "pulse_search_queries_total",
	help: "Total search queries",
	labelNames: ["type"] as const, // "fts" | "hybrid"
	registers: [register],
});

export const searchDuration = new Histogram({
	name: "pulse_search_duration_seconds",
	help: "Search query duration in seconds",
	labelNames: ["type"] as const,
	buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5],
	registers: [register],
});

// ─── LLM ──────────────────────────────────────────────────────────────────────

export const llmCallsTotal = new Counter({
	name: "pulse_llm_calls_total",
	help: "Total LLM API calls",
	labelNames: ["provider", "operation", "status"] as const, // operation: "ask" | "enrich" | "embed"
	registers: [register],
});

export const llmDuration = new Histogram({
	name: "pulse_llm_duration_seconds",
	help: "LLM call duration in seconds",
	labelNames: ["provider", "operation"] as const,
	buckets: [0.5, 1, 2.5, 5, 10, 30, 60],
	registers: [register],
});

export const embeddingsTotal = new Counter({
	name: "pulse_embeddings_generated_total",
	help: "Total embedding vectors generated",
	registers: [register],
});
