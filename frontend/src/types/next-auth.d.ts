import "next-auth";

declare module "next-auth" {
	interface Session {
		user: {
			id: number;
			email: string;
			token: string;
			role: number;
			exp?: number;
			nombre_usuario: string;
		};
	}

	interface User {
		id: number;
		email: string;
		token: string;
		role_id: number;
		nombre_usuario: string;
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		id?: number;
		email?: string;
		role?: number;
		nombre_usuario?: string;
		token?: string;
		exp?: number;
	}
}
