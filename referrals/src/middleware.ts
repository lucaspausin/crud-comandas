// export { default } from "next-auth/middleware";
import { withAuth } from "next-auth/middleware";

export default withAuth({
	pages: {
		signIn: "/login", // Redirige aquí si no está autenticado
	},
});

export const config = {
	matcher: [
		"/",
		"/dashboard/:path*",
		"/reservations/:path*",
		"/orders/:path*",
		"/add-order/:path*",
		"/add-technique/:path*",
		"/commands/:path*",
		"/users/:path*",
	],
};
