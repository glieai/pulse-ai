<script lang="ts">
	import { Loader2, StopCircle, ExternalLink } from "lucide-svelte";
	import KindBadge from "./KindBadge.svelte";
	import { renderMarkdown } from "$lib/markdown";
	import type { InsightKind } from "@pulse/shared";
	import type { AskSource } from "$lib/sse";

	let {
		status,
		text,
		sources,
		error,
		onStop,
	}: {
		status: "loading" | "streaming" | "done" | "error";
		text: string;
		sources: AskSource[];
		error: string;
		onStop: () => void;
	} = $props();
</script>

<div class="mt-4 space-y-3">
	{#if status === "loading"}
		<div class="flex items-center gap-2 text-sm text-text-secondary">
			<Loader2 size={14} class="animate-spin" />
			Searching knowledge base...
		</div>
	{/if}

	{#if sources.length > 0}
		<div class="flex flex-wrap gap-1.5">
			{#each sources as source}
				<a
					href="/insights/{source.id}"
					class="inline-flex items-center gap-1.5 rounded-md border border-border bg-bg-base px-2 py-1 text-xs text-text-secondary transition hover:border-accent hover:text-accent"
				>
					<KindBadge kind={source.kind as InsightKind} />
					<span class="max-w-[180px] truncate">{source.title}</span>
					<ExternalLink size={10} />
				</a>
			{/each}
		</div>
	{/if}

	{#if text}
		<div class="prose prose-sm max-w-none">
			{@html renderMarkdown(text)}{#if status === "streaming"}<span class="ml-0.5 inline-block h-4 w-1 animate-pulse bg-accent"></span>{/if}
		</div>
	{/if}

	{#if status === "streaming"}
		<button
			type="button"
			onclick={onStop}
			class="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-text-secondary transition hover:border-danger hover:text-danger"
		>
			<StopCircle size={12} />
			Stop
		</button>
	{/if}

	{#if status === "error" && error}
		<div class="rounded-md border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
			{error}
		</div>
	{/if}
</div>
