import { Q as sanitize_props, at as slot, st as spread_props } from "./chunks-CJh457eN.js";
import { t as Icon } from "./Icon-BJuLBbSM.js";

//#region .svelte-kit/adapter-bun/chunks/chevron-right.js
function Chevron_left($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "chevron-left" },
		sanitize_props($$props),
		{
			iconNode: [["path", { "d": "m15 18-6-6 6-6" }]],
			children: ($$renderer2) => {
				$$renderer2.push(`<!--[-->`);
				slot($$renderer2, $$props, "default", {});
				$$renderer2.push(`<!--]-->`);
			},
			$$slots: { default: true }
		}
	]));
}
function Chevron_right($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "chevron-right" },
		sanitize_props($$props),
		{
			iconNode: [["path", { "d": "m9 18 6-6-6-6" }]],
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
export { Chevron_right as n, Chevron_left as t };
//# sourceMappingURL=chevron-right-DgYimo9b.js.map