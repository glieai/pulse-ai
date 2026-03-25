import "./exports-BAQMwGYm.js";
import { a as escape_html } from "./escaping-_LzeiXuq.js";
import { t as attr } from "./attributes-Dog1ICvy.js";
import "./state.svelte-DH-R59PY.js";

//#region .svelte-kit/adapter-bun/entries/pages/invite/_token_/_page.svelte.js
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer2) => {
		let { data, form } = $$props;
		$$renderer2.push(`<div class="flex min-h-screen items-center justify-center"><div class="w-full max-w-sm space-y-6 p-8"><div class="text-center"><h1 class="text-2xl font-bold text-text-primary">You're invited</h1> `);
		if (data.valid) {
			$$renderer2.push("<!--[-->");
			$$renderer2.push(`<p class="mt-2 text-sm text-text-secondary">Join <strong class="text-text-primary">${escape_html(data.org_name)}</strong> on Pulse</p>`);
		} else $$renderer2.push("<!--[!-->");
		$$renderer2.push(`<!--]--></div> `);
		if (data.reason === "already_accepted") {
			$$renderer2.push("<!--[-->");
			$$renderer2.push(`<div class="rounded-md border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-accent">This invitation has already been accepted. <a href="/login" class="ml-1 underline">Sign in to continue.</a></div>`);
		} else {
			$$renderer2.push("<!--[!-->");
			if (!data.valid) {
				$$renderer2.push("<!--[-->");
				$$renderer2.push(`<div class="rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">This invitation is invalid or has expired.</div>`);
			} else {
				$$renderer2.push("<!--[!-->");
				if (form?.success) {
					$$renderer2.push("<!--[-->");
					$$renderer2.push(`<div class="rounded-md border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-accent">Account created. <a href="/login" class="ml-1 underline">Sign in now.</a></div>`);
				} else {
					$$renderer2.push("<!--[!-->");
					if (form?.error) {
						$$renderer2.push("<!--[-->");
						$$renderer2.push(`<div class="rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">${escape_html(form.error)}</div>`);
					} else $$renderer2.push("<!--[!-->");
					$$renderer2.push(`<!--]--> <form method="POST" class="space-y-4"><div><label for="email" class="block text-sm font-medium text-text-secondary">Email</label> <input id="email" name="email" type="email"${attr("value", data.email)} readonly class="mt-1 w-full rounded-md border border-border bg-bg-secondary px-3 py-2 text-text-secondary outline-none"/></div> <div><label for="name" class="block text-sm font-medium text-text-secondary">Name</label> <input id="name" name="name" type="text" required class="mt-1 w-full rounded-md border border-border bg-bg-card px-3 py-2 text-text-primary placeholder-text-secondary/50 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent" placeholder="Your name"/></div> <div><label for="password" class="block text-sm font-medium text-text-secondary">Password</label> <input id="password" name="password" type="password" required${attr("minlength", 8)} autocomplete="new-password" class="mt-1 w-full rounded-md border border-border bg-bg-card px-3 py-2 text-text-primary placeholder-text-secondary/50 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent" placeholder="Min. 8 characters"/></div> <button type="submit" class="w-full rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover">Create account</button></form>`);
				}
				$$renderer2.push(`<!--]-->`);
			}
			$$renderer2.push(`<!--]-->`);
		}
		$$renderer2.push(`<!--]--></div></div>`);
	});
}

//#endregion
export { _page as default };
//# sourceMappingURL=_page.svelte-M2KxLLlK.js.map