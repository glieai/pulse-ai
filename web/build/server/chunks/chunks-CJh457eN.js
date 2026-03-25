import { a as escape_html, c as get_prototype_of, d as is_array, f as is_extensible, g as run_all, l as includes, m as object_prototype, n as array_prototype, p as noop, r as deferred, s as get_descriptor, u as index_of } from "./escaping-_LzeiXuq.js";
import { i as to_style, n as clsx, r as to_class, t as attr } from "./attributes-Dog1ICvy.js";
import { a as push$1, i as pop$1, l as set_ssr_context, o as safe_equals, t as equals, u as ssr_context } from "./context-DNYDPF7e.js";

//#region .svelte-kit/adapter-bun/chunks/utils.js
const DEV = false;
const escaped = {
	"<": "\\u003C",
	"\\": "\\\\",
	"\b": "\\b",
	"\f": "\\f",
	"\n": "\\n",
	"\r": "\\r",
	"	": "\\t",
	"\u2028": "\\u2028",
	"\u2029": "\\u2029"
};
var DevalueError = class extends Error {
	/**
	* @param {string} message
	* @param {string[]} keys
	* @param {any} [value] - The value that failed to be serialized
	* @param {any} [root] - The root value being serialized
	*/
	constructor(message, keys, value, root) {
		super(message);
		this.name = "DevalueError";
		this.path = keys.join("");
		this.value = value;
		this.root = root;
	}
};
function is_primitive(thing) {
	return Object(thing) !== thing;
}
const object_proto_names = /* @__PURE__ */ Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
function is_plain_object(thing) {
	const proto = Object.getPrototypeOf(thing);
	return proto === Object.prototype || proto === null || Object.getPrototypeOf(proto) === null || Object.getOwnPropertyNames(proto).sort().join("\0") === object_proto_names;
}
function get_type(thing) {
	return Object.prototype.toString.call(thing).slice(8, -1);
}
function get_escaped_char(char) {
	switch (char) {
		case "\"": return "\\\"";
		case "<": return "\\u003C";
		case "\\": return "\\\\";
		case "\n": return "\\n";
		case "\r": return "\\r";
		case "	": return "\\t";
		case "\b": return "\\b";
		case "\f": return "\\f";
		case "\u2028": return "\\u2028";
		case "\u2029": return "\\u2029";
		default: return char < " " ? `\\u${char.charCodeAt(0).toString(16).padStart(4, "0")}` : "";
	}
}
function stringify_string(str) {
	let result = "";
	let last_pos = 0;
	const len = str.length;
	for (let i = 0; i < len; i += 1) {
		const char = str[i];
		const replacement = get_escaped_char(char);
		if (replacement) {
			result += str.slice(last_pos, i) + replacement;
			last_pos = i + 1;
		}
	}
	return `"${last_pos === 0 ? str : result + str.slice(last_pos)}"`;
}
function enumerable_symbols(object) {
	return Object.getOwnPropertySymbols(object).filter((symbol) => Object.getOwnPropertyDescriptor(object, symbol).enumerable);
}
const is_identifier = /^[a-zA-Z_$][a-zA-Z_$0-9]*$/;
function stringify_key(key) {
	return is_identifier.test(key) ? "." + key : "[" + JSON.stringify(key) + "]";
}

