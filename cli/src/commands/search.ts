import type { Insight } from "@pulse/shared";
import { loadConfig } from "../config";
import { apiGet } from "../http";
import { banner, c, error, formatInsightCard, info } from "../output";

interface SearchResponse {
	insights: Insight[];
	total: number;
	limit: number;
	offset: number;
}

export async function searchCommand(args: string[]): Promise<void> {
	const query = args.join(" ").trim();
	if (!query) {
		error('Usage: pulse search "your query"');
		process.exit(1);
	}

	const config = loadConfig();
	banner(`Search: ${c.bold(query)}`);

	const params = new URLSearchParams({ q: query, limit: "10", offset: "0" });
	const data = await apiGet<SearchResponse>(config.apiUrl, `/search?${params}`, config.token);

	if (data.insights.length === 0) {
		info("No results found.");
		console.log(`  ${c.dim("Try a different query or broader terms.")}`);
		return;
	}

	console.log(`  ${c.dim(`${data.total} result${data.total !== 1 ? "s" : ""} found`)}\n`);

	for (const insight of data.insights) {
		console.log(formatInsightCard(insight));
	}

	if (data.total > data.insights.length) {
		console.log(`  ${c.dim(`... and ${data.total - data.insights.length} more`)}`);
	}
}
