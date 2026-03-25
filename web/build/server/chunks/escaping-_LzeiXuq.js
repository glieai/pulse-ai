//#region .svelte-kit/adapter-bun/chunks/escaping.js
var is_array = Array.isArray;
var index_of = Array.prototype.indexOf;
var includes = Array.prototype.includes;
var array_from = Array.from;
var define_property = Object.defineProperty;
var get_descriptor = Object.getOwnPropertyDescriptor;
var object_prototype = Object.prototype;
var array_prototype = Array.prototype;
var get_prototype_of = Object.getPrototypeOf;
var is_extensible = Object.isExtensible;
const noop = () => {};
function run(fn) {
	return fn();
}
function run_all(arr) {
	for (var i = 0; i < arr.length; i++) arr[i]();
}
function deferred() {
	var resolve;
	var reject;
	return {
		promise: new Promise((res, rej) => {
			resolve = res;
			reject = rej;
		}),
		resolve,
		reject
	};
}
function fallback(value, fallback2, lazy = false) {
	return value === void 0 ? lazy ? fallback2() : fallback2 : value;
}
const ATTR_REGEX = /[&"<]/g;
const CONTENT_REGEX = /[&<]/g;
function escape_html(value, is_attr) {
	const str = String(value ?? "");
	const pattern = is_attr ? ATTR_REGEX : CONTENT_REGEX;
	pattern.lastIndex = 0;
	let escaped = "";
	let last = 0;
	while (pattern.test(str)) {
		const i = pattern.lastIndex - 1;
		const ch = str[i];
		escaped += str.substring(last, i) + (ch === "&" ? "&amp;" : ch === "\"" ? "&quot;" : "&lt;");
		last = i + 1;
	}
	return escaped + str.substring(last);
}

//#endregion
export { escape_html as a, get_prototype_of as c, is_array as d, is_extensible as f, run_all as g, run as h, define_property as i, includes as l, object_prototype as m, array_prototype as n, fallback as o, noop as p, deferred as r, get_descriptor as s, array_from as t, index_of as u };
//# sourceMappingURL=escaping-_LzeiXuq.js.map