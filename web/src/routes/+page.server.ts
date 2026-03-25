import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, url }) => {
	if ((locals.soloMode || locals.user) && !url.searchParams.has("preview")) {
		redirect(302, "/insights");
	}

	return {};
};
