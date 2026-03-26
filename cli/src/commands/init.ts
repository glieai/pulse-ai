import { execSync } from "node:child_process";
import { type PulseConfig, configExists, defaults, isSoloMode, saveConfig } from "../config";
import { banner, c, error, info, success } from "../output";
import { ask, closePrompt, confirm } from "../prompt";
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

	// 5. Detect repo silently
	const repo = detectGitRemote() ?? "";

	// 6. Save config
	const config: PulseConfig = {
		apiUrl,
		token: apiToken,
		repo,
		watcher: { ...defaults.watcher },
	};

	saveConfig(config);
	success("Config saved");

	// 7. Install git hooks (only if in a git repo, silent otherwise)
	if (detectGitRemote()) {
		if (installGitHooks()) {
			success("Git hooks installed");
		}
	}

	// 8. Configure MCP for Claude Code / Codex (global)
	if (setupGlobalMcp(apiUrl, apiToken ?? "")) {
		success("MCP configured for Claude Code & Codex");
	}

	// Summary
	console.log("");
	console.log(`  ${c.bold("Setup complete!")}`);
	console.log(`  ${c.dim("API:")} ${apiUrl}`);
	if (repo) console.log(`  ${c.dim("Repo:")} ${repo}`);
	if (!solo) console.log(`  ${c.dim("Token:")} ${apiToken?.slice(0, 12)}...`);
	console.log("");
	console.log(`  ${c.dim("Next steps:")}`);
	console.log(`  ${c.dim("1.")} Open a new Claude Code session`);
	console.log(`  ${c.dim("2.")} Type /mcp to verify "pulse: Connected"`);
	console.log(`  ${c.dim("3.")} Ask your AI to search: pulse_search "your query"`);
	console.log("");

	closePrompt();
}
