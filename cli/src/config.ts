import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

// Re-export credential resolution (canonical source: credentials.ts)
export {
	type CredentialReport,
	getAnthropicKey,
	getOpenAIKey,
	detectCredentials,
} from "./credentials";

export interface LlmConfig {
	provider: "claude-cli" | "codex-cli" | "anthropic" | "openai";
	model: string;
}

export interface WatcherConfig {
	sizeThresholdKb: number;
	pollInterval: number;
}

export interface PulseConfig {
	apiUrl: string;
	token?: string;
	repo: string;
	llm?: LlmConfig;
	watcher: WatcherConfig;
}

export function isSoloMode(): boolean {
	return process.env.PULSE_MODE === "solo";
}

const CONFIG_DIR = join(homedir(), ".pulse");
const CONFIG_PATH = join(CONFIG_DIR, "config.json");

export const defaults = {
	apiUrl: "http://localhost:3000",
	llm: {
		provider: "anthropic" as const,
		model: "claude-sonnet-4-5-20250929",
	},
	watcher: {
		sizeThresholdKb: 256,
		pollInterval: 5000,
	},
};

export function configExists(): boolean {
	return existsSync(CONFIG_PATH);
}

export function loadConfig(): PulseConfig {
	if (!existsSync(CONFIG_PATH)) {
		throw new Error("Config not found. Run `pulse init` first.");
	}

	const raw = readFileSync(CONFIG_PATH, "utf-8");
	const parsed = JSON.parse(raw);

	// Validate required fields (repo and token optional)
	if (!parsed.apiUrl) {
		throw new Error("Config is incomplete (missing apiUrl). Run `pulse init` to reconfigure.");
	}

	const config = parsed as PulseConfig;

	// Apply defaults for optional sections
	config.watcher ??= { ...defaults.watcher };
	config.watcher.sizeThresholdKb ??= defaults.watcher.sizeThresholdKb;
	config.watcher.pollInterval ??= defaults.watcher.pollInterval;

	// Env overrides
	if (process.env.PULSE_API_URL) {
		config.apiUrl = process.env.PULSE_API_URL;
	}
	if (process.env.PULSE_TOKEN) {
		config.token = process.env.PULSE_TOKEN;
	}

	return config;
}

export function saveConfig(config: PulseConfig): void {
	if (!existsSync(CONFIG_DIR)) {
		mkdirSync(CONFIG_DIR, { recursive: true });
	}
	writeFileSync(CONFIG_PATH, JSON.stringify(config, null, "\t"), "utf-8");
}

export function getConfigPath(): string {
	return CONFIG_PATH;
}
