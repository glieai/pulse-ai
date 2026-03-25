import * as vscode from "vscode";
import type { PulseApiClient } from "../api/client";
import { showInsightDetail } from "../views/detail-panel";

export function registerOpenInsightCommand(client: PulseApiClient): vscode.Disposable {
	return vscode.commands.registerCommand("pulse.openInsight", async (insightId: string) => {
		try {
			const insight = await client.getInsight(insightId);
			showInsightDetail(insight);
		} catch (err) {
			const msg = err instanceof Error ? err.message : "unknown error";
			vscode.window.showErrorMessage(`Pulse: Could not load insight — ${msg}`);
		}
	});
}
