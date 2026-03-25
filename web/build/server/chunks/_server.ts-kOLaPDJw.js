import { i as redirect } from "./exports-DwueHvwd.js";
import { a as apiPost } from "./api-D4JXw0uZ.js";
import { Google } from "arctic";

//#region .svelte-kit/adapter-bun/entries/endpoints/auth/google/callback/_server.ts.js
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? "";
const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:5173";
const GET = async ({ url, cookies, fetch }) => {
	const code = url.searchParams.get("code");
	const state = url.searchParams.get("state");
	const storedState = cookies.get("google_oauth_state");
	const storedVerifier = cookies.get("google_oauth_verifier");
	cookies.delete("google_oauth_state", { path: "/" });
	cookies.delete("google_oauth_verifier", { path: "/" });
	if (!code || !state || !storedState || !storedVerifier || state !== storedState) redirect(302, "/login?error=oauth_invalid_state");
	const google = new Google(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, `${FRONTEND_URL}/auth/google/callback`);
	try {
		const accessToken = (await google.validateAuthorizationCode(code, storedVerifier)).accessToken();
		const userInfoRes = await globalThis.fetch("https://www.googleapis.com/oauth2/v3/userinfo", { headers: { Authorization: `Bearer ${accessToken}` } });
		if (!userInfoRes.ok) redirect(302, "/login?error=oauth_userinfo_failed");
		const googleUser = await userInfoRes.json();
		const result = await apiPost(fetch, "/api/auth/google-login", {
			google_id: googleUser.sub,
			email: googleUser.email,
			name: googleUser.name
		});
		cookies.set("pulse_jwt", result.token, {
			path: "/",
			httpOnly: true,
			secure: false,
			sameSite: "lax",
			maxAge: 3600 * 24
		});
		redirect(302, "/insights");
	} catch (err) {
		const message = err instanceof Error ? err.message : "Unknown error";
		if (message.includes("No account found")) redirect(302, "/login?error=oauth_no_account");
		if (err && typeof err === "object" && "status" in err && err.status >= 300 && err.status < 400) throw err;
		console.error("Google OAuth callback failed:", message);
		redirect(302, "/login?error=oauth_failed");
	}
};

//#endregion
export { GET };
//# sourceMappingURL=_server.ts-kOLaPDJw.js.map