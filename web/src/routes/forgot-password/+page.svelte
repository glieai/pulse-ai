<script lang="ts">
	import { enhance } from "$app/forms";
	import type { ActionData } from "./$types";

	let { form }: { form: ActionData } = $props();
</script>

<div class="flex min-h-screen items-center justify-center">
	<div class="w-full max-w-sm space-y-6 p-8">
		<div class="text-center">
			<h1 class="text-2xl font-bold text-text-primary">Reset password</h1>
			<p class="mt-2 text-sm text-text-secondary">
				Enter your email and we'll send a reset link.
			</p>
		</div>

		{#if form?.success}
			<div class="rounded-md border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-accent">
				{form.success}
			</div>
		{:else if form?.error}
			<div class="rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
				{form.error}
			</div>
		{/if}

		{#if !form?.success}
			<form method="POST" use:enhance class="space-y-4">
				<div>
					<label for="email" class="block text-sm font-medium text-text-secondary">Email</label>
					<input
						id="email"
						name="email"
						type="email"
						required
						autocomplete="email"
						class="mt-1 w-full rounded-md border border-border bg-bg-card px-3 py-2 text-text-primary placeholder-text-secondary/50 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
						placeholder="you@company.com"
					/>
				</div>

				<button
					type="submit"
					class="w-full rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover"
				>
					Send reset link
				</button>
			</form>
		{/if}

		<p class="text-center text-sm text-text-secondary">
			<a href="/login" class="text-accent hover:text-accent-hover">Back to sign in</a>
		</p>
	</div>
</div>
