import type { Insight } from "@pulse/shared";
import { loadConfig } from "../config";
import { apiGet } from "../http";
import { banner, c, error, formatInsightCard, info, kindBadge } from "../output";

interface ContextResponse {
	insights: Insight[];
}

export async function contextCommand(args: string[]): Promise<void> {
	const filePath = args[0];
	if (!filePath) {
		error("Usage: pulse context <file>");
		process.exit(1);
	}

	const config = loadConfig();
	banner(`Context: ${c.bold(filePath)}`);

	const params = new URLSearchParams({ repo: config.repo });
	const data = await apiGet<ContextResponse>(
		config.apiUrl,
		`/context/file/${encodeURIComponent(filePath)}?${params}`,
		config.token,
	);

	if (data.insights.length === 0) {
		info("No insights for this file.");
		console.log(`  ${c.dim("As you work on this file, insights will appear here.")}`);
		return;
	}

	console.log(
		`  ${c.dim(`${data.insights.length} insight${data.insights.length !== 1 ? "s" : ""}`)}\n`,
	);

	// Group by kind
	const byKind = new Map<string, Insight[]>();
	for (const insight of data.insights) {
		const group = byKind.get(insight.kind) ?? [];
		group.push(insight);
		byKind.set(insight.kind, group);
	}

	for (const [kind, insights] of byKind) {
		console.log(`  ${kindBadge(kind)} ${c.dim(`(${insights.length})`)}`);
		for (const insight of insights) {
			console.log(formatInsightCard(insight));
		}
	}
}
