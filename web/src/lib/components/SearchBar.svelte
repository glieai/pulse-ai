<script lang="ts">
	import { Search } from "lucide-svelte";
	import { goto } from "$app/navigation";

	let {
		value = "",
		autofocus = false,
		prominent = false,
	}: {
		value?: string;
		autofocus?: boolean;
		prominent?: boolean;
	} = $props();

	// svelte-ignore state_referenced_locally — intentional: value is initial seed only
	let query = $state(value);
	let inputEl: HTMLInputElement | undefined = $state();
	let debounceTimer: ReturnType<typeof setTimeout> | undefined;

	export function focus() {
		inputEl?.focus();
	}

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		query = target.value;

		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			if (query.trim()) {
				goto(`/search?q=${encodeURIComponent(query.trim())}`, { keepFocus: true });
			}
		}, 300);
	}

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		clearTimeout(debounceTimer);
		if (query.trim()) {
			goto(`/search?q=${encodeURIComponent(query.trim())}`);
		}
	}
</script>

<form onsubmit={handleSubmit} class="relative">
	<Search
		size={20}
		class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary"
	/>
	<!-- svelte-ignore a11y_autofocus -->
	<input
		bind:this={inputEl}
		name="q"
		type="text"
		value={query}
		oninput={handleInput}
		placeholder="Search insights... (Cmd+K)"
		class="w-full rounded-lg border border-border bg-bg-card py-3 pl-12 pr-4 text-text-primary placeholder-text-secondary/50 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent {prominent
			? 'text-base'
			: 'text-sm'}"
		autofocus={autofocus || undefined}
	/>
</form>
