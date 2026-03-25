<script lang="ts">
	import "../app.css";
	import Shell from "$lib/components/Shell.svelte";
	import { Toaster } from "svelte-sonner";
	import { page } from "$app/state";
	import { goto } from "$app/navigation";

	let { children, data } = $props();

	const publicRoutes = ["/", "/login", "/register", "/pricing", "/forgot-password"];
	const publicPrefixes = ["/reset-password/", "/invite/", "/auth/"];
	const isPreview = $derived(page.url.searchParams.has("preview"));
	const isPublic = $derived(
		isPreview || (!data.soloMode && (publicRoutes.includes(page.url.pathname) || publicPrefixes.some(p => page.url.pathname.startsWith(p)))),
	);

	function handleKeydown(e: KeyboardEvent) {
		if (isPublic) return;

		if ((e.metaKey || e.ctrlKey) && e.key === "k") {
			e.preventDefault();
			goto("/search");
			return;
		}

		if (e.key === "/" && !isInputFocused()) {
			e.preventDefault();
			goto("/search");
		}
	}

	function isInputFocused(): boolean {
		const el = document.activeElement;
		if (!el) return false;
		const tag = el.tagName.toLowerCase();
		return tag === "input" || tag === "textarea" || tag === "select" || (el as HTMLElement).isContentEditable;
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<svelte:head>
	<title>Pulse</title>
</svelte:head>

<Toaster richColors position="bottom-right" />

{#if isPublic}
	{@render children()}
{:else}
	<Shell soloMode={data.soloMode} draftCount={data.draftCount} userRole={data.user?.role ?? "member"}>
		{@render children()}
	</Shell>
{/if}
