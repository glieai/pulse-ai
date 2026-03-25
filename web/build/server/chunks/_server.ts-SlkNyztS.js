import { i as redirect } from "./exports-DwueHvwd.js";
import { Google, generateCodeVerifier, generateState } from "arctic";

//#region .svelte-kit/adapter-bun/entries/endpoints/auth/google/_server.ts.js
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? "";
const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:5173";
const GET = async ({ cookies }) => {
	if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) return new Response("Google OAuth is not configured", { status: 501 });
	const google = new Google(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, `${FRONTEND_URL}/auth/google/callback`);
	const state = generateState();
	const codeVerifier = generateCodeVerifier();
	const url = google.createAuthorizationURL(state, codeVerifier, [
		"openid",
		"email",
		"profile"
	]);
	cookies.set("google_oauth_state", state, {
		path: "/",
		httpOnly: true,
		secure: false,
		sameSite: "lax",
		maxAge: 600
	});
	cookies.set("google_oauth_verifier", codeVerifier, {
		path: "/",
		httpOnly: true,
		secure: false,
		sameSite: "lax",
		maxAge: 600
	});
	redirect(302, url.toString());
};

//#endregion
export { GET };
//# sourceMappingURL=_server.ts-SlkNyztS.js.map