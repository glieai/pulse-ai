import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, cookies }) => {
	if (locals.soloMode) {
		redirect(302, "/insights");
	}

	cookies.delete("pulse_jwt", { path: "/" });
	redirect(302, "/login");
};
