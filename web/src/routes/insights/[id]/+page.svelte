<script lang="ts">
	import InsightNav from "$lib/components/InsightNav.svelte";
	import KindBadge from "$lib/components/KindBadge.svelte";
	import StructuredData from "$lib/components/StructuredData.svelte";
	import { renderMarkdown } from "$lib/markdown";
	import type { InsightKind } from "@pulse/shared";
	import { ArrowLeft, GitCommit, FileCode, Calendar, User, MessageSquare, Bot, Link2, AlertTriangle, Sparkles, CheckCircle, Circle } from "lucide-svelte";
	import type { PageData } from "./$types";
	import type { RelatedInsight } from "./+page.server";

	let { data }: { data: PageData } = $props();
	const insight = $derived(data.insight);
	const nav = $derived(data.nav as { prev_id: string | null; next_id: string | null } | null);
	const filterParams = $derived((data.filterParams as string) || "");
	const soloMode = $derived(data.soloMode as boolean);
	const relatedInsights = $derived((data.relatedInsights ?? []) as RelatedInsight[]);
	const supersededByInsight = $derived((data.supersededByInsight ?? null) as RelatedInsight | null);
	const supersedesInsight = $derived((data.supersedesInsight ?? null) as RelatedInsight | null);
	const enrichment = $derived(insight.enrichment);

	// Back link preserves kind/repo filters but strips nav param
	const backParams = $derived.by(() => {
		const fp = filterParams;
		if (!fp) return "";
		const params = new URLSearchParams(fp.slice(1));
		params.delete("nav");
		const qs = params.toString();
		return qs ? `?${qs}` : "";
	});

	const firstRef = $derived(
		insight.session_refs?.[0] as { tool?: string; model?: string } | undefined,
	);

	function formatDate(iso: string): string {
		return new Date(iso).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	}
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<a
			href="/insights{backParams}"
			class="inline-flex items-center gap-1 text-sm text-text-secondary transition hover:text-text-primary"
		>
			<ArrowLeft size={16} />
			Back to insights
		</a>
	</div>

	{#if nav}
		<InsightNav prevId={nav.prev_id} nextId={nav.next_id} {filterParams} />
	{/if}

	<div class="rounded-md border border-border bg-bg-card p-6">
		<div class="flex items-center gap-3">
			<KindBadge kind={insight.kind} />
			<span class="text-sm text-text-secondary">{insight.repo}</span>
			{#if insight.branch}
				<span class="text-sm text-text-secondary/60">/ {insight.branch}</span>
			{/if}
		</div>

		<h1 class="mt-4 text-2xl font-bold text-text-primary">{insight.title}</h1>

		<div class="mt-3 flex flex-wrap items-center gap-4 text-sm text-text-secondary">
			<span class="flex items-center gap-1.5">
				<Calendar size={14} />
				{formatDate(insight.created_at)}
			</span>
			{#if !soloMode && insight.author_name}
				<span class="flex items-center gap-1.5">
					<User size={14} />
					{insight.author_name}
				</span>
			{/if}
			{#if firstRef?.tool}
				<span class="flex items-center gap-1.5">
					<Bot size={14} />
					<span class="font-mono">{firstRef.tool}{#if firstRef.model}<span class="text-text-secondary/60"> ({firstRef.model})</span>{/if}</span>
				</span>
			{/if}
			{#if insight.trigger_type}
				<span class="text-text-secondary/60">{insight.trigger_type}</span>
			{/if}
		</div>

		<div class="prose mt-6 max-w-none">
			{@html renderMarkdown(insight.body)}
		</div>
	</div>

	{#if insight.structured && Object.keys(insight.structured).length > 0}
		<StructuredData kind={insight.kind} structured={insight.structured} />
	{/if}

	{#if (insight.source_files && insight.source_files.length > 0) || (insight.commit_hashes && insight.commit_hashes.length > 0) || (insight.session_refs && insight.session_refs.length > 0)}
		<div class="rounded-md border border-border bg-bg-card p-6">
			<h2 class="mb-4 text-sm font-medium uppercase tracking-wider text-text-secondary">
				References
			</h2>

			{#if insight.session_refs && insight.session_refs.length > 0}
				<div class="mb-4">
					<h3 class="mb-2 flex items-center gap-1.5 text-xs font-medium text-text-secondary">
						<MessageSquare size={14} />
						Sessions
					</h3>
					<div class="space-y-1">
						{#each insight.session_refs as ref}
							<div class="flex items-center gap-3 rounded bg-bg-base px-3 py-1.5 text-xs">
								{#if ref.tool}
									<span class="text-accent">{ref.tool}</span>
								{/if}
								{#if ref.device}
									<span class="text-text-secondary">{ref.device}</span>
								{/if}
								{#if ref.session_id}
									<span class="font-mono text-text-secondary/60">{String(ref.session_id).slice(0, 12)}</span>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			{/if}

			{#if insight.source_files && insight.source_files.length > 0}
				<div class="mb-4">
					<h3 class="mb-2 flex items-center gap-1.5 text-xs font-medium text-text-secondary">
						<FileCode size={14} />
						Source Files
					</h3>
					<div class="space-y-1">
						{#each insight.source_files as file}
							<div class="rounded bg-bg-base px-3 py-1.5 font-mono text-xs text-text-primary">
								{file}
							</div>
						{/each}
					</div>
				</div>
			{/if}

			{#if insight.commit_hashes && insight.commit_hashes.length > 0}
				<div>
					<h3 class="mb-2 flex items-center gap-1.5 text-xs font-medium text-text-secondary">
						<GitCommit size={14} />
						Commits
					</h3>
					<div class="flex flex-wrap gap-2">
						{#each insight.commit_hashes as hash}
							<span class="rounded bg-bg-base px-2 py-1 font-mono text-xs text-accent">
								{hash.slice(0, 7)}
							</span>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{/if}

	{#if supersededByInsight}
		<div class="flex items-start gap-3 rounded-md border border-warning/30 bg-warning/5 p-4">
			<AlertTriangle size={16} class="mt-0.5 shrink-0 text-warning" />
			<div class="text-sm">
				<span class="font-medium text-warning">This insight has been superseded</span>
				<p class="mt-1 text-text-secondary">
					Replaced by <a href="/insights/{supersededByInsight.id}" class="text-accent hover:underline">{supersededByInsight.title}</a>
				</p>
			</div>
		</div>
	{/if}

	{#if supersedesInsight}
		<div class="flex items-start gap-3 rounded-md border border-accent/30 bg-accent/5 p-4">
			<Sparkles size={16} class="mt-0.5 shrink-0 text-accent" />
			<div class="text-sm">
				<span class="font-medium text-accent">This insight supersedes an older one</span>
				<p class="mt-1 text-text-secondary">
					Replaces <a href="/insights/{supersedesInsight.id}" class="text-accent hover:underline">{supersedesInsight.title}</a>
				</p>
			</div>
		</div>
	{/if}

	{#if enrichment}
		<div class="rounded-md border border-border bg-bg-card p-6">
			<h2 class="mb-4 text-sm font-medium uppercase tracking-wider text-text-secondary">
				Enrichment
			</h2>

			<div class="space-y-5">
				{#if enrichment.quality_signals}
					{@const qs = enrichment.quality_signals}
					<div>
						<h3 class="mb-2 text-xs font-medium text-text-secondary">Quality Signals</h3>
						<div class="flex flex-wrap gap-2">
							{#each [
								{ label: "Alternatives", ok: qs.has_alternatives, show: insight.kind === "decision" },
								{ label: "Source files", ok: qs.has_source_files, show: true },
								{ label: "Structured data", ok: qs.has_structured, show: true },
								{ label: "Self-contained", ok: qs.is_self_contained, show: true },
							] as signal}
								{#if signal.show}
									<span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium {signal.ok ? 'bg-success/10 text-success' : 'bg-bg-hover text-text-secondary'}">
										{#if signal.ok}
											<CheckCircle size={12} />
										{:else}
											<Circle size={12} />
										{/if}
										{signal.label}
									</span>
								{/if}
							{/each}
						</div>
					</div>
				{/if}

				{#if relatedInsights.length > 0}
					<div>
						<h3 class="mb-2 flex items-center gap-1.5 text-xs font-medium text-text-secondary">
							<Link2 size={14} />
							Related Insights
						</h3>
						<div class="space-y-1">
							{#each relatedInsights as related}
								<a
									href="/insights/{related.id}"
									class="flex items-center gap-2 rounded bg-bg-base px-3 py-1.5 text-sm transition hover:bg-bg-hover"
								>
									<KindBadge kind={related.kind as InsightKind} />
									<span class="text-text-primary">{related.title}</span>
								</a>
							{/each}
						</div>
					</div>
				{/if}

				{#if enrichment.llm_enrichment}
					{@const llm = enrichment.llm_enrichment}
					<div>
						<h3 class="mb-2 flex items-center gap-1.5 text-xs font-medium text-text-secondary">
							<Sparkles size={14} />
							AI Analysis
						</h3>
						<div class="space-y-3">
							{#if typeof llm.quality_score === "number"}
								<div class="flex items-center gap-3">
									<span class="text-xs text-text-secondary">Quality score</span>
									<div class="flex items-center gap-1.5">
										<div class="h-2 w-24 rounded-full bg-bg-hover">
											<div
												class="h-2 rounded-full {llm.quality_score >= 7 ? 'bg-success' : llm.quality_score >= 4 ? 'bg-warning' : 'bg-danger'}"
												style="width: {llm.quality_score * 10}%"
											></div>
										</div>
										<span class="text-sm font-medium text-text-primary">{llm.quality_score}/10</span>
									</div>
								</div>
							{/if}

							{#if llm.contradiction_analysis}
								<div>
									<span class="text-xs text-text-secondary">Contradictions</span>
									<p class="mt-1 rounded bg-danger/5 border border-danger/20 px-3 py-2 text-sm text-text-primary">{llm.contradiction_analysis}</p>
								</div>
							{/if}
						</div>
					</div>
				{/if}
			</div>
		</div>
	{/if}

	{#if nav}
		<InsightNav prevId={nav.prev_id} nextId={nav.next_id} {filterParams} />
	{/if}
</div>
