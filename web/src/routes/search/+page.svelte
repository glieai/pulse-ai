<script lang="ts">
	import SearchBar from "$lib/components/SearchBar.svelte";
	import InsightCard from "$lib/components/InsightCard.svelte";
	import EmptyState from "$lib/components/EmptyState.svelte";
	import Pagination from "$lib/components/Pagination.svelte";
	import { SearchX } from "lucide-svelte";
	import { page } from "$app/state";
	import type { PageData } from "./$types";

	let { data }: { data: PageData } = $props();
</script>

<div class="space-y-6">
	<SearchBar value={data.q} autofocus />

	{#if data.q}
		<p class="text-sm text-text-secondary">
			{data.total} result{data.total !== 1 ? "s" : ""} for
			<span class="font-medium text-text-primary">"{data.q}"</span>
		</p>
	{/if}

	{#if data.insights.length > 0}
		<div class="space-y-3">
			{#each data.insights as insight (insight.id)}
				<InsightCard {insight} />
			{/each}
		</div>

		<Pagination
			total={data.total}
			limit={data.limit}
			offset={data.offset}
			baseUrl={page.url.href}
		/>
	{:else if data.q}
		<EmptyState
			icon={SearchX}
			headline="No results"
			description="Try different keywords or check your spelling."
		/>
	{:else}
		<EmptyState
			headline="Search your knowledge base"
			description={data.soloMode ? "Type a query above to find insights." : "Type a query above to find insights across your team."}
		/>
	{/if}
</div>
