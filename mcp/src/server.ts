#!/usr/bin/env node
/**
 * Pulse MCP Server
 *
 * Exposes the Pulse knowledge base as MCP tools for AI coding agents.
 * Any MCP-compatible tool (Claude Code, Cursor, etc.) can query and
 * contribute to the team's operational memory.
 *
 * Transport: stdio (child process, no network required)
 * Auth: Pulse API token via PULSE_API_TOKEN env var
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type { Insight } from "@pulse/shared/types/insight";
import { z } from "zod";
import { PulseApiClient } from "./api-client.js";

// ═══════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════

const API_PORT = process.env.API_PORT || "3000";
const API_URL = process.env.PULSE_API_URL || `http://localhost:${API_PORT}/api`;
const TOKEN = process.env.PULSE_API_TOKEN || "";
const MODE = process.env.PULSE_MODE || (TOKEN ? "team" : "solo");

if (!TOKEN) {
	console.error(
		"PULSE_API_TOKEN is required. Create one at your Pulse dashboard (Settings > API Tokens).",
	);
	process.exit(1);
}

const api = new PulseApiClient(API_URL, TOKEN);

// ═══════════════════════════════════════════════
// SERVER
// ═══════════════════════════════════════════════

const server = new McpServer({
	name: "pulse",
	version: "0.1.0",
});

// ═══════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════

/** Format an insight for LLM consumption — compact, information-dense */
function formatInsight(i: Insight): string {
	const lines: string[] = [];
	lines.push(`## [${i.kind.toUpperCase()}] ${i.title}`);
	lines.push(`*${i.created_at.slice(0, 10)} · ${i.repo}${i.branch ? ` (${i.branch})` : ""}*`);
	lines.push("");
	lines.push(i.body);

	const s = i.structured || {};

	if (i.kind === "decision" && Array.isArray(s.alternatives) && s.alternatives.length > 0) {
		lines.push("");
		lines.push(`**Why:** ${s.why || "—"}`);
		lines.push("**Alternatives rejected:**");
		for (const alt of s.alternatives as Array<{ what: string; why_rejected: string }>) {
			lines.push(`  - ${alt.what} → ${alt.why_rejected}`);
		}
	}

	if (i.kind === "dead_end") {
		if (s.why_failed) lines.push(`\n**Why failed:** ${s.why_failed}`);
		if (s.time_spent) lines.push(`**Time spent:** ${s.time_spent}`);
		if (s.workaround) lines.push(`**Workaround:** ${s.workaround}`);
	}

	if (i.kind === "pattern") {
		if (s.applies_to) lines.push(`\n**Applies to:** ${s.applies_to}`);
		if (s.gotchas) lines.push(`**Gotchas:** ${s.gotchas}`);
	}

	if (i.kind === "progress" && Array.isArray(s.deliverables)) {
		lines.push("\n**Deliverables:**");
		for (const d of s.deliverables as string[]) {
			lines.push(`  - ${d}`);
		}
	}

	if (i.kind === "business") {
		if (s.problem) lines.push(`\n**Problem:** ${s.problem}`);
		if (Array.isArray(s.constraints) && s.constraints.length > 0) {
			lines.push("**Constraints:**");
			for (const c of s.constraints as string[]) {
				lines.push(`  - ${c}`);
			}
		}
		if (Array.isArray(s.drove_decisions) && s.drove_decisions.length > 0) {
			lines.push("**Drove decisions:**");
			for (const d of s.drove_decisions as string[]) {
				lines.push(`  - ${d}`);
			}
		}
	}

	if (i.source_files?.length) {
		lines.push(`\n**Files:** ${i.source_files.join(", ")}`);
	}

	return lines.join("\n");
}

function formatInsightList(insights: Insight[]): string {
	if (insights.length === 0) return "No insights found.";
	return insights.map(formatInsight).join("\n\n---\n\n");
}

function textResult(text: string) {
	return { content: [{ type: "text" as const, text }] };
}

function errorResult(msg: string) {
	return { content: [{ type: "text" as const, text: msg }], isError: true };
}

