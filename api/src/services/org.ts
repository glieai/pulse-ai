import { exec, execSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import type {
	AiFeatures,
	CliProviderType,
	CliToolsStatus,
	LlmProvider,
	LlmProviderConfig,
	LlmProviderStatus,
	LlmStatus,
	OrgLlmSettings,
	OrgSettings,
} from "@pulse/shared";
import { sql } from "../db/client";
import { env } from "../env";
import { decryptIfNeeded, encrypt, isEncrypted } from "../utils/encryption";

// ─── Backwards Compatibility ────────────────────

/** Old flat format before multi-provider migration */
interface LegacyLlmSettings {
	provider: LlmProvider;
	api_key: string;
	model?: string;
}

function isLegacyFormat(llm: unknown): llm is LegacyLlmSettings {
	return (
		llm !== null &&
		typeof llm === "object" &&
		"provider" in (llm as Record<string, unknown>) &&
		"api_key" in (llm as Record<string, unknown>) &&
		!("providers" in (llm as Record<string, unknown>))
	);
}

/** Convert old { provider, api_key, model } → new { providers, active_provider } */
export function normalizeLlmSettings(llm: unknown): OrgLlmSettings | undefined {
	if (!llm) return undefined;

	if (isLegacyFormat(llm)) {
		return {
			providers: {
				[llm.provider]: { api_key: llm.api_key, model: llm.model },
			} as Partial<Record<LlmProvider, LlmProviderConfig>>,
			active_provider: llm.provider,
		};
	}

	const settings = llm as OrgLlmSettings;
	if (settings.providers && settings.active_provider) {
		return settings;
	}

	return undefined;
}

// ─── Read Settings ──────────────────────────────

export async function getOrgSettings(orgId: string): Promise<OrgSettings> {
	const [row] = await sql`SELECT settings FROM orgs WHERE id = ${orgId}`;
	const raw = (row?.settings ?? {}) as Record<string, unknown>;
	return {
		llm: normalizeLlmSettings(raw.llm),
		ai_features: raw.ai_features as AiFeatures | undefined,
		cli_provider: raw.cli_provider as CliProviderType | undefined,
	};
}

// ─── CLI Tools Detection (Solo Mode) ────────────

/** Common paths where global npm/bun binaries may live */
export function getExtraBinPaths(): string[] {
	const home = homedir();
	const paths = [
		join(home, ".local", "bin"),
		join(home, ".npm-global", "bin"),
		join(home, ".bun", "bin"),
		"/usr/local/bin",
	];

	// Add nvm node bin paths (nvm installs global packages per node version)
	try {
		const nvmDir = join(home, ".nvm", "versions", "node");
		if (existsSync(nvmDir)) {
			for (const ver of readdirSync(nvmDir)) {
				paths.push(join(nvmDir, ver, "bin"));
			}
		}
	} catch {
		// nvm not installed — skip
	}

	return paths;
}

function whichExists(name: string): boolean {
	// 1. Try `which` with an expanded PATH (shell + common bin dirs)
	try {
		const extraPath = getExtraBinPaths().join(":");
		const fullPath = `${extraPath}:${process.env.PATH ?? ""}`;
		execSync(`which ${name}`, {
			encoding: "utf-8",
			timeout: 2000,
			env: { ...process.env, PATH: fullPath },
		});
		return true;
	} catch {
		// which failed — fall through to direct path check
	}

	// 2. Direct path check for known locations
	return getExtraBinPaths().some((dir) => existsSync(join(dir, name)));
}

function detectCliTools(): CliToolsStatus {
	return {
		claude_cli: whichExists("claude"),
		codex_cli: whichExists("codex"),
	};
}

// ─── CLI Tools Install (Solo Mode) ──────────────

const execAsync = promisify(exec);

const CLI_PACKAGES: Record<string, string> = {
	claude: "@anthropic-ai/claude-code",
	codex: "@openai/codex",
};

export async function installCliTool(
	tool: "claude" | "codex",
): Promise<{ success: boolean; message: string }> {
	if (env.PULSE_MODE !== "solo") {
		return { success: false, message: "CLI tool install is only available in Solo Mode." };
	}

	const pkg = CLI_PACKAGES[tool];
	if (!pkg) {
		return { success: false, message: `Unknown tool: ${tool}` };
	}

	try {
		// Source nvm if available so we use the user's npm (avoids EACCES on /usr/local/lib)
		const nvmSh = join(homedir(), ".nvm", "nvm.sh");
		const nvmInit = existsSync(nvmSh) ? `source "${nvmSh}" && ` : "";
		const cmd = `bash -c '${nvmInit}npm install -g ${pkg}'`;

		const { stdout, stderr } = await execAsync(cmd, {
			timeout: 120_000,
			env: { ...process.env, PATH: `${getExtraBinPaths().join(":")}:${process.env.PATH ?? ""}` },
		});
		const output = (stdout || stderr || "").trim();

		// Verify installation
		const detected = whichExists(tool);
		if (detected) {
			return { success: true, message: `${pkg} installed successfully.` };
		}
		return { success: false, message: output || "Install completed but binary not found." };
	} catch (err) {
		const msg =
			err instanceof Error ? (err as { stderr?: string }).stderr || err.message : "Unknown error";
		return { success: false, message: String(msg).trim() };
	}
}

// ─── LLM Resolution ────────────────────────────

/** Resolve the active LLM config across all sources.
 *  Priority: PULSE_LLM_* env → org settings → ANTHROPIC/OPENAI_API_KEY env */
export async function resolveActiveLlm(
	orgId: string,
): Promise<{ provider: LlmProvider; api_key: string; model?: string } | null> {
	// 1. PULSE_LLM_* env vars (explicit override)
	if (env.PULSE_LLM_PROVIDER && env.PULSE_LLM_API_KEY) {
		return {
			provider: env.PULSE_LLM_PROVIDER,
			api_key: env.PULSE_LLM_API_KEY,
			model: env.PULSE_LLM_MODEL,
		};
	}

	// 2. Org settings from DB
	const settings = await getOrgSettings(orgId);
	if (settings.llm) {
		const active = settings.llm.active_provider;
		const config = settings.llm.providers[active];
		if (config?.api_key) {
			// Decrypt if stored encrypted (backward-compat: plaintext keys still work)
			const apiKey = decryptIfNeeded(config.api_key);
			return { provider: active, api_key: apiKey, model: config.model };
		}
	}

	// 3. Standard env vars (auto-detect)
	if (env.ANTHROPIC_API_KEY) {
		return { provider: "anthropic", api_key: env.ANTHROPIC_API_KEY };
	}
	if (env.OPENAI_API_KEY) {
		return { provider: "openai", api_key: env.OPENAI_API_KEY };
	}

	return null;
}

// ─── LLM Status (for settings UI) ──────────────

function providerStatus(
	provider: LlmProvider,
	orgLlm: OrgLlmSettings | undefined,
): LlmProviderStatus {
	// PULSE_LLM_* takes priority
	if (env.PULSE_LLM_PROVIDER === provider && env.PULSE_LLM_API_KEY) {
		return { available: true, source: "pulse_env", model: env.PULSE_LLM_MODEL };
	}

	// Org settings
	const config = orgLlm?.providers[provider];
	if (config?.api_key) {
		// Decrypt before redacting for display
		const plainKey = decryptIfNeeded(config.api_key);
		return {
			available: true,
			source: "org_settings",
			api_key: redactApiKey(plainKey),
			model: config.model,
		};
	}

	// Standard env vars
	const envKey = provider === "anthropic" ? env.ANTHROPIC_API_KEY : env.OPENAI_API_KEY;
	if (envKey) {
		return { available: true, source: "env" };
	}

	return { available: false, source: null };
}

function resolveActiveProvider(orgLlm: OrgLlmSettings | undefined): LlmProvider | null {
	if (env.PULSE_LLM_PROVIDER && env.PULSE_LLM_API_KEY) {
		return env.PULSE_LLM_PROVIDER;
	}
	if (orgLlm) {
		const config = orgLlm.providers[orgLlm.active_provider];
		if (config?.api_key) return orgLlm.active_provider;
	}
	if (env.ANTHROPIC_API_KEY) return "anthropic";
	if (env.OPENAI_API_KEY) return "openai";
	return null;
}

export function buildLlmStatus(
	orgLlm: OrgLlmSettings | undefined,
	options?: { cli_provider?: CliProviderType },
): LlmStatus {
	return {
		anthropic: providerStatus("anthropic", orgLlm),
		openai: providerStatus("openai", orgLlm),
		active_provider: resolveActiveProvider(orgLlm),
		cli_tools: detectCliTools(),
		cli_provider: options?.cli_provider,
	};
}

// ─── CRUD: Provider Configs ─────────────────────

export async function upsertProviderConfig(
	orgId: string,
	provider: LlmProvider,
	config: { api_key?: string; model?: string },
): Promise<OrgSettings> {
	const settings = await getOrgSettings(orgId);
	const llm: OrgLlmSettings = settings.llm ?? {
		providers: {},
		active_provider: provider,
	};

	const existing = llm.providers[provider];

	// Encrypt new api_key before storing. If no new key provided, keep existing (already encrypted).
	let storedKey = existing?.api_key ?? "";
	if (config.api_key) {
		// Encrypt only if it's a new plaintext key (not already encrypted)
		storedKey = isEncrypted(config.api_key) ? config.api_key : encrypt(config.api_key);
	}

	llm.providers[provider] = {
		api_key: storedKey,
		model: config.model ?? existing?.model,
	};

	// First provider with a key becomes active
	if (!llm.providers[llm.active_provider]?.api_key) {
		llm.active_provider = provider;
	}

	const patch = sql.json({ llm } as never);
	const [row] = await sql`
		UPDATE orgs
		SET settings = COALESCE(settings, '{}'::jsonb) || ${patch}
		WHERE id = ${orgId}
		RETURNING settings
	`;
	return normalizeDbSettings(row.settings);
}

export async function removeProviderConfig(
	orgId: string,
	provider: LlmProvider,
): Promise<OrgSettings> {
	const settings = await getOrgSettings(orgId);
	if (!settings.llm) return settings;

	const llm: OrgLlmSettings = {
		...settings.llm,
		providers: { ...settings.llm.providers },
	};
	delete llm.providers[provider];

	// Switch active to remaining provider
	if (llm.active_provider === provider) {
		const remaining = Object.keys(llm.providers) as LlmProvider[];
		llm.active_provider = remaining[0] ?? "anthropic";
	}

	const patch = sql.json({ llm } as never);
	const [row] = await sql`
		UPDATE orgs
		SET settings = COALESCE(settings, '{}'::jsonb) || ${patch}
		WHERE id = ${orgId}
		RETURNING settings
	`;
	return normalizeDbSettings(row.settings);
}

export async function setActiveProvider(
	orgId: string,
	activeProvider: LlmProvider,
): Promise<OrgSettings> {
	const settings = await getOrgSettings(orgId);
	const llm: OrgLlmSettings = settings.llm ?? {
		providers: {},
		active_provider: activeProvider,
	};
	llm.active_provider = activeProvider;

	const patch = sql.json({ llm } as never);
	const [row] = await sql`
		UPDATE orgs
		SET settings = COALESCE(settings, '{}'::jsonb) || ${patch}
		WHERE id = ${orgId}
		RETURNING settings
	`;
	return normalizeDbSettings(row.settings);
}

// ─── AI Features ────────────────────────────────

export async function updateAiFeatures(
	orgId: string,
	aiFeatures: AiFeatures,
): Promise<OrgSettings> {
	const patch = sql.json({ ai_features: aiFeatures } as never);
	const [row] = await sql`
		UPDATE orgs
		SET settings = COALESCE(settings, '{}'::jsonb) || ${patch}
		WHERE id = ${orgId}
		RETURNING settings
	`;
	return normalizeDbSettings(row.settings);
}

// ─── CLI Provider Preference ────────────────────

export async function updateCliProvider(
	orgId: string,
	cliProvider: CliProviderType,
): Promise<OrgSettings> {
	const patch = sql.json({ cli_provider: cliProvider } as never);
	const [row] = await sql`
		UPDATE orgs
		SET settings = COALESCE(settings, '{}'::jsonb) || ${patch}
		WHERE id = ${orgId}
		RETURNING settings
	`;
	return normalizeDbSettings(row.settings);
}

// ─── Redaction ──────────────────────────────────

export function redactApiKey(key: string): string {
	if (key.length <= 12) return "***";
	return `${key.slice(0, 7)}...${key.slice(-4)}`;
}

export function redactOrgSettings(settings: OrgSettings): OrgSettings {
	if (!settings.llm?.providers) return settings;

	const redactedProviders: Partial<Record<LlmProvider, LlmProviderConfig>> = {};
	for (const [provider, config] of Object.entries(settings.llm.providers)) {
		if (config) {
			redactedProviders[provider as LlmProvider] = {
				...config,
				api_key: redactApiKey(config.api_key),
			};
		}
	}

	return {
		...settings,
		llm: { ...settings.llm, providers: redactedProviders },
	};
}

// ─── Internal ───────────────────────────────────

function normalizeDbSettings(raw: unknown): OrgSettings {
	const s = raw as Record<string, unknown>;
	return {
		llm: normalizeLlmSettings(s.llm),
		ai_features: s.ai_features as AiFeatures | undefined,
		cli_provider: s.cli_provider as CliProviderType | undefined,
	};
}
