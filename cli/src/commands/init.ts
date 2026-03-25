import { execSync } from "node:child_process";
import {
	type PulseConfig,
	configExists,
	defaults,
	getConfigPath,
	isSoloMode,
	saveConfig,
} from "../config";
import { detectCredentials } from "../credentials";
import { ApiError, apiPost } from "../http";
import { banner, c, error, info, success, warn } from "../output";
import { ask, askPassword, closePrompt, confirm } from "../prompt";
import { installGitHooks } from "../watcher/hooks";
import { setupGlobalMcp } from "./setup-mcp";

function detectGitRemote(): string | null {
	try {
		const remote = execSync("git remote get-url origin", {
			encoding: "utf-8",
		}).trim();
		const match = remote.match(/[/:]([\w.-]+\/[\w.-]+?)(?:\.git)?$/);
		return match ? (match[1].split("/").pop() ?? null) : null;
	} catch {
		return null;
	}
}

export async function initCommand(_args: string[]): Promise<void> {
	banner("Setup");

	if (configExists()) {
		const overwrite = await confirm("Config already exists. Overwrite?", false);
		if (!overwrite) {
			info("Keeping existing config.");
			closePrompt();
			return;
		}
	}

	// 1. Mode — always ask unless PULSE_MODE is explicitly set
	const solo = isSoloMode() ? true : !(await confirm("Connecting to a team server?", true));

	// 2. API URL
	const defaultUrl = solo ? "http://localhost:3000" : "https://pulse.glie.ai";
	const apiUrl = await ask("API URL", defaultUrl);

	let apiToken: string | undefined;

	if (solo) {
		info("Solo mode — no authentication required");
	} else {
		info("Paste your API token (generate at Dashboard → Account → API Tokens)");
		const token = await ask("API Token");
		if (!token || !token.startsWith("pulse_")) {
			error("Invalid token. Must start with pulse_");
			closePrompt();
			process.exit(1);
		}
		apiToken = token;
		success("Token accepted");
	}

	// 5. Detect repo (silent — don't ask, just detect)
	const repo = detectGitRemote() ?? "";

	// 6. LLM detection
	const report = detectCredentials();

	if (report.anthropic.available) {
		if (report.anthropic.source === "claude-cli") {
			success("Claude Code CLI detected — uses your subscription (zero cost)");
		} else {
			success("ANTHROPIC_API_KEY detected — Anthropic LLM ready");
		}
	}

	if (report.openai.available) {
		if (report.openai.source === "codex-cli") {
			success("Codex CLI detected — uses your subscription (zero cost)");
		} else {
			success("OPENAI_API_KEY detected — OpenAI LLM ready");
		}
	}

	if (!report.anthropic.available && !report.openai.available) {
		warn("No LLM credentials detected.");
		info(
			"Install Claude Code or Codex CLI — Pulse spawns them as subprocesses (uses your subscription).",
		);
	}

	// 7. Save config
	const config: PulseConfig = {
		apiUrl,
		token: apiToken,
		repo,
		watcher: { ...defaults.watcher },
	};

	saveConfig(config);
	success(`Config saved to ${c.dim(getConfigPath())}`);

	// 8. Install git hooks
	info("Installing git hooks...");
	if (installGitHooks()) {
		success("Git hooks installed (post-commit, pre-push)");
	} else {
		warn("Not in a git repository — skipping hook installation");
	}

	// 9. Configure MCP for Claude Code / Codex (global)
	if (apiToken) {
		info("Configuring Claude Code / Codex MCP integration...");
		if (setupGlobalMcp(apiUrl, apiToken)) {
			success("MCP server registered globally (~/.claude/.mcp.json)");
			info("  Pulse tools available in Claude Code & Codex across all repos");
		}
	}

	// Summary
	console.log("");
	console.log(`  ${c.bold("Setup complete!")}`);
	console.log(`  ${c.dim("API:")} ${apiUrl}`);
	console.log(`  ${c.dim("Repo:")} ${repo}`);
	console.log(`  ${c.dim("LLM:")} auto-detect (Claude Code / Codex / API key)`);
	if (solo) {
		console.log(`  ${c.dim("Mode:")} solo (no auth)`);
	} else {
		console.log(`  ${c.dim("Token:")} ${apiToken?.slice(0, 12)}...`);
	}
	console.log("");
	console.log(`  ${c.dim("Next:")} pulse search "your query"`);
	console.log("");

	closePrompt();
}
