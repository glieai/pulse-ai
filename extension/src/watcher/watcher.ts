import { execSync } from "node:child_process";
import { getAllActiveSessions, getSessionTitle } from "@pulse/cli/context/session";
import { saveDraft } from "@pulse/shared";
import type { InsightCreate } from "@pulse/shared";
import * as vscode from "vscode";
import type { PulseApiClient } from "../api/client";
import type { PulseExtensionConfig } from "../config";
import { gatherContext } from "../context/gather";
import { generateInsight } from "../llm/generate";
import type { DraftsTreeProvider } from "../providers/drafts-tree";
import type { WatcherTreeProvider } from "../providers/watcher-tree";

interface TrackedSession {
	sessionId: string;
	title: string;
	bytesAtLastTrigger: number;
}

interface WatcherPersistedState {
	baselines: Record<string, number>;
	lastCommitHash?: string;
}

const STATE_KEY = "pulse.watcherState";

/**
 * VS Code watcher — monitors ALL active session files and auto-generates
 * insight drafts when combined growth reaches the size threshold.
 *
 * Hot path: readdirSync + N statSync per poll (N = active sessions).
 * getAllActiveSessions already does this in a single pass.
 */
export interface WatcherStatus {
	running: boolean;
	generating: boolean;
	sessionCount: number;
}

export class PulseWatcher implements vscode.Disposable {
	private timer: ReturnType<typeof setInterval> | null = null;
	private running = false;
	private generating = false;
	private tracked = new Map<string, TrackedSession>();
	private lastCommitHash = "";
	private output: vscode.OutputChannel;
	private onStatusChange: ((status: WatcherStatus) => void) | null = null;

	constructor(
		private client: PulseApiClient,
		private config: PulseExtensionConfig,
		private draftsTree: DraftsTreeProvider,
		private tree: WatcherTreeProvider,
		private memento: vscode.Memento,
	) {
		this.output = vscode.window.createOutputChannel("Pulse Watcher");
		this.setContext(false);
	}

	get isActive(): boolean {
		return this.running;
	}

	get isGenerating(): boolean {
		return this.generating;
	}

	get sessionCount(): number {
		return this.tracked.size;
	}

	onDidChangeStatus(cb: (status: WatcherStatus) => void): void {
		this.onStatusChange = cb;
	}

	start(restore = false): void {
		if (this.running) return;

		const cwd = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
		if (!cwd) {
			vscode.window.showWarningMessage("Pulse Watcher: No workspace folder open.");
			return;
		}

		const sessions = getAllActiveSessions(cwd);

		// Restore baselines from persisted state if available
		const saved = restore ? this.memento.get<WatcherPersistedState>(STATE_KEY) : undefined;
		const savedBaselines = saved?.baselines ?? {};

		// Initialize tracking for active sessions (may be empty — git-only mode)
		this.tracked.clear();
		for (const s of sessions) {
			const title = getSessionTitle(s.filePath) ?? s.sessionId;
			const baseline = savedBaselines[s.filePath] ?? s.size;
			this.tracked.set(s.filePath, { sessionId: s.sessionId, title, bytesAtLastTrigger: baseline });
		}

		// Initialize git commit tracking
		this.lastCommitHash = saved?.lastCommitHash ?? this.getCurrentCommitHash(cwd);

		const pollMs = this.getPollInterval();
		this.running = true;
		this.timer = setInterval(() => this.poll(cwd), pollMs);
		this.setContext(true);
		this.updateUI([]);
		this.persistState();

		const thresholdKb = this.getThresholdKb();
		const parts: string[] = [];
		if (sessions.length > 0) parts.push(`${sessions.length} session(s)`);
		parts.push("git commits");
		this.log(
			`Started — tracking ${parts.join(" + ")}, threshold ${thresholdKb} KB, poll ${pollMs / 1000}s`,
		);
		if (sessions.length === 0) {
			this.log("  No active sessions yet — will detect new ones automatically");
		}
		for (const s of sessions) {
			const baseline = this.tracked.get(s.filePath)?.bytesAtLastTrigger ?? s.size;
			const diff = s.size - baseline;
			this.log(
				`  Session: ${s.sessionId}${diff > 0 ? ` (+${Math.round(diff / 1024)} KB pending)` : ""}`,
			);
		}
		this.log(`  Git: HEAD at ${this.lastCommitHash.slice(0, 8) || "no commits"}`);
		vscode.window.showInformationMessage(`Pulse Watcher: Tracking ${parts.join(" + ")}`);
	}

	stop(): void {
		if (!this.running) return;

		if (this.timer) {
			clearInterval(this.timer);
			this.timer = null;
		}

		this.running = false;
		this.tracked.clear();
		this.lastCommitHash = "";
		this.setContext(false);
		this.updateUI([]);
		this.clearPersistedState();

		this.log("Stopped");
		vscode.window.showInformationMessage("Pulse Watcher: Stopped");
	}

	toggle(): void {
		this.running ? this.stop() : this.start();
	}

	updateClient(
		client: PulseApiClient,
		config: PulseExtensionConfig,
		draftsTree: DraftsTreeProvider,
	): void {
		this.client = client;
		this.config = config;
		this.draftsTree = draftsTree;
	}

	dispose(): void {
		// Save state if running (implicit stop = reload), then cleanup without calling stop()
		if (this.running) {
			this.persistState();
		}
		if (this.timer) {
			clearInterval(this.timer);
			this.timer = null;
		}
		this.running = false;
		this.tracked.clear();
		this.output.dispose();
	}

