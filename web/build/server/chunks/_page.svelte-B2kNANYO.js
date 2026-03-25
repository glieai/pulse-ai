import { A as ensure_array_like, I as head, Q as sanitize_props, at as slot, ct as store_get, ft as unsubscribe_stores, g as attr_style, h as attr_class, lt as stringify, st as spread_props } from "./chunks-CJh457eN.js";
import "./exports-BAQMwGYm.js";
import { a as escape_html } from "./escaping-_LzeiXuq.js";
import { n as clsx, t as attr } from "./attributes-Dog1ICvy.js";
import { n as getContext } from "./context-DNYDPF7e.js";
import "./state.svelte-DH-R59PY.js";
import { t as Icon } from "./Icon-BJuLBbSM.js";
import { t as Zap } from "./zap-Dhd3B6cC.js";
import { t as Search } from "./search-DPIUivoZ.js";
import { t as Arrow_right } from "./arrow-right-DsFCtroQ.js";
import { t as File_code } from "./file-code-dQ4lkGhI.js";
import { t as Download } from "./download-1kzMSqS6.js";
import { t as User_plus } from "./user-plus-BDK9LH5b.js";
import { t as Message_square } from "./message-square-DzoGdiB_.js";

//#region .svelte-kit/adapter-bun/entries/pages/_page.svelte.js
function Blocks($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "blocks" },
		sanitize_props($$props),
		{
			iconNode: [["rect", {
				"width": "7",
				"height": "7",
				"x": "14",
				"y": "3",
				"rx": "1"
			}], ["path", { "d": "M10 21V8a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H3" }]],
			children: ($$renderer2) => {
				$$renderer2.push(`<!--[-->`);
				slot($$renderer2, $$props, "default", {});
				$$renderer2.push(`<!--]-->`);
			},
			$$slots: { default: true }
		}
	]));
}
function Code($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "code" },
		sanitize_props($$props),
		{
			iconNode: [["polyline", { "points": "16 18 22 12 16 6" }], ["polyline", { "points": "8 6 2 12 8 18" }]],
			children: ($$renderer2) => {
				$$renderer2.push(`<!--[-->`);
				slot($$renderer2, $$props, "default", {});
				$$renderer2.push(`<!--]-->`);
			},
			$$slots: { default: true }
		}
	]));
}
function Eye_off($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "eye-off" },
		sanitize_props($$props),
		{
			iconNode: [
				["path", { "d": "M9.88 9.88a3 3 0 1 0 4.24 4.24" }],
				["path", { "d": "M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" }],
				["path", { "d": "M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" }],
				["line", {
					"x1": "2",
					"x2": "22",
					"y1": "2",
					"y2": "22"
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
function Eye($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "eye" },
		sanitize_props($$props),
		{
			iconNode: [["path", { "d": "M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" }], ["circle", {
				"cx": "12",
				"cy": "12",
				"r": "3"
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
function Github($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "github" },
		sanitize_props($$props),
		{
			iconNode: [["path", { "d": "M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" }], ["path", { "d": "M9 18c-4.51 2-5-2-7-2" }]],
			children: ($$renderer2) => {
				$$renderer2.push(`<!--[-->`);
				slot($$renderer2, $$props, "default", {});
				$$renderer2.push(`<!--]-->`);
			},
			$$slots: { default: true }
		}
	]));
}
function Layout_list($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "layout-list" },
		sanitize_props($$props),
		{
			iconNode: [
				["rect", {
					"width": "7",
					"height": "7",
					"x": "3",
					"y": "3",
					"rx": "1"
				}],
				["rect", {
					"width": "7",
					"height": "7",
					"x": "3",
					"y": "14",
					"rx": "1"
				}],
				["path", { "d": "M14 4h7" }],
				["path", { "d": "M14 9h7" }],
				["path", { "d": "M14 15h7" }],
				["path", { "d": "M14 20h7" }]
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
function Server($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "server" },
		sanitize_props($$props),
		{
			iconNode: [
				["rect", {
					"width": "20",
					"height": "8",
					"x": "2",
					"y": "2",
					"rx": "2",
					"ry": "2"
				}],
				["rect", {
					"width": "20",
					"height": "8",
					"x": "2",
					"y": "14",
					"rx": "2",
					"ry": "2"
				}],
				["line", {
					"x1": "6",
					"x2": "6.01",
					"y1": "6",
					"y2": "6"
				}],
				["line", {
					"x1": "6",
					"x2": "6.01",
					"y1": "18",
					"y2": "18"
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
function Shield_alert($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "shield-alert" },
		sanitize_props($$props),
		{
			iconNode: [
				["path", { "d": "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" }],
				["path", { "d": "M12 8v4" }],
				["path", { "d": "M12 16h.01" }]
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
function Square_terminal($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "square-terminal" },
		sanitize_props($$props),
		{
			iconNode: [
				["path", { "d": "m7 11 2-2-2-2" }],
				["path", { "d": "M11 13h4" }],
				["rect", {
					"width": "18",
					"height": "18",
					"x": "3",
					"y": "3",
					"rx": "2",
					"ry": "2"
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
const getStores = () => {
	const stores$1 = getContext("__svelte__");
	return {
		page: { subscribe: stores$1.page.subscribe },
		navigating: { subscribe: stores$1.navigating.subscribe },
		updated: stores$1.updated
	};
};
const page = { subscribe(fn) {
	return getStores().page.subscribe(fn);
} };
function Nav($$renderer, $$props) {
	$$renderer.component(($$renderer2) => {
		let { audience = "developer" } = $$props;
		const ctaLabel = audience === "developer" ? "Install Free" : "Get Started";
		const ctaHref = audience === "developer" ? "#install" : "/register";
		$$renderer2.push(`<header${attr_class(`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${stringify("")}`)}><div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-6"><a href="/" class="flex items-center gap-2.5"><img src="/logo-white.png" alt="Pulse" class="h-6 w-6"/> <span class="text-lg font-semibold text-text-primary">Pulse</span></a> <nav class="hidden items-center gap-1 md:flex"><button type="button"${attr_class(`rounded-lg px-3 py-1.5 text-sm transition-all duration-200 ${stringify(audience === "developer" ? "bg-bg-hover text-text-primary font-medium" : "text-text-secondary hover:text-text-primary")}`)}>For Developers</button> <button type="button"${attr_class(`rounded-lg px-3 py-1.5 text-sm transition-all duration-200 ${stringify(audience === "team" ? "bg-bg-hover text-text-primary font-medium" : "text-text-secondary hover:text-text-primary")}`)}>For Teams</button> <a href="/pricing" class="rounded-lg px-3 py-1.5 text-sm text-text-secondary transition hover:text-text-primary">Pricing</a></nav> <div class="flex items-center gap-4"><a${attr("href", ctaHref)} class="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover">${escape_html(ctaLabel)}</a></div></div></header>`);
	});
}
function Hero($$renderer, $$props) {
	$$renderer.component(($$renderer2) => {
		let { audience = "developer" } = $$props;
		const eyebrow = audience === "developer" ? "Operational memory for developers" : "Operational memory for development teams";
		const headline = audience === "developer" ? "Your best decisions shouldn't die in a chat window" : "Your team's best decisions shouldn't die in a chat window";
		const subheadline = audience === "developer" ? "Pulse captures the decisions, dead-ends, and patterns from every AI coding session. Searchable by you and your AI agents. Free and self-hosted." : "Pulse captures the decisions, dead-ends, and patterns from every AI coding session. A shared knowledge base searchable by your team and AI agents alike.";
		const ctaLabel = audience === "developer" ? "Install Free" : "Get Started";
		const ctaHref = audience === "developer" ? "#install" : "/register";
		const demos = [
			{
				cmd: "pulse search \"auth strategy\"",
				title: "pulse — search",
				lines: [
					{
						text: "⚡ 3 results",
						cls: "text-accent"
					},
					{
						text: "\xA0",
						cls: ""
					},
					{
						text: "  decision — JWT with httpOnly cookies over session auth",
						cls: "text-accent"
					},
					{
						text: "  dead_end — OAuth2 PKCE for internal APIs",
						cls: "text-danger"
					},
					{
						text: "  pattern  — Token rotation via short-lived JWTs",
						cls: "text-success"
					}
				]
			},
			{
				cmd: "pulse watch",
				title: "pulse — watch",
				lines: [
					{
						text: "◉ Watching session…",
						cls: "text-success"
					},
					{
						text: "\xA0",
						cls: ""
					},
					{
						text: "▸ Decision: JWT over session tokens",
						cls: "text-accent"
					},
					{
						text: "▸ Pattern: content_hash for dedup",
						cls: "text-success"
					},
					{
						text: "▸ Dead-end: ORM approach abandoned",
						cls: "text-danger"
					},
					{
						text: "\xA0",
						cls: ""
					},
					{
						text: "⚡ 3 insights → ready for review",
						cls: "text-warning"
					}
				]
			},
			{
				cmd: "pulse generate --from-commit HEAD~3..HEAD",
				title: "pulse — generate",
				lines: [
					{
						text: "Analyzing 3 commits…",
						cls: "text-text-secondary/70"
					},
					{
						text: "\xA0",
						cls: ""
					},
					{
						text: "⚡ Generated 2 insights:",
						cls: "text-accent"
					},
					{
						text: "  decision — RRF fusion for hybrid search",
						cls: "text-accent"
					},
					{
						text: "  pattern  — Numbered SQL migrations",
						cls: "text-success"
					},
					{
						text: "\xA0",
						cls: ""
					},
					{
						text: "Published to knowledge base ✓",
						cls: "text-success"
					}
				]
			}
		];
		const tools = [
			{
				icon: Square_terminal,
				name: "Claude Code"
			},
			{
				icon: Square_terminal,
				name: "Codex"
			},
			{
				icon: Code,
				name: "VS Code"
			},
			{
				icon: Blocks,
				name: "Any MCP agent"
			}
		];
		let idx = 0;
		let typedChars = 0;
		let visibleLines = 0;
		$$renderer2.push(`<section class="relative min-h-screen overflow-hidden px-6 pt-32 pb-20 md:pt-40"><div class="pointer-events-none absolute inset-0 flex items-center overflow-hidden opacity-[0.08]"><svg class="w-full" viewBox="0 0 1200 100" fill="none"><path class="pulse-line-path" d="M0,50 H350 L362,44 L375,50 H390 L398,12 L406,88 L414,5 L422,50 H435 L447,41 L460,50 H650 L662,44 L675,50 H690 L698,12 L706,88 L714,5 L722,50 H735 L747,41 L760,50 H1200" stroke="var(--accent)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg></div> <div class="relative z-10 mx-auto w-full max-w-6xl"><div class="grid items-center gap-12 md:grid-cols-2 md:gap-16"><div><!---->`);
		$$renderer2.push(`<div><p class="mb-5 text-sm font-medium uppercase tracking-widest text-accent">${escape_html(eyebrow)}</p> <h1 class="text-4xl font-bold leading-[1.1] tracking-tight text-text-primary sm:text-5xl lg:text-6xl">${escape_html(headline)}</h1> <p class="mt-6 max-w-md text-lg leading-relaxed text-text-secondary">${escape_html(subheadline)}</p> <div class="mt-8 flex items-center gap-4"><a${attr("href", ctaHref)} class="group flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover">${escape_html(ctaLabel)} `);
		Arrow_right($$renderer2, {
			size: 15,
			class: "transition-transform group-hover:translate-x-0.5"
		});
		$$renderer2.push(`<!----></a> <a href="#showcase" class="text-sm text-text-secondary transition hover:text-text-primary">See how it works</a></div></div>`);
		$$renderer2.push(`<!----></div> <div class="animate-float"><div class="overflow-hidden rounded-xl border border-border/50 bg-[#0c0c0e] shadow-2xl"><div class="flex items-center gap-2 border-b border-border/30 px-4 py-3"><span class="h-2.5 w-2.5 rounded-full bg-[#ff5f57]"></span> <span class="h-2.5 w-2.5 rounded-full bg-[#febc2e]"></span> <span class="h-2.5 w-2.5 rounded-full bg-[#28c840]"></span> <span class="ml-2 text-xs text-text-secondary/40">${escape_html(demos[idx].title)}</span></div> <div class="p-5 font-mono text-[13px] leading-relaxed" style="min-height: 260px"><div class="text-text-primary"><span class="text-text-secondary/70">$ </span>${escape_html(demos[idx].cmd.slice(0, typedChars))}`);
		$$renderer2.push("<!--[-->");
		$$renderer2.push(`<span class="animate-blink text-accent">▌</span>`);
		$$renderer2.push(`<!--]--></div> <!--[-->`);
		const each_array = ensure_array_like(demos[idx].lines.slice(0, visibleLines));
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let line = each_array[$$index];
			$$renderer2.push(`<div${attr_class(clsx(line.cls || "text-text-secondary/70"))}>${escape_html(line.text)}</div>`);
		}
		$$renderer2.push(`<!--]--></div></div></div></div> <div class="mt-20 flex flex-col items-center gap-4 border-t border-border/20 pt-8 md:flex-row md:justify-center md:gap-6"><span class="text-xs font-medium uppercase tracking-widest text-text-secondary/40">Works with</span> <div class="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-text-secondary/60"><!--[-->`);
		const each_array_1 = ensure_array_like(tools);
		for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
			let tool = each_array_1[i];
			if (i > 0) {
				$$renderer2.push("<!--[-->");
				$$renderer2.push(`<span class="hidden text-border/40 md:inline">·</span>`);
			} else $$renderer2.push("<!--[!-->");
			$$renderer2.push(`<!--]--> <div class="flex items-center gap-2">`);
			$$renderer2.push("<!---->");
			tool.icon?.($$renderer2, { size: 14 });
			$$renderer2.push(`<!----> <span>${escape_html(tool.name)}</span></div>`);
		}
		$$renderer2.push(`<!--]--></div></div></div></section>`);
	});
}
function DemoFlow($$renderer, $$props) {
	$$renderer.component(($$renderer2) => {
		let { audience = "developer" } = $$props;
		const subtitle = audience === "developer" ? "From coding session to searchable knowledge — automatically" : "From coding session to shared knowledge — automatically";
		let activeTab = "cli";
		let phase = -1;
		let cliTyped = 0;
		let cliLines = 0;
		let vsLines = 0;
		const tabDefs = [{
			id: "cli",
			label: "Terminal"
		}, {
			id: "vscode",
			label: "VS Code"
		}];
		const cliCmd = "pulse watch --session";
		const cliSessionLines = [
			{
				text: "◉ Watching session…",
				color: "#22c55e"
			},
			{
				text: "▸ Decision: JWT over session tokens",
				color: "#06b6d4"
			},
			{
				text: "▸ Pattern: content_hash for dedup",
				color: "#22c55e"
			},
			{
				text: "▸ Dead-end: ORM approach abandoned",
				color: "#ef4444"
			},
			{
				text: "⚡ Threshold reached — generating…",
				color: "#eab308"
			}
		];
		const vsTokens = [
			[
				{
					t: "import",
					c: "#cba6f7"
				},
				{
					t: " { Hono } ",
					c: "#a6adc8"
				},
				{
					t: "from",
					c: "#cba6f7"
				},
				{
					t: " \"hono\"",
					c: "#a6e3a1"
				}
			],
			[
				{
					t: "import",
					c: "#cba6f7"
				},
				{
					t: " { jwt } ",
					c: "#a6adc8"
				},
				{
					t: "from",
					c: "#cba6f7"
				},
				{
					t: " \"hono/jwt\"",
					c: "#a6e3a1"
				}
			],
			[],
			[{
				t: "// Decision: JWT over session tokens",
				c: "#6c7086"
			}],
			[
				{
					t: "export ",
					c: "#cba6f7"
				},
				{
					t: "function ",
					c: "#cba6f7"
				},
				{
					t: "authGuard",
					c: "#89b4fa"
				},
				{
					t: "(secret: ",
					c: "#a6adc8"
				},
				{
					t: "string",
					c: "#89dceb"
				},
				{
					t: ") {",
					c: "#a6adc8"
				}
			],
			[
				{
					t: "  return ",
					c: "#cba6f7"
				},
				{
					t: "jwt",
					c: "#89b4fa"
				},
				{
					t: "({",
					c: "#a6adc8"
				}
			],
			[{
				t: "    secret,",
				c: "#a6adc8"
			}],
			[{
				t: "    algorithm",
				c: "#a6adc8"
			}, {
				t: ": \"HS256\"",
				c: "#a6e3a1"
			}],
			[{
				t: "  })",
				c: "#a6adc8"
			}],
			[{
				t: "}",
				c: "#a6adc8"
			}]
		];
		const steps = [
			"Watch",
			"Detect",
			"Generate",
			"Review",
			"Ship"
		];
		$$renderer2.push(`<section class="px-6 py-20 md:py-28"><div class="mx-auto max-w-4xl"><div class="mb-8 text-center"><h2 class="text-3xl font-bold text-text-primary md:text-4xl">See it in action</h2> <p class="mt-3 text-lg text-text-secondary">${escape_html(subtitle)}</p></div> <div class="mb-6 flex justify-center gap-1"><!--[-->`);
		const each_array = ensure_array_like(tabDefs);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let tab = each_array[$$index];
			$$renderer2.push(`<button${attr_class(`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${stringify(activeTab === tab.id ? "bg-[var(--bg-hover)] text-text-primary" : "text-text-secondary hover:text-text-primary")}`)}>${escape_html(tab.label)}</button>`);
		}
		$$renderer2.push(`<!--]--></div> <div class="relative overflow-hidden rounded-xl border border-[var(--border)] bg-[#0c0c0f]"><div class="flex items-center gap-1.5 border-b border-[var(--border)] px-4 py-3"><span class="h-3 w-3 rounded-full bg-[#ff5f57]"></span> <span class="h-3 w-3 rounded-full bg-[#febc2e]"></span> <span class="h-3 w-3 rounded-full bg-[#28c840]"></span> <span class="ml-3 text-xs text-text-secondary">`);
		$$renderer2.push("<!--[!-->");
		$$renderer2.push("<!--[!-->");
		$$renderer2.push("<!--[!-->");
		$$renderer2.push(`<!--]-->`);
		$$renderer2.push(`<!--]-->`);
		$$renderer2.push(`<!--]--></span></div> <div class="relative" style="min-height: 360px;"><div class="absolute inset-0 p-5 font-mono text-sm leading-relaxed transition-all duration-500"${attr_style(`opacity: ${stringify(0)}; transform: translateY(${stringify(-12)}px); pointer-events: ${stringify("none")};`)}><div class="flex"><span class="text-text-secondary">$ </span> <span class="text-text-primary">${escape_html(cliCmd.slice(0, cliTyped))}</span> `);
		$$renderer2.push("<!--[!-->");
		$$renderer2.push(`<!--]--></div> `);
		if (cliTyped >= 21) {
			$$renderer2.push("<!--[-->");
			$$renderer2.push(`<div class="mt-4 space-y-1.5"><!--[-->`);
			const each_array_1 = ensure_array_like(cliSessionLines);
			for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
				let line = each_array_1[i];
				if (i < cliLines) {
					$$renderer2.push("<!--[-->");
					$$renderer2.push(`<div${attr_style(`color: ${stringify(line.color)};`)}>${escape_html(line.text)}</div>`);
				} else $$renderer2.push("<!--[!-->");
				$$renderer2.push(`<!--]-->`);
			}
			$$renderer2.push(`<!--]--></div>`);
		} else $$renderer2.push("<!--[!-->");
		$$renderer2.push(`<!--]--> `);
		$$renderer2.push("<!--[!-->");
		$$renderer2.push(`<!--]--></div> <div class="absolute inset-0 flex transition-all duration-500"${attr_style(`opacity: ${stringify(0)}; transform: translateY(${stringify(12)}px); pointer-events: ${stringify("none")};`)}><div class="flex w-10 shrink-0 flex-col items-center gap-4 border-r border-[#313244] bg-[#181825] pt-3">`);
		File_code($$renderer2, {
			size: 16,
			color: "#6c7086"
		});
		$$renderer2.push(`<!----> `);
		Search($$renderer2, {
			size: 16,
			color: "#6c7086"
		});
		$$renderer2.push(`<!----> <div class="relative">`);
		Zap($$renderer2, {
			size: 16,
			color: "#cba6f7"
		});
		$$renderer2.push(`<!----> `);
		$$renderer2.push("<!--[!-->");
		$$renderer2.push(`<!--]--></div></div> <div class="flex-1 overflow-hidden bg-[#1e1e2e]"><div class="flex border-b border-[#313244] bg-[#181825]"><div class="flex items-center gap-1.5 border-b-2 border-[#cba6f7] bg-[#1e1e2e] px-3 py-1.5 text-[11px] text-[#cdd6f4]">`);
		File_code($$renderer2, {
			size: 12,
			color: "#cdd6f4"
		});
		$$renderer2.push(`<!----> auth.ts</div> <div class="px-3 py-1.5 text-[11px] text-[#6c7086]">index.ts</div></div> <div class="p-4">`);
		$$renderer2.push("<!--[!-->");
		$$renderer2.push(`<!--]--> <div class="space-y-0.5 font-mono text-[11px] leading-[18px]"><!--[-->`);
		const each_array_2 = ensure_array_like(vsTokens);
		for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
			let tokens = each_array_2[i];
			if (i < vsLines) {
				$$renderer2.push("<!--[-->");
				$$renderer2.push(`<div class="flex"><span class="mr-4 w-4 select-none text-right text-[#45475a]">${escape_html(i + 1)}</span> `);
				if (tokens.length > 0) {
					$$renderer2.push("<!--[-->");
					$$renderer2.push(`<!--[-->`);
					const each_array_3 = ensure_array_like(tokens);
					for (let $$index_2 = 0, $$length2 = each_array_3.length; $$index_2 < $$length2; $$index_2++) {
						let tok = each_array_3[$$index_2];
						$$renderer2.push(`<span${attr_style(`color: ${stringify(tok.c)}`)}>${escape_html(tok.t)}</span>`);
					}
					$$renderer2.push(`<!--]-->`);
				} else {
					$$renderer2.push("<!--[!-->");
					$$renderer2.push(`<span> </span>`);
				}
				$$renderer2.push(`<!--]--></div>`);
			} else $$renderer2.push("<!--[!-->");
			$$renderer2.push(`<!--]-->`);
		}
		$$renderer2.push(`<!--]--></div></div></div></div> <div class="absolute inset-0 flex items-center justify-center p-5 transition-all duration-500"${attr_style(`opacity: ${stringify(0)}; transform: scale(${stringify(.95)}); pointer-events: ${stringify("none")};`)}><div class="w-full max-w-md rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-6">`);
		$$renderer2.push("<!--[!-->");
		$$renderer2.push(`<!--]--> `);
		$$renderer2.push("<!--[!-->");
		$$renderer2.push(`<!--]--> `);
		$$renderer2.push("<!--[!-->");
		$$renderer2.push(`<!--]--> `);
		$$renderer2.push("<!--[!-->");
		$$renderer2.push(`<!--]--></div></div> <div class="absolute inset-0 p-5 transition-all duration-500"${attr_style(`opacity: ${stringify(0)}; transform: translateY(${stringify(12)}px); pointer-events: ${stringify("none")};`)}><div class="mb-4 flex items-center gap-3"><div class="flex items-center gap-2"><div class="h-2.5 w-2.5 rounded-full bg-accent"></div> <span class="text-sm font-semibold text-text-primary">Pulse</span></div> <div class="ml-auto rounded-md border border-[var(--border)] bg-[var(--bg-hover)] px-3 py-1 text-xs text-text-secondary">Search knowledge base…</div></div> <div class="space-y-2.5"><div class="rounded-lg border border-accent/30 bg-accent/5 p-3.5 transition-all duration-500"${attr_style(`opacity: ${stringify(0)}; transform: translateY(${stringify(-8)}px);`)}><div class="flex items-center gap-2"><span class="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-medium text-accent">decision</span> <span class="text-[10px] text-green-400">✓ Just published</span></div> <p class="mt-1.5 text-sm font-medium text-text-primary">JWT authentication over session tokens</p> <p class="mt-0.5 text-xs text-text-secondary">2 min ago · glieai/pulse</p></div> <div class="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-3.5"><span class="rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] font-medium text-green-400">pattern</span> <p class="mt-1.5 text-sm font-medium text-text-primary">Content hash dedup for idempotent ingest</p> <p class="mt-0.5 text-xs text-text-secondary">1 hour ago · glieai/pulse</p></div> <div class="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-3.5"><span class="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-medium text-red-400">dead_end</span> <p class="mt-1.5 text-sm font-medium text-text-primary">ORM approach abandoned for SQL purity</p> <p class="mt-0.5 text-xs text-text-secondary">2 hours ago · glieai/pulse</p></div></div></div></div></div> <div class="mt-8 flex items-center justify-center gap-2"><!--[-->`);
		const each_array_4 = ensure_array_like(steps);
		for (let i = 0, $$length = each_array_4.length; i < $$length; i++) {
			let label = each_array_4[i];
			$$renderer2.push(`<div class="flex items-center gap-1.5"><div${attr_class(`h-2 w-2 rounded-full transition-all duration-300 ${stringify(phase >= i ? "bg-accent" : "bg-[var(--border)]")}`)}${attr_style(phase >= i ? "transform: scale(1.15);" : "")}></div> <span${attr_class(`text-xs transition-colors duration-300 ${stringify(phase >= i ? "text-accent" : "text-text-secondary")}`)}>${escape_html(label)}</span></div> `);
			if (i < steps.length - 1) {
				$$renderer2.push("<!--[-->");
				$$renderer2.push(`<div${attr_class(`h-px w-6 transition-colors duration-500 ${stringify(phase > i ? "bg-accent/50" : "bg-[var(--border)]")}`)}></div>`);
			} else $$renderer2.push("<!--[!-->");
			$$renderer2.push(`<!--]-->`);
		}
		$$renderer2.push(`<!--]--></div></div></section>`);
	});
}
function Terminal($$renderer, $$props) {
	let { title = "Terminal", lines } = $$props;
	$$renderer.push(`<div class="flex h-full flex-col overflow-hidden rounded-xl border border-border/50 bg-[#0c0c0e] shadow-2xl"><div class="flex items-center gap-2 border-b border-border/30 px-4 py-3"><span class="h-2.5 w-2.5 rounded-full bg-[#ff5f57]"></span> <span class="h-2.5 w-2.5 rounded-full bg-[#febc2e]"></span> <span class="h-2.5 w-2.5 rounded-full bg-[#28c840]"></span> <span class="ml-2 text-xs text-text-secondary/40">${escape_html(title)}</span></div> <div class="flex-1 p-5 font-mono text-[13px] leading-relaxed"><!--[-->`);
	const each_array = ensure_array_like(lines);
	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let line = each_array[$$index];
		$$renderer.push(`<div${attr_class(clsx(line.class ?? "text-text-secondary/70"))}>${escape_html(line.text)}</div>`);
	}
	$$renderer.push(`<!--]--></div></div>`);
}
function Showcase($$renderer, $$props) {
	let { audience = "developer" } = $$props;
	const cliLines = [
		{
			text: "$ pulse search \"caching strategy\"",
			class: "text-text-primary"
		},
		{
			text: "⚡ 3 results",
			class: "text-accent"
		},
		{ text: "" },
		{
			text: "  [decision] Materialized views over Redis cache",
			class: "text-accent"
		},
		{
			text: "  [dead_end] Redis cache layer — abandoned after 2 weeks",
			class: "text-danger"
		},
		{
			text: "  [pattern]  Cache invalidation via PG LISTEN/NOTIFY",
			class: "text-success"
		}
	];
	const beforeLines = [
		{
			text: "// Without Pulse",
			class: "text-text-secondary/50"
		},
		{ text: "" },
		{
			text: "> \"Let me add a Redis cache layer to",
			class: "text-text-primary"
		},
		{
			text: ">  improve API performance...\"",
			class: "text-text-primary"
		},
		{ text: "" },
		{
			text: audience === "developer" ? "  ⚠ You already tried this." : "  ⚠ Your team already tried this.",
			class: "text-danger"
		},
		{
			text: audience === "developer" ? "    Your AI doesn't know." : "    The AI doesn't know.",
			class: "text-danger"
		}
	];
	const afterLines = [
		{
			text: "// With Pulse MCP",
			class: "text-text-secondary/50"
		},
		{ text: "" },
		{
			text: audience === "developer" ? "🔍 Checking knowledge base..." : "🔍 Checking team knowledge base...",
			class: "text-accent"
		},
		{ text: "" },
		{
			text: "  Found: dead_end — Redis cache abandoned",
			class: "text-warning"
		},
		{ text: "    Reason: serialization overhead, cold-start" },
		{
			text: "  Found: decision — materialized views chosen",
			class: "text-success"
		},
		{ text: "" },
		{
			text: audience === "developer" ? "> \"Based on your past experience," : `> "Based on your team's experience,`,
			class: "text-text-primary"
		},
		{
			text: `>  I'll use materialized views instead."`,
			class: "text-text-primary"
		}
	];
	const kw = "#cba6f7";
	const fn = "#89b4fa";
	const tp = "#89dceb";
	const tx = "#a6adc8";
	const editorCode = [
		{
			n: 12,
			tokens: [
				{
					t: "export async function ",
					c: kw
				},
				{
					t: "validateToken",
					c: fn
				},
				{ t: "(" }
			]
		},
		{
			n: 13,
			tokens: [{ t: "  token: " }, {
				t: "string",
				c: tp
			}]
		},
		{
			n: 14,
			tokens: [{ t: ") {" }]
		},
		{
			n: 15,
			tokens: [
				{ t: "  " },
				{
					t: "const ",
					c: kw
				},
				{ t: "decoded = jwt." },
				{
					t: "verify",
					c: fn
				},
				{ t: "(token, secret);" }
			]
		},
		{
			n: 16,
			tokens: [
				{ t: "  " },
				{
					t: "if ",
					c: kw
				},
				{ t: "(decoded.exp < now) " },
				{
					t: "throw new ",
					c: kw
				},
				{
					t: "AuthError",
					c: tp
				},
				{ t: "();" }
			]
		},
		{
			n: 17,
			tokens: [
				{ t: "  " },
				{
					t: "return ",
					c: kw
				},
				{ t: "decoded;" }
			]
		},
		{
			n: 18,
			tokens: [{ t: "}" }]
		}
	];
	const dashboardInsights = [
		{
			kind: "decision",
			kindCls: "bg-accent/15 text-accent",
			title: "Materialized views over Redis cache",
			desc: "Idempotent, no cold-start. Redis abandoned due to serialization overhead.",
			time: "2 days ago"
		},
		{
			kind: "dead_end",
			kindCls: "bg-danger/15 text-danger",
			title: "Event sourcing for audit logs",
			desc: "Over-engineered. PostgreSQL triggers solved it in 2 hours.",
			time: "1 week ago"
		},
		{
			kind: "pattern",
			kindCls: "bg-success/15 text-success",
			title: "Numbered SQL migrations — one concern per file",
			desc: "Sequential numbers, snake_case, idempotent, version-controlled.",
			time: "2 weeks ago"
		}
	];
	$$renderer.push(`<section id="showcase" class="px-6 py-24 md:py-32"><div class="mx-auto max-w-6xl"><div class="mb-20 text-center"><h2 class="text-3xl font-bold text-text-primary sm:text-4xl">One knowledge base. Every surface.</h2> <p class="mx-auto mt-4 max-w-xl text-text-secondary">Terminal, editor, AI agent, browser — Pulse meets you where you
				work.</p></div> <div class="mb-24 grid items-center gap-12 md:grid-cols-2 md:gap-16"><div><p class="mb-2 text-sm font-medium uppercase tracking-widest text-accent">CLI</p> <h3 class="mb-4 text-2xl font-bold text-text-primary">Search from your terminal</h3> <p class="leading-relaxed text-text-secondary">Search your knowledge base, generate insights from sessions,
					and publish — all from your terminal alongside git. No
					context switching.</p></div> <div>`);
	Terminal($$renderer, {
		title: "pulse — search",
		lines: cliLines
	});
	$$renderer.push(`<!----></div></div> <div class="mb-24"><div class="mb-10 text-center"><p class="mb-2 text-sm font-medium uppercase tracking-widest text-accent">MCP</p> <h3 class="mb-3 text-2xl font-bold text-text-primary">Give your AI agents memory</h3> <p class="mx-auto max-w-2xl text-text-secondary">Every time your AI starts a new session, it starts from zero.
					With Pulse MCP, it starts from everything ${escape_html(audience === "developer" ? "you've already figured out" : "your team has ever learned")}.</p></div> <div class="grid gap-6 md:grid-cols-2"><div><p class="mb-3 text-center text-sm font-medium text-danger/80">Without Pulse</p> `);
	Terminal($$renderer, {
		title: "ai — session",
		lines: beforeLines
	});
	$$renderer.push(`<!----></div> <div><p class="mb-3 text-center text-sm font-medium text-success/80">With Pulse</p> `);
	Terminal($$renderer, {
		title: "ai — with pulse",
		lines: afterLines
	});
	$$renderer.push(`<!----></div></div></div> <div class="mb-24 grid items-center gap-12 md:grid-cols-2 md:gap-16"><div><div class="overflow-hidden rounded-xl border border-[#313244] bg-[#1e1e2e] shadow-2xl"><div class="flex items-center bg-[#181825]"><div class="flex items-center gap-1.5 border-b-2 border-accent bg-[#1e1e2e] px-4 py-2">`);
	File_code($$renderer, {
		size: 13,
		class: "text-[#89b4fa]"
	});
	$$renderer.push(`<!----> <span class="text-xs text-[#cdd6f4]">auth.ts</span></div> <div class="flex items-center gap-1.5 px-4 py-2"><span class="text-xs text-[#585b70]">index.ts</span></div></div> <div class="flex"><div class="flex w-10 shrink-0 flex-col items-center gap-3 border-r border-[#313244] bg-[#11111b] py-3">`);
	File_code($$renderer, {
		size: 15,
		class: "text-[#585b70]"
	});
	$$renderer.push(`<!----> `);
	Search($$renderer, {
		size: 15,
		class: "text-[#585b70]"
	});
	$$renderer.push(`<!----> `);
	Zap($$renderer, {
		size: 15,
		class: "text-accent"
	});
	$$renderer.push(`<!----></div> <div class="flex-1 p-4"><div class="mb-1 pl-8 text-[11px] text-accent/70">⚡ 2 insights · 1 decision · 1
								pattern</div> <div class="font-mono text-[12px] leading-[1.7]"><!--[-->`);
	const each_array = ensure_array_like(editorCode);
	for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
		let line = each_array[$$index_1];
		$$renderer.push(`<div class="flex"><span class="w-8 shrink-0 select-none pr-3 text-right text-[11px] text-[#45475a]">${escape_html(line.n)}</span> <span class="whitespace-pre"${attr_style(`color:${stringify(tx)}`)}><!--[-->`);
		const each_array_1 = ensure_array_like(line.tokens);
		for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
			let tok = each_array_1[$$index];
			if (tok.c) {
				$$renderer.push("<!--[-->");
				$$renderer.push(`<span${attr_style(`color:${stringify(tok.c)}`)}>${escape_html(tok.t)}</span>`);
			} else {
				$$renderer.push("<!--[!-->");
				$$renderer.push(`${escape_html(tok.t)}`);
			}
			$$renderer.push(`<!--]-->`);
		}
		$$renderer.push(`<!--]--></span></div>`);
	}
	$$renderer.push(`<!--]--></div></div></div></div></div> <div><p class="mb-2 text-sm font-medium uppercase tracking-widest text-accent">VS Code</p> <h3 class="mb-4 text-2xl font-bold text-text-primary">Context where you code</h3> <p class="leading-relaxed text-text-secondary">CodeLens annotations show related insights per file. Sidebar
					panels for search, recent insights, and draft management —
					without leaving your editor.</p></div></div> <div class="grid items-center gap-12 md:grid-cols-2 md:gap-16"><div><p class="mb-2 text-sm font-medium uppercase tracking-widest text-accent">Dashboard</p> <h3 class="mb-4 text-2xl font-bold text-text-primary">The full picture</h3> <p class="leading-relaxed text-text-secondary">Search, filter by kind and repo, browse ${escape_html(audience === "developer" ? "your entire" : "your team's entire")} knowledge base. Full insight detail
					with structured data, alternatives, and source references.</p></div> <div class="animate-float"><div class="overflow-hidden rounded-xl border border-border/50 bg-[#0c0c0e] shadow-2xl"><div class="flex items-center gap-2.5 border-b border-border/30 px-4 py-2.5"><span class="relative flex h-4 w-4 items-center justify-center"><span class="h-1.5 w-1.5 rounded-full bg-accent"></span></span> <span class="text-sm font-medium text-text-primary">Pulse</span> <div class="ml-auto flex items-center gap-1.5 rounded-lg border border-border/30 bg-bg-hover/50 px-2.5 py-1">`);
	Search($$renderer, {
		size: 11,
		class: "text-text-secondary/50"
	});
	$$renderer.push(`<!----> <span class="text-[11px] text-text-secondary/50">Search insights...</span></div></div> <div class="p-4"><div class="mb-3 flex gap-2"><span class="rounded-full bg-accent/10 px-2.5 py-0.5 text-[10px] font-medium text-accent">All kinds</span> <span class="rounded-full bg-bg-hover px-2.5 py-0.5 text-[10px] text-text-secondary/60">Last 30 days</span> <span class="rounded-full bg-bg-hover px-2.5 py-0.5 text-[10px] text-text-secondary/60">glieai/pulse</span></div> <div class="space-y-2.5"><!--[-->`);
	const each_array_2 = ensure_array_like(dashboardInsights);
	for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
		let insight = each_array_2[$$index_2];
		$$renderer.push(`<div class="rounded-lg border border-border/20 p-3"><div class="mb-1.5 flex items-center gap-2"><span${attr_class(`rounded px-1.5 py-0.5 text-[10px] font-medium ${stringify(insight.kindCls)}`)}>${escape_html(insight.kind)}</span> <span class="text-[10px] text-text-secondary/50">${escape_html(insight.time)}</span></div> <p class="text-xs font-medium text-text-primary">${escape_html(insight.title)}</p> <p class="mt-1 text-[11px] leading-snug text-text-secondary/60">${escape_html(insight.desc)}</p></div>`);
	}
	$$renderer.push(`<!--]--></div></div></div></div></div></div></section>`);
}
function Benefits($$renderer, $$props) {
	let { audience = "developer" } = $$props;
	const sectionTitle = audience === "developer" ? "Why developers use Pulse" : "Why teams use Pulse";
	const benefitCards = [
		{
			icon: Eye,
			title: "Watches everything automatically",
			body: audience === "developer" ? "AI sessions, commits, pushes — Pulse monitors your workflow and creates insights automatically. Context from past decisions surfaces exactly when you need it." : "AI sessions, commits, pushes — Pulse monitors your workflow and creates insights automatically, using context from related past decisions specific to that part of your codebase."
		},
		{
			icon: Shield_alert,
			title: "Dead-ends that save weeks",
			body: audience === "developer" ? "Failed approaches documented once, avoided forever. Your AI agents check your knowledge base before repeating past mistakes." : "Failed approaches documented once, avoided forever. Your AI agents check the knowledge base before repeating past mistakes."
		},
		{
			icon: Zap,
			title: "Sub-10ms fast",
			body: "Instant results across your entire knowledge base. Performance that stays invisible in your workflow."
		},
		audience === "developer" ? {
			icon: Download,
			title: "Free and self-hosted",
			body: "Install in 2 minutes with Docker Compose. Your data stays on your machine. No account, no cloud, no strings attached."
		} : {
			icon: User_plus,
			title: "Onboarding in hours",
			body: "New developers query the knowledge base on day one. They understand the why behind the code, not just the what."
		}
	];
	$$renderer.push(`<section id="benefits" class="px-6 py-24 md:py-32"><div class="mx-auto max-w-5xl"><h2 class="mb-16 text-center text-3xl font-bold text-text-primary sm:text-4xl">${escape_html(sectionTitle)}</h2> <div class="grid gap-10 md:grid-cols-2 md:gap-12"><!--[-->`);
	const each_array = ensure_array_like(benefitCards);
	for (let i = 0, $$length = each_array.length; i < $$length; i++) {
		let prop = each_array[i];
		$$renderer.push(`<div class="flex gap-5"><div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10">`);
		$$renderer.push("<!---->");
		prop.icon?.($$renderer, {
			size: 22,
			class: "text-accent"
		});
		$$renderer.push(`<!----></div> <div><h3 class="mb-2 text-lg font-semibold text-text-primary">${escape_html(prop.title)}</h3> <p class="text-sm leading-relaxed text-text-secondary">${escape_html(prop.body)}</p></div></div>`);
	}
	$$renderer.push(`<!--]--></div></div></section>`);
}
function Privacy($$renderer, $$props) {
	let { audience = "developer" } = $$props;
	const sectionTitle = audience === "developer" ? "Your knowledge. Your servers." : "Your team's knowledge. Always accessible.";
	const sectionSubtitle = audience === "developer" ? "Pulse runs on your infrastructure. Your knowledge stays under your control." : "Pulse Cloud keeps your team connected. Focus on building — we handle the rest.";
	const setupLines = audience === "developer" ? [
		{
			text: "1. Install \"Pulse AI\" from VS Code Marketplace",
			class: "text-text-primary"
		},
		{
			text: "2. Set API URL → http://localhost:3000/api",
			class: "text-text-primary"
		},
		{
			text: "3. Generate token in Dashboard → Account",
			class: "text-text-primary"
		},
		{ text: "" },
		{
			text: "  ✓ MCP configured for Claude Code & Codex",
			class: "text-success"
		},
		{
			text: "  ✓ Watcher ready — auto-generates insights",
			class: "text-success"
		},
		{
			text: "  ✓ Knowledge base available in all repos",
			class: "text-success"
		}
	] : [
		{
			text: "1. Install \"Pulse AI\" from VS Code Marketplace",
			class: "text-text-primary"
		},
		{
			text: "2. Set API URL + paste your API token",
			class: "text-text-primary"
		},
		{ text: "" },
		{
			text: "  ✓ MCP configured for Claude Code & Codex",
			class: "text-success"
		},
		{
			text: "  ✓ Watcher ready — auto-generates insights",
			class: "text-success"
		},
		{
			text: "  ✓ Team knowledge base in every session",
			class: "text-success"
		}
	];
	const terminalTitle = "setup — vs code";
	const signals = audience === "developer" ? [{
		icon: Server,
		title: "Run it yourself",
		description: "PostgreSQL + Hono API + SvelteKit dashboard. Your infrastructure, your data."
	}, {
		icon: Eye_off,
		title: "Privacy by design",
		description: "Sessions processed locally. Only structured insights reach the API."
	}] : [{
		icon: Server,
		title: "Cloud or self-hosted",
		description: "Pulse Cloud for zero-setup, or deploy on your own infrastructure with Enterprise."
	}, {
		icon: Eye_off,
		title: "Privacy by design",
		description: "Sessions processed locally on each developer's machine. Only structured insights are synced."
	}];
	const coming = [
		{
			icon: Blocks,
			name: "Cursor",
			description: "MCP support — plug and play"
		},
		{
			icon: Github,
			name: "GitHub",
			description: "PR context from decision history"
		},
		{
			icon: Layout_list,
			name: "Linear",
			description: "Decisions linked to issues"
		},
		{
			icon: Message_square,
			name: "Slack",
			description: "Search and alerts from Slack"
		}
	];
	$$renderer.push(`<section id="infrastructure" class="px-6 py-24 md:py-32"><div class="mx-auto max-w-6xl"><div class="mb-16 text-center"><h2 class="text-3xl font-bold text-text-primary sm:text-4xl">${escape_html(sectionTitle)}</h2> <p class="mx-auto mt-4 max-w-xl text-text-secondary">${escape_html(sectionSubtitle)}</p></div> <div class="grid items-start gap-12 md:grid-cols-2"><div id="install"><div class="mb-4 flex gap-1 rounded-lg bg-bg-hover/50 p-1"><button${attr_class(`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${stringify("bg-bg-card text-text-primary shadow-sm")}`)}>`);
	Code($$renderer, { size: 14 });
	$$renderer.push(`<!----> VS Code</button> <button${attr_class(`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${stringify("text-text-secondary hover:text-text-primary")}`)}>`);
	Square_terminal($$renderer, { size: 14 });
	$$renderer.push(`<!----> Terminal</button></div> `);
	Terminal($$renderer, {
		title: terminalTitle,
		lines: setupLines
	});
	$$renderer.push(`<!----> <p class="mt-3 text-center text-xs text-text-secondary/50">${escape_html("Works with Claude Code, Codex, and any MCP-compatible agent")}</p> <div class="mt-8 space-y-5"><!--[-->`);
	const each_array = ensure_array_like(signals);
	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let signal = each_array[$$index];
		$$renderer.push(`<div class="flex items-start gap-3">`);
		$$renderer.push("<!---->");
		signal.icon?.($$renderer, {
			size: 16,
			class: "mt-0.5 shrink-0 text-text-secondary/60"
		});
		$$renderer.push(`<!----> <div><p class="text-sm font-medium text-text-primary">${escape_html(signal.title)}</p> <p class="text-sm text-text-secondary/70">${escape_html(signal.description)}</p></div></div>`);
	}
	$$renderer.push(`<!--]--></div></div> <div><p class="mb-6 text-sm font-medium uppercase tracking-widest text-text-secondary/50">Coming to the ecosystem</p> <div class="grid grid-cols-2 gap-4"><!--[-->`);
	const each_array_1 = ensure_array_like(coming);
	for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
		let item = each_array_1[i];
		$$renderer.push(`<div class="rounded-xl border border-border/20 bg-bg-card/50 p-5 opacity-60"><div class="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-bg-hover">`);
		$$renderer.push("<!---->");
		item.icon?.($$renderer, {
			size: 18,
			class: "text-text-secondary"
		});
		$$renderer.push(`<!----></div> <p class="text-sm font-medium text-text-primary">${escape_html(item.name)}</p> <p class="mt-1 text-xs text-text-secondary">${escape_html(item.description)}</p></div>`);
	}
	$$renderer.push(`<!--]--></div></div></div></div></section>`);
}
function Cta($$renderer, $$props) {
	let { audience = "developer" } = $$props;
	const headline = audience === "developer" ? "Stop losing what\nyou learn" : "Stop losing what\nyour team learns";
	const subtitle = audience === "developer" ? "Install Pulse and capture knowledge from your very next coding session." : "Start capturing knowledge from your very next coding session.";
	const ctaLabel = audience === "developer" ? "Install Free" : "Get Started";
	const ctaHref = audience === "developer" ? "#install" : "/register";
	const footerTagline = audience === "developer" ? "Pulse — Operational memory for developers" : "Pulse — Operational memory for development teams";
	$$renderer.push(`<section class="relative overflow-hidden px-6 py-24 md:py-32"><div class="pointer-events-none absolute inset-0 flex items-center overflow-hidden opacity-[0.06]"><svg class="w-full" viewBox="0 0 1200 100" fill="none"><path d="M0,50 H450 L462,44 L475,50 H490 L498,12 L506,88 L514,5 L522,50 H535 L547,41 L560,50 H1200" stroke="var(--accent)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg></div> <div class="relative z-10 mx-auto max-w-2xl text-center"><h2 class="text-3xl font-bold text-text-primary sm:text-4xl md:text-5xl">${escape_html(headline)}</h2> <p class="mx-auto mt-6 max-w-lg text-lg text-text-secondary">${escape_html(subtitle)}</p> <div class="mt-10"><a${attr("href", ctaHref)} class="group inline-flex items-center gap-2 rounded-lg bg-accent px-8 py-3.5 text-sm font-medium text-white transition hover:bg-accent-hover">${escape_html(ctaLabel)} `);
	Arrow_right($$renderer, {
		size: 16,
		class: "transition-transform group-hover:translate-x-0.5"
	});
	$$renderer.push(`<!----></a></div> <p class="mt-4 text-sm text-text-secondary">`);
	if (audience === "developer") {
		$$renderer.push("<!--[-->");
		$$renderer.push(`Building with a team? <a href="/pricing" class="text-accent transition hover:text-accent-hover">See Teams plan</a>`);
	} else {
		$$renderer.push("<!--[!-->");
		$$renderer.push(`Want to try solo first? <a href="#install" class="text-accent transition hover:text-accent-hover">Install Free</a>`);
	}
	$$renderer.push(`<!--]--></p></div></section> <footer class="border-t border-border/30 px-6 py-8"><div class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row"><div class="flex items-center gap-2.5"><span class="relative flex h-4 w-4 items-center justify-center"><span class="pulse-ring absolute h-2.5 w-2.5 rounded-full bg-accent/25"></span> <span class="relative h-1.5 w-1.5 rounded-full bg-accent"></span></span> <span class="text-sm text-text-secondary">${escape_html(footerTagline)}</span></div> <div class="flex items-center gap-4"><a href="/pricing" class="text-sm text-text-secondary transition hover:text-text-primary">Pricing</a> <a href="https://github.com/glieai/pulse" class="text-sm text-text-secondary transition hover:text-text-primary">GitHub</a> <a href="/login" class="text-sm text-text-secondary transition hover:text-text-primary">Sign In</a></div></div></footer>`);
}
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer2) => {
		var $$store_subs;
		let audience = store_get($$store_subs ??= {}, "$page", page).url.searchParams.get("audience") === "team" ? "team" : "developer";
		const title = audience === "developer" ? "Pulse — Operational Memory for Developers" : "Pulse — Operational Memory for Development Teams";
		const description = audience === "developer" ? "Free, self-hosted knowledge base that fills itself. Capture decisions, dead-ends, and patterns from every AI coding session." : "The knowledge base that fills itself. Capture decisions, dead-ends, and patterns from every AI coding session for your entire team.";
		head("1uha8ag", $$renderer2, ($$renderer3) => {
			$$renderer3.title(($$renderer4) => {
				$$renderer4.push(`<title>${escape_html(title)}</title>`);
			});
			$$renderer3.push(`<meta name="description"${attr("content", description)}/>`);
		});
		$$renderer2.push(`<div class="min-h-screen bg-bg-base text-text-primary" style="--bg-base:#0a0a0c; --bg-card:#111114; --bg-hover:#191920; --border:#232329; --text-primary:#ebebef; --text-secondary:#8b8b94; --accent:#0891b2; --accent-hover:#06b6d4; --success:#22c55e; --warning:#eab308; --danger:#ef4444">`);
		Nav($$renderer2, { audience });
		$$renderer2.push(`<!----> `);
		Hero($$renderer2, { audience });
		$$renderer2.push(`<!----> <div class="px-6 py-16 md:py-20"><div class="mx-auto max-w-3xl"><div class="mb-8 flex justify-center"><svg class="h-6 w-48 text-accent/20" viewBox="0 0 200 24" fill="none"><path d="M0,12 H70 L78,12 L85,4 L92,20 L99,2 L106,12 H120 L128,8 L136,12 H200" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg></div> <p class="text-center text-2xl font-medium text-text-secondary md:text-3xl">Your codebase tells the <span class="font-semibold text-text-primary">what</span>.<br/> Pulse remembers the <span class="font-semibold text-accent">why</span>.</p></div></div> `);
		DemoFlow($$renderer2, { audience });
		$$renderer2.push(`<!----> `);
		Showcase($$renderer2, { audience });
		$$renderer2.push(`<!----> `);
		Benefits($$renderer2, { audience });
		$$renderer2.push(`<!----> `);
		Privacy($$renderer2, { audience });
		$$renderer2.push(`<!----> `);
		Cta($$renderer2, { audience });
		$$renderer2.push(`<!----></div>`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}

//#endregion
export { _page as default };
//# sourceMappingURL=_page.svelte-B2kNANYO.js.map