import { Q as sanitize_props, at as slot, st as spread_props } from "./chunks-CJh457eN.js";
import { t as Icon } from "./Icon-BJuLBbSM.js";

//#region .svelte-kit/adapter-bun/chunks/search.js
function Search($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "search" },
		sanitize_props($$props),
		{
			iconNode: [["circle", {
				"cx": "11",
				"cy": "11",
				"r": "8"
			}], ["path", { "d": "m21 21-4.3-4.3" }]],
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
export { Search as t };
//# sourceMappingURL=search-DPIUivoZ.js.map