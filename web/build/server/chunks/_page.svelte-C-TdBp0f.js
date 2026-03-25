import { A as ensure_array_like, h as attr_class, lt as stringify } from "./chunks-CJh457eN.js";
import "./exports-BAQMwGYm.js";
import { a as escape_html } from "./escaping-_LzeiXuq.js";
import { t as attr } from "./attributes-Dog1ICvy.js";
import "./index2-DDApFMp8.js";
import "./state.svelte-DH-R59PY.js";
import { t as page } from "./index3-C1R2c9j7.js";
import "./Icon-BJuLBbSM.js";
import { t as Zap } from "./zap-Dhd3B6cC.js";
import "./search-DPIUivoZ.js";
import { t as Arrow_right } from "./arrow-right-DsFCtroQ.js";
import { t as Download } from "./download-1kzMSqS6.js";
import { t as Message_square } from "./message-square-DzoGdiB_.js";
import "./markdown-BO5E_vk4.js";
import { n as InsightCard, t as EmptyState } from "./EmptyState-CwGCK6r9.js";

//#region .svelte-kit/adapter-bun/entries/pages/insights/_page.svelte.js
function AskPulse($$renderer, $$props) {
	$$renderer.component(($$renderer2) => {
		let { llmConfigured = false } = $$props;
		let query = "";
		let status = "idle";
		const activeKind = page.url.searchParams.get("kind");
		const activeRepo = page.url.searchParams.get("repo");
		$$renderer2.push(`<div class="rounded-md border border-border bg-bg-card p-5"><div class="mb-3 flex items-center gap-2">`);
		Message_square($$renderer2, {
			size: 16,
			class: "text-accent"
		});
		$$renderer2.push(`<!----> <h2 class="text-sm font-medium uppercase tracking-wider text-text-secondary">Ask Pulse</h2></div> `);
		if (!llmConfigured) {
			$$renderer2.push("<!--[-->");
			$$renderer2.push(`<p class="text-sm text-text-secondary">AI-powered answers require an LLM provider. <a href="/settings" class="text-accent hover:underline">Configure in Settings</a></p>`);
		} else {
			$$renderer2.push("<!--[!-->");
			$$renderer2.push(`<form class="relative"><input type="text"${attr("value", query)} placeholder="Ask a question about your codebase..."${attr("disabled", status === "streaming", true)} class="w-full rounded-lg border border-border bg-bg-base py-2.5 pl-4 pr-12 text-sm text-text-primary placeholder-text-secondary/50 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent disabled:opacity-50"/> <button type="submit"${attr("disabled", !query.trim(), true)} class="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-accent p-1.5 text-white transition hover:bg-accent-hover disabled:opacity-30">`);
			Arrow_right($$renderer2, { size: 14 });
			$$renderer2.push(`<!----></button></form> `);
			if (activeKind || activeRepo) {
				$$renderer2.push("<!--[-->");
				$$renderer2.push(`<p class="mt-1.5 text-xs text-text-secondary">Scoped to:  `);
				if (activeKind) {
					$$renderer2.push("<!--[-->");
					$$renderer2.push(`<span class="font-medium">${escape_html(activeKind.replace("_", " "))}</span>`);
				} else $$renderer2.push("<!--[!-->");
				$$renderer2.push(`<!--]--> `);
				if (activeKind && activeRepo) {
					$$renderer2.push("<!--[-->");
					$$renderer2.push(`<span>·</span>`);
				} else $$renderer2.push("<!--[!-->");
				$$renderer2.push(`<!--]--> `);
				if (activeRepo) {
					$$renderer2.push("<!--[-->");
					$$renderer2.push(`<span class="font-medium">${escape_html(activeRepo)}</span>`);
				} else $$renderer2.push("<!--[!-->");
				$$renderer2.push(`<!--]--></p>`);
			} else $$renderer2.push("<!--[!-->");
			$$renderer2.push(`<!--]--> `);
			$$renderer2.push("<!--[!-->");
			$$renderer2.push(`<!--]-->`);
		}
		$$renderer2.push(`<!--]--></div>`);
	});
}
function FilterBar($$renderer, $$props) {
	$$renderer.component(($$renderer2) => {
		let { repos = [] } = $$props;
		const allKinds = [
			"decision",
			"dead_end",
			"pattern",
			"context",
			"progress",
			"business"
		];
		const activeKind = page.url.searchParams.get("kind");
		const activeRepo = page.url.searchParams.get("repo");
		const kindStyles = {
			decision: {
				active: "bg-accent text-white",
				inactive: "bg-accent/8 text-accent hover:bg-accent/15"
			},
			dead_end: {
				active: "bg-danger text-white",
				inactive: "bg-danger/8 text-danger hover:bg-danger/15"
			},
			pattern: {
				active: "bg-success text-white",
				inactive: "bg-success/8 text-success hover:bg-success/15"
			},
			progress: {
				active: "bg-warning text-white",
				inactive: "bg-warning/8 text-warning hover:bg-warning/15"
			},
			context: {
				active: "bg-text-secondary text-bg-base",
				inactive: "bg-text-secondary/8 text-text-secondary hover:bg-text-secondary/15"
			},
			business: {
				active: "bg-purple-500 text-white",
				inactive: "bg-purple-500/8 text-purple-400 hover:bg-purple-500/15"
			}
		};
		$$renderer2.push(`<div class="flex flex-wrap items-center gap-2"><!--[-->`);
		const each_array = ensure_array_like(allKinds);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let kind = each_array[$$index];
			$$renderer2.push(`<button type="button"${attr_class(`rounded-full px-3 py-1 text-xs font-medium transition ${stringify(activeKind === kind ? kindStyles[kind].active : kindStyles[kind].inactive)}`)}>${escape_html(kind.replace("_", " "))}</button>`);
		}
		$$renderer2.push(`<!--]--> `);
		if (repos.length > 0) {
			$$renderer2.push("<!--[-->");
			$$renderer2.push(`<span class="mx-1 h-4 w-px bg-border"></span> <!--[-->`);
			const each_array_1 = ensure_array_like(repos);
			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let repo = each_array_1[$$index_1];
				$$renderer2.push(`<button type="button"${attr_class(`rounded-full px-3 py-1 text-xs font-medium transition ${stringify(activeRepo === repo ? "bg-text-primary text-bg-base" : "bg-bg-hover text-text-secondary hover:text-text-primary")}`)}>${escape_html(repo)}</button>`);
			}
			$$renderer2.push(`<!--]-->`);
		} else $$renderer2.push("<!--[!-->");
		$$renderer2.push(`<!--]--></div>`);
	});
}
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer2) => {
		let { data } = $$props;
		let extraInsights = [];
		const allInsights = [...data.insights, ...extraInsights];
		$$renderer2.push(`<div class="space-y-6"><div class="flex items-start justify-between"><div><h1 class="text-2xl font-bold text-text-primary">Insights</h1> <p class="mt-1 text-text-secondary">Browse your ${escape_html(data.soloMode ? "" : "team's ")}decisions, patterns, and learnings</p></div> `);
		if (data.user?.role === "owner" || data.user?.role === "admin") {
			$$renderer2.push("<!--[-->");
			$$renderer2.push(`<a href="/insights/export" class="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-text-secondary transition hover:border-accent hover:text-accent">`);
			Download($$renderer2, { size: 14 });
			$$renderer2.push(`<!----> Export JSON</a>`);
		} else $$renderer2.push("<!--[!-->");
		$$renderer2.push(`<!--]--></div> `);
		AskPulse($$renderer2, { llmConfigured: data.llmConfigured });
		$$renderer2.push(`<!----> `);
		FilterBar($$renderer2, { repos: data.repos });
		$$renderer2.push(`<!----> `);
		if (allInsights.length > 0) {
			$$renderer2.push("<!--[-->");
			$$renderer2.push(`<div class="space-y-3"><!--[-->`);
			const each_array = ensure_array_like(allInsights);
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let insight = each_array[$$index];
				InsightCard($$renderer2, { insight });
			}
			$$renderer2.push(`<!--]--></div> `);
			$$renderer2.push("<!--[!-->");
			$$renderer2.push(`<!--]--> `);
			if (allInsights.length > 20) {
				$$renderer2.push("<!--[-->");
				$$renderer2.push(`<p class="py-4 text-center text-sm text-text-secondary/50">All ${escape_html(data.total)} insights loaded</p>`);
			} else $$renderer2.push("<!--[!-->");
			$$renderer2.push(`<!--]-->`);
		} else {
			$$renderer2.push("<!--[!-->");
			EmptyState($$renderer2, {
				icon: Zap,
				headline: "No insights found",
				description: "Try adjusting your filters or create your first insight."
			});
		}
		$$renderer2.push(`<!--]--></div>`);
	});
}

//#endregion
export { _page as default };
//# sourceMappingURL=_page.svelte-C-TdBp0f.js.map