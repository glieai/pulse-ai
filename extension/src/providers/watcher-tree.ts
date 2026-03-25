import * as vscode from "vscode";

export interface WatcherStatus {
	running: boolean;
	sessions?: Array<{ sessionId: string; title: string; growthBytes: number }>;
	thresholdKb?: number;
	generating?: boolean;
	commitHash?: string;
}

class StatusItem extends vscode.TreeItem {
	constructor(label: string, description: string, iconId: string) {
		super(label, vscode.TreeItemCollapsibleState.None);
		this.description = description;
		this.iconPath = new vscode.ThemeIcon(iconId);
	}
}

/**
 * Tree data provider for the Watcher sidebar panel.
 * Shows all tracked sessions with individual growth + combined progress.
 */
export class WatcherTreeProvider implements vscode.TreeDataProvider<StatusItem>, vscode.Disposable {
	private _onDidChange = new vscode.EventEmitter<StatusItem | undefined>();
	readonly onDidChangeTreeData = this._onDidChange.event;

	private status: WatcherStatus = { running: false };

	update(status: WatcherStatus): void {
		this.status = status;
		this._onDidChange.fire(undefined);
	}

	getTreeItem(el: StatusItem): vscode.TreeItem {
		return el;
	}

	getChildren(): StatusItem[] {
		if (!this.status.running) return [];

		const { sessions = [], thresholdKb = 256, generating, commitHash } = this.status;
		const items: StatusItem[] = [];

		// Git tracking
		const gitIcon = generating ? "loading~spin" : "git-commit";
		items.push(
			new StatusItem("Git", commitHash ? `HEAD ${commitHash.slice(0, 8)}` : "watching", gitIcon),
		);

		// Session tracking
		for (const s of sessions) {
			const kb = Math.round(s.growthBytes / 1024);
			const pct = Math.min(100, Math.round((kb / thresholdKb) * 100));
			const icon = generating ? "loading~spin" : "terminal";
			items.push(
				new StatusItem(`${s.sessionId} — ${s.title}`, `${kb} / ${thresholdKb} KB  ${pct}%`, icon),
			);
		}

		return items;
	}

	dispose(): void {
		this._onDidChange.dispose();
	}
}
