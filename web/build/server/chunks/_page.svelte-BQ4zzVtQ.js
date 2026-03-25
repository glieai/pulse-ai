import { A as ensure_array_like, Q as sanitize_props, at as slot, h as attr_class, lt as stringify, st as spread_props, v as bind_props } from "./chunks-CJh457eN.js";
import "./exports-BAQMwGYm.js";
import { a as escape_html } from "./escaping-_LzeiXuq.js";
import { t as attr } from "./attributes-Dog1ICvy.js";
import "./index2-DDApFMp8.js";
import "./state.svelte-DH-R59PY.js";
import { t as page } from "./index3-C1R2c9j7.js";
import { t as Icon } from "./Icon-BJuLBbSM.js";
import { t as Search } from "./search-DPIUivoZ.js";
import { n as Chevron_right, t as Chevron_left } from "./chevron-right-DgYimo9b.js";
import "./markdown-BO5E_vk4.js";
import { n as InsightCard, t as EmptyState } from "./EmptyState-CwGCK6r9.js";

//#region .svelte-kit/adapter-bun/entries/pages/search/_page.svelte.js
function Search_x($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "search-x" },
		sanitize_props($$props),
		{
			iconNode: [
				["path", { "d": "m13.5 8.5-5 5" }],
				["path", { "d": "m8.5 8.5 5 5" }],
				["circle", {
					"cx": "11",
					"cy": "11",
					"r": "8"
				}],
				["path", { "d": "m21 21-4.3-4.3" }]
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
function SearchBar($$renderer, $$props) {
	$$renderer.component(($$renderer2) => {
		let { value = "", autofocus = false, prominent = false } = $$props;
		let query = value;
		function focus() {}
		$$renderer2.push(`<form class="relative">`);
		Search($$renderer2, {
			size: 20,
			class: "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary"
		});
		$$renderer2.push(`<!----> <input name="q" type="text"${attr("value", query)} placeholder="Search insights... (Cmd+K)"${attr_class(`w-full rounded-lg border border-border bg-bg-card py-3 pl-12 pr-4 text-text-primary placeholder-text-secondary/50 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent ${stringify(prominent ? "text-base" : "text-sm")}`)}${attr("autofocus", autofocus || void 0, true)}/></form>`);
		bind_props($$props, { focus });
	});
}
function Pagination($$renderer, $$props) {
	$$renderer.component(($$renderer2) => {
		let { total, limit, offset, baseUrl } = $$props;
		const currentPage = Math.floor(offset / limit) + 1;
		const totalPages = Math.max(1, Math.ceil(total / limit));
		const hasPrev = offset > 0;
		const hasNext = offset + limit < total;
		function pageUrl(newOffset) {
			const url = new URL(baseUrl, "http://localhost");
			url.searchParams.set("offset", String(newOffset));
			return `${url.pathname}${url.search}`;
		}
		if (totalPages > 1) {
			$$renderer2.push("<!--[-->");
			$$renderer2.push(`<div class="flex items-center justify-between"><a${attr("href", hasPrev ? pageUrl(Math.max(0, offset - limit)) : void 0)}${attr_class(`flex items-center gap-1 rounded-md px-3 py-2 text-sm transition ${stringify(hasPrev ? "text-text-secondary hover:bg-bg-hover hover:text-text-primary" : "pointer-events-none text-text-secondary/30")}`)}${attr("aria-disabled", !hasPrev)}>`);
			Chevron_left($$renderer2, { size: 16 });
			$$renderer2.push(`<!----> Previous</a> <span class="text-sm text-text-secondary">Page ${escape_html(currentPage)} of ${escape_html(totalPages)}</span> <a${attr("href", hasNext ? pageUrl(offset + limit) : void 0)}${attr_class(`flex items-center gap-1 rounded-md px-3 py-2 text-sm transition ${stringify(hasNext ? "text-text-secondary hover:bg-bg-hover hover:text-text-primary" : "pointer-events-none text-text-secondary/30")}`)}${attr("aria-disabled", !hasNext)}>Next `);
			Chevron_right($$renderer2, { size: 16 });
			$$renderer2.push(`<!----></a></div>`);
		} else $$renderer2.push("<!--[!-->");
		$$renderer2.push(`<!--]-->`);
	});
}
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer2) => {
		let { data } = $$props;
		$$renderer2.push(`<div class="space-y-6">`);
		SearchBar($$renderer2, {
			value: data.q,
			autofocus: true
		});
		$$renderer2.push(`<!----> `);
		if (data.q) {
			$$renderer2.push("<!--[-->");
			$$renderer2.push(`<p class="text-sm text-text-secondary">${escape_html(data.total)} result${escape_html(data.total !== 1 ? "s" : "")} for <span class="font-medium text-text-primary">"${escape_html(data.q)}"</span></p>`);
		} else $$renderer2.push("<!--[!-->");
		$$renderer2.push(`<!--]--> `);
		if (data.insights.length > 0) {
			$$renderer2.push("<!--[-->");
			$$renderer2.push(`<div class="space-y-3"><!--[-->`);
			const each_array = ensure_array_like(data.insights);
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let insight = each_array[$$index];
				InsightCard($$renderer2, { insight });
			}
			$$renderer2.push(`<!--]--></div> `);
			Pagination($$renderer2, {
				total: data.total,
				limit: data.limit,
				offset: data.offset,
				baseUrl: page.url.href
			});
			$$renderer2.push(`<!---->`);
		} else {
			$$renderer2.push("<!--[!-->");
			if (data.q) {
				$$renderer2.push("<!--[-->");
				EmptyState($$renderer2, {
					icon: Search_x,
					headline: "No results",
					description: "Try different keywords or check your spelling."
				});
			} else {
				$$renderer2.push("<!--[!-->");
				EmptyState($$renderer2, {
					headline: "Search your knowledge base",
					description: data.soloMode ? "Type a query above to find insights." : "Type a query above to find insights across your team."
				});
			}
			$$renderer2.push(`<!--]-->`);
		}
		$$renderer2.push(`<!--]--></div>`);
	});
}

//#endregion
export { _page as default };
//# sourceMappingURL=_page.svelte-BQ4zzVtQ.js.map