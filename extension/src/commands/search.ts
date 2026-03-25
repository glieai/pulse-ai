import * as vscode from "vscode";
import type { SearchTreeProvider } from "../providers/search-tree";

export function registerSearchCommand(searchTree: SearchTreeProvider): vscode.Disposable {
	return vscode.commands.registerCommand("pulse.search", async () => {
		const query = await vscode.window.showInputBox({
			prompt: "Search Pulse knowledge base",
			placeHolder: "e.g. database migration pattern",
		});

		if (!query) return;

		await searchTree.search(query);

		// Reveal the search view in the sidebar
		await vscode.commands.executeCommand("pulse.searchResults.focus");
	});
}
