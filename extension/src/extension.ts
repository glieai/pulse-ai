// Pulse AI — VS Code extension
import { deleteDraft } from "@pulse/shared";
import type { LocalDraft } from "@pulse/shared";
import * as vscode from "vscode";
import { PulseApiClient } from "./api/client";
import { registerConfigureCommand } from "./commands/configure";
import { registerInsightCommand } from "./commands/insight";
import { registerOpenInsightCommand } from "./commands/open-insight";
import { registerPushCommand } from "./commands/push";
import { registerRefreshCommand } from "./commands/refresh";
import { registerSearchCommand } from "./commands/search";
import { detectRepoFromGit, isConfigured, onConfigChange, resolveConfig } from "./config";
import { registerModelChangeListener } from "./llm/vscode-lm";
import { PulseCodeLensProvider } from "./providers/codelens";
import { DraftsTreeProvider } from "./providers/drafts-tree";
import { RecentTreeProvider } from "./providers/recent-tree";
import { SearchTreeProvider } from "./providers/search-tree";
import { WatcherTreeProvider } from "./providers/watcher-tree";
import { PulseWatcher } from "./watcher/watcher";

let client: PulseApiClient | null = null;
let searchTree: SearchTreeProvider | null = null;
let recentTree: RecentTreeProvider | null = null;
let draftsTree: DraftsTreeProvider | null = null;
let codeLensProvider: PulseCodeLensProvider | null = null;
let watcherTree: WatcherTreeProvider | null = null;
let watcher: PulseWatcher | null = null;
let draftsView: vscode.TreeView<unknown> | null = null;
let statusBarItem: vscode.StatusBarItem | null = null;

export function getClient(): PulseApiClient | null {
	return client;
}

