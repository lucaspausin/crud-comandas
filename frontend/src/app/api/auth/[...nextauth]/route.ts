/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth, { DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";

const authOptions: NextAuthOptions = {
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				nombre_usuario: {
						label: "nombre_usuario",
						type: "text",
						placeholder: "nombre_usuario",
				},
				email: {
						label: "email",
						type: "text",
						placeholder: "email",
				},
				contrase_a: { label: "contrase_a", type: "password" },
			},
			async authorize(credentials) {
				try {
					const res = await fetch(
						`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
						{
							method: "POST",
							body: JSON.stringify({
								email: credentials?.email,
								nombre_usuario: credentials?.nombre_usuario,
								contrase_a: credentials?.contrase_a,
							}),
							headers: { "Content-Type": "application/json" },
						}
					);

					const user = await res.json();

					if (!res.ok) {
						throw new Error(user.message || "Error en la autenticación");
					}

					return {
						id: user.id,
						email: user.email,
						nombre_usuario: user.nombre_usuario,
						role_id: user.role,
						token: user.token,
					};
				} catch (error) {
					console.error("Auth error:", error);
					throw error;
				}
			},
		}),
	],
	secret: process.env.NEXTAUTH_SECRET,
	callbacks: {
		async jwt({ token, user, trigger }) {
			if (trigger === "signIn" && user) {
				token.id = Number(user.id);
				token.email = String(user.email);
				token.role = Number(user.role_id);
				token.nombre_usuario = String(user.nombre_usuario);
				token.token = String(user.token);
			}
			return token;
		},
		async session({ session, token }): Promise<DefaultSession | any> {
			if (!token.id) {
				return session;
			}
			
			return {
				...session,
				user: {
					id: Number(token.id),
					email: String(token.email),
					role: Number(token.role),
					nombre_usuario: String(token.nombre_usuario),
					token: String(token.token),
					exp: token.exp ? Number(token.exp) : undefined
				}
			};
		},
	},
	session: {
		strategy: "jwt",
		maxAge: 30 * 24 * 60 * 60,
		updateAge: 24 * 60 * 60,
	},
	pages: {
		signIn: "/login",
	},
	events: {
		async signIn({ user }) {
			if (!user.id || !user.email || !user.role_id) {
				throw new Error('Datos de usuario incompletos');
			}
		},
	},
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
