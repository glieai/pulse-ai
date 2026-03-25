import { Q as sanitize_props, at as slot, st as spread_props } from "./chunks-CJh457eN.js";
import { t as Icon } from "./Icon-BJuLBbSM.js";

//#region .svelte-kit/adapter-bun/chunks/building-2.js
function Building_2($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "building-2" },
		sanitize_props($$props),
		{
			iconNode: [
				["path", { "d": "M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" }],
				["path", { "d": "M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" }],
				["path", { "d": "M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" }],
				["path", { "d": "M10 6h4" }],
				["path", { "d": "M10 10h4" }],
				["path", { "d": "M10 14h4" }],
				["path", { "d": "M10 18h4" }]
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

//#endregion
export { Building_2 as t };
//# sourceMappingURL=building-2-CSJhQvCu.js.map