"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import myImage from "@/public/motorgas2.svg";

// import { useRouter } from "next/navigation";

export default function RegisterPage() {
	const [errors, setErrors] = useState([]);
	const [email, setEmail] = useState("");
	const [nombre_usuario, setUsername] = useState("");
	const [contrase_a, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const router = useRouter();
	// const router = useRouter();
	useEffect(() => {
		document.title = "Motorgas - Registrarse";
	}, []);
	const handleUsernameChange = (e) => {
		const formattedUsername = e.target.value.toLowerCase().replace(/\s+/g, "");
		setUsername(formattedUsername);
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		setErrors([]);

		if (contrase_a !== confirmPassword) {
			setErrors(["Las contraseñas no coinciden."]);
			return;
		}

		const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				email,
				nombre_usuario,
				contrase_a,
				role_id: 1,
			}),
		});

		const responseAPI = await res.json();

		if (!res.ok) {
			setErrors(
				Array.isArray(responseAPI.message)
					? responseAPI.message
					: [responseAPI.message]
			);
			return;
		}

		const responseNextAuth = await signIn("credentials", {
			email,
			contrase_a,
			redirect: false,
		});

		if (responseNextAuth?.error) {
			setErrors(responseNextAuth.error.split(","));
			return;
		}

		router.push("/dashboard");
		router.refresh();
	};

	return (
		<div className="flex items-center justify-center min-h-[80vh] bg-zinc-50">
			<Card className="w-full max-w-md rounded-xl shadow-lg border-none">
				<CardHeader>
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
									htmlFor="nombre_usuario"
									className="text-sm font-normal text-zinc-700"
								>
									Nombre de Usuario
								</Label>
								<Input
									id="nombre_usuario"
									type="text"
									placeholder="16kkarter"
									className="rounded-full"
									value={nombre_usuario}
									onChange={handleUsernameChange}
									required
								/>
							</div>
							<div className="space-y-4">
								<Label
									htmlFor="email"
									className="text-sm font-normal text-zinc-700"
								>
									Correo Electrónico
								</Label>
								<Input
									id="email"
									type="email"
									placeholder="tu@email.com"
									className="rounded-full"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
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
									id="contrase_a"
									type="password"
									placeholder="••••••••"
									className="rounded-full"
									value={contrase_a}
									onChange={(e) => setPassword(e.target.value)}
									required
								/>
							</div>
							<div className="space-y-4">
								<Label
									htmlFor="confirmPassword"
									className="text-sm font-normal text-zinc-700"
								>
									Confirmar Contraseña
								</Label>
								<Input
									id="confirmPassword"
									type="password"
									placeholder="••••••••"
									className="rounded-full"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									required
								/>
							</div>
						</div>

						<Button type="submit" className="w-full rounded-full">
							Registrarse
						</Button>
					</form>
					{errors.length > 0 && (
						<div className="my-4 px-2 py-2 text-center text-sm bg-red-200 text-red-600 rounded-full">
							<ul className="mb-0">
								{errors.map((error) => (
									<li key={error}>{error}</li>
								))}
							</ul>
						</div>
					)}
					<div className="mt-6 text-center text-sm text-zinc-600">
						¿Ya tienes una cuenta?{" "}
						<Link href="/login" className="text-blue-600 hover:underline">
							Inicia Sesión
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
