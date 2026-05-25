<script lang="ts">
	import type { InsightKind } from "@pulse/shared";

	let { kind }: { kind: InsightKind } = $props();

	const styles: Record<InsightKind, string> = {
		decision: "bg-accent/10 text-accent",
		dead_end: "bg-danger/10 text-danger",
		pattern: "bg-success/10 text-success",
		progress: "bg-warning/10 text-warning",
		context: "bg-text-secondary/10 text-text-secondary",
		business: "bg-purple-500/10 text-purple-400",
	};
</script>

<span
	class="inline-block rounded-full px-2 py-0.5 text-xs font-medium {styles[kind]}"
>
	{kind.replace("_", " ")}
</span>
