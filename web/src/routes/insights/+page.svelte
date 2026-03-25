<script lang="ts">
	import AskPulse from "$lib/components/AskPulse.svelte";
	import InsightCard from "$lib/components/InsightCard.svelte";
	import FilterBar from "$lib/components/FilterBar.svelte";
	import EmptyState from "$lib/components/EmptyState.svelte";
	import { Zap, Loader2, Download } from "lucide-svelte";
	import { page } from "$app/state";
	import type { Insight } from "@pulse/shared";
	import type { PageData } from "./$types";

	let { data }: { data: PageData } = $props();

	// Extra insights appended by infinite scroll (reset on filter change)
	let extraInsights = $state<Insight[]>([]);
	let nextCursor = $state<string | null>(null);
	let hasMore = $state(false);
	let loading = $state(false);
	let sentinel: HTMLElement | undefined = $state();

	// Derive the full list: server data + client-loaded extras
	const allInsights = $derived([...data.insights, ...extraInsights]);

	// Reset scroll state when server data changes (filter toggle)
	$effect(() => {
		// Touch data.insights to subscribe to changes
		data.insights;
		extraInsights = [];
		nextCursor = data.nextCursor;
		hasMore = data.hasMore;
	});

	// Infinite scroll via IntersectionObserver
	$effect(() => {
		if (!sentinel) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting && hasMore && !loading) {
					loadMore();
				}
			},
			{ rootMargin: "200px" },
		);
		observer.observe(sentinel);
		return () => observer.disconnect();
	});

	async function loadMore() {
		if (!nextCursor || loading) return;
		loading = true;

		const params = new URLSearchParams({ cursor: nextCursor });
		const kind = page.url.searchParams.get("kind");
		const repo = page.url.searchParams.get("repo");
		if (kind) params.set("kind", kind);
		if (repo) params.set("repo", repo);

		try {
			const res = await fetch(`/insights/more?${params}`);
			if (!res.ok) return;
			const result: { insights: Insight[]; next_cursor: string | null; has_more: boolean } =
				await res.json();
			extraInsights = [...extraInsights, ...result.insights];
			nextCursor = result.next_cursor;
			hasMore = result.has_more;
		} catch (err) {
			console.error("Failed to load more insights:", err);
		} finally {
			loading = false;
		}
	}
</script>

<div class="space-y-6">
	<div class="flex items-start justify-between">
		<div>
			<h1 class="text-2xl font-bold text-text-primary">Insights</h1>
			<p class="mt-1 text-text-secondary">Browse your {data.soloMode ? '' : "team's "}decisions, patterns, and learnings</p>
		</div>
		{#if data.user?.role === "owner" || data.user?.role === "admin"}
			<a
				href="/insights/export"
				class="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-text-secondary transition hover:border-accent hover:text-accent"
			>
				<Download size={14} /> Export JSON
			</a>
		{/if}
	</div>

	<AskPulse llmConfigured={data.llmConfigured} />

	<FilterBar repos={data.repos} />

	{#if allInsights.length > 0}
		<div class="space-y-3">
			{#each allInsights as insight (insight.id)}
				<InsightCard {insight} />
			{/each}
		</div>

		{#if hasMore}
			<div bind:this={sentinel} class="flex justify-center py-4">
				{#if loading}
					<Loader2 size={20} class="animate-spin text-text-secondary" />
				{/if}
			</div>
		{/if}

		{#if !hasMore && allInsights.length > 20}
			<p class="py-4 text-center text-sm text-text-secondary/50">
				All {data.total} insights loaded
			</p>
		{/if}
	{:else}
		<EmptyState
			icon={Zap}
			headline="No insights found"
			description="Try adjusting your filters or create your first insight."
		/>
	{/if}
</div>
