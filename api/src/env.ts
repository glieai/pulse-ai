import { z } from "zod";

const envSchema = z.object({
	DATABASE_URL: z.string().url("DATABASE_URL must be a valid connection string"),
	API_PORT: z.coerce.number().default(3000),
	API_HOST: z.string().default("0.0.0.0"),
	JWT_SECRET: z.string().min(8, "JWT_SECRET must be at least 8 characters"),
	NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
	PULSE_MODE: z.enum(["solo", "team"]).default("solo"),
	// Encryption key for sensitive data at rest (LLM API keys, OAuth secrets)
	// Must be 32 bytes (or will be hashed to 32). Required in production.
	ENCRYPTION_KEY: z.string().optional(),
	// Comma-separated list of allowed CORS origins
	// Example: "https://pulse.example.com,https://app.example.com"
	CORS_ORIGINS: z.string().default("http://localhost:5173"),
	// Set to "true" to disable rate limiting (tests / local dev only)
	DISABLE_RATE_LIMIT: z.string().optional(),
	// LLM provider config
	PULSE_LLM_PROVIDER: z.enum(["anthropic", "openai"]).optional(),
	PULSE_LLM_API_KEY: z.string().min(1).optional(),
	PULSE_LLM_MODEL: z.string().optional(),
	ANTHROPIC_API_KEY: z.string().min(1).optional(),
	OPENAI_API_KEY: z.string().min(1).optional(),
	// Email (SMTP — Google Workspace relay or similar)
	SMTP_HOST: z.string().default("smtp-relay.gmail.com"),
	SMTP_PORT: z.coerce.number().default(587),
	SMTP_HELO: z.string().default("pulse.glie.ai"),
	EMAIL_FROM: z.string().email().default("noreply@pulse.local"),
	FRONTEND_URL: z.string().url().default("http://localhost:5173"),
	// Google OAuth (optional — enables "Sign in with Google")
	GOOGLE_CLIENT_ID: z.string().optional(),
	GOOGLE_CLIENT_SECRET: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
	const result = envSchema.safeParse(process.env);

	if (!result.success) {
		console.error("Invalid environment variables:");
		for (const issue of result.error.issues) {
			console.error(`  ${issue.path.join(".")}: ${issue.message}`);
		}
		process.exit(1);
	}

	const env = result.data;

	// Production guards — fail fast before serving any traffic
	if (env.NODE_ENV === "production") {
		if (!env.ENCRYPTION_KEY) {
			console.error("FATAL: ENCRYPTION_KEY is required in production.");
			console.error(
				"  Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('base64'))\"",
			);
			process.exit(1);
		}
		if (env.JWT_SECRET.length < 32) {
			console.error("FATAL: JWT_SECRET must be at least 32 characters in production.");
			process.exit(1);
		}
		if (env.PULSE_MODE === "solo") {
			console.warn("WARNING: Running in SOLO mode in production — no authentication enforced.");
		}
	}

	return env;
}

export const env = loadEnv();
