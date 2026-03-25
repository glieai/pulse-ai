import type { Insight } from "@pulse/shared";
import * as vscode from "vscode";
import type { PulseApiClient } from "../api/client";
import { kindIcon, kindLabel, relativeTime, truncate } from "../utils/format";

export class InsightTreeItem extends vscode.TreeItem {
	constructor(public readonly insight: Insight) {
		super(truncate(insight.title, 60), vscode.TreeItemCollapsibleState.None);

		this.description = `${kindLabel(insight.kind)} · ${relativeTime(insight.created_at)}`;
		this.tooltip = insight.title;
		this.iconPath = kindIcon(insight.kind);
		this.command = {
			command: "pulse.openInsight",
			title: "Open Insight",
			arguments: [insight.id],
		};
	}
}

export class SearchTreeProvider implements vscode.TreeDataProvider<InsightTreeItem> {
	private _onDidChangeTreeData = new vscode.EventEmitter<InsightTreeItem | undefined>();
	readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

	private results: Insight[] = [];
	private query = "";

	constructor(private client: PulseApiClient) {}

	updateClient(client: PulseApiClient): void {
		this.client = client;
	}

	async search(query: string): Promise<void> {
		this.query = query;
		try {
			const result = await this.client.search(query);
			this.results = result.insights;
		} catch {
			this.results = [];
			vscode.window.showErrorMessage("Pulse: Search failed. Check your API connection.");
		}
		this._onDidChangeTreeData.fire(undefined);
	}

	getTreeItem(element: InsightTreeItem): InsightTreeItem {
		return element;
	}

	getChildren(): InsightTreeItem[] {
		return this.results.map((i) => new InsightTreeItem(i));
	}

	get currentQuery(): string {
		return this.query;
	}

	dispose(): void {
		this._onDidChangeTreeData.dispose();
	}
}
