<script lang="ts">
	import { Search, FileCode, Zap } from "lucide-svelte";
	import Terminal from "./Terminal.svelte";
	import { inview } from "./inview";

	type Audience = "developer" | "team";
	let { audience = "developer" }: { audience?: Audience } = $props();

	/* ── CLI data ── */
	const cliLines = [
		{ text: '$ pulse search "caching strategy"', class: "text-text-primary" },
		{ text: "⚡ 3 results", class: "text-accent" },
		{ text: "" },
		{
			text: "  [decision] Materialized views over Redis cache",
			class: "text-accent",
		},
		{
			text: "  [dead_end] Redis cache layer — abandoned after 2 weeks",
			class: "text-danger",
		},
		{
			text: "  [pattern]  Cache invalidation via PG LISTEN/NOTIFY",
			class: "text-success",
		},
	];

	/* ── MCP data (audience-reactive) ── */
	const beforeLines = $derived([
		{ text: "// Without Pulse", class: "text-text-secondary/50" },
		{ text: "" },
		{
			text: '> "Let me add a Redis cache layer to',
			class: "text-text-primary",
		},
		{
			text: '>  improve API performance..."',
			class: "text-text-primary",
		},
		{ text: "" },
		{
			text:
				audience === "developer"
					? "  ⚠ You already tried this."
					: "  ⚠ Your team already tried this.",
			class: "text-danger",
		},
		{
			text:
				audience === "developer"
					? "    Your AI doesn't know."
					: "    The AI doesn't know.",
			class: "text-danger",
		},
	]);

	const afterLines = $derived([
		{ text: "// With Pulse MCP", class: "text-text-secondary/50" },
		{ text: "" },
		{
			text:
				audience === "developer"
					? "🔍 Checking knowledge base..."
					: "🔍 Checking team knowledge base...",
			class: "text-accent",
		},
		{ text: "" },
		{
			text: "  Found: dead_end — Redis cache abandoned",
			class: "text-warning",
		},
		{ text: "    Reason: serialization overhead, cold-start" },
		{
			text: "  Found: decision — materialized views chosen",
			class: "text-success",
		},
		{ text: "" },
		{
			text:
				audience === "developer"
					? '> "Based on your past experience,'
					: "> \"Based on your team's experience,",
			class: "text-text-primary",
		},
		{
			text: '>  I\'ll use materialized views instead."',
			class: "text-text-primary",
		},
	]);

	/* ── VS Code editor tokens ── */
	type Token = { t: string; c?: string };
	const kw = "#cba6f7";
	const fn = "#89b4fa";
	const tp = "#89dceb";
	const tx = "#a6adc8";

	const editorCode: Array<{ n: number; tokens: Token[] }> = [
		{
			n: 12,
			tokens: [
				{ t: "export async function ", c: kw },
				{ t: "validateToken", c: fn },
				{ t: "(" },
			],
		},
		{ n: 13, tokens: [{ t: "  token: " }, { t: "string", c: tp }] },
		{ n: 14, tokens: [{ t: ") {" }] },
		{
			n: 15,
			tokens: [
				{ t: "  " },
				{ t: "const ", c: kw },
				{ t: "decoded = jwt." },
				{ t: "verify", c: fn },
				{ t: "(token, secret);" },
			],
		},
		{
			n: 16,
			tokens: [
				{ t: "  " },
				{ t: "if ", c: kw },
				{ t: "(decoded.exp < now) " },
				{ t: "throw new ", c: kw },
				{ t: "AuthError", c: tp },
				{ t: "();" },
			],
		},
		{
			n: 17,
			tokens: [{ t: "  " }, { t: "return ", c: kw }, { t: "decoded;" }],
		},
		{ n: 18, tokens: [{ t: "}" }] },
	];

	/* ── Dashboard data ── */
	const dashboardInsights = [
		{
			kind: "decision",
			kindCls: "bg-accent/15 text-accent",
			title: "Materialized views over Redis cache",
			desc: "Idempotent, no cold-start. Redis abandoned due to serialization overhead.",
			time: "2 days ago",
		},
		{
			kind: "dead_end",
			kindCls: "bg-danger/15 text-danger",
			title: "Event sourcing for audit logs",
			desc: "Over-engineered. PostgreSQL triggers solved it in 2 hours.",
			time: "1 week ago",
		},
		{
			kind: "pattern",
			kindCls: "bg-success/15 text-success",
			title: "Numbered SQL migrations — one concern per file",
			desc: "Sequential numbers, snake_case, idempotent, version-controlled.",
			time: "2 weeks ago",
		},
	];
