import { A as ensure_array_like, Q as sanitize_props, at as slot, st as spread_props } from "./chunks-CJh457eN.js";
import "./exports-BAQMwGYm.js";
import { a as escape_html } from "./escaping-_LzeiXuq.js";
import { t as attr } from "./attributes-Dog1ICvy.js";
import "./state.svelte-DH-R59PY.js";
import { t as Icon } from "./Icon-BJuLBbSM.js";
import { t as File_text } from "./file-text-DyUvkZ9a.js";
import { t as Trash_2 } from "./trash-2-6sJxdUwD.js";

//#region .svelte-kit/adapter-bun/entries/pages/insights/drafts/_page.svelte.js
function Clock($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "clock" },
		sanitize_props($$props),
		{
			iconNode: [["circle", {
				"cx": "12",
				"cy": "12",
				"r": "10"
			}], ["polyline", { "points": "12 6 12 12 16 14" }]],
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
		const kindLabel = {
			decision: "Decision",
			dead_end: "Dead-end",
			pattern: "Pattern",
			context: "Context",
			progress: "Progress",
			business: "Business"
		};
		function formatDate(d) {
			if (!d) return "—";
			return new Date(d).toLocaleDateString("en", {
				month: "short",
				day: "numeric",
				year: "numeric"
			});
		}
		$$renderer2.push(`<div class="space-y-6"><div class="flex items-start justify-between"><div><h1 class="text-xl font-semibold text-text-primary">Pending Drafts</h1> <p class="mt-1 text-sm text-text-secondary">${escape_html(data.total)} draft${escape_html(data.total === 1 ? "" : "s")} waiting — publish via <code class="rounded bg-bg-secondary px-1 py-0.5 text-xs">pulse publish</code> in your terminal.</p></div> <a href="/insights" class="text-sm text-text-secondary transition hover:text-text-primary">← Published insights</a></div> `);
		if (form?.error) {
			$$renderer2.push("<!--[-->");
			$$renderer2.push(`<div class="rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">${escape_html(form.error)}</div>`);
		} else $$renderer2.push("<!--[!-->");
		$$renderer2.push(`<!--]--> `);
		if (data.drafts.length === 0) {
			$$renderer2.push("<!--[-->");
			$$renderer2.push(`<div class="flex flex-col items-center justify-center rounded-lg border border-border bg-bg-card py-16 text-center">`);
			File_text($$renderer2, {
				size: 32,
				class: "mb-3 text-text-secondary/40"
			});
			$$renderer2.push(`<!----> <p class="text-sm font-medium text-text-primary">No pending drafts</p> <p class="mt-1 text-xs text-text-secondary">Drafts created by Claude Code or the MCP server will appear here.</p></div>`);
		} else {
			$$renderer2.push("<!--[!-->");
			$$renderer2.push(`<div class="space-y-2"><!--[-->`);
			const each_array = ensure_array_like(data.drafts);
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let draft = each_array[$$index];
				$$renderer2.push(`<div class="group flex items-start justify-between rounded-lg border border-border bg-bg-card px-4 py-3 transition hover:border-border-hover"><div class="min-w-0 flex-1"><div class="flex items-center gap-2"><span class="shrink-0 rounded-full bg-bg-secondary px-2 py-0.5 text-xs font-medium text-text-secondary">${escape_html(kindLabel[draft.kind] ?? draft.kind)}</span> `);
				if (draft.repo) {
					$$renderer2.push("<!--[-->");
					$$renderer2.push(`<span class="truncate text-xs text-text-secondary/60">${escape_html(draft.repo)}</span>`);
				} else $$renderer2.push("<!--[!-->");
				$$renderer2.push(`<!--]--></div> <p class="mt-1.5 truncate text-sm font-medium text-text-primary">${escape_html(draft.title)}</p> <div class="mt-1 flex items-center gap-1 text-xs text-text-secondary/60">`);
				Clock($$renderer2, { size: 11 });
				$$renderer2.push(`<!----> <span>${escape_html(formatDate(draft.created_at))}</span></div></div> <form method="POST" action="?/delete" class="ml-3 shrink-0"><input type="hidden" name="id"${attr("value", draft.id)}/> <button type="submit" class="rounded p-1.5 text-text-secondary/40 opacity-0 transition hover:bg-danger/10 hover:text-danger group-hover:opacity-100" title="Delete draft">`);
				Trash_2($$renderer2, { size: 14 });
				$$renderer2.push(`<!----></button></form></div>`);
			}
			$$renderer2.push(`<!--]--></div>`);
		}
		$$renderer2.push(`<!--]--></div>`);
	});
}

//#endregion
export { _page as default };
//# sourceMappingURL=_page.svelte-GPmkai-r.js.map