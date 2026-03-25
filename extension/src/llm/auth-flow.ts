/**
 * Guided LLM setup flow — triggered when no credentials are found.
 *
 * Detects installed CLI tools (claude, codex), asks the user how they
 * want to authenticate, and guides them through setup.
 *
 * Returns true if credentials were configured (caller should retry).
 */

import { isClaudeCliAvailable, isCodexCliAvailable } from "@pulse/cli/llm/subprocess";
import * as vscode from "vscode";

interface SetupOption extends vscode.QuickPickItem {
	action:
		| "signin-claude"
		| "signin-codex"
		| "anthropic-key"
		| "openai-key"
		| "install-claude"
		| "install-codex";
}

/**
 * Show a QuickPick guiding the user through LLM setup.
 * Returns true if credentials were saved (caller should retry the generation).
 */
export async function promptLlmSetup(): Promise<boolean> {
	const claudeInstalled = isClaudeCliAvailable();
	const codexInstalled = isCodexCliAvailable();
	const claudeExtension = vscode.extensions.getExtension("anthropic.claude-code") !== undefined;

	const options: SetupOption[] = [];

	// Prioritize tools that are already installed
	if (claudeInstalled || claudeExtension) {
		options.push({
			label: "$(terminal) Use Claude Code CLI",
			description: "Uses your Claude subscription — zero extra cost",
			action: "signin-claude",
		});
	}

	if (codexInstalled) {
		options.push({
			label: "$(terminal) Use Codex CLI",
			description: "Uses your OpenAI subscription — zero extra cost",
			action: "signin-codex",
		});
	}

	// API key entry
	options.push({
		label: "$(key) Enter Anthropic API key",
		description: "Paste your sk-ant-... key",
		action: "anthropic-key",
	});

	options.push({
		label: "$(key) Enter OpenAI API key",
		description: "Paste your sk-... key",
		action: "openai-key",
	});

	// Install tools (if not detected)
	if (!claudeInstalled && !claudeExtension) {
		options.push({
			label: "$(cloud-download) Install Claude Code",
			description: "npm install -g @anthropic-ai/claude-code",
			action: "install-claude",
		});
	}

	if (!codexInstalled) {
		options.push({
			label: "$(cloud-download) Install Codex",
			description: "npm install -g @openai/codex",
			action: "install-codex",
		});
	}

	const choice = await vscode.window.showQuickPick(options, {
		title: "Pulse — LLM Setup",
		placeHolder: "Choose how to provide LLM access",
	});

	if (!choice) return false;

	switch (choice.action) {
		case "signin-claude": {
			if (claudeExtension) {
				await vscode.commands.executeCommand("claude-code.focus");
			} else {
				vscode.window.showInformationMessage(
					"Run 'claude' in your terminal — it will prompt you to sign in. Then retry.",
				);
			}
			return false; // User needs to sign in first, then retry
		}

		case "signin-codex": {
			vscode.window.showInformationMessage(
				"Run 'codex' in your terminal — it will prompt you to sign in. Then retry.",
			);
			return false;
		}

		case "anthropic-key": {
			return await promptApiKey("anthropic", "Anthropic API Key", "sk-ant-");
		}

		case "openai-key": {
			return await promptApiKey("openai", "OpenAI API Key", "sk-");
		}

		case "install-claude": {
			const terminal = vscode.window.createTerminal("Install Claude Code");
			terminal.show();
			terminal.sendText("npm install -g @anthropic-ai/claude-code");
			vscode.window.showInformationMessage(
				"Installing Claude Code... After install, run 'claude' to sign in, then retry Pulse.",
			);
			return false;
		}

		case "install-codex": {
			const terminal = vscode.window.createTerminal("Install Codex");
			terminal.show();
			terminal.sendText("npm install -g @openai/codex");
			vscode.window.showInformationMessage(
				"Installing Codex... After install, run 'codex' to sign in, then retry Pulse.",
			);
			return false;
		}
	}

	return false;
}

async function promptApiKey(
	provider: "anthropic" | "openai",
	title: string,
	prefix: string,
): Promise<boolean> {
	const key = await vscode.window.showInputBox({
		title,
		prompt: `Paste your API key (starts with ${prefix})`,
		password: true,
		validateInput: (v) => {
			if (!v.trim()) return "API key is required";
			if (!v.startsWith(prefix)) return `Key should start with ${prefix}`;
			return null;
		},
	});

	if (!key) return false;

	const config = vscode.workspace.getConfiguration("pulse");
	await config.update("llmApiKey", key.trim(), vscode.ConfigurationTarget.Global);
	await config.update("llmProvider", provider, vscode.ConfigurationTarget.Global);

	vscode.window.showInformationMessage(`Pulse: ${title} saved. Retrying...`);
	return true;
}
