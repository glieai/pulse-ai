<script lang="ts">
	import { onMount } from "svelte";
	import { FileCode, Search, Zap } from "lucide-svelte";

	type Audience = "developer" | "team";
	let { audience = "developer" }: { audience?: Audience } = $props();

	const subtitle = $derived(
		audience === "developer"
			? "From coding session to searchable knowledge — automatically"
			: "From coding session to shared knowledge — automatically",
	);

	type Tab = "cli" | "vscode";

	/* ── State ────────────────────────────────────────── */
	let activeTab = $state<Tab>("cli");
	let phase = $state(-1);
	let insightStage = $state(0);
	let approved = $state(false);
	let btnClicking = $state(false);
	let dashReady = $state(false);
	let sectionEl: HTMLElement;
	let ctrl: AbortController | null = null;

	/* CLI */
	let cliTyped = $state(0);
	let cliLines = $state(0);
	let cliToast = $state(false);

	/* VS Code */
	let vsLines = $state(0);
	let vsLens = $state(false);
	let vsBadge = $state(false);

	/* ── Constants ────────────────────────────────────── */
	const tabDefs: { id: Tab; label: string }[] = [
		{ id: "cli", label: "Terminal" },
		{ id: "vscode", label: "VS Code" },
	];

	const cliCmd = "pulse watch --session";
	const cliSessionLines = [
		{ text: "\u25c9 Watching session\u2026", color: "#22c55e" },
		{ text: "\u25b8 Decision: JWT over session tokens", color: "#06b6d4" },
		{ text: "\u25b8 Pattern: content_hash for dedup", color: "#22c55e" },
		{ text: "\u25b8 Dead-end: ORM approach abandoned", color: "#ef4444" },
		{ text: "\u26a1 Threshold reached \u2014 generating\u2026", color: "#eab308" },
	];

	const vsTokens: { t: string; c: string }[][] = [
		[
			{ t: "import", c: "#cba6f7" },
			{ t: " { Hono } ", c: "#a6adc8" },
			{ t: "from", c: "#cba6f7" },
			{ t: ' "hono"', c: "#a6e3a1" },
		],
		[
			{ t: "import", c: "#cba6f7" },
			{ t: " { jwt } ", c: "#a6adc8" },
			{ t: "from", c: "#cba6f7" },
			{ t: ' "hono/jwt"', c: "#a6e3a1" },
		],
		[],
		[{ t: "// Decision: JWT over session tokens", c: "#6c7086" }],
		[
			{ t: "export ", c: "#cba6f7" },
			{ t: "function ", c: "#cba6f7" },
			{ t: "authGuard", c: "#89b4fa" },
			{ t: "(secret: ", c: "#a6adc8" },
			{ t: "string", c: "#89dceb" },
			{ t: ") {", c: "#a6adc8" },
		],
		[
			{ t: "  return ", c: "#cba6f7" },
			{ t: "jwt", c: "#89b4fa" },
			{ t: "({", c: "#a6adc8" },
		],
		[{ t: "    secret,", c: "#a6adc8" }],
		[
			{ t: "    algorithm", c: "#a6adc8" },
			{ t: ': "HS256"', c: "#a6e3a1" },
		],
		[{ t: "  })", c: "#a6adc8" }],
		[{ t: "}", c: "#a6adc8" }],
	];

	const steps = $derived(
		activeTab === "cli"
			? ["Watch", "Detect", "Generate", "Review", "Ship"]
			: ["Code", "Detect", "Generate", "Review", "Ship"],
	);

	/* ── Engine ───────────────────────────────────────── */
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

	function resetAll() {
		phase = -1;
		insightStage = 0;
		approved = false;
		btnClicking = false;
		dashReady = false;
		cliTyped = 0;
		cliLines = 0;
		cliToast = false;
		vsLines = 0;
		vsLens = false;
		vsBadge = false;
	}

	/* ── Phase runners ────────────────────────────────── */
	async function cliIntro(s: AbortSignal) {
		for (let i = 1; i <= cliCmd.length; i++) {
			cliTyped = i;
			await wait(50, s);
		}
		await wait(500, s);

		for (let i = 1; i <= cliSessionLines.length; i++) {
			cliLines = i;
			await wait(600, s);
		}
		await wait(800, s);

		phase = 1;
		cliToast = true;
		await wait(2500, s);
	}

	async function vscodeIntro(s: AbortSignal) {
		for (let i = 1; i <= vsTokens.length; i++) {
			vsLines = i;
			await wait(250, s);
		}
		await wait(600, s);

		phase = 1;
		vsLens = true;
		await wait(800, s);
		vsBadge = true;
		await wait(2000, s);
	}

	async function sharedPhases(s: AbortSignal) {
		/* Phase 2 \u2014 Generate */
		phase = 2;
		cliToast = false;
		for (let i = 1; i <= 4; i++) {
			insightStage = i;
			await wait(400, s);
		}
		await wait(1500, s);

		/* Phase 3 \u2014 Review */
		phase = 3;
		await wait(1200, s);
		btnClicking = true;
		await wait(300, s);
		btnClicking = false;
		approved = true;
		await wait(2000, s);

		/* Phase 4 \u2014 Ship */
		phase = 4;
		await wait(400, s);
		dashReady = true;
		await wait(3500, s);
	}

	/* ── Main loop (auto-cycles between tabs) ─────────── */
	async function runLoop(signal: AbortSignal, start: Tab = "cli") {
		try {
			if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
				activeTab = start;
				phase = 4;
				dashReady = true;
				return;
			}

			const order: Tab[] = ["cli", "vscode"];
			let idx = order.indexOf(start);

			while (!signal.aborted) {
				activeTab = order[idx];
				resetAll();
				await wait(500, signal);
				phase = 0;

				if (activeTab === "cli") await cliIntro(signal);
				else await vscodeIntro(signal);

				await sharedPhases(signal);
				await wait(2000, signal);
				idx = (idx + 1) % order.length;
			}
		} catch (e) {
			if (e instanceof DOMException && e.name === "AbortError") return;
			throw e;
		}
	}

	function switchTab(tab: Tab) {
		if (ctrl) ctrl.abort();
		ctrl = new AbortController();
		runLoop(ctrl.signal, tab);
	}

	onMount(() => {
		ctrl = new AbortController();
		const obs = new IntersectionObserver(
			([e]) => {
				if (e.isIntersecting && phase === -1) runLoop(ctrl!.signal);
			},
			{ threshold: 0.15 },
		);
		obs.observe(sectionEl);
		return () => {
			if (ctrl) ctrl.abort();
			obs.disconnect();
		};
	});
