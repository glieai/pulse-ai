import { Q as sanitize_props, at as slot, st as spread_props } from "./chunks-CJh457eN.js";
import { t as Icon } from "./Icon-BJuLBbSM.js";

//#region .svelte-kit/adapter-bun/chunks/file-code.js
function File_code($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "file-code" },
		sanitize_props($$props),
		{
			iconNode: [
				["path", { "d": "M10 12.5 8 15l2 2.5" }],
				["path", { "d": "m14 12.5 2 2.5-2 2.5" }],
				["path", { "d": "M14 2v4a2 2 0 0 0 2 2h4" }],
				["path", { "d": "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z" }]
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
export { File_code as t };
//# sourceMappingURL=file-code-dQ4lkGhI.js.map