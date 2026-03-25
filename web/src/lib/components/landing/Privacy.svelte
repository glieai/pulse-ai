<script lang="ts">
	import {
		Server,
		EyeOff,
		Blocks,
		Github,
		LayoutList,
		MessageSquare,
		Code,
		TerminalSquare,
	} from "lucide-svelte";
	import Terminal from "./Terminal.svelte";
	import { inview } from "./inview";

	type Audience = "developer" | "team";
	let { audience = "developer" }: { audience?: Audience } = $props();

	let setupTab: "vscode" | "cli" = $state("vscode");

	const sectionTitle = $derived(
		audience === "developer"
			? "Your knowledge. Your servers."
			: "Your team's knowledge. Always accessible.",
	);

	const sectionSubtitle = $derived(
		audience === "developer"
			? "Pulse runs on your infrastructure. Your knowledge stays under your control."
			: "Pulse Cloud keeps your team connected. Focus on building — we handle the rest.",
	);

	const vscodeLines = $derived(
		audience === "developer"
			? [
					{
						text: "1. Install \"Pulse AI\" from VS Code Marketplace",
						class: "text-text-primary",
					},
					{
						text: "2. Set API URL → http://localhost:3000/api",
						class: "text-text-primary",
					},
					{
						text: "3. Generate token in Dashboard → Account",
						class: "text-text-primary",
					},
					{ text: "" },
					{
						text: "  ✓ MCP configured for Claude Code & Codex",
						class: "text-success",
					},
					{
						text: "  ✓ Watcher ready — auto-generates insights",
						class: "text-success",
					},
					{
						text: "  ✓ Knowledge base available in all repos",
						class: "text-success",
					},
				]
			: [
					{
						text: "1. Install \"Pulse AI\" from VS Code Marketplace",
						class: "text-text-primary",
					},
					{
						text: "2. Set API URL + paste your API token",
						class: "text-text-primary",
					},
					{ text: "" },
					{
						text: "  ✓ MCP configured for Claude Code & Codex",
						class: "text-success",
					},
					{
						text: "  ✓ Watcher ready — auto-generates insights",
						class: "text-success",
					},
					{
						text: "  ✓ Team knowledge base in every session",
						class: "text-success",
					},
				],
	);

	const cliLines = $derived(
		audience === "developer"
			? [
					{
						text: "$ npx @glie/pulse-cli init",
						class: "text-text-primary",
					},
					{ text: "" },
					{
						text: "  API URL: http://localhost:3000/api",
						class: "text-text-secondary/70",
					},
					{
						text: "  ✓ Authenticated",
						class: "text-success",
					},
					{
						text: "  ✓ MCP configured (Claude Code + Codex)",
						class: "text-success",
					},
					{
						text: "  ✓ Git hooks installed",
						class: "text-success",
					},
					{ text: "" },
					{
						text: "$ pulse watch",
						class: "text-text-primary",
					},
					{
						text: "  ● Watching commits...",
						class: "text-success",
					},
				]
			: [
					{
						text: "$ npx @glie/pulse-cli init",
						class: "text-text-primary",
					},
					{ text: "" },
					{
						text: "  ✓ Authenticated",
						class: "text-success",
					},
					{
						text: "  ✓ MCP configured (Claude Code + Codex)",
						class: "text-success",
					},
					{
						text: "  ✓ Git hooks installed",
						class: "text-success",
					},
					{ text: "" },
					{
						text: "$ pulse watch",
						class: "text-text-primary",
					},
					{
						text: "  ● Watching commits...",
						class: "text-success",
					},
					{
						text: "  ↑ Syncing to team knowledge base",
						class: "text-accent",
					},
				],
	);

	const setupLines = $derived(setupTab === "vscode" ? vscodeLines : cliLines);
	const terminalTitle = $derived(
		setupTab === "vscode" ? "setup — vs code" : "setup — terminal",
	);

	const signals = $derived(
		audience === "developer"
			? [
					{
						icon: Server,
						title: "Run it yourself",
						description:
							"PostgreSQL + Hono API + SvelteKit dashboard. Your infrastructure, your data.",
					},
					{
						icon: EyeOff,
						title: "Privacy by design",
						description:
							"Sessions processed locally. Only structured insights reach the API.",
					},
				]
			: [
					{
						icon: Server,
						title: "Cloud or self-hosted",
						description:
							"Pulse Cloud for zero-setup, or deploy on your own infrastructure with Enterprise.",
					},
					{
						icon: EyeOff,
						title: "Privacy by design",
						description:
							"Sessions processed locally on each developer's machine. Only structured insights are synced.",
					},
				],
	);

	const coming = [
		{
			icon: Blocks,
			name: "Cursor",
			description: "MCP support — plug and play",
		},
		{
			icon: Github,
			name: "GitHub",
			description: "PR context from decision history",
		},
		{
			icon: LayoutList,
			name: "Linear",
			description: "Decisions linked to issues",
		},
		{
			icon: MessageSquare,
			name: "Slack",
			description: "Search and alerts from Slack",
		},
	];