// ═══════════════════════════════════════════════
// TOOL: pulse_search
// ═══════════════════════════════════════════════

server.tool(
	"pulse_search",
	"Search the team's knowledge base for insights — decisions, dead-ends, patterns, and progress. " +
		"Use this before making technical decisions or when you encounter a problem that may have been solved before.",
	{
		query: z.string().min(1).describe("Search terms (all terms must match)"),
		kind: z
			.enum(["decision", "dead_end", "pattern", "context", "progress", "business"])
			.optional()
			.describe("Filter by insight kind"),
		limit: z.number().int().min(1).max(50).default(10).describe("Max results"),
	},
	async ({ query, kind, limit }) => {
		try {
			const res = await api.search(query, { limit });
			let insights = res.insights;

			if (kind) {
				insights = insights.filter((i) => i.kind === kind);
			}

			return textResult(
				`Found ${res.total} insights (showing ${insights.length}):\n\n${formatInsightList(insights)}`,
			);
		} catch (e) {
			return errorResult(`Search failed: ${(e as Error).message}`);
		}
	},
);

// ═══════════════════════════════════════════════
// TOOL: pulse_context
// ═══════════════════════════════════════════════

server.tool(
	"pulse_context",
	"Get relevant context from the knowledge base for a topic or question. " +
		"Uses semantic search to find the most relevant insights, even if exact words don't match. " +
		"Use this when starting work on a topic to understand past decisions and avoid known dead-ends.",
	{
		query: z.string().min(1).describe("What you want context about (natural language)"),
		repo: z.string().optional().describe("Filter by repository (e.g. 'pulse')"),
		kind: z
			.enum(["decision", "dead_end", "pattern", "context", "progress", "business"])
			.optional()
			.describe("Filter by insight kind"),
		limit: z.number().int().min(1).max(30).default(10).describe("Max results"),
	},
	async ({ query, repo, kind, limit }) => {
		try {
			const res = await api.context({ query, repo, kind, limit, strategy: "fts" });
			return textResult(
				`Context for "${query}" (${res.insights.length} results):\n\n${formatInsightList(res.insights)}`,
			);
		} catch (e) {
			return errorResult(`Context retrieval failed: ${(e as Error).message}`);
		}
	},
);

// ═══════════════════════════════════════════════
// TOOL: pulse_file_context
// ═══════════════════════════════════════════════

server.tool(
	"pulse_file_context",
	"Get all insights related to a specific file. " +
		"Use this when you're about to modify a file to understand the decisions, patterns, and dead-ends associated with it.",
	{
		file_path: z
			.string()
			.min(1)
			.describe("File path relative to repo root (e.g. 'api/src/services/auth.ts')"),
		repo: z.string().default("pulse").describe("Repository identifier"),
	},
	async ({ file_path, repo }) => {
		try {
			const res = await api.fileContext(file_path, repo);
			if (res.insights.length === 0) {
				return textResult(`No insights found for file: ${file_path}`);
			}
			return textResult(
				`${res.insights.length} insights for ${file_path}:\n\n${formatInsightList(res.insights)}`,
			);
		} catch (e) {
			return errorResult(`File context failed: ${(e as Error).message}`);
		}
	},
);

// ═══════════════════════════════════════════════
// TOOLS: write operations (solo mode only)
// In team mode, writing is done through the CLI/extension
// with local draft review before publishing.
// ═══════════════════════════════════════════════

