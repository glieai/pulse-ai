import { A as ensure_array_like, I as head, Q as sanitize_props, at as slot, h as attr_class, lt as stringify, st as spread_props } from "./chunks-CJh457eN.js";
import { a as escape_html } from "./escaping-_LzeiXuq.js";
import { t as attr } from "./attributes-Dog1ICvy.js";
import { t as Icon } from "./Icon-BJuLBbSM.js";
import { t as Arrow_right } from "./arrow-right-DsFCtroQ.js";

//#region .svelte-kit/adapter-bun/entries/pages/pricing/_page.svelte.js
function Check($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "check" },
		sanitize_props($$props),
		{
			iconNode: [["path", { "d": "M20 6 9 17l-5-5" }]],
			children: ($$renderer2) => {
				$$renderer2.push(`<!--[-->`);
				slot($$renderer2, $$props, "default", {});
				$$renderer2.push(`<!--]-->`);
			},
			$$slots: { default: true }
		}
	]));
}
function Minus($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "minus" },
		sanitize_props($$props),
		{
			iconNode: [["path", { "d": "M5 12h14" }]],
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
		const tiers = [
			{
				name: "Developer",
				price: "Free",
				priceSub: "forever",
				badge: null,
				highlight: true,
				description: "Everything you need as an individual developer.",
				features: [
					"Full CLI + watcher",
					"VS Code extension",
					"MCP server for AI agents",
					"Dashboard",
					"Ask Pulse (LLM-powered Q&A)",
					"Unlimited insights",
					"Self-hosted — your data, your servers"
				],
				cta: {
					label: "Install Free",
					href: "/?audience=developer#install"
				}
			},
			{
				name: "Team",
				price: "Coming Soon",
				priceSub: null,
				badge: "Coming Soon",
				highlight: false,
				description: "Everything in Developer, plus collaboration.",
				features: [
					"Team search across members",
					"Shared knowledge base",
					"Onboarding intelligence",
					"Team digests & reports",
					"Multi-user collaboration",
					"Cloud hosting"
				],
				cta: {
					label: "Join Waitlist",
					href: "/register"
				}
			},
			{
				name: "Enterprise",
				price: "Custom",
				priceSub: null,
				badge: null,
				highlight: false,
				description: "Everything in Team, plus enterprise controls.",
				features: [
					"SSO / SAML",
					"Audit logs",
					"Priority support",
					"Custom integrations",
					"SLA guarantee",
					"On-premises / dedicated infrastructure"
				],
				cta: {
					label: "Contact Us",
					href: "mailto:hello@glie.ai"
				}
			}
		];
		const comparison = [
			{
				feature: "CLI + watcher",
				developer: true,
				team: true,
				enterprise: true
			},
			{
				feature: "VS Code extension",
				developer: true,
				team: true,
				enterprise: true
			},
			{
				feature: "MCP server",
				developer: true,
				team: true,
				enterprise: true
			},
			{
				feature: "Dashboard",
				developer: true,
				team: true,
				enterprise: true
			},
			{
				feature: "Ask Pulse",
				developer: true,
				team: true,
				enterprise: true
			},
			{
				feature: "Unlimited insights",
				developer: true,
				team: true,
				enterprise: true
			},
			{
				feature: "Self-hosted",
				developer: true,
				team: false,
				enterprise: true
			},
			{
				feature: "Team search",
				developer: false,
				team: true,
				enterprise: true
			},
			{
				feature: "Shared knowledge base",
				developer: false,
				team: true,
				enterprise: true
			},
			{
				feature: "Team digests",
				developer: false,
				team: true,
				enterprise: true
			},
			{
				feature: "Onboarding intelligence",
				developer: false,
				team: true,
				enterprise: true
			},
			{
				feature: "Multi-user",
				developer: false,
				team: true,
				enterprise: true
			},
			{
				feature: "Cloud hosting",
				developer: false,
				team: true,
				enterprise: true
			},
			{
				feature: "On-premises",
				developer: false,
				team: false,
				enterprise: true
			},
			{
				feature: "SSO / SAML",
				developer: false,
				team: false,
				enterprise: true
			},
			{
				feature: "Audit logs",
				developer: false,
				team: false,
				enterprise: true
			},
			{
				feature: "Priority support",
				developer: false,
				team: false,
				enterprise: true
			},
			{
				feature: "SLA",
				developer: false,
				team: false,
				enterprise: true
			}
		];
		head("1hrotn9", $$renderer2, ($$renderer3) => {
			$$renderer3.title(($$renderer4) => {
				$$renderer4.push(`<title>Pricing — Pulse</title>`);
			});
			$$renderer3.push(`<meta name="description" content="Pulse pricing: free for individual developers, paid for teams. Start free, scale with your team."/>`);
		});
		$$renderer2.push(`<div class="min-h-screen bg-bg-base text-text-primary" style="--bg-base:#0a0a0c; --bg-card:#111114; --bg-hover:#191920; --border:#232329; --text-primary:#ebebef; --text-secondary:#8b8b94; --accent:#0891b2; --accent-hover:#06b6d4; --success:#22c55e; --warning:#eab308; --danger:#ef4444"><header class="border-b border-border/50 bg-bg-base/80 backdrop-blur-xl"><div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-6"><a href="/" class="flex items-center gap-2.5"><span class="relative flex h-5 w-5 items-center justify-center"><span class="pulse-ring absolute h-3 w-3 rounded-full bg-accent/30"></span> <span class="relative h-2 w-2 rounded-full bg-accent"></span></span> <span class="text-lg font-semibold text-text-primary">Pulse</span></a> <nav class="hidden items-center gap-1 md:flex"><a href="/?audience=developer" class="rounded-lg px-3 py-1.5 text-sm text-text-secondary transition hover:text-text-primary">For Developers</a> <a href="/?audience=team" class="rounded-lg px-3 py-1.5 text-sm text-text-secondary transition hover:text-text-primary">For Teams</a> <span class="rounded-lg bg-bg-hover px-3 py-1.5 text-sm font-medium text-text-primary">Pricing</span></nav> <a href="/?audience=developer#install" class="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover">Install Free</a></div></header> <section class="px-6 pt-20 pb-16 md:pt-28 md:pb-20"><div class="mx-auto max-w-3xl text-center"><h1 class="text-4xl font-bold text-text-primary sm:text-5xl">Start free. Scale with your team.</h1> <p class="mx-auto mt-5 max-w-xl text-lg text-text-secondary">Everything you need as a developer. More when your team is
				ready.</p></div></section> <section class="px-6 pb-24"><div class="mx-auto grid max-w-5xl gap-6 md:grid-cols-3"><!--[-->`);
		const each_array = ensure_array_like(tiers);
		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let tier = each_array[i];
			$$renderer2.push(`<div${attr_class(`relative flex flex-col rounded-2xl border p-6 ${stringify(tier.highlight ? "border-accent/30 bg-bg-card shadow-lg shadow-accent/5" : "border-border/20 bg-bg-card/50")}`)}>`);
			if (tier.badge) {
				$$renderer2.push("<!--[-->");
				$$renderer2.push(`<span class="absolute -top-3 right-4 rounded-full bg-accent/15 px-3 py-1 text-xs font-medium text-accent">${escape_html(tier.badge)}</span>`);
			} else $$renderer2.push("<!--[!-->");
			$$renderer2.push(`<!--]--> <h3 class="text-lg font-semibold text-text-primary">${escape_html(tier.name)}</h3> <div class="mt-3 flex items-baseline gap-1"><span class="text-3xl font-bold text-text-primary">${escape_html(tier.price)}</span> `);
			if (tier.priceSub) {
				$$renderer2.push("<!--[-->");
				$$renderer2.push(`<span class="text-sm text-text-secondary">${escape_html(tier.priceSub)}</span>`);
			} else $$renderer2.push("<!--[!-->");
			$$renderer2.push(`<!--]--></div> <p class="mt-3 text-sm text-text-secondary">${escape_html(tier.description)}</p> <ul class="mt-6 flex-1 space-y-3"><!--[-->`);
			const each_array_1 = ensure_array_like(tier.features);
			for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
				let feature = each_array_1[$$index];
				$$renderer2.push(`<li class="flex items-start gap-2.5 text-sm text-text-secondary">`);
				Check($$renderer2, {
					size: 15,
					class: `mt-0.5 shrink-0 ${stringify(tier.highlight ? "text-success" : "text-accent")}`
				});
				$$renderer2.push(`<!----> ${escape_html(feature)}</li>`);
			}
			$$renderer2.push(`<!--]--></ul> <a${attr("href", tier.cta.href)}${attr_class(`mt-8 flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition ${stringify(tier.highlight ? "bg-accent text-white hover:bg-accent-hover" : "border border-border/30 text-text-primary hover:bg-bg-hover")}`)}>${escape_html(tier.cta.label)} `);
			if (tier.highlight) {
				$$renderer2.push("<!--[-->");
				Arrow_right($$renderer2, {
					size: 15,
					class: "transition-transform group-hover:translate-x-0.5"
				});
			} else $$renderer2.push("<!--[!-->");
			$$renderer2.push(`<!--]--></a></div>`);
		}
		$$renderer2.push(`<!--]--></div></section> <section class="px-6 pb-24 md:pb-32"><div class="mx-auto max-w-4xl"><h2 class="mb-10 text-center text-2xl font-bold text-text-primary">Compare plans</h2> <div class="overflow-x-auto"><table class="w-full text-left text-sm"><thead><tr class="border-b border-border/30"><th class="py-3 pr-4 font-medium text-text-secondary">Feature</th><th class="px-4 py-3 text-center font-medium text-accent">Developer</th><th class="px-4 py-3 text-center font-medium text-text-primary">Team</th><th class="px-4 py-3 text-center font-medium text-text-primary">Enterprise</th></tr></thead><tbody><!--[-->`);
		const each_array_2 = ensure_array_like(comparison);
		for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
			let row = each_array_2[i];
			$$renderer2.push(`<tr${attr_class(`border-b border-border/10 ${stringify(i % 2 === 0 ? "" : "bg-bg-card/30")}`)}><td class="py-3 pr-4 text-text-secondary">${escape_html(row.feature)}</td><td class="px-4 py-3 text-center">`);
			if (row.developer) {
				$$renderer2.push("<!--[-->");
				Check($$renderer2, {
					size: 15,
					class: "mx-auto text-success"
				});
			} else {
				$$renderer2.push("<!--[!-->");
				Minus($$renderer2, {
					size: 15,
					class: "mx-auto text-text-secondary/30"
				});
			}
			$$renderer2.push(`<!--]--></td><td class="px-4 py-3 text-center">`);
			if (row.team) {
				$$renderer2.push("<!--[-->");
				Check($$renderer2, {
					size: 15,
					class: "mx-auto text-success"
				});
			} else {
				$$renderer2.push("<!--[!-->");
				Minus($$renderer2, {
					size: 15,
					class: "mx-auto text-text-secondary/30"
				});
			}
			$$renderer2.push(`<!--]--></td><td class="px-4 py-3 text-center">`);
			if (row.enterprise) {
				$$renderer2.push("<!--[-->");
				Check($$renderer2, {
					size: 15,
					class: "mx-auto text-success"
				});
			} else {
				$$renderer2.push("<!--[!-->");
				Minus($$renderer2, {
					size: 15,
					class: "mx-auto text-text-secondary/30"
				});
			}
			$$renderer2.push(`<!--]--></td></tr>`);
		}
		$$renderer2.push(`<!--]--></tbody></table></div></div></section> <footer class="border-t border-border/30 px-6 py-8"><div class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row"><div class="flex items-center gap-2.5"><span class="relative flex h-4 w-4 items-center justify-center"><span class="pulse-ring absolute h-2.5 w-2.5 rounded-full bg-accent/25"></span> <span class="relative h-1.5 w-1.5 rounded-full bg-accent"></span></span> <span class="text-sm text-text-secondary">Pulse — Operational memory for developers</span></div> <div class="flex items-center gap-4"><a href="/" class="text-sm text-text-secondary transition hover:text-text-primary">Home</a> <a href="https://github.com/glieai/pulse" class="text-sm text-text-secondary transition hover:text-text-primary">GitHub</a> <a href="/login" class="text-sm text-text-secondary transition hover:text-text-primary">Sign In</a></div></div></footer></div>`);
	});
}

//#endregion
export { _page as default };
//# sourceMappingURL=_page.svelte-Cna2obsZ.js.map