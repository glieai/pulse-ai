declare global {
	namespace App {
		interface Locals {
			user: {
				id: string;
				org_id: string;
				name: string;
				email: string;
				role: string;
			} | null;
			token: string | null;
			soloMode: boolean;
		}
	}
}

export {};
