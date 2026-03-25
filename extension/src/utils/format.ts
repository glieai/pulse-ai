import type { InsightKind } from "@pulse/shared";
import * as vscode from "vscode";

/** Relative time string: "5m ago", "2h ago", "3d ago" */
export function relativeTime(dateStr: string): string {
	const now = Date.now();
	const then = new Date(dateStr).getTime();
	if (Number.isNaN(then)) return dateStr;
	const diff = Math.max(0, now - then);

	const minutes = Math.floor(diff / 60_000);
	if (minutes < 1) return "just now";
	if (minutes < 60) return `${minutes}m ago`;

	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}h ago`;

	const days = Math.floor(hours / 24);
	if (days < 30) return `${days}d ago`;

	const months = Math.floor(days / 30);
	return `${months}mo ago`;
}

/** Truncate text with ellipsis. */
export function truncate(text: string, maxLen: number): string {
	if (text.length <= maxLen) return text;
	return `${text.slice(0, maxLen - 1)}…`;
}

/** Human-readable label for insight kind. */
export function kindLabel(kind: InsightKind): string {
	const labels: Record<InsightKind, string> = {
		decision: "Decision",
		dead_end: "Dead End",
		pattern: "Pattern",
		context: "Context",
		progress: "Progress",
		business: "Business",
	};
	return labels[kind] ?? kind;
}

/** VS Code ThemeIcon for insight kind. */
export function kindIcon(kind: InsightKind): vscode.ThemeIcon {
	const icons: Record<InsightKind, string> = {
		decision: "lightbulb",
		dead_end: "error",
		pattern: "symbol-misc",
		context: "info",
		progress: "check",
		business: "briefcase",
	};
	return new vscode.ThemeIcon(icons[kind] ?? "circle-outline");
}
