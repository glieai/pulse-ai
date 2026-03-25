<script lang="ts">
	type Audience = "developer" | "team";

	let {
		audience = "developer",
		onToggle,
	}: {
		audience?: Audience;
		onToggle?: (a: Audience) => void;
	} = $props();

	let scrolled = $state(false);

	function handleScroll() {
		scrolled = window.scrollY > 50;
	}

	const ctaLabel = $derived(
		audience === "developer" ? "Install Free" : "Get Started",
	);
	const ctaHref = $derived(
		audience === "developer" ? "#install" : "/register",
	);
</script>

<svelte:window onscroll={handleScroll} />

<header
	class="fixed inset-x-0 top-0 z-50 transition-all duration-300 {scrolled
		? 'border-b border-border/50 bg-bg-base/80 backdrop-blur-xl'
		: ''}"
>
	<div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
		<a href="/" class="flex items-center gap-2.5">
			<img src="/logo-white.png" alt="Pulse" class="h-6 w-6" />
			<span class="text-lg font-semibold text-text-primary">Pulse</span>
		</a>

		<nav class="hidden items-center gap-1 md:flex">
			<button
				type="button"
				onclick={() => onToggle?.("developer")}
				class="rounded-lg px-3 py-1.5 text-sm transition-all duration-200 {audience ===
				'developer'
					? 'bg-bg-hover text-text-primary font-medium'
					: 'text-text-secondary hover:text-text-primary'}"
			>
				For Developers
			</button>
			<button
				type="button"
				onclick={() => onToggle?.("team")}
				class="rounded-lg px-3 py-1.5 text-sm transition-all duration-200 {audience ===
				'team'
					? 'bg-bg-hover text-text-primary font-medium'
					: 'text-text-secondary hover:text-text-primary'}"
			>
				For Teams
			</button>
			<a
				href="/pricing"
				class="rounded-lg px-3 py-1.5 text-sm text-text-secondary transition hover:text-text-primary"
			>
				Pricing
			</a>
		</nav>

		<div class="flex items-center gap-4">
			<a
				href={ctaHref}
				class="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover"
			>
				{ctaLabel}
			</a>
		</div>
	</div>
</header>
