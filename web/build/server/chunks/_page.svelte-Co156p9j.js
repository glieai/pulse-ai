import { A as ensure_array_like, Q as sanitize_props, at as slot, lt as stringify, st as spread_props } from "./chunks-CJh457eN.js";
import "./exports-BAQMwGYm.js";
import { a as escape_html } from "./escaping-_LzeiXuq.js";
import { t as attr } from "./attributes-Dog1ICvy.js";
import "./state.svelte-DH-R59PY.js";
import { t as Icon } from "./Icon-BJuLBbSM.js";
import { t as User } from "./user-CJxhiZIR.js";
import { t as Triangle_alert } from "./triangle-alert-B4jz4zMC.js";
import { t as Shield } from "./shield-OOblfW-Q.js";
import { t as Key } from "./key-C5pLWAbD.js";

//#region .svelte-kit/adapter-bun/entries/pages/settings/account/_page.svelte.js
function Copy($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "copy" },
		sanitize_props($$props),
		{
			iconNode: [["rect", {
				"width": "14",
				"height": "14",
				"x": "8",
				"y": "8",
				"rx": "2",
				"ry": "2"
			}], ["path", { "d": "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" }]],
			children: ($$renderer2) => {
				$$renderer2.push(`<!--[-->`);
				slot($$renderer2, $$props, "default", {});
				$$renderer2.push(`<!--]-->`);
			},
			$$slots: { default: true }
		}
	]));
}
function Shield_check($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "shield-check" },
		sanitize_props($$props),
		{
			iconNode: [["path", { "d": "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" }], ["path", { "d": "m9 12 2 2 4-4" }]],
			children: ($$renderer2) => {
				$$renderer2.push(`<!--[-->`);
				slot($$renderer2, $$props, "default", {});
				$$renderer2.push(`<!--]-->`);
			},
			$$slots: { default: true }
		}
	]));
}
function Shield_off($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "shield-off" },
		sanitize_props($$props),
		{
			iconNode: [
				["path", { "d": "m2 2 20 20" }],
				["path", { "d": "M5 5a1 1 0 0 0-1 1v7c0 5 3.5 7.5 7.67 8.94a1 1 0 0 0 .67.01c2.35-.82 4.48-1.97 5.9-3.71" }],
				["path", { "d": "M9.309 3.652A12.252 12.252 0 0 0 11.24 2.28a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1v7a9.784 9.784 0 0 1-.08 1.264" }]
			],
			children: ($$renderer2) => {
				$$renderer2.push(`<!--[-->`);
				slot($$renderer2, $$props, "default", {});
				$$renderer2.push(`<!--]-->`);
			},
			$$slots: { default: true }
		}
	]));
}
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer2) => {
		let { data, form } = $$props;
		let submitting = "";
		let twoFaEnabled = data.me?.two_factor_enabled ?? false;
		const setupData = form?.setup2fa ? {
			secret: form.secret,
			qrCode: form.qrCode
		} : null;
		const backupCodes = form?.twoFaEnabled ? form.backupCodes ?? [] : [];
		$$renderer2.push(`<div class="space-y-8"><div><h1 class="text-xl font-semibold text-text-primary">Account</h1> <p class="mt-1 text-sm text-text-secondary">Manage your personal settings and security.</p></div> <div class="rounded-lg border border-border bg-bg-card p-6"><h2 class="mb-4 flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-text-secondary">`);
		User($$renderer2, { size: 14 });
		$$renderer2.push(`<!----> Profile</h2> <form method="POST" action="?/updateProfile" class="space-y-4"><div><label for="name" class="block text-xs font-medium text-text-secondary">Name</label> <input id="name" name="name" type="text" required${attr("value", data.me?.name ?? "")} class="mt-1 w-full max-w-sm rounded-md border border-border bg-bg-secondary px-3 py-2 text-sm text-text-primary outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"/></div> <div><label class="block text-xs font-medium text-text-secondary">Email</label> <p class="mt-1 text-sm text-text-primary">${escape_html(data.me?.email ?? "—")}</p> <p class="text-xs text-text-secondary">Email changes require contacting your administrator.</p></div> <div><span class="block text-xs font-medium text-text-secondary">Role</span> <p class="mt-1 text-sm capitalize text-text-primary">${escape_html(data.me?.role ?? "—")}</p></div> <button type="submit"${attr("disabled", submitting === "profile", true)} class="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover disabled:opacity-50">`);
		$$renderer2.push("<!--[!-->");
		$$renderer2.push(`<!--]--> Save</button></form></div> <div class="rounded-lg border border-border bg-bg-card p-6"><h2 class="mb-4 flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-text-secondary">`);
		Key($$renderer2, { size: 14 });
		$$renderer2.push(`<!----> Change Password</h2> <form method="POST" action="?/changePassword" class="space-y-4"><div><label for="current_password" class="block text-xs font-medium text-text-secondary">Current password</label> <input id="current_password" name="current_password" type="password" required autocomplete="current-password" class="mt-1 w-full max-w-sm rounded-md border border-border bg-bg-secondary px-3 py-2 text-sm text-text-primary outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"/></div> <div><label for="new_password" class="block text-xs font-medium text-text-secondary">New password</label> <input id="new_password" name="new_password" type="password" required minlength="8" autocomplete="new-password" class="mt-1 w-full max-w-sm rounded-md border border-border bg-bg-secondary px-3 py-2 text-sm text-text-primary outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"/></div> <div><label for="confirm_password" class="block text-xs font-medium text-text-secondary">Confirm new password</label> <input id="confirm_password" name="confirm_password" type="password" required minlength="8" autocomplete="new-password" class="mt-1 w-full max-w-sm rounded-md border border-border bg-bg-secondary px-3 py-2 text-sm text-text-primary outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"/></div> <button type="submit"${attr("disabled", submitting === "password", true)} class="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover disabled:opacity-50">`);
		$$renderer2.push("<!--[!-->");
		$$renderer2.push(`<!--]--> Change password</button></form></div> <div class="rounded-lg border border-border bg-bg-card p-6"><h2 class="mb-1 flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-text-secondary">`);
		if (twoFaEnabled) {
			$$renderer2.push("<!--[-->");
			Shield_check($$renderer2, {
				size: 14,
				class: "text-success"
			});
		} else {
			$$renderer2.push("<!--[!-->");
			Shield($$renderer2, { size: 14 });
		}
		$$renderer2.push(`<!--]--> Two-Factor Authentication</h2> <p class="mb-4 text-sm text-text-secondary">Add an extra layer of security to your account with an authenticator app (TOTP).</p> `);
		if (form?.twoFaEnabled && backupCodes.length > 0) {
			$$renderer2.push("<!--[-->");
			$$renderer2.push(`<div class="rounded-md border border-success/30 bg-success/5 p-4"><p class="mb-2 text-sm font-medium text-success">2FA enabled successfully!</p> <p class="mb-3 text-xs text-text-secondary">Save these backup codes in a safe place. Each can only be used once.</p> <div class="grid grid-cols-2 gap-1"><!--[-->`);
			const each_array = ensure_array_like(backupCodes);
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let code = each_array[$$index];
				$$renderer2.push(`<code class="rounded bg-bg-base px-2 py-1 text-xs font-mono text-text-primary">${escape_html(code)}</code>`);
			}
			$$renderer2.push(`<!--]--></div></div>`);
		} else {
			$$renderer2.push("<!--[!-->");
			if (twoFaEnabled) {
				$$renderer2.push("<!--[-->");
				$$renderer2.push(`<div class="flex items-center gap-3"><span class="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success"><span class="h-1.5 w-1.5 rounded-full bg-success"></span> Enabled</span> `);
				$$renderer2.push("<!--[-->");
				$$renderer2.push(`<button type="button" class="flex items-center gap-1.5 rounded-md border border-danger/30 px-3 py-1.5 text-sm text-danger transition hover:bg-danger/10">`);
				Shield_off($$renderer2, { size: 14 });
				$$renderer2.push(`<!----> Disable 2FA</button>`);
				$$renderer2.push(`<!--]--></div> `);
				$$renderer2.push("<!--[!-->");
				$$renderer2.push(`<!--]-->`);
			} else {
				$$renderer2.push("<!--[!-->");
				if (setupData) {
					$$renderer2.push("<!--[-->");
					$$renderer2.push(`<div class="space-y-4"><p class="text-sm text-text-secondary">Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.),
					then enter the 6-digit code to confirm.</p> <img${attr("src", setupData.qrCode)} alt="2FA QR Code" class="h-48 w-48 rounded-lg border border-border"/> <div><p class="mb-1 text-xs text-text-secondary">Or enter this key manually:</p> <code class="rounded bg-bg-secondary px-2 py-1 text-xs font-mono text-text-primary">${escape_html(setupData.secret)}</code></div> <form method="POST" action="?/confirm2fa" class="space-y-3"><div><label for="confirm-code" class="block text-xs font-medium text-text-secondary">6-digit code</label> <input id="confirm-code" name="code" type="text" inputmode="numeric" maxlength="6" required${attr("pattern", `d${stringify(6)}`)} class="mt-1 w-40 rounded-md border border-border bg-bg-secondary px-3 py-2 text-center font-mono text-sm tracking-widest text-text-primary outline-none transition focus:border-accent focus:ring-1 focus:ring-accent" placeholder="000000"/></div> <button type="submit" class="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover">Confirm and enable</button></form></div>`);
				} else {
					$$renderer2.push("<!--[!-->");
					$$renderer2.push(`<form method="POST" action="?/setup2fa"><button type="submit" class="flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm text-text-secondary transition hover:border-accent hover:text-accent">`);
					Shield($$renderer2, { size: 14 });
					$$renderer2.push(`<!----> Set up two-factor authentication</button></form>`);
				}
				$$renderer2.push(`<!--]-->`);
			}
			$$renderer2.push(`<!--]-->`);
		}
		$$renderer2.push(`<!--]--></div> <div class="rounded-lg border border-border bg-bg-card p-6"><h2 class="mb-1 flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-text-secondary">`);
		Key($$renderer2, { size: 14 });
		$$renderer2.push(`<!----> API Tokens</h2> <p class="mb-4 text-sm text-text-secondary">Create personal API tokens to authenticate the VS Code extension and CLI tools.</p> `);
		if (form?.token) {
			$$renderer2.push("<!--[-->");
			$$renderer2.push(`<div class="mb-4 rounded-md border border-warning/30 bg-warning/5 p-4"><div class="mb-2 flex items-center gap-2 text-sm font-medium text-warning">`);
			Triangle_alert($$renderer2, { size: 16 });
			$$renderer2.push(`<!----> Copy this token now — it won't be shown again</div> <div class="flex items-center gap-2"><code class="flex-1 overflow-x-auto rounded bg-bg-base px-3 py-2 font-mono text-xs text-text-primary">${escape_html(form.token)}</code> <button type="button" class="flex items-center gap-1 rounded-md bg-bg-hover px-3 py-2 text-sm text-text-secondary transition hover:text-text-primary">`);
			$$renderer2.push("<!--[!-->");
			Copy($$renderer2, { size: 14 });
			$$renderer2.push(`<!----> Copy`);
			$$renderer2.push(`<!--]--></button></div></div>`);
		} else $$renderer2.push("<!--[!-->");
		$$renderer2.push(`<!--]--> `);
		if (form?.tokenError) {
			$$renderer2.push("<!--[-->");
			$$renderer2.push(`<div class="mb-4 rounded-md border border-danger/30 bg-danger/5 p-3 text-sm text-danger">${escape_html(form.tokenError)}</div>`);
		} else $$renderer2.push("<!--[!-->");
		$$renderer2.push(`<!--]--> <form method="POST" action="?/createToken"><button type="submit" class="flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover">`);
		Key($$renderer2, { size: 16 });
		$$renderer2.push(`<!----> Generate new token</button></form></div></div>`);
	});
}

//#endregion
export { _page as default };
//# sourceMappingURL=_page.svelte-Co156p9j.js.map