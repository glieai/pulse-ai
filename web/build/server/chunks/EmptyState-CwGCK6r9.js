import { lt as stringify } from "./chunks-CJh457eN.js";
import { a as escape_html } from "./escaping-_LzeiXuq.js";
import { t as attr } from "./attributes-Dog1ICvy.js";
import { t as page } from "./index3-C1R2c9j7.js";
import { t as Search } from "./search-DPIUivoZ.js";
import { r as stripMarkdown, t as KindBadge } from "./markdown-BO5E_vk4.js";

//#region .svelte-kit/adapter-bun/chunks/EmptyState.js
function InsightCard($$renderer, $$props) {
	$$renderer.component(($$renderer2) => {
		let { insight } = $$props;
		const soloMode = page.data.soloMode;
		const firstRef = insight.session_refs?.[0];
		const metaParts = (() => {
			const parts = [];
			if (!soloMode && insight.author_name) parts.push(insight.author_name);
			if (firstRef?.tool) parts.push(firstRef.tool);
			if (firstRef?.model) parts.push(firstRef.model);
			if (insight.trigger_type) parts.push(insight.trigger_type);
			return parts;
		})();
		const filterParams = (() => {
			const kind = page.url.searchParams.get("kind");
			const repo = page.url.searchParams.get("repo");
			const params = new URLSearchParams();
			params.set("nav", "1");
			if (kind) params.set("kind", kind);
			if (repo) params.set("repo", repo);
			return `?${params.toString()}`;
		})();
		function relativeTime(iso) {
			const diff = Date.now() - new Date(iso).getTime();
			const mins = Math.floor(diff / 6e4);
			if (mins < 1) return "just now";
			if (mins < 60) return `${mins}m ago`;
			const hours = Math.floor(mins / 60);
			if (hours < 24) return `${hours}h ago`;
			const days = Math.floor(hours / 24);
			if (days < 30) return `${days}d ago`;
			return new Date(iso).toLocaleDateString();
		}
		$$renderer2.push(`<a${attr("href", `/insights/${stringify(insight.id)}${stringify(filterParams)}`)} class="block rounded-md border border-border bg-bg-card p-4 transition hover:bg-bg-hover"><div class="flex items-center gap-2">`);
		KindBadge($$renderer2, { kind: insight.kind });
		$$renderer2.push(`<!----> <span class="text-xs text-text-secondary">${escape_html(insight.repo)}</span> `);
		if (insight.enrichment?.superseded_by_id) {
			$$renderer2.push("<!--[-->");
			$$renderer2.push(`<span class="inline-flex items-center rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">superseded</span>`);
		} else $$renderer2.push("<!--[!-->");
		$$renderer2.push(`<!--]--> <span class="ml-auto text-xs text-text-secondary">${escape_html(relativeTime(insight.created_at))}</span></div> <h3 class="mt-2 font-medium text-text-primary">${escape_html(insight.title)}</h3> <p class="mt-1 line-clamp-2 text-sm text-text-secondary">${escape_html(stripMarkdown(insight.body))}</p> `);
		if (metaParts.length > 0) {
			$$renderer2.push("<!--[-->");
			$$renderer2.push(`<div class="mt-2 text-xs text-text-secondary/50">${escape_html(metaParts.join(" · "))}</div>`);
		} else $$renderer2.push("<!--[!-->");
		$$renderer2.push(`<!--]--></a>`);
	});
}
function EmptyState($$renderer, $$props) {
	let { icon: Icon = Search, headline = "Nothing found", description = "", actionHref = "", actionLabel = "" } = $$props;
	$$renderer.push(`<div class="rounded-md border border-border bg-bg-card p-12 text-center"><div class="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-bg-hover">`);
	$$renderer.push("<!---->");
	Icon?.($$renderer, {
		size: 20,
		class: "text-text-secondary"
	});
	$$renderer.push(`<!----></div> <h3 class="text-lg font-medium text-text-primary">${escape_html(headline)}</h3> `);
	if (description) {
		$$renderer.push("<!--[-->");
		$$renderer.push(`<p class="mt-1 text-sm text-text-secondary">${escape_html(description)}</p>`);
	} else $$renderer.push("<!--[!-->");
	$$renderer.push(`<!--]--> `);
	if (actionHref && actionLabel) {
		$$renderer.push("<!--[-->");
		$$renderer.push(`<a${attr("href", actionHref)} class="mt-4 inline-block rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover">${escape_html(actionLabel)}</a>`);
	} else $$renderer.push("<!--[!-->");
	$$renderer.push(`<!--]--></div>`);
}

//#endregion
export { InsightCard as n, EmptyState as t };
//# sourceMappingURL=EmptyState-CwGCK6r9.js.map