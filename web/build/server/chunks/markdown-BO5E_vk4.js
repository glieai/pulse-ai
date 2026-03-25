import { h as attr_class, lt as stringify } from "./chunks-CJh457eN.js";
import { a as escape_html } from "./escaping-_LzeiXuq.js";
import { Marked } from "marked";

//#region .svelte-kit/adapter-bun/chunks/markdown.js
function KindBadge($$renderer, $$props) {
	$$renderer.component(($$renderer2) => {
		let { kind } = $$props;
		$$renderer2.push(`<span${attr_class(`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${stringify({
			decision: "bg-accent/10 text-accent",
			dead_end: "bg-danger/10 text-danger",
			pattern: "bg-success/10 text-success",
			progress: "bg-warning/10 text-warning",
			context: "bg-text-secondary/10 text-text-secondary",
			business: "bg-purple-500/10 text-purple-400"
		}[kind])}`)}>${escape_html(kind.replace("_", " "))}</span>`);
	});
}
const md = new Marked({ renderer: { html: () => "" } });
function renderMarkdown(src) {
	return md.parse(src);
}
function stripMarkdown(src) {
	return src.replace(/```[\s\S]*?```/g, "").replace(/^#{1,6}\s+/gm, "").replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1").replace(/^\s*[-*+]\s+/gm, "").replace(/^\s*\d+\.\s+/gm, "").replace(/^\s*>\s+/gm, "").replace(/---+/g, "").replace(/\n{2,}/g, " ").trim();
}

//#endregion
export { renderMarkdown as n, stripMarkdown as r, KindBadge as t };
//# sourceMappingURL=markdown-BO5E_vk4.js.map