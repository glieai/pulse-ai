import * as vscode from "vscode";

export function registerConfigureCommand(): vscode.Disposable {
	return vscode.commands.registerCommand("pulse.configure", async () => {
		const choice = await vscode.window.showQuickPick(
			[
				{
					label: "$(gear) Open Settings",
					description: "API URL, token, repo, LLM, watcher",
					action: "settings" as const,
				},
				{
					label: "$(server) Check API Connection",
					description: "Verify the Pulse API is reachable",
					action: "check" as const,
				},
				{
					label: "$(organization) Team Mode",
					description: "Coming soon — OAuth to Pulse Cloud",
					action: "team" as const,
				},
			],
			{ placeHolder: "Pulse Configuration" },
		);

		if (!choice) return;

		if (choice.action === "settings") {
			await vscode.commands.executeCommand("workbench.action.openSettings", "pulse");
		} else if (choice.action === "check") {
			const { getClient } = await import("../extension");
			const apiClient = getClient();
			if (!apiClient) {
				vscode.window.showWarningMessage("Pulse: No API client.");
				return;
			}
			const ok = await apiClient.ping();
			if (ok) {
				vscode.window.showInformationMessage("Pulse: API connection OK.");
			} else {
				vscode.window.showWarningMessage(
					"Pulse: Cannot reach API. Make sure the server is running.",
				);
			}
		} else {
			vscode.window.showInformationMessage(
				"Pulse: Team mode with OAuth is coming soon. Solo mode works out of the box.",
			);
		}
	});
}
