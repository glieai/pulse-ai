//#region .svelte-kit/adapter-bun/entries/hooks.server.js
const SOLO_ORG_ID = "00000000-0000-0000-0000-000000000001";
const SOLO_USER_ID = "00000000-0000-0000-0000-000000000002";
const SOLO_USER_NAME = "Solo User";
const SOLO_USER_EMAIL = "solo@localhost";
const SOLO_MODE = (process.env.PULSE_MODE ?? "solo") === "solo";
function decodeJwtPayload(token) {
	try {
		const parts = token.split(".");
		if (parts.length !== 3) return null;
		const payload = JSON.parse(atob(parts[1]));
		if (typeof payload.exp === "number" && payload.exp < Date.now() / 1e3) return null;
		return payload;
	} catch {
		return null;
	}
}
const handle = async ({ event, resolve }) => {
	event.locals.soloMode = SOLO_MODE;
	if (SOLO_MODE) {
		event.locals.user = {
			id: SOLO_USER_ID,
			org_id: SOLO_ORG_ID,
			name: SOLO_USER_NAME,
			email: SOLO_USER_EMAIL,
			role: "owner"
		};
		event.locals.token = "solo-mode";
		return resolve(event);
	}
	const token = event.cookies.get("pulse_jwt");
	if (token) {
		const payload = decodeJwtPayload(token);
		if (payload && typeof payload.user_id === "string" && typeof payload.org_id === "string") {
			event.locals.user = {
				id: payload.user_id,
				org_id: payload.org_id,
				name: payload.name || "",
				email: payload.email || "",
				role: payload.role || "member"
			};
			event.locals.token = token;
		} else {
			event.cookies.delete("pulse_jwt", { path: "/" });
			event.locals.user = null;
			event.locals.token = null;
		}
	} else {
		event.locals.user = null;
		event.locals.token = null;
	}
	return resolve(event);
};

//#endregion
export { handle };
//# sourceMappingURL=hooks.server-BQHc9Tjv.js.map