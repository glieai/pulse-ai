import type { Insight } from "@pulse/shared";
import * as vscode from "vscode";
import type { PulseApiClient } from "../api/client";
import { InsightTreeItem } from "./search-tree";

const REFRESH_INTERVAL = 60_000; // 60s

export class RecentTreeProvider implements vscode.TreeDataProvider<InsightTreeItem> {
	private _onDidChangeTreeData = new vscode.EventEmitter<InsightTreeItem | undefined>();
	readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

	private insights: Insight[] = [];
	private timer: ReturnType<typeof setInterval> | null = null;

	constructor(
		private client: PulseApiClient,
		private repo: string,
	) {
		this.startAutoRefresh();
	}

	updateClient(client: PulseApiClient, repo: string): void {
		this.client = client;
		this.repo = repo;
		this.refresh();
	}

	async refresh(): Promise<void> {
		try {
			const result = await this.client.getInsights({
				repo: this.repo || undefined,
				status: "published",
				limit: 20,
			});
			this.insights = result.insights;
		} catch {
			// Keep existing data on failure — don't wipe the list
		}
		this._onDidChangeTreeData.fire(undefined);
	}

	getTreeItem(element: InsightTreeItem): InsightTreeItem {
		return element;
	}

	getChildren(): InsightTreeItem[] {
		return this.insights.map((i) => new InsightTreeItem(i));
	}

	private startAutoRefresh(): void {
		this.timer = setInterval(() => this.refresh(), REFRESH_INTERVAL);
	}

	dispose(): void {
		if (this.timer) {
			clearInterval(this.timer);
			this.timer = null;
		}
		this._onDidChangeTreeData.dispose();
	}
}
