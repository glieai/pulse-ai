import { randomBytes } from "node:crypto";
import type { Insight } from "@pulse/shared";
import * as vscode from "vscode";
import { renderInsightHtml } from "./detail-html";

let currentPanel: vscode.WebviewPanel | null = null;

function getNonce(): string {
	return randomBytes(16).toString("hex");
}

/** Show insight detail in a webview panel (singleton — reuses existing panel). */
export function showInsightDetail(insight: Insight): void {
	const nonce = getNonce();
	const html = renderInsightHtml({ insight, nonce });

	if (currentPanel) {
		currentPanel.title = insight.title;
		currentPanel.webview.html = html;
		currentPanel.reveal(vscode.ViewColumn.Beside, true);
		return;
	}

	currentPanel = vscode.window.createWebviewPanel("pulse.insightDetail", insight.title, {
		viewColumn: vscode.ViewColumn.Beside,
		preserveFocus: true,
	});

	currentPanel.webview.html = html;
	currentPanel.onDidDispose(() => {
		currentPanel = null;
	});
}
