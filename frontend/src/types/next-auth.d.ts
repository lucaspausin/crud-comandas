import "next-auth";

declare module "next-auth" {
	interface Session {
		user: {
			email: string;
			token: string;
			role: string;
			exp?: number;
			id?: number;
			nombre_usuario?: string;
		};
	}
}
