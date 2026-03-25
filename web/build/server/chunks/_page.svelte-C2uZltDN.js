import { A as ensure_array_like, Q as sanitize_props, at as slot, h as attr_class, lt as stringify, st as spread_props } from "./chunks-CJh457eN.js";
import "./exports-BAQMwGYm.js";
import { a as escape_html } from "./escaping-_LzeiXuq.js";
import { t as attr } from "./attributes-Dog1ICvy.js";
import "./state.svelte-DH-R59PY.js";
import { t as Icon } from "./Icon-BJuLBbSM.js";
import { t as Download } from "./download-1kzMSqS6.js";
import { t as Message_square } from "./message-square-DzoGdiB_.js";
import { t as Sparkles } from "./sparkles-DJ2WuDuc.js";
import { t as Trash_2 } from "./trash-2-6sJxdUwD.js";
import { t as Key } from "./key-C5pLWAbD.js";

//#region .svelte-kit/adapter-bun/entries/pages/settings/_page.svelte.js
function Brain($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "brain" },
		sanitize_props($$props),
		{
			iconNode: [
				["path", { "d": "M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" }],
				["path", { "d": "M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" }],
				["path", { "d": "M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" }],
				["path", { "d": "M17.599 6.5a3 3 0 0 0 .399-1.375" }],
				["path", { "d": "M6.003 5.125A3 3 0 0 0 6.401 6.5" }],
				["path", { "d": "M3.477 10.896a4 4 0 0 1 .585-.396" }],
				["path", { "d": "M19.938 10.5a4 4 0 0 1 .585.396" }],
				["path", { "d": "M6 18a4 4 0 0 1-1.967-.516" }],
				["path", { "d": "M19.967 17.484A4 4 0 0 1 18 18" }]
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
function Loader_circle($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "loader-circle" },
		sanitize_props($$props),
		{
			iconNode: [["path", { "d": "M21 12a9 9 0 1 1-6.219-8.56" }]],
			children: ($$renderer2) => {
				$$renderer2.push(`<!--[-->`);
				slot($$renderer2, $$props, "default", {});
				$$renderer2.push(`<!--]-->`);
			},
			$$slots: { default: true }
		}
	]));
}
function Pencil($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "pencil" },
		sanitize_props($$props),
		{
			iconNode: [["path", { "d": "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" }], ["path", { "d": "m15 5 4 4" }]],
			children: ($$renderer2) => {
				$$renderer2.push(`<!--[-->`);
				slot($$renderer2, $$props, "default", {});
				$$renderer2.push(`<!--]-->`);
			},
			$$slots: { default: true }
		}
	]));
}
function Plus($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "plus" },
		sanitize_props($$props),
		{
			iconNode: [["path", { "d": "M5 12h14" }], ["path", { "d": "M12 5v14" }]],
			children: ($$renderer2) => {
				$$renderer2.push(`<!--[-->`);
				slot($$renderer2, $$props, "default", {});
				$$renderer2.push(`<!--]-->`);
			},
			$$slots: { default: true }
		}
	]));
}
function Terminal($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "terminal" },
		sanitize_props($$props),
		{
			iconNode: [["polyline", { "points": "4 17 10 11 4 5" }], ["line", {
				"x1": "12",
				"x2": "20",
				"y1": "19",
				"y2": "19"
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
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer2) => {
		let { data, form } = $$props;
		let editingApiKey = null;
		let addingApiKey = null;
		let installingTool = null;
		const status = data.llmStatus;
		const cliTools = status?.cli_tools;
		const activeCliProvider = status?.cli_provider;
		const hasServerLlm = status?.active_provider != null || data.soloMode && status?.cli_provider != null;
		const PROVIDER_DEFAULTS = {
			anthropic: "claude-sonnet-4-5-20250929",
			openai: "gpt-4o"
		};
		const CLI_TOOL_NAME = {
			"claude-cli": "claude",
			"codex-cli": "codex"
		};
		const cards = [
			{
				type: "claude-cli",
				label: "Claude Code CLI",
				description: "Uses your Claude subscription — no API key needed",
				available: cliTools?.claude_cli ?? false,
				isCliTool: true
			},
			{
				type: "codex-cli",
				label: "Codex CLI",
				description: "Uses your OpenAI subscription — no API key needed",
				available: cliTools?.codex_cli ?? false,
				isCliTool: true,
				installHint: "npm i -g @openai/codex"
			},
			{
				type: "anthropic",
				label: "Anthropic API",
				description: "Direct API access — pay per token",
				available: status?.anthropic?.available ?? false,
				isCliTool: false,
				llmProvider: "anthropic"
			},
			{
				type: "openai",
				label: "OpenAI API",
				description: "Direct API access — pay per token",
				available: status?.openai?.available ?? false,
				isCliTool: false,
				llmProvider: "openai"
			}
		];
		function getApiStatus(provider) {
			return status?.[provider];
		}
		$$renderer2.push(`<div class="space-y-8"><div><h1 class="text-2xl font-bold text-text-primary">Settings</h1> <p class="mt-1 text-text-secondary">Manage AI providers and features</p></div> <div class="rounded-md border border-border bg-bg-card p-6"><h2 class="mb-1 flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-text-secondary">`);
		Brain($$renderer2, { size: 16 });
		$$renderer2.push(`<!----> AI Providers</h2> <p class="mb-5 text-sm text-text-secondary">Select which provider to use for insight generation, Ask Pulse, and enrichment.</p> `);
		if (form?.providerSaved) {
			$$renderer2.push("<!--[-->");
			$$renderer2.push(`<div class="mb-4 rounded-md border border-success/30 bg-success/5 p-3 text-sm text-success">Provider preference saved.</div>`);
		} else $$renderer2.push("<!--[!-->");
		$$renderer2.push(`<!--]--> `);
		if (form?.llmSaved) {
			$$renderer2.push("<!--[-->");
			$$renderer2.push(`<div class="mb-4 rounded-md border border-success/30 bg-success/5 p-3 text-sm text-success">Provider settings saved.</div>`);
		} else $$renderer2.push("<!--[!-->");
		$$renderer2.push(`<!--]--> `);
		if (form?.llmError) {
			$$renderer2.push("<!--[-->");
			$$renderer2.push(`<div class="mb-4 rounded-md border border-danger/30 bg-danger/5 p-3 text-sm text-danger">${escape_html(form.llmError)}</div>`);
		} else $$renderer2.push("<!--[!-->");
		$$renderer2.push(`<!--]--> `);
		if (form?.installSuccess) {
			$$renderer2.push("<!--[-->");
			$$renderer2.push(`<div class="mb-4 rounded-md border border-success/30 bg-success/5 p-3 text-sm text-success">CLI tool installed successfully.</div>`);
		} else $$renderer2.push("<!--[!-->");
		$$renderer2.push(`<!--]--> `);
		if (form?.installError) {
			$$renderer2.push("<!--[-->");
			$$renderer2.push(`<div class="mb-4 rounded-md border border-danger/30 bg-danger/5 p-3 text-sm text-danger">Install failed: ${escape_html(form.installError)}</div>`);
		} else $$renderer2.push("<!--[!-->");
		$$renderer2.push(`<!--]--> <div class="space-y-3"><!--[-->`);
		const each_array = ensure_array_like(cards);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let card = each_array[$$index];
			const isActive = activeCliProvider === card.type;
			const ps = card.llmProvider ? getApiStatus(card.llmProvider) : void 0;
			$$renderer2.push(`<div${attr_class(`overflow-hidden rounded-md border transition-colors ${stringify(isActive ? "border-accent/50 bg-accent/5" : "border-border bg-bg-base")}`)}><form method="POST" action="?/setCliProvider"><input type="hidden" name="cli_provider"${attr("value", card.type)}/> <button type="submit" class="w-full cursor-pointer px-4 py-3.5 text-left transition-colors hover:bg-bg-hover/50"><div class="flex items-start justify-between gap-3"><div class="flex items-start gap-3">`);
			if (card.isCliTool) {
				$$renderer2.push("<!--[-->");
				Terminal($$renderer2, {
					size: 16,
					class: "mt-0.5 shrink-0 text-text-secondary"
				});
			} else {
				$$renderer2.push("<!--[!-->");
				Key($$renderer2, {
					size: 16,
					class: "mt-0.5 shrink-0 text-text-secondary"
				});
			}
			$$renderer2.push(`<!--]--> <div><div class="flex items-center gap-2"><span class="text-sm font-medium text-text-primary">${escape_html(card.label)}</span> `);
			if (isActive) {
				$$renderer2.push("<!--[-->");
				$$renderer2.push(`<span class="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent">Active</span>`);
			} else $$renderer2.push("<!--[!-->");
			$$renderer2.push(`<!--]--></div> <p class="mt-0.5 text-xs text-text-secondary">${escape_html(card.description)}</p> `);
			if (card.isCliTool) {
				$$renderer2.push("<!--[-->");
				if (card.available) {
					$$renderer2.push("<!--[-->");
					$$renderer2.push(`<p class="mt-1.5 text-xs font-medium text-success">Detected on system</p>`);
				} else {
					$$renderer2.push("<!--[!-->");
					$$renderer2.push(`<p class="mt-1.5 text-xs text-text-secondary/70">Not found`);
					if (card.installHint) {
						$$renderer2.push("<!--[-->");
						$$renderer2.push(` <code class="rounded bg-bg-hover px-1 font-mono text-text-secondary">${escape_html(card.installHint)}</code>`);
					} else $$renderer2.push("<!--[!-->");
					$$renderer2.push(`<!--]--></p>`);
				}
				$$renderer2.push(`<!--]-->`);
			} else $$renderer2.push("<!--[!-->");
			$$renderer2.push(`<!--]--> `);
			if (!card.isCliTool && ps) {
				$$renderer2.push("<!--[-->");
				if (ps.available) {
					$$renderer2.push("<!--[-->");
					$$renderer2.push(`<div class="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5"><span class="text-xs font-medium text-success">Configured</span> `);
					if (ps.source === "env") {
						$$renderer2.push("<!--[-->");
						$$renderer2.push(`<span class="text-xs text-text-secondary">via environment variable</span>`);
					} else {
						$$renderer2.push("<!--[!-->");
						if (ps.source === "pulse_env") {
							$$renderer2.push("<!--[-->");
							$$renderer2.push(`<span class="text-xs text-text-secondary">via PULSE_LLM override</span>`);
						} else {
							$$renderer2.push("<!--[!-->");
							if (ps.api_key) {
								$$renderer2.push("<!--[-->");
								$$renderer2.push(`<span class="text-xs text-text-secondary">Key: <code class="rounded bg-bg-hover px-1 font-mono">${escape_html(ps.api_key)}</code></span>`);
							} else $$renderer2.push("<!--[!-->");
							$$renderer2.push(`<!--]-->`);
						}
						$$renderer2.push(`<!--]-->`);
					}
					$$renderer2.push(`<!--]--> `);
					if (ps.model) {
						$$renderer2.push("<!--[-->");
						$$renderer2.push(`<span class="text-xs text-text-secondary">Model: <code class="rounded bg-bg-hover px-1 font-mono">${escape_html(ps.model)}</code></span>`);
					} else $$renderer2.push("<!--[!-->");
					$$renderer2.push(`<!--]--></div>`);
				} else {
					$$renderer2.push("<!--[!-->");
					$$renderer2.push(`<p class="mt-1.5 text-xs text-text-secondary/70">No API key configured</p>`);
				}
				$$renderer2.push(`<!--]-->`);
			} else $$renderer2.push("<!--[!-->");
			$$renderer2.push(`<!--]--></div></div> <div class="mt-1 shrink-0">`);
			if (card.available) {
				$$renderer2.push("<!--[-->");
				$$renderer2.push(`<span class="inline-block h-2 w-2 rounded-full bg-success"></span>`);
			} else {
				$$renderer2.push("<!--[!-->");
				$$renderer2.push(`<span class="inline-block h-2 w-2 rounded-full bg-text-secondary/30"></span>`);
			}
			$$renderer2.push(`<!--]--></div></div></button></form> `);
			if (card.isCliTool && !card.available && data.soloMode) {
				$$renderer2.push("<!--[-->");
				const toolName = CLI_TOOL_NAME[card.type];
				$$renderer2.push(`<div class="border-t border-border/50 px-4 py-2"><form method="POST" action="?/installCliTool"><input type="hidden" name="tool"${attr("value", toolName)}/> <button type="submit"${attr("disabled", installingTool === toolName, true)} class="flex items-center gap-1.5 text-xs text-text-secondary transition hover:text-accent disabled:opacity-50">`);
				if (installingTool === toolName) {
					$$renderer2.push("<!--[-->");
					Loader_circle($$renderer2, {
						size: 12,
						class: "animate-spin"
					});
					$$renderer2.push(`<!----> Installing...`);
				} else {
					$$renderer2.push("<!--[!-->");
					Download($$renderer2, { size: 12 });
					$$renderer2.push(`<!----> Install`);
				}
				$$renderer2.push(`<!--]--></button></form></div>`);
			} else $$renderer2.push("<!--[!-->");
			$$renderer2.push(`<!--]--> `);
			if (!card.isCliTool && card.llmProvider) {
				$$renderer2.push("<!--[-->");
				const provider = card.llmProvider;
				if (ps?.available && ps.source === "org_settings") {
					$$renderer2.push("<!--[-->");
					$$renderer2.push(`<div class="flex items-center gap-1 border-t border-border/50 px-4 py-2"><button type="button" class="flex items-center gap-1.5 rounded px-2 py-1 text-xs text-text-secondary transition hover:bg-bg-hover hover:text-text-primary">`);
					Pencil($$renderer2, { size: 12 });
					$$renderer2.push(`<!----> Edit</button> <form method="POST" action="?/removeProvider"><input type="hidden" name="provider"${attr("value", provider)}/> <button type="submit" class="flex items-center gap-1.5 rounded px-2 py-1 text-xs text-text-secondary transition hover:bg-danger/10 hover:text-danger">`);
					Trash_2($$renderer2, { size: 12 });
					$$renderer2.push(`<!----> Remove</button></form></div>`);
				} else {
					$$renderer2.push("<!--[!-->");
					if (!ps?.available) {
						$$renderer2.push("<!--[-->");
						$$renderer2.push(`<div class="border-t border-border/50 px-4 py-2"><button type="button" class="flex items-center gap-1.5 text-xs text-text-secondary transition hover:text-accent">`);
						Plus($$renderer2, { size: 12 });
						$$renderer2.push(`<!----> Add API Key</button></div>`);
					} else $$renderer2.push("<!--[!-->");
					$$renderer2.push(`<!--]-->`);
				}
				$$renderer2.push(`<!--]--> `);
				if (editingApiKey === provider || addingApiKey === provider) {
					$$renderer2.push("<!--[-->");
					$$renderer2.push(`<form method="POST" action="?/upsertProvider" class="space-y-3 border-t border-border/50 px-4 py-3"><input type="hidden" name="provider"${attr("value", provider)}/> `);
					if (addingApiKey === provider || editingApiKey === provider && ps?.source === "org_settings") {
						$$renderer2.push("<!--[-->");
						$$renderer2.push(`<div><label${attr("for", `key_${stringify(provider)}`)} class="block text-xs font-medium text-text-secondary">API Key</label> <input${attr("id", `key_${stringify(provider)}`)} name="api_key" type="password"${attr("required", addingApiKey === provider, true)} class="mt-1 w-full rounded-md border border-border bg-bg-base px-3 py-1.5 text-sm text-text-primary placeholder-text-secondary/50 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"${attr("placeholder", addingApiKey === provider ? "sk-..." : "Leave empty to keep current")}/></div>`);
					} else $$renderer2.push("<!--[!-->");
					$$renderer2.push(`<!--]--> <div><label${attr("for", `model_${stringify(provider)}`)} class="block text-xs font-medium text-text-secondary">Model <span class="text-text-secondary/50">(optional)</span></label> <input${attr("id", `model_${stringify(provider)}`)} name="model" type="text"${attr("value", ps?.model ?? "")} class="mt-1 w-full rounded-md border border-border bg-bg-base px-3 py-1.5 text-sm text-text-primary placeholder-text-secondary/50 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"${attr("placeholder", PROVIDER_DEFAULTS[provider])}/></div> <div class="flex items-center gap-2"><button type="submit" class="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white transition hover:bg-accent-hover">Save</button> <button type="button" class="rounded-md px-3 py-1.5 text-xs font-medium text-text-secondary transition hover:text-text-primary">Cancel</button></div></form>`);
				} else $$renderer2.push("<!--[!-->");
				$$renderer2.push(`<!--]-->`);
			} else $$renderer2.push("<!--[!-->");
			$$renderer2.push(`<!--]--></div>`);
		}
		$$renderer2.push(`<!--]--></div> `);
		if (!hasServerLlm) {
			$$renderer2.push("<!--[-->");
			$$renderer2.push(`<div class="mt-4 rounded-md border border-border/50 bg-bg-base p-3"><div class="flex items-start gap-2.5">`);
			Message_square($$renderer2, {
				size: 14,
				class: "mt-0.5 shrink-0 text-text-secondary"
			});
			$$renderer2.push(`<!----> <p class="text-xs text-text-secondary"><strong class="text-text-primary">Ask Pulse on the dashboard</strong> requires a configured LLM
						provider`);
			if (data.soloMode) {
				$$renderer2.push("<!--[-->");
				$$renderer2.push(`— either an API key (Anthropic or OpenAI) or a CLI tool (Claude Code or Codex).`);
			} else {
				$$renderer2.push("<!--[!-->");
				$$renderer2.push(`(Anthropic or OpenAI API key).`);
			}
			$$renderer2.push(`<!--]--></p></div></div>`);
		} else $$renderer2.push("<!--[!-->");
		$$renderer2.push(`<!--]--></div> <div class="rounded-md border border-border bg-bg-card p-6"><div class="mb-4 flex items-center justify-between"><h2 class="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-text-secondary">`);
		Sparkles($$renderer2, { size: 16 });
		$$renderer2.push(`<!----> AI Features</h2> `);
		if (data.aiFeatures?.enrichment_enabled) {
			$$renderer2.push("<!--[-->");
			$$renderer2.push(`<span class="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success"><span class="h-1.5 w-1.5 rounded-full bg-success"></span> Enabled</span>`);
		} else {
			$$renderer2.push("<!--[!-->");
			$$renderer2.push(`<span class="inline-flex items-center gap-1.5 rounded-full bg-bg-hover px-2.5 py-0.5 text-xs font-medium text-text-secondary"><span class="h-1.5 w-1.5 rounded-full bg-text-secondary/50"></span> Disabled</span>`);
		}
		$$renderer2.push(`<!--]--></div> <p class="mb-4 text-sm text-text-secondary">Control automatic AI-powered analysis that runs when new insights are created.</p> `);
		if (form?.aiSaved) {
			$$renderer2.push("<!--[-->");
			$$renderer2.push(`<div class="mb-4 rounded-md border border-success/30 bg-success/5 p-3 text-sm text-success">AI feature settings saved.</div>`);
		} else $$renderer2.push("<!--[!-->");
		$$renderer2.push(`<!--]--> `);
		if (form?.aiError) {
			$$renderer2.push("<!--[-->");
			$$renderer2.push(`<div class="mb-4 rounded-md border border-danger/30 bg-danger/5 p-3 text-sm text-danger">${escape_html(form.aiError)}</div>`);
		} else $$renderer2.push("<!--[!-->");
		$$renderer2.push(`<!--]--> <form method="POST" action="?/saveAiFeatures" class="space-y-4"><label class="flex cursor-pointer items-start gap-3"><input type="checkbox" name="enrichment_enabled"${attr("checked", data.aiFeatures?.enrichment_enabled ?? false, true)} class="mt-0.5 h-4 w-4 rounded border-border bg-bg-base text-accent accent-accent"/> <div><span class="text-sm font-medium text-text-primary">Automatic enrichment</span> <p class="text-xs text-text-secondary">Detect contradictions, suggest related links, and assess quality when new insights are created. Uses LLM tokens per insight.</p></div></label> <button type="submit" class="flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover">`);
		Sparkles($$renderer2, { size: 16 });
		$$renderer2.push(`<!----> Save</button></form></div></div>`);
	});
}

//#endregion
export { _page as default };
//# sourceMappingURL=_page.svelte-C2uZltDN.js.map