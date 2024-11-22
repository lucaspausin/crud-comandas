import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
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
				console.log(user);

				if (!res.ok || user.error) {
					throw new Error(user.error || "Error en la autenticación");
				}

				return user;
			},
		}),
	],
	secret: process.env.NEXTAUTH_SECRET,
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				return {
					...token,
					...user,
					exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // 30 días
				};
			}
			return token;
		},
		async session({ session, token }) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			session.user = {
				...token,
				email: token.email as string,
				role: token.role as string,
				token: token.token as string,
				exp: token.exp as number,
			};
			return session;
		},
	},
	session: {
		strategy: "jwt",
		maxAge: 30 * 24 * 60 * 60, // 30 días
	},
	pages: {
		signIn: "/login",
	},
});

export { handler as GET, handler as POST };
