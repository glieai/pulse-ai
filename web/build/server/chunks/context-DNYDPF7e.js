//#region .svelte-kit/adapter-bun/chunks/context.js
function equals(value) {
	return value === this.v;
}
function safe_not_equal(a, b) {
	return a != a ? b == b : a !== b || a !== null && typeof a === "object" || typeof a === "function";
}
function safe_equals(value) {
	return !safe_not_equal(value, this.v);
}
function lifecycle_outside_component(name) {
	throw new Error(`https://svelte.dev/e/lifecycle_outside_component`);
}
var ssr_context = null;
function set_ssr_context(v) {
	ssr_context = v;
}
function getContext(key) {
	return get_or_init_context_map().get(key);
}
function setContext(key, context) {
	get_or_init_context_map().set(key, context);
	return context;
}
function hasContext(key) {
	return get_or_init_context_map().has(key);
}
function get_or_init_context_map(name) {
	if (ssr_context === null) lifecycle_outside_component();
	return ssr_context.c ??= new Map(get_parent_context(ssr_context) || void 0);
}
function push(fn) {
	ssr_context = {
		p: ssr_context,
		c: null,
		r: null
	};
}
function pop() {
	ssr_context = ssr_context.p;
}
function get_parent_context(ssr_context2) {
	let parent = ssr_context2.p;
	while (parent !== null) {
		const context_map = parent.c;
		if (context_map !== null) return context_map;
		parent = parent.p;
	}
	return null;
}

//#endregion
export { push as a, setContext as c, pop as i, set_ssr_context as l, getContext as n, safe_equals as o, hasContext as r, safe_not_equal as s, equals as t, ssr_context as u };
//# sourceMappingURL=context-DNYDPF7e.js.map