"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import Link from "next/link";
import Image from "next/image";
import myImage from "@/public/motorgas2.svg";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
	const [errors, setErrors] = useState([]);
	const [email, setEmail] = useState("");
	const [contrase_a, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	useEffect(() => {
		document.title = "Motorgas - Iniciar Sesión";
	}, []);
	const handleSubmit = async (event) => {
		event.preventDefault();
		setErrors([]);
		setLoading(true);

		const responseNextAuth = await signIn("credentials", {
			email,
			contrase_a,
			redirect: false,
		});

		if (responseNextAuth?.error) {
			if (responseNextAuth.error === "Unauthorized") {
				setErrors(["Credenciales incorrectas."]);
			} else {
				setErrors([responseNextAuth.error]);
			}
			setLoading(false);
			return;
		}

		router.push("/dashboard");
		router.refresh();
		setLoading(false);
	};

	// const handleGoogleLogin = async () => {
	// 	try {
	// 		setLoading(true);
	// 		const result = await signIn("google", {
	// 			redirect: true,
	// 			callbackUrl: "/dashboard",
	// 		});

	// 		if (result?.error) {
	// 			setErrors(["Error al iniciar sesión con Google"]);
	// 		}
	// 	} catch (error) {
	// 		console.error("Error during Google login:", error);
	// 		setErrors(["Error al iniciar sesión con Google"]);
	// 	} finally {
	// 		setLoading(false);
	// 	}
	// };

	return (
		<div className="flex items-center justify-center min-h-[80vh] p-6 lg:px-8 xl:px-8 bg-zinc-50">
			<Card className="w-full max-w-md rounded-xl shadow-lg border-none">
				<CardHeader className="flex flex-row items-center gap-4">
					<Image
						src={myImage}
						alt="Descripción de la imagen"
						className="w-14 h-14 object-contain opacity-90 mt-2"
						loading="eager"
					/>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={handleSubmit}
						className="space-y-6 flex flex-col gap-4"
					>
						<div className="flex flex-col gap-4">
							<div className="space-y-4">
								<Label
									htmlFor="email"
									className="text-sm font-normal text-zinc-700"
								>
									Correo Electrónico
								</Label>
								<Input
									type="email"
									placeholder="16kkarter@gmail.com"
									name="email"
									className="rounded-full"
									value={email}
									onChange={(event) => setEmail(event.target.value)}
								/>
							</div>
							<div className="space-y-4">
								<Label
									htmlFor="contrase_a"
									className="text-sm font-normal text-zinc-700"
								>
									Contraseña
								</Label>
								<Input
									type="password"
									placeholder="@!adH2s"
									name="contrase_a"
									className="rounded-full"
									value={contrase_a}
									onChange={(event) => setPassword(event.target.value)}
								/>
							</div>
						</div>
						<Button
							type="submit"
							className="w-full rounded-sm"
							disabled={loading}
						>
							{loading ? (
								<div className="flex items-center gap-2">
									<Loader2 className="animate-spin w-4 h-4" />
									Por favor, espera
								</div>
							) : (
								"Iniciar Sesión"
							)}
						</Button>
					</form>

					{/* <div className="relative my-6">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-t border-gray-300"></div>
						</div>
						<div className="relative flex justify-center text-sm">
							<span className="px-2 bg-white text-gray-500">
								O continúa con
							</span>
						</div>
					</div> */}

					{/* <Button
						type="button"
						variant="outline"
						className="w-full flex items-center justify-center gap-2 rounded-sm"
						onClick={handleGoogleLogin}
					>
						<Image
							src="/google.svg"
							alt="Google"
							width={20}
							height={20}
							className="w-5 h-5"
						/>
						Continuar con Google
					</Button> */}

					{errors.length > 0 && (
						<div className="my-4 px-2 py-2 text-center text-sm bg-red-100 text-red-500 rounded-sm">
							<ul className="mb-0">
								{errors.map((error) => (
									<li key={error}>{error}</li>
								))}
							</ul>
						</div>
					)}
					{/* <div className="mt-6 text-center text-sm text-zinc-600">
						¿No tienes una cuenta?{" "}
						<Link href="/register" className="text-blue-600 hover:underline">
							Regístrate
						</Link>
					</div> */}
				</CardContent>
			</Card>
		</div>
	);
}
