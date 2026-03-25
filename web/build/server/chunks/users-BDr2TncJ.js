import { Q as sanitize_props, at as slot, st as spread_props } from "./chunks-CJh457eN.js";
import { t as Icon } from "./Icon-BJuLBbSM.js";

//#region .svelte-kit/adapter-bun/chunks/users.js
function Bar_chart_3($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "bar-chart-3" },
		sanitize_props($$props),
		{
			iconNode: [
				["path", { "d": "M3 3v18h18" }],
				["path", { "d": "M18 17V9" }],
				["path", { "d": "M13 17V5" }],
				["path", { "d": "M8 17v-3" }]
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
function Users($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "users" },
		sanitize_props($$props),
		{
			iconNode: [
				["path", { "d": "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }],
				["circle", {
					"cx": "9",
					"cy": "7",
					"r": "4"
				}],
				["path", { "d": "M22 21v-2a4 4 0 0 0-3-3.87" }],
				["path", { "d": "M16 3.13a4 4 0 0 1 0 7.75" }]
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
export { Users as n, Bar_chart_3 as t };
//# sourceMappingURL=users-BDr2TncJ.js.map