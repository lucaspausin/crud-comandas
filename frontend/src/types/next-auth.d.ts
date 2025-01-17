import "next-auth";
import type { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
	interface Session {
		user: {
			id: number;
			email: string;
			role: number;
			nombre_usuario: string;
			token: string;
		} & DefaultSession["user"];
	}

	interface User extends DefaultUser {
		id: number;
		email: string;
		role_id: number;
		nombre_usuario: string;
		token: string;
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		id?: number;
		email?: string;
		role?: number;
		nombre_usuario?: string;
		token?: string;
	}
}
