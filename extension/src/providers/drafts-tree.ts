import { listDrafts } from "@pulse/shared";
import type { LocalDraft } from "@pulse/shared";
import * as vscode from "vscode";

const REFRESH_INTERVAL = 10_000; // 10s (local fs reads are fast)

type DraftTreeNode = RepoTreeItem | DraftTreeItem;

/** Collapsible repo node — groups drafts by repo. */
class RepoTreeItem extends vscode.TreeItem {
	constructor(
		public readonly repo: string,
		public readonly count: number,
	) {
		super(repo, vscode.TreeItemCollapsibleState.Expanded);
		this.description = `${count}`;
		this.iconPath = new vscode.ThemeIcon("repo");
		this.contextValue = "repo";
	}
}

/** Single draft item — represents a local JSON file. */
class DraftTreeItem extends vscode.TreeItem {
	constructor(public readonly draft: LocalDraft) {
		super(truncate(draft.data.title, 60), vscode.TreeItemCollapsibleState.None);
		const kind = draft.data.kind.replace("_", " ");
		const ago = relativeTime(draft.createdAt);
		this.description = `${kind} · ${ago}`;
		this.iconPath = kindIcon(draft.data.kind);
		this.contextValue = "draft";
		this.tooltip = `${draft.data.title}\n\n${draft.data.body?.slice(0, 200) ?? ""}`;
	}
}

function truncate(s: string, max: number): string {
	return s.length > max ? `${s.slice(0, max)}…` : s;
}

function relativeTime(iso: string): string {
	const ms = Date.now() - new Date(iso).getTime();
	const mins = Math.floor(ms / 60_000);
	if (mins < 1) return "just now";
	if (mins < 60) return `${mins}m ago`;
	const hrs = Math.floor(mins / 60);
	if (hrs < 24) return `${hrs}h ago`;
	return `${Math.floor(hrs / 24)}d ago`;
}

function kindIcon(kind: string): vscode.ThemeIcon {
	switch (kind) {
		case "decision":
			return new vscode.ThemeIcon("milestone");
		case "dead_end":
			return new vscode.ThemeIcon("error");
		case "pattern":
			return new vscode.ThemeIcon("symbol-pattern");
		case "progress":
			return new vscode.ThemeIcon("check");
		case "business":
			return new vscode.ThemeIcon("briefcase");
		default:
			return new vscode.ThemeIcon("note");
	}
}

export class DraftsTreeProvider implements vscode.TreeDataProvider<DraftTreeNode> {
	private _onDidChangeTreeData = new vscode.EventEmitter<DraftTreeNode | undefined>();
	readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

	private drafts: LocalDraft[] = [];
	private timer: ReturnType<typeof setInterval> | null = null;

	get draftCount(): number {
		if (this.repo) {
			return this.drafts.filter((d) => d.data.repo === this.repo).length;
		}
		return this.drafts.length;
	}

	constructor(private repo: string) {
		this.startAutoRefresh();
	}

	updateRepo(repo: string): void {
		this.repo = repo;
		this.refresh();
	}

	refresh(): void {
		this.drafts = listDrafts();
		this._onDidChangeTreeData.fire(undefined);
	}

	getTreeItem(element: DraftTreeNode): DraftTreeNode {
		return element;
	}

	getChildren(element?: DraftTreeNode): DraftTreeNode[] {
		if (!element) return this.getRootChildren();
		if (element instanceof RepoTreeItem) {
			return this.drafts
				.filter((d) => d.data.repo === element.repo)
				.map((d) => new DraftTreeItem(d));
		}
		return [];
	}

	private getRootChildren(): DraftTreeNode[] {
		if (this.drafts.length === 0) return [];

		// Contextual mode: workspace has a git repo → flat list
		if (this.repo) {
			const repoDrafts = this.drafts.filter((d) => d.data.repo === this.repo);
			return repoDrafts.map((d) => new DraftTreeItem(d));
		}

		// Discovery mode: group by repo
		const byRepo = new Map<string, number>();
		for (const d of this.drafts) {
			const r = d.data.repo || "unknown";
			byRepo.set(r, (byRepo.get(r) ?? 0) + 1);
		}
		return [...byRepo.entries()]
			.sort((a, b) => a[0].localeCompare(b[0]))
			.map(([repo, count]) => new RepoTreeItem(repo, count));
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
