import type { Context, Hono, Next } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";
import { env } from "../env";
import { errorHandler } from "./error-handler";
import { metricsMiddleware } from "./metrics";

// ─── Rate Limiter ────────────────────────────────────────────────────────────
// In-memory fixed-window rate limiter. Sufficient for single-instance deployments.
// For multi-instance setups, replace with a Redis-backed implementation.

interface RateLimitEntry {
	count: number;
	resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Purge expired entries every 10 minutes to prevent unbounded memory growth
setInterval(
	() => {
		const now = Date.now();
		for (const [key, entry] of rateLimitStore) {
			if (entry.resetAt < now) rateLimitStore.delete(key);
		}
	},
	10 * 60 * 1000,
).unref(); // unref so this timer doesn't block graceful shutdown

function getClientIp(c: Context): string {
	return (
		c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ?? c.req.header("x-real-ip") ?? "unknown"
	);
}

function createRateLimiter(limit: number, windowMs: number) {
	return async (c: Context, next: Next) => {
		// Skip in test mode and when DISABLE_RATE_LIMIT=true (for development)
		if (
			env.NODE_ENV === "test" ||
			(env.DISABLE_RATE_LIMIT === "true" && env.NODE_ENV !== "production")
		) {
			return next();
		}

		const ip = getClientIp(c);
		const key = `${c.req.path}:${ip}`;
		const now = Date.now();

		const entry = rateLimitStore.get(key);
		if (!entry || entry.resetAt < now) {
			rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
			return next();
		}

		entry.count++;
		if (entry.count > limit) {
			return c.json({ error: "Too many requests, please try again later." }, 429);
		}

		return next();
	};
}

// General API rate limiter: 1000 requests per 15 minutes per IP
// (VS Code extension polls every 30s × multiple windows = high baseline)
export const generalRateLimit = createRateLimiter(1000, 15 * 60 * 1000);

// Auth rate limiter: 20 requests per 15 minutes per IP (brute-force protection)
export const authRateLimit = createRateLimiter(20, 15 * 60 * 1000);

// ─── CORS ────────────────────────────────────────────────────────────────────

const allowedOrigins = env.CORS_ORIGINS.split(",")
	.map((o) => o.trim())
	.filter(Boolean);

// ─── Apply All Middleware ────────────────────────────────────────────────────

export function applyMiddleware(app: Hono): void {
	// Security headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy, etc.)
	app.use("*", secureHeaders());

	// CORS with dynamic origin matching (required for credentials: true)
	app.use(
		"*",
		cors({
			origin: (origin) => {
				if (!origin) return origin; // allow non-browser clients (CLI, curl, MCP)
				return allowedOrigins.includes(origin) ? origin : "";
			},
			credentials: true,
			allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
			allowHeaders: ["Content-Type", "Authorization"],
		}),
	);

	app.use("*", requestId());
	app.use("*", logger());

	// Prometheus metrics (before rate limiting to count 429s too)
	if (env.NODE_ENV !== "test") {
		app.use("*", metricsMiddleware);
	}

	// General rate limiting (applied after CORS so OPTIONS preflight is not counted)
	app.use("*", generalRateLimit);

	app.onError(errorHandler);
}