if (MODE === "solo") {
	server.tool(
		"pulse_create",
		"Record a new insight in the team's knowledge base. " +
			"Use this when you make a technical decision, discover a dead-end, identify a reusable pattern, complete a milestone, " +
			"or capture a business requirement/domain constraint that drove a technical choice. " +
			"Insights are created as drafts and can be published later.",
		{
			kind: z
				.enum(["decision", "dead_end", "pattern", "context", "progress", "business"])
				.describe(
					"decision = technical choice with alternatives; " +
						"dead_end = approach that failed; " +
						"pattern = reusable knowledge; " +
						"context = background information; " +
						"progress = milestone completion; " +
						"business = real-world problem or domain constraint that drove a technical decision",
				),
			title: z
				.string()
				.min(1)
				.max(500)
				.describe(
					"Clear, self-contained title (someone should understand the insight from the title alone)",
				),
			body: z
				.string()
				.min(1)
				.describe("Full description in markdown. Include reasoning, context, and implications."),
			repo: z.string().default("pulse").describe("Repository identifier"),
			branch: z.string().optional().describe("Git branch name"),
			source_files: z.array(z.string()).optional().describe("Related file paths"),
			commit_hashes: z
				.array(z.string())
				.optional()
				.describe("Related git commit SHAs (full 40-char)"),
			structured: z
				.record(z.unknown())
				.optional()
				.describe(
					"Kind-specific data. " +
						"decision: { why, alternatives: [{ what, why_rejected }] }. " +
						"dead_end: { why_failed, time_spent, workaround }. " +
						"pattern: { applies_to, gotchas }. " +
						"progress: { milestone, deliverables: [] }. " +
						"business: { problem, constraints: [], drove_decisions: [] }.",
				),
			session_id: z
				.string()
				.optional()
				.describe(
					"Claude Code session identifier for tracking which session produced this insight",
				),
			device: z.string().optional().describe("Device/hostname identifier"),
		},
		async ({
			kind,
			title,
			body,
			repo,
			branch,
			source_files,
			commit_hashes,
			structured,
			session_id,
			device,
		}) => {
			try {
				const session_refs =
					session_id || device ? [{ session_id, device, tool: "mcp" }] : undefined;

				const { insight, created } = await api.create({
					kind,
					title,
					body,
					repo,
					branch,
					source_files,
					commit_hashes,
					structured: structured || {},
					session_refs,
					trigger_type: "manual",
					status: "draft",
				});

				if (created) {
					const lines = [
						"Insight created (draft):",
						`- ID: ${insight.id}`,
						`- Kind: ${insight.kind}`,
						`- Title: ${insight.title}`,
					];

					const hints = (insight as unknown as Record<string, unknown>).hints as
						| { missing?: string[]; supersedes_id?: string; related_count?: number }
						| undefined;
					if (hints?.missing?.length) {
						lines.push(`\n**Quality hints:** Consider adding: ${hints.missing.join(", ")}`);
					}
					if (hints?.related_count && hints.related_count > 0) {
						lines.push(`**Related insights:** ${hints.related_count} found`);
					}
					if (hints?.supersedes_id) {
						lines.push("**Note:** This may supersede an existing insight");
					}

					lines.push("\nPublish with: pulse_publish");
					return textResult(lines.join("\n"));
				}

				return textResult(
					`Duplicate detected — insight already exists:\n- ID: ${insight.id}\n- Kind: ${insight.kind}\n- Title: ${insight.title}\n- Created: ${insight.created_at}`,
				);
			} catch (e) {
				return errorResult(`Failed to create insight: ${(e as Error).message}`);
			}
		},
	);

	// ═══════════════════════════════════════════════
	// TOOL: pulse_generate
	// ═══════════════════════════════════════════════

	server.tool(
		"pulse_generate",
		"Generate an insight from raw unstructured data (conversation, email, meeting notes) using server-side LLM. " +
			"Use this when you receive content from external sources that should be analyzed for insights. " +
			"Requires LLM to be configured on the Pulse API server.",
		{
			raw_data: z
				.string()
				.min(1)
				.describe(
					"Raw content to analyze (conversation transcript, email thread, meeting notes, etc.)",
				),
			source_type: z
				.string()
				.min(1)
				.describe("Source type (e.g. 'whatsapp', 'email', 'slack', 'meeting', 'custom')"),
			source_name: z
				.string()
				.optional()
				.describe("Human-readable source identifier (e.g. 'Client Project Group', thread subject)"),
			repo: z.string().default("pulse").describe("Repository this content relates to"),
			branch: z.string().optional().describe("Git branch name"),
			auto_approve: z
				.boolean()
				.default(false)
				.describe("If true, publish immediately instead of saving as draft"),
		},
		async ({ raw_data, source_type, source_name, repo, branch, auto_approve }) => {
			try {
				const { insight, created } = await api.generate({
					raw_data,
					source_type,
					source_name,
					repo,
					branch,
					auto_approve,
				});

				const status = insight.status === "published" ? "published" : "draft";

				if (created) {
					return textResult(
						`Insight generated (${status}):\n- ID: ${insight.id}\n- Kind: ${insight.kind}\n- Title: ${insight.title}\n- Body: ${insight.body.slice(0, 200)}...${status === "draft" ? "\n\nPublish with: pulse_publish" : ""}`,
					);
				}

				return textResult(
					`Duplicate detected — insight already exists:\n- ID: ${insight.id}\n- Title: ${insight.title}`,
				);
			} catch (e) {
				return errorResult(`Generate failed: ${(e as Error).message}`);
			}
		},
	);

	// ═══════════════════════════════════════════════
	// TOOL: pulse_publish
	// ═══════════════════════════════════════════════

	server.tool(
		"pulse_publish",
		"Publish all draft insights for a repository. Published insights become searchable and available to the whole team.",
		{
			repo: z.string().default("pulse").describe("Repository to publish drafts for"),
		},
		async ({ repo }) => {
			try {
				const res = await api.publish(repo);
				if (res.count === 0) {
					return textResult("No draft insights to publish.");
				}
				const titles = res.published.map((i) => `  - [${i.kind}] ${i.title}`).join("\n");
				return textResult(`Published ${res.count} insights:\n${titles}`);
			} catch (e) {
				return errorResult(`Publish failed: ${(e as Error).message}`);
			}
		},
	);
} // end solo-only tools

