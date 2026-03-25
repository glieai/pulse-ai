import type { AuthContext } from "./auth";

export type AppEnv = {
	Variables: {
		auth: AuthContext;
	};
};
