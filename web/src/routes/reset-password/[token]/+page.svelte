<script lang="ts">
	import { enhance } from "$app/forms";
	import type { ActionData, PageData } from "./$types";

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<div class="flex min-h-screen items-center justify-center">
	<div class="w-full max-w-sm space-y-6 p-8">
		<div class="text-center">
			<h1 class="text-2xl font-bold text-text-primary">Set new password</h1>
			{#if data.email}
				<p class="mt-2 text-sm text-text-secondary">for {data.email}</p>
			{/if}
		</div>

		{#if !data.valid}
			<div class="rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
				This reset link is invalid or has expired.
				<a href="/forgot-password" class="ml-1 underline">Request a new one.</a>
			</div>
		{:else if form?.success}
			<div class="rounded-md border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-accent">
				Password updated.
				<a href="/login" class="ml-1 underline">Sign in now.</a>
			</div>
		{:else}
			{#if form?.error}
				<div
					class="rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"
				>
					{form.error}
				</div>
			{/if}

			<form method="POST" use:enhance class="space-y-4">
				<div>
					<label for="password" class="block text-sm font-medium text-text-secondary"
						>New password</label
					>
					<input
						id="password"
						name="password"
						type="password"
						required
						minlength={8}
						autocomplete="new-password"
						class="mt-1 w-full rounded-md border border-border bg-bg-card px-3 py-2 text-text-primary placeholder-text-secondary/50 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
						placeholder="Min. 8 characters"
					/>
				</div>

				<button
					type="submit"
					class="w-full rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover"
				>
					Update password
				</button>
			</form>
		{/if}

		<p class="text-center text-sm text-text-secondary">
			<a href="/login" class="text-accent hover:text-accent-hover">Back to sign in</a>
		</p>
	</div>
</div>
