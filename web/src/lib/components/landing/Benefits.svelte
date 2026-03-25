<script lang="ts">
	import { Eye, ShieldAlert, Zap, UserPlus, Download } from "lucide-svelte";
	import { inview } from "./inview";

	type Audience = "developer" | "team";
	let { audience = "developer" }: { audience?: Audience } = $props();

	const sectionTitle = $derived(
		audience === "developer"
			? "Why developers use Pulse"
			: "Why teams use Pulse",
	);

	const benefitCards = $derived([
		{
			icon: Eye,
			title: "Watches everything automatically",
			body:
				audience === "developer"
					? "AI sessions, commits, pushes — Pulse monitors your workflow and creates insights automatically. Context from past decisions surfaces exactly when you need it."
					: "AI sessions, commits, pushes — Pulse monitors your workflow and creates insights automatically, using context from related past decisions specific to that part of your codebase.",
		},
		{
			icon: ShieldAlert,
			title: "Dead-ends that save weeks",
			body:
				audience === "developer"
					? "Failed approaches documented once, avoided forever. Your AI agents check your knowledge base before repeating past mistakes."
					: "Failed approaches documented once, avoided forever. Your AI agents check the knowledge base before repeating past mistakes.",
		},
		{
			icon: Zap,
			title: "Sub-10ms fast",
			body: "Instant results across your entire knowledge base. Performance that stays invisible in your workflow.",
		},
		audience === "developer"
			? {
					icon: Download,
					title: "Free and self-hosted",
					body: "Install in 2 minutes with Docker Compose. Your data stays on your machine. No account, no cloud, no strings attached.",
				}
			: {
					icon: UserPlus,
					title: "Onboarding in hours",
					body: "New developers query the knowledge base on day one. They understand the why behind the code, not just the what.",
				},
	]);
</script>

<section id="benefits" class="px-6 py-24 md:py-32">
	<div class="mx-auto max-w-5xl">
		<h2
			class="mb-16 text-center text-3xl font-bold text-text-primary sm:text-4xl"
			use:inview
		>
			{sectionTitle}
		</h2>

		<div class="grid gap-10 md:grid-cols-2 md:gap-12">
			{#each benefitCards as prop, i}
				<div class="flex gap-5" use:inview={{ delay: i * 120 }}>
					<div
						class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10"
					>
						<prop.icon size={22} class="text-accent" />
					</div>
					<div>
						<h3 class="mb-2 text-lg font-semibold text-text-primary">
							{prop.title}
						</h3>
						<p class="text-sm leading-relaxed text-text-secondary">
							{prop.body}
						</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
