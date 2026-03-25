<script lang="ts">
	let {
		title = "Terminal",
		lines,
	}: {
		title?: string;
		lines: Array<{ text: string; class?: string }>;
	} = $props();
</script>

<div class="flex h-full flex-col overflow-hidden rounded-xl border border-border/50 bg-[#0c0c0e] shadow-2xl">
	<div class="flex items-center gap-2 border-b border-border/30 px-4 py-3">
		<span class="h-2.5 w-2.5 rounded-full bg-[#ff5f57]"></span>
		<span class="h-2.5 w-2.5 rounded-full bg-[#febc2e]"></span>
		<span class="h-2.5 w-2.5 rounded-full bg-[#28c840]"></span>
		<span class="ml-2 text-xs text-text-secondary/40">{title}</span>
	</div>
	<div class="flex-1 p-5 font-mono text-[13px] leading-relaxed">
		{#each lines as line}
			<div class={line.class ?? "text-text-secondary/70"}>{line.text}</div>
		{/each}
	</div>
</div>
