import { Q as sanitize_props, at as slot, st as spread_props } from "./chunks-CJh457eN.js";
import { t as Icon } from "./Icon-BJuLBbSM.js";

//#region .svelte-kit/adapter-bun/chunks/trash-2.js
function Trash_2($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "trash-2" },
		sanitize_props($$props),
		{
			iconNode: [
				["path", { "d": "M3 6h18" }],
				["path", { "d": "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" }],
				["path", { "d": "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" }],
				["line", {
					"x1": "10",
					"x2": "10",
					"y1": "11",
					"y2": "17"
				}],
				["line", {
					"x1": "14",
					"x2": "14",
					"y1": "11",
					"y2": "17"
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

//#endregion
export { Trash_2 as t };
//# sourceMappingURL=trash-2-6sJxdUwD.js.map