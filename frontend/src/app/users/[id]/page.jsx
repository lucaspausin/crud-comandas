"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
// import { Camera } from "lucide-react";
import axios from "axios";
import HomeIcon from "@/components/HomeIcon";
import Aside from "@/components/Aside";
import ToastNotification from "@/components/ToastNotification";
import { motion } from "framer-motion";
import myImage2 from "@/public/motorgas2.svg";
// import userDefault from "@/public/userdefault.webp";
import { useRouter } from "next/navigation";
import { getUser } from "../../reservations/reservations.api";

export default function UserDetailPage({ params }) {
	const router = useRouter();

	const [userDate, setUserDate] = useState(null);
	const [newPassword, setNewPassword] = useState(""); // Nuevo campo para la nueva contraseña
	const [confirmPassword, setConfirmPassword] = useState("");
	// const fileInputRef = useRef(null);
	const [user, setUser] = useState({
		nombre_usuario: "",
		email: "",
		contrase_a: "",
		cover_image: "/placeholder.svg",
		role: 2,
	});
	const [showToast, setShowToast] = useState("");
	const [loading, setLoading] = useState(true);

	// Cargar datos del usuario con una solicitud GET
	useEffect(() => {
		const fetchUser = async () => {
			setLoading(true);
			try {
				const data = await getUser(params.id);
				setUser(data); // Cambiar a 'setUser' para que la info se mapee a 'user'
				setUserDate(data);
				await new Promise((resolve) => setTimeout(resolve, 250));
			} finally {
				setLoading(false);
			}
		};

		fetchUser();
	}, [params.id]);

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		const formattedValue =
			name === "nombre_usuario"
				? value
						.toLowerCase()
						.replace(/\s+/g, "")
						.replace(/[^a-z0-9]/g, "") // Filtra caracteres especiales
				: value;

		setUser((prevUser) => ({
			...prevUser,
			[name]: formattedValue,
		}));
	};

	// const handleImageClick = () => {
	// 	fileInputRef.current.click();
	// };

	// const handleImageChange = (e) => {
	// 	const file = e.target.files[0];
	// 	if (file) {
	// 		const reader = new FileReader();
	// 		reader.onloadend = () => {
	// 			setUser((prevUser) => ({
	// 				...prevUser,
	// 				cover_image: reader.result,
	// 			}));
	// 		};
	// 		reader.readAsDataURL(file);
	// 	}
	// };

	const handleSubmit = async (e) => {
		e.preventDefault();
		const updates = Object.keys(user).reduce((acc, key) => {
			if (user[key] && user[key] !== userDate[key]) {
				acc[key] = user[key];
			}
			return acc;
		}, {});

		// Manejo de la contraseña
		if (newPassword) {
			if (newPassword !== confirmPassword) {
				alert("Las contraseñas no coinciden.");
				return;
			}
			updates.contrase_a = newPassword; // Solo se incluye si se establece una nueva contraseña
		}

		if (Object.keys(updates).length > 0) {
			try {
				const id = params.id; // Obtiene el ID de los parámetros
				await axios.patch(
					`${process.env.NEXT_PUBLIC_API_URL}/api/users/${id}`,
					updates
				);
				const successMessage = "Usuario actualizado exitosamente.";
				setShowToast(successMessage);
				router.refresh();
				// Recargar datos del usuario después de actualizar
				const updatedUser = await getUser(id);
				setUser(updatedUser);
				setUserDate(updatedUser); // Asegura que 'userDate' también se actualice
				// Restablece los campos de la contraseña
				setNewPassword("");
				setConfirmPassword("");
			} catch (error) {
				console.error("Error al actualizar el usuario:", error);
			}
		} else {
			console.log("No hay cambios para actualizar.");
		}
	};

	return (
		<div className="flex bg-zinc-50">
			{loading ? (
				<div className="flex flex-col items-center justify-center h-[80vh] mx-auto">
					<motion.div
						initial={{ opacity: 0 }} // Inicia como invisible
						animate={{
							opacity: [0, 1, 1, 0], // Entra y sale difuminada
							scale: [1, 1.05, 1], // Escala ligeramente hacia arriba y luego regresa
						}}
						transition={{
							duration: 0.75, // Duración del ciclo completo
							ease: "easeInOut", // Efecto de entrada/salida
							repeat: Infinity, // Repite infinitamente
						}}
					>
						<Image
							src={myImage2} // Asegúrate de que myImage esté definido
							alt="Descripción de la imagen"
							className="w-16 h-16 object-contain opacity-90"
							loading="eager"
							priority
						/>
					</motion.div>
				</div>
			) : (
				<>
					<Aside />
					<main className="flex flex-col w-full p-6">
						<div className="flex items-center justify-between mb-6">
							<div className="flex items-center gap-2">
								<HomeIcon label="Volver" />
								<h2 className="text-zinc-700 text-base">Perfil</h2>
							</div>
						</div>
						<Card className="rounded-xl bg-white border-none shadow-lg">
							<CardContent>
								<form onSubmit={handleSubmit} className="space-y-6">
									{/* <div className="flex justify-start">
										<div
											className="relative w-32 h-32 cursor-pointer"
											onClick={handleImageClick}
										>
											<Image
												src={user.cover_image || userDefault} // Usa userDefault si cover_image es null
												alt="Profile"
												fill
												style={{ objectFit: "cover" }}
												className="rounded-full object-cover"
												priority
												sizes="(max-width: 640px) 100vw, 640px"
											/>
											<div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2">
												<Camera className="w-5 h-5 text-white" />
											</div>
										</div>
										<input
											type="file"
											ref={fileInputRef}
											onChange={handleImageChange}
											className="hidden"
											accept="image/*"
										/>
									</div> */}

									<div>
										<Label className="text-sm font-normal text-zinc-700">
											Rol
										</Label>
										<p className="mt-1 text-zinc-600 text-sm">
											{user.role_id === 1
												? "Vendedor"
												: user.role_id === 2
												? "Técnico"
												: "Administrador"}
										</p>
									</div>
									<div className="space-y-4">
										<div>
											<Label
												htmlFor="nombre_usuario"
												className="text-sm font-normal text-zinc-700"
											>
												Nombre de Usuario
											</Label>
											<Input
												id="nombre_usuario"
												name="nombre_usuario"
												value={user.nombre_usuario}
												onChange={handleInputChange}
												className="rounded-full mt-1"
												autoComplete="nombre_usuario"
											/>
										</div>

										<div>
											<Label
												htmlFor="email"
												className="text-sm font-normal text-zinc-700"
											>
												Correo Electrónico
											</Label>
											<Input
												id="email"
												name="email"
												type="email"
												value={user.email}
												onChange={handleInputChange}
												className="rounded-full mt-1"
												autoComplete="email"
											/>
										</div>

										<div>
											<Label
												htmlFor="new_password"
												className="text-sm font-normal text-zinc-700"
											>
												Nueva Contraseña
											</Label>
											<Input
												id="new_password"
												name="new_password"
												type="password"
												value={newPassword}
												onChange={(e) => setNewPassword(e.target.value)}
												placeholder="Nueva Contraseña"
												className="rounded-full mt-1"
												autoComplete="new-password" // Añadido atributo autocomplete
											/>
										</div>

										<div>
											<Label
												htmlFor="confirm_password"
												className="text-sm font-normal text-zinc-700"
											>
												Confirmar Nueva Contraseña
											</Label>
											<Input
												id="confirm_password"
												name="confirm_password"
												type="password"
												value={confirmPassword}
												onChange={(e) => setConfirmPassword(e.target.value)}
												placeholder="Confirmar Nueva Contraseña"
												className="rounded-full mt-1"
												autoComplete="new-password" // Añadido atributo autocomplete
											/>
										</div>
									</div>

									<Button type="submit" className="w-full rounded-full">
										Guardar Cambios
									</Button>
								</form>
								<ToastNotification
									message={showToast}
									show={!!showToast}
									onClose={() => setShowToast("")}
									type={showToast.includes("Error") ? "error" : "success"} // Determina el tipo basado en el mensaje
								/>
							</CardContent>
						</Card>
					</main>
				</>
			)}
		</div>
	);
}
