<script lang="ts">
	import { Search } from "lucide-svelte";

	let {
		icon: Icon = Search,
		headline = "Nothing found",
		description = "",
		actionHref = "",
		actionLabel = "",
	}: {
		icon?: typeof Search;
		headline?: string;
		description?: string;
		actionHref?: string;
		actionLabel?: string;
	} = $props();
</script>

<div class="rounded-md border border-border bg-bg-card p-12 text-center">
	<div class="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-bg-hover">
		<Icon size={20} class="text-text-secondary" />
	</div>
	<h3 class="text-lg font-medium text-text-primary">{headline}</h3>
	{#if description}
		<p class="mt-1 text-sm text-text-secondary">{description}</p>
	{/if}
	{#if actionHref && actionLabel}
		<a
			href={actionHref}
			class="mt-4 inline-block rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover"
		>
			{actionLabel}
		</a>
	{/if}
</div>
