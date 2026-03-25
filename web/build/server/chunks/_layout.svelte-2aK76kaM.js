import { A as ensure_array_like, E as derived, I as head, Q as sanitize_props, _ as attributes, at as slot, g as attr_style, h as attr_class, lt as stringify, st as spread_props } from "./chunks-CJh457eN.js";
import "./exports-BAQMwGYm.js";
import { a as escape_html, h as run } from "./escaping-_LzeiXuq.js";
import { n as clsx, t as attr } from "./attributes-Dog1ICvy.js";
import { c as setContext, n as getContext, r as hasContext } from "./context-DNYDPF7e.js";
import "./index2-DDApFMp8.js";
import "./state.svelte-DH-R59PY.js";
import { t as page } from "./index3-C1R2c9j7.js";
import { t as Icon } from "./Icon-BJuLBbSM.js";
import { t as Zap } from "./zap-Dhd3B6cC.js";
import { t as File_text } from "./file-text-DyUvkZ9a.js";
import { t as Search } from "./search-DPIUivoZ.js";
import { n as Users, t as Bar_chart_3 } from "./users-BDr2TncJ.js";
import { t as Building_2 } from "./building-2-CSJhQvCu.js";
import { t as User } from "./user-CJxhiZIR.js";

//#region .svelte-kit/adapter-bun/entries/pages/_layout.svelte.js
function Log_out($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "log-out" },
		sanitize_props($$props),
		{
			iconNode: [
				["path", { "d": "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" }],
				["polyline", { "points": "16 17 21 12 16 7" }],
				["line", {
					"x1": "21",
					"x2": "9",
					"y1": "12",
					"y2": "12"
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
function Monitor($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "monitor" },
		sanitize_props($$props),
		{
			iconNode: [
				["rect", {
					"width": "20",
					"height": "14",
					"x": "2",
					"y": "3",
					"rx": "2"
				}],
				["line", {
					"x1": "8",
					"x2": "16",
					"y1": "21",
					"y2": "21"
				}],
				["line", {
					"x1": "12",
					"x2": "12",
					"y1": "17",
					"y2": "21"
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
function Moon($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "moon" },
		sanitize_props($$props),
		{
			iconNode: [["path", { "d": "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" }]],
			children: ($$renderer2) => {
				$$renderer2.push(`<!--[-->`);
				slot($$renderer2, $$props, "default", {});
				$$renderer2.push(`<!--]-->`);
			},
			$$slots: { default: true }
		}
	]));
}
function Settings($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "settings" },
		sanitize_props($$props),
		{
			iconNode: [["path", { "d": "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" }], ["circle", {
				"cx": "12",
				"cy": "12",
				"r": "3"
			}]],
			children: ($$renderer2) => {
				$$renderer2.push(`<!--[-->`);
				slot($$renderer2, $$props, "default", {});
				$$renderer2.push(`<!--]-->`);
			},
			$$slots: { default: true }
		}
	]));
}
function Sun($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "sun" },
		sanitize_props($$props),
		{
			iconNode: [
				["circle", {
					"cx": "12",
					"cy": "12",
					"r": "4"
				}],
				["path", { "d": "M12 2v2" }],
				["path", { "d": "M12 20v2" }],
				["path", { "d": "m4.93 4.93 1.41 1.41" }],
				["path", { "d": "m17.66 17.66 1.41 1.41" }],
				["path", { "d": "M2 12h2" }],
				["path", { "d": "M20 12h2" }],
				["path", { "d": "m6.34 17.66-1.41 1.41" }],
				["path", { "d": "m19.07 4.93-1.41 1.41" }]
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
let current = "system";
function getTheme() {
	return current;
}
function Shell($$renderer, $$props) {
	$$renderer.component(($$renderer2) => {
		let { children, soloMode = false, draftCount = 0, userRole = "member" } = $$props;
		const isAdmin = userRole === "admin" || userRole === "owner";
		const isOwner = userRole === "owner";
		function isActive(href) {
			return page.url.pathname.startsWith(href);
		}
		const themes = [
			{
				value: "light",
				icon: Sun,
				label: "Light"
			},
			{
				value: "dark",
				icon: Moon,
				label: "Dark"
			},
			{
				value: "system",
				icon: Monitor,
				label: "System"
			}
		];
		$$renderer2.push(`<div class="flex min-h-screen"><aside class="sticky top-0 flex h-screen w-56 flex-col border-r border-border bg-bg-card"><div class="flex h-14 items-center gap-2 border-b border-border px-5"><img src="/logo.png" alt="Pulse" class="h-5 w-5 dark:hidden"/> <img src="/logo-white.png" alt="Pulse" class="hidden h-5 w-5 dark:block"/> <span class="text-lg font-semibold text-text-primary">Pulse</span></div> <nav class="flex-1 space-y-0.5 p-3"><a href="/insights"${attr_class(`flex items-center gap-3 rounded-md px-3 py-1.5 text-sm transition ${stringify(isActive("/insights") && !isActive("/insights/drafts") ? "bg-accent/10 text-accent" : "text-text-secondary hover:bg-bg-hover hover:text-text-primary")}`)}>`);
		Zap($$renderer2, { size: 16 });
		$$renderer2.push(`<!----> Insights</a> `);
		if (soloMode) {
			$$renderer2.push("<!--[-->");
			$$renderer2.push(`<a href="/insights/drafts"${attr_class(`flex items-center gap-3 rounded-md px-3 py-1.5 text-sm transition ${stringify(isActive("/insights/drafts") ? "bg-accent/10 text-accent" : "text-text-secondary hover:bg-bg-hover hover:text-text-primary")}`)}>`);
			File_text($$renderer2, { size: 16 });
			$$renderer2.push(`<!----> Drafts `);
			if (draftCount > 0) {
				$$renderer2.push("<!--[-->");
				$$renderer2.push(`<span class="ml-auto rounded-full bg-accent/15 px-1.5 py-0.5 text-[10px] font-medium leading-none text-accent">${escape_html(draftCount)}</span>`);
			} else $$renderer2.push("<!--[!-->");
			$$renderer2.push(`<!--]--></a>`);
		} else $$renderer2.push("<!--[!-->");
		$$renderer2.push(`<!--]--> <a href="/search"${attr_class(`flex items-center gap-3 rounded-md px-3 py-1.5 text-sm transition ${stringify(isActive("/search") ? "bg-accent/10 text-accent" : "text-text-secondary hover:bg-bg-hover hover:text-text-primary")}`)}>`);
		Search($$renderer2, { size: 16 });
		$$renderer2.push(`<!----> Search</a> <a href="/analytics"${attr_class(`flex items-center gap-3 rounded-md px-3 py-1.5 text-sm transition ${stringify(isActive("/analytics") ? "bg-accent/10 text-accent" : "text-text-secondary hover:bg-bg-hover hover:text-text-primary")}`)}>`);
		Bar_chart_3($$renderer2, { size: 16 });
		$$renderer2.push(`<!----> Analytics</a> `);
		if (!soloMode && isAdmin) {
			$$renderer2.push("<!--[-->");
			$$renderer2.push(`<div class="my-2 border-t border-border"></div> <a href="/settings/members"${attr_class(`flex items-center gap-3 rounded-md px-3 py-1.5 text-sm transition ${stringify(isActive("/settings/members") ? "bg-accent/10 text-accent" : "text-text-secondary hover:bg-bg-hover hover:text-text-primary")}`)}>`);
			Users($$renderer2, { size: 16 });
			$$renderer2.push(`<!----> Members</a>`);
		} else $$renderer2.push("<!--[!-->");
		$$renderer2.push(`<!--]--> `);
		if (!soloMode && isOwner) {
			$$renderer2.push("<!--[-->");
			$$renderer2.push(`<a href="/settings/org"${attr_class(`flex items-center gap-3 rounded-md px-3 py-1.5 text-sm transition ${stringify(isActive("/settings/org") ? "bg-accent/10 text-accent" : "text-text-secondary hover:bg-bg-hover hover:text-text-primary")}`)}>`);
			Building_2($$renderer2, { size: 16 });
			$$renderer2.push(`<!----> Organization</a>`);
		} else $$renderer2.push("<!--[!-->");
		$$renderer2.push(`<!--]--> `);
		if (soloMode || isAdmin) {
			$$renderer2.push("<!--[-->");
			$$renderer2.push(`<div class="my-2 border-t border-border"></div> <a href="/settings"${attr_class(`flex items-center gap-3 rounded-md px-3 py-1.5 text-sm transition ${stringify(isActive("/settings") && !isActive("/settings/members") && !isActive("/settings/org") && !isActive("/settings/account") ? "bg-accent/10 text-accent" : "text-text-secondary hover:bg-bg-hover hover:text-text-primary")}`)}>`);
			Settings($$renderer2, { size: 16 });
			$$renderer2.push(`<!----> Settings</a>`);
		} else $$renderer2.push("<!--[!-->");
		$$renderer2.push(`<!--]--> `);
		if (!soloMode) {
			$$renderer2.push("<!--[-->");
			$$renderer2.push(`<a href="/settings/account"${attr_class(`flex items-center gap-3 rounded-md px-3 py-1.5 text-sm transition ${stringify(isActive("/settings/account") ? "bg-accent/10 text-accent" : "text-text-secondary hover:bg-bg-hover hover:text-text-primary")}`)}>`);
			User($$renderer2, { size: 16 });
			$$renderer2.push(`<!----> Account</a>`);
		} else $$renderer2.push("<!--[!-->");
		$$renderer2.push(`<!--]--></nav> <div class="border-t border-border p-3"><div class="mb-2 flex items-center justify-center gap-1"><!--[-->`);
		const each_array = ensure_array_like(themes);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let t = each_array[$$index];
			$$renderer2.push(`<button type="button"${attr_class(`rounded-md p-1.5 transition ${stringify(getTheme() === t.value ? "bg-bg-hover text-text-primary" : "text-text-secondary/50 hover:text-text-secondary")}`)}${attr("title", t.label)}>`);
			$$renderer2.push("<!---->");
			t.icon?.($$renderer2, { size: 14 });
			$$renderer2.push(`<!----></button>`);
		}
		$$renderer2.push(`<!--]--></div> `);
		if (!soloMode) {
			$$renderer2.push("<!--[-->");
			$$renderer2.push(`<a href="/logout" class="flex items-center gap-3 rounded-md px-3 py-1.5 text-sm text-text-secondary transition hover:bg-bg-hover hover:text-text-primary">`);
			Log_out($$renderer2, { size: 16 });
			$$renderer2.push(`<!----> Sign out</a>`);
		} else $$renderer2.push("<!--[!-->");
		$$renderer2.push(`<!--]--></div></aside> <main class="flex-1 overflow-y-auto"><div class="mx-auto max-w-5xl px-8 py-8">`);
		children($$renderer2);
		$$renderer2.push(`<!----></div></main></div>`);
	});
}
const bars = Array(12).fill(0);
function Loader($$renderer, $$props) {
	$$renderer.component(($$renderer2) => {
		let { visible, class: className } = $$props;
		$$renderer2.push(`<div${attr_class(clsx(["sonner-loading-wrapper", className].filter(Boolean).join(" ")))}${attr("data-visible", visible)}><div class="sonner-spinner"><!--[-->`);
		const each_array = ensure_array_like(bars);
		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			each_array[i];
			$$renderer2.push(`<div class="sonner-loading-bar"></div>`);
		}
		$$renderer2.push(`<!--]--></div></div>`);
	});
}
function cn(...classes) {
	return classes.filter(Boolean).join(" ");
}
const isBrowser = typeof document !== "undefined";
const defaultWindow = void 0;
function getActiveElement(document2) {
	let activeElement = document2.activeElement;
	while (activeElement?.shadowRoot) {
		const node = activeElement.shadowRoot.activeElement;
		if (node === activeElement) break;
		else activeElement = node;
	}
	return activeElement;
}
function createSubscriber(_) {
	return () => {};
}
var ActiveElement = class {
	#document;
	#subscribe;
	constructor(options = {}) {
		const { window: window2 = defaultWindow, document: document2 = window2?.document } = options;
		if (window2 === void 0) return;
		this.#document = document2;
		this.#subscribe = createSubscriber();
	}
	get current() {
		this.#subscribe?.();
		if (!this.#document) return null;
		return getActiveElement(this.#document);
	}
};
new ActiveElement();
var Context = class {
	#name;
	#key;
	/**
	* @param name The name of the context.
	* This is used for generating the context key and error messages.
	*/
	constructor(name) {
		this.#name = name;
		this.#key = Symbol(name);
	}
	/**
	* The key used to get and set the context.
	*
	* It is not recommended to use this value directly.
	* Instead, use the methods provided by this class.
	*/
	get key() {
		return this.#key;
	}
	/**
	* Checks whether this has been set in the context of a parent component.
	*
	* Must be called during component initialisation.
	*/
	exists() {
		return hasContext(this.#key);
	}
	/**
	* Retrieves the context that belongs to the closest parent component.
	*
	* Must be called during component initialisation.
	*
	* @throws An error if the context does not exist.
	*/
	get() {
		const context = getContext(this.#key);
		if (context === void 0) throw new Error(`Context "${this.#name}" not found`);
		return context;
	}
	/**
	* Retrieves the context that belongs to the closest parent component,
	* or the given fallback value if the context does not exist.
	*
	* Must be called during component initialisation.
	*/
	getOr(fallback) {
		const context = getContext(this.#key);
		if (context === void 0) return fallback;
		return context;
	}
	/**
	* Associates the given value with the current component and returns it.
	*
	* Must be called during component initialisation.
	*/
	set(context) {
		return setContext(this.#key, context);
	}
};
const sonnerContext = new Context("<Toaster/>");
let toastsCounter = 0;
var ToastState = class {
	toasts = [];
	heights = [];
	#findToastIdx = (id) => {
		const idx = this.toasts.findIndex((toast) => toast.id === id);
		if (idx === -1) return null;
		return idx;
	};
	addToast = (data) => {
		if (!isBrowser) return;
		this.toasts.unshift(data);
	};
	updateToast = ({ id, data, type, message }) => {
		const toastIdx = this.toasts.findIndex((toast) => toast.id === id);
		const toastToUpdate = this.toasts[toastIdx];
		this.toasts[toastIdx] = {
			...toastToUpdate,
			...data,
			id,
			title: message,
			type,
			updated: true
		};
	};
	create = (data) => {
		const { message, ...rest } = data;
		const id = typeof data?.id === "number" || data.id && data.id?.length > 0 ? data.id : toastsCounter++;
		const dismissable = data.dismissable === void 0 ? true : data.dismissable;
		const type = data.type === void 0 ? "default" : data.type;
		run(() => {
			if (this.toasts.find((toast) => toast.id === id)) this.updateToast({
				id,
				data,
				type,
				message,
				dismissable
			});
			else this.addToast({
				...rest,
				id,
				title: message,
				dismissable,
				type
			});
		});
		return id;
	};
	dismiss = (id) => {
		run(() => {
			if (id === void 0) {
				this.toasts = this.toasts.map((toast) => ({
					...toast,
					dismiss: true
				}));
				return;
			}
			const toastIdx = this.toasts.findIndex((toast) => toast.id === id);
			if (this.toasts[toastIdx]) this.toasts[toastIdx] = {
				...this.toasts[toastIdx],
				dismiss: true
			};
		});
		return id;
	};
	remove = (id) => {
		if (id === void 0) {
			this.toasts = [];
			return;
		}
		const toastIdx = this.#findToastIdx(id);
		if (toastIdx === null) return;
		this.toasts.splice(toastIdx, 1);
		return id;
	};
	message = (message, data) => {
		return this.create({
			...data,
			type: "default",
			message
		});
	};
	error = (message, data) => {
		return this.create({
			...data,
			type: "error",
			message
		});
	};
	success = (message, data) => {
		return this.create({
			...data,
			type: "success",
			message
		});
	};
	info = (message, data) => {
		return this.create({
			...data,
			type: "info",
			message
		});
	};
	warning = (message, data) => {
		return this.create({
			...data,
			type: "warning",
			message
		});
	};
	loading = (message, data) => {
		return this.create({
			...data,
			type: "loading",
			message
		});
	};
	promise = (promise, data) => {
		if (!data) return;
		let id = void 0;
		if (data.loading !== void 0) id = this.create({
			...data,
			promise,
			type: "loading",
			message: typeof data.loading === "string" ? data.loading : data.loading()
		});
		const p = promise instanceof Promise ? promise : promise();
		let shouldDismiss = id !== void 0;
		p.then((response) => {
			if (typeof response === "object" && response && "ok" in response && typeof response.ok === "boolean" && !response.ok) {
				shouldDismiss = false;
				const message = constructPromiseErrorMessage(response);
				this.create({
					id,
					type: "error",
					message
				});
			} else if (data.success !== void 0) {
				shouldDismiss = false;
				const message = typeof data.success === "function" ? data.success(response) : data.success;
				this.create({
					id,
					type: "success",
					message
				});
			}
		}).catch((error) => {
			if (data.error !== void 0) {
				shouldDismiss = false;
				const message = typeof data.error === "function" ? data.error(error) : data.error;
				this.create({
					id,
					type: "error",
					message
				});
			}
		}).finally(() => {
			if (shouldDismiss) {
				this.dismiss(id);
				id = void 0;
			}
			data.finally?.();
		});
		return id;
	};
	custom = (component, data) => {
		const id = data?.id || toastsCounter++;
		this.create({
			component,
			id,
			...data
		});
		return id;
	};
	removeHeight = (id) => {
		this.heights = this.heights.filter((height) => height.toastId !== id);
	};
	setHeight = (data) => {
		const toastIdx = this.#findToastIdx(data.toastId);
		if (toastIdx === null) {
			this.heights.push(data);
			return;
		}
		this.heights[toastIdx] = data;
	};
	reset = () => {
		this.toasts = [];
		this.heights = [];
	};
};
function constructPromiseErrorMessage(response) {
	if (response && typeof response === "object" && "status" in response) return `HTTP error! Status: ${response.status}`;
	return `Error! ${response}`;
}
const toastState = new ToastState();
function toastFunction(message, data) {
	return toastState.create({
		message,
		...data
	});
}
var SonnerState = class {
	/**
	* A derived state of the toasts that are not dismissed.
	*/
	#activeToasts = derived(() => toastState.toasts.filter((toast) => !toast.dismiss));
	get toasts() {
		return this.#activeToasts();
	}
};
const basicToast = toastFunction;
Object.assign(basicToast, {
	success: toastState.success,
	info: toastState.info,
	warning: toastState.warning,
	error: toastState.error,
	custom: toastState.custom,
	message: toastState.message,
	promise: toastState.promise,
	dismiss: toastState.dismiss,
	loading: toastState.loading,
	getActiveToasts: () => {
		return toastState.toasts.filter((toast) => !toast.dismiss);
	}
});
function isAction(action) {
	return action.label !== void 0;
}
const GAP$1 = 14;
const TIME_BEFORE_UNMOUNT = 200;
const DEFAULT_TOAST_CLASSES = {
	toast: "",
	title: "",
	description: "",
	loader: "",
	closeButton: "",
	cancelButton: "",
	actionButton: "",
	action: "",
	warning: "",
	error: "",
	success: "",
	default: "",
	info: "",
	loading: ""
};
function Toast($$renderer, $$props) {
	$$renderer.component(($$renderer2) => {
		let { toast, index, expanded, invert: invertFromToaster, position, visibleToasts, expandByDefault, closeButton: closeButtonFromToaster, interacting, cancelButtonStyle = "", actionButtonStyle = "", duration: durationFromToaster, descriptionClass = "", classes: classesProp, unstyled = false, loadingIcon, successIcon, errorIcon, warningIcon, closeIcon, infoIcon, defaultRichColors = false, swipeDirections: swipeDirectionsProp, closeButtonAriaLabel, $$slots, $$events, ...restProps } = $$props;
		const defaultClasses = { ...DEFAULT_TOAST_CLASSES };
		let mounted = false;
		let removed = false;
		let swiping = false;
		let swipeOut = false;
		let isSwiped = false;
		let offsetBeforeRemove = 0;
		let initialHeight = 0;
		toast.duration;
		let swipeOutDirection = null;
		const isFront = index === 0;
		const isVisible = index + 1 <= visibleToasts;
		const toastType = toast.type;
		const dismissable = toast.dismissable !== false;
		const toastClass = toast.class || "";
		const toastDescriptionClass = toast.descriptionClass || "";
		const heightIndex = toastState.heights.findIndex((height) => height.toastId === toast.id) || 0;
		const closeButton = toast.closeButton ?? closeButtonFromToaster;
		toast.duration;
		const coords = position.split("-");
		const toastsHeightBefore = toastState.heights.reduce((prev, curr, reducerIndex) => {
			if (reducerIndex >= heightIndex) return prev;
			return prev + curr.height;
		}, 0);
		const invert = toast.invert || invertFromToaster;
		const disabled = toastType === "loading";
		const classes = {
			...defaultClasses,
			...classesProp
		};
		toast.title;
		toast.description;
		const offset = Math.round(heightIndex * GAP$1 + toastsHeightBefore);
		function deleteToast() {
			removed = true;
			offsetBeforeRemove = offset;
			toastState.removeHeight(toast.id);
			setTimeout(() => {
				toastState.remove(toast.id);
			}, TIME_BEFORE_UNMOUNT);
		}
		toast.promise && toastType === "loading" || (toast.duration, Number.POSITIVE_INFINITY);
		const icon = (() => {
			if (toast.icon) return toast.icon;
			if (toastType === "success") return successIcon;
			if (toastType === "error") return errorIcon;
			if (toastType === "warning") return warningIcon;
			if (toastType === "info") return infoIcon;
			if (toastType === "loading") return loadingIcon;
			return null;
		})();
		function LoadingIcon($$renderer3) {
			if (loadingIcon) {
				$$renderer3.push("<!--[-->");
				$$renderer3.push(`<div${attr_class(clsx(cn(classes?.loader, toast?.classes?.loader, "sonner-loader")))}${attr("data-visible", toastType === "loading")}>`);
				loadingIcon($$renderer3);
				$$renderer3.push(`<!----></div>`);
			} else {
				$$renderer3.push("<!--[!-->");
				Loader($$renderer3, {
					class: cn(classes?.loader, toast.classes?.loader),
					visible: toastType === "loading"
				});
			}
			$$renderer3.push(`<!--]-->`);
		}
		$$renderer2.push(`<li${attr("tabindex", 0)}${attr_class(clsx(cn(restProps.class, toastClass, classes?.toast, toast?.classes?.toast, classes?.[toastType], toast?.classes?.[toastType])))} data-sonner-toast=""${attr("data-rich-colors", toast.richColors ?? defaultRichColors)}${attr("data-styled", !(toast.component || toast.unstyled || unstyled))}${attr("data-mounted", mounted)}${attr("data-promise", Boolean(toast.promise))}${attr("data-swiped", isSwiped)}${attr("data-removed", removed)}${attr("data-visible", isVisible)}${attr("data-y-position", coords[0])}${attr("data-x-position", coords[1])}${attr("data-index", index)}${attr("data-front", isFront)}${attr("data-swiping", swiping)}${attr("data-dismissable", dismissable)}${attr("data-type", toastType)}${attr("data-invert", invert)}${attr("data-swipe-out", swipeOut)}${attr("data-swipe-direction", swipeOutDirection)}${attr("data-expanded", Boolean(expanded || expandByDefault && mounted))}${attr_style(`${restProps.style} ${toast.style}`, {
			"--index": index,
			"--toasts-before": index,
			"--z-index": toastState.toasts.length - index,
			"--offset": `${removed ? offsetBeforeRemove : offset}px`,
			"--initial-height": expandByDefault ? "auto" : `${initialHeight}px`
		})}>`);
		if (closeButton && !toast.component && toastType !== "loading" && closeIcon !== null) {
			$$renderer2.push("<!--[-->");
			$$renderer2.push(`<button${attr("aria-label", closeButtonAriaLabel)}${attr("data-disabled", disabled)} data-close-button=""${attr_class(clsx(cn(classes?.closeButton, toast?.classes?.closeButton)))}>`);
			closeIcon?.($$renderer2);
			$$renderer2.push(`<!----></button>`);
		} else $$renderer2.push("<!--[!-->");
		$$renderer2.push(`<!--]--> `);
		if (toast.component) {
			$$renderer2.push("<!--[-->");
			const Component = toast.component;
			$$renderer2.push("<!---->");
			Component?.($$renderer2, spread_props([toast.componentProps, { closeToast: deleteToast }]));
			$$renderer2.push(`<!---->`);
		} else {
			$$renderer2.push("<!--[!-->");
			if ((toastType || toast.icon || toast.promise) && toast.icon !== null && (icon !== null || toast.icon)) {
				$$renderer2.push("<!--[-->");
				$$renderer2.push(`<div data-icon=""${attr_class(clsx(cn(classes?.icon, toast?.classes?.icon)))}>`);
				if (toast.promise || toastType === "loading") {
					$$renderer2.push("<!--[-->");
					if (toast.icon) {
						$$renderer2.push("<!--[-->");
						$$renderer2.push("<!---->");
						toast.icon?.($$renderer2, {});
						$$renderer2.push(`<!---->`);
					} else {
						$$renderer2.push("<!--[!-->");
						LoadingIcon($$renderer2);
					}
					$$renderer2.push(`<!--]-->`);
				} else $$renderer2.push("<!--[!-->");
				$$renderer2.push(`<!--]--> `);
				if (toast.type !== "loading") {
					$$renderer2.push("<!--[-->");
					if (toast.icon) {
						$$renderer2.push("<!--[-->");
						$$renderer2.push("<!---->");
						toast.icon?.($$renderer2, {});
						$$renderer2.push(`<!---->`);
					} else {
						$$renderer2.push("<!--[!-->");
						if (toastType === "success") {
							$$renderer2.push("<!--[-->");
							successIcon?.($$renderer2);
							$$renderer2.push(`<!---->`);
						} else {
							$$renderer2.push("<!--[!-->");
							if (toastType === "error") {
								$$renderer2.push("<!--[-->");
								errorIcon?.($$renderer2);
								$$renderer2.push(`<!---->`);
							} else {
								$$renderer2.push("<!--[!-->");
								if (toastType === "warning") {
									$$renderer2.push("<!--[-->");
									warningIcon?.($$renderer2);
									$$renderer2.push(`<!---->`);
								} else {
									$$renderer2.push("<!--[!-->");
									if (toastType === "info") {
										$$renderer2.push("<!--[-->");
										infoIcon?.($$renderer2);
										$$renderer2.push(`<!---->`);
									} else $$renderer2.push("<!--[!-->");
									$$renderer2.push(`<!--]-->`);
								}
								$$renderer2.push(`<!--]-->`);
							}
							$$renderer2.push(`<!--]-->`);
						}
						$$renderer2.push(`<!--]-->`);
					}
					$$renderer2.push(`<!--]-->`);
				} else $$renderer2.push("<!--[!-->");
				$$renderer2.push(`<!--]--></div>`);
			} else $$renderer2.push("<!--[!-->");
			$$renderer2.push(`<!--]--> <div data-content=""><div data-title=""${attr_class(clsx(cn(classes?.title, toast?.classes?.title)))}>`);
			if (toast.title) {
				$$renderer2.push("<!--[-->");
				if (typeof toast.title !== "string") {
					$$renderer2.push("<!--[-->");
					const Title = toast.title;
					$$renderer2.push("<!---->");
					Title?.($$renderer2, spread_props([toast.componentProps]));
					$$renderer2.push(`<!---->`);
				} else {
					$$renderer2.push("<!--[!-->");
					$$renderer2.push(`${escape_html(toast.title)}`);
				}
				$$renderer2.push(`<!--]-->`);
			} else $$renderer2.push("<!--[!-->");
			$$renderer2.push(`<!--]--></div> `);
			if (toast.description) {
				$$renderer2.push("<!--[-->");
				$$renderer2.push(`<div data-description=""${attr_class(clsx(cn(descriptionClass, toastDescriptionClass, classes?.description, toast.classes?.description)))}>`);
				if (typeof toast.description !== "string") {
					$$renderer2.push("<!--[-->");
					const Description = toast.description;
					$$renderer2.push("<!---->");
					Description?.($$renderer2, spread_props([toast.componentProps]));
					$$renderer2.push(`<!---->`);
				} else {
					$$renderer2.push("<!--[!-->");
					$$renderer2.push(`${escape_html(toast.description)}`);
				}
				$$renderer2.push(`<!--]--></div>`);
			} else $$renderer2.push("<!--[!-->");
			$$renderer2.push(`<!--]--></div> `);
			if (toast.cancel) {
				$$renderer2.push("<!--[-->");
				if (typeof toast.cancel === "function") {
					$$renderer2.push("<!--[-->");
					$$renderer2.push("<!---->");
					toast.cancel?.($$renderer2, {});
					$$renderer2.push(`<!---->`);
				} else {
					$$renderer2.push("<!--[!-->");
					if (isAction(toast.cancel)) {
						$$renderer2.push("<!--[-->");
						$$renderer2.push(`<button data-button="" data-cancel=""${attr_style(toast.cancelButtonStyle ?? cancelButtonStyle)}${attr_class(clsx(cn(classes?.cancelButton, toast?.classes?.cancelButton)))}>${escape_html(toast.cancel.label)}</button>`);
					} else $$renderer2.push("<!--[!-->");
					$$renderer2.push(`<!--]-->`);
				}
				$$renderer2.push(`<!--]-->`);
			} else $$renderer2.push("<!--[!-->");
			$$renderer2.push(`<!--]--> `);
			if (toast.action) {
				$$renderer2.push("<!--[-->");
				if (typeof toast.action === "function") {
					$$renderer2.push("<!--[-->");
					$$renderer2.push("<!---->");
					toast.action?.($$renderer2, {});
					$$renderer2.push(`<!---->`);
				} else {
					$$renderer2.push("<!--[!-->");
					if (isAction(toast.action)) {
						$$renderer2.push("<!--[-->");
						$$renderer2.push(`<button data-button=""${attr_style(toast.actionButtonStyle ?? actionButtonStyle)}${attr_class(clsx(cn(classes?.actionButton, toast?.classes?.actionButton)))}>${escape_html(toast.action.label)}</button>`);
					} else $$renderer2.push("<!--[!-->");
					$$renderer2.push(`<!--]-->`);
				}
				$$renderer2.push(`<!--]-->`);
			} else $$renderer2.push("<!--[!-->");
			$$renderer2.push(`<!--]-->`);
		}
		$$renderer2.push(`<!--]--></li>`);
	});
}
function SuccessIcon($$renderer) {
	$$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" height="20" width="20" data-sonner-success-icon=""><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"></path></svg>`);
}
function ErrorIcon($$renderer) {
	$$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" height="20" width="20" data-sonner-error-icon=""><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"></path></svg>`);
}
function WarningIcon($$renderer) {
	$$renderer.push(`<svg viewBox="0 0 64 64" fill="currentColor" height="20" width="20" data-sonner-warning-icon="" xmlns="http://www.w3.org/2000/svg"><path d="M32.427,7.987c2.183,0.124 4,1.165 5.096,3.281l17.936,36.208c1.739,3.66 -0.954,8.585 -5.373,8.656l-36.119,0c-4.022,-0.064 -7.322,-4.631 -5.352,-8.696l18.271,-36.207c0.342,-0.65 0.498,-0.838 0.793,-1.179c1.186,-1.375 2.483,-2.111 4.748,-2.063Zm-0.295,3.997c-0.687,0.034 -1.316,0.419 -1.659,1.017c-6.312,11.979 -12.397,24.081 -18.301,36.267c-0.546,1.225 0.391,2.797 1.762,2.863c12.06,0.195 24.125,0.195 36.185,0c1.325,-0.064 2.321,-1.584 1.769,-2.85c-5.793,-12.184 -11.765,-24.286 -17.966,-36.267c-0.366,-0.651 -0.903,-1.042 -1.79,-1.03Z"></path><path d="M33.631,40.581l-3.348,0l-0.368,-16.449l4.1,0l-0.384,16.449Zm-3.828,5.03c0,-0.609 0.197,-1.113 0.592,-1.514c0.396,-0.4 0.935,-0.601 1.618,-0.601c0.684,0 1.223,0.201 1.618,0.601c0.395,0.401 0.593,0.905 0.593,1.514c0,0.587 -0.193,1.078 -0.577,1.473c-0.385,0.395 -0.929,0.593 -1.634,0.593c-0.705,0 -1.249,-0.198 -1.634,-0.593c-0.384,-0.395 -0.576,-0.886 -0.576,-1.473Z"></path></svg>`);
}
function InfoIcon($$renderer) {
	$$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" height="20" width="20" data-sonner-info-icon=""><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clip-rule="evenodd"></path></svg>`);
}
function CloseIcon($$renderer) {
	$$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" data-sonner-close-icon=""><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`);
}
const VISIBLE_TOASTS_AMOUNT = 3;
const VIEWPORT_OFFSET = "24px";
const MOBILE_VIEWPORT_OFFSET = "16px";
const TOAST_LIFETIME = 4e3;
const TOAST_WIDTH = 356;
const GAP = 14;
const DARK = "dark";
const LIGHT = "light";
function getOffsetObject(defaultOffset, mobileOffset) {
	const styles = {};
	[defaultOffset, mobileOffset].forEach((offset, index) => {
		const isMobile = index === 1;
		const prefix = isMobile ? "--mobile-offset" : "--offset";
		const defaultValue = isMobile ? MOBILE_VIEWPORT_OFFSET : VIEWPORT_OFFSET;
		function assignAll(offset2) {
			[
				"top",
				"right",
				"bottom",
				"left"
			].forEach((key) => {
				styles[`${prefix}-${key}`] = typeof offset2 === "number" ? `${offset2}px` : offset2;
			});
		}
		if (typeof offset === "number" || typeof offset === "string") assignAll(offset);
		else if (typeof offset === "object") [
			"top",
			"right",
			"bottom",
			"left"
		].forEach((key) => {
			const value = offset[key];
			if (value === void 0) styles[`${prefix}-${key}`] = defaultValue;
			else styles[`${prefix}-${key}`] = typeof value === "number" ? `${value}px` : value;
		});
		else assignAll(defaultValue);
	});
	return styles;
}
function Toaster($$renderer, $$props) {
	$$renderer.component(($$renderer2) => {
		function getInitialTheme(t) {
			if (t !== "system") return t;
			if (typeof window !== "undefined") {
				if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) return DARK;
				return LIGHT;
			}
			return LIGHT;
		}
		let { invert = false, position = "bottom-right", hotkey = ["altKey", "KeyT"], expand = false, closeButton = false, offset = VIEWPORT_OFFSET, mobileOffset = MOBILE_VIEWPORT_OFFSET, theme = "light", richColors = false, duration = TOAST_LIFETIME, visibleToasts = VISIBLE_TOASTS_AMOUNT, toastOptions = {}, dir = "auto", gap = GAP, loadingIcon: loadingIconProp, successIcon: successIconProp, errorIcon: errorIconProp, warningIcon: warningIconProp, closeIcon: closeIconProp, infoIcon: infoIconProp, containerAriaLabel = "Notifications", class: className, closeButtonAriaLabel = "Close toast", onblur, onfocus, onmouseenter, onmousemove, onmouseleave, ondragend, onpointerdown, onpointerup, $$slots, $$events, ...restProps } = $$props;
		function getDocumentDirection() {
			if (dir !== "auto") return dir;
			if (typeof window === "undefined") return "ltr";
			if (typeof document === "undefined") return "ltr";
			const dirAttribute = document.documentElement.getAttribute("dir");
			if (dirAttribute === "auto" || !dirAttribute) {
				run(() => dir = window.getComputedStyle(document.documentElement).direction ?? "ltr");
				return dir;
			}
			run(() => dir = dirAttribute);
			return dirAttribute;
		}
		const possiblePositions = Array.from(new Set([position, ...toastState.toasts.filter((toast) => toast.position).map((toast) => toast.position)].filter(Boolean)));
		let expanded = false;
		let interacting = false;
		let actualTheme = getInitialTheme(theme);
		const hotkeyLabel = hotkey.join("+").replace(/Key/g, "").replace(/Digit/g, "");
		sonnerContext.set(new SonnerState());
		$$renderer2.push(`<section${attr("aria-label", `${stringify(containerAriaLabel)} ${stringify(hotkeyLabel)}`)}${attr("tabindex", -1)} aria-live="polite" aria-relevant="additions text" aria-atomic="false" class="svelte-1o9jjvy">`);
		if (toastState.toasts.length > 0) {
			$$renderer2.push("<!--[-->");
			$$renderer2.push(`<!--[-->`);
			const each_array = ensure_array_like(possiblePositions);
			for (let index = 0, $$length = each_array.length; index < $$length; index++) {
				let position2 = each_array[index];
				const [y, x] = position2.split("-");
				const offsetObject = getOffsetObject(offset, mobileOffset);
				$$renderer2.push(`<ol${attributes({
					tabindex: -1,
					dir: getDocumentDirection(),
					class: clsx(className),
					"data-sonner-toaster": true,
					"data-sonner-theme": actualTheme,
					"data-y-position": y,
					"data-x-position": x,
					style: restProps.style,
					...restProps
				}, "svelte-1o9jjvy", void 0, {
					"--front-toast-height": `${toastState.heights[0]?.height}px`,
					"--width": `${TOAST_WIDTH}px`,
					"--gap": `${gap}px`,
					"--offset-top": offsetObject["--offset-top"],
					"--offset-right": offsetObject["--offset-right"],
					"--offset-bottom": offsetObject["--offset-bottom"],
					"--offset-left": offsetObject["--offset-left"],
					"--mobile-offset-top": offsetObject["--mobile-offset-top"],
					"--mobile-offset-right": offsetObject["--mobile-offset-right"],
					"--mobile-offset-bottom": offsetObject["--mobile-offset-bottom"],
					"--mobile-offset-left": offsetObject["--mobile-offset-left"]
				})}><!--[-->`);
				const each_array_1 = ensure_array_like(toastState.toasts.filter((toast) => !toast.position && index === 0 || toast.position === position2));
				for (let index2 = 0, $$length2 = each_array_1.length; index2 < $$length2; index2++) {
					let toast = each_array_1[index2];
					{
						let successIcon = function($$renderer3) {
							if (successIconProp) {
								$$renderer3.push("<!--[-->");
								successIconProp?.($$renderer3);
								$$renderer3.push(`<!---->`);
							} else {
								$$renderer3.push("<!--[!-->");
								if (successIconProp !== null) {
									$$renderer3.push("<!--[-->");
									SuccessIcon($$renderer3);
								} else $$renderer3.push("<!--[!-->");
								$$renderer3.push(`<!--]-->`);
							}
							$$renderer3.push(`<!--]-->`);
						}, errorIcon = function($$renderer3) {
							if (errorIconProp) {
								$$renderer3.push("<!--[-->");
								errorIconProp?.($$renderer3);
								$$renderer3.push(`<!---->`);
							} else {
								$$renderer3.push("<!--[!-->");
								if (errorIconProp !== null) {
									$$renderer3.push("<!--[-->");
									ErrorIcon($$renderer3);
								} else $$renderer3.push("<!--[!-->");
								$$renderer3.push(`<!--]-->`);
							}
							$$renderer3.push(`<!--]-->`);
						}, warningIcon = function($$renderer3) {
							if (warningIconProp) {
								$$renderer3.push("<!--[-->");
								warningIconProp?.($$renderer3);
								$$renderer3.push(`<!---->`);
							} else {
								$$renderer3.push("<!--[!-->");
								if (warningIconProp !== null) {
									$$renderer3.push("<!--[-->");
									WarningIcon($$renderer3);
								} else $$renderer3.push("<!--[!-->");
								$$renderer3.push(`<!--]-->`);
							}
							$$renderer3.push(`<!--]-->`);
						}, infoIcon = function($$renderer3) {
							if (infoIconProp) {
								$$renderer3.push("<!--[-->");
								infoIconProp?.($$renderer3);
								$$renderer3.push(`<!---->`);
							} else {
								$$renderer3.push("<!--[!-->");
								if (infoIconProp !== null) {
									$$renderer3.push("<!--[-->");
									InfoIcon($$renderer3);
								} else $$renderer3.push("<!--[!-->");
								$$renderer3.push(`<!--]-->`);
							}
							$$renderer3.push(`<!--]-->`);
						}, closeIcon = function($$renderer3) {
							if (closeIconProp) {
								$$renderer3.push("<!--[-->");
								closeIconProp?.($$renderer3);
								$$renderer3.push(`<!---->`);
							} else {
								$$renderer3.push("<!--[!-->");
								if (closeIconProp !== null) {
									$$renderer3.push("<!--[-->");
									CloseIcon($$renderer3);
								} else $$renderer3.push("<!--[!-->");
								$$renderer3.push(`<!--]-->`);
							}
							$$renderer3.push(`<!--]-->`);
						};
						Toast($$renderer2, {
							index: index2,
							toast,
							defaultRichColors: richColors,
							duration: toastOptions?.duration ?? duration,
							class: toastOptions?.class ?? "",
							descriptionClass: toastOptions?.descriptionClass || "",
							invert,
							visibleToasts,
							closeButton,
							interacting,
							position: position2,
							style: toastOptions?.style ?? "",
							classes: toastOptions.classes || {},
							unstyled: toastOptions.unstyled ?? false,
							cancelButtonStyle: toastOptions?.cancelButtonStyle ?? "",
							actionButtonStyle: toastOptions?.actionButtonStyle ?? "",
							closeButtonAriaLabel: toastOptions?.closeButtonAriaLabel ?? closeButtonAriaLabel,
							expandByDefault: expand,
							expanded,
							loadingIcon: loadingIconProp,
							successIcon,
							errorIcon,
							warningIcon,
							infoIcon,
							closeIcon,
							$$slots: {
								successIcon: true,
								errorIcon: true,
								warningIcon: true,
								infoIcon: true,
								closeIcon: true
							}
						});
					}
				}
				$$renderer2.push(`<!--]--></ol>`);
			}
			$$renderer2.push(`<!--]-->`);
		} else $$renderer2.push("<!--[!-->");
		$$renderer2.push(`<!--]--></section>`);
	});
}
function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer2) => {
		let { children, data } = $$props;
		const isPublic = page.url.searchParams.has("preview") || !data.soloMode && ([
			"/",
			"/login",
			"/register",
			"/pricing",
			"/forgot-password"
		].includes(page.url.pathname) || [
			"/reset-password/",
			"/invite/",
			"/auth/"
		].some((p) => page.url.pathname.startsWith(p)));
		head("12qhfyh", $$renderer2, ($$renderer3) => {
			$$renderer3.title(($$renderer4) => {
				$$renderer4.push(`<title>Pulse</title>`);
			});
		});
		Toaster($$renderer2, {
			richColors: true,
			position: "bottom-right"
		});
		$$renderer2.push(`<!----> `);
		if (isPublic) {
			$$renderer2.push("<!--[-->");
			children($$renderer2);
			$$renderer2.push(`<!---->`);
		} else {
			$$renderer2.push("<!--[!-->");
			Shell($$renderer2, {
				soloMode: data.soloMode,
				draftCount: data.draftCount,
				userRole: data.user?.role ?? "member",
				children: ($$renderer3) => {
					children($$renderer3);
					$$renderer3.push(`<!---->`);
				}
			});
		}
		$$renderer2.push(`<!--]-->`);
	});
}

//#endregion
export { _layout as default };
//# sourceMappingURL=_layout.svelte-2aK76kaM.js.map