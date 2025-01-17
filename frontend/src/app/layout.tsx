import SessionAuthProvider from "@/context/SessionAuthProvider";

import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Motorgas - Comandas",
	description: "Sistema de gestión de comandas",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="es">
			<link rel="icon" href="/favicon.ico" sizes="any" />
			<body className={inter.className} suppressHydrationWarning={true}>
				<p className="text-xs text-zinc-500 font-light fixed top-2 right-2 z-[9999]">
					v1.2.2
				</p>
				<SessionAuthProvider>{children}</SessionAuthProvider>
			</body>
		</html>
	);
}