export function activate(context: vscode.ExtensionContext): void {
	// Check if pulse has been configured via CLI
	if (!isConfigured()) {
		vscode.window
			.showInformationMessage(
				"Pulse: Run `npx @glie/pulse-cli init` in your terminal to get started.",
				"Open Terminal",
			)
			.then((action) => {
				if (action === "Open Terminal") {
					const terminal = vscode.window.createTerminal("Pulse Setup");
					terminal.show();
					terminal.sendText("npx @glie/pulse-cli@latest init");
				}
			});
	}

	const config = resolveConfig();

	// Auto-detect repo from git remote
	const cwd = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
	if (cwd) {
		const gitRepo = detectRepoFromGit(cwd);
		if (gitRepo) config.repo = gitRepo;
	}

	client = new PulseApiClient(config.apiUrl, config.token);

	// Tree providers
	searchTree = new SearchTreeProvider(client);
	recentTree = new RecentTreeProvider(client, config.repo);
	draftsTree = new DraftsTreeProvider(config.repo);
	watcherTree = new WatcherTreeProvider();

	context.subscriptions.push(
		vscode.window.registerTreeDataProvider("pulse.watcher", watcherTree),
		vscode.window.registerTreeDataProvider("pulse.searchResults", searchTree),
		vscode.window.registerTreeDataProvider("pulse.recentInsights", recentTree),
	);

	// Drafts use createTreeView for badge support (draft count on sidebar icon)
	draftsView = vscode.window.createTreeView("pulse.drafts", {
		treeDataProvider: draftsTree,
	});
	context.subscriptions.push(draftsView);

	// CodeLens provider
	codeLensProvider = new PulseCodeLensProvider(client, config.repo);
	context.subscriptions.push(
		vscode.languages.registerCodeLensProvider({ scheme: "file" }, codeLensProvider),
	);

	// Invalidate CodeLens on save
	context.subscriptions.push(
		vscode.workspace.onDidSaveTextDocument((doc) => {
			const relativePath = vscode.workspace.asRelativePath(doc.uri);
			codeLensProvider?.invalidate(relativePath);
		}),
	);

	// Update sidebar badge when drafts change
	context.subscriptions.push(
		draftsTree.onDidChangeTreeData(() => {
			if (!draftsView) return;
			const count = draftsTree?.draftCount ?? 0;
			draftsView.badge =
				count > 0
					? { value: count, tooltip: `${count} draft${count === 1 ? "" : "s"} to review` }
					: undefined;
		}),
	);

	// Load initial data (silently fails if API offline)
	recentTree.refresh();
	draftsTree.refresh();

	// Status bar — single unified item (local state only, no API polling)
	statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 50);
	context.subscriptions.push(statusBarItem);
	updateStatusBar(watcher);

	// LM model cache invalidation
	context.subscriptions.push(registerModelChangeListener());

	// Commands
	context.subscriptions.push(registerConfigureCommand());
	context.subscriptions.push(registerSearchCommand(searchTree));
	context.subscriptions.push(registerRefreshCommand(recentTree, codeLensProvider));

	// Delete draft command (local file)
	context.subscriptions.push(
		vscode.commands.registerCommand("pulse.deleteDraft", async (item: { draft: LocalDraft }) => {
			if (!item?.draft) return;
			const confirm = await vscode.window.showWarningMessage(
				`Delete draft "${item.draft.data.title}"?`,
				"Delete",
				"Cancel",
			);
			if (confirm !== "Delete") return;
			try {
				deleteDraft(item.draft.filePath);
				draftsTree?.refresh();
				vscode.window.showInformationMessage("Pulse: Draft deleted.");
			} catch (err) {
				const msg = err instanceof Error ? err.message : "unknown";
				vscode.window.showErrorMessage(`Pulse: Delete failed — ${msg}`);
			}
		}),
	);

	context.subscriptions.push(registerOpenInsightCommand(client));
	context.subscriptions.push(registerInsightCommand(client, config, draftsTree));
	context.subscriptions.push(registerPushCommand(client, config, draftsTree, recentTree));

	// Watcher
	watcher = new PulseWatcher(client, config, draftsTree, watcherTree, context.workspaceState);
	watcher.onDidChangeStatus(() => updateStatusBar(watcher));
	context.subscriptions.push(
		watcher,
		vscode.commands.registerCommand("pulse.watchStart", () => watcher?.start()),
		vscode.commands.registerCommand("pulse.watchStop", () => watcher?.stop()),
		vscode.commands.registerCommand("pulse.watchToggle", () => watcher?.toggle()),
	);

	// Restore watcher state — only auto-start if it was running before window close/reload
	if (context.workspaceState.get<object>("pulse.watcherState")) {
		watcher.start(true);
	}

	// React to config changes
	context.subscriptions.push(
		onConfigChange(() => {
			const newConfig = resolveConfig();
			// Git remote is primary source for repo
			const newCwd = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
			if (newCwd) {
				const gitRepo = detectRepoFromGit(newCwd);
				if (gitRepo) newConfig.repo = gitRepo;
			}
			client?.configure(newConfig.apiUrl, newConfig.token);
			if (client) {
				searchTree?.updateClient(client);
				recentTree?.updateClient(client, newConfig.repo);
				draftsTree?.updateRepo(newConfig.repo);
				codeLensProvider?.updateClient(client, newConfig.repo);
				if (watcher && draftsTree) {
					watcher.updateClient(client, newConfig, draftsTree);
				}
			}
			updateStatusBar(watcher);
		}),
	);

	// Cleanup
	context.subscriptions.push({
		dispose() {
			searchTree?.dispose();
			recentTree?.dispose();
			draftsTree?.dispose();
			codeLensProvider?.dispose();
		},
	});
}

export function deactivate(): void {
	watcher?.dispose();
	client = null;
	searchTree = null;
	recentTree = null;
	draftsTree = null;
	draftsView = null;
	codeLensProvider = null;
	watcherTree = null;
	watcher = null;
	statusBarItem = null;
}

function updateStatusBar(w: PulseWatcher | null): void {
	if (!statusBarItem) return;

	if (w?.isGenerating) {
		statusBarItem.text = "$(loading~spin) Pulse";
		statusBarItem.tooltip = "Generating insight...";
		statusBarItem.command = "pulse.watchToggle";
	} else if (w?.isActive) {
		const sessions = w.sessionCount;
		const label = sessions > 0 ? `Pulse (${sessions})` : "Pulse";
		statusBarItem.text = `$(debug-stop) ${label}`;
		statusBarItem.tooltip =
			sessions > 0
				? `Watching commits + ${sessions} session(s) — Click to stop`
				: "Watching commits — Click to stop";
		statusBarItem.command = "pulse.watchToggle";
	} else {
		statusBarItem.text = "$(play) Pulse";
		statusBarItem.tooltip = "Watcher stopped — Click to start";
		statusBarItem.command = "pulse.watchToggle";
	}
	statusBarItem.backgroundColor = undefined;
	statusBarItem.show();
}
