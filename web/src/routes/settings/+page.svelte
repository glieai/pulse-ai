<script lang="ts">
	import { enhance } from "$app/forms";
	import type { CliProviderType, LlmProvider, LlmProviderStatus } from "@pulse/shared";
	import {
		Brain, Sparkles,
		Plus, Pencil, Trash2, Terminal, MessageSquare, Download, Loader2, Key
	} from "lucide-svelte";
	import type { ActionData, PageData } from "./$types";

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// ─── State ──────────────────────────────────────
	let editingApiKey = $state<LlmProvider | null>(null);
	let addingApiKey = $state<LlmProvider | null>(null);
	let installingTool = $state<string | null>(null);

	// ─── Derived ────────────────────────────────────
	const status = $derived(data.llmStatus);
	const cliTools = $derived(status?.cli_tools);
	const activeCliProvider = $derived(status?.cli_provider);
	const hasServerLlm = $derived(status?.active_provider != null || (data.soloMode && status?.cli_provider != null));

	const PROVIDER_DEFAULTS: Record<LlmProvider, string> = {
		anthropic: "claude-sonnet-4-5-20250929",
		openai: "gpt-4o",
	};

	/** Tool name used by the install API (claude/codex) */
	const CLI_TOOL_NAME: Record<string, string> = {
		"claude-cli": "claude",
		"codex-cli": "codex",
	};

	interface ProviderCard {
		type: CliProviderType;
		label: string;
		description: string;
		available: boolean;
		isCliTool: boolean;
		installHint?: string;
		llmProvider?: LlmProvider;
	}

	const cards: ProviderCard[] = $derived.by(() => [
		{
			type: "claude-cli",
			label: "Claude Code CLI",
			description: "Uses your Claude subscription — no API key needed",
			available: cliTools?.claude_cli ?? false,
			isCliTool: true,
		},
		{
			type: "codex-cli",
			label: "Codex CLI",
			description: "Uses your OpenAI subscription — no API key needed",
			available: cliTools?.codex_cli ?? false,
			isCliTool: true,
			installHint: "npm i -g @openai/codex",
		},
		{
			type: "anthropic",
			label: "Anthropic API",
			description: "Direct API access — pay per token",
			available: status?.anthropic?.available ?? false,
			isCliTool: false,
			llmProvider: "anthropic",
		},
		{
			type: "openai",
			label: "OpenAI API",
			description: "Direct API access — pay per token",
			available: status?.openai?.available ?? false,
			isCliTool: false,
			llmProvider: "openai",
		},
	]);

	function getApiStatus(provider: LlmProvider): LlmProviderStatus | undefined {
		return status?.[provider];
	}

</script>

