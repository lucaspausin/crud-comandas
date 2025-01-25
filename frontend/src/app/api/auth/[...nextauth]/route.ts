/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";

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
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
			authorization: {
				params: {
					prompt: "select_account",
					access_type: "offline",
					response_type: "code",
				},
			},
		}),
	],
	secret: process.env.NEXTAUTH_SECRET,
	callbacks: {
		async signIn({ user, account }) {
			if (account?.provider === "google") {
				try {
					const registerResponse = await fetch(
						`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google/register`,
						{
							method: "POST",
							headers: {
								"Content-Type": "application/json",
							},
							body: JSON.stringify({
								email: user.email,
								nombre_usuario: user.name,
								cover_image: user.image,
							}),
						}
					);

					let data;

					if (registerResponse.status === 401) {
						const loginResponse = await fetch(
							`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google/callback`,
							{
								method: "POST",
								headers: {
									"Content-Type": "application/json",
								},
								body: JSON.stringify({
									email: user.email,
									nombre_usuario: user.name,
									cover_image: user.image,
								}),
							}
						);

						if (!loginResponse.ok) {
							return false;
						}

						data = await loginResponse.json();
					} else if (registerResponse.ok) {
						data = await registerResponse.json();
					} else {
						return false;
					}

					(user as any).id = Number(data.id);
					(user as any).role_id = Number(data.role);
					(user as any).token = String(data.token);

					return true;
				} catch (error) {
					console.error("Error en signIn callback:", error);
					return false;
				}
			}
			return true;
		},
		async jwt({ token, user, account }): Promise<JWT> {
			if (account && user) {
				token.id = Number(user.id);
				token.email = String(user.email);
				token.role = Number(user.role_id);
				token.nombre_usuario = String(user.nombre_usuario);
				token.token = String(user.token);
			}
			return token;
		},
		async session({ session, token }): Promise<Session> {
			return {
				...session,
				user: {
					...session.user,
					id: Number(token.id),
					email: String(token.email),
					role: Number(token.role),
					nombre_usuario: String(token.nombre_usuario),
					token: String(token.token),
				},
			};
		},
	},
	pages: {
		signIn: "/login",
		error: "/login",
	},
	session: {
		strategy: "jwt",
		maxAge: 365 * 24 * 60 * 60, // 1 año
		updateAge: 24 * 60 * 60, // Actualizar la sesión cada día
	},
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
