//#region .svelte-kit/adapter-bun/manifest.js
const manifest = (() => {
	function __memo(fn) {
		let value;
		return () => value ??= value = fn();
	}
	return {
		appDir: "_app",
		appPath: "_app",
		assets: new Set([
			"apple-touch-icon.png",
			"favicon.png",
			"logo-white.png",
			"logo.png",
			"robots.txt"
		]),
		mimeTypes: {
			".png": "image/png",
			".txt": "text/plain"
		},
		_: {
			client: {
				start: "_app/immutable/entry/start.ColVFt-t.js",
				app: "_app/immutable/entry/app.Be2jj5rF.js",
				imports: [
					"_app/immutable/entry/start.ColVFt-t.js",
					"_app/immutable/chunks/BGDGJX9A.js",
					"_app/immutable/chunks/Cf-irfjs.js",
					"_app/immutable/chunks/Bws4SZbu.js",
					"_app/immutable/chunks/DWM5xL3m.js",
					"_app/immutable/entry/app.Be2jj5rF.js",
					"_app/immutable/chunks/Bws4SZbu.js",
					"_app/immutable/chunks/DWM5xL3m.js",
					"_app/immutable/chunks/DsnmJJEf.js",
					"_app/immutable/chunks/Cf-irfjs.js",
					"_app/immutable/chunks/CVudaATA.js",
					"_app/immutable/chunks/DDzH388f.js",
					"_app/immutable/chunks/DJoCdHo2.js"
				],
				stylesheets: [],
				fonts: [],
				uses_env_dynamic_public: false
			},
			nodes: [
				__memo(() => import("./chunks/0-DkXIaL52.js")),
				__memo(() => import("./chunks/1-4O6oNNS8.js")),
				__memo(() => import("./chunks/2-5YhcFUp9.js")),
				__memo(() => import("./chunks/3-DybJfzAC.js")),
				__memo(() => import("./chunks/4-DjRuN6v9.js")),
				__memo(() => import("./chunks/5-pcj7rYTA.js")),
				__memo(() => import("./chunks/6-C9OuF1z9.js")),
				__memo(() => import("./chunks/7-SEUIRFb4.js")),
				__memo(() => import("./chunks/8-1X9UfmGJ.js")),
				__memo(() => import("./chunks/9-Bj0NaibV.js")),
				__memo(() => import("./chunks/10-klwmt_7Q.js")),
				__memo(() => import("./chunks/11-DCc5HUnu.js")),
				__memo(() => import("./chunks/12-DU1JPg8_.js")),
				__memo(() => import("./chunks/13-bwIxM727.js")),
				__memo(() => import("./chunks/14-DPt1mKI5.js")),
				__memo(() => import("./chunks/15-BZrRdeWS.js")),
				__memo(() => import("./chunks/16-DKtS-7pS.js")),
				__memo(() => import("./chunks/17-DZR47_mQ.js")),
				__memo(() => import("./chunks/18-G4JlCk0b.js"))
			],
			remotes: {},
			routes: [
				{
					id: "/",
					pattern: /^\/$/,
					params: [],
					page: {
						layouts: [0],
						errors: [1],
						leaf: 2
					},
					endpoint: null
				},
				{
					id: "/analytics",
					pattern: /^\/analytics\/?$/,
					params: [],
					page: {
						layouts: [0],
						errors: [1],
						leaf: 3
					},
					endpoint: null
				},
				{
					id: "/auth/google",
					pattern: /^\/auth\/google\/?$/,
					params: [],
					page: null,
					endpoint: __memo(() => import("./chunks/_server.ts-SlkNyztS.js"))
				},
				{
					id: "/auth/google/callback",
					pattern: /^\/auth\/google\/callback\/?$/,
					params: [],
					page: null,
					endpoint: __memo(() => import("./chunks/_server.ts-kOLaPDJw.js"))
				},
				{
					id: "/forgot-password",
					pattern: /^\/forgot-password\/?$/,
					params: [],
					page: {
						layouts: [0],
						errors: [1],
						leaf: 4
					},
					endpoint: null
				},
				{
					id: "/insights",
					pattern: /^\/insights\/?$/,
					params: [],
					page: {
						layouts: [0],
						errors: [1],
						leaf: 5
					},
					endpoint: null
				},
				{
					id: "/insights/drafts",
					pattern: /^\/insights\/drafts\/?$/,
					params: [],
					page: {
						layouts: [0],
						errors: [1],
						leaf: 7
					},
					endpoint: null
				},
				{
					id: "/insights/export",
					pattern: /^\/insights\/export\/?$/,
					params: [],
					page: null,
					endpoint: __memo(() => import("./chunks/_server.ts-DsK97Jyx.js"))
				},
				{
					id: "/insights/more",
					pattern: /^\/insights\/more\/?$/,
					params: [],
					page: null,
					endpoint: __memo(() => import("./chunks/_server.ts-md57myN4.js"))
				},
				{
					id: "/insights/[id]",
					pattern: /^\/insights\/([^/]+?)\/?$/,
					params: [{
						"name": "id",
						"optional": false,
						"rest": false,
						"chained": false
					}],
					page: {
						layouts: [0],
						errors: [1],
						leaf: 6
					},
					endpoint: null
				},
				{
					id: "/invite/[token]",
					pattern: /^\/invite\/([^/]+?)\/?$/,
					params: [{
						"name": "token",
						"optional": false,
						"rest": false,
						"chained": false
					}],
					page: {
						layouts: [0],
						errors: [1],
						leaf: 8
					},
					endpoint: null
				},
				{
					id: "/login",
					pattern: /^\/login\/?$/,
					params: [],
					page: {
						layouts: [0],
						errors: [1],
						leaf: 9
					},
					endpoint: null
				},
				{
					id: "/logout",
					pattern: /^\/logout\/?$/,
					params: [],
					page: {
						layouts: [0],
						errors: [1],
						leaf: 10
					},
					endpoint: null
				},
				{
					id: "/pricing",
					pattern: /^\/pricing\/?$/,
					params: [],
					page: {
						layouts: [0],
						errors: [1],
						leaf: 11
					},
					endpoint: null
				},
				{
					id: "/register",
					pattern: /^\/register\/?$/,
					params: [],
					page: {
						layouts: [0],
						errors: [1],
						leaf: 12
					},
					endpoint: null
				},
				{
					id: "/reset-password/[token]",
					pattern: /^\/reset-password\/([^/]+?)\/?$/,
					params: [{
						"name": "token",
						"optional": false,
						"rest": false,
						"chained": false
					}],
					page: {
						layouts: [0],
						errors: [1],
						leaf: 13
					},
					endpoint: null
				},
				{
					id: "/search",
					pattern: /^\/search\/?$/,
					params: [],
					page: {
						layouts: [0],
						errors: [1],
						leaf: 14
					},
					endpoint: null
				},
				{
					id: "/settings",
					pattern: /^\/settings\/?$/,
					params: [],
					page: {
						layouts: [0],
						errors: [1],
						leaf: 15
					},
					endpoint: null
				},
				{
					id: "/settings/account",
					pattern: /^\/settings\/account\/?$/,
					params: [],
					page: {
						layouts: [0],
						errors: [1],
						leaf: 16
					},
					endpoint: null
				},
				{
					id: "/settings/members",
					pattern: /^\/settings\/members\/?$/,
					params: [],
					page: {
						layouts: [0],
						errors: [1],
						leaf: 17
					},
					endpoint: null
				},
				{
					id: "/settings/org",
					pattern: /^\/settings\/org\/?$/,
					params: [],
					page: {
						layouts: [0],
						errors: [1],
						leaf: 18
					},
					endpoint: null
				},
				{
					id: "/sse/ask",
					pattern: /^\/sse\/ask\/?$/,
					params: [],
					page: null,
					endpoint: __memo(() => import("./chunks/_server.ts-DD3aCnZI.js"))
				}
			],
			prerendered_routes: /* @__PURE__ */ new Set([]),
			matchers: async () => {
				return {};
			},
			server_assets: {}
		}
	};
})();
const prerendered = /* @__PURE__ */ new Set([]);
const base = "";

//#endregion
export { base, manifest, prerendered };
//# sourceMappingURL=manifest.js.map