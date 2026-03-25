import { Q as sanitize_props, at as slot, st as spread_props } from "./chunks-CJh457eN.js";
import { t as Icon } from "./Icon-BJuLBbSM.js";

//#region .svelte-kit/adapter-bun/chunks/download.js
function Download($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "download" },
		sanitize_props($$props),
		{
			iconNode: [
				["path", { "d": "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }],
				["polyline", { "points": "7 10 12 15 17 10" }],
				["line", {
					"x1": "12",
					"x2": "12",
					"y1": "15",
					"y2": "3"
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
export { Download as t };
//# sourceMappingURL=download-1kzMSqS6.js.map