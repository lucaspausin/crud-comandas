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
	callbacks: {
		async jwt({ token, user }) {
			return { ...token, ...user };
		},
		async session({ session, token }) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			session.user = token as any;
			return session;
		},
	},
	pages: {
		signIn: "/login",
	},
});

export { handler as GET, handler as POST };
