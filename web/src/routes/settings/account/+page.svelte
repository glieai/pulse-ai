<script lang="ts">
	import { enhance } from "$app/forms";
	import { Shield, ShieldCheck, ShieldOff, Key, User, Loader2, Copy, Check, AlertTriangle } from "lucide-svelte";
	import { toast } from "svelte-sonner";
	import type { ActionData, PageData } from "./$types";

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let submitting = $state("");
	let copied = $state(false);

	async function copyToken() {
		if (form?.token) {
			await navigator.clipboard.writeText(form.token);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		}
	}

	// Reflect server-side 2FA state in local state for instant feedback
	let twoFaEnabled = $state(data.me?.two_factor_enabled ?? false);
	let showDisableForm = $state(false);

	// Form result with 2FA setup data
	const setupData = $derived(
		form?.setup2fa
			? { secret: (form as { secret?: string }).secret, qrCode: (form as { qrCode?: string }).qrCode }
			: null,
	);
	const backupCodes = $derived(
		form?.twoFaEnabled ? (form as { backupCodes?: string[] }).backupCodes ?? [] : [],
	);

	$effect(() => {
		if (form?.profileSaved) toast.success("Profile updated.");
		if (form?.profileError) toast.error(form.profileError);
		if (form?.passwordSaved) toast.success("Password changed successfully.");
		if (form?.passwordError) toast.error(form.passwordError);
		if (form?.twoFaEnabled) { toast.success("Two-factor authentication enabled."); twoFaEnabled = true; }
		if (form?.twoFaDisabled) { toast.success("Two-factor authentication disabled."); twoFaEnabled = false; showDisableForm = false; }
		if (form?.twoFaError) toast.error(form.twoFaError);
		if (form?.confirmError) toast.error(form.confirmError);
		if (form?.disableError) toast.error(form.disableError);
	});
</script>

