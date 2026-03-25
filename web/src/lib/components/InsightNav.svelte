<script lang="ts">
	import { goto } from "$app/navigation";
	import { ChevronLeft, ChevronRight } from "lucide-svelte";

	let {
		prevId,
		nextId,
		filterParams = "",
	}: {
		prevId: string | null;
		nextId: string | null;
		filterParams?: string;
	} = $props();

	function navUrl(id: string): string {
		return `/insights/${id}${filterParams}`;
	}

	// Keyboard navigation
	function onKeydown(e: KeyboardEvent) {
		// Skip if user is typing in an input
		const tag = (e.target as HTMLElement).tagName;
		if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

		if (e.key === "ArrowLeft" && prevId) {
			e.preventDefault();
			goto(navUrl(prevId));
		} else if (e.key === "ArrowRight" && nextId) {
			e.preventDefault();
			goto(navUrl(nextId));
		}
	}

	// Swipe navigation
	let touchStartX = 0;
	let touchStartY = 0;

	function onTouchStart(e: TouchEvent) {
		touchStartX = e.touches[0].clientX;
		touchStartY = e.touches[0].clientY;
	}

	function onTouchEnd(e: TouchEvent) {
		const dx = e.changedTouches[0].clientX - touchStartX;
		const dy = e.changedTouches[0].clientY - touchStartY;

		// Only horizontal swipes — ignore if vertical movement is larger
		if (Math.abs(dy) > Math.abs(dx)) return;
		// Minimum threshold
		if (Math.abs(dx) < 50) return;

		if (dx > 0 && prevId) {
			goto(navUrl(prevId));
		} else if (dx < 0 && nextId) {
			goto(navUrl(nextId));
		}
	}
</script>

<svelte:window onkeydown={onKeydown} />
<svelte:body ontouchstart={onTouchStart} ontouchend={onTouchEnd} />

<nav class="flex items-center justify-between rounded-md border border-border bg-bg-card px-4 py-3">
	{#if prevId}
		<a
			href={navUrl(prevId)}
			class="flex items-center gap-1.5 text-sm text-text-secondary transition hover:text-text-primary"
			data-sveltekit-preload-data
		>
			<ChevronLeft size={18} />
			<span class="hidden sm:inline">Newer</span>
		</a>
	{:else}
		<span class="flex items-center gap-1.5 text-sm text-text-secondary/30">
			<ChevronLeft size={18} />
			<span class="hidden sm:inline">Newer</span>
		</span>
	{/if}

	<span class="text-xs text-text-secondary/50">
		<kbd class="hidden rounded border border-border px-1.5 py-0.5 font-mono text-[10px] sm:inline-block">←</kbd>
		<kbd class="hidden rounded border border-border px-1.5 py-0.5 font-mono text-[10px] sm:inline-block">→</kbd>
	</span>

	{#if nextId}
		<a
			href={navUrl(nextId)}
			class="flex items-center gap-1.5 text-sm text-text-secondary transition hover:text-text-primary"
			data-sveltekit-preload-data
		>
			<span class="hidden sm:inline">Older</span>
			<ChevronRight size={18} />
		</a>
	{:else}
		<span class="flex items-center gap-1.5 text-sm text-text-secondary/30">
			<span class="hidden sm:inline">Older</span>
			<ChevronRight size={18} />
		</span>
	{/if}
</nav>