//#endregion
//#region .svelte-kit/adapter-bun/chunks/index.js
const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$";
const unsafe_chars = /[<\b\f\n\r\t\0\u2028\u2029]/g;
const reserved = /^(?:do|if|in|for|int|let|new|try|var|byte|case|char|else|enum|goto|long|this|void|with|await|break|catch|class|const|final|float|short|super|throw|while|yield|delete|double|export|import|native|return|switch|throws|typeof|boolean|default|extends|finally|package|private|abstract|continue|debugger|function|volatile|interface|protected|transient|implements|instanceof|synchronized)$/;
function uneval(value, replacer) {
	const counts = /* @__PURE__ */ new Map();
	const keys = [];
	const custom = /* @__PURE__ */ new Map();
	function walk(thing) {
		if (!is_primitive(thing)) {
			if (counts.has(thing)) {
				counts.set(thing, counts.get(thing) + 1);
				return;
			}
			counts.set(thing, 1);
			if (replacer) {
				const str2 = replacer(thing, (value2) => uneval(value2, replacer));
				if (typeof str2 === "string") {
					custom.set(thing, str2);
					return;
				}
			}
			if (typeof thing === "function") throw new DevalueError(`Cannot stringify a function`, keys, thing, value);
			switch (get_type(thing)) {
				case "Number":
				case "BigInt":
				case "String":
				case "Boolean":
				case "Date":
				case "RegExp":
				case "URL":
				case "URLSearchParams": return;
				case "Array":
					thing.forEach((value2, i) => {
						keys.push(`[${i}]`);
						walk(value2);
						keys.pop();
					});
					break;
				case "Set":
					Array.from(thing).forEach(walk);
					break;
				case "Map":
					for (const [key, value2] of thing) {
						keys.push(`.get(${is_primitive(key) ? stringify_primitive(key) : "..."})`);
						walk(value2);
						keys.pop();
					}
					break;
				case "Int8Array":
				case "Uint8Array":
				case "Uint8ClampedArray":
				case "Int16Array":
				case "Uint16Array":
				case "Int32Array":
				case "Uint32Array":
				case "Float32Array":
				case "Float64Array":
				case "BigInt64Array":
				case "BigUint64Array":
					walk(thing.buffer);
					return;
				case "ArrayBuffer": return;
				case "Temporal.Duration":
				case "Temporal.Instant":
				case "Temporal.PlainDate":
				case "Temporal.PlainTime":
				case "Temporal.PlainDateTime":
				case "Temporal.PlainMonthDay":
				case "Temporal.PlainYearMonth":
				case "Temporal.ZonedDateTime": return;
				default:
					if (!is_plain_object(thing)) throw new DevalueError(`Cannot stringify arbitrary non-POJOs`, keys, thing, value);
					if (enumerable_symbols(thing).length > 0) throw new DevalueError(`Cannot stringify POJOs with symbolic keys`, keys, thing, value);
					for (const key in thing) {
						keys.push(stringify_key(key));
						walk(thing[key]);
						keys.pop();
					}
			}
		}
	}
	walk(value);
	const names = /* @__PURE__ */ new Map();
	Array.from(counts).filter((entry) => entry[1] > 1).sort((a, b) => b[1] - a[1]).forEach((entry, i) => {
		names.set(entry[0], get_name(i));
	});
	function stringify2(thing) {
		if (names.has(thing)) return names.get(thing);
		if (is_primitive(thing)) return stringify_primitive(thing);
		if (custom.has(thing)) return custom.get(thing);
		const type = get_type(thing);
		switch (type) {
			case "Number":
			case "String":
			case "Boolean": return `Object(${stringify2(thing.valueOf())})`;
			case "RegExp": return `new RegExp(${stringify_string(thing.source)}, "${thing.flags}")`;
			case "Date": return `new Date(${thing.getTime()})`;
			case "URL": return `new URL(${stringify_string(thing.toString())})`;
			case "URLSearchParams": return `new URLSearchParams(${stringify_string(thing.toString())})`;
			case "Array":
				const members = thing.map((v, i) => i in thing ? stringify2(v) : "");
				const tail = thing.length === 0 || thing.length - 1 in thing ? "" : ",";
				return `[${members.join(",")}${tail}]`;
			case "Set":
			case "Map": return `new ${type}([${Array.from(thing).map(stringify2).join(",")}])`;
			case "Int8Array":
			case "Uint8Array":
			case "Uint8ClampedArray":
			case "Int16Array":
			case "Uint16Array":
			case "Int32Array":
			case "Uint32Array":
			case "Float32Array":
			case "Float64Array":
			case "BigInt64Array":
			case "BigUint64Array": {
				let str2 = `new ${type}`;
				if (counts.get(thing.buffer) === 1) {
					const array = new thing.constructor(thing.buffer);
					str2 += `([${array}])`;
				} else str2 += `([${stringify2(thing.buffer)}])`;
				const a = thing.byteOffset;
				const b = a + thing.byteLength;
				if (a > 0 || b !== thing.buffer.byteLength) {
					const m = +/(\d+)/.exec(type)[1] / 8;
					str2 += `.subarray(${a / m},${b / m})`;
				}
				return str2;
			}
			case "ArrayBuffer": return `new Uint8Array([${new Uint8Array(thing).toString()}]).buffer`;
			case "Temporal.Duration":
			case "Temporal.Instant":
			case "Temporal.PlainDate":
			case "Temporal.PlainTime":
			case "Temporal.PlainDateTime":
			case "Temporal.PlainMonthDay":
			case "Temporal.PlainYearMonth":
			case "Temporal.ZonedDateTime": return `${type}.from(${stringify_string(thing.toString())})`;
			default:
				const keys2 = Object.keys(thing);
				const obj = keys2.map((key) => `${safe_key(key)}:${stringify2(thing[key])}`).join(",");
				if (Object.getPrototypeOf(thing) === null) return keys2.length > 0 ? `{${obj},__proto__:null}` : `{__proto__:null}`;
				return `{${obj}}`;
		}
	}
	const str = stringify2(value);
	if (names.size) {
		const params = [];
		const statements = [];
		const values = [];
		names.forEach((name, thing) => {
			params.push(name);
			if (custom.has(thing)) {
				values.push(
					/** @type {string} */
					custom.get(thing)
				);
				return;
			}
			if (is_primitive(thing)) {
				values.push(stringify_primitive(thing));
				return;
			}
			switch (get_type(thing)) {
				case "Number":
				case "String":
				case "Boolean":
					values.push(`Object(${stringify2(thing.valueOf())})`);
					break;
				case "RegExp":
					values.push(thing.toString());
					break;
				case "Date":
					values.push(`new Date(${thing.getTime()})`);
					break;
				case "Array":
					values.push(`Array(${thing.length})`);
					thing.forEach((v, i) => {
						statements.push(`${name}[${i}]=${stringify2(v)}`);
					});
					break;
				case "Set":
					values.push(`new Set`);
					statements.push(`${name}.${Array.from(thing).map((v) => `add(${stringify2(v)})`).join(".")}`);
					break;
				case "Map":
					values.push(`new Map`);
					statements.push(`${name}.${Array.from(thing).map(([k, v]) => `set(${stringify2(k)}, ${stringify2(v)})`).join(".")}`);
					break;
				case "ArrayBuffer":
					values.push(`new Uint8Array([${new Uint8Array(thing).join(",")}]).buffer`);
					break;
				default:
					values.push(Object.getPrototypeOf(thing) === null ? "Object.create(null)" : "{}");
					Object.keys(thing).forEach((key) => {
						statements.push(`${name}${safe_prop(key)}=${stringify2(thing[key])}`);
					});
			}
		});
		statements.push(`return ${str}`);
		return `(function(${params.join(",")}){${statements.join(";")}}(${values.join(",")}))`;
	} else return str;
}
function get_name(num) {
	let name = "";
	do {
		name = chars[num % 54] + name;
		num = ~~(num / 54) - 1;
	} while (num >= 0);
	return reserved.test(name) ? `${name}0` : name;
}
function escape_unsafe_char(c) {
	return escaped[c] || c;
}
function escape_unsafe_chars(str) {
	return str.replace(unsafe_chars, escape_unsafe_char);
}
function safe_key(key) {
	return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? key : escape_unsafe_chars(JSON.stringify(key));
}
function safe_prop(key) {
	return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? `.${key}` : `[${escape_unsafe_chars(JSON.stringify(key))}]`;
}
function stringify_primitive(thing) {
	if (typeof thing === "string") return stringify_string(thing);
	if (thing === void 0) return "void 0";
	if (thing === 0 && 1 / thing < 0) return "-0";
	const str = String(thing);
	if (typeof thing === "number") return str.replace(/^(-)?0\./, "$1.");
	if (typeof thing === "bigint") return thing + "n";
	return str;
}
const DERIVED = 2;
const EFFECT = 4;
const RENDER_EFFECT = 8;
const MANAGED_EFFECT = 1 << 24;
const BLOCK_EFFECT = 16;
const BRANCH_EFFECT = 32;
const ROOT_EFFECT = 64;
const BOUNDARY_EFFECT = 128;
const CONNECTED = 512;
const CLEAN = 1024;
const DIRTY = 2048;
const MAYBE_DIRTY = 4096;
const INERT = 8192;
const DESTROYED = 16384;
const EFFECT_RAN = 32768;
const EFFECT_TRANSPARENT = 65536;
const EAGER_EFFECT = 1 << 17;
const HEAD_EFFECT = 1 << 18;
const EFFECT_PRESERVED = 1 << 19;
const USER_EFFECT = 1 << 20;
const WAS_MARKED = 32768;
const REACTION_IS_UPDATING = 1 << 21;
const ASYNC = 1 << 22;
const ERROR_VALUE = 1 << 23;
const STATE_SYMBOL = /* @__PURE__ */ Symbol("$state");
const LEGACY_PROPS = /* @__PURE__ */ Symbol("legacy props");
const STALE_REACTION = new class StaleReactionError extends Error {
	name = "StaleReactionError";
	message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
const COMMENT_NODE = 8;
function effect_update_depth_exceeded() {
	throw new Error(`https://svelte.dev/e/effect_update_depth_exceeded`);
}
function hydration_failed() {
	throw new Error(`https://svelte.dev/e/hydration_failed`);
}
function state_descriptors_fixed() {
	throw new Error(`https://svelte.dev/e/state_descriptors_fixed`);
}
function state_prototype_fixed() {
	throw new Error(`https://svelte.dev/e/state_prototype_fixed`);
}
function state_unsafe_mutation() {
	throw new Error(`https://svelte.dev/e/state_unsafe_mutation`);
}
function svelte_boundary_reset_onerror() {
	throw new Error(`https://svelte.dev/e/svelte_boundary_reset_onerror`);
}
const HYDRATION_START = "[";
const HYDRATION_START_ELSE = "[!";
const HYDRATION_END = "]";
const HYDRATION_ERROR = {};
const ELEMENT_IS_NAMESPACED = 1;
const ELEMENT_PRESERVE_ATTRIBUTE_CASE = 2;
const ELEMENT_IS_INPUT = 4;
const UNINITIALIZED = /* @__PURE__ */ Symbol();
let component_context = null;
function set_component_context(context) {
	component_context = context;
}
function push(props, runes = false, fn) {
	component_context = {
		p: component_context,
		i: false,
		c: null,
		e: null,
		s: props,
		x: null,
		l: null
	};
}
function pop(component) {
	var context = component_context;
	var effects = context.e;
	if (effects !== null) {
		context.e = null;
		for (var fn of effects) create_user_effect(fn);
	}
	context.i = true;
	component_context = context.p;
	return (
	/** @type {T} */
	{});
}
function is_runes() {
	return true;
}
let micro_tasks = [];
function run_micro_tasks() {
	var tasks = micro_tasks;
	micro_tasks = [];
	run_all(tasks);
}
function queue_micro_task(fn) {
	if (micro_tasks.length === 0 && !is_flushing_sync) {
		var tasks = micro_tasks;
		queueMicrotask(() => {
			if (tasks === micro_tasks) run_micro_tasks();
		});
	}
	micro_tasks.push(fn);
}
function flush_tasks() {
	while (micro_tasks.length > 0) run_micro_tasks();
}
function handle_error(error) {
	var effect = active_effect;
	if (effect === null) {
		active_reaction.f |= ERROR_VALUE;
		return error;
	}
	if ((effect.f & EFFECT_RAN) === 0) {
		if ((effect.f & BOUNDARY_EFFECT) === 0) throw error;
		effect.b.error(error);
	} else invoke_error_boundary(error, effect);
}
function invoke_error_boundary(error, effect) {
	while (effect !== null) {
		if ((effect.f & BOUNDARY_EFFECT) !== 0) try {
			effect.b.error(error);
			return;
		} catch (e) {
			error = e;
		}
		effect = effect.parent;
	}
	throw error;
}
const STATUS_MASK = -7169;
function set_signal_status(signal, status) {
	signal.f = signal.f & STATUS_MASK | status;
}
function update_derived_status(derived2) {
	if ((derived2.f & CONNECTED) !== 0 || derived2.deps === null) set_signal_status(derived2, CLEAN);
	else set_signal_status(derived2, MAYBE_DIRTY);
}
function clear_marked(deps) {
	if (deps === null) return;
	for (const dep of deps) {
		if ((dep.f & DERIVED) === 0 || (dep.f & WAS_MARKED) === 0) continue;
		dep.f ^= WAS_MARKED;
		clear_marked(
			/** @type {Derived} */
			dep.deps
		);
	}
}
function defer_effect(effect, dirty_effects, maybe_dirty_effects) {
	if ((effect.f & DIRTY) !== 0) dirty_effects.add(effect);
	else if ((effect.f & MAYBE_DIRTY) !== 0) maybe_dirty_effects.add(effect);
	clear_marked(effect.deps);
	set_signal_status(effect, CLEAN);
}
const batches = /* @__PURE__ */ new Set();
let current_batch = null;
let batch_values = null;
let queued_root_effects = [];
let last_scheduled_effect = null;
let is_flushing = false;
let is_flushing_sync = false;
var Batch = class Batch {
	committed = false;
	/**
	* The current values of any sources that are updated in this batch
	* They keys of this map are identical to `this.#previous`
	* @type {Map<Source, any>}
	*/
	current = /* @__PURE__ */ new Map();
	/**
	* The values of any sources that are updated in this batch _before_ those updates took place.
	* They keys of this map are identical to `this.#current`
	* @type {Map<Source, any>}
	*/
	previous = /* @__PURE__ */ new Map();
	/**
	* When the batch is committed (and the DOM is updated), we need to remove old branches
	* and append new ones by calling the functions added inside (if/each/key/etc) blocks
	* @type {Set<() => void>}
	*/
	#commit_callbacks = /* @__PURE__ */ new Set();
	/**
	* If a fork is discarded, we need to destroy any effects that are no longer needed
	* @type {Set<(batch: Batch) => void>}
	*/
	#discard_callbacks = /* @__PURE__ */ new Set();
	/**
	* The number of async effects that are currently in flight
	*/
	#pending = 0;
	/**
	* The number of async effects that are currently in flight, _not_ inside a pending boundary
	*/
	#blocking_pending = 0;
	/**
	* A deferred that resolves when the batch is committed, used with `settled()`
	* TODO replace with Promise.withResolvers once supported widely enough
	* @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null}
	*/
	#deferred = null;
	/**
	* Deferred effects (which run after async work has completed) that are DIRTY
	* @type {Set<Effect>}
	*/
	#dirty_effects = /* @__PURE__ */ new Set();
	/**
	* Deferred effects that are MAYBE_DIRTY
	* @type {Set<Effect>}
	*/
	#maybe_dirty_effects = /* @__PURE__ */ new Set();
	/**
	* A map of branches that still exist, but will be destroyed when this batch
	* is committed — we skip over these during `process`.
	* The value contains child effects that were dirty/maybe_dirty before being reset,
	* so they can be rescheduled if the branch survives.
	* @type {Map<Effect, { d: Effect[], m: Effect[] }>}
	*/
	#skipped_branches = /* @__PURE__ */ new Map();
	is_fork = false;
	#decrement_queued = false;
	is_deferred() {
		return this.is_fork || this.#blocking_pending > 0;
	}
	/**
	* Add an effect to the #skipped_branches map and reset its children
	* @param {Effect} effect
	*/
	skip_effect(effect) {
		if (!this.#skipped_branches.has(effect)) this.#skipped_branches.set(effect, {
			d: [],
			m: []
		});
	}
	/**
	* Remove an effect from the #skipped_branches map and reschedule
	* any tracked dirty/maybe_dirty child effects
	* @param {Effect} effect
	*/
	unskip_effect(effect) {
		var tracked = this.#skipped_branches.get(effect);
		if (tracked) {
			this.#skipped_branches.delete(effect);
			for (var e of tracked.d) {
				set_signal_status(e, DIRTY);
				schedule_effect(e);
			}
			for (e of tracked.m) {
				set_signal_status(e, MAYBE_DIRTY);
				schedule_effect(e);
			}
		}
	}
	/**
	*
	* @param {Effect[]} root_effects
	*/
	process(root_effects) {
		queued_root_effects = [];
		this.apply();
		var effects = [];
		var render_effects = [];
		for (const root of root_effects) this.#traverse_effect_tree(root, effects, render_effects);
		if (this.is_deferred()) {
			this.#defer_effects(render_effects);
			this.#defer_effects(effects);
			for (const [e, t] of this.#skipped_branches) reset_branch(e, t);
		} else {
			for (const fn of this.#commit_callbacks) fn();
			this.#commit_callbacks.clear();
			if (this.#pending === 0) this.#commit();
			current_batch = null;
			flush_queued_effects(render_effects);
			flush_queued_effects(effects);
			this.#deferred?.resolve();
		}
		batch_values = null;
	}
	/**
	* Traverse the effect tree, executing effects or stashing
	* them for later execution as appropriate
	* @param {Effect} root
	* @param {Effect[]} effects
	* @param {Effect[]} render_effects
	*/
	#traverse_effect_tree(root, effects, render_effects) {
		root.f ^= CLEAN;
		var effect = root.first;
		var pending_boundary = null;
		while (effect !== null) {
			var flags = effect.f;
			var is_branch = (flags & (BRANCH_EFFECT | ROOT_EFFECT)) !== 0;
			if (!(is_branch && (flags & CLEAN) !== 0 || (flags & INERT) !== 0 || this.#skipped_branches.has(effect)) && effect.fn !== null) {
				if (is_branch) effect.f ^= CLEAN;
				else if (pending_boundary !== null && (flags & (RENDER_EFFECT | 16777220)) !== 0) pending_boundary.b.defer_effect(effect);
				else if ((flags & EFFECT) !== 0) effects.push(effect);
				else if (is_dirty(effect)) {
					if ((flags & BLOCK_EFFECT) !== 0) this.#maybe_dirty_effects.add(effect);
					update_effect(effect);
				}
				var child = effect.first;
				if (child !== null) {
					effect = child;
					continue;
				}
			}
			var parent = effect.parent;
			effect = effect.next;
			while (effect === null && parent !== null) {
				if (parent === pending_boundary) pending_boundary = null;
				effect = parent.next;
				parent = parent.parent;
			}
		}
	}
	/**
	* @param {Effect[]} effects
	*/
	#defer_effects(effects) {
		for (var i = 0; i < effects.length; i += 1) defer_effect(effects[i], this.#dirty_effects, this.#maybe_dirty_effects);
	}
	/**
	* Associate a change to a given source with the current
	* batch, noting its previous and current values
	* @param {Source} source
	* @param {any} value
	*/
	capture(source2, value) {
		if (value !== UNINITIALIZED && !this.previous.has(source2)) this.previous.set(source2, value);
		if ((source2.f & ERROR_VALUE) === 0) {
			this.current.set(source2, source2.v);
			batch_values?.set(source2, source2.v);
		}
	}
	activate() {
		current_batch = this;
		this.apply();
	}
	deactivate() {
		if (current_batch !== this) return;
		current_batch = null;
		batch_values = null;
	}
	flush() {
		this.activate();
		if (queued_root_effects.length > 0) {
			flush_effects();
			if (current_batch !== null && current_batch !== this) return;
		} else if (this.#pending === 0) this.process([]);
		this.deactivate();
	}
	discard() {
		for (const fn of this.#discard_callbacks) fn(this);
		this.#discard_callbacks.clear();
	}
	#commit() {
		if (batches.size > 1) {
			this.previous.clear();
			var previous_batch_values = batch_values;
			var is_earlier = true;
			for (const batch of batches) {
				if (batch === this) {
					is_earlier = false;
					continue;
				}
				const sources = [];
				for (const [source2, value] of this.current) {
					if (batch.current.has(source2)) if (is_earlier && value !== batch.current.get(source2)) batch.current.set(source2, value);
					else continue;
					sources.push(source2);
				}
				if (sources.length === 0) continue;
				const others = [...batch.current.keys()].filter((s) => !this.current.has(s));
				if (others.length > 0) {
					var prev_queued_root_effects = queued_root_effects;
					queued_root_effects = [];
					const marked = /* @__PURE__ */ new Set();
					const checked = /* @__PURE__ */ new Map();
					for (const source2 of sources) mark_effects(source2, others, marked, checked);
					if (queued_root_effects.length > 0) {
						current_batch = batch;
						batch.apply();
						for (const root of queued_root_effects) batch.#traverse_effect_tree(root, [], []);
						batch.deactivate();
					}
					queued_root_effects = prev_queued_root_effects;
				}
			}
			current_batch = null;
			batch_values = previous_batch_values;
		}
		this.committed = true;
		batches.delete(this);
	}
	/**
	*
	* @param {boolean} blocking
	*/
	increment(blocking) {
		this.#pending += 1;
		if (blocking) this.#blocking_pending += 1;
	}
	/**
	*
	* @param {boolean} blocking
	*/
	decrement(blocking) {
		this.#pending -= 1;
		if (blocking) this.#blocking_pending -= 1;
		if (this.#decrement_queued) return;
		this.#decrement_queued = true;
		queue_micro_task(() => {
			this.#decrement_queued = false;
			if (!this.is_deferred()) this.revive();
			else if (queued_root_effects.length > 0) this.flush();
		});
	}
	revive() {
		for (const e of this.#dirty_effects) {
			this.#maybe_dirty_effects.delete(e);
			set_signal_status(e, DIRTY);
			schedule_effect(e);
		}
		for (const e of this.#maybe_dirty_effects) {
			set_signal_status(e, MAYBE_DIRTY);
			schedule_effect(e);
		}
		this.flush();
	}
	/** @param {() => void} fn */
	oncommit(fn) {
		this.#commit_callbacks.add(fn);
	}
	/** @param {(batch: Batch) => void} fn */
	ondiscard(fn) {
		this.#discard_callbacks.add(fn);
	}
	settled() {
		return (this.#deferred ??= deferred()).promise;
	}
	static ensure() {
		if (current_batch === null) {
			const batch = current_batch = new Batch();
			batches.add(current_batch);
			if (!is_flushing_sync) queue_micro_task(() => {
				if (current_batch !== batch) return;
				batch.flush();
			});
		}
		return current_batch;
	}
	apply() {}
};
function flushSync(fn) {
	var was_flushing_sync = is_flushing_sync;
	is_flushing_sync = true;
	try {
		var result;
		if (fn);
		while (true) {
			flush_tasks();
			if (queued_root_effects.length === 0) {
				current_batch?.flush();
				if (queued_root_effects.length === 0) {
					last_scheduled_effect = null;
					return result;
				}
			}
			flush_effects();
		}
	} finally {
		is_flushing_sync = was_flushing_sync;
	}
}
function flush_effects() {
	is_flushing = true;
	try {
		var flush_count = 0;
		while (queued_root_effects.length > 0) {
			var batch = Batch.ensure();
			if (flush_count++ > 1e3) {
				if (DEV);
				infinite_loop_guard();
			}
			batch.process(queued_root_effects);
			old_values.clear();
			if (DEV);
		}
	} finally {
		queued_root_effects = [];
		is_flushing = false;
		last_scheduled_effect = null;
	}
}
function infinite_loop_guard() {
	try {
		effect_update_depth_exceeded();
	} catch (error) {
		invoke_error_boundary(error, last_scheduled_effect);
	}
}
let eager_block_effects = null;
function flush_queued_effects(effects) {
	var length = effects.length;
	if (length === 0) return;
	var i = 0;
	while (i < length) {
		var effect = effects[i++];
		if ((effect.f & (DESTROYED | INERT)) === 0 && is_dirty(effect)) {
			eager_block_effects = /* @__PURE__ */ new Set();
			update_effect(effect);
			if (effect.deps === null && effect.first === null && effect.nodes === null) if (effect.teardown === null && effect.ac === null) unlink_effect(effect);
			else effect.fn = null;
			if (eager_block_effects?.size > 0) {
				old_values.clear();
				for (const e of eager_block_effects) {
					if ((e.f & (DESTROYED | INERT)) !== 0) continue;
					const ordered_effects = [e];
					let ancestor = e.parent;
					while (ancestor !== null) {
						if (eager_block_effects.has(ancestor)) {
							eager_block_effects.delete(ancestor);
							ordered_effects.push(ancestor);
						}
						ancestor = ancestor.parent;
					}
					for (let j = ordered_effects.length - 1; j >= 0; j--) {
						const e2 = ordered_effects[j];
						if ((e2.f & (DESTROYED | INERT)) !== 0) continue;
						update_effect(e2);
					}
				}
				eager_block_effects.clear();
			}
		}
	}
	eager_block_effects = null;
}
function mark_effects(value, sources, marked, checked) {
	if (marked.has(value)) return;
	marked.add(value);
	if (value.reactions !== null) for (const reaction of value.reactions) {
		const flags = reaction.f;
		if ((flags & DERIVED) !== 0) mark_effects(
			/** @type {Derived} */
			reaction,
			sources,
			marked,
			checked
		);
		else if ((flags & (ASYNC | BLOCK_EFFECT)) !== 0 && (flags & DIRTY) === 0 && depends_on(reaction, sources, checked)) {
			set_signal_status(reaction, DIRTY);
			schedule_effect(
				/** @type {Effect} */
				reaction
			);
		}
	}
}
function depends_on(reaction, sources, checked) {
	const depends = checked.get(reaction);
	if (depends !== void 0) return depends;
	if (reaction.deps !== null) for (const dep of reaction.deps) {
		if (includes.call(sources, dep)) return true;
		if ((dep.f & DERIVED) !== 0 && depends_on(
			/** @type {Derived} */
			dep,
			sources,
			checked
		)) {
			checked.set(
				/** @type {Derived} */
				dep,
				true
			);
			return true;
		}
	}
	checked.set(reaction, false);
	return false;
}
function schedule_effect(signal) {
	var effect = last_scheduled_effect = signal;
	while (effect.parent !== null) {
		effect = effect.parent;
		var flags = effect.f;
		if (is_flushing && effect === active_effect && (flags & BLOCK_EFFECT) !== 0 && (flags & HEAD_EFFECT) === 0) return;
		if ((flags & (ROOT_EFFECT | BRANCH_EFFECT)) !== 0) {
			if ((flags & CLEAN) === 0) return;
			effect.f ^= CLEAN;
		}
	}
	queued_root_effects.push(effect);
}
function reset_branch(effect, tracked) {
	if ((effect.f & BRANCH_EFFECT) !== 0 && (effect.f & CLEAN) !== 0) return;
	if ((effect.f & DIRTY) !== 0) tracked.d.push(effect);
	else if ((effect.f & MAYBE_DIRTY) !== 0) tracked.m.push(effect);
	set_signal_status(effect, CLEAN);
	var e = effect.first;
	while (e !== null) {
		reset_branch(e, tracked);
		e = e.next;
	}
}
function destroy_derived_effects(derived2) {
	var effects = derived2.effects;
	if (effects !== null) {
		derived2.effects = null;
		for (var i = 0; i < effects.length; i += 1) destroy_effect(
			/** @type {Effect} */
			effects[i]
		);
	}
}
function get_derived_parent_effect(derived2) {
	var parent = derived2.parent;
	while (parent !== null) {
		if ((parent.f & DERIVED) === 0) return (parent.f & DESTROYED) === 0 ? parent : null;
		parent = parent.parent;
	}
	return null;
}
function execute_derived(derived2) {
	var value;
	var prev_active_effect = active_effect;
	set_active_effect(get_derived_parent_effect(derived2));
	try {
		derived2.f &= ~WAS_MARKED;
		destroy_derived_effects(derived2);
		value = update_reaction(derived2);
	} finally {
		set_active_effect(prev_active_effect);
	}
	return value;
}
function update_derived(derived2) {
	var value = execute_derived(derived2);
	if (!derived2.equals(value)) {
		derived2.wv = increment_write_version();
		if (!current_batch?.is_fork || derived2.deps === null) {
			derived2.v = value;
			if (derived2.deps === null) {
				set_signal_status(derived2, CLEAN);
				return;
			}
		}
	}
	if (is_destroying_effect) return;
	if (batch_values !== null) {
		if (effect_tracking() || current_batch?.is_fork) batch_values.set(derived2, value);
	} else update_derived_status(derived2);
}
let eager_effects = /* @__PURE__ */ new Set();
const old_values = /* @__PURE__ */ new Map();
let eager_effects_deferred = false;
function source(v, stack) {
	return {
		f: 0,
		v,
		reactions: null,
		equals,
		rv: 0,
		wv: 0
	};
}
/* @__NO_SIDE_EFFECTS__ */
function state(v, stack) {
	const s = source(v);
	push_reaction_value(s);
	return s;
}
/* @__NO_SIDE_EFFECTS__ */
function mutable_source(initial_value, immutable = false, trackable = true) {
	const s = source(initial_value);
	if (!immutable) s.equals = safe_equals;
	return s;
}
function set(source2, value, should_proxy = false) {
	if (active_reaction !== null && (!untracking || (active_reaction.f & EAGER_EFFECT) !== 0) && is_runes() && (active_reaction.f & 4325394) !== 0 && (current_sources === null || !includes.call(current_sources, source2))) state_unsafe_mutation();
	return internal_set(source2, should_proxy ? proxy(value) : value);
}
function internal_set(source2, value) {
	if (!source2.equals(value)) {
		var old_value = source2.v;
		if (is_destroying_effect) old_values.set(source2, value);
		else old_values.set(source2, old_value);
		source2.v = value;
		var batch = Batch.ensure();
		batch.capture(source2, old_value);
		if ((source2.f & DERIVED) !== 0) {
			const derived2 = source2;
			if ((source2.f & DIRTY) !== 0) execute_derived(derived2);
			update_derived_status(derived2);
		}
		source2.wv = increment_write_version();
		mark_reactions(source2, DIRTY);
		if (active_effect !== null && (active_effect.f & CLEAN) !== 0 && (active_effect.f & (BRANCH_EFFECT | ROOT_EFFECT)) === 0) if (untracked_writes === null) set_untracked_writes([source2]);
		else untracked_writes.push(source2);
		if (!batch.is_fork && eager_effects.size > 0 && !eager_effects_deferred) flush_eager_effects();
	}
	return value;
}
function flush_eager_effects() {
	eager_effects_deferred = false;
	for (const effect of eager_effects) {
		if ((effect.f & CLEAN) !== 0) set_signal_status(effect, MAYBE_DIRTY);
		if (is_dirty(effect)) update_effect(effect);
	}
	eager_effects.clear();
}
function increment(source2) {
	set(source2, source2.v + 1);
}
function mark_reactions(signal, status) {
	var reactions = signal.reactions;
	if (reactions === null) return;
	var length = reactions.length;
	for (var i = 0; i < length; i++) {
		var reaction = reactions[i];
		var flags = reaction.f;
		var not_dirty = (flags & DIRTY) === 0;
		if (not_dirty) set_signal_status(reaction, status);
		if ((flags & DERIVED) !== 0) {
			var derived2 = reaction;
			batch_values?.delete(derived2);
			if ((flags & WAS_MARKED) === 0) {
				if (flags & CONNECTED) reaction.f |= WAS_MARKED;
				mark_reactions(derived2, MAYBE_DIRTY);
			}
		} else if (not_dirty) {
			if ((flags & BLOCK_EFFECT) !== 0 && eager_block_effects !== null) eager_block_effects.add(
				/** @type {Effect} */
				reaction
			);
			schedule_effect(
				/** @type {Effect} */
				reaction
			);
		}
	}
}
function proxy(value) {
	if (typeof value !== "object" || value === null || STATE_SYMBOL in value) return value;
	const prototype = get_prototype_of(value);
	if (prototype !== object_prototype && prototype !== array_prototype) return value;
	var sources = /* @__PURE__ */ new Map();
	var is_proxied_array = is_array(value);
	var version = /* @__PURE__ */ state(0);
	var parent_version = update_version;
	var with_parent = (fn) => {
		if (update_version === parent_version) return fn();
		var reaction = active_reaction;
		var version2 = update_version;
		set_active_reaction(null);
		set_update_version(parent_version);
		var result = fn();
		set_active_reaction(reaction);
		set_update_version(version2);
		return result;
	};
	if (is_proxied_array) sources.set("length", /* @__PURE__ */ state(
		/** @type {any[]} */
		value.length
	));
	return new Proxy(
		/** @type {any} */
		value,
		{
			defineProperty(_, prop, descriptor) {
				if (!("value" in descriptor) || descriptor.configurable === false || descriptor.enumerable === false || descriptor.writable === false) state_descriptors_fixed();
				var s = sources.get(prop);
				if (s === void 0) s = with_parent(() => {
					var s2 = /* @__PURE__ */ state(descriptor.value);
					sources.set(prop, s2);
					return s2;
				});
				else set(s, descriptor.value, true);
				return true;
			},
			deleteProperty(target, prop) {
				var s = sources.get(prop);
				if (s === void 0) {
					if (prop in target) {
						const s2 = with_parent(() => /* @__PURE__ */ state(UNINITIALIZED));
						sources.set(prop, s2);
						increment(version);
					}
				} else {
					set(s, UNINITIALIZED);
					increment(version);
				}
				return true;
			},
			get(target, prop, receiver) {
				if (prop === STATE_SYMBOL) return value;
				var s = sources.get(prop);
				var exists = prop in target;
				if (s === void 0 && (!exists || get_descriptor(target, prop)?.writable)) {
					s = with_parent(() => {
						return /* @__PURE__ */ state(proxy(exists ? target[prop] : UNINITIALIZED));
					});
					sources.set(prop, s);
				}
				if (s !== void 0) {
					var v = get(s);
					return v === UNINITIALIZED ? void 0 : v;
				}
				return Reflect.get(target, prop, receiver);
			},
			getOwnPropertyDescriptor(target, prop) {
				var descriptor = Reflect.getOwnPropertyDescriptor(target, prop);
				if (descriptor && "value" in descriptor) {
					var s = sources.get(prop);
					if (s) descriptor.value = get(s);
				} else if (descriptor === void 0) {
					var source2 = sources.get(prop);
					var value2 = source2?.v;
					if (source2 !== void 0 && value2 !== UNINITIALIZED) return {
						enumerable: true,
						configurable: true,
						value: value2,
						writable: true
					};
				}
				return descriptor;
			},
			has(target, prop) {
				if (prop === STATE_SYMBOL) return true;
				var s = sources.get(prop);
				var has = s !== void 0 && s.v !== UNINITIALIZED || Reflect.has(target, prop);
				if (s !== void 0 || active_effect !== null && (!has || get_descriptor(target, prop)?.writable)) {
					if (s === void 0) {
						s = with_parent(() => {
							return /* @__PURE__ */ state(has ? proxy(target[prop]) : UNINITIALIZED);
						});
						sources.set(prop, s);
					}
					if (get(s) === UNINITIALIZED) return false;
				}
				return has;
			},
			set(target, prop, value2, receiver) {
				var s = sources.get(prop);
				var has = prop in target;
				if (is_proxied_array && prop === "length") for (var i = value2; i < s.v; i += 1) {
					var other_s = sources.get(i + "");
					if (other_s !== void 0) set(other_s, UNINITIALIZED);
					else if (i in target) {
						other_s = with_parent(() => /* @__PURE__ */ state(UNINITIALIZED));
						sources.set(i + "", other_s);
					}
				}
				if (s === void 0) {
					if (!has || get_descriptor(target, prop)?.writable) {
						s = with_parent(() => /* @__PURE__ */ state(void 0));
						set(s, proxy(value2));
						sources.set(prop, s);
					}
				} else {
					has = s.v !== UNINITIALIZED;
					var p = with_parent(() => proxy(value2));
					set(s, p);
				}
				var descriptor = Reflect.getOwnPropertyDescriptor(target, prop);
				if (descriptor?.set) descriptor.set.call(receiver, value2);
				if (!has) {
					if (is_proxied_array && typeof prop === "string") {
						var ls = sources.get("length");
						var n = Number(prop);
						if (Number.isInteger(n) && n >= ls.v) set(ls, n + 1);
					}
					increment(version);
				}
				return true;
			},
			ownKeys(target) {
				get(version);
				var own_keys = Reflect.ownKeys(target).filter((key2) => {
					var source3 = sources.get(key2);
					return source3 === void 0 || source3.v !== UNINITIALIZED;
				});
				for (var [key, source2] of sources) if (source2.v !== UNINITIALIZED && !(key in target)) own_keys.push(key);
				return own_keys;
			},
			setPrototypeOf() {
				state_prototype_fixed();
			}
		}
	);
}
var $window;
var first_child_getter;
var next_sibling_getter;
function init_operations() {
	if ($window !== void 0) return;
	$window = window;
	var element_prototype = Element.prototype;
	var node_prototype = Node.prototype;
	var text_prototype = Text.prototype;
	first_child_getter = get_descriptor(node_prototype, "firstChild").get;
	next_sibling_getter = get_descriptor(node_prototype, "nextSibling").get;
	if (is_extensible(element_prototype)) {
		element_prototype.__click = void 0;
		element_prototype.__className = void 0;
		element_prototype.__attributes = null;
		element_prototype.__style = void 0;
		element_prototype.__e = void 0;
	}
	if (is_extensible(text_prototype)) text_prototype.__t = void 0;
}
function create_text(value = "") {
	return document.createTextNode(value);
}
/* @__NO_SIDE_EFFECTS__ */
function get_first_child(node) {
	return first_child_getter.call(node);
}
/* @__NO_SIDE_EFFECTS__ */
function get_next_sibling(node) {
	return next_sibling_getter.call(node);
}
function clear_text_content(node) {
	node.textContent = "";
}
function without_reactive_context(fn) {
	var previous_reaction = active_reaction;
	var previous_effect = active_effect;
	set_active_reaction(null);
	set_active_effect(null);
	try {
		return fn();
	} finally {
		set_active_reaction(previous_reaction);
		set_active_effect(previous_effect);
	}
}
function push_effect(effect, parent_effect) {
	var parent_last = parent_effect.last;
	if (parent_last === null) parent_effect.last = parent_effect.first = effect;
	else {
		parent_last.next = effect;
		effect.prev = parent_last;
		parent_effect.last = effect;
	}
}
function create_effect(type, fn, sync) {
	var parent = active_effect;
	if (parent !== null && (parent.f & INERT) !== 0) type |= INERT;
	var effect = {
		ctx: component_context,
		deps: null,
		nodes: null,
		f: type | 2560,
		first: null,
		fn,
		last: null,
		next: null,
		parent,
		b: parent && parent.b,
		prev: null,
		teardown: null,
		wv: 0,
		ac: null
	};
	if (sync) try {
		update_effect(effect);
		effect.f |= EFFECT_RAN;
	} catch (e2) {
		destroy_effect(effect);
		throw e2;
	}
	else if (fn !== null) schedule_effect(effect);
	var e = effect;
	if (sync && e.deps === null && e.teardown === null && e.nodes === null && e.first === e.last && (e.f & EFFECT_PRESERVED) === 0) {
		e = e.first;
		if ((type & BLOCK_EFFECT) !== 0 && (type & EFFECT_TRANSPARENT) !== 0 && e !== null) e.f |= EFFECT_TRANSPARENT;
	}
	if (e !== null) {
		e.parent = parent;
		if (parent !== null) push_effect(e, parent);
		if (active_reaction !== null && (active_reaction.f & DERIVED) !== 0 && (type & ROOT_EFFECT) === 0) {
			var derived2 = active_reaction;
			(derived2.effects ??= []).push(e);
		}
	}
	return effect;
}
function effect_tracking() {
	return active_reaction !== null && !untracking;
}
function create_user_effect(fn) {
	return create_effect(EFFECT | USER_EFFECT, fn, false);
}
function component_root(fn) {
	Batch.ensure();
	const effect = create_effect(ROOT_EFFECT | EFFECT_PRESERVED, fn, true);
	return (options = {}) => {
		return new Promise((fulfil) => {
			if (options.outro) pause_effect(effect, () => {
				destroy_effect(effect);
				fulfil(void 0);
			});
			else {
				destroy_effect(effect);
				fulfil(void 0);
			}
		});
	};
}
function render_effect(fn, flags = 0) {
	return create_effect(RENDER_EFFECT | flags, fn, true);
}
function block(fn, flags = 0) {
	return create_effect(BLOCK_EFFECT | flags, fn, true);
}
function branch(fn) {
	return create_effect(BRANCH_EFFECT | EFFECT_PRESERVED, fn, true);
}
function execute_effect_teardown(effect) {
	var teardown = effect.teardown;
	if (teardown !== null) {
		const previously_destroying_effect = is_destroying_effect;
		const previous_reaction = active_reaction;
		set_is_destroying_effect(true);
		set_active_reaction(null);
		try {
			teardown.call(null);
		} finally {
			set_is_destroying_effect(previously_destroying_effect);
			set_active_reaction(previous_reaction);
		}
	}
}
function destroy_effect_children(signal, remove_dom = false) {
	var effect = signal.first;
	signal.first = signal.last = null;
	while (effect !== null) {
		const controller2 = effect.ac;
		if (controller2 !== null) without_reactive_context(() => {
			controller2.abort(STALE_REACTION);
		});
		var next = effect.next;
		if ((effect.f & ROOT_EFFECT) !== 0) effect.parent = null;
		else destroy_effect(effect, remove_dom);
		effect = next;
	}
}
function destroy_block_effect_children(signal) {
	var effect = signal.first;
	while (effect !== null) {
		var next = effect.next;
		if ((effect.f & BRANCH_EFFECT) === 0) destroy_effect(effect);
		effect = next;
	}
}
function destroy_effect(effect, remove_dom = true) {
	var removed = false;
	if ((remove_dom || (effect.f & HEAD_EFFECT) !== 0) && effect.nodes !== null && effect.nodes.end !== null) {
		remove_effect_dom(
			effect.nodes.start,
			/** @type {TemplateNode} */
			effect.nodes.end
		);
		removed = true;
	}
	destroy_effect_children(effect, remove_dom && !removed);
	remove_reactions(effect, 0);
	set_signal_status(effect, DESTROYED);
	var transitions = effect.nodes && effect.nodes.t;
	if (transitions !== null) for (const transition of transitions) transition.stop();
	execute_effect_teardown(effect);
	var parent = effect.parent;
	if (parent !== null && parent.first !== null) unlink_effect(effect);
	effect.next = effect.prev = effect.teardown = effect.ctx = effect.deps = effect.fn = effect.nodes = effect.ac = null;
}
function remove_effect_dom(node, end) {
	while (node !== null) {
		var next = node === end ? null : /* @__PURE__ */ get_next_sibling(node);
		node.remove();
		node = next;
	}
}
function unlink_effect(effect) {
	var parent = effect.parent;
	var prev = effect.prev;
	var next = effect.next;
	if (prev !== null) prev.next = next;
	if (next !== null) next.prev = prev;
	if (parent !== null) {
		if (parent.first === effect) parent.first = next;
		if (parent.last === effect) parent.last = prev;
	}
}
function pause_effect(effect, callback, destroy = true) {
	var transitions = [];
	pause_children(effect, transitions, true);
	var fn = () => {
		if (destroy) destroy_effect(effect);
		if (callback) callback();
	};
	var remaining = transitions.length;
	if (remaining > 0) {
		var check = () => --remaining || fn();
		for (var transition of transitions) transition.out(check);
	} else fn();
}
function pause_children(effect, transitions, local) {
	if ((effect.f & INERT) !== 0) return;
	effect.f ^= INERT;
	var t = effect.nodes && effect.nodes.t;
	if (t !== null) {
		for (const transition of t) if (transition.is_global || local) transitions.push(transition);
	}
	var child = effect.first;
	while (child !== null) {
		var sibling = child.next;
		var transparent = (child.f & EFFECT_TRANSPARENT) !== 0 || (child.f & BRANCH_EFFECT) !== 0 && (effect.f & BLOCK_EFFECT) !== 0;
		pause_children(child, transitions, transparent ? local : false);
		child = sibling;
	}
}
function move_effect(effect, fragment) {
	if (!effect.nodes) return;
	var node = effect.nodes.start;
	var end = effect.nodes.end;
	while (node !== null) {
		var next = node === end ? null : /* @__PURE__ */ get_next_sibling(node);
		fragment.append(node);
		node = next;
	}
}
let is_updating_effect = false;
let is_destroying_effect = false;
function set_is_destroying_effect(value) {
	is_destroying_effect = value;
}
let active_reaction = null;
let untracking = false;
function set_active_reaction(reaction) {
	active_reaction = reaction;
}
let active_effect = null;
function set_active_effect(effect) {
	active_effect = effect;
}
let current_sources = null;
function push_reaction_value(value) {
	if (active_reaction !== null && true) if (current_sources === null) current_sources = [value];
	else current_sources.push(value);
}
let new_deps = null;
let skipped_deps = 0;
let untracked_writes = null;
function set_untracked_writes(value) {
	untracked_writes = value;
}
let write_version = 1;
let read_version = 0;
let update_version = read_version;
function set_update_version(value) {
	update_version = value;
}
function increment_write_version() {
	return ++write_version;
}
function is_dirty(reaction) {
	var flags = reaction.f;
	if ((flags & DIRTY) !== 0) return true;
	if (flags & DERIVED) reaction.f &= ~WAS_MARKED;
	if ((flags & MAYBE_DIRTY) !== 0) {
		var dependencies = reaction.deps;
		var length = dependencies.length;
		for (var i = 0; i < length; i++) {
			var dependency = dependencies[i];
			if (is_dirty(
				/** @type {Derived} */
				dependency
			)) update_derived(
				/** @type {Derived} */
				dependency
			);
			if (dependency.wv > reaction.wv) return true;
		}
		if ((flags & CONNECTED) !== 0 && batch_values === null) set_signal_status(reaction, CLEAN);
	}
	return false;
}
function schedule_possible_effect_self_invalidation(signal, effect, root = true) {
	var reactions = signal.reactions;
	if (reactions === null) return;
	if (current_sources !== null && includes.call(current_sources, signal)) return;
	for (var i = 0; i < reactions.length; i++) {
		var reaction = reactions[i];
		if ((reaction.f & DERIVED) !== 0) schedule_possible_effect_self_invalidation(
			/** @type {Derived} */
			reaction,
			effect,
			false
		);
		else if (effect === reaction) {
			if (root) set_signal_status(reaction, DIRTY);
			else if ((reaction.f & CLEAN) !== 0) set_signal_status(reaction, MAYBE_DIRTY);
			schedule_effect(
				/** @type {Effect} */
				reaction
			);
		}
	}
}
function update_reaction(reaction) {
	var previous_deps = new_deps;
	var previous_skipped_deps = skipped_deps;
	var previous_untracked_writes = untracked_writes;
	var previous_reaction = active_reaction;
	var previous_sources = current_sources;
	var previous_component_context = component_context;
	var previous_untracking = untracking;
	var previous_update_version = update_version;
	var flags = reaction.f;
	new_deps = null;
	skipped_deps = 0;
	untracked_writes = null;
	active_reaction = (flags & (BRANCH_EFFECT | ROOT_EFFECT)) === 0 ? reaction : null;
	current_sources = null;
	set_component_context(reaction.ctx);
	untracking = false;
	update_version = ++read_version;
	if (reaction.ac !== null) {
		without_reactive_context(() => {
			reaction.ac.abort(STALE_REACTION);
		});
		reaction.ac = null;
	}
	try {
		reaction.f |= REACTION_IS_UPDATING;
		var fn = reaction.fn;
		var result = fn();
		var deps = reaction.deps;
		var is_fork = current_batch?.is_fork;
		if (new_deps !== null) {
			var i;
			if (!is_fork) remove_reactions(reaction, skipped_deps);
			if (deps !== null && skipped_deps > 0) {
				deps.length = skipped_deps + new_deps.length;
				for (i = 0; i < new_deps.length; i++) deps[skipped_deps + i] = new_deps[i];
			} else reaction.deps = deps = new_deps;
			if (effect_tracking() && (reaction.f & CONNECTED) !== 0) for (i = skipped_deps; i < deps.length; i++) (deps[i].reactions ??= []).push(reaction);
		} else if (!is_fork && deps !== null && skipped_deps < deps.length) {
			remove_reactions(reaction, skipped_deps);
			deps.length = skipped_deps;
		}
		if (is_runes() && untracked_writes !== null && !untracking && deps !== null && (reaction.f & (MAYBE_DIRTY | 2050)) === 0) for (i = 0; i < untracked_writes.length; i++) schedule_possible_effect_self_invalidation(
			untracked_writes[i],
			/** @type {Effect} */
			reaction
		);
		if (previous_reaction !== null && previous_reaction !== reaction) {
			read_version++;
			if (previous_reaction.deps !== null) for (let i2 = 0; i2 < previous_skipped_deps; i2 += 1) previous_reaction.deps[i2].rv = read_version;
			if (previous_deps !== null) for (const dep of previous_deps) dep.rv = read_version;
			if (untracked_writes !== null) if (previous_untracked_writes === null) previous_untracked_writes = untracked_writes;
			else previous_untracked_writes.push(...untracked_writes);
		}
		if ((reaction.f & ERROR_VALUE) !== 0) reaction.f ^= ERROR_VALUE;
		return result;
	} catch (error) {
		return handle_error(error);
	} finally {
		reaction.f ^= REACTION_IS_UPDATING;
		new_deps = previous_deps;
		skipped_deps = previous_skipped_deps;
		untracked_writes = previous_untracked_writes;
		active_reaction = previous_reaction;
		current_sources = previous_sources;
		set_component_context(previous_component_context);
		untracking = previous_untracking;
		update_version = previous_update_version;
	}
}
function remove_reaction(signal, dependency) {
	let reactions = dependency.reactions;
	if (reactions !== null) {
		var index = index_of.call(reactions, signal);
		if (index !== -1) {
			var new_length = reactions.length - 1;
			if (new_length === 0) reactions = dependency.reactions = null;
			else {
				reactions[index] = reactions[new_length];
				reactions.pop();
			}
		}
	}
	if (reactions === null && (dependency.f & DERIVED) !== 0 && (new_deps === null || !includes.call(new_deps, dependency))) {
		var derived2 = dependency;
		if ((derived2.f & CONNECTED) !== 0) {
			derived2.f ^= CONNECTED;
			derived2.f &= ~WAS_MARKED;
		}
		update_derived_status(derived2);
		destroy_derived_effects(derived2);
		remove_reactions(derived2, 0);
	}
}
function remove_reactions(signal, start_index) {
	var dependencies = signal.deps;
	if (dependencies === null) return;
	for (var i = start_index; i < dependencies.length; i++) remove_reaction(signal, dependencies[i]);
}
function update_effect(effect) {
	var flags = effect.f;
	if ((flags & DESTROYED) !== 0) return;
	set_signal_status(effect, CLEAN);
	var previous_effect = active_effect;
	var was_updating_effect = is_updating_effect;
	active_effect = effect;
	is_updating_effect = true;
	try {
		if ((flags & (BLOCK_EFFECT | MANAGED_EFFECT)) !== 0) destroy_block_effect_children(effect);
		else destroy_effect_children(effect);
		execute_effect_teardown(effect);
		var teardown = update_reaction(effect);
		effect.teardown = typeof teardown === "function" ? teardown : null;
		effect.wv = write_version;
	} finally {
		is_updating_effect = was_updating_effect;
		active_effect = previous_effect;
	}
}
function get(signal) {
	var is_derived = (signal.f & DERIVED) !== 0;
	if (active_reaction !== null && !untracking) {
		if (!(active_effect !== null && (active_effect.f & DESTROYED) !== 0) && (current_sources === null || !includes.call(current_sources, signal))) {
			var deps = active_reaction.deps;
			if ((active_reaction.f & REACTION_IS_UPDATING) !== 0) {
				if (signal.rv < read_version) {
					signal.rv = read_version;
					if (new_deps === null && deps !== null && deps[skipped_deps] === signal) skipped_deps++;
					else if (new_deps === null) new_deps = [signal];
					else new_deps.push(signal);
				}
			} else {
				(active_reaction.deps ??= []).push(signal);
				var reactions = signal.reactions;
				if (reactions === null) signal.reactions = [active_reaction];
				else if (!includes.call(reactions, active_reaction)) reactions.push(active_reaction);
			}
		}
	}
	if (is_destroying_effect && old_values.has(signal)) return old_values.get(signal);
	if (is_derived) {
		var derived2 = signal;
		if (is_destroying_effect) {
			var value = derived2.v;
			if ((derived2.f & CLEAN) === 0 && derived2.reactions !== null || depends_on_old_values(derived2)) value = execute_derived(derived2);
			old_values.set(derived2, value);
			return value;
		}
		var should_connect = (derived2.f & CONNECTED) === 0 && !untracking && active_reaction !== null && (is_updating_effect || (active_reaction.f & CONNECTED) !== 0);
		var is_new = derived2.deps === null;
		if (is_dirty(derived2)) {
			if (should_connect) derived2.f |= CONNECTED;
			update_derived(derived2);
		}
		if (should_connect && !is_new) reconnect(derived2);
	}
	if (batch_values?.has(signal)) return batch_values.get(signal);
	if ((signal.f & ERROR_VALUE) !== 0) throw signal.v;
	return signal.v;
}
function reconnect(derived2) {
	if (derived2.deps === null) return;
	derived2.f |= CONNECTED;
	for (const dep of derived2.deps) {
		(dep.reactions ??= []).push(derived2);
		if ((dep.f & DERIVED) !== 0 && (dep.f & CONNECTED) === 0) reconnect(
			/** @type {Derived} */
			dep
		);
	}
}
function depends_on_old_values(derived2) {
	if (derived2.v === UNINITIALIZED) return true;
	if (derived2.deps === null) return false;
	for (const dep of derived2.deps) {
		if (old_values.has(dep)) return true;
		if ((dep.f & DERIVED) !== 0 && depends_on_old_values(
			/** @type {Derived} */
			dep
		)) return true;
	}
	return false;
}
function untrack(fn) {
	var previous_untracking = untracking;
	try {
		untracking = true;
		return fn();
	} finally {
		untracking = previous_untracking;
	}
}
const VOID_ELEMENT_NAMES = [
	"area",
	"base",
	"br",
	"col",
	"command",
	"embed",
	"hr",
	"img",
	"input",
	"keygen",
	"link",
	"meta",
	"param",
	"source",
	"track",
	"wbr"
];
function is_void(name) {
	return VOID_ELEMENT_NAMES.includes(name) || name.toLowerCase() === "!doctype";
}
const DOM_BOOLEAN_ATTRIBUTES = [
	"allowfullscreen",
	"async",
	"autofocus",
	"autoplay",
	"checked",
	"controls",
	"default",
	"disabled",
	"formnovalidate",
	"indeterminate",
	"inert",
	"ismap",
	"loop",
	"multiple",
	"muted",
	"nomodule",
	"novalidate",
	"open",
	"playsinline",
	"readonly",
	"required",
	"reversed",
	"seamless",
	"selected",
	"webkitdirectory",
	"defer",
	"disablepictureinpicture",
	"disableremoteplayback"
];
function is_boolean_attribute(name) {
	return DOM_BOOLEAN_ATTRIBUTES.includes(name);
}
const PASSIVE_EVENTS = ["touchstart", "touchmove"];
function is_passive_event(name) {
	return PASSIVE_EVENTS.includes(name);
}
const RAW_TEXT_ELEMENTS = [
	"textarea",
	"script",
	"style",
	"title"
];
function is_raw_text_element(name) {
	return RAW_TEXT_ELEMENTS.includes(
		/** @type {typeof RAW_TEXT_ELEMENTS[number]} */
		name
	);
}
function subscribe_to_store(store, run, invalidate) {
	if (store == null) {
		run(void 0);
		return noop;
	}
	const unsub = untrack(() => store.subscribe(run, invalidate));
	return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
const BLOCK_OPEN = `<!--${HYDRATION_START}-->`;
const BLOCK_CLOSE = `<!--${HYDRATION_END}-->`;
const EMPTY_COMMENT = `<!---->`;
let controller = null;
function abort() {
	controller?.abort(STALE_REACTION);
	controller = null;
}
function await_invalid() {
	const error = /* @__PURE__ */ new Error(`await_invalid
Encountered asynchronous work while rendering synchronously.
https://svelte.dev/e/await_invalid`);
	error.name = "Svelte error";
	throw error;
}
function invalid_csp() {
	const error = /* @__PURE__ */ new Error(`invalid_csp
\`csp.nonce\` was set while \`csp.hash\` was \`true\`. These options cannot be used simultaneously.
https://svelte.dev/e/invalid_csp`);
	error.name = "Svelte error";
	throw error;
}
function server_context_required() {
	const error = /* @__PURE__ */ new Error(`server_context_required
Could not resolve \`render\` context.
https://svelte.dev/e/server_context_required`);
	error.name = "Svelte error";
	throw error;
}
function unresolved_hydratable(key, stack) {
	console.warn(`https://svelte.dev/e/unresolved_hydratable`);
}
function get_render_context() {
	const store = als?.getStore();
	server_context_required();
	return store;
}
let als = null;
let text_encoder;
let crypto;
async function sha256(data) {
	text_encoder ??= new TextEncoder();
	crypto ??= globalThis.crypto?.subtle?.digest ? globalThis.crypto : (await import(
		/* @vite-ignore */
		"node:crypto"
)).webcrypto;
	return base64_encode(await crypto.subtle.digest("SHA-256", text_encoder.encode(data)));
}
function base64_encode(bytes) {
	if (globalThis.Buffer) return globalThis.Buffer.from(bytes).toString("base64");
	let binary = "";
	for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
	return btoa(binary);
}
var Renderer = class Renderer {
	/**
	* The contents of the renderer.
	* @type {RendererItem[]}
	*/
	#out = [];
	/**
	* Any `onDestroy` callbacks registered during execution of this renderer.
	* @type {(() => void)[] | undefined}
	*/
	#on_destroy = void 0;
	/**
	* Whether this renderer is a component body.
	* @type {boolean}
	*/
	#is_component_body = false;
	/**
	* The type of string content that this renderer is accumulating.
	* @type {RendererType}
	*/
	type;
	/** @type {Renderer | undefined} */
	#parent;
	/**
	* Asynchronous work associated with this renderer
	* @type {Promise<void> | undefined}
	*/
	promise = void 0;
	/**
	* State which is associated with the content tree as a whole.
	* It will be re-exposed, uncopied, on all children.
	* @type {SSRState}
	* @readonly
	*/
	global;
	/**
	* State that is local to the branch it is declared in.
	* It will be shallow-copied to all children.
	*
	* @type {{ select_value: string | undefined }}
	*/
	local;
	/**
	* @param {SSRState} global
	* @param {Renderer | undefined} [parent]
	*/
	constructor(global, parent) {
		this.#parent = parent;
		this.global = global;
		this.local = parent ? { ...parent.local } : { select_value: void 0 };
		this.type = parent ? parent.type : "body";
	}
	/**
	* @param {(renderer: Renderer) => void} fn
	*/
	head(fn) {
		const head2 = new Renderer(this.global, this);
		head2.type = "head";
		this.#out.push(head2);
		head2.child(fn);
	}
	/**
	* @param {Array<Promise<void>>} blockers
	* @param {(renderer: Renderer) => void} fn
	*/
	async_block(blockers, fn) {
		this.#out.push(BLOCK_OPEN);
		this.async(blockers, fn);
		this.#out.push(BLOCK_CLOSE);
	}
	/**
	* @param {Array<Promise<void>>} blockers
	* @param {(renderer: Renderer) => void} fn
	*/
	async(blockers, fn) {
		let callback = fn;
		if (blockers.length > 0) {
			const context = ssr_context;
			callback = (renderer) => {
				return Promise.all(blockers).then(() => {
					const previous_context = ssr_context;
					try {
						set_ssr_context(context);
						return fn(renderer);
					} finally {
						set_ssr_context(previous_context);
					}
				});
			};
		}
		this.child(callback);
	}
	/**
	* @param {Array<() => void>} thunks
	*/
	run(thunks) {
		const context = ssr_context;
		let promise = Promise.resolve(thunks[0]());
		const promises = [promise];
		for (const fn of thunks.slice(1)) {
			promise = promise.then(() => {
				const previous_context = ssr_context;
				set_ssr_context(context);
				try {
					return fn();
				} finally {
					set_ssr_context(previous_context);
				}
			});
			promises.push(promise);
		}
		promise.catch(noop);
		this.promise = promise;
		return promises;
	}
	/**
	* @param {(renderer: Renderer) => MaybePromise<void>} fn
	*/
	child_block(fn) {
		this.#out.push(BLOCK_OPEN);
		this.child(fn);
		this.#out.push(BLOCK_CLOSE);
	}
	/**
	* Create a child renderer. The child renderer inherits the state from the parent,
	* but has its own content.
	* @param {(renderer: Renderer) => MaybePromise<void>} fn
	*/
	child(fn) {
		const child = new Renderer(this.global, this);
		this.#out.push(child);
		const parent = ssr_context;
		set_ssr_context({
			...ssr_context,
			p: parent,
			c: null,
			r: child
		});
		const result = fn(child);
		set_ssr_context(parent);
		if (result instanceof Promise) {
			if (child.global.mode === "sync") await_invalid();
			result.catch(() => {});
			child.promise = result;
		}
		return child;
	}
	/**
	* Create a component renderer. The component renderer inherits the state from the parent,
	* but has its own content. It is treated as an ordering boundary for ondestroy callbacks.
	* @param {(renderer: Renderer) => MaybePromise<void>} fn
	* @param {Function} [component_fn]
	* @returns {void}
	*/
	component(fn, component_fn) {
		push$1();
		const child = this.child(fn);
		child.#is_component_body = true;
		pop$1();
	}
	/**
	* @param {Record<string, any>} attrs
	* @param {(renderer: Renderer) => void} fn
	* @param {string | undefined} [css_hash]
	* @param {Record<string, boolean> | undefined} [classes]
	* @param {Record<string, string> | undefined} [styles]
	* @param {number | undefined} [flags]
	* @param {boolean | undefined} [is_rich]
	* @returns {void}
	*/
	select(attrs, fn, css_hash, classes, styles, flags, is_rich) {
		const { value, ...select_attrs } = attrs;
		this.push(`<select${attributes(select_attrs, css_hash, classes, styles, flags)}>`);
		this.child((renderer) => {
			renderer.local.select_value = value;
			fn(renderer);
		});
		this.push(`${is_rich ? "<!>" : ""}</select>`);
	}
	/**
	* @param {Record<string, any>} attrs
	* @param {string | number | boolean | ((renderer: Renderer) => void)} body
	* @param {string | undefined} [css_hash]
	* @param {Record<string, boolean> | undefined} [classes]
	* @param {Record<string, string> | undefined} [styles]
	* @param {number | undefined} [flags]
	* @param {boolean | undefined} [is_rich]
	*/
	option(attrs, body, css_hash, classes, styles, flags, is_rich) {
		this.#out.push(`<option${attributes(attrs, css_hash, classes, styles, flags)}`);
		const close = (renderer, value, { head: head2, body: body2 }) => {
			if ("value" in attrs) value = attrs.value;
			if (value === this.local.select_value) renderer.#out.push(" selected");
			renderer.#out.push(`>${body2}${is_rich ? "<!>" : ""}</option>`);
			if (head2) renderer.head((child) => child.push(head2));
		};
		if (typeof body === "function") this.child((renderer) => {
			const r = new Renderer(this.global, this);
			body(r);
			if (this.global.mode === "async") return r.#collect_content_async().then((content) => {
				close(renderer, content.body.replaceAll("<!---->", ""), content);
			});
			else {
				const content = r.#collect_content();
				close(renderer, content.body.replaceAll("<!---->", ""), content);
			}
		});
		else close(this, body, { body });
	}
	/**
	* @param {(renderer: Renderer) => void} fn
	*/
	title(fn) {
		const path = this.get_path();
		const close = (head2) => {
			this.global.set_title(head2, path);
		};
		this.child((renderer) => {
			const r = new Renderer(renderer.global, renderer);
			fn(r);
			if (renderer.global.mode === "async") return r.#collect_content_async().then((content) => {
				close(content.head);
			});
			else close(r.#collect_content().head);
		});
	}
	/**
	* @param {string | (() => Promise<string>)} content
	*/
	push(content) {
		if (typeof content === "function") this.child(async (renderer) => renderer.push(await content()));
		else this.#out.push(content);
	}
	/**
	* @param {() => void} fn
	*/
	on_destroy(fn) {
		(this.#on_destroy ??= []).push(fn);
	}
	/**
	* @returns {number[]}
	*/
	get_path() {
		return this.#parent ? [...this.#parent.get_path(), this.#parent.#out.indexOf(this)] : [];
	}
	/**
	* @deprecated this is needed for legacy component bindings
	*/
	copy() {
		const copy = new Renderer(this.global, this.#parent);
		copy.#out = this.#out.map((item) => item instanceof Renderer ? item.copy() : item);
		copy.promise = this.promise;
		return copy;
	}
	/**
	* @param {Renderer} other
	* @deprecated this is needed for legacy component bindings
	*/
	subsume(other) {
		if (this.global.mode !== other.global.mode) throw new Error("invariant: A renderer cannot switch modes. If you're seeing this, there's a compiler bug. File an issue!");
		this.local = other.local;
		this.#out = other.#out.map((item) => {
			if (item instanceof Renderer) item.subsume(item);
			return item;
		});
		this.promise = other.promise;
		this.type = other.type;
	}
	get length() {
		return this.#out.length;
	}
	/**
	* Only available on the server and when compiling with the `server` option.
	* Takes a component and returns an object with `body` and `head` properties on it, which you can use to populate the HTML when server-rendering your app.
	* @template {Record<string, any>} Props
	* @param {Component<Props>} component
	* @param {{ props?: Omit<Props, '$$slots' | '$$events'>; context?: Map<any, any>; idPrefix?: string; csp?: Csp }} [options]
	* @returns {RenderOutput}
	*/
	static render(component, options = {}) {
		let sync;
		const result = (
		/** @type {RenderOutput} */
		{});
		Object.defineProperties(result, {
			html: { get: () => {
				return (sync ??= Renderer.#render(component, options)).body;
			} },
			head: { get: () => {
				return (sync ??= Renderer.#render(component, options)).head;
			} },
			body: { get: () => {
				return (sync ??= Renderer.#render(component, options)).body;
			} },
			hashes: { value: { script: "" } },
			then: { value: ((onfulfilled, onrejected) => {
				{
					const result2 = sync ??= Renderer.#render(component, options);
					const user_result = onfulfilled({
						head: result2.head,
						body: result2.body,
						html: result2.body,
						hashes: { script: [] }
					});
					return Promise.resolve(user_result);
				}
			}) }
		});
		return result;
	}
	/**
	* Collect all of the `onDestroy` callbacks registered during rendering. In an async context, this is only safe to call
	* after awaiting `collect_async`.
	*
	* Child renderers are "porous" and don't affect execution order, but component body renderers
	* create ordering boundaries. Within a renderer, callbacks run in order until hitting a component boundary.
	* @returns {Iterable<() => void>}
	*/
	*#collect_on_destroy() {
		for (const component of this.#traverse_components()) yield* component.#collect_ondestroy();
	}
	/**
	* Performs a depth-first search of renderers, yielding the deepest components first, then additional components as we backtrack up the tree.
	* @returns {Iterable<Renderer>}
	*/
	*#traverse_components() {
		for (const child of this.#out) if (typeof child !== "string") yield* child.#traverse_components();
		if (this.#is_component_body) yield this;
	}
	/**
	* @returns {Iterable<() => void>}
	*/
	*#collect_ondestroy() {
		if (this.#on_destroy) for (const fn of this.#on_destroy) yield fn;
		for (const child of this.#out) if (child instanceof Renderer && !child.#is_component_body) yield* child.#collect_ondestroy();
	}
	/**
	* Render a component. Throws if any of the children are performing asynchronous work.
	*
	* @template {Record<string, any>} Props
	* @param {Component<Props>} component
	* @param {{ props?: Omit<Props, '$$slots' | '$$events'>; context?: Map<any, any>; idPrefix?: string }} options
	* @returns {AccumulatedContent}
	*/
	static #render(component, options) {
		var previous_context = ssr_context;
		try {
			const renderer = Renderer.#open_render("sync", component, options);
			const content = renderer.#collect_content();
			return Renderer.#close_render(content, renderer);
		} finally {
			abort();
			set_ssr_context(previous_context);
		}
	}
	/**
	* Render a component.
	*
	* @template {Record<string, any>} Props
	* @param {Component<Props>} component
	* @param {{ props?: Omit<Props, '$$slots' | '$$events'>; context?: Map<any, any>; idPrefix?: string; csp?: Csp }} options
	* @returns {Promise<AccumulatedContent & { hashes: { script: Sha256Source[] } }>}
	*/
	static async #render_async(component, options) {
		const previous_context = ssr_context;
		try {
			const renderer = Renderer.#open_render("async", component, options);
			const content = await renderer.#collect_content_async();
			const hydratables = await renderer.#collect_hydratables();
			if (hydratables !== null) content.head = hydratables + content.head;
			return Renderer.#close_render(content, renderer);
		} finally {
			set_ssr_context(previous_context);
			abort();
		}
	}
	/**
	* Collect all of the code from the `out` array and return it as a string, or a promise resolving to a string.
	* @param {AccumulatedContent} content
	* @returns {AccumulatedContent}
	*/
	#collect_content(content = {
		head: "",
		body: ""
	}) {
		for (const item of this.#out) if (typeof item === "string") content[this.type] += item;
		else if (item instanceof Renderer) item.#collect_content(content);
		return content;
	}
	/**
	* Collect all of the code from the `out` array and return it as a string.
	* @param {AccumulatedContent} content
	* @returns {Promise<AccumulatedContent>}
	*/
	async #collect_content_async(content = {
		head: "",
		body: ""
	}) {
		await this.promise;
		for (const item of this.#out) if (typeof item === "string") content[this.type] += item;
		else if (item instanceof Renderer) await item.#collect_content_async(content);
		return content;
	}
	async #collect_hydratables() {
		const ctx = get_render_context().hydratable;
		for (const [_, key] of ctx.unresolved_promises) unresolved_hydratable(key, ctx.lookup.get(key)?.stack ?? "<missing stack trace>");
		for (const comparison of ctx.comparisons) await comparison;
		return await this.#hydratable_block(ctx);
	}
	/**
	* @template {Record<string, any>} Props
	* @param {'sync' | 'async'} mode
	* @param {import('svelte').Component<Props>} component
	* @param {{ props?: Omit<Props, '$$slots' | '$$events'>; context?: Map<any, any>; idPrefix?: string; csp?: Csp }} options
	* @returns {Renderer}
	*/
	static #open_render(mode, component, options) {
		const renderer = new Renderer(new SSRState(mode, options.idPrefix ? options.idPrefix + "-" : "", options.csp));
		renderer.push(BLOCK_OPEN);
		push$1();
		if (options.context) ssr_context.c = options.context;
		ssr_context.r = renderer;
		component(renderer, options.props ?? {});
		pop$1();
		renderer.push(BLOCK_CLOSE);
		return renderer;
	}
	/**
	* @param {AccumulatedContent} content
	* @param {Renderer} renderer
	* @returns {AccumulatedContent & { hashes: { script: Sha256Source[] } }}
	*/
	static #close_render(content, renderer) {
		for (const cleanup of renderer.#collect_on_destroy()) cleanup();
		let head2 = content.head + renderer.global.get_title();
		let body = content.body;
		for (const { hash, code } of renderer.global.css) head2 += `<style id="${hash}">${code}</style>`;
		return {
			head: head2,
			body,
			hashes: { script: renderer.global.csp.script_hashes }
		};
	}
	/**
	* @param {HydratableContext} ctx
	*/
	async #hydratable_block(ctx) {
		if (ctx.lookup.size === 0) return null;
		let entries = [];
		let has_promises = false;
		for (const [k, v] of ctx.lookup) {
			if (v.promises) {
				has_promises = true;
				for (const p of v.promises) await p;
			}
			entries.push(`[${uneval(k)},${v.serialized}]`);
		}
		let prelude = `const h = (window.__svelte ??= {}).h ??= new Map();`;
		if (has_promises) prelude = `const r = (v) => Promise.resolve(v);
				${prelude}`;
		const body = `
			{
				${prelude}

				for (const [k, v] of [
					${entries.join(",\n					")}
				]) {
					h.set(k, v);
				}
			}
		`;
		let csp_attr = "";
		if (this.global.csp.nonce) csp_attr = ` nonce="${this.global.csp.nonce}"`;
		else if (this.global.csp.hash) {
			const hash = await sha256(body);
			this.global.csp.script_hashes.push(`sha256-${hash}`);
		}
		return `
		<script${csp_attr}>${body}<\/script>`;
	}
};
var SSRState = class {
	/** @readonly @type {Csp & { script_hashes: Sha256Source[] }} */
	csp;
	/** @readonly @type {'sync' | 'async'} */
	mode;
	/** @readonly @type {() => string} */
	uid;
	/** @readonly @type {Set<{ hash: string; code: string }>} */
	css = /* @__PURE__ */ new Set();
	/** @type {{ path: number[], value: string }} */
	#title = {
		path: [],
		value: ""
	};
	/**
	* @param {'sync' | 'async'} mode
	* @param {string} id_prefix
	* @param {Csp} csp
	*/
	constructor(mode, id_prefix = "", csp = { hash: false }) {
		this.mode = mode;
		this.csp = {
			...csp,
			script_hashes: []
		};
		let uid = 1;
		this.uid = () => `${id_prefix}s${uid++}`;
	}
	get_title() {
		return this.#title.value;
	}
	/**
	* Performs a depth-first (lexicographic) comparison using the path. Rejects sets
	* from earlier than or equal to the current value.
	* @param {string} value
	* @param {number[]} path
	*/
	set_title(value, path) {
		const current = this.#title.path;
		let i = 0;
		let l = Math.min(path.length, current.length);
		while (i < l && path[i] === current[i]) i += 1;
		if (path[i] === void 0) return;
		if (current[i] === void 0 || path[i] > current[i]) {
			this.#title.path = path;
			this.#title.value = value;
		}
	}
};
const INVALID_ATTR_NAME_CHAR_REGEX = /[\s'">/=\u{FDD0}-\u{FDEF}\u{FFFE}\u{FFFF}\u{1FFFE}\u{1FFFF}\u{2FFFE}\u{2FFFF}\u{3FFFE}\u{3FFFF}\u{4FFFE}\u{4FFFF}\u{5FFFE}\u{5FFFF}\u{6FFFE}\u{6FFFF}\u{7FFFE}\u{7FFFF}\u{8FFFE}\u{8FFFF}\u{9FFFE}\u{9FFFF}\u{AFFFE}\u{AFFFF}\u{BFFFE}\u{BFFFF}\u{CFFFE}\u{CFFFF}\u{DFFFE}\u{DFFFF}\u{EFFFE}\u{EFFFF}\u{FFFFE}\u{FFFFF}\u{10FFFE}\u{10FFFF}]/u;
function element(renderer, tag, attributes_fn = noop, children_fn = noop) {
	renderer.push("<!---->");
	if (tag) {
		renderer.push(`<${tag}`);
		attributes_fn();
		renderer.push(`>`);
		if (!is_void(tag)) {
			children_fn();
			if (!is_raw_text_element(tag)) renderer.push(EMPTY_COMMENT);
			renderer.push(`</${tag}>`);
		}
	}
	renderer.push("<!---->");
}
function render(component, options = {}) {
	if (options.csp?.hash && options.csp.nonce) invalid_csp();
	return Renderer.render(
		/** @type {Component<Props>} */
		component,
		options
	);
}
function head(hash, renderer, fn) {
	renderer.head((renderer2) => {
		renderer2.push(`<!--${hash}-->`);
		renderer2.child(fn);
		renderer2.push(EMPTY_COMMENT);
	});
}
function attributes(attrs, css_hash, classes, styles, flags = 0) {
	if (styles) attrs.style = to_style(attrs.style, styles);
	if (attrs.class) attrs.class = clsx(attrs.class);
	if (css_hash || classes) attrs.class = to_class(attrs.class, css_hash, classes);
	let attr_str = "";
	let name;
	const is_html = (flags & ELEMENT_IS_NAMESPACED) === 0;
	const lowercase = (flags & ELEMENT_PRESERVE_ATTRIBUTE_CASE) === 0;
	const is_input = (flags & ELEMENT_IS_INPUT) !== 0;
	for (name in attrs) {
		if (typeof attrs[name] === "function") continue;
		if (name[0] === "$" && name[1] === "$") continue;
		if (INVALID_ATTR_NAME_CHAR_REGEX.test(name)) continue;
		var value = attrs[name];
		if (lowercase) name = name.toLowerCase();
		if (is_input) {
			if (name === "defaultvalue" || name === "defaultchecked") {
				name = name === "defaultvalue" ? "value" : "checked";
				if (attrs[name]) continue;
			}
		}
		attr_str += attr(name, value, is_html && is_boolean_attribute(name));
	}
	return attr_str;
}
function spread_props(props) {
	const merged_props = {};
	let key;
	for (let i = 0; i < props.length; i++) {
		const obj = props[i];
		for (key in obj) {
			const desc = Object.getOwnPropertyDescriptor(obj, key);
			if (desc) Object.defineProperty(merged_props, key, desc);
			else merged_props[key] = obj[key];
		}
	}
	return merged_props;
}
function stringify(value) {
	return typeof value === "string" ? value : value == null ? "" : value + "";
}
function attr_class(value, hash, directives) {
	var result = to_class(value, hash, directives);
	return result ? ` class="${escape_html(result, true)}"` : "";
}
function attr_style(value, directives) {
	var result = to_style(value, directives);
	return result ? ` style="${escape_html(result, true)}"` : "";
}
function store_get(store_values, store_name, store) {
	if (store_name in store_values && store_values[store_name][0] === store) return store_values[store_name][2];
	store_values[store_name]?.[1]();
	store_values[store_name] = [
		store,
		null,
		void 0
	];
	const unsub = subscribe_to_store(
		store,
		/** @param {any} v */
		(v) => store_values[store_name][2] = v
	);
	store_values[store_name][1] = unsub;
	return store_values[store_name][2];
}
function unsubscribe_stores(store_values) {
	for (const store_name in store_values) store_values[store_name][1]();
}
function slot(renderer, $$props, name, slot_props, fallback_fn) {
	var slot_fn = $$props.$$slots?.[name];
	if (slot_fn === true) slot_fn = $$props["children"];
	if (slot_fn !== void 0) slot_fn(renderer, slot_props);
}
function rest_props(props, rest) {
	const rest_props2 = {};
	let key;
	for (key in props) if (!rest.includes(key)) rest_props2[key] = props[key];
	return rest_props2;
}
function sanitize_props(props) {
	const { children, $$slots, ...sanitized } = props;
	return sanitized;
}
function bind_props(props_parent, props_now) {
	for (const key in props_now) {
		const initial_value = props_parent[key];
		const value = props_now[key];
		if (initial_value === void 0 && value !== void 0 && Object.getOwnPropertyDescriptor(props_parent, key)?.set) props_parent[key] = value;
	}
}
function ensure_array_like(array_like_or_iterator) {
	if (array_like_or_iterator) return array_like_or_iterator.length !== void 0 ? array_like_or_iterator : Array.from(array_like_or_iterator);
	return [];
}
function once(get_value) {
	let value = UNINITIALIZED;
	return () => {
		if (value === UNINITIALIZED) value = get_value();
		return value;
	};
}
function derived(fn) {
	const get_value = once(fn);
	let updated_value;
	return function(new_value) {
		if (arguments.length === 0) return updated_value ?? get_value();
		updated_value = new_value;
		return updated_value;
	};
}

//#endregion
export { schedule_effect as $, ensure_array_like as A, internal_set as B, component_root as C, destroy_effect as D, derived as E, handle_error as F, pause_effect as G, is_passive_event as H, head as I, queue_micro_task as J, pop as K, hydration_failed as L, get as M, get_first_child as N, effect_tracking as O, get_next_sibling as P, sanitize_props as Q, increment as R, component_context as S, defer_effect as T, move_effect as U, invoke_error_boundary as V, mutable_source as W, render_effect as X, render as Y, rest_props as Z, attributes as _, get_type as _t, EFFECT_PRESERVED as a, slot as at, branch as b, stringify_key as bt, HYDRATION_ERROR as c, store_get as ct, LEGACY_PROPS as d, uneval as dt, set as et, MAYBE_DIRTY as f, unsubscribe_stores as ft, attr_style as g, enumerable_symbols as gt, attr_class as h, DevalueError as ht, DIRTY as i, set_signal_status as it, flushSync as j, element as k, HYDRATION_START as l, stringify as lt, active_reaction as m, DEV as mt, Batch as n, set_active_reaction as nt, EFFECT_TRANSPARENT as o, source as ot, active_effect as p, untrack as pt, push as q, COMMENT_NODE as r, set_component_context as rt, HYDRATION_END as s, spread_props as st, BOUNDARY_EFFECT as t, set_active_effect as tt, HYDRATION_START_ELSE as u, svelte_boundary_reset_onerror as ut, bind_props as v, is_plain_object as vt, create_text as w, clear_text_content as x, stringify_string as xt, block as y, is_primitive as yt, init_operations as z };
//# sourceMappingURL=chunks-CJh457eN.js.map