<div class="space-y-8">
	<div>
		<h1 class="text-xl font-semibold text-text-primary">Account</h1>
		<p class="mt-1 text-sm text-text-secondary">Manage your personal settings and security.</p>
	</div>

	<!-- Profile -->
	<div class="rounded-lg border border-border bg-bg-card p-6">
		<h2 class="mb-4 flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-text-secondary">
			<User size={14} /> Profile
		</h2>

		<form method="POST" action="?/updateProfile" use:enhance={() => { submitting = "profile"; return async ({ update }) => { await update(); submitting = ""; }; }} class="space-y-4">
			<div>
				<label for="name" class="block text-xs font-medium text-text-secondary">Name</label>
				<input
					id="name"
					name="name"
					type="text"
					required
					value={data.me?.name ?? ""}
					class="mt-1 w-full max-w-sm rounded-md border border-border bg-bg-secondary px-3 py-2 text-sm text-text-primary outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
				/>
			</div>

			<div>
				<label class="block text-xs font-medium text-text-secondary">Email</label>
				<p class="mt-1 text-sm text-text-primary">{data.me?.email ?? "—"}</p>
				<p class="text-xs text-text-secondary">Email changes require contacting your administrator.</p>
			</div>

			<div>
				<span class="block text-xs font-medium text-text-secondary">Role</span>
				<p class="mt-1 text-sm capitalize text-text-primary">{data.me?.role ?? "—"}</p>
			</div>

			<button
				type="submit"
				disabled={submitting === "profile"}
				class="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover disabled:opacity-50"
			>
				{#if submitting === "profile"}<Loader2 size={14} class="animate-spin" />{/if}
				Save
			</button>
		</form>
	</div>

	<!-- Change Password -->
	<div class="rounded-lg border border-border bg-bg-card p-6">
		<h2 class="mb-4 flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-text-secondary">
			<Key size={14} /> Change Password
		</h2>

		<form method="POST" action="?/changePassword" use:enhance={() => { submitting = "password"; return async ({ update }) => { await update(); submitting = ""; }; }} class="space-y-4">
			<div>
				<label for="current_password" class="block text-xs font-medium text-text-secondary">
					Current password
				</label>
				<input
					id="current_password"
					name="current_password"
					type="password"
					required
					autocomplete="current-password"
					class="mt-1 w-full max-w-sm rounded-md border border-border bg-bg-secondary px-3 py-2 text-sm text-text-primary outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
				/>
			</div>

			<div>
				<label for="new_password" class="block text-xs font-medium text-text-secondary">
					New password
				</label>
				<input
					id="new_password"
					name="new_password"
					type="password"
					required
					minlength="8"
					autocomplete="new-password"
					class="mt-1 w-full max-w-sm rounded-md border border-border bg-bg-secondary px-3 py-2 text-sm text-text-primary outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
				/>
			</div>

			<div>
				<label for="confirm_password" class="block text-xs font-medium text-text-secondary">
					Confirm new password
				</label>
				<input
					id="confirm_password"
					name="confirm_password"
					type="password"
					required
					minlength="8"
					autocomplete="new-password"
					class="mt-1 w-full max-w-sm rounded-md border border-border bg-bg-secondary px-3 py-2 text-sm text-text-primary outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
				/>
			</div>

			<button
				type="submit"
				disabled={submitting === "password"}
				class="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover disabled:opacity-50"
			>
				{#if submitting === "password"}<Loader2 size={14} class="animate-spin" />{/if}
				Change password
			</button>
		</form>
	</div>

	<!-- Two-Factor Authentication -->
	<div class="rounded-lg border border-border bg-bg-card p-6">
		<h2 class="mb-1 flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-text-secondary">
			{#if twoFaEnabled}
				<ShieldCheck size={14} class="text-success" />
			{:else}
				<Shield size={14} />
			{/if}
			Two-Factor Authentication
		</h2>
		<p class="mb-4 text-sm text-text-secondary">
			Add an extra layer of security to your account with an authenticator app (TOTP).
		</p>

		{#if form?.twoFaEnabled && backupCodes.length > 0}
			<!-- Show backup codes after successful enable -->
			<div class="rounded-md border border-success/30 bg-success/5 p-4">
				<p class="mb-2 text-sm font-medium text-success">2FA enabled successfully!</p>
				<p class="mb-3 text-xs text-text-secondary">
					Save these backup codes in a safe place. Each can only be used once.
				</p>
				<div class="grid grid-cols-2 gap-1">
					{#each backupCodes as code}
						<code class="rounded bg-bg-base px-2 py-1 text-xs font-mono text-text-primary">{code}</code>
					{/each}
				</div>
			</div>

		{:else if twoFaEnabled}
			<div class="flex items-center gap-3">
				<span class="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
					<span class="h-1.5 w-1.5 rounded-full bg-success"></span>
					Enabled
				</span>

				{#if !showDisableForm}
					<button
						type="button"
						onclick={() => (showDisableForm = true)}
						class="flex items-center gap-1.5 rounded-md border border-danger/30 px-3 py-1.5 text-sm text-danger transition hover:bg-danger/10"
					>
						<ShieldOff size={14} /> Disable 2FA
					</button>
				{/if}
			</div>

			{#if showDisableForm}
				<form method="POST" action="?/disable2fa" use:enhance class="mt-4 space-y-3">
					<div>
						<label for="disable-code" class="block text-xs font-medium text-text-secondary">
							Enter your 6-digit authenticator code to confirm
						</label>
						<input
							id="disable-code"
							name="code"
							type="text"
							inputmode="numeric"
							maxlength="6"
							required
							pattern="\d{6}"
							class="mt-1 w-40 rounded-md border border-border bg-bg-secondary px-3 py-2 text-center font-mono text-sm tracking-widest text-text-primary outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
							placeholder="000000"
						/>
					</div>
					<div class="flex items-center gap-2">
						<button
							type="submit"
							class="rounded-md bg-danger px-3 py-1.5 text-sm font-medium text-white transition hover:bg-danger/80"
						>
							Disable 2FA
						</button>
						<button
							type="button"
							onclick={() => (showDisableForm = false)}
							class="rounded-md px-3 py-1.5 text-sm text-text-secondary transition hover:text-text-primary"
						>
							Cancel
						</button>
					</div>
				</form>
			{/if}

		{:else if setupData}
			<!-- 2FA setup in progress — show QR code -->
			<div class="space-y-4">
				<p class="text-sm text-text-secondary">
					Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.),
					then enter the 6-digit code to confirm.
				</p>

				<img src={setupData.qrCode} alt="2FA QR Code" class="h-48 w-48 rounded-lg border border-border" />

				<div>
					<p class="mb-1 text-xs text-text-secondary">Or enter this key manually:</p>
					<code class="rounded bg-bg-secondary px-2 py-1 text-xs font-mono text-text-primary">
						{setupData.secret}
					</code>
				</div>

				<form method="POST" action="?/confirm2fa" use:enhance class="space-y-3">
					<div>
						<label for="confirm-code" class="block text-xs font-medium text-text-secondary">
							6-digit code
						</label>
						<input
							id="confirm-code"
							name="code"
							type="text"
							inputmode="numeric"
							maxlength="6"
							required
							pattern="\d{6}"
							class="mt-1 w-40 rounded-md border border-border bg-bg-secondary px-3 py-2 text-center font-mono text-sm tracking-widest text-text-primary outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
							placeholder="000000"
						/>
					</div>
					<button
						type="submit"
						class="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover"
					>
						Confirm and enable
					</button>
				</form>
			</div>

		{:else}
			<!-- Not enabled, not in setup -->
			<form method="POST" action="?/setup2fa" use:enhance>
				<button
					type="submit"
					class="flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm text-text-secondary transition hover:border-accent hover:text-accent"
				>
					<Shield size={14} /> Set up two-factor authentication
				</button>
			</form>
		{/if}
	</div>

	<!-- API Tokens -->
	<div class="rounded-lg border border-border bg-bg-card p-6">
		<h2 class="mb-1 flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-text-secondary">
			<Key size={14} /> API Tokens
		</h2>
		<p class="mb-4 text-sm text-text-secondary">
			Create personal API tokens to authenticate the VS Code extension and CLI tools.
		</p>

		{#if form?.token}
			<div class="mb-4 rounded-md border border-warning/30 bg-warning/5 p-4">
				<div class="mb-2 flex items-center gap-2 text-sm font-medium text-warning">
					<AlertTriangle size={16} />
					Copy this token now — it won't be shown again
				</div>
				<div class="flex items-center gap-2">
					<code class="flex-1 overflow-x-auto rounded bg-bg-base px-3 py-2 font-mono text-xs text-text-primary">
						{form.token}
					</code>
					<button
						type="button"
						onclick={copyToken}
						class="flex items-center gap-1 rounded-md bg-bg-hover px-3 py-2 text-sm text-text-secondary transition hover:text-text-primary"
					>
						{#if copied}
							<Check size={14} class="text-success" />
							Copied
						{:else}
							<Copy size={14} />
							Copy
						{/if}
					</button>
				</div>
			</div>
		{/if}

		{#if form?.tokenError}
			<div class="mb-4 rounded-md border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
				{form.tokenError}
			</div>
		{/if}

		<form method="POST" action="?/createToken" use:enhance>
			<button
				type="submit"
				class="flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover"
			>
				<Key size={16} />
				Generate new token
			</button>
		</form>
	</div>
</div>
