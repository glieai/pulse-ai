import type { Insight } from "@pulse/shared";
import { ASK_SYSTEM_PROMPT, buildAskUserPrompt } from "@pulse/shared";
import { loadConfig } from "../config";
import { apiGet, apiPost } from "../http";
import { generateEmbedding } from "../llm/embedding";
import { getProviderWithSetup } from "../llm/provider";
import { resolveLlmConfig } from "../llm/resolve-provider";
import { banner, c, error, info, kindBadge } from "../output";

interface ContextResponse {
	insights: Insight[];
}

export async function askCommand(args: string[]): Promise<void> {
	// Parse --kind and --repo flags
	let kind: string | undefined;
	let repo: string | undefined;
	const queryParts: string[] = [];

	for (let i = 0; i < args.length; i++) {
		if (args[i] === "--kind" && args[i + 1]) {
			kind = args[++i];
		} else if (args[i] === "--repo" && args[i + 1]) {
			repo = args[++i];
		} else {
			queryParts.push(args[i]);
		}
	}

	const query = queryParts.join(" ").trim();
	if (!query) {
		error('Usage: pulse ask "your question" [--kind decision] [--repo org/repo]');
		process.exit(1);
	}

	const config = loadConfig();
	const scope = [kind && `kind:${kind}`, repo && `repo:${repo}`].filter(Boolean).join(" ");
	banner(`Ask: ${c.bold(query)}${scope ? ` ${c.dim(`(${scope})`)}` : ""}`);

	// 1. Resolve LLM provider (server preference → local config → defaults)
	const llmConfig = await resolveLlmConfig(config);
	const provider = await getProviderWithSetup(llmConfig);

	// 2. Retrieve context from API
	info("Searching knowledge base...");
	let insights: Insight[];

	const embedding = await generateEmbedding(`${query}`).catch(() => undefined);

	if (embedding) {
		const body: Record<string, unknown> = {
			query,
			strategy: "hybrid",
			embedding,
			limit: 10,
		};
		if (repo) body.repo = repo;
		if (kind) body.kind = kind;

		const data = await apiPost<ContextResponse>(config.apiUrl, "/context", body, config.token);
		insights = data.insights;
	} else {
		const params = new URLSearchParams({
			query,
			strategy: "fts",
			limit: "10",
		});
		if (kind) params.set("kind", kind);
		if (repo) params.set("repo", repo);

		const data = await apiGet<ContextResponse>(config.apiUrl, `/context?${params}`, config.token);
		insights = data.insights;
	}

	// 3. Show sources
	if (insights.length === 0) {
		info("No relevant insights found. The answer may be limited.");
	} else {
		console.log(
			`  ${c.dim(`${insights.length} source${insights.length !== 1 ? "s" : ""} found:`)}`,
		);
		for (const insight of insights.slice(0, 5)) {
			console.log(`    ${kindBadge(insight.kind)} ${insight.title}`);
		}
		if (insights.length > 5) {
			console.log(`    ${c.dim(`... and ${insights.length - 5} more`)}`);
		}
		console.log();
	}

	// 4. Build RAG prompt and generate answer
	info("Generating answer...\n");
	const userPrompt = buildAskUserPrompt(query, insights);
	const answer = await provider.generate(ASK_SYSTEM_PROMPT, userPrompt);

	// 5. Print answer
	console.log(c.dim("─".repeat(60)));
	console.log();
	console.log(answer);
	console.log();
	console.log(c.dim("─".repeat(60)));
}
