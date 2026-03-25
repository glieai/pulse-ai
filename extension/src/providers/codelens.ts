import * as vscode from "vscode";
import type { PulseApiClient } from "../api/client";

interface CacheEntry {
	count: number;
	timestamp: number;
}

const CACHE_TTL = 30_000; // 30s

export class PulseCodeLensProvider implements vscode.CodeLensProvider {
	private _onDidChangeCodeLenses = new vscode.EventEmitter<void>();
	readonly onDidChangeCodeLenses = this._onDidChangeCodeLenses.event;

	private cache = new Map<string, CacheEntry>();

	constructor(
		private client: PulseApiClient,
		private repo: string,
	) {}

	updateClient(client: PulseApiClient, repo: string): void {
		this.client = client;
		this.repo = repo;
		this.cache.clear();
		this._onDidChangeCodeLenses.fire();
	}

	provideCodeLenses(_document: vscode.TextDocument): vscode.CodeLens[] {
		if (!this.repo) return [];

		// Single CodeLens at line 0 — resolved lazily
		const range = new vscode.Range(0, 0, 0, 0);
		return [new vscode.CodeLens(range)];
	}

	async resolveCodeLens(codeLens: vscode.CodeLens): Promise<vscode.CodeLens> {
		const editor = vscode.window.activeTextEditor;
		if (!editor) return codeLens;

		const filePath = vscode.workspace.asRelativePath(editor.document.uri);
		const cacheKey = filePath;

		// Check cache
		const cached = this.cache.get(cacheKey);
		if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
			codeLens.command = this.makeCommand(cached.count, filePath);
			return codeLens;
		}

		// Fetch from API
		try {
			const result = await this.client.getFileContext(filePath, this.repo);
			const count = result.insights.length;
			this.cache.set(cacheKey, { count, timestamp: Date.now() });
			codeLens.command = this.makeCommand(count, filePath);
		} catch {
			codeLens.command = {
				title: "Pulse: offline",
				command: "",
			};
		}

		return codeLens;
	}

	/** Invalidate cache for a specific file. */
	invalidate(filePath: string): void {
		this.cache.delete(filePath);
		this._onDidChangeCodeLenses.fire();
	}

	/** Invalidate all cached entries. */
	invalidateAll(): void {
		this.cache.clear();
		this._onDidChangeCodeLenses.fire();
	}

	private makeCommand(count: number, _filePath: string): vscode.Command {
		if (count === 0) {
			return { title: "Pulse: no insights", command: "" };
		}
		return {
			title: `Pulse: ${count} insight${count === 1 ? "" : "s"}`,
			command: "pulse.search",
		};
	}

	dispose(): void {
		this._onDidChangeCodeLenses.dispose();
	}
}
