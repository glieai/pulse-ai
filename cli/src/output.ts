// ANSI color helpers — zero deps, Bun supports natively
const esc = (code: string) => `\x1b[${code}m`;
const reset = esc("0");

export const c = {
	bold: (s: string) => `${esc("1")}${s}${reset}`,
	dim: (s: string) => `${esc("2")}${s}${reset}`,
	red: (s: string) => `${esc("31")}${s}${reset}`,
	green: (s: string) => `${esc("32")}${s}${reset}`,
	yellow: (s: string) => `${esc("33")}${s}${reset}`,
	blue: (s: string) => `${esc("34")}${s}${reset}`,
	magenta: (s: string) => `${esc("35")}${s}${reset}`,
	cyan: (s: string) => `${esc("36")}${s}${reset}`,
	gray: (s: string) => `${esc("90")}${s}${reset}`,
};

const kindColors: Record<string, (s: string) => string> = {
	decision: c.blue,
	dead_end: c.red,
	pattern: c.green,
	progress: c.yellow,
	context: c.gray,
};

export function kindBadge(kind: string): string {
	const colorFn = kindColors[kind] ?? c.gray;
	return colorFn(`[${kind.replace("_", " ")}]`);
}

export function relativeTime(dateStr: string): string {
	const diff = Date.now() - new Date(dateStr).getTime();
	const minutes = Math.floor(diff / 60000);
	if (minutes < 1) return "just now";
	if (minutes < 60) return `${minutes}m ago`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}h ago`;
	const days = Math.floor(hours / 24);
	if (days < 30) return `${days}d ago`;
	return new Date(dateStr).toLocaleDateString();
}

export function truncate(text: string, maxLen: number): string {
	if (text.length <= maxLen) return text;
	return `${text.slice(0, maxLen - 1)}…`;
}

export function formatInsightCard(insight: {
	kind: string;
	title: string;
	body: string;
	repo: string;
	author_name?: string;
	created_at: string;
}): string {
	const badge = kindBadge(insight.kind);
	const title = c.bold(insight.title);
	const preview = c.dim(truncate(insight.body.replace(/\n/g, " "), 120));
	const meta = c.gray(
		[insight.repo, insight.author_name, relativeTime(insight.created_at)]
			.filter(Boolean)
			.join(" · "),
	);
	return `  ${badge} ${title}\n  ${preview}\n  ${meta}\n`;
}

export function banner(text: string): void {
	console.log(`\n${c.bold(c.magenta("pulse"))} ${c.dim("—")} ${text}\n`);
}

export function success(text: string): void {
	console.log(`  ${c.green("✓")} ${text}`);
}

export function warn(text: string): void {
	console.log(`  ${c.yellow("!")} ${text}`);
}

export function error(text: string): void {
	console.error(`  ${c.red("✗")} ${text}`);
}

export function info(text: string): void {
	console.log(`  ${c.cyan("→")} ${text}`);
}