// ═══════════════════════════════════════════════
// TOOL: pulse_summary
// ═══════════════════════════════════════════════

server.tool(
	"pulse_summary",
	"Get a summary of the project's knowledge base — how many insights exist, what kinds, coverage areas. " +
		"Use this for project overview, status meetings, or to understand the team's accumulated knowledge.",
	{
		repo: z.string().default("pulse").describe("Repository to summarise"),
	},
	async ({ repo }) => {
		try {
			const res = await api.list({ repo, status: "published", limit: 100 });
			const insights = res.insights;

			if (insights.length === 0) {
				return textResult(`No published insights for ${repo}.`);
			}

			// Aggregates
			const byKind: Record<string, Insight[]> = {};
			const files = new Set<string>();
			let totalAlts = 0;

			for (const i of insights) {
				if (!byKind[i.kind]) byKind[i.kind] = [];
				byKind[i.kind].push(i);
				for (const f of i.source_files || []) files.add(f);
				if (i.kind === "decision") {
					const alts = (i.structured?.alternatives as unknown[]) || [];
					totalAlts += alts.length;
				}
			}

			// Date range
			const dates = insights.map((i) => i.created_at.slice(0, 10)).sort();
			const days = new Set(dates).size;

			const lines: string[] = [];
			lines.push(`# Knowledge Base Summary: ${repo}`);
			lines.push("");
			lines.push(`**${insights.length}** published insights across **${days}** days`);
			lines.push(`**${files.size}** files with context · **${totalAlts}** alternatives evaluated`);
			lines.push("");

			for (const [kind, items] of Object.entries(byKind).sort(
				(a, b) => b[1].length - a[1].length,
			)) {
				lines.push(`### ${kind} (${items.length})`);
				for (const i of items) {
					lines.push(`- ${i.title}`);
				}
				lines.push("");
			}

			return textResult(lines.join("\n"));
		} catch (e) {
			return errorResult(`Summary failed: ${(e as Error).message}`);
		}
	},
);

// ═══════════════════════════════════════════════
// ERROR HANDLING & STARTUP
// ═══════════════════════════════════════════════

server.server.onerror = (error) => {
	console.error("[Pulse MCP Error]", error);
};

process.on("SIGINT", async () => {
	await server.close();
	process.exit(0);
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Pulse MCP server running (stdio)");
