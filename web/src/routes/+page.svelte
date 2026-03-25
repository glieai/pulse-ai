<script lang="ts">
	import { onMount } from "svelte";
	import { page } from "$app/stores";
	import Nav from "$lib/components/landing/Nav.svelte";
	import Hero from "$lib/components/landing/Hero.svelte";
	import DemoFlow from "$lib/components/landing/DemoFlow.svelte";
	import Showcase from "$lib/components/landing/Showcase.svelte";
	import Benefits from "$lib/components/landing/Benefits.svelte";
	import Privacy from "$lib/components/landing/Privacy.svelte";
	import Cta from "$lib/components/landing/Cta.svelte";
	import { inview } from "$lib/components/landing/inview";

	type Audience = "developer" | "team";

	/* Audience state — default developer, URL param override */
	const urlAudience = $page.url.searchParams.get("audience");
	let audience = $state<Audience>(
		urlAudience === "team" ? "team" : "developer",
	);

	const title = $derived(
		audience === "developer"
			? "Pulse — Operational Memory for Developers"
			: "Pulse — Operational Memory for Development Teams",
	);

	const description = $derived(
		audience === "developer"
			? "Free, self-hosted knowledge base that fills itself. Capture decisions, dead-ends, and patterns from every AI coding session."
			: "The knowledge base that fills itself. Capture decisions, dead-ends, and patterns from every AI coding session for your entire team.",
	);

	onMount(() => {
		document.documentElement.setAttribute("data-theme", "dark");
		return () => {
			const saved = localStorage.getItem("pulse-theme");
			if (saved === "dark" || saved === "light") {
				document.documentElement.setAttribute("data-theme", saved);
			} else {
				document.documentElement.removeAttribute("data-theme");
			}
		};
	});
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
</svelte:head>

<div
	class="min-h-screen bg-bg-base text-text-primary"
	style="--bg-base:#0a0a0c; --bg-card:#111114; --bg-hover:#191920; --border:#232329; --text-primary:#ebebef; --text-secondary:#8b8b94; --accent:#0891b2; --accent-hover:#06b6d4; --success:#22c55e; --warning:#eab308; --danger:#ef4444"
>
	<Nav {audience} onToggle={(a) => (audience = a)} />
	<Hero {audience} />

	<!-- Divider — heartbeat line + quote -->
	<div class="px-6 py-16 md:py-20" use:inview>
		<div class="mx-auto max-w-3xl">
			<div class="mb-8 flex justify-center">
				<svg
					class="h-6 w-48 text-accent/20"
					viewBox="0 0 200 24"
					fill="none"
				>
					<path
						d="M0,12 H70 L78,12 L85,4 L92,20 L99,2 L106,12 H120 L128,8 L136,12 H200"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</div>
			<p
				class="text-center text-2xl font-medium text-text-secondary md:text-3xl"
			>
				Your codebase tells the <span
					class="font-semibold text-text-primary">what</span
				>.<br />
				Pulse remembers the <span class="font-semibold text-accent"
					>why</span
				>.
			</p>
		</div>
	</div>

	<DemoFlow {audience} />
	<Showcase {audience} />
	<Benefits {audience} />
	<Privacy {audience} />
	<Cta {audience} />
</div>
