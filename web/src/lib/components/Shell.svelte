<script lang="ts">
	import { page } from "$app/state";
	import { onMount } from "svelte";
	import { Search, Settings, LogOut, Sun, Moon, Monitor, FileText, Users, User, Building2, BarChart3, Zap } from "lucide-svelte";
	import { getTheme, setTheme, initTheme, type Theme } from "$lib/stores/theme.svelte";

	let { children, soloMode = false, draftCount = 0, userRole = "member" }: { children: any; soloMode?: boolean; draftCount?: number; userRole?: string } = $props();

	const isAdmin = $derived(userRole === "admin" || userRole === "owner");
	const isOwner = $derived(userRole === "owner");

	function isActive(href: string): boolean {
		return page.url.pathname.startsWith(href);
	}

	const themes: { value: Theme; icon: typeof Sun; label: string }[] = [
		{ value: "light", icon: Sun, label: "Light" },
		{ value: "dark", icon: Moon, label: "Dark" },
		{ value: "system", icon: Monitor, label: "System" },
	];

	onMount(() => {
		initTheme();
	});
</script>

<div class="flex min-h-screen">
	<!-- Sidebar -->
	<aside class="sticky top-0 flex h-screen w-56 flex-col border-r border-border bg-bg-card">
		<div class="flex h-14 items-center gap-2 border-b border-border px-5">
			<img src="/logo.png" alt="Pulse" class="h-5 w-5 dark:hidden" />
			<img src="/logo-white.png" alt="Pulse" class="hidden h-5 w-5 dark:block" />
			<span class="text-lg font-semibold text-text-primary">Pulse</span>
		</div>

		<nav class="flex-1 space-y-0.5 p-3">
			<!-- Core features (all roles) -->
			<a
				href="/insights"
				class="flex items-center gap-3 rounded-md px-3 py-1.5 text-sm transition {isActive('/insights') && !isActive('/insights/drafts')
					? 'bg-accent/10 text-accent'
					: 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'}"
			>
				<Zap size={16} />
				Insights
			</a>

			{#if soloMode}
				<a
					href="/insights/drafts"
					class="flex items-center gap-3 rounded-md px-3 py-1.5 text-sm transition {isActive('/insights/drafts')
						? 'bg-accent/10 text-accent'
						: 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'}"
				>
					<FileText size={16} />
					Drafts
					{#if draftCount > 0}
						<span class="ml-auto rounded-full bg-accent/15 px-1.5 py-0.5 text-[10px] font-medium leading-none text-accent">
							{draftCount}
						</span>
					{/if}
				</a>
			{/if}

			<a
				href="/search"
				class="flex items-center gap-3 rounded-md px-3 py-1.5 text-sm transition {isActive('/search')
					? 'bg-accent/10 text-accent'
					: 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'}"
			>
				<Search size={16} />
				Search
			</a>

			<a
				href="/analytics"
				class="flex items-center gap-3 rounded-md px-3 py-1.5 text-sm transition {isActive('/analytics')
					? 'bg-accent/10 text-accent'
					: 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'}"
			>
				<BarChart3 size={16} />
				Analytics
			</a>

			<!-- Team management (role-based) -->
			{#if !soloMode && isAdmin}
				<div class="my-2 border-t border-border"></div>

				<a
					href="/settings/members"
					class="flex items-center gap-3 rounded-md px-3 py-1.5 text-sm transition {isActive('/settings/members')
						? 'bg-accent/10 text-accent'
						: 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'}"
				>
					<Users size={16} />
					Members
				</a>
			{/if}

			{#if !soloMode && isOwner}
				<a
					href="/settings/org"
					class="flex items-center gap-3 rounded-md px-3 py-1.5 text-sm transition {isActive('/settings/org')
						? 'bg-accent/10 text-accent'
						: 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'}"
				>
					<Building2 size={16} />
					Organization
				</a>
			{/if}

			<!-- Configuration (bottom) -->
			{#if soloMode || isAdmin}
				<div class="my-2 border-t border-border"></div>

				<a
					href="/settings"
					class="flex items-center gap-3 rounded-md px-3 py-1.5 text-sm transition {isActive('/settings') &&
					!isActive('/settings/members') &&
					!isActive('/settings/org') &&
					!isActive('/settings/account')
						? 'bg-accent/10 text-accent'
						: 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'}"
				>
					<Settings size={16} />
					Settings
				</a>
			{/if}

			{#if !soloMode}
				<a
					href="/settings/account"
					class="flex items-center gap-3 rounded-md px-3 py-1.5 text-sm transition {isActive('/settings/account')
						? 'bg-accent/10 text-accent'
						: 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'}"
				>
					<User size={16} />
					Account
				</a>
			{/if}
		</nav>

		<div class="border-t border-border p-3">
			<div class="mb-2 flex items-center justify-center gap-1">
				{#each themes as t}
					<button
						type="button"
						onclick={() => setTheme(t.value)}
						class="rounded-md p-1.5 transition {getTheme() === t.value
							? 'bg-bg-hover text-text-primary'
							: 'text-text-secondary/50 hover:text-text-secondary'}"
						title={t.label}
					>
						<t.icon size={14} />
					</button>
				{/each}
			</div>
			{#if !soloMode}
				<a
					href="/logout"
					class="flex items-center gap-3 rounded-md px-3 py-1.5 text-sm text-text-secondary transition hover:bg-bg-hover hover:text-text-primary"
				>
					<LogOut size={16} />
					Sign out
				</a>
			{/if}
		</div>
	</aside>

	<!-- Main content -->
	<main class="flex-1 overflow-y-auto">
		<div class="mx-auto max-w-5xl px-8 py-8">
			{@render children()}
		</div>
	</main>
</div>
