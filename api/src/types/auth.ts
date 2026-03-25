export interface JwtPayload {
	user_id: string;
	org_id: string;
	role: string;
	name: string;
	is_super_admin?: boolean;
	exp: number;
	iat: number;
}

export interface AuthContext {
	user_id: string;
	org_id: string;
	role: string;
	author_name: string;
	is_super_admin?: boolean;
}
