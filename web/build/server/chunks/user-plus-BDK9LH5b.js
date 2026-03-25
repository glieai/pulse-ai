import { Q as sanitize_props, at as slot, st as spread_props } from "./chunks-CJh457eN.js";
import { t as Icon } from "./Icon-BJuLBbSM.js";

//#region .svelte-kit/adapter-bun/chunks/user-plus.js
function User_plus($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "user-plus" },
		sanitize_props($$props),
		{
			iconNode: [
				["path", { "d": "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }],
				["circle", {
					"cx": "9",
					"cy": "7",
					"r": "4"
				}],
				["line", {
					"x1": "19",
					"x2": "19",
					"y1": "8",
					"y2": "14"
				}],
				["line", {
					"x1": "22",
					"x2": "16",
					"y1": "11",
					"y2": "11"
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
export { User_plus as t };
//# sourceMappingURL=user-plus-BDK9LH5b.js.map