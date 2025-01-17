import SessionAuthProvider from "@/context/SessionAuthProvider";

import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Motorgas - Referidos",
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
				<div
					className="absolute inset-x-0 top-[-10rem] -z-0 transform-gpu overflow-hidden blur-3xl sm:top-[-20rem] pointer-events-none"
					aria-hidden="true"
				>
					<div
						className="relative left-1/2 -z-10 aspect-[1155/678] w-[36.125rem] max-w-none -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#00008B] to-[#3636a3] opacity-5 sm:left-[calc(50%-40rem)] sm:w-[72.1875rem]"
						style={{
							clipPath:
								"polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
						}}
					></div>
				</div>
				<SessionAuthProvider>{children}</SessionAuthProvider>
			</body>
		</html>
	);
}
