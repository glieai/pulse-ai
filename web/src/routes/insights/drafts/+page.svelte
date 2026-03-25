<script lang="ts">
	import { enhance } from "$app/forms";
	import { FileText, Trash2, Clock } from "lucide-svelte";
	import type { Insight } from "@pulse/shared";
	import type { ActionData, PageData } from "./$types";

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const kindLabel: Record<string, string> = {
		decision: "Decision",
		dead_end: "Dead-end",
		pattern: "Pattern",
		context: "Context",
		progress: "Progress",
		business: "Business",
	};

	function formatDate(d: string | null | undefined) {
		if (!d) return "—";
		return new Date(d).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" });
	}
</script>

<div class="space-y-6">
	<div class="flex items-start justify-between">
		<div>
			<h1 class="text-xl font-semibold text-text-primary">Pending Drafts</h1>
			<p class="mt-1 text-sm text-text-secondary">
				{data.total} draft{data.total === 1 ? "" : "s"} waiting — publish via <code
					class="rounded bg-bg-secondary px-1 py-0.5 text-xs">pulse publish</code
				> in your terminal.
			</p>
		</div>

		<a
			href="/insights"
			class="text-sm text-text-secondary transition hover:text-text-primary"
		>
			← Published insights
		</a>
	</div>

	{#if form?.error}
		<div class="rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
			{form.error}
		</div>
	{/if}

	{#if data.drafts.length === 0}
		<div class="flex flex-col items-center justify-center rounded-lg border border-border bg-bg-card py-16 text-center">
			<FileText size={32} class="mb-3 text-text-secondary/40" />
			<p class="text-sm font-medium text-text-primary">No pending drafts</p>
			<p class="mt-1 text-xs text-text-secondary">
				Drafts created by Claude Code or the MCP server will appear here.
			</p>
		</div>
	{:else}
		<div class="space-y-2">
			{#each data.drafts as draft (draft.id)}
				<div class="group flex items-start justify-between rounded-lg border border-border bg-bg-card px-4 py-3 transition hover:border-border-hover">
					<div class="min-w-0 flex-1">
						<div class="flex items-center gap-2">
							<span class="shrink-0 rounded-full bg-bg-secondary px-2 py-0.5 text-xs font-medium text-text-secondary">
								{kindLabel[draft.kind] ?? draft.kind}
							</span>
							{#if draft.repo}
								<span class="truncate text-xs text-text-secondary/60">{draft.repo}</span>
							{/if}
						</div>
						<p class="mt-1.5 truncate text-sm font-medium text-text-primary">{draft.title}</p>
						<div class="mt-1 flex items-center gap-1 text-xs text-text-secondary/60">
							<Clock size={11} />
							<span>{formatDate(draft.created_at)}</span>
						</div>
					</div>

					<form method="POST" action="?/delete" use:enhance class="ml-3 shrink-0">
						<input type="hidden" name="id" value={draft.id} />
						<button
							type="submit"
							class="rounded p-1.5 text-text-secondary/40 opacity-0 transition hover:bg-danger/10 hover:text-danger group-hover:opacity-100"
							title="Delete draft"
						>
							<Trash2 size={14} />
						</button>
					</form>
				</div>
			{/each}
		</div>
	{/if}
</div>
