import "./chunks-CJh457eN.js";
import "./exports-BAQMwGYm.js";
import { a as escape_html } from "./escaping-_LzeiXuq.js";
import { t as attr } from "./attributes-Dog1ICvy.js";
import "./state.svelte-DH-R59PY.js";
import "./Icon-BJuLBbSM.js";
import { t as Building_2 } from "./building-2-CSJhQvCu.js";
import { t as Trash_2 } from "./trash-2-6sJxdUwD.js";
import { t as X } from "./x-wAHTW-_A.js";

//#region .svelte-kit/adapter-bun/entries/pages/settings/org/_page.svelte.js
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer2) => {
		let { data, form } = $$props;
		let submitting = "";
		let orgNameValue = data.org?.name ?? "";
		function formatDate(d) {
			if (!d) return "";
			return new Date(d).toLocaleDateString("en", {
				month: "long",
				day: "numeric",
				year: "numeric"
			});
		}
		const isPending = data.org?.deletion_scheduled_at != null || form?.deletionScheduled === true;
		const scheduledAt = form?.scheduledAt ?? data.org?.deletion_scheduled_at;
		$$renderer2.push(`<div class="space-y-8"><div><h1 class="text-xl font-semibold text-text-primary">Organization</h1> <p class="mt-1 text-sm text-text-secondary">Manage your organization settings.</p></div> <div class="rounded-lg border border-border bg-bg-card p-6"><h2 class="mb-4 text-sm font-medium uppercase tracking-wider text-text-secondary">`);
		Building_2($$renderer2, {
			class: "mb-0.5 inline-block",
			size: 14
		});
		$$renderer2.push(`<!----> Details</h2> <form method="POST" action="?/updateName" class="space-y-4"><div><label for="org-name" class="block text-xs font-medium text-text-secondary">Organization name</label> <input id="org-name" name="name" type="text" required minlength="2"${attr("value", orgNameValue)} class="mt-1 w-full max-w-sm rounded-md border border-border bg-bg-secondary px-3 py-2 text-sm text-text-primary outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"/></div> <div class="flex items-center gap-3 text-sm text-text-secondary"><span>Plan: <strong class="capitalize text-text-primary">${escape_html(data.org?.plan ?? "free")}</strong></span> <span>·</span> <span>Slug: <code class="rounded bg-bg-secondary px-1 text-xs">${escape_html(data.org?.slug ?? "")}</code></span></div> <button type="submit"${attr("disabled", submitting === "name", true)} class="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover disabled:opacity-50">`);
		$$renderer2.push("<!--[!-->");
		$$renderer2.push(`<!--]--> Save</button></form></div> <div class="rounded-lg border border-danger/30 bg-bg-card p-6"><h2 class="mb-1 flex items-center gap-2 text-sm font-medium text-danger">`);
		Trash_2($$renderer2, { size: 14 });
		$$renderer2.push(`<!----> Danger Zone</h2> <p class="mb-4 text-sm text-text-secondary">Permanently delete this organization and all its data. This action cannot be undone.</p> `);
		if (isPending && scheduledAt) {
			$$renderer2.push("<!--[-->");
			$$renderer2.push(`<div class="rounded-md border border-danger/30 bg-danger/5 p-4"><p class="text-sm font-medium text-danger">Deletion scheduled for ${escape_html(formatDate(scheduledAt))}</p> <p class="mt-1 text-xs text-text-secondary">All data will be permanently removed. You can still cancel before this date.</p> <form method="POST" action="?/cancelDeletion" class="mt-3"><button type="submit" class="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-text-secondary transition hover:border-accent hover:text-accent">`);
			X($$renderer2, { size: 14 });
			$$renderer2.push(`<!----> Cancel deletion</button></form></div>`);
		} else {
			$$renderer2.push("<!--[!-->");
			$$renderer2.push("<!--[-->");
			$$renderer2.push(`<button type="button" class="rounded-md border border-danger/30 px-4 py-2 text-sm font-medium text-danger transition hover:bg-danger/10">Delete organization…</button>`);
			$$renderer2.push(`<!--]-->`);
		}
		$$renderer2.push(`<!--]--></div></div>`);
	});
}

//#endregion
export { _page as default };
//# sourceMappingURL=_page.svelte-_vrhl3Kp.js.map