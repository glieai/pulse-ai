import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

// Registration is invite-only in team mode. Redirect to login.
export const load: PageServerLoad = async ({ locals }) => {
	if (locals.soloMode) redirect(302, "/insights");
	redirect(302, "/login");
};
