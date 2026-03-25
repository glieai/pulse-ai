<script lang="ts">
	import { page } from "$app/state";
	import { MessageSquare, ArrowRight } from "lucide-svelte";
	import AskResponse from "./AskResponse.svelte";
	import { fetchSSE, type AskSource } from "$lib/sse";

	let { llmConfigured = false }: { llmConfigured: boolean } = $props();

	let query = $state("");
	let status = $state<"idle" | "loading" | "streaming" | "done" | "error">("idle");
	let responseText = $state("");
	let sources = $state<AskSource[]>([]);
	let error = $state("");
	let abortController: AbortController | null = null;

	const activeKind = $derived(page.url.searchParams.get("kind"));
	const activeRepo = $derived(page.url.searchParams.get("repo"));

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!query.trim() || status === "loading" || status === "streaming") return;

		responseText = "";
		sources = [];
		error = "";
		status = "loading";

		const body: Record<string, unknown> = { query: query.trim() };
		if (activeKind) body.kind = activeKind;
		if (activeRepo) body.repo = activeRepo;

		abortController = fetchSSE("/sse/ask", body, {
			onSources(s) {
				sources = s;
				status = "streaming";
			},
			onToken(text) {
				responseText += text;
			},
			onDone() {
				status = "done";
				abortController = null;
			},
			onError(err) {
				error = err;
				status = "error";
				abortController = null;
			},
		});
	}

	function handleStop() {
		abortController?.abort();
		status = "done";
		abortController = null;
	}
</script>

<div class="rounded-md border border-border bg-bg-card p-5">
	<div class="mb-3 flex items-center gap-2">
		<MessageSquare size={16} class="text-accent" />
		<h2 class="text-sm font-medium uppercase tracking-wider text-text-secondary">
			Ask Pulse
		</h2>
	</div>

	{#if !llmConfigured}
		<p class="text-sm text-text-secondary">
			AI-powered answers require an LLM provider.
			<a href="/settings" class="text-accent hover:underline">Configure in Settings</a>
		</p>
	{:else}
		<form onsubmit={handleSubmit} class="relative">
			<input
				type="text"
				bind:value={query}
				placeholder="Ask a question about your codebase..."
				disabled={status === "loading" || status === "streaming"}
				class="w-full rounded-lg border border-border bg-bg-base py-2.5 pl-4 pr-12 text-sm text-text-primary placeholder-text-secondary/50 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent disabled:opacity-50"
			/>
			<button
				type="submit"
				disabled={!query.trim() || status === "loading" || status === "streaming"}
				class="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-accent p-1.5 text-white transition hover:bg-accent-hover disabled:opacity-30"
			>
				<ArrowRight size={14} />
			</button>
		</form>

		{#if activeKind || activeRepo}
			<p class="mt-1.5 text-xs text-text-secondary">
				Scoped to:{" "}
				{#if activeKind}<span class="font-medium">{activeKind.replace("_", " ")}</span>{/if}
				{#if activeKind && activeRepo}<span> · </span>{/if}
				{#if activeRepo}<span class="font-medium">{activeRepo}</span>{/if}
			</p>
		{/if}

		{#if status !== "idle"}
			<AskResponse
				{status}
				text={responseText}
				{sources}
				{error}
				onStop={handleStop}
			/>
		{/if}
	{/if}
</div>
