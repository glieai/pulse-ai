<script lang="ts">
	import { onMount } from "svelte";
	import { fade } from "svelte/transition";
	import { ArrowRight, TerminalSquare, Code, Blocks } from "lucide-svelte";
	import { inview } from "./inview";

	type Audience = "developer" | "team";
	let { audience = "developer" }: { audience?: Audience } = $props();

	const eyebrow = $derived(
		audience === "developer"
			? "Operational memory for developers"
			: "Operational memory for development teams",
	);
	const headline = $derived(
		audience === "developer"
			? "Your best decisions shouldn't die in a chat window"
			: "Your team's best decisions shouldn't die in a chat window",
	);
	const subheadline = $derived(
		audience === "developer"
			? "Pulse captures the decisions, dead-ends, and patterns from every AI coding session. Searchable by you and your AI agents. Free and self-hosted."
			: "Pulse captures the decisions, dead-ends, and patterns from every AI coding session. A shared knowledge base searchable by your team and AI agents alike.",
	);
	const ctaLabel = $derived(
		audience === "developer" ? "Install Free" : "Get Started",
	);
	const ctaHref = $derived(
		audience === "developer" ? "#install" : "/register",
	);

	/* ── Rotating demos ──────────────────────────────── */
	type Demo = {
		cmd: string;
		title: string;
		lines: { text: string; cls: string }[];
	};

	const demos: Demo[] = [
		{
			cmd: 'pulse search "auth strategy"',
			title: "pulse \u2014 search",
			lines: [
				{ text: "\u26a1 3 results", cls: "text-accent" },
				{ text: "\u00a0", cls: "" },
				{
					text: "  decision \u2014 JWT with httpOnly cookies over session auth",
					cls: "text-accent",
				},
				{
					text: "  dead_end \u2014 OAuth2 PKCE for internal APIs",
					cls: "text-danger",
				},
				{
					text: "  pattern  \u2014 Token rotation via short-lived JWTs",
					cls: "text-success",
				},
			],
		},
		{
			cmd: "pulse watch",
			title: "pulse \u2014 watch",
			lines: [
				{
					text: "\u25c9 Watching session\u2026",
					cls: "text-success",
				},
				{ text: "\u00a0", cls: "" },
				{
					text: "\u25b8 Decision: JWT over session tokens",
					cls: "text-accent",
				},
				{
					text: "\u25b8 Pattern: content_hash for dedup",
					cls: "text-success",
				},
				{
					text: "\u25b8 Dead-end: ORM approach abandoned",
					cls: "text-danger",
				},
				{ text: "\u00a0", cls: "" },
				{
					text: "\u26a1 3 insights \u2192 ready for review",
					cls: "text-warning",
				},
			],
		},
		{
			cmd: "pulse generate --from-commit HEAD~3..HEAD",
			title: "pulse \u2014 generate",
			lines: [
				{
					text: "Analyzing 3 commits\u2026",
					cls: "text-text-secondary/70",
				},
				{ text: "\u00a0", cls: "" },
				{
					text: "\u26a1 Generated 2 insights:",
					cls: "text-accent",
				},
				{
					text: "  decision \u2014 RRF fusion for hybrid search",
					cls: "text-accent",
				},
				{
					text: "  pattern  \u2014 Numbered SQL migrations",
					cls: "text-success",
				},
				{ text: "\u00a0", cls: "" },
				{
					text: "Published to knowledge base \u2713",
					cls: "text-success",
				},
			],
		},
	];

	const tools = [
		{ icon: TerminalSquare, name: "Claude Code" },
		{ icon: TerminalSquare, name: "Codex" },
		{ icon: Code, name: "VS Code" },
		{ icon: Blocks, name: "Any MCP agent" },
	];

	/* ── Animation state ─────────────────────────────── */
	let idx = $state(0);
	let typedChars = $state(0);
	let visibleLines = $state(0);
	let cursorVisible = $state(true);

	function wait(ms: number, signal: AbortSignal): Promise<void> {
		return new Promise((resolve, reject) => {
			if (signal.aborted) {
				reject(new DOMException("Aborted", "AbortError"));
				return;
			}
			const t = setTimeout(resolve, ms);
			signal.addEventListener(
				"abort",
				() => {
					clearTimeout(t);
					reject(new DOMException("Aborted", "AbortError"));
				},
				{ once: true },
			);
		});
	}

	async function runLoop(signal: AbortSignal) {
		try {
			if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
				idx = 0;
				typedChars = demos[0].cmd.length;
				visibleLines = demos[0].lines.length;
				cursorVisible = false;
				return;
			}

			let i = 0;
			while (!signal.aborted) {
				idx = i % demos.length;
				const demo = demos[idx];
				typedChars = 0;
				visibleLines = 0;
				cursorVisible = true;

				await wait(i === 0 ? 500 : 300, signal);

				/* Type command */
				for (let c = 1; c <= demo.cmd.length; c++) {
					typedChars = c;
					await wait(40, signal);
				}
				await wait(600, signal);

				/* Show results line by line */
				for (let l = 1; l <= demo.lines.length; l++) {
					visibleLines = l;
					await wait(100, signal);
				}
				cursorVisible = false;

				/* Pause to read */
				await wait(4000, signal);
				i++;
			}
		} catch (e) {
			if (e instanceof DOMException && e.name === "AbortError") return;
			throw e;
		}
	}

	onMount(() => {
		const ctrl = new AbortController();
		runLoop(ctrl.signal);
		return () => ctrl.abort();
	});