<div class="space-y-8">
	<div>
		<h1 class="text-2xl font-bold text-text-primary">Settings</h1>
		<p class="mt-1 text-text-secondary">Manage AI providers and features</p>
	</div>

	<!-- ─── AI Providers ─────────────────────────── -->
	<div class="rounded-md border border-border bg-bg-card p-6">
		<h2 class="mb-1 flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-text-secondary">
			<Brain size={16} />
			AI Providers
		</h2>
		<p class="mb-5 text-sm text-text-secondary">
			Select which provider to use for insight generation, Ask Pulse, and enrichment.
		</p>

		{#if form?.providerSaved}
			<div class="mb-4 rounded-md border border-success/30 bg-success/5 p-3 text-sm text-success">
				Provider preference saved.
			</div>
		{/if}

		{#if form?.llmSaved}
			<div class="mb-4 rounded-md border border-success/30 bg-success/5 p-3 text-sm text-success">
				Provider settings saved.
			</div>
		{/if}

		{#if form?.llmError}
			<div class="mb-4 rounded-md border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
				{form.llmError}
			</div>
		{/if}

		{#if form?.installSuccess}
			<div class="mb-4 rounded-md border border-success/30 bg-success/5 p-3 text-sm text-success">
				CLI tool installed successfully.
			</div>
		{/if}

		{#if form?.installError}
			<div class="mb-4 rounded-md border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
				Install failed: {form.installError}
			</div>
		{/if}

		<div class="space-y-3">
			{#each cards as card (card.type)}
				{@const isActive = activeCliProvider === card.type}
				{@const ps = card.llmProvider ? getApiStatus(card.llmProvider) : undefined}

				<div class="overflow-hidden rounded-md border transition-colors {isActive ? 'border-accent/50 bg-accent/5' : 'border-border bg-bg-base'}">
					<!-- Main card: clickable to select -->
					<form method="POST" action="?/setCliProvider" use:enhance>
						<input type="hidden" name="cli_provider" value={card.type} />
						<button
							type="submit"
							class="w-full cursor-pointer px-4 py-3.5 text-left transition-colors hover:bg-bg-hover/50"
							onclick={() => { editingApiKey = null; addingApiKey = null; }}
						>
							<div class="flex items-start justify-between gap-3">
								<div class="flex items-start gap-3">
									{#if card.isCliTool}
										<Terminal size={16} class="mt-0.5 shrink-0 text-text-secondary" />
									{:else}
										<Key size={16} class="mt-0.5 shrink-0 text-text-secondary" />
									{/if}
									<div>
										<div class="flex items-center gap-2">
											<span class="text-sm font-medium text-text-primary">{card.label}</span>
											{#if isActive}
												<span class="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent">
													Active
												</span>
											{/if}
										</div>
										<p class="mt-0.5 text-xs text-text-secondary">{card.description}</p>

										<!-- CLI tool: detection status -->
										{#if card.isCliTool}
											{#if card.available}
												<p class="mt-1.5 text-xs font-medium text-success">Detected on system</p>
											{:else}
												<p class="mt-1.5 text-xs text-text-secondary/70">
													Not found{#if card.installHint}
														&ensp;<code class="rounded bg-bg-hover px-1 font-mono text-text-secondary">{card.installHint}</code>
													{/if}
												</p>
											{/if}
										{/if}

										<!-- API key: status -->
										{#if !card.isCliTool && ps}
											{#if ps.available}
												<div class="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5">
													<span class="text-xs font-medium text-success">Configured</span>
													{#if ps.source === "env"}
														<span class="text-xs text-text-secondary">via environment variable</span>
													{:else if ps.source === "pulse_env"}
														<span class="text-xs text-text-secondary">via PULSE_LLM override</span>
													{:else if ps.api_key}
														<span class="text-xs text-text-secondary">
															Key: <code class="rounded bg-bg-hover px-1 font-mono">{ps.api_key}</code>
														</span>
													{/if}
													{#if ps.model}
														<span class="text-xs text-text-secondary">
															Model: <code class="rounded bg-bg-hover px-1 font-mono">{ps.model}</code>
														</span>
													{/if}
												</div>
											{:else}
												<p class="mt-1.5 text-xs text-text-secondary/70">No API key configured</p>
											{/if}
										{/if}
									</div>
								</div>

								<!-- Availability dot -->
								<div class="mt-1 shrink-0">
									{#if card.available}
										<span class="inline-block h-2 w-2 rounded-full bg-success"></span>
									{:else}
										<span class="inline-block h-2 w-2 rounded-full bg-text-secondary/30"></span>
									{/if}
								</div>
							</div>
						</button>
					</form>

					<!-- CLI tool: install action -->
					{#if card.isCliTool && !card.available && data.soloMode}
						{@const toolName = CLI_TOOL_NAME[card.type]}
						<div class="border-t border-border/50 px-4 py-2">
							<form
								method="POST"
								action="?/installCliTool"
								use:enhance={() => {
									installingTool = toolName;
									return async ({ update }) => {
										installingTool = null;
										await update();
									};
								}}
							>
								<input type="hidden" name="tool" value={toolName} />
								<button
									type="submit"
									disabled={installingTool === toolName}
									class="flex items-center gap-1.5 text-xs text-text-secondary transition hover:text-accent disabled:opacity-50"
								>
									{#if installingTool === toolName}
										<Loader2 size={12} class="animate-spin" />
										Installing...
									{:else}
										<Download size={12} />
										Install
									{/if}
								</button>
							</form>
						</div>
					{/if}

					<!-- API key management actions -->
					{#if !card.isCliTool && card.llmProvider}
						{@const provider = card.llmProvider}
						{#if ps?.available && ps.source === "org_settings"}
							<div class="flex items-center gap-1 border-t border-border/50 px-4 py-2">
								<button
									type="button"
									onclick={() => { editingApiKey = editingApiKey === provider ? null : provider; addingApiKey = null; }}
									class="flex items-center gap-1.5 rounded px-2 py-1 text-xs text-text-secondary transition hover:bg-bg-hover hover:text-text-primary"
								>
									<Pencil size={12} />
									Edit
								</button>
								<form method="POST" action="?/removeProvider" use:enhance>
									<input type="hidden" name="provider" value={provider} />
									<button
										type="submit"
										class="flex items-center gap-1.5 rounded px-2 py-1 text-xs text-text-secondary transition hover:bg-danger/10 hover:text-danger"
									>
										<Trash2 size={12} />
										Remove
									</button>
								</form>
							</div>
						{:else if !ps?.available}
							<div class="border-t border-border/50 px-4 py-2">
								<button
									type="button"
									onclick={() => { addingApiKey = addingApiKey === provider ? null : provider; editingApiKey = null; }}
									class="flex items-center gap-1.5 text-xs text-text-secondary transition hover:text-accent"
								>
									<Plus size={12} />
									Add API Key
								</button>
							</div>
						{/if}

						<!-- Inline form: add or edit API key -->
						{#if editingApiKey === provider || addingApiKey === provider}
							<form
								method="POST"
								action="?/upsertProvider"
								use:enhance
								class="space-y-3 border-t border-border/50 px-4 py-3"
								onsubmit={() => { editingApiKey = null; addingApiKey = null; }}
							>
								<input type="hidden" name="provider" value={provider} />
								{#if addingApiKey === provider || (editingApiKey === provider && ps?.source === "org_settings")}
									<div>
										<label for="key_{provider}" class="block text-xs font-medium text-text-secondary">API Key</label>
										<input
											id="key_{provider}"
											name="api_key"
											type="password"
											required={addingApiKey === provider}
											class="mt-1 w-full rounded-md border border-border bg-bg-base px-3 py-1.5 text-sm text-text-primary placeholder-text-secondary/50 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
											placeholder={addingApiKey === provider ? "sk-..." : "Leave empty to keep current"}
										/>
									</div>
								{/if}
								<div>
									<label for="model_{provider}" class="block text-xs font-medium text-text-secondary">
										Model <span class="text-text-secondary/50">(optional)</span>
									</label>
									<input
										id="model_{provider}"
										name="model"
										type="text"
										value={ps?.model ?? ""}
										class="mt-1 w-full rounded-md border border-border bg-bg-base px-3 py-1.5 text-sm text-text-primary placeholder-text-secondary/50 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
										placeholder={PROVIDER_DEFAULTS[provider]}
									/>
								</div>
								<div class="flex items-center gap-2">
									<button
										type="submit"
										class="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white transition hover:bg-accent-hover"
									>
										Save
									</button>
									<button
										type="button"
										onclick={() => { editingApiKey = null; addingApiKey = null; }}
										class="rounded-md px-3 py-1.5 text-xs font-medium text-text-secondary transition hover:text-text-primary"
									>
										Cancel
									</button>
								</div>
							</form>
						{/if}
					{/if}
				</div>
			{/each}
		</div>

		<!-- Note: Ask Pulse web requires server-side LLM -->
		{#if !hasServerLlm}
			<div class="mt-4 rounded-md border border-border/50 bg-bg-base p-3">
				<div class="flex items-start gap-2.5">
					<MessageSquare size={14} class="mt-0.5 shrink-0 text-text-secondary" />
					<p class="text-xs text-text-secondary">
						<strong class="text-text-primary">Ask Pulse on the dashboard</strong> requires a configured LLM
						provider{#if data.soloMode} — either an API key (Anthropic or OpenAI) or a CLI tool (Claude Code or Codex).{:else} (Anthropic or OpenAI API key).{/if}
					</p>
				</div>
			</div>
		{/if}
	</div>

	<!-- ─── AI Features ──────────────────────────── -->
	<div class="rounded-md border border-border bg-bg-card p-6">
		<div class="mb-4 flex items-center justify-between">
			<h2 class="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-text-secondary">
				<Sparkles size={16} />
				AI Features
			</h2>
			{#if data.aiFeatures?.enrichment_enabled}
				<span class="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
					<span class="h-1.5 w-1.5 rounded-full bg-success"></span>
					Enabled
				</span>
			{:else}
				<span class="inline-flex items-center gap-1.5 rounded-full bg-bg-hover px-2.5 py-0.5 text-xs font-medium text-text-secondary">
					<span class="h-1.5 w-1.5 rounded-full bg-text-secondary/50"></span>
					Disabled
				</span>
			{/if}
		</div>

		<p class="mb-4 text-sm text-text-secondary">
			Control automatic AI-powered analysis that runs when new insights are created.
		</p>

		{#if form?.aiSaved}
			<div class="mb-4 rounded-md border border-success/30 bg-success/5 p-3 text-sm text-success">
				AI feature settings saved.
			</div>
		{/if}

		{#if form?.aiError}
			<div class="mb-4 rounded-md border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
				{form.aiError}
			</div>
		{/if}

		<form method="POST" action="?/saveAiFeatures" use:enhance class="space-y-4">
			<label class="flex cursor-pointer items-start gap-3">
				<input
					type="checkbox"
					name="enrichment_enabled"
					checked={data.aiFeatures?.enrichment_enabled ?? false}
					class="mt-0.5 h-4 w-4 rounded border-border bg-bg-base text-accent accent-accent"
				/>
				<div>
					<span class="text-sm font-medium text-text-primary">Automatic enrichment</span>
					<p class="text-xs text-text-secondary">
						Detect contradictions, suggest related links, and assess quality when new insights are created. Uses LLM tokens per insight.
					</p>
				</div>
			</label>

			<button
				type="submit"
				class="flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover"
			>
				<Sparkles size={16} />
				Save
			</button>
		</form>
	</div>

</div>
