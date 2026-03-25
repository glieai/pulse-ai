import * as vscode from "vscode";
import type { PulseCodeLensProvider } from "../providers/codelens";
import type { RecentTreeProvider } from "../providers/recent-tree";

export function registerRefreshCommand(
	recentTree: RecentTreeProvider,
	codeLensProvider: PulseCodeLensProvider,
): vscode.Disposable {
	return vscode.commands.registerCommand("pulse.refresh", () => {
		recentTree.refresh();
		codeLensProvider.invalidateAll();
		vscode.window.showInformationMessage("Pulse: Refreshed.");
	});
}
