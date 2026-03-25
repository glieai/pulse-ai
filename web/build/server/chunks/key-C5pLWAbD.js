import { Q as sanitize_props, at as slot, st as spread_props } from "./chunks-CJh457eN.js";
import { t as Icon } from "./Icon-BJuLBbSM.js";

//#region .svelte-kit/adapter-bun/chunks/key.js
function Key($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "key" },
		sanitize_props($$props),
		{
			iconNode: [
				["path", { "d": "m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4" }],
				["path", { "d": "m21 2-9.6 9.6" }],
				["circle", {
					"cx": "7.5",
					"cy": "15.5",
					"r": "5.5"
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
export { Key as t };
//# sourceMappingURL=key-C5pLWAbD.js.map