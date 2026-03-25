<script lang="ts">
	import { enhance } from "$app/forms";
	import { Shield } from "lucide-svelte";
	import type { ActionData } from "./$types";

	import { page } from "$app/state";

	let { form, data }: { form: ActionData; data: { googleOAuthEnabled?: boolean } } = $props();

	const show2FA = $derived(
		form?.requires2FA === true,
	);
	const tempToken = $derived(
		(form as { temp_token?: string } | null)?.temp_token ?? "",
	);
	const oauthError = $derived(page.url.searchParams.get("error"));
	const oauthErrorMessage = $derived(
		oauthError === "oauth_no_account"
			? "No account found for this Google account. You must be invited first."
			: oauthError === "oauth_failed"
				? "Google sign-in failed. Please try again."
				: oauthError === "oauth_invalid_state"
					? "Invalid OAuth state. Please try again."
					: null,
	);
</script>

<div class="flex min-h-screen items-center justify-center">
	<div class="w-full max-w-sm space-y-6 p-8">
		<div class="text-center">
			<h1 class="text-2xl font-bold text-text-primary">Pulse</h1>
			{#if show2FA}
				<p class="mt-2 text-sm text-text-secondary">Enter your authenticator code</p>
			{:else}
				<p class="mt-2 text-sm text-text-secondary">Sign in to your account</p>
			{/if}
		</div>

		{#if form?.error}
			<div class="rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
				{form.error}
			</div>
		{/if}

		{#if oauthErrorMessage}
			<div class="rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
				{oauthErrorMessage}
			</div>
		{/if}

		{#if show2FA}
			<!-- Step 2: 2FA code -->
			<form method="POST" action="?/verify2fa" use:enhance class="space-y-4">
				<input type="hidden" name="temp_token" value={tempToken} />

				<div class="flex flex-col items-center gap-3">
					<Shield size={32} class="text-accent" />
					<p class="text-center text-sm text-text-secondary">
						Open your authenticator app and enter the 6-digit code, or use a backup code.
					</p>
				</div>

				<div>
					<label for="code" class="block text-sm font-medium text-text-secondary">Code</label>
					<input
						id="code"
						name="code"
						type="text"
						inputmode="numeric"
						required
						autofocus
						class="mt-1 w-full rounded-md border border-border bg-bg-card px-3 py-2 text-center font-mono tracking-widest text-text-primary placeholder-text-secondary/50 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
						placeholder="000000"
					/>
				</div>

				<button
					type="submit"
					class="w-full rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover"
				>
					Verify
				</button>
			</form>

			<p class="text-center text-sm text-text-secondary">
				<a href="/login" class="text-accent hover:text-accent-hover">← Back to sign in</a>
			</p>

		{:else}
			<!-- Step 1: Email + password -->
			<form method="POST" action="?/login" use:enhance class="space-y-4">
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

				<div>
					<label for="password" class="block text-sm font-medium text-text-secondary">Password</label>
					<input
						id="password"
						name="password"
						type="password"
						required
						minlength={8}
						autocomplete="current-password"
						class="mt-1 w-full rounded-md border border-border bg-bg-card px-3 py-2 text-text-primary placeholder-text-secondary/50 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
						placeholder="Min. 8 characters"
					/>
				</div>

				<button
					type="submit"
					class="w-full rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover"
				>
					Sign in
				</button>
			</form>

			{#if data.googleOAuthEnabled}
				<div class="relative">
					<div class="absolute inset-0 flex items-center">
						<div class="w-full border-t border-border"></div>
					</div>
					<div class="relative flex justify-center text-xs">
						<span class="bg-bg-base px-2 text-text-secondary">or</span>
					</div>
				</div>

				<a
					href="/auth/google"
					class="flex w-full items-center justify-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-medium text-text-primary transition hover:bg-bg-hover"
				>
					<svg viewBox="0 0 24 24" class="h-4 w-4" aria-hidden="true">
						<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
						<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
						<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
						<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
					</svg>
					Sign in with Google
				</a>
			{/if}

			<p class="text-center text-sm text-text-secondary">
				<a href="/forgot-password" class="text-accent hover:text-accent-hover">Forgot password?</a>
			</p>

			<p class="text-center text-sm text-text-secondary">
				Accounts are created via invitation only.
			</p>
		{/if}
	</div>
</div>
