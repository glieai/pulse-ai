import { Q as sanitize_props, at as slot, st as spread_props } from "./chunks-CJh457eN.js";
import { t as Icon } from "./Icon-BJuLBbSM.js";

//#region .svelte-kit/adapter-bun/chunks/triangle-alert.js
function Triangle_alert($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "triangle-alert" },
		sanitize_props($$props),
		{
			iconNode: [
				["path", { "d": "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" }],
				["path", { "d": "M12 9v4" }],
				["path", { "d": "M12 17h.01" }]
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
export { Triangle_alert as t };
//# sourceMappingURL=triangle-alert-B4jz4zMC.js.map