</script>

<section id="showcase" class="px-6 py-24 md:py-32">
	<div class="mx-auto max-w-6xl">
		<div class="mb-20 text-center" use:inview>
			<h2 class="text-3xl font-bold text-text-primary sm:text-4xl">
				One knowledge base. Every surface.
			</h2>
			<p class="mx-auto mt-4 max-w-xl text-text-secondary">
				Terminal, editor, AI agent, browser — Pulse meets you where you
				work.
			</p>
		</div>

		<!-- ── 1. CLI — text left, terminal right ── -->
		<div
			class="mb-24 grid items-center gap-12 md:grid-cols-2 md:gap-16"
		>
			<div use:inview>
				<p
					class="mb-2 text-sm font-medium uppercase tracking-widest text-accent"
				>
					CLI
				</p>
				<h3 class="mb-4 text-2xl font-bold text-text-primary">
					Search from your terminal
				</h3>
				<p class="leading-relaxed text-text-secondary">
					Search your knowledge base, generate insights from sessions,
					and publish — all from your terminal alongside git. No
					context switching.
				</p>
			</div>
			<div use:inview={{ delay: 200 }}>
				<Terminal title="pulse — search" lines={cliLines} />
			</div>
		</div>

		<!-- ── 2. MCP — full-width before/after ── -->
		<div class="mb-24">
			<div class="mb-10 text-center" use:inview>
				<p
					class="mb-2 text-sm font-medium uppercase tracking-widest text-accent"
				>
					MCP
				</p>
				<h3 class="mb-3 text-2xl font-bold text-text-primary">
					Give your AI agents memory
				</h3>
				<p class="mx-auto max-w-2xl text-text-secondary">
					Every time your AI starts a new session, it starts from zero.
					With Pulse MCP, it starts from everything {audience === "developer"
						? "you've already figured out"
						: "your team has ever learned"}.
				</p>
			</div>
			<div class="grid gap-6 md:grid-cols-2">
				<div use:inview={{ delay: 150 }}>
					<p
						class="mb-3 text-center text-sm font-medium text-danger/80"
					>
						Without Pulse
					</p>
					<Terminal title="ai — session" lines={beforeLines} />
				</div>
				<div use:inview={{ delay: 350 }}>
					<p
						class="mb-3 text-center text-sm font-medium text-success/80"
					>
						With Pulse
					</p>
					<Terminal title="ai — with pulse" lines={afterLines} />
				</div>
			</div>
		</div>

		<!-- ── 3. VS Code — editor mockup left, text right ── -->
		<div
			class="mb-24 grid items-center gap-12 md:grid-cols-2 md:gap-16"
		>
			<div use:inview>
				<!-- VS Code editor mockup -->
				<div
					class="overflow-hidden rounded-xl border border-[#313244] bg-[#1e1e2e] shadow-2xl"
				>
					<!-- Tab bar -->
					<div class="flex items-center bg-[#181825]">
						<div
							class="flex items-center gap-1.5 border-b-2 border-accent bg-[#1e1e2e] px-4 py-2"
						>
							<FileCode size={13} class="text-[#89b4fa]" />
							<span class="text-xs text-[#cdd6f4]">auth.ts</span>
						</div>
						<div class="flex items-center gap-1.5 px-4 py-2">
							<span class="text-xs text-[#585b70]"
								>index.ts</span
							>
						</div>
					</div>

					<!-- Editor body -->
					<div class="flex">
						<!-- Activity bar (sidebar icons) -->
						<div
							class="flex w-10 shrink-0 flex-col items-center gap-3 border-r border-[#313244] bg-[#11111b] py-3"
						>
							<FileCode
								size={15}
								class="text-[#585b70]"
							/>
							<Search
								size={15}
								class="text-[#585b70]"
							/>
							<Zap
								size={15}
								class="text-accent"
							/>
						</div>

						<!-- Code area -->
						<div class="flex-1 p-4">
							<!-- CodeLens annotation -->
							<div
								class="mb-1 pl-8 text-[11px] text-accent/70"
							>
								⚡ 2 insights · 1 decision · 1
								pattern
							</div>

							<!-- Code with line numbers -->
							<div
								class="font-mono text-[12px] leading-[1.7]"
							>
								{#each editorCode as line}
									<div class="flex">
										<span
											class="w-8 shrink-0 select-none pr-3 text-right text-[11px] text-[#45475a]"
											>{line.n}</span
										>
										<span
											class="whitespace-pre"
											style="color:{tx}"
											>{#each line.tokens as tok}{#if tok.c}<span
														style="color:{tok.c}"
														>{tok.t}</span
													>{:else}{tok.t}{/if}{/each}</span
										>
									</div>
								{/each}
							</div>
						</div>
					</div>
				</div>
			</div>

			<div use:inview={{ delay: 200 }}>
				<p
					class="mb-2 text-sm font-medium uppercase tracking-widest text-accent"
				>
					VS Code
				</p>
				<h3 class="mb-4 text-2xl font-bold text-text-primary">
					Context where you code
				</h3>
				<p class="leading-relaxed text-text-secondary">
					CodeLens annotations show related insights per file. Sidebar
					panels for search, recent insights, and draft management —
					without leaving your editor.
				</p>
			</div>
		</div>

		<!-- ── 4. Dashboard — text left, mockup right ── -->
		<div
			class="grid items-center gap-12 md:grid-cols-2 md:gap-16"
		>
			<div use:inview>
				<p
					class="mb-2 text-sm font-medium uppercase tracking-widest text-accent"
				>
					Dashboard
				</p>
				<h3 class="mb-4 text-2xl font-bold text-text-primary">
					The full picture
				</h3>
				<p class="leading-relaxed text-text-secondary">
					Search, filter by kind and repo, browse {audience === "developer"
						? "your entire"
						: "your team's entire"} knowledge base. Full insight detail
					with structured data, alternatives, and source references.
				</p>
			</div>

			<div class="animate-float" use:inview={{ delay: 200 }}>
				<!-- Dashboard mockup -->
				<div
					class="overflow-hidden rounded-xl border border-border/50 bg-[#0c0c0e] shadow-2xl"
				>
					<!-- App bar -->
					<div
						class="flex items-center gap-2.5 border-b border-border/30 px-4 py-2.5"
					>
						<span
							class="relative flex h-4 w-4 items-center justify-center"
						>
							<span
								class="h-1.5 w-1.5 rounded-full bg-accent"
							></span>
						</span>
						<span
							class="text-sm font-medium text-text-primary"
							>Pulse</span
						>
						<div
							class="ml-auto flex items-center gap-1.5 rounded-lg border border-border/30 bg-bg-hover/50 px-2.5 py-1"
						>
							<Search
								size={11}
								class="text-text-secondary/50"
							/>
							<span
								class="text-[11px] text-text-secondary/50"
								>Search insights...</span
							>
						</div>
					</div>

					<!-- Content -->
					<div class="p-4">
						<!-- Filter chips -->
						<div class="mb-3 flex gap-2">
							<span
								class="rounded-full bg-accent/10 px-2.5 py-0.5 text-[10px] font-medium text-accent"
								>All kinds</span
							>
							<span
								class="rounded-full bg-bg-hover px-2.5 py-0.5 text-[10px] text-text-secondary/60"
								>Last 30 days</span
							>
							<span
								class="rounded-full bg-bg-hover px-2.5 py-0.5 text-[10px] text-text-secondary/60"
								>glieai/pulse</span
							>
						</div>

						<!-- Insight cards -->
						<div class="space-y-2.5">
							{#each dashboardInsights as insight}
								<div
									class="rounded-lg border border-border/20 p-3"
								>
									<div
										class="mb-1.5 flex items-center gap-2"
									>
										<span
											class="rounded px-1.5 py-0.5 text-[10px] font-medium {insight.kindCls}"
											>{insight.kind}</span
										>
										<span
											class="text-[10px] text-text-secondary/50"
											>{insight.time}</span
										>
									</div>
									<p
										class="text-xs font-medium text-text-primary"
									>
										{insight.title}
									</p>
									<p
										class="mt-1 text-[11px] leading-snug text-text-secondary/60"
									>
										{insight.desc}
									</p>
								</div>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
