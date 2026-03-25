import { Q as sanitize_props, at as slot, st as spread_props } from "./chunks-CJh457eN.js";
import { t as Icon } from "./Icon-BJuLBbSM.js";

//#region .svelte-kit/adapter-bun/chunks/file-text.js
function File_text($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "file-text" },
		sanitize_props($$props),
		{
			iconNode: [
				["path", { "d": "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" }],
				["path", { "d": "M14 2v4a2 2 0 0 0 2 2h4" }],
				["path", { "d": "M10 9H8" }],
				["path", { "d": "M16 13H8" }],
				["path", { "d": "M16 17H8" }]
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
export { File_text as t };
//# sourceMappingURL=file-text-DyUvkZ9a.js.map