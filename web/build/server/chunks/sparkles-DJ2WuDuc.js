import { Q as sanitize_props, at as slot, st as spread_props } from "./chunks-CJh457eN.js";
import { t as Icon } from "./Icon-BJuLBbSM.js";

//#region .svelte-kit/adapter-bun/chunks/sparkles.js
function Sparkles($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "sparkles" },
		sanitize_props($$props),
		{
			iconNode: [
				["path", { "d": "M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" }],
				["path", { "d": "M20 3v4" }],
				["path", { "d": "M22 5h-4" }],
				["path", { "d": "M4 17v2" }],
				["path", { "d": "M5 18H3" }]
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
export { Sparkles as t };
//# sourceMappingURL=sparkles-DJ2WuDuc.js.map