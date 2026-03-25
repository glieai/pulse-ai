import "./exports-BAQMwGYm.js";
import { a as escape_html } from "./escaping-_LzeiXuq.js";
import "./state.svelte-DH-R59PY.js";

//#region .svelte-kit/adapter-bun/entries/pages/forgot-password/_page.svelte.js
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer2) => {
		let { form } = $$props;
		$$renderer2.push(`<div class="flex min-h-screen items-center justify-center"><div class="w-full max-w-sm space-y-6 p-8"><div class="text-center"><h1 class="text-2xl font-bold text-text-primary">Reset password</h1> <p class="mt-2 text-sm text-text-secondary">Enter your email and we'll send a reset link.</p></div> `);
		if (form?.success) {
			$$renderer2.push("<!--[-->");
			$$renderer2.push(`<div class="rounded-md border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-accent">${escape_html(form.success)}</div>`);
		} else {
			$$renderer2.push("<!--[!-->");
			if (form?.error) {
				$$renderer2.push("<!--[-->");
				$$renderer2.push(`<div class="rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">${escape_html(form.error)}</div>`);
			} else $$renderer2.push("<!--[!-->");
			$$renderer2.push(`<!--]-->`);
		}
		$$renderer2.push(`<!--]--> `);
		if (!form?.success) {
			$$renderer2.push("<!--[-->");
			$$renderer2.push(`<form method="POST" class="space-y-4"><div><label for="email" class="block text-sm font-medium text-text-secondary">Email</label> <input id="email" name="email" type="email" required autocomplete="email" class="mt-1 w-full rounded-md border border-border bg-bg-card px-3 py-2 text-text-primary placeholder-text-secondary/50 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent" placeholder="you@company.com"/></div> <button type="submit" class="w-full rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover">Send reset link</button></form>`);
		} else $$renderer2.push("<!--[!-->");
		$$renderer2.push(`<!--]--> <p class="text-center text-sm text-text-secondary"><a href="/login" class="text-accent hover:text-accent-hover">Back to sign in</a></p></div></div>`);
	});
}

//#endregion
export { _page as default };
//# sourceMappingURL=_page.svelte-D-s7Aa9P.js.map