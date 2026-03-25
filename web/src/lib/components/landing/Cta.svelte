<script lang="ts">
	import { ArrowRight } from "lucide-svelte";
	import { inview } from "./inview";

	type Audience = "developer" | "team";
	let { audience = "developer" }: { audience?: Audience } = $props();

	const headline = $derived(
		audience === "developer"
			? "Stop losing what\nyou learn"
			: "Stop losing what\nyour team learns",
	);
	const subtitle = $derived(
		audience === "developer"
			? "Install Pulse and capture knowledge from your very next coding session."
			: "Start capturing knowledge from your very next coding session.",
	);
	const ctaLabel = $derived(
		audience === "developer" ? "Install Free" : "Get Started",
	);
	const ctaHref = $derived(
		audience === "developer" ? "#install" : "/register",
	);
	const footerTagline = $derived(
		audience === "developer"
			? "Pulse — Operational memory for developers"
			: "Pulse — Operational memory for development teams",
	);
</script>

<!-- CTA -->
<section class="relative overflow-hidden px-6 py-24 md:py-32">
	<!-- Heartbeat line background -->
	<div
		class="pointer-events-none absolute inset-0 flex items-center overflow-hidden opacity-[0.06]"
	>
		<svg class="w-full" viewBox="0 0 1200 100" fill="none">
			<path
				d="M0,50 H450 L462,44 L475,50 H490 L498,12 L506,88 L514,5 L522,50 H535 L547,41 L560,50 H1200"
				stroke="var(--accent)"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	</div>

	<div class="relative z-10 mx-auto max-w-2xl text-center" use:inview>
		<h2 class="text-3xl font-bold text-text-primary sm:text-4xl md:text-5xl">
			{headline}
		</h2>
		<p class="mx-auto mt-6 max-w-lg text-lg text-text-secondary">
			{subtitle}
		</p>
		<div class="mt-10">
			<a
				href={ctaHref}
				class="group inline-flex items-center gap-2 rounded-lg bg-accent px-8 py-3.5 text-sm font-medium text-white transition hover:bg-accent-hover"
			>
				{ctaLabel}
				<ArrowRight
					size={16}
					class="transition-transform group-hover:translate-x-0.5"
				/>
			</a>
		</div>
		<p class="mt-4 text-sm text-text-secondary">
			{#if audience === "developer"}
				Building with a team? <a
					href="/pricing"
					class="text-accent transition hover:text-accent-hover"
					>See Teams plan</a
				>
			{:else}
				Want to try solo first? <a
					href="#install"
					class="text-accent transition hover:text-accent-hover"
					>Install Free</a
				>
			{/if}
		</p>
	</div>
</section>

<!-- Footer -->
<footer class="border-t border-border/30 px-6 py-8">
	<div
		class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row"
	>
		<div class="flex items-center gap-2.5">
			<span class="relative flex h-4 w-4 items-center justify-center">
				<span
					class="pulse-ring absolute h-2.5 w-2.5 rounded-full bg-accent/25"
				></span>
				<span class="relative h-1.5 w-1.5 rounded-full bg-accent"></span>
			</span>
			<span class="text-sm text-text-secondary">
				{footerTagline}
			</span>
		</div>
		<div class="flex items-center gap-4">
			<a
				href="/pricing"
				class="text-sm text-text-secondary transition hover:text-text-primary"
			>
				Pricing
			</a>
			<a
				href="https://github.com/glieai/pulse"
				class="text-sm text-text-secondary transition hover:text-text-primary"
			>
				GitHub
			</a>
			<a
				href="/login"
				class="text-sm text-text-secondary transition hover:text-text-primary"
			>
				Sign In
			</a>
		</div>
	</div>
</footer>
