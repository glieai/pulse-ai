import "./exports-BAQMwGYm.js";
import { a as escape_html } from "./escaping-_LzeiXuq.js";
import "./index2-DDApFMp8.js";
import "./state.svelte-DH-R59PY.js";
import { t as page } from "./index3-C1R2c9j7.js";

//#region .svelte-kit/adapter-bun/entries/fallbacks/error.svelte.js
function Error($$renderer, $$props) {
	$$renderer.component(($$renderer2) => {
		$$renderer2.push(`<h1>${escape_html(page.status)}</h1> <p>${escape_html(page.error?.message)}</p>`);
	});
}

//#endregion
export { Error as default };
//# sourceMappingURL=error.svelte-B-t7IMYA.js.map