import { apiPost } from "$lib/api";
import { redirect } from "@sveltejs/kit";
import { Google } from "arctic";
import type { RequestHandler } from "./$types";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? "";
const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:5173";

export const GET: RequestHandler = async ({ url, cookies, fetch }) => {
	const code = url.searchParams.get("code");
	const state = url.searchParams.get("state");
	const storedState = cookies.get("google_oauth_state");
	const storedVerifier = cookies.get("google_oauth_verifier");

	// Clean up OAuth cookies
	cookies.delete("google_oauth_state", { path: "/" });
	cookies.delete("google_oauth_verifier", { path: "/" });

	if (!code || !state || !storedState || !storedVerifier || state !== storedState) {
		redirect(302, "/login?error=oauth_invalid_state");
	}

	const google = new Google(
		GOOGLE_CLIENT_ID,
		GOOGLE_CLIENT_SECRET,
		`${FRONTEND_URL}/auth/google/callback`,
	);

	try {
		const tokens = await google.validateAuthorizationCode(code, storedVerifier);
		const accessToken = tokens.accessToken();

		// Get user info from Google
		const userInfoRes = await globalThis.fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
			headers: { Authorization: `Bearer ${accessToken}` },
		});

		if (!userInfoRes.ok) {
			redirect(302, "/login?error=oauth_userinfo_failed");
		}

		const googleUser = (await userInfoRes.json()) as {
			sub: string;
			email: string;
			name: string;
		};

		// Exchange Google identity for a Pulse JWT via the API
		const result = await apiPost<{ token: string; user: { name: string } }>(
			fetch,
			"/api/auth/google-login",
			{
				google_id: googleUser.sub,
				email: googleUser.email,
				name: googleUser.name,
			},
		);

		cookies.set("pulse_jwt", result.token, {
			path: "/",
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 60 * 60 * 24,
		});

		redirect(302, "/insights");
	} catch (err) {
		const message = err instanceof Error ? err.message : "Unknown error";
		if (message.includes("No account found")) {
			redirect(302, "/login?error=oauth_no_account");
		}
		// Re-throw redirects
		if (
			err &&
			typeof err === "object" &&
			"status" in err &&
			(err as { status: number }).status >= 300 &&
			(err as { status: number }).status < 400
		) {
			throw err;
		}
		console.error("Google OAuth callback failed:", message);
		redirect(302, "/login?error=oauth_failed");
	}
};
