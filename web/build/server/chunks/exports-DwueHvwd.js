import { n as HttpError, r as Redirect, t as ActionFailure } from "./internal-Byo9hPX2.js";

//#region ../node_modules/.bun/esm-env@1.2.2/node_modules/esm-env/true.js
var true_default = true;

//#endregion
//#region ../node_modules/.bun/esm-env@1.2.2/node_modules/esm-env/dev-fallback.js
const node_env = globalThis.process?.env?.NODE_ENV;
var dev_fallback_default = node_env && !node_env.toLowerCase().startsWith("prod");

//#endregion
//#region ../node_modules/.bun/@sveltejs+kit@2.50.2+620a5a8524c2db66/node_modules/@sveltejs/kit/src/runtime/utils.js
const text_encoder = new TextEncoder();
const text_decoder = new TextDecoder();

//#endregion
//#region ../node_modules/.bun/@sveltejs+kit@2.50.2+620a5a8524c2db66/node_modules/@sveltejs/kit/src/exports/index.js
/** @import { StandardSchemaV1 } from '@standard-schema/spec' */
/**
* @template {number} TNumber
* @template {any[]} [TArray=[]]
* @typedef {TNumber extends TArray['length'] ? TArray[number] : LessThan<TNumber, [...TArray, TArray['length']]>} LessThan
*/
/**
* @template {number} TStart
* @template {number} TEnd
* @typedef {Exclude<TEnd | LessThan<TEnd>, LessThan<TStart>>} NumericRange
*/
/**
* Throws an error with a HTTP status code and an optional message.
* When called during request handling, this will cause SvelteKit to
* return an error response without invoking `handleError`.
* Make sure you're not catching the thrown error, which would prevent SvelteKit from handling it.
* @param {number} status The [HTTP status code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#client_error_responses). Must be in the range 400-599.
* @param {App.Error} body An object that conforms to the App.Error type. If a string is passed, it will be used as the message property.
* @overload
* @param {number} status
* @param {App.Error} body
* @return {never}
* @throws {HttpError} This error instructs SvelteKit to initiate HTTP error handling.
* @throws {Error} If the provided status is invalid (not between 400 and 599).
*/
/**
* Throws an error with a HTTP status code and an optional message.
* When called during request handling, this will cause SvelteKit to
* return an error response without invoking `handleError`.
* Make sure you're not catching the thrown error, which would prevent SvelteKit from handling it.
* @param {number} status The [HTTP status code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#client_error_responses). Must be in the range 400-599.
* @param {{ message: string } extends App.Error ? App.Error | string | undefined : never} [body] An object that conforms to the App.Error type. If a string is passed, it will be used as the message property.
* @overload
* @param {number} status
* @param {{ message: string } extends App.Error ? App.Error | string | undefined : never} [body]
* @return {never}
* @throws {HttpError} This error instructs SvelteKit to initiate HTTP error handling.
* @throws {Error} If the provided status is invalid (not between 400 and 599).
*/
/**
* Throws an error with a HTTP status code and an optional message.
* When called during request handling, this will cause SvelteKit to
* return an error response without invoking `handleError`.
* Make sure you're not catching the thrown error, which would prevent SvelteKit from handling it.
* @param {number} status The [HTTP status code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#client_error_responses). Must be in the range 400-599.
* @param {{ message: string } extends App.Error ? App.Error | string | undefined : never} body An object that conforms to the App.Error type. If a string is passed, it will be used as the message property.
* @return {never}
* @throws {HttpError} This error instructs SvelteKit to initiate HTTP error handling.
* @throws {Error} If the provided status is invalid (not between 400 and 599).
*/
function error(status, body) {
	if ((!true_default || dev_fallback_default) && (isNaN(status) || status < 400 || status > 599)) throw new Error(`HTTP error status codes must be between 400 and 599 — ${status} is invalid`);
	throw new HttpError(status, body);
}
/**
* Redirect a request. When called during request handling, SvelteKit will return a redirect response.
* Make sure you're not catching the thrown redirect, which would prevent SvelteKit from handling it.
*
* Most common status codes:
*  * `303 See Other`: redirect as a GET request (often used after a form POST request)
*  * `307 Temporary Redirect`: redirect will keep the request method
*  * `308 Permanent Redirect`: redirect will keep the request method, SEO will be transferred to the new page
*
* [See all redirect status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#redirection_messages)
*
* @param {300 | 301 | 302 | 303 | 304 | 305 | 306 | 307 | 308 | ({} & number)} status The [HTTP status code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#redirection_messages). Must be in the range 300-308.
* @param {string | URL} location The location to redirect to.
* @throws {Redirect} This error instructs SvelteKit to redirect to the specified location.
* @throws {Error} If the provided status is invalid.
* @return {never}
*/
function redirect(status, location) {
	if ((!true_default || dev_fallback_default) && (isNaN(status) || status < 300 || status > 308)) throw new Error("Invalid status code");
	throw new Redirect(status, location.toString());
}
/**
* Create a JSON `Response` object from the supplied data.
* @param {any} data The value that will be serialized as JSON.
* @param {ResponseInit} [init] Options such as `status` and `headers` that will be added to the response. `Content-Type: application/json` and `Content-Length` headers will be added automatically.
*/
function json(data, init) {
	const body = JSON.stringify(data);
	const headers = new Headers(init?.headers);
	if (!headers.has("content-length")) headers.set("content-length", text_encoder.encode(body).byteLength.toString());
	if (!headers.has("content-type")) headers.set("content-type", "application/json");
	return new Response(body, {
		...init,
		headers
	});
}
/**
* Create a `Response` object from the supplied body.
* @param {string} body The value that will be used as-is.
* @param {ResponseInit} [init] Options such as `status` and `headers` that will be added to the response. A `Content-Length` header will be added automatically.
*/
function text(body, init) {
	const headers = new Headers(init?.headers);
	if (!headers.has("content-length")) {
		const encoded = text_encoder.encode(body);
		headers.set("content-length", encoded.byteLength.toString());
		return new Response(encoded, {
			...init,
			headers
		});
	}
	return new Response(body, {
		...init,
		headers
	});
}
/**
* Create an `ActionFailure` object. Call when form submission fails.
* @param {number} status The [HTTP status code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#client_error_responses). Must be in the range 400-599.
* @overload
* @param {number} status
* @returns {import('./public.js').ActionFailure<undefined>}
*/
/**
* Create an `ActionFailure` object. Call when form submission fails.
* @template [T=undefined]
* @param {number} status The [HTTP status code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#client_error_responses). Must be in the range 400-599.
* @param {T} data Data associated with the failure (e.g. validation errors)
* @overload
* @param {number} status
* @param {T} data
* @returns {import('./public.js').ActionFailure<T>}
*/
/**
* Create an `ActionFailure` object. Call when form submission fails.
* @param {number} status
* @param {any} [data]
* @returns {import('./public.js').ActionFailure<any>}
*/
function fail(status, data) {
	return new ActionFailure(status, data);
}

//#endregion
export { text as a, redirect as i, fail as n, json as r, error as t };
//# sourceMappingURL=exports-DwueHvwd.js.map