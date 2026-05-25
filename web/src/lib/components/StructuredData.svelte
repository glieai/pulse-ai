<script lang="ts">
	import type { InsightKind } from "@pulse/shared";

	let { kind, structured }: { kind: InsightKind; structured: Record<string, unknown> } = $props();

	const sectionTitle: Record<InsightKind, string> = {
		decision: "Decision rationale",
		dead_end: "What went wrong",
		pattern: "Pattern details",
		progress: "Milestone",
		context: "Context",
		business: "Business constraint",
	};

	/** Known fields per kind — everything else goes to fallback */
	const knownFields: Record<InsightKind, string[]> = {
		decision: ["why", "alternatives"],
		dead_end: ["why_failed", "time_spent", "error_type", "workaround"],
		pattern: ["applies_to", "gotchas"],
		progress: ["milestone", "deliverables"],
		context: ["summary"],
		business: ["problem", "constraints", "drove_decisions"],
	};

	const extraFields = $derived(
		Object.entries(structured).filter(
			([key]) => !(knownFields[kind] ?? []).includes(key),
		),
	);
</script>

<div class="rounded-md border border-border bg-bg-card p-6">
	<h2 class="mb-4 text-sm font-medium uppercase tracking-wider text-text-secondary">
		{sectionTitle[kind] ?? "Structured Data"}
	</h2>

	{#if kind === "decision"}
		<div class="space-y-4">
			{#if typeof structured.why === "string"}
				<div>
					<dt class="text-xs font-medium uppercase tracking-wider text-text-secondary">Rationale</dt>
					<dd class="mt-1 text-sm text-text-primary">{structured.why}</dd>
				</div>
			{/if}

			{#if Array.isArray(structured.alternatives) && structured.alternatives.length > 0}
				<div>
					<dt class="text-xs font-medium uppercase tracking-wider text-text-secondary">Alternatives considered</dt>
					<dd class="mt-2 space-y-2">
						{#each structured.alternatives as alt}
							{#if typeof alt === "string"}
								<div class="rounded bg-bg-base px-3 py-2 text-sm text-text-primary">{alt}</div>
							{:else if alt && typeof alt === "object" && "what" in alt}
								<div class="rounded border border-border/50 bg-bg-base px-3 py-2">
									<span class="text-sm font-medium text-text-primary">{alt.what}</span>
									{#if alt.why_rejected}
										<p class="mt-0.5 text-xs text-text-secondary">{alt.why_rejected}</p>
									{/if}
								</div>
							{:else}
								<div class="rounded bg-bg-base px-3 py-2 text-sm text-text-primary">{JSON.stringify(alt)}</div>
							{/if}
						{/each}
					</dd>
				</div>
			{/if}
		</div>

	{:else if kind === "dead_end"}
		<div class="space-y-4">
			{#if typeof structured.why_failed === "string"}
				<div>
					<dt class="text-xs font-medium uppercase tracking-wider text-text-secondary">Why it failed</dt>
					<dd class="mt-1 text-sm text-text-primary">{structured.why_failed}</dd>
				</div>
			{/if}

			{#if structured.time_spent || structured.error_type}
				<div class="flex flex-wrap gap-2">
					{#if typeof structured.time_spent === "string"}
						<span class="inline-flex items-center gap-1 rounded-full bg-danger/10 px-2.5 py-0.5 text-xs font-medium text-danger">
							Time spent: {structured.time_spent}
						</span>
					{/if}
					{#if typeof structured.error_type === "string"}
						<span class="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2.5 py-0.5 text-xs font-medium text-warning">
							{structured.error_type}
						</span>
					{/if}
				</div>
			{/if}

			{#if typeof structured.workaround === "string"}
				<div>
					<dt class="text-xs font-medium uppercase tracking-wider text-text-secondary">Workaround</dt>
					<dd class="mt-1 text-sm text-text-primary">{structured.workaround}</dd>
				</div>
			{/if}
		</div>

	{:else if kind === "pattern"}
		<div class="space-y-4">
			{#if typeof structured.applies_to === "string"}
				<div>
					<dt class="text-xs font-medium uppercase tracking-wider text-text-secondary">Applies to</dt>
					<dd class="mt-1 text-sm text-text-primary">{structured.applies_to}</dd>
				</div>
			{/if}

			{#if typeof structured.gotchas === "string"}
				<div>
					<dt class="text-xs font-medium uppercase tracking-wider text-text-secondary">Gotchas</dt>
					<dd class="mt-1 text-sm text-text-primary">{structured.gotchas}</dd>
				</div>
			{/if}
		</div>

	{:else if kind === "progress"}
		<div class="space-y-4">
			{#if typeof structured.milestone === "string"}
				<div>
					<dt class="text-xs font-medium uppercase tracking-wider text-text-secondary">Milestone</dt>
					<dd class="mt-1 text-sm font-medium text-text-primary">{structured.milestone}</dd>
				</div>
			{/if}

			{#if Array.isArray(structured.deliverables) && structured.deliverables.length > 0}
				<div>
					<dt class="text-xs font-medium uppercase tracking-wider text-text-secondary">Deliverables</dt>
					<dd class="mt-2 space-y-1">
						{#each structured.deliverables as item}
							<div class="flex items-start gap-2 text-sm text-text-primary">
								<span class="mt-0.5 text-success">&#10003;</span>
								<span>{typeof item === "string" ? item : JSON.stringify(item)}</span>
							</div>
						{/each}
					</dd>
				</div>
			{/if}
		</div>

	{:else if kind === "context"}
		<div class="space-y-4">
			{#if typeof structured.summary === "string"}
				<div>
					<dt class="text-xs font-medium uppercase tracking-wider text-text-secondary">Summary</dt>
					<dd class="mt-1 text-sm text-text-primary">{structured.summary}</dd>
				</div>
			{/if}
		</div>

	{:else if kind === "business"}
		<div class="space-y-4">
			{#if typeof structured.problem === "string"}
				<div>
					<dt class="text-xs font-medium uppercase tracking-wider text-text-secondary">Problem</dt>
					<dd class="mt-1 text-sm text-text-primary">{structured.problem}</dd>
				</div>
			{/if}

			{#if Array.isArray(structured.constraints) && structured.constraints.length > 0}
				<div>
					<dt class="text-xs font-medium uppercase tracking-wider text-text-secondary">Constraints</dt>
					<dd class="mt-2 space-y-1">
						{#each structured.constraints as constraint}
							<div class="flex items-start gap-2 text-sm text-text-primary">
								<span class="mt-0.5 text-purple-400">&#8226;</span>
								<span>{typeof constraint === "string" ? constraint : JSON.stringify(constraint)}</span>
							</div>
						{/each}
					</dd>
				</div>
			{/if}

			{#if Array.isArray(structured.drove_decisions) && structured.drove_decisions.length > 0}
				<div>
					<dt class="text-xs font-medium uppercase tracking-wider text-text-secondary">Drove decisions</dt>
					<dd class="mt-2 space-y-1">
						{#each structured.drove_decisions as decision}
							<div class="flex items-start gap-2 text-sm text-text-primary">
								<span class="mt-0.5 text-accent">&#8594;</span>
								<span>{typeof decision === "string" ? decision : JSON.stringify(decision)}</span>
							</div>
						{/each}
					</dd>
				</div>
			{/if}
		</div>
	{/if}

	<!-- Fallback: extra fields not recognized by kind -->
	{#if extraFields.length > 0}
		<div class="space-y-3" class:mt-4={knownFields[kind]?.some((k) => k in structured)}>
			{#each extraFields as [key, value]}
				<div>
					<dt class="text-xs font-medium uppercase tracking-wider text-text-secondary">
						{key.replace(/_/g, " ")}
					</dt>
					<dd class="mt-1 text-sm text-text-primary">
						{#if typeof value === "string"}
							{value}
						{:else if Array.isArray(value)}
							<ul class="list-inside list-disc space-y-0.5">
								{#each value as item}
									<li>{typeof item === "string" ? item : JSON.stringify(item)}</li>
								{/each}
							</ul>
						{:else}
							<pre class="overflow-x-auto rounded bg-bg-base p-2 text-xs font-mono">{JSON.stringify(value, null, 2)}</pre>
						{/if}
					</dd>
				</div>
			{/each}
		</div>
	{/if}
</div>