</script>

<section bind:this={sectionEl} class="px-6 py-20 md:py-28">
	<div class="mx-auto max-w-4xl">
		<!-- Header -->
		<div class="mb-8 text-center">
			<h2 class="text-3xl font-bold text-text-primary md:text-4xl">
				See it in action
			</h2>
			<p class="mt-3 text-lg text-text-secondary">
				{subtitle}
			</p>
		</div>

		<!-- Tabs -->
		<div class="mb-6 flex justify-center gap-1">
			{#each tabDefs as tab}
				<button
					class="rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 {activeTab ===
					tab.id
						? 'bg-[var(--bg-hover)] text-text-primary'
						: 'text-text-secondary hover:text-text-primary'}"
					onclick={() => switchTab(tab.id)}
				>
					{tab.label}
				</button>
			{/each}
		</div>

		<!-- Viewport -->
		<div
			class="relative overflow-hidden rounded-xl border border-[var(--border)] bg-[#0c0c0f]"
		>
			<!-- Title bar -->
			<div
				class="flex items-center gap-1.5 border-b border-[var(--border)] px-4 py-3"
			>
				<span class="h-3 w-3 rounded-full bg-[#ff5f57]"></span>
				<span class="h-3 w-3 rounded-full bg-[#febc2e]"></span>
				<span class="h-3 w-3 rounded-full bg-[#28c840]"></span>
				<span class="ml-3 text-xs text-text-secondary">
					{#if phase >= 0 && phase <= 1}
						{activeTab === "cli"
							? "Terminal"
							: "Visual Studio Code"}
					{:else if phase >= 2 && phase <= 3}
						Pulse &mdash; Review
					{:else if phase === 4}
						Pulse &mdash; Dashboard
					{/if}
				</span>
			</div>

			<!-- Content -->
			<div class="relative" style="min-height: 360px;">
				<!-- ─── CLI: Terminal (phases 0-1) ─── -->
				<div
					class="absolute inset-0 p-5 font-mono text-sm leading-relaxed transition-all duration-500"
					style="opacity: {activeTab === 'cli' &&
					phase >= 0 &&
					phase <= 1
						? 1
						: 0}; transform: translateY({activeTab === 'cli' &&
					phase >= 0 &&
					phase <= 1
						? 0
						: -12}px); pointer-events: {activeTab === 'cli' &&
					phase >= 0 &&
					phase <= 1
						? 'auto'
						: 'none'};"
				>
					<div class="flex">
						<span class="text-text-secondary">$&nbsp;</span>
						<span class="text-text-primary"
							>{cliCmd.slice(0, cliTyped)}</span
						>
						{#if phase === 0 && cliTyped < cliCmd.length}
							<span
								class="ml-px inline-block h-4 w-1.5 translate-y-0.5 animate-blink bg-accent"
							></span>
						{/if}
					</div>

					{#if cliTyped >= cliCmd.length}
						<div class="mt-4 space-y-1.5">
							{#each cliSessionLines as line, i}
								{#if i < cliLines}
									<div style="color: {line.color};">
										{line.text}
									</div>
								{/if}
							{/each}
						</div>
					{/if}

					{#if cliToast}
						<div
							class="animate-slide-down absolute right-5 top-4 rounded-lg border border-accent/30 bg-accent/10 px-4 py-3 shadow-lg shadow-accent/5"
						>
							<div
								class="flex items-center gap-2 text-sm font-medium text-accent"
							>
								<span class="text-base">&#9889;</span>
								3 insights detected
							</div>
							<div class="mt-1 text-xs text-text-secondary">
								Ready for review
							</div>
						</div>
					{/if}
				</div>

				<!-- ─── VS Code: Editor (phases 0-1) ─── -->
				<div
					class="absolute inset-0 flex transition-all duration-500"
					style="opacity: {activeTab === 'vscode' &&
					phase >= 0 &&
					phase <= 1
						? 1
						: 0}; transform: translateY({activeTab === 'vscode' &&
					phase >= 0 &&
					phase <= 1
						? 0
						: 12}px); pointer-events: {activeTab === 'vscode' &&
					phase >= 0 &&
					phase <= 1
						? 'auto'
						: 'none'};"
				>
					<!-- Activity bar -->
					<div
						class="flex w-10 shrink-0 flex-col items-center gap-4 border-r border-[#313244] bg-[#181825] pt-3"
					>
						<FileCode size={16} color="#6c7086" />
						<Search size={16} color="#6c7086" />
						<div class="relative">
							<Zap size={16} color="#cba6f7" />
							{#if vsBadge}
								<div
									class="absolute -right-0.5 -top-0.5 h-2 w-2 animate-slide-down rounded-full bg-accent"
								></div>
							{/if}
						</div>
					</div>

					<!-- Editor area -->
					<div class="flex-1 overflow-hidden bg-[#1e1e2e]">
						<!-- Tab bar -->
						<div
							class="flex border-b border-[#313244] bg-[#181825]"
						>
							<div
								class="flex items-center gap-1.5 border-b-2 border-[#cba6f7] bg-[#1e1e2e] px-3 py-1.5 text-[11px] text-[#cdd6f4]"
							>
								<FileCode size={12} color="#cdd6f4" />
								auth.ts
							</div>
							<div
								class="px-3 py-1.5 text-[11px] text-[#6c7086]"
							>
								index.ts
							</div>
						</div>

						<!-- Code -->
						<div class="p-4">
							{#if vsLens}
								<div
									class="mb-3 animate-slide-down text-[10px] text-[#cba6f7]/70"
								>
									&#9889; Pulse &middot; 1 decision &mdash;
									JWT authentication over session tokens
								</div>
							{/if}

							<div
								class="space-y-0.5 font-mono text-[11px] leading-[18px]"
							>
								{#each vsTokens as tokens, i}
									{#if i < vsLines}
										<div class="flex">
											<span
												class="mr-4 w-4 select-none text-right text-[#45475a]"
												>{i + 1}</span
											>
											{#if tokens.length > 0}
												{#each tokens as tok}
													<span
														style="color: {tok.c}"
														>{tok.t}</span
													>
												{/each}
											{:else}
												<span>&nbsp;</span>
											{/if}
										</div>
									{/if}
								{/each}
							</div>
						</div>
					</div>
				</div>

				<!-- ─── Shared: Insight card (phases 2-3) ─── -->
				<div
					class="absolute inset-0 flex items-center justify-center p-5 transition-all duration-500"
					style="opacity: {phase >= 2 && phase <= 3
						? 1
						: 0}; transform: scale({phase >= 2 && phase <= 3
						? 1
						: 0.95}); pointer-events: {phase >= 2 && phase <= 3
						? 'auto'
						: 'none'};"
				>
					<div
						class="w-full max-w-md rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-6"
					>
						{#if insightStage >= 1}
							<span
								class="inline-block rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-medium text-accent"
							>
								decision
							</span>
						{/if}

						{#if insightStage >= 2}
							<h3
								class="mt-3 text-lg font-semibold text-text-primary"
							>
								JWT authentication over session tokens
							</h3>
						{/if}

						{#if insightStage >= 3}
							<p
								class="mt-2 text-sm leading-relaxed text-text-secondary"
							>
								Chose JWT with HS256 for stateless auth. Session
								tokens would require Redis for token storage,
								adding infrastructure complexity.
							</p>
						{/if}

						{#if insightStage >= 4}
							<div
								class="mt-3 flex items-center gap-2 text-xs text-text-secondary"
							>
								<span>glieai/pulse</span>
								<span>&middot;</span>
								<span class="text-red-400/70"
									>Rejected: Session tokens (requires
									Redis)</span
								>
							</div>

							{#if phase >= 3}
								<div class="mt-5 flex items-center gap-3">
									<button
										class="rounded-md border border-[var(--border)] px-4 py-1.5 text-xs text-text-secondary transition-colors hover:bg-[var(--bg-hover)]"
									>
										Dismiss
									</button>
									<button
										class="rounded-md px-4 py-1.5 text-xs font-medium transition-all duration-200 {approved
											? 'bg-green-500/20 text-green-400'
											: 'bg-accent text-white'}"
										style="transform: scale({btnClicking
											? 0.9
											: 1});"
									>
										{approved
											? "\u2713 Approved"
											: "Approve"}
									</button>
								</div>
							{/if}
						{/if}
					</div>
				</div>

				<!-- ─── Shared: Dashboard (phase 4) ─── -->
				<div
					class="absolute inset-0 p-5 transition-all duration-500"
					style="opacity: {phase === 4
						? 1
						: 0}; transform: translateY({phase === 4
						? 0
						: 12}px); pointer-events: {phase === 4
						? 'auto'
						: 'none'};"
				>
					<!-- App bar -->
					<div class="mb-4 flex items-center gap-3">
						<div class="flex items-center gap-2">
							<div
								class="h-2.5 w-2.5 rounded-full bg-accent"
							></div>
							<span
								class="text-sm font-semibold text-text-primary"
								>Pulse</span
							>
						</div>
						<div
							class="ml-auto rounded-md border border-[var(--border)] bg-[var(--bg-hover)] px-3 py-1 text-xs text-text-secondary"
						>
							Search knowledge base&hellip;
						</div>
					</div>

					<div class="space-y-2.5">
						<!-- New insight -->
						<div
							class="rounded-lg border border-accent/30 bg-accent/5 p-3.5 transition-all duration-500"
							style="opacity: {dashReady
								? 1
								: 0}; transform: translateY({dashReady
								? 0
								: -8}px);"
						>
							<div class="flex items-center gap-2">
								<span
									class="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-medium text-accent"
									>decision</span
								>
								<span class="text-[10px] text-green-400"
									>&#10003; Just published</span
								>
							</div>
							<p
								class="mt-1.5 text-sm font-medium text-text-primary"
							>
								JWT authentication over session tokens
							</p>
							<p class="mt-0.5 text-xs text-text-secondary">
								2 min ago &middot; glieai/pulse
							</p>
						</div>

						<!-- Existing -->
						<div
							class="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-3.5"
						>
							<span
								class="rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] font-medium text-green-400"
								>pattern</span
							>
							<p
								class="mt-1.5 text-sm font-medium text-text-primary"
							>
								Content hash dedup for idempotent ingest
							</p>
							<p class="mt-0.5 text-xs text-text-secondary">
								1 hour ago &middot; glieai/pulse
							</p>
						</div>

						<div
							class="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-3.5"
						>
							<span
								class="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-medium text-red-400"
								>dead_end</span
							>
							<p
								class="mt-1.5 text-sm font-medium text-text-primary"
							>
								ORM approach abandoned for SQL purity
							</p>
							<p class="mt-0.5 text-xs text-text-secondary">
								2 hours ago &middot; glieai/pulse
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Progress -->
		<div class="mt-8 flex items-center justify-center gap-2">
			{#each steps as label, i}
				<div class="flex items-center gap-1.5">
					<div
						class="h-2 w-2 rounded-full transition-all duration-300 {phase >= i
							? 'bg-accent'
							: 'bg-[var(--border)]'}"
						style={phase >= i ? "transform: scale(1.15);" : ""}
					></div>
					<span
						class="text-xs transition-colors duration-300 {phase >=
						i
							? 'text-accent'
							: 'text-text-secondary'}">{label}</span
					>
				</div>
				{#if i < steps.length - 1}
					<div
						class="h-px w-6 transition-colors duration-500 {phase >
						i
							? 'bg-accent/50'
							: 'bg-[var(--border)]'}"
					></div>
				{/if}
			{/each}
		</div>
	</div>
</section>
