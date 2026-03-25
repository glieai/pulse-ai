<script lang="ts">
	import { ChevronLeft, ChevronRight } from "lucide-svelte";

	let {
		total,
		limit,
		offset,
		baseUrl,
	}: {
		total: number;
		limit: number;
		offset: number;
		baseUrl: string;
	} = $props();

	const currentPage = $derived(Math.floor(offset / limit) + 1);
	const totalPages = $derived(Math.max(1, Math.ceil(total / limit)));
	const hasPrev = $derived(offset > 0);
	const hasNext = $derived(offset + limit < total);

	function pageUrl(newOffset: number): string {
		const url = new URL(baseUrl, "http://localhost");
		url.searchParams.set("offset", String(newOffset));
		return `${url.pathname}${url.search}`;
	}
</script>

{#if totalPages > 1}
	<div class="flex items-center justify-between">
		<a
			href={hasPrev ? pageUrl(Math.max(0, offset - limit)) : undefined}
			class="flex items-center gap-1 rounded-md px-3 py-2 text-sm transition {hasPrev
				? 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
				: 'pointer-events-none text-text-secondary/30'}"
			aria-disabled={!hasPrev}
		>
			<ChevronLeft size={16} />
			Previous
		</a>

		<span class="text-sm text-text-secondary">
			Page {currentPage} of {totalPages}
		</span>

		<a
			href={hasNext ? pageUrl(offset + limit) : undefined}
			class="flex items-center gap-1 rounded-md px-3 py-2 text-sm transition {hasNext
				? 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
				: 'pointer-events-none text-text-secondary/30'}"
			aria-disabled={!hasNext}
		>
			Next
			<ChevronRight size={16} />
		</a>
	</div>
{/if}
