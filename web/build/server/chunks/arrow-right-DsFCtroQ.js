import { Q as sanitize_props, at as slot, st as spread_props } from "./chunks-CJh457eN.js";
import { t as Icon } from "./Icon-BJuLBbSM.js";

//#region .svelte-kit/adapter-bun/chunks/arrow-right.js
function Arrow_right($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "arrow-right" },
		sanitize_props($$props),
		{
			iconNode: [["path", { "d": "M5 12h14" }], ["path", { "d": "m12 5 7 7-7 7" }]],
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
export { Arrow_right as t };
//# sourceMappingURL=arrow-right-DsFCtroQ.js.map