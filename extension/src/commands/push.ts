import { deleteDraft, listDrafts } from "@pulse/shared";
import * as vscode from "vscode";
import type { PulseApiClient } from "../api/client";
import type { PulseExtensionConfig } from "../config";
import type { DraftsTreeProvider } from "../providers/drafts-tree";
import type { RecentTreeProvider } from "../providers/recent-tree";

export function registerPushCommand(
	client: PulseApiClient,
	config: PulseExtensionConfig,
	draftsTree: DraftsTreeProvider,
	recentTree: RecentTreeProvider,
): vscode.Disposable {
	return vscode.commands.registerCommand("pulse.push", async () => {
		await vscode.window.withProgress(
			{
				location: vscode.ProgressLocation.Notification,
				title: "Pulse: Publishing drafts...",
				cancellable: false,
			},
			async () => {
				try {
					const drafts = listDrafts(config.repo);
					if (drafts.length === 0) {
						vscode.window.showInformationMessage("Pulse: No local drafts to publish.");
						return;
					}

					let published = 0;
					for (const draft of drafts) {
						try {
							const payload = { ...draft.data, status: "published" as const };
							await client.createInsight(payload);
							deleteDraft(draft.filePath);
							published++;
						} catch {
							// Continue with remaining drafts
						}
					}

					if (published > 0) {
						vscode.window.showInformationMessage(
							`Pulse: ${published} draft${published > 1 ? "s" : ""} published.`,
						);
					} else {
						vscode.window.showErrorMessage("Pulse: Failed to publish drafts.");
					}

					draftsTree.refresh();
					recentTree.refresh();
				} catch (err) {
					const msg = err instanceof Error ? err.message : "unknown";
					vscode.window.showErrorMessage(`Pulse: Publish failed — ${msg}`);
				}
			},
		);
	});
}
