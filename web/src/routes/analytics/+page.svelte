<script lang="ts">
	import { BarChart3, GitBranch, Users, FileText, TrendingUp } from "lucide-svelte";
	import type { PageData } from "./$types";

	let { data }: { data: PageData } = $props();

	const analytics = $derived(data.analytics);

	const kindColors: Record<string, string> = {
		decision: "bg-blue-500",
		dead_end: "bg-red-400",
		pattern: "bg-emerald-500",
		context: "bg-slate-400",
		progress: "bg-amber-500",
		business: "bg-violet-500",
	};

	const kindLabels: Record<string, string> = {
		decision: "Decision",
		dead_end: "Dead-end",
		pattern: "Pattern",
		context: "Context",
		progress: "Progress",
		business: "Business",
	};

	const maxWeekCount = $derived(
		analytics?.insights_per_week
			? Math.max(...analytics.insights_per_week.map((w: { count: number }) => w.count), 1)
			: 1,
	);

	const totalKindCount = $derived(
		analytics?.kind_distribution
			? analytics.kind_distribution.reduce((sum: number, k: { count: number }) => sum + k.count, 0)
			: 0,
	);

	function formatWeek(dateStr: string): string {
		const d = new Date(dateStr);
		return d.toLocaleDateString("en", { month: "short", day: "numeric" });
	}
</script>

<div class="space-y-8">
	<div>
		<h1 class="text-2xl font-bold text-text-primary">Analytics</h1>
		<p class="mt-1 text-text-secondary">Track your team's knowledge capture activity</p>
	</div>

	{#if !analytics}
		<p class="text-sm text-text-secondary">No analytics data available.</p>
	{:else}
		<!-- Summary Cards -->
		<div class="grid grid-cols-3 gap-4">
			<div class="rounded-lg border border-border bg-bg-card p-5">
				<div class="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-text-secondary">
					<FileText size={14} /> Total Insights
				</div>
				<p class="mt-2 text-3xl font-bold text-text-primary">{analytics.totals.total}</p>
			</div>
			<div class="rounded-lg border border-border bg-bg-card p-5">
				<div class="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-text-secondary">
					<TrendingUp size={14} /> Published
				</div>
				<p class="mt-2 text-3xl font-bold text-accent">{analytics.totals.published}</p>
			</div>
			<div class="rounded-lg border border-border bg-bg-card p-5">
				<div class="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-text-secondary">
					<FileText size={14} /> Drafts
				</div>
				<p class="mt-2 text-3xl font-bold text-text-secondary">{analytics.totals.drafts}</p>
			</div>
		</div>

		<!-- Insights per Week (Bar Chart) -->
		<div class="rounded-lg border border-border bg-bg-card p-6">
			<h2 class="mb-4 flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-text-secondary">
				<BarChart3 size={14} /> Insights per Week
			</h2>

			{#if analytics.insights_per_week.length === 0}
				<p class="py-8 text-center text-sm text-text-secondary">No activity in the last 12 weeks</p>
			{:else}
				<div class="flex items-end gap-1.5" style="height: 160px;">
					{#each analytics.insights_per_week as week}
						<div class="group relative flex flex-1 flex-col items-center justify-end">
							<div
								class="w-full rounded-t bg-accent/80 transition group-hover:bg-accent"
								style="height: {Math.max((week.count / maxWeekCount) * 140, 4)}px;"
							></div>
							<span class="mt-1 text-[10px] text-text-secondary/60">{formatWeek(week.week)}</span>
							<!-- Tooltip -->
							<div class="pointer-events-none absolute -top-8 rounded bg-bg-secondary px-2 py-1 text-xs font-medium text-text-primary opacity-0 shadow-sm transition group-hover:opacity-100">
								{week.count}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<div class="grid grid-cols-2 gap-6">
			<!-- Kind Distribution -->
			<div class="rounded-lg border border-border bg-bg-card p-6">
				<h2 class="mb-4 text-sm font-medium uppercase tracking-wider text-text-secondary">
					By Kind
				</h2>

				{#if analytics.kind_distribution.length === 0}
					<p class="text-sm text-text-secondary">No data yet</p>
				{:else}
					<div class="space-y-2.5">
						{#each analytics.kind_distribution as item}
							<div class="flex items-center gap-3">
								<span class="w-20 shrink-0 text-xs text-text-secondary">{kindLabels[item.kind] ?? item.kind}</span>
								<div class="flex-1">
									<div class="h-5 overflow-hidden rounded-full bg-bg-secondary">
										<div
											class="h-full rounded-full transition-all {kindColors[item.kind] ?? 'bg-slate-400'}"
											style="width: {(item.count / totalKindCount) * 100}%;"
										></div>
									</div>
								</div>
								<span class="w-8 shrink-0 text-right text-xs font-medium text-text-primary">{item.count}</span>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Top Repos -->
			<div class="rounded-lg border border-border bg-bg-card p-6">
				<h2 class="mb-4 flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-text-secondary">
					<GitBranch size={14} /> Top Repos
				</h2>

				{#if analytics.top_repos.length === 0}
					<p class="text-sm text-text-secondary">No data yet</p>
				{:else}
					<div class="space-y-2">
						{#each analytics.top_repos as repo, i}
							<div class="flex items-center justify-between rounded-md px-2 py-1.5 transition hover:bg-bg-secondary">
								<div class="flex items-center gap-2">
									<span class="w-4 text-right text-xs text-text-secondary/50">{i + 1}</span>
									<span class="text-sm text-text-primary">{repo.repo}</span>
								</div>
								<span class="text-xs font-medium text-text-secondary">{repo.count}</span>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>

		<!-- Top Contributors -->
		<div class="rounded-lg border border-border bg-bg-card p-6">
			<h2 class="mb-4 flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-text-secondary">
				<Users size={14} /> Top Contributors
			</h2>

			{#if analytics.top_contributors.length === 0}
				<p class="text-sm text-text-secondary">No data yet</p>
			{:else}
				<div class="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
					{#each analytics.top_contributors as contributor}
						<div class="flex flex-col items-center gap-1 rounded-lg border border-border p-3 text-center">
							<div class="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">
								{contributor.author_name.charAt(0).toUpperCase()}
							</div>
							<span class="truncate text-xs font-medium text-text-primary">{contributor.author_name}</span>
							<span class="text-[10px] text-text-secondary">{contributor.count} insights</span>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>
