import { type PulseConfig, configExists, defaults, loadConfig, saveConfig } from "../config";
import { detectCredentials } from "../credentials";
import { banner, c, error, info, success } from "../output";
import { ask, choose, closePrompt } from "../prompt";

function redact(value: string, visibleChars = 4): string {
	if (value.length <= visibleChars * 2) return "***";
	return `${value.slice(0, visibleChars)}...${value.slice(-visibleChars)}`;
}

function showConfig(config: PulseConfig): void {
	banner("Current Configuration");

	console.log(`  ${c.dim("API URL:")}  ${config.apiUrl}`);
	console.log(
		`  ${c.dim("Token:")}    ${config.token ? redact(config.token) : c.yellow("none (solo mode)")}`,
	);
	console.log(`  ${c.dim("Repo:")}     ${config.repo}`);
	console.log("");

	const llm = config.llm ?? defaults.llm;
	console.log(`  ${c.dim("LLM Provider:")} ${llm.provider}`);
	console.log(`  ${c.dim("LLM Model:")}    ${llm.model}`);
	console.log("");

	// Show detected credentials
	const report = detectCredentials();

	if (report.anthropic.source === "claude-cli") {
		console.log(
			`  ${c.dim("Anthropic:")} ${c.green("Claude Code CLI detected (uses subscription)")}`,
		);
	} else if (report.anthropic.source === "env") {
		console.log(`  ${c.dim("Anthropic:")} ${c.green("ANTHROPIC_API_KEY detected")}`);
	} else {
		console.log(`  ${c.dim("Anthropic:")} ${c.yellow("no credentials")}`);
	}

	if (report.openai.source === "codex-cli") {
		console.log(`  ${c.dim("OpenAI:")}    ${c.green("Codex CLI detected (uses subscription)")}`);
	} else if (report.openai.source === "env") {
		console.log(`  ${c.dim("OpenAI:")}    ${c.green("OPENAI_API_KEY detected")}`);
	} else {
		console.log(`  ${c.dim("OpenAI:")}    ${c.yellow("no credentials")}`);
	}

	console.log("");
	console.log(`  ${c.dim("Watcher threshold:")} ${config.watcher.sizeThresholdKb} KB file growth`);
	console.log(`  ${c.dim("Watcher interval:")}  ${config.watcher.pollInterval}ms`);
	console.log("");
}

async function configLlm(): Promise<void> {
	banner("LLM Configuration");

	const config = loadConfig();

	// Show current state
	const report = detectCredentials();
	if (report.anthropic.source === "claude-cli")
		info("Claude Code CLI: detected (uses subscription)");
	else if (report.anthropic.source === "env") info("ANTHROPIC_API_KEY: detected");
	if (report.openai.source === "codex-cli") info("Codex CLI: detected (uses subscription)");
	else if (report.openai.source === "env") info("OPENAI_API_KEY: detected");

	const currentProvider = config.llm?.provider ?? defaults.llm.provider;
	const currentModel = config.llm?.model ?? defaults.llm.model;
	info(`Current: ${currentProvider} / ${currentModel}`);
	console.log("");

	// Choose provider
	const provider = await choose("LLM Provider", [
		{ label: "Anthropic (Claude)", value: "anthropic" },
		{ label: "OpenAI (GPT)", value: "openai" },
	]);

	const defaultModel = provider === "anthropic" ? "claude-sonnet-4-5-20250929" : "gpt-4o";
	const model = await ask("Model", defaultModel);

	config.llm = { provider: provider as "anthropic" | "openai", model };
	saveConfig(config);
	success(`LLM config saved: ${provider} / ${model}`);
	closePrompt();
}

export async function configCommand(args: string[]): Promise<void> {
	if (!configExists()) {
		error("Config not found. Run `pulse init` first.");
		process.exit(1);
	}

	const sub = args[0];

	if (sub === "llm") {
		return configLlm();
	}

	// Default: show config
	const config = loadConfig();
	showConfig(config);
}
