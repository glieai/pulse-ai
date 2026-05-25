import type { Insight, InsightKind } from "@pulse/shared";

const KIND_COLORS: Record<InsightKind, string> = {
	decision: "#4ade80",
	dead_end: "#f87171",
	pattern: "#a78bfa",
	context: "#60a5fa",
	progress: "#34d399",
	business: "#fbbf24",
};

function escapeHtml(str: string): string {
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

function renderStructured(structured: Record<string, unknown>): string {
	const entries = Object.entries(structured);
	if (entries.length === 0) return "";

	const rows = entries
		.map(([key, value]) => {
			const label = key.replace(/_/g, " ");
			const val = typeof value === "string" ? escapeHtml(value) : escapeHtml(JSON.stringify(value));
			return `<tr><td class="key">${escapeHtml(label)}</td><td>${val}</td></tr>`;
		})
		.join("\n");

	return `
		<div class="section">
			<h3>Structured Data</h3>
			<table>${rows}</table>
		</div>`;
}

function renderSourceFiles(files: string[]): string {
	if (files.length === 0) return "";
	const items = files.map((f) => `<li><code>${escapeHtml(f)}</code></li>`).join("\n");
	return `
		<div class="section">
			<h3>Source Files</h3>
			<ul>${items}</ul>
		</div>`;
}

function renderCommits(hashes: string[]): string {
	if (hashes.length === 0) return "";
	const items = hashes.map((h) => `<li><code>${escapeHtml(h.slice(0, 7))}</code></li>`).join("\n");
	return `
		<div class="section">
			<h3>Commits</h3>
			<ul class="inline">${items}</ul>
		</div>`;
}

export interface DetailHtmlOptions {
	insight: Insight;
	nonce: string;
}

export function renderInsightHtml(options: DetailHtmlOptions): string {
	const { insight, nonce } = options;
	const color = KIND_COLORS[insight.kind] ?? "#888";
	const kindLabel = insight.kind.replace(/_/g, " ");
	const statusBadge = insight.status === "draft" ? `<span class="badge draft">draft</span>` : "";

	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'nonce-${nonce}';">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<style nonce="${nonce}">
		body {
			font-family: var(--vscode-font-family);
			color: var(--vscode-editor-foreground);
			background: var(--vscode-editor-background);
			padding: 16px 24px;
			line-height: 1.6;
		}
		.badge {
			display: inline-block;
			padding: 2px 10px;
			border-radius: 12px;
			font-size: 0.75em;
			font-weight: 600;
			text-transform: uppercase;
			color: #111;
			background: ${color};
			margin-bottom: 8px;
		}
		.badge.draft {
			background: #fbbf24;
			margin-left: 8px;
		}
		h1 {
			font-size: 1.3em;
			margin: 8px 0 16px;
			color: var(--vscode-editor-foreground);
		}
		.body {
			white-space: pre-wrap;
			font-size: 0.9em;
			background: var(--vscode-textBlockQuote-background);
			padding: 12px 16px;
			border-radius: 6px;
			border-left: 3px solid ${color};
		}
		.section { margin-top: 20px; }
		h3 {
			font-size: 0.85em;
			text-transform: uppercase;
			letter-spacing: 0.05em;
			color: var(--vscode-descriptionForeground);
			margin-bottom: 8px;
		}
		table { width: 100%; border-collapse: collapse; }
		td {
			padding: 4px 8px;
			border-bottom: 1px solid var(--vscode-widget-border);
			font-size: 0.85em;
		}
		td.key {
			font-weight: 600;
			text-transform: capitalize;
			width: 30%;
			color: var(--vscode-descriptionForeground);
		}
		ul { padding-left: 20px; }
		ul.inline { list-style: none; padding: 0; display: flex; gap: 8px; }
		code {
			font-family: var(--vscode-editor-font-family);
			font-size: 0.85em;
			background: var(--vscode-textBlockQuote-background);
			padding: 1px 4px;
			border-radius: 3px;
		}
		.meta {
			margin-top: 24px;
			font-size: 0.75em;
			color: var(--vscode-descriptionForeground);
		}
	</style>
</head>
<body>
	<span class="badge">${escapeHtml(kindLabel)}</span>${statusBadge}
	<h1>${escapeHtml(insight.title)}</h1>
	<div class="body">${escapeHtml(insight.body)}</div>

	${insight.structured ? renderStructured(insight.structured) : ""}
	${insight.source_files?.length ? renderSourceFiles(insight.source_files) : ""}
	${insight.commit_hashes?.length ? renderCommits(insight.commit_hashes) : ""}

	<div class="meta">
		${insight.repo ? `<span>Repo: ${escapeHtml(insight.repo)}</span> · ` : ""}
		${insight.branch ? `<span>Branch: ${escapeHtml(insight.branch)}</span> · ` : ""}
		<span>${escapeHtml(insight.created_at)}</span>
	</div>
</body>
</html>`;
}
