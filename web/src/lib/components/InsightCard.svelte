<script lang="ts">
	import type { Insight } from "@pulse/shared";
	import { stripMarkdown } from "$lib/markdown";
	import { page } from "$app/state";
	import KindBadge from "./KindBadge.svelte";

	let { insight }: { insight: Insight } = $props();
	const soloMode = $derived(page.data.soloMode as boolean);

	const firstRef = $derived(
		insight.session_refs?.[0] as { tool?: string; model?: string } | undefined,
	);

	const metaParts = $derived.by(() => {
		const parts: string[] = [];
		if (!soloMode && insight.author_name) parts.push(insight.author_name);
		if (firstRef?.tool) parts.push(firstRef.tool);
		if (firstRef?.model) parts.push(firstRef.model);
		if (insight.trigger_type) parts.push(insight.trigger_type);
		return parts;
	});

	// Propagate active filters to detail page for prev/next navigation
	const filterParams = $derived.by(() => {
		const kind = page.url.searchParams.get("kind");
		const repo = page.url.searchParams.get("repo");
		const params = new URLSearchParams();
		params.set("nav", "1");
		if (kind) params.set("kind", kind);
		if (repo) params.set("repo", repo);
		return `?${params.toString()}`;
	});

	function relativeTime(iso: string): string {
		const diff = Date.now() - new Date(iso).getTime();
		const mins = Math.floor(diff / 60_000);
		if (mins < 1) return "just now";
		if (mins < 60) return `${mins}m ago`;
		const hours = Math.floor(mins / 60);
		if (hours < 24) return `${hours}h ago`;
		const days = Math.floor(hours / 24);
		if (days < 30) return `${days}d ago`;
		return new Date(iso).toLocaleDateString();
	}
</script>

<a
	href="/insights/{insight.id}{filterParams}"
	class="block rounded-md border border-border bg-bg-card p-4 transition hover:bg-bg-hover"
>
	<div class="flex items-center gap-2">
		<KindBadge kind={insight.kind} />
		<span class="text-xs text-text-secondary">{insight.repo}</span>
		{#if insight.enrichment?.superseded_by_id}
			<span class="inline-flex items-center rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">superseded</span>
		{/if}
		<span class="ml-auto text-xs text-text-secondary">{relativeTime(insight.created_at)}</span>
	</div>
	<h3 class="mt-2 font-medium text-text-primary">{insight.title}</h3>
	<p class="mt-1 line-clamp-2 text-sm text-text-secondary">{stripMarkdown(insight.body)}</p>
	{#if metaParts.length > 0}
		<div class="mt-2 text-xs text-text-secondary/50">
			{metaParts.join(" · ")}
		</div>
	{/if}
</a>
