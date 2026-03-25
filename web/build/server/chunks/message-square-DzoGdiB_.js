import { Q as sanitize_props, at as slot, st as spread_props } from "./chunks-CJh457eN.js";
import { t as Icon } from "./Icon-BJuLBbSM.js";

//#region .svelte-kit/adapter-bun/chunks/message-square.js
function Message_square($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "message-square" },
		sanitize_props($$props),
		{
			iconNode: [["path", { "d": "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" }]],
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
export { Message_square as t };
//# sourceMappingURL=message-square-DzoGdiB_.js.map