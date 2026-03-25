import { A as ensure_array_like, Q as sanitize_props, at as slot, g as attr_style, h as attr_class, lt as stringify, st as spread_props } from "./chunks-CJh457eN.js";
import { a as escape_html } from "./escaping-_LzeiXuq.js";
import "./attributes-Dog1ICvy.js";
import { t as Icon } from "./Icon-BJuLBbSM.js";
import { t as File_text } from "./file-text-DyUvkZ9a.js";
import { n as Users, t as Bar_chart_3 } from "./users-BDr2TncJ.js";

//#region .svelte-kit/adapter-bun/entries/pages/analytics/_page.svelte.js
function Git_branch($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "git-branch" },
		sanitize_props($$props),
		{
			iconNode: [
				["line", {
					"x1": "6",
					"x2": "6",
					"y1": "3",
					"y2": "15"
				}],
				["circle", {
					"cx": "18",
					"cy": "6",
					"r": "3"
				}],
				["circle", {
					"cx": "6",
					"cy": "18",
					"r": "3"
				}],
				["path", { "d": "M18 9a9 9 0 0 1-9 9" }]
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
function Trending_up($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "trending-up" },
		sanitize_props($$props),
		{
			iconNode: [["polyline", { "points": "22 7 13.5 15.5 8.5 10.5 2 17" }], ["polyline", { "points": "16 7 22 7 22 13" }]],
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
		let { data } = $$props;
		const analytics = data.analytics;
		const kindColors = {
			decision: "bg-blue-500",
			dead_end: "bg-red-400",
			pattern: "bg-emerald-500",
			context: "bg-slate-400",
			progress: "bg-amber-500",
			business: "bg-violet-500"
		};
		const kindLabels = {
			decision: "Decision",
			dead_end: "Dead-end",
			pattern: "Pattern",
			context: "Context",
			progress: "Progress",
			business: "Business"
		};
		const maxWeekCount = analytics?.insights_per_week ? Math.max(...analytics.insights_per_week.map((w) => w.count), 1) : 1;
		const totalKindCount = analytics?.kind_distribution ? analytics.kind_distribution.reduce((sum, k) => sum + k.count, 0) : 0;
		function formatWeek(dateStr) {
			return new Date(dateStr).toLocaleDateString("en", {
				month: "short",
				day: "numeric"
			});
		}
		$$renderer2.push(`<div class="space-y-8"><div><h1 class="text-2xl font-bold text-text-primary">Analytics</h1> <p class="mt-1 text-text-secondary">Track your team's knowledge capture activity</p></div> `);
		if (!analytics) {
			$$renderer2.push("<!--[-->");
			$$renderer2.push(`<p class="text-sm text-text-secondary">No analytics data available.</p>`);
		} else {
			$$renderer2.push("<!--[!-->");
			$$renderer2.push(`<div class="grid grid-cols-3 gap-4"><div class="rounded-lg border border-border bg-bg-card p-5"><div class="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-text-secondary">`);
			File_text($$renderer2, { size: 14 });
			$$renderer2.push(`<!----> Total Insights</div> <p class="mt-2 text-3xl font-bold text-text-primary">${escape_html(analytics.totals.total)}</p></div> <div class="rounded-lg border border-border bg-bg-card p-5"><div class="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-text-secondary">`);
			Trending_up($$renderer2, { size: 14 });
			$$renderer2.push(`<!----> Published</div> <p class="mt-2 text-3xl font-bold text-accent">${escape_html(analytics.totals.published)}</p></div> <div class="rounded-lg border border-border bg-bg-card p-5"><div class="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-text-secondary">`);
			File_text($$renderer2, { size: 14 });
			$$renderer2.push(`<!----> Drafts</div> <p class="mt-2 text-3xl font-bold text-text-secondary">${escape_html(analytics.totals.drafts)}</p></div></div> <div class="rounded-lg border border-border bg-bg-card p-6"><h2 class="mb-4 flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-text-secondary">`);
			Bar_chart_3($$renderer2, { size: 14 });
			$$renderer2.push(`<!----> Insights per Week</h2> `);
			if (analytics.insights_per_week.length === 0) {
				$$renderer2.push("<!--[-->");
				$$renderer2.push(`<p class="py-8 text-center text-sm text-text-secondary">No activity in the last 12 weeks</p>`);
			} else {
				$$renderer2.push("<!--[!-->");
				$$renderer2.push(`<div class="flex items-end gap-1.5" style="height: 160px;"><!--[-->`);
				const each_array = ensure_array_like(analytics.insights_per_week);
				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let week = each_array[$$index];
					$$renderer2.push(`<div class="group relative flex flex-1 flex-col items-center justify-end"><div class="w-full rounded-t bg-accent/80 transition group-hover:bg-accent"${attr_style(`height: ${stringify(Math.max(week.count / maxWeekCount * 140, 4))}px;`)}></div> <span class="mt-1 text-[10px] text-text-secondary/60">${escape_html(formatWeek(week.week))}</span> <div class="pointer-events-none absolute -top-8 rounded bg-bg-secondary px-2 py-1 text-xs font-medium text-text-primary opacity-0 shadow-sm transition group-hover:opacity-100">${escape_html(week.count)}</div></div>`);
				}
				$$renderer2.push(`<!--]--></div>`);
			}
			$$renderer2.push(`<!--]--></div> <div class="grid grid-cols-2 gap-6"><div class="rounded-lg border border-border bg-bg-card p-6"><h2 class="mb-4 text-sm font-medium uppercase tracking-wider text-text-secondary">By Kind</h2> `);
			if (analytics.kind_distribution.length === 0) {
				$$renderer2.push("<!--[-->");
				$$renderer2.push(`<p class="text-sm text-text-secondary">No data yet</p>`);
			} else {
				$$renderer2.push("<!--[!-->");
				$$renderer2.push(`<div class="space-y-2.5"><!--[-->`);
				const each_array_1 = ensure_array_like(analytics.kind_distribution);
				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let item = each_array_1[$$index_1];
					$$renderer2.push(`<div class="flex items-center gap-3"><span class="w-20 shrink-0 text-xs text-text-secondary">${escape_html(kindLabels[item.kind] ?? item.kind)}</span> <div class="flex-1"><div class="h-5 overflow-hidden rounded-full bg-bg-secondary"><div${attr_class(`h-full rounded-full transition-all ${stringify(kindColors[item.kind] ?? "bg-slate-400")}`)}${attr_style(`width: ${stringify(item.count / totalKindCount * 100)}%;`)}></div></div></div> <span class="w-8 shrink-0 text-right text-xs font-medium text-text-primary">${escape_html(item.count)}</span></div>`);
				}
				$$renderer2.push(`<!--]--></div>`);
			}
			$$renderer2.push(`<!--]--></div> <div class="rounded-lg border border-border bg-bg-card p-6"><h2 class="mb-4 flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-text-secondary">`);
			Git_branch($$renderer2, { size: 14 });
			$$renderer2.push(`<!----> Top Repos</h2> `);
			if (analytics.top_repos.length === 0) {
				$$renderer2.push("<!--[-->");
				$$renderer2.push(`<p class="text-sm text-text-secondary">No data yet</p>`);
			} else {
				$$renderer2.push("<!--[!-->");
				$$renderer2.push(`<div class="space-y-2"><!--[-->`);
				const each_array_2 = ensure_array_like(analytics.top_repos);
				for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
					let repo = each_array_2[i];
					$$renderer2.push(`<div class="flex items-center justify-between rounded-md px-2 py-1.5 transition hover:bg-bg-secondary"><div class="flex items-center gap-2"><span class="w-4 text-right text-xs text-text-secondary/50">${escape_html(i + 1)}</span> <span class="text-sm text-text-primary">${escape_html(repo.repo)}</span></div> <span class="text-xs font-medium text-text-secondary">${escape_html(repo.count)}</span></div>`);
				}
				$$renderer2.push(`<!--]--></div>`);
			}
			$$renderer2.push(`<!--]--></div></div> <div class="rounded-lg border border-border bg-bg-card p-6"><h2 class="mb-4 flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-text-secondary">`);
			Users($$renderer2, { size: 14 });
			$$renderer2.push(`<!----> Top Contributors</h2> `);
			if (analytics.top_contributors.length === 0) {
				$$renderer2.push("<!--[-->");
				$$renderer2.push(`<p class="text-sm text-text-secondary">No data yet</p>`);
			} else {
				$$renderer2.push("<!--[!-->");
				$$renderer2.push(`<div class="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5"><!--[-->`);
				const each_array_3 = ensure_array_like(analytics.top_contributors);
				for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
					let contributor = each_array_3[$$index_3];
					$$renderer2.push(`<div class="flex flex-col items-center gap-1 rounded-lg border border-border p-3 text-center"><div class="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">${escape_html(contributor.author_name.charAt(0).toUpperCase())}</div> <span class="truncate text-xs font-medium text-text-primary">${escape_html(contributor.author_name)}</span> <span class="text-[10px] text-text-secondary">${escape_html(contributor.count)} insights</span></div>`);
				}
				$$renderer2.push(`<!--]--></div>`);
			}
			$$renderer2.push(`<!--]--></div>`);
		}
		$$renderer2.push(`<!--]--></div>`);
	});
}

//#endregion
export { _page as default };
//# sourceMappingURL=_page.svelte-4zK2x5Hr.js.map