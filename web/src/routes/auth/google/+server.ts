import { redirect } from "@sveltejs/kit";
import { Google, generateCodeVerifier, generateState } from "arctic";
import type { RequestHandler } from "./$types";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? "";
const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:5173";

export const GET: RequestHandler = async ({ cookies }) => {
	if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
		return new Response("Google OAuth is not configured", { status: 501 });
	}

	const google = new Google(
		GOOGLE_CLIENT_ID,
		GOOGLE_CLIENT_SECRET,
		`${FRONTEND_URL}/auth/google/callback`,
	);

	const state = generateState();
	const codeVerifier = generateCodeVerifier();

	const url = google.createAuthorizationURL(state, codeVerifier, ["openid", "email", "profile"]);

	cookies.set("google_oauth_state", state, {
		path: "/",
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		maxAge: 60 * 10, // 10 minutes
	});

	cookies.set("google_oauth_verifier", codeVerifier, {
		path: "/",
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		maxAge: 60 * 10,
	});

	redirect(302, url.toString());
};