</script>

<section
	class="relative min-h-screen overflow-hidden px-6 pt-32 pb-20 md:pt-40"
>
	<!-- Heartbeat line -->
	<div
		class="pointer-events-none absolute inset-0 flex items-center overflow-hidden opacity-[0.08]"
	>
		<svg class="w-full" viewBox="0 0 1200 100" fill="none">
			<path
				class="pulse-line-path"
				d="M0,50 H350 L362,44 L375,50 H390 L398,12 L406,88 L414,5 L422,50 H435 L447,41 L460,50 H650 L662,44 L675,50 H690 L698,12 L706,88 L714,5 L722,50 H735 L747,41 L760,50 H1200"
				stroke="var(--accent)"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	</div>

	<div class="relative z-10 mx-auto w-full max-w-6xl">
		<div class="grid items-center gap-12 md:grid-cols-2 md:gap-16">
			<!-- Left: Copy -->
			<div use:inview>
				{#key audience}
					<div in:fade={{ duration: 150 }}>
						<p
							class="mb-5 text-sm font-medium uppercase tracking-widest text-accent"
						>
							{eyebrow}
						</p>

						<h1
							class="text-4xl font-bold leading-[1.1] tracking-tight text-text-primary sm:text-5xl lg:text-6xl"
						>
							{headline}
						</h1>

						<p
							class="mt-6 max-w-md text-lg leading-relaxed text-text-secondary"
						>
							{subheadline}
						</p>

						<div class="mt-8 flex items-center gap-4">
							<a
								href={ctaHref}
								class="group flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover"
							>
								{ctaLabel}
								<ArrowRight
									size={15}
									class="transition-transform group-hover:translate-x-0.5"
								/>
							</a>
							<a
								href="#showcase"
								class="text-sm text-text-secondary transition hover:text-text-primary"
							>
								See how it works
							</a>
						</div>
					</div>
				{/key}
			</div>

			<!-- Right: Rotating terminal -->
			<div class="animate-float">
				<div
					class="overflow-hidden rounded-xl border border-border/50 bg-[#0c0c0e] shadow-2xl"
				>
					<div
						class="flex items-center gap-2 border-b border-border/30 px-4 py-3"
					>
						<span class="h-2.5 w-2.5 rounded-full bg-[#ff5f57]"
						></span>
						<span class="h-2.5 w-2.5 rounded-full bg-[#febc2e]"
						></span>
						<span class="h-2.5 w-2.5 rounded-full bg-[#28c840]"
						></span>
						<span class="ml-2 text-xs text-text-secondary/40"
							>{demos[idx].title}</span
						>
					</div>
					<div
						class="p-5 font-mono text-[13px] leading-relaxed"
						style="min-height: 260px"
					>
						<!-- Command with typing cursor -->
						<div class="text-text-primary">
							<span class="text-text-secondary/70">$&nbsp;</span
							>{demos[idx].cmd.slice(0, typedChars)}{#if cursorVisible}<span
									class="animate-blink text-accent"
									>&#9612;</span
								>{/if}
						</div>

						<!-- Results appear line by line -->
						{#each demos[idx].lines.slice(0, visibleLines) as line}
							<div
								class={line.cls ||
									"text-text-secondary/70"}
							>
								{line.text}
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>

		<!-- Works with -->
		<div
			class="mt-20 flex flex-col items-center gap-4 border-t border-border/20 pt-8 md:flex-row md:justify-center md:gap-6"
			use:inview
		>
			<span
				class="text-xs font-medium uppercase tracking-widest text-text-secondary/40"
				>Works with</span
			>
			<div
				class="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-text-secondary/60"
			>
				{#each tools as tool, i}
					{#if i > 0}
						<span class="hidden text-border/40 md:inline"
							>&middot;</span
						>
					{/if}
					<div class="flex items-center gap-2">
						<tool.icon size={14} />
						<span>{tool.name}</span>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>