	private getThresholdKb(): number {
		return vscode.workspace.getConfiguration("pulse").get<number>("watcherSizeThresholdKb") ?? 256;
	}

	private getPollInterval(): number {
		return vscode.workspace.getConfiguration("pulse").get<number>("watcherPollInterval") ?? 5000;
	}

	private async poll(cwd: string): Promise<void> {
		if (!this.running || this.generating) return;

		try {
			const activeSessions = getAllActiveSessions(cwd);

			// Track new sessions dynamically (sessions can appear after watcher starts)
			for (const s of activeSessions) {
				if (!this.tracked.has(s.filePath)) {
					const title = getSessionTitle(s.filePath) ?? s.sessionId;
					this.tracked.set(s.filePath, {
						sessionId: s.sessionId,
						title,
						bytesAtLastTrigger: s.size,
					});
					this.log(`New session: ${s.sessionId} — ${title}`);
				}
			}

			// Remove sessions that disappeared
			const activePaths = new Set(activeSessions.map((s) => s.filePath));
			for (const [path, t] of this.tracked) {
				if (!activePaths.has(path)) {
					this.log(`Session ended: ${t.sessionId}`);
					this.tracked.delete(path);
				}
			}

			// Compute growth per session
			const thresholdBytes = this.getThresholdKb() * 1024;
			const growths: Array<{ sessionId: string; title: string; growthBytes: number }> = [];
			let sessionTriggered = false;

			for (const s of activeSessions) {
				const t = this.tracked.get(s.filePath);
				if (!t) continue;
				const growth = s.size - t.bytesAtLastTrigger;
				growths.push({ sessionId: s.sessionId, title: t.title, growthBytes: growth });
				if (growth >= thresholdBytes) sessionTriggered = true;
			}

			// Check for new git commits
			const currentHash = this.getCurrentCommitHash(cwd);
			const commitTriggered = currentHash !== "" && currentHash !== this.lastCommitHash;

			this.updateUI(growths);

			// Determine trigger type
			const triggered = sessionTriggered || commitTriggered;
			const triggerType: "size" | "commit" = commitTriggered ? "commit" : "size";

			if (triggered) {
				this.generating = true;
				this.updateUI(growths);

				if (commitTriggered) {
					this.log(`New commit detected: ${currentHash.slice(0, 8)}`);
				}
				if (sessionTriggered) {
					const triggeredSessions = growths.filter((g) => g.growthBytes >= thresholdBytes);
					this.log(
						`Session threshold reached — ${triggeredSessions.map((s) => `${s.sessionId} (+${Math.round(s.growthBytes / 1024)} KB)`).join(", ")}`,
					);
				}

				try {
					await this.generateAndSave(triggerType, commitTriggered ? currentHash : undefined);
				} finally {
					// Reset all baselines to current sizes
					const fresh = getAllActiveSessions(cwd);
					for (const s of fresh) {
						const t = this.tracked.get(s.filePath);
						if (t) t.bytesAtLastTrigger = s.size;
					}
					this.lastCommitHash = currentHash || this.lastCommitHash;
					this.generating = false;
					this.updateUI([]);
					this.persistState();
				}
			}
		} catch (err) {
			this.log(`Poll error: ${err instanceof Error ? err.message : "unknown"}`);
		}
	}

	private async generateAndSave(
		triggerType: "size" | "commit" = "size",
		commitHash?: string,
	): Promise<void> {
		const context = await gatherContext(this.client, this.config.repo, commitHash);

		if (!context.transcript && !context.diff && !context.recentCommits) {
			this.log("No context available — skipping");
			return;
		}

		const generated = await generateInsight(context);

		const data: InsightCreate = {
			kind: generated.kind,
			title: generated.title,
			body: generated.body,
			structured: generated.structured,
			repo: context.repo,
			branch: context.branch,
			source_files: generated.sourceFiles,
			trigger_type: triggerType,
			status: "draft",
		};

		saveDraft(data);
		this.draftsTree.refresh();
		this.log(`Draft saved locally (${triggerType}): "${generated.title}"`);
		vscode.window.showInformationMessage(`Pulse Watcher: Draft — "${generated.title}"`);
	}

	private getCurrentCommitHash(cwd: string): string {
		try {
			return execSync("git rev-parse HEAD", {
				encoding: "utf-8",
				timeout: 5000,
				cwd,
			}).trim();
		} catch {
			return "";
		}
	}

	private updateUI(
		growths: Array<{ sessionId: string; title: string; growthBytes: number }>,
	): void {
		// Notify extension to update unified status bar
		this.onStatusChange?.({
			running: this.running,
			generating: this.generating,
			sessionCount: this.tracked.size,
		});

		// Sidebar tree — per-session progress + git tracking
		this.tree.update({
			running: this.running,
			sessions: growths,
			thresholdKb: this.getThresholdKb(),
			generating: this.generating,
			commitHash: this.lastCommitHash,
		});
	}

	private persistState(): void {
		const baselines: Record<string, number> = {};
		for (const [path, t] of this.tracked) {
			baselines[path] = t.bytesAtLastTrigger;
		}
		this.memento.update(STATE_KEY, {
			baselines,
			lastCommitHash: this.lastCommitHash,
		} satisfies WatcherPersistedState);
	}

	private clearPersistedState(): void {
		this.memento.update(STATE_KEY, undefined);
	}

	private setContext(active: boolean): void {
		vscode.commands.executeCommand("setContext", "pulse.watcherRunning", active);
	}

	private log(msg: string): void {
		this.output.appendLine(`[${new Date().toISOString().slice(11, 19)}] ${msg}`);
	}
}