</script>

<section id="infrastructure" class="px-6 py-24 md:py-32">
	<div class="mx-auto max-w-6xl">
		<div class="mb-16 text-center" use:inview>
			<h2 class="text-3xl font-bold text-text-primary sm:text-4xl">
				{sectionTitle}
			</h2>
			<p class="mx-auto mt-4 max-w-xl text-text-secondary">
				{sectionSubtitle}
			</p>
		</div>

		<div class="grid items-start gap-12 md:grid-cols-2">
			<!-- Left: Setup with tabs -->
			<div id="install" use:inview>
				<!-- Tab switcher -->
				<div class="mb-4 flex gap-1 rounded-lg bg-bg-hover/50 p-1">
					<button
						class="flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition {setupTab === 'vscode'
							? 'bg-bg-card text-text-primary shadow-sm'
							: 'text-text-secondary hover:text-text-primary'}"
						onclick={() => (setupTab = "vscode")}
					>
						<Code size={14} />
						VS Code
					</button>
					<button
						class="flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition {setupTab === 'cli'
							? 'bg-bg-card text-text-primary shadow-sm'
							: 'text-text-secondary hover:text-text-primary'}"
						onclick={() => (setupTab = "cli")}
					>
						<TerminalSquare size={14} />
						Terminal
					</button>
				</div>

				<Terminal title={terminalTitle} lines={setupLines} />

				<p class="mt-3 text-center text-xs text-text-secondary/50">
					{setupTab === "vscode"
						? "Works with Claude Code, Codex, and any MCP-compatible agent"
						: "No VS Code needed — works directly with Claude Code & Codex in the terminal"}
				</p>

				<div class="mt-8 space-y-5">
					{#each signals as signal}
						<div class="flex items-start gap-3">
							<signal.icon
								size={16}
								class="mt-0.5 shrink-0 text-text-secondary/60"
							/>
							<div>
								<p class="text-sm font-medium text-text-primary">
									{signal.title}
								</p>
								<p class="text-sm text-text-secondary/70">
									{signal.description}
								</p>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- Right: Ecosystem -->
			<div>
				<p
					class="mb-6 text-sm font-medium uppercase tracking-widest text-text-secondary/50"
					use:inview
				>
					Coming to the ecosystem
				</p>
				<div class="grid grid-cols-2 gap-4">
					{#each coming as item, i}
						<div
							class="rounded-xl border border-border/20 bg-bg-card/50 p-5 opacity-60"
							use:inview={{ delay: i * 100 }}
						>
							<div
								class="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-bg-hover"
							>
								<item.icon size={18} class="text-text-secondary" />
							</div>
							<p class="text-sm font-medium text-text-primary">{item.name}</p>
							<p class="mt-1 text-xs text-text-secondary">{item.description}</p>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
</section>
