/**
 * Guided LLM setup flow for the CLI — triggered when no credentials are found.
 *
 * Detects installed tools (Claude Code, Codex), offers interactive choices,
 * and configures credentials so the caller can retry.
 *
 * Returns true if credentials were configured (caller should retry).
 */

import { c, info, warn } from "../output";
import { ask, choose } from "../prompt";
import { isClaudeCliAvailable, isCodexCliAvailable } from "./subprocess";

export async function promptLlmSetupCli(): Promise<boolean> {
	const claudeInstalled = isClaudeCliAvailable();
	const codexInstalled = isCodexCliAvailable();

	console.log("");
	warn("No LLM credentials found.");
	console.log("");

	const options: { label: string; value: string }[] = [];

	if (claudeInstalled) {
		options.push({
			label: "Use Claude Code CLI (uses your subscription)",
			value: "signin-claude",
		});
	}
	if (codexInstalled) {
		options.push({ label: "Use Codex CLI (uses your subscription)", value: "signin-codex" });
	}
	options.push({ label: "Enter Anthropic API key", value: "anthropic-key" });
	options.push({ label: "Enter OpenAI API key", value: "openai-key" });
	if (!claudeInstalled) {
		options.push({ label: "Install Claude Code (recommended)", value: "install-claude" });
	}
	if (!codexInstalled) {
		options.push({ label: "Install Codex", value: "install-codex" });
	}

	const choice = await choose("How do you want to provide LLM access?", options);

	switch (choice) {
		case "signin-claude": {
			console.log("");
			info(`Run ${c.bold("claude")} in your terminal — it will prompt you to sign in.`);
			info("After signing in, run this command again.");
			return false;
		}

		case "signin-codex": {
			console.log("");
			info(`Run ${c.bold("codex")} in your terminal — it will prompt you to sign in.`);
			info("After signing in, run this command again.");
			return false;
		}

		case "anthropic-key": {
			const key = await ask("Anthropic API key");
			if (!key || !key.startsWith("sk-ant-")) {
				warn("Invalid key — must start with sk-ant-");
				return false;
			}
			process.env.ANTHROPIC_API_KEY = key;
			console.log("");
			info("API key set for this session.");
			info(`To persist: ${c.dim("export ANTHROPIC_API_KEY=sk-ant-...")} in your shell profile.`);
			return true;
		}

		case "openai-key": {
			const key = await ask("OpenAI API key");
			if (!key || !key.startsWith("sk-")) {
				warn("Invalid key — must start with sk-");
				return false;
			}
			process.env.OPENAI_API_KEY = key;
			console.log("");
			info("API key set for this session.");
			info(`To persist: ${c.dim("export OPENAI_API_KEY=sk-...")} in your shell profile.`);
			return true;
		}

		case "install-claude": {
			console.log("");
			info("Install Claude Code:");
			console.log(`  ${c.cyan("https://docs.anthropic.com/en/docs/claude-code/overview")}`);
			console.log("");
			info("After installing and signing in, run this command again.");
			return false;
		}

		case "install-codex": {
			console.log("");
			info("Install Codex:");
			console.log(`  ${c.cyan("https://openai.com/index/introducing-codex/")}`);
			console.log("");
			info("After installing and signing in, run this command again.");
			return false;
		}

		default:
			return false;
	}
}
