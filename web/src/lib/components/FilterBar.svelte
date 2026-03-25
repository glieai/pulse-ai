<script lang="ts">
	import type { InsightKind } from "@pulse/shared";
	import { goto } from "$app/navigation";
	import { page } from "$app/state";

	let {
		kinds = [],
		repos = [],
	}: {
		kinds?: InsightKind[];
		repos?: string[];
	} = $props();

	const allKinds: InsightKind[] = ["decision", "dead_end", "pattern", "context", "progress", "business"];

	const activeKind = $derived(page.url.searchParams.get("kind") as InsightKind | null);
	const activeRepo = $derived(page.url.searchParams.get("repo"));

	function toggleKind(kind: InsightKind) {
		const url = new URL(page.url);
		if (activeKind === kind) {
			url.searchParams.delete("kind");
		} else {
			url.searchParams.set("kind", kind);
		}
		url.searchParams.delete("offset");
		goto(url.pathname + url.search);
	}

	function toggleRepo(repo: string) {
		const url = new URL(page.url);
		if (activeRepo === repo) {
			url.searchParams.delete("repo");
		} else {
			url.searchParams.set("repo", repo);
		}
		url.searchParams.delete("offset");
		goto(url.pathname + url.search);
	}

	const kindStyles: Record<InsightKind, { active: string; inactive: string }> = {
		decision: {
			active: "bg-accent text-white",
			inactive: "bg-accent/8 text-accent hover:bg-accent/15",
		},
		dead_end: {
			active: "bg-danger text-white",
			inactive: "bg-danger/8 text-danger hover:bg-danger/15",
		},
		pattern: {
			active: "bg-success text-white",
			inactive: "bg-success/8 text-success hover:bg-success/15",
		},
		progress: {
			active: "bg-warning text-white",
			inactive: "bg-warning/8 text-warning hover:bg-warning/15",
		},
		context: {
			active: "bg-text-secondary text-bg-base",
			inactive: "bg-text-secondary/8 text-text-secondary hover:bg-text-secondary/15",
		},
		business: {
			active: "bg-purple-500 text-white",
			inactive: "bg-purple-500/8 text-purple-400 hover:bg-purple-500/15",
		},
	};
</script>

<div class="flex flex-wrap items-center gap-2">
	{#each allKinds as kind}
		<button
			type="button"
			onclick={() => toggleKind(kind)}
			class="rounded-full px-3 py-1 text-xs font-medium transition {activeKind === kind
				? kindStyles[kind].active
				: kindStyles[kind].inactive}"
		>
			{kind.replace("_", " ")}
		</button>
	{/each}

	{#if repos.length > 0}
		<span class="mx-1 h-4 w-px bg-border"></span>
		{#each repos as repo}
			<button
				type="button"
				onclick={() => toggleRepo(repo)}
				class="rounded-full px-3 py-1 text-xs font-medium transition {activeRepo === repo
					? 'bg-text-primary text-bg-base'
					: 'bg-bg-hover text-text-secondary hover:text-text-primary'}"
			>
				{repo}
			</button>
		{/each}
	{/if}
</div>
