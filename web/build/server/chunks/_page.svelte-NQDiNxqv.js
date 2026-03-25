import { A as ensure_array_like, Q as sanitize_props, at as slot, g as attr_style, h as attr_class, lt as stringify, st as spread_props } from "./chunks-CJh457eN.js";
import "./exports-BAQMwGYm.js";
import { a as escape_html } from "./escaping-_LzeiXuq.js";
import { t as attr } from "./attributes-Dog1ICvy.js";
import "./state.svelte-DH-R59PY.js";
import { t as Icon } from "./Icon-BJuLBbSM.js";
import { t as User } from "./user-CJxhiZIR.js";
import { t as File_code } from "./file-code-dQ4lkGhI.js";
import { t as Message_square } from "./message-square-DzoGdiB_.js";
import { n as Chevron_right, t as Chevron_left } from "./chevron-right-DgYimo9b.js";
import { n as renderMarkdown, t as KindBadge } from "./markdown-BO5E_vk4.js";
import { t as Triangle_alert } from "./triangle-alert-B4jz4zMC.js";
import { t as Sparkles } from "./sparkles-DJ2WuDuc.js";

//#region .svelte-kit/adapter-bun/entries/pages/insights/_id_/_page.svelte.js
function html(value) {
	return "<!---->" + String(value ?? "") + "<!---->";
}
function Arrow_left($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "arrow-left" },
		sanitize_props($$props),
		{
			iconNode: [["path", { "d": "m12 19-7-7 7-7" }], ["path", { "d": "M19 12H5" }]],
			children: ($$renderer2) => {
				$$renderer2.push(`<!--[-->`);
				slot($$renderer2, $$props, "default", {});
				$$renderer2.push(`<!--]-->`);
			},
			$$slots: { default: true }
		}
	]));
}
function Bot($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "bot" },
		sanitize_props($$props),
		{
			iconNode: [
				["path", { "d": "M12 8V4H8" }],
				["rect", {
					"width": "16",
					"height": "12",
					"x": "4",
					"y": "8",
					"rx": "2"
				}],
				["path", { "d": "M2 14h2" }],
				["path", { "d": "M20 14h2" }],
				["path", { "d": "M15 13v2" }],
				["path", { "d": "M9 13v2" }]
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
function Calendar($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "calendar" },
		sanitize_props($$props),
		{
			iconNode: [
				["path", { "d": "M8 2v4" }],
				["path", { "d": "M16 2v4" }],
				["rect", {
					"width": "18",
					"height": "18",
					"x": "3",
					"y": "4",
					"rx": "2"
				}],
				["path", { "d": "M3 10h18" }]
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
function Circle_check_big($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "circle-check-big" },
		sanitize_props($$props),
		{
			iconNode: [["path", { "d": "M22 11.08V12a10 10 0 1 1-5.93-9.14" }], ["path", { "d": "m9 11 3 3L22 4" }]],
			children: ($$renderer2) => {
				$$renderer2.push(`<!--[-->`);
				slot($$renderer2, $$props, "default", {});
				$$renderer2.push(`<!--]-->`);
			},
			$$slots: { default: true }
		}
	]));
}
function Circle($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "circle" },
		sanitize_props($$props),
		{
			iconNode: [["circle", {
				"cx": "12",
				"cy": "12",
				"r": "10"
			}]],
			children: ($$renderer2) => {
				$$renderer2.push(`<!--[-->`);
				slot($$renderer2, $$props, "default", {});
				$$renderer2.push(`<!--]-->`);
			},
			$$slots: { default: true }
		}
	]));
}
function Git_commit_horizontal($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "git-commit-horizontal" },
		sanitize_props($$props),
		{
			iconNode: [
				["circle", {
					"cx": "12",
					"cy": "12",
					"r": "3"
				}],
				["line", {
					"x1": "3",
					"x2": "9",
					"y1": "12",
					"y2": "12"
				}],
				["line", {
					"x1": "15",
					"x2": "21",
					"y1": "12",
					"y2": "12"
				}]
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
function Link_2($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "link-2" },
		sanitize_props($$props),
		{
			iconNode: [
				["path", { "d": "M9 17H7A5 5 0 0 1 7 7h2" }],
				["path", { "d": "M15 7h2a5 5 0 1 1 0 10h-2" }],
				["line", {
					"x1": "8",
					"x2": "16",
					"y1": "12",
					"y2": "12"
				}]
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
function InsightNav($$renderer, $$props) {
	$$renderer.component(($$renderer2) => {
		let { prevId, nextId, filterParams = "" } = $$props;
		function navUrl(id) {
			return `/insights/${id}${filterParams}`;
		}
		$$renderer2.push(`<nav class="flex items-center justify-between rounded-md border border-border bg-bg-card px-4 py-3">`);
		if (prevId) {
			$$renderer2.push("<!--[-->");
			$$renderer2.push(`<a${attr("href", navUrl(prevId))} class="flex items-center gap-1.5 text-sm text-text-secondary transition hover:text-text-primary" data-sveltekit-preload-data="">`);
			Chevron_left($$renderer2, { size: 18 });
			$$renderer2.push(`<!----> <span class="hidden sm:inline">Newer</span></a>`);
		} else {
			$$renderer2.push("<!--[!-->");
			$$renderer2.push(`<span class="flex items-center gap-1.5 text-sm text-text-secondary/30">`);
			Chevron_left($$renderer2, { size: 18 });
			$$renderer2.push(`<!----> <span class="hidden sm:inline">Newer</span></span>`);
		}
		$$renderer2.push(`<!--]--> <span class="text-xs text-text-secondary/50"><kbd class="hidden rounded border border-border px-1.5 py-0.5 font-mono text-[10px] sm:inline-block">←</kbd> <kbd class="hidden rounded border border-border px-1.5 py-0.5 font-mono text-[10px] sm:inline-block">→</kbd></span> `);
		if (nextId) {
			$$renderer2.push("<!--[-->");
			$$renderer2.push(`<a${attr("href", navUrl(nextId))} class="flex items-center gap-1.5 text-sm text-text-secondary transition hover:text-text-primary" data-sveltekit-preload-data=""><span class="hidden sm:inline">Older</span> `);
			Chevron_right($$renderer2, { size: 18 });
			$$renderer2.push(`<!----></a>`);
		} else {
			$$renderer2.push("<!--[!-->");
			$$renderer2.push(`<span class="flex items-center gap-1.5 text-sm text-text-secondary/30"><span class="hidden sm:inline">Older</span> `);
			Chevron_right($$renderer2, { size: 18 });
			$$renderer2.push(`<!----></span>`);
		}
		$$renderer2.push(`<!--]--></nav>`);
	});
}
function StructuredData($$renderer, $$props) {
	$$renderer.component(($$renderer2) => {
		let { kind, structured } = $$props;
		const sectionTitle = {
			decision: "Decision rationale",
			dead_end: "What went wrong",
			pattern: "Pattern details",
			progress: "Milestone",
			context: "Context",
			business: "Business constraint"
		};
		const knownFields = {
			decision: ["why", "alternatives"],
			dead_end: [
				"why_failed",
				"time_spent",
				"error_type",
				"workaround"
			],
			pattern: ["applies_to", "gotchas"],
			progress: ["milestone", "deliverables"],
			context: ["summary"],
			business: [
				"problem",
				"constraints",
				"drove_decisions"
			]
		};
		const extraFields = Object.entries(structured).filter(([key]) => !(knownFields[kind] ?? []).includes(key));
		$$renderer2.push(`<div class="rounded-md border border-border bg-bg-card p-6"><h2 class="mb-4 text-sm font-medium uppercase tracking-wider text-text-secondary">${escape_html(sectionTitle[kind] ?? "Structured Data")}</h2> `);
		if (kind === "decision") {
			$$renderer2.push("<!--[-->");
			$$renderer2.push(`<div class="space-y-4">`);
			if (typeof structured.why === "string") {
				$$renderer2.push("<!--[-->");
				$$renderer2.push(`<div><dt class="text-xs font-medium uppercase tracking-wider text-text-secondary">Rationale</dt> <dd class="mt-1 text-sm text-text-primary">${escape_html(structured.why)}</dd></div>`);
			} else $$renderer2.push("<!--[!-->");
			$$renderer2.push(`<!--]--> `);
			if (Array.isArray(structured.alternatives) && structured.alternatives.length > 0) {
				$$renderer2.push("<!--[-->");
				$$renderer2.push(`<div><dt class="text-xs font-medium uppercase tracking-wider text-text-secondary">Alternatives considered</dt> <dd class="mt-2 space-y-2"><!--[-->`);
				const each_array = ensure_array_like(structured.alternatives);
				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let alt = each_array[$$index];
					if (typeof alt === "string") {
						$$renderer2.push("<!--[-->");
						$$renderer2.push(`<div class="rounded bg-bg-base px-3 py-2 text-sm text-text-primary">${escape_html(alt)}</div>`);
					} else {
						$$renderer2.push("<!--[!-->");
						if (alt && typeof alt === "object" && "what" in alt) {
							$$renderer2.push("<!--[-->");
							$$renderer2.push(`<div class="rounded border border-border/50 bg-bg-base px-3 py-2"><span class="text-sm font-medium text-text-primary">${escape_html(alt.what)}</span> `);
							if (alt.why_rejected) {
								$$renderer2.push("<!--[-->");
								$$renderer2.push(`<p class="mt-0.5 text-xs text-text-secondary">${escape_html(alt.why_rejected)}</p>`);
							} else $$renderer2.push("<!--[!-->");
							$$renderer2.push(`<!--]--></div>`);
						} else {
							$$renderer2.push("<!--[!-->");
							$$renderer2.push(`<div class="rounded bg-bg-base px-3 py-2 text-sm text-text-primary">${escape_html(JSON.stringify(alt))}</div>`);
						}
						$$renderer2.push(`<!--]-->`);
					}
					$$renderer2.push(`<!--]-->`);
				}
				$$renderer2.push(`<!--]--></dd></div>`);
			} else $$renderer2.push("<!--[!-->");
			$$renderer2.push(`<!--]--></div>`);
		} else {
			$$renderer2.push("<!--[!-->");
			if (kind === "dead_end") {
				$$renderer2.push("<!--[-->");
				$$renderer2.push(`<div class="space-y-4">`);
				if (typeof structured.why_failed === "string") {
					$$renderer2.push("<!--[-->");
					$$renderer2.push(`<div><dt class="text-xs font-medium uppercase tracking-wider text-text-secondary">Why it failed</dt> <dd class="mt-1 text-sm text-text-primary">${escape_html(structured.why_failed)}</dd></div>`);
				} else $$renderer2.push("<!--[!-->");
				$$renderer2.push(`<!--]--> `);
				if (structured.time_spent || structured.error_type) {
					$$renderer2.push("<!--[-->");
					$$renderer2.push(`<div class="flex flex-wrap gap-2">`);
					if (typeof structured.time_spent === "string") {
						$$renderer2.push("<!--[-->");
						$$renderer2.push(`<span class="inline-flex items-center gap-1 rounded-full bg-danger/10 px-2.5 py-0.5 text-xs font-medium text-danger">Time spent: ${escape_html(structured.time_spent)}</span>`);
					} else $$renderer2.push("<!--[!-->");
					$$renderer2.push(`<!--]--> `);
					if (typeof structured.error_type === "string") {
						$$renderer2.push("<!--[-->");
						$$renderer2.push(`<span class="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2.5 py-0.5 text-xs font-medium text-warning">${escape_html(structured.error_type)}</span>`);
					} else $$renderer2.push("<!--[!-->");
					$$renderer2.push(`<!--]--></div>`);
				} else $$renderer2.push("<!--[!-->");
				$$renderer2.push(`<!--]--> `);
				if (typeof structured.workaround === "string") {
					$$renderer2.push("<!--[-->");
					$$renderer2.push(`<div><dt class="text-xs font-medium uppercase tracking-wider text-text-secondary">Workaround</dt> <dd class="mt-1 text-sm text-text-primary">${escape_html(structured.workaround)}</dd></div>`);
				} else $$renderer2.push("<!--[!-->");
				$$renderer2.push(`<!--]--></div>`);
			} else {
				$$renderer2.push("<!--[!-->");
				if (kind === "pattern") {
					$$renderer2.push("<!--[-->");
					$$renderer2.push(`<div class="space-y-4">`);
					if (typeof structured.applies_to === "string") {
						$$renderer2.push("<!--[-->");
						$$renderer2.push(`<div><dt class="text-xs font-medium uppercase tracking-wider text-text-secondary">Applies to</dt> <dd class="mt-1 text-sm text-text-primary">${escape_html(structured.applies_to)}</dd></div>`);
					} else $$renderer2.push("<!--[!-->");
					$$renderer2.push(`<!--]--> `);
					if (typeof structured.gotchas === "string") {
						$$renderer2.push("<!--[-->");
						$$renderer2.push(`<div><dt class="text-xs font-medium uppercase tracking-wider text-text-secondary">Gotchas</dt> <dd class="mt-1 text-sm text-text-primary">${escape_html(structured.gotchas)}</dd></div>`);
					} else $$renderer2.push("<!--[!-->");
					$$renderer2.push(`<!--]--></div>`);
				} else {
					$$renderer2.push("<!--[!-->");
					if (kind === "progress") {
						$$renderer2.push("<!--[-->");
						$$renderer2.push(`<div class="space-y-4">`);
						if (typeof structured.milestone === "string") {
							$$renderer2.push("<!--[-->");
							$$renderer2.push(`<div><dt class="text-xs font-medium uppercase tracking-wider text-text-secondary">Milestone</dt> <dd class="mt-1 text-sm font-medium text-text-primary">${escape_html(structured.milestone)}</dd></div>`);
						} else $$renderer2.push("<!--[!-->");
						$$renderer2.push(`<!--]--> `);
						if (Array.isArray(structured.deliverables) && structured.deliverables.length > 0) {
							$$renderer2.push("<!--[-->");
							$$renderer2.push(`<div><dt class="text-xs font-medium uppercase tracking-wider text-text-secondary">Deliverables</dt> <dd class="mt-2 space-y-1"><!--[-->`);
							const each_array_1 = ensure_array_like(structured.deliverables);
							for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
								let item = each_array_1[$$index_1];
								$$renderer2.push(`<div class="flex items-start gap-2 text-sm text-text-primary"><span class="mt-0.5 text-success">✓</span> <span>${escape_html(typeof item === "string" ? item : JSON.stringify(item))}</span></div>`);
							}
							$$renderer2.push(`<!--]--></dd></div>`);
						} else $$renderer2.push("<!--[!-->");
						$$renderer2.push(`<!--]--></div>`);
					} else {
						$$renderer2.push("<!--[!-->");
						if (kind === "context") {
							$$renderer2.push("<!--[-->");
							$$renderer2.push(`<div class="space-y-4">`);
							if (typeof structured.summary === "string") {
								$$renderer2.push("<!--[-->");
								$$renderer2.push(`<div><dt class="text-xs font-medium uppercase tracking-wider text-text-secondary">Summary</dt> <dd class="mt-1 text-sm text-text-primary">${escape_html(structured.summary)}</dd></div>`);
							} else $$renderer2.push("<!--[!-->");
							$$renderer2.push(`<!--]--></div>`);
						} else {
							$$renderer2.push("<!--[!-->");
							if (kind === "business") {
								$$renderer2.push("<!--[-->");
								$$renderer2.push(`<div class="space-y-4">`);
								if (typeof structured.problem === "string") {
									$$renderer2.push("<!--[-->");
									$$renderer2.push(`<div><dt class="text-xs font-medium uppercase tracking-wider text-text-secondary">Problem</dt> <dd class="mt-1 text-sm text-text-primary">${escape_html(structured.problem)}</dd></div>`);
								} else $$renderer2.push("<!--[!-->");
								$$renderer2.push(`<!--]--> `);
								if (Array.isArray(structured.constraints) && structured.constraints.length > 0) {
									$$renderer2.push("<!--[-->");
									$$renderer2.push(`<div><dt class="text-xs font-medium uppercase tracking-wider text-text-secondary">Constraints</dt> <dd class="mt-2 space-y-1"><!--[-->`);
									const each_array_2 = ensure_array_like(structured.constraints);
									for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
										let constraint = each_array_2[$$index_2];
										$$renderer2.push(`<div class="flex items-start gap-2 text-sm text-text-primary"><span class="mt-0.5 text-purple-400">•</span> <span>${escape_html(typeof constraint === "string" ? constraint : JSON.stringify(constraint))}</span></div>`);
									}
									$$renderer2.push(`<!--]--></dd></div>`);
								} else $$renderer2.push("<!--[!-->");
								$$renderer2.push(`<!--]--> `);
								if (Array.isArray(structured.drove_decisions) && structured.drove_decisions.length > 0) {
									$$renderer2.push("<!--[-->");
									$$renderer2.push(`<div><dt class="text-xs font-medium uppercase tracking-wider text-text-secondary">Drove decisions</dt> <dd class="mt-2 space-y-1"><!--[-->`);
									const each_array_3 = ensure_array_like(structured.drove_decisions);
									for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
										let decision = each_array_3[$$index_3];
										$$renderer2.push(`<div class="flex items-start gap-2 text-sm text-text-primary"><span class="mt-0.5 text-accent">→</span> <span>${escape_html(typeof decision === "string" ? decision : JSON.stringify(decision))}</span></div>`);
									}
									$$renderer2.push(`<!--]--></dd></div>`);
								} else $$renderer2.push("<!--[!-->");
								$$renderer2.push(`<!--]--></div>`);
							} else $$renderer2.push("<!--[!-->");
							$$renderer2.push(`<!--]-->`);
						}
						$$renderer2.push(`<!--]-->`);
					}
					$$renderer2.push(`<!--]-->`);
				}
				$$renderer2.push(`<!--]-->`);
			}
			$$renderer2.push(`<!--]-->`);
		}
		$$renderer2.push(`<!--]--> `);
		if (extraFields.length > 0) {
			$$renderer2.push("<!--[-->");
			$$renderer2.push(`<div${attr_class("space-y-3", void 0, { "mt-4": knownFields[kind]?.some((k) => k in structured) })}><!--[-->`);
			const each_array_4 = ensure_array_like(extraFields);
			for (let $$index_5 = 0, $$length = each_array_4.length; $$index_5 < $$length; $$index_5++) {
				let [key, value] = each_array_4[$$index_5];
				$$renderer2.push(`<div><dt class="text-xs font-medium uppercase tracking-wider text-text-secondary">${escape_html(key.replace(/_/g, " "))}</dt> <dd class="mt-1 text-sm text-text-primary">`);
				if (typeof value === "string") {
					$$renderer2.push("<!--[-->");
					$$renderer2.push(`${escape_html(value)}`);
				} else {
					$$renderer2.push("<!--[!-->");
					if (Array.isArray(value)) {
						$$renderer2.push("<!--[-->");
						$$renderer2.push(`<ul class="list-inside list-disc space-y-0.5"><!--[-->`);
						const each_array_5 = ensure_array_like(value);
						for (let $$index_4 = 0, $$length2 = each_array_5.length; $$index_4 < $$length2; $$index_4++) {
							let item = each_array_5[$$index_4];
							$$renderer2.push(`<li>${escape_html(typeof item === "string" ? item : JSON.stringify(item))}</li>`);
						}
						$$renderer2.push(`<!--]--></ul>`);
					} else {
						$$renderer2.push("<!--[!-->");
						$$renderer2.push(`<pre class="overflow-x-auto rounded bg-bg-base p-2 text-xs font-mono">${escape_html(JSON.stringify(value, null, 2))}</pre>`);
					}
					$$renderer2.push(`<!--]-->`);
				}
				$$renderer2.push(`<!--]--></dd></div>`);
			}
			$$renderer2.push(`<!--]--></div>`);
		} else $$renderer2.push("<!--[!-->");
		$$renderer2.push(`<!--]--></div>`);
	});
}
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer2) => {
		let { data } = $$props;
		const insight = data.insight;
		const nav = data.nav;
		const filterParams = data.filterParams || "";
		const soloMode = data.soloMode;
		const relatedInsights = data.relatedInsights ?? [];
		const supersededByInsight = data.supersededByInsight ?? null;
		const supersedesInsight = data.supersedesInsight ?? null;
		const enrichment = insight.enrichment;
		const backParams = (() => {
			const fp = filterParams;
			if (!fp) return "";
			const params = new URLSearchParams(fp.slice(1));
			params.delete("nav");
			const qs = params.toString();
			return qs ? `?${qs}` : "";
		})();
		const firstRef = insight.session_refs?.[0];
		function formatDate(iso) {
			return new Date(iso).toLocaleDateString("en-US", {
				year: "numeric",
				month: "long",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit"
			});
		}
		$$renderer2.push(`<div class="space-y-6"><div class="flex items-center justify-between"><a${attr("href", `/insights${stringify(backParams)}`)} class="inline-flex items-center gap-1 text-sm text-text-secondary transition hover:text-text-primary">`);
		Arrow_left($$renderer2, { size: 16 });
		$$renderer2.push(`<!----> Back to insights</a></div> `);
		if (nav) {
			$$renderer2.push("<!--[-->");
			InsightNav($$renderer2, {
				prevId: nav.prev_id,
				nextId: nav.next_id,
				filterParams
			});
		} else $$renderer2.push("<!--[!-->");
		$$renderer2.push(`<!--]--> <div class="rounded-md border border-border bg-bg-card p-6"><div class="flex items-center gap-3">`);
		KindBadge($$renderer2, { kind: insight.kind });
		$$renderer2.push(`<!----> <span class="text-sm text-text-secondary">${escape_html(insight.repo)}</span> `);
		if (insight.branch) {
			$$renderer2.push("<!--[-->");
			$$renderer2.push(`<span class="text-sm text-text-secondary/60">/ ${escape_html(insight.branch)}</span>`);
		} else $$renderer2.push("<!--[!-->");
		$$renderer2.push(`<!--]--></div> <h1 class="mt-4 text-2xl font-bold text-text-primary">${escape_html(insight.title)}</h1> <div class="mt-3 flex flex-wrap items-center gap-4 text-sm text-text-secondary"><span class="flex items-center gap-1.5">`);
		Calendar($$renderer2, { size: 14 });
		$$renderer2.push(`<!----> ${escape_html(formatDate(insight.created_at))}</span> `);
		if (!soloMode && insight.author_name) {
			$$renderer2.push("<!--[-->");
			$$renderer2.push(`<span class="flex items-center gap-1.5">`);
			User($$renderer2, { size: 14 });
			$$renderer2.push(`<!----> ${escape_html(insight.author_name)}</span>`);
		} else $$renderer2.push("<!--[!-->");
		$$renderer2.push(`<!--]--> `);
		if (firstRef?.tool) {
			$$renderer2.push("<!--[-->");
			$$renderer2.push(`<span class="flex items-center gap-1.5">`);
			Bot($$renderer2, { size: 14 });
			$$renderer2.push(`<!----> <span class="font-mono">${escape_html(firstRef.tool)}`);
			if (firstRef.model) {
				$$renderer2.push("<!--[-->");
				$$renderer2.push(`<span class="text-text-secondary/60">(${escape_html(firstRef.model)})</span>`);
			} else $$renderer2.push("<!--[!-->");
			$$renderer2.push(`<!--]--></span></span>`);
		} else $$renderer2.push("<!--[!-->");
		$$renderer2.push(`<!--]--> `);
		if (insight.trigger_type) {
			$$renderer2.push("<!--[-->");
			$$renderer2.push(`<span class="text-text-secondary/60">${escape_html(insight.trigger_type)}</span>`);
		} else $$renderer2.push("<!--[!-->");
		$$renderer2.push(`<!--]--></div> <div class="prose mt-6 max-w-none">${html(renderMarkdown(insight.body))}</div></div> `);
		if (insight.structured && Object.keys(insight.structured).length > 0) {
			$$renderer2.push("<!--[-->");
			StructuredData($$renderer2, {
				kind: insight.kind,
				structured: insight.structured
			});
		} else $$renderer2.push("<!--[!-->");
		$$renderer2.push(`<!--]--> `);
		if (insight.source_files && insight.source_files.length > 0 || insight.commit_hashes && insight.commit_hashes.length > 0 || insight.session_refs && insight.session_refs.length > 0) {
			$$renderer2.push("<!--[-->");
			$$renderer2.push(`<div class="rounded-md border border-border bg-bg-card p-6"><h2 class="mb-4 text-sm font-medium uppercase tracking-wider text-text-secondary">References</h2> `);
			if (insight.session_refs && insight.session_refs.length > 0) {
				$$renderer2.push("<!--[-->");
				$$renderer2.push(`<div class="mb-4"><h3 class="mb-2 flex items-center gap-1.5 text-xs font-medium text-text-secondary">`);
				Message_square($$renderer2, { size: 14 });
				$$renderer2.push(`<!----> Sessions</h3> <div class="space-y-1"><!--[-->`);
				const each_array = ensure_array_like(insight.session_refs);
				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let ref = each_array[$$index];
					$$renderer2.push(`<div class="flex items-center gap-3 rounded bg-bg-base px-3 py-1.5 text-xs">`);
					if (ref.tool) {
						$$renderer2.push("<!--[-->");
						$$renderer2.push(`<span class="text-accent">${escape_html(ref.tool)}</span>`);
					} else $$renderer2.push("<!--[!-->");
					$$renderer2.push(`<!--]--> `);
					if (ref.device) {
						$$renderer2.push("<!--[-->");
						$$renderer2.push(`<span class="text-text-secondary">${escape_html(ref.device)}</span>`);
					} else $$renderer2.push("<!--[!-->");
					$$renderer2.push(`<!--]--> `);
					if (ref.session_id) {
						$$renderer2.push("<!--[-->");
						$$renderer2.push(`<span class="font-mono text-text-secondary/60">${escape_html(String(ref.session_id).slice(0, 12))}</span>`);
					} else $$renderer2.push("<!--[!-->");
					$$renderer2.push(`<!--]--></div>`);
				}
				$$renderer2.push(`<!--]--></div></div>`);
			} else $$renderer2.push("<!--[!-->");
			$$renderer2.push(`<!--]--> `);
			if (insight.source_files && insight.source_files.length > 0) {
				$$renderer2.push("<!--[-->");
				$$renderer2.push(`<div class="mb-4"><h3 class="mb-2 flex items-center gap-1.5 text-xs font-medium text-text-secondary">`);
				File_code($$renderer2, { size: 14 });
				$$renderer2.push(`<!----> Source Files</h3> <div class="space-y-1"><!--[-->`);
				const each_array_1 = ensure_array_like(insight.source_files);
				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let file = each_array_1[$$index_1];
					$$renderer2.push(`<div class="rounded bg-bg-base px-3 py-1.5 font-mono text-xs text-text-primary">${escape_html(file)}</div>`);
				}
				$$renderer2.push(`<!--]--></div></div>`);
			} else $$renderer2.push("<!--[!-->");
			$$renderer2.push(`<!--]--> `);
			if (insight.commit_hashes && insight.commit_hashes.length > 0) {
				$$renderer2.push("<!--[-->");
				$$renderer2.push(`<div><h3 class="mb-2 flex items-center gap-1.5 text-xs font-medium text-text-secondary">`);
				Git_commit_horizontal($$renderer2, { size: 14 });
				$$renderer2.push(`<!----> Commits</h3> <div class="flex flex-wrap gap-2"><!--[-->`);
				const each_array_2 = ensure_array_like(insight.commit_hashes);
				for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
					let hash = each_array_2[$$index_2];
					$$renderer2.push(`<span class="rounded bg-bg-base px-2 py-1 font-mono text-xs text-accent">${escape_html(hash.slice(0, 7))}</span>`);
				}
				$$renderer2.push(`<!--]--></div></div>`);
			} else $$renderer2.push("<!--[!-->");
			$$renderer2.push(`<!--]--></div>`);
		} else $$renderer2.push("<!--[!-->");
		$$renderer2.push(`<!--]--> `);
		if (supersededByInsight) {
			$$renderer2.push("<!--[-->");
			$$renderer2.push(`<div class="flex items-start gap-3 rounded-md border border-warning/30 bg-warning/5 p-4">`);
			Triangle_alert($$renderer2, {
				size: 16,
				class: "mt-0.5 shrink-0 text-warning"
			});
			$$renderer2.push(`<!----> <div class="text-sm"><span class="font-medium text-warning">This insight has been superseded</span> <p class="mt-1 text-text-secondary">Replaced by <a${attr("href", `/insights/${stringify(supersededByInsight.id)}`)} class="text-accent hover:underline">${escape_html(supersededByInsight.title)}</a></p></div></div>`);
		} else $$renderer2.push("<!--[!-->");
		$$renderer2.push(`<!--]--> `);
		if (supersedesInsight) {
			$$renderer2.push("<!--[-->");
			$$renderer2.push(`<div class="flex items-start gap-3 rounded-md border border-accent/30 bg-accent/5 p-4">`);
			Sparkles($$renderer2, {
				size: 16,
				class: "mt-0.5 shrink-0 text-accent"
			});
			$$renderer2.push(`<!----> <div class="text-sm"><span class="font-medium text-accent">This insight supersedes an older one</span> <p class="mt-1 text-text-secondary">Replaces <a${attr("href", `/insights/${stringify(supersedesInsight.id)}`)} class="text-accent hover:underline">${escape_html(supersedesInsight.title)}</a></p></div></div>`);
		} else $$renderer2.push("<!--[!-->");
		$$renderer2.push(`<!--]--> `);
		if (enrichment) {
			$$renderer2.push("<!--[-->");
			$$renderer2.push(`<div class="rounded-md border border-border bg-bg-card p-6"><h2 class="mb-4 text-sm font-medium uppercase tracking-wider text-text-secondary">Enrichment</h2> <div class="space-y-5">`);
			if (enrichment.quality_signals) {
				$$renderer2.push("<!--[-->");
				const qs = enrichment.quality_signals;
				$$renderer2.push(`<div><h3 class="mb-2 text-xs font-medium text-text-secondary">Quality Signals</h3> <div class="flex flex-wrap gap-2"><!--[-->`);
				const each_array_3 = ensure_array_like([
					{
						label: "Alternatives",
						ok: qs.has_alternatives,
						show: insight.kind === "decision"
					},
					{
						label: "Source files",
						ok: qs.has_source_files,
						show: true
					},
					{
						label: "Structured data",
						ok: qs.has_structured,
						show: true
					},
					{
						label: "Self-contained",
						ok: qs.is_self_contained,
						show: true
					}
				]);
				for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
					let signal = each_array_3[$$index_3];
					if (signal.show) {
						$$renderer2.push("<!--[-->");
						$$renderer2.push(`<span${attr_class(`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${stringify(signal.ok ? "bg-success/10 text-success" : "bg-bg-hover text-text-secondary")}`)}>`);
						if (signal.ok) {
							$$renderer2.push("<!--[-->");
							Circle_check_big($$renderer2, { size: 12 });
						} else {
							$$renderer2.push("<!--[!-->");
							Circle($$renderer2, { size: 12 });
						}
						$$renderer2.push(`<!--]--> ${escape_html(signal.label)}</span>`);
					} else $$renderer2.push("<!--[!-->");
					$$renderer2.push(`<!--]-->`);
				}
				$$renderer2.push(`<!--]--></div></div>`);
			} else $$renderer2.push("<!--[!-->");
			$$renderer2.push(`<!--]--> `);
			if (relatedInsights.length > 0) {
				$$renderer2.push("<!--[-->");
				$$renderer2.push(`<div><h3 class="mb-2 flex items-center gap-1.5 text-xs font-medium text-text-secondary">`);
				Link_2($$renderer2, { size: 14 });
				$$renderer2.push(`<!----> Related Insights</h3> <div class="space-y-1"><!--[-->`);
				const each_array_4 = ensure_array_like(relatedInsights);
				for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
					let related = each_array_4[$$index_4];
					$$renderer2.push(`<a${attr("href", `/insights/${stringify(related.id)}`)} class="flex items-center gap-2 rounded bg-bg-base px-3 py-1.5 text-sm transition hover:bg-bg-hover">`);
					KindBadge($$renderer2, { kind: related.kind });
					$$renderer2.push(`<!----> <span class="text-text-primary">${escape_html(related.title)}</span></a>`);
				}
				$$renderer2.push(`<!--]--></div></div>`);
			} else $$renderer2.push("<!--[!-->");
			$$renderer2.push(`<!--]--> `);
			if (enrichment.llm_enrichment) {
				$$renderer2.push("<!--[-->");
				const llm = enrichment.llm_enrichment;
				$$renderer2.push(`<div><h3 class="mb-2 flex items-center gap-1.5 text-xs font-medium text-text-secondary">`);
				Sparkles($$renderer2, { size: 14 });
				$$renderer2.push(`<!----> AI Analysis</h3> <div class="space-y-3">`);
				if (typeof llm.quality_score === "number") {
					$$renderer2.push("<!--[-->");
					$$renderer2.push(`<div class="flex items-center gap-3"><span class="text-xs text-text-secondary">Quality score</span> <div class="flex items-center gap-1.5"><div class="h-2 w-24 rounded-full bg-bg-hover"><div${attr_class(`h-2 rounded-full ${stringify(llm.quality_score >= 7 ? "bg-success" : llm.quality_score >= 4 ? "bg-warning" : "bg-danger")}`)}${attr_style(`width: ${stringify(llm.quality_score * 10)}%`)}></div></div> <span class="text-sm font-medium text-text-primary">${escape_html(llm.quality_score)}/10</span></div></div>`);
				} else $$renderer2.push("<!--[!-->");
				$$renderer2.push(`<!--]--> `);
				if (llm.contradiction_analysis) {
					$$renderer2.push("<!--[-->");
					$$renderer2.push(`<div><span class="text-xs text-text-secondary">Contradictions</span> <p class="mt-1 rounded bg-danger/5 border border-danger/20 px-3 py-2 text-sm text-text-primary">${escape_html(llm.contradiction_analysis)}</p></div>`);
				} else $$renderer2.push("<!--[!-->");
				$$renderer2.push(`<!--]--></div></div>`);
			} else $$renderer2.push("<!--[!-->");
			$$renderer2.push(`<!--]--></div></div>`);
		} else $$renderer2.push("<!--[!-->");
		$$renderer2.push(`<!--]--> `);
		if (nav) {
			$$renderer2.push("<!--[-->");
			InsightNav($$renderer2, {
				prevId: nav.prev_id,
				nextId: nav.next_id,
				filterParams
			});
		} else $$renderer2.push("<!--[!-->");
		$$renderer2.push(`<!--]--></div>`);
	});
}

//#endregion
export { _page as default };
//# sourceMappingURL=_page.svelte-NQDiNxqv.js.map