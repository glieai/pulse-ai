import { n as getContext } from "./context-DNYDPF7e.js";
import { n as writable } from "./index2-DDApFMp8.js";

//#region .svelte-kit/adapter-bun/chunks/index3.js
function create_updated_store() {
	const { set, subscribe } = writable(false);
	return {
		subscribe,
		check: async () => false
	};
}
({ updated: /* @__PURE__ */ create_updated_store() }).updated.check;
function context() {
	return getContext("__request__");
}
const page = {
	get data() {
		return context().page.data;
	},
	get error() {
		return context().page.error;
	},
	get status() {
		return context().page.status;
	},
	get url() {
		return context().page.url;
	}
};

//#endregion
export { page as t };
//# sourceMappingURL=index3-C1R2c9j7.js.map