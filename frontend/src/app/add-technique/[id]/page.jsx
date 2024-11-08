"use client";

import { useState, useEffect } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Aside from "@/components/Aside";
import HomeIcon from "@/components/HomeIcon";
import { Pencil } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import Image from "next/image";
import myImage from "@/public/motorgas2.svg";
import myImage3 from "@/public/auto1.jpg";
import myDetalle2 from "@/public/2.png";
import myDetalle3 from "@/public/3.png";
import myDetalle4 from "@/public/4.png";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ToastNotification from "@/components/ToastNotification";
// import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

import { getCommand, updateCommand, getTechnique } from "../../reservations/reservations.api";

export default function ComandaDetail({ params }) {
	const [showToast, setShowToast] = useState("");
	const { data: session } = useSession();
	const loggedUserId = session?.user?.id;

	const [comanda, setComanda] = useState(null);
	const [formData, setFormData] = useState({
		marca_vehiculo: "",
		modelo: "",
		anio: "",
		patente: "",
		dominio: "",
		color: "",
		observaciones_personales: "",
		observaciones_tecnicas: "",
	});

	const [checkData, setCheckData] = useState({
		perdidas_gas: false,
		cableado: false,
		nivel_agua: false,
		nivel_aceite: false,
		inspeccion_instalacion: false,
		funcionamiento_unidad: false,
		herramientas: false,
		otras_observaciones: "",
	});

	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchComanda = async () => {
			try {
				const data = await getCommand(params.id);
				setComanda(data);
				if (data.tecnica_id) {
					const tecnicaData = await getTechnique(data.tecnica_id);
					setFormData({
						marca_vehiculo: tecnicaData.marca_vehiculo,
						modelo: tecnicaData.modelo,
						anio: tecnicaData.anio,
						patente: tecnicaData.patente,
						dominio: tecnicaData.dominio,
						color: tecnicaData.color,
						observaciones_personales: tecnicaData.observaciones_personales,
						observaciones_tecnicas: tecnicaData.observaciones_tecnicas,
					});
				}
			} catch (err) {
				setError(err.message);
			}
		};
		fetchComanda();
	}, [params.id]);

	const handleInputChange = (field, value) => {
		let processedValue = value;
		if (typeof value === "string") {
			processedValue = value.toUpperCase();
		}
		setFormData((prevFormData) => ({
			...prevFormData,
			[field]: processedValue,
		}));
	};

	 const handleSubmitDetails = async (e) => {
			e.preventDefault();
			try {
				const dataToUpdate = {
					marca_vehiculo: formData.marca_vehiculo,
					modelo: formData.modelo,
					anio: formData.anio ? parseInt(formData.anio, 10) : null,
					patente: formData.patente,
					dominio: formData.dominio,
					color: formData.color,
					comanda_id: params.id,
					usuario_id: loggedUserId ? Number(loggedUserId) : null,
					observaciones_personales: formData.observaciones_personales,
					observaciones_tecnicas: formData.observaciones_tecnicas,
					estado: "pendiente",
				};

				if (comanda.tecnica_id) {
					await axios.patch(
						`${process.env.NEXT_PUBLIC_API_URL}/api/techniques/${comanda.tecnica_id}`,
						dataToUpdate,
						{
							headers: {
								"Content-Type": "application/json",
							},
						}
					);
				} else {
					await axios.post(
						`${process.env.NEXT_PUBLIC_API_URL}/api/techniques`,
						dataToUpdate,
						{
							headers: {
								"Content-Type": "application/json",
							},
						}
					);
				}

				setComanda((prevComanda) => ({ ...prevComanda, ...dataToUpdate }));

				const successMessage = "Edición de los detalles exitosa.";
				setShowToast(successMessage);
			} catch (error) {
				let responseErrorMessage = "Error al editar los detalles";
				if (error.response) {
					const { data } = error.response;
					responseErrorMessage = data.message;
				}
				console.log(responseErrorMessage);
				setShowToast(responseErrorMessage);
			}
		};

	const handleSubmitChecklist = async (e) => {
		e.preventDefault();
		try {
			const dataToUpdate = {
				perdidas_gas: checkData.perdidas_gas,
				cableado: checkData.cableado,
				nivel_agua: checkData.nivel_agua,
				nivel_aceite: checkData.nivel_aceite,
				inspeccion_instalacion: checkData.inspeccion_instalacion,
				funcionamiento_unidad: checkData.funcionamiento_unidad,
				herramientas: checkData.herramientas,
				otras_observaciones: checkData.otras_observaciones,
			};
			await updateCommand(params.id, dataToUpdate);
			setComanda((prevComanda) => ({ ...prevComanda, ...dataToUpdate }));

			const successMessage = "Edición del checklist exitosa.";
			setShowToast(successMessage);
		} catch (error) {
			let responseErrorMessage = "Error al editar el checklist";
			if (error.response) {
				const { data } = error.response;
				responseErrorMessage = data.message;
			}
			console.log(responseErrorMessage);
			setShowToast(responseErrorMessage);
		}
	};

	if (error) {
		return <div>Error: {error}</div>;
	}

	if (!comanda) {
		return (
			<div className="flex flex-col items-center justify-center h-[80vh] mx-auto">
				<motion.div
					initial={{ opacity: 0 }}
					animate={{
						opacity: [0, 1, 1, 0],
						scale: [1, 1.05, 1],
					}}
					transition={{
						duration: 0.75,
						ease: "easeInOut",
						repeat: Infinity,
					}}
				>
					<Image
						src={myImage}
						alt="Descripción de la imagen"
						className="w-16 h-16 object-contain opacity-90"
						loading="eager"
						priority
					/>
				</motion.div>
			</div>
		);
	}

	const camposClaveVacios = [
		comanda?.reductor_cod,
		comanda?.reductor_numero,
		comanda?.cilindro_1_cod,
		comanda?.cilindro_1_numero,
		comanda?.valvula_1_cod,
		comanda?.valvula_1_numero,
	].some((campo) => campo === null || campo === undefined || campo === "");

	const bordeClase = camposClaveVacios
		? "bg-white border border-red-300"
		: "bg-white border border-green-300";

	return (
		<div className="flex-1 bg-zinc-50">
			<Aside />
			<main className="flex flex-col items-stretch justify-normal p-6 z-50">
				<div className="flex items-center justify-between mb-6">
					<div className="flex items-center gap-2">
						<HomeIcon label="Volver"></HomeIcon>
						<h2 className="text-zinc-700 text-base">Comandas</h2>
					</div>
				</div>
				<div className="grid gap-6 w-full">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Card className="rounded-xl shadow-lg border-none">
							<CardHeader className="flex flex-row items-center w-full justify-between">
								<CardTitle className="text-xl font-light  text-zinc-800">
									Información General
								</CardTitle>
								<span
									className={`px-2 py-1 text-xs font-normal w-fit rounded-full ${
										comanda.estado === "en_proceso"
											? "bg-blue-100 text-blue-700"
											: comanda.estado === "completado"
											? "bg-green-100 text-green-700"
											: "bg-yellow-100 text-yellow-700"
									}`}
								>
									{comanda.estado === "en_proceso"
										? "En Proceso"
										: comanda.estado === "completado"
										? "Completada"
										: "Pendiente"}
								</span>
							</CardHeader>
							<CardContent>
								<dl className="grid grid-cols-2 gap-2 text-sm">
									<dt className="font-medium text-zinc-500">Comanda:</dt>
									<dd>{comanda.id}</dd>
									<dt className="font-medium text-zinc-500">Servicio:</dt>
									<dd>Instalación de GNC</dd>
									<dt className="font-medium text-zinc-500">Creado:</dt>
									<dd>
										{new Date(comanda.creado_en).toLocaleString("es-AR", {
											day: "2-digit",
											month: "2-digit",
											year: "numeric",
											hour: "2-digit",
											minute: "2-digit",
											hour12: false,
										})}
									</dd>
								</dl>
							</CardContent>
						</Card>
						<Card className="rounded-xl shadow-lg border-none">
							<CardHeader>
								<CardTitle className="text-xl font-light  text-zinc-800">
									Detalles del Cliente
								</CardTitle>
							</CardHeader>
							<CardContent>
								<dl className="grid grid-cols-2 gap-2 text-sm">
									<dt className="font-medium text-zinc-500">Nombre:</dt>
									<dd>{comanda.boletos_reservas.clientes.nombre_completo}</dd>
									<dt className="font-medium text-zinc-500">DNI:</dt>
									<dd>{comanda.boletos_reservas.clientes.dni}</dd>
									<dt className="font-medium text-zinc-500">Domicilio:</dt>
									<dd>{comanda.boletos_reservas.clientes.domicilio}</dd>
									<dt className="font-medium text-zinc-500">Localidad:</dt>
									<dd>{comanda.boletos_reservas.clientes.localidad}</dd>
									<dt className="font-medium text-zinc-500">Teléfono:</dt>
									<dd>
										+549{comanda.boletos_reservas.clientes.telefono}
										@s.whatsapp.net
									</dd>
								</dl>
							</CardContent>
						</Card>
					</div>
					<Card className="rounded-t-xl rounded-b-none shadow-lg border border-red-300">
						<form onSubmit={handleSubmitDetails}>
							<CardHeader>
								<CardTitle className="text-xl font-light text-zinc-800">
									Detalles del Vehículo
								</CardTitle>
							</CardHeader>
							<CardContent>
								<dl className="grid grid-cols-2 gap-6 text-sm">
									<div className="flex flex-col items-start gap-2">
										<dt className="font-medium text-zinc-500">Marca:</dt>
										<Input
											className="rounded-full bg-white focus-visible:ring-0"
											type="text"
											required
											value={formData.marca_vehiculo}
											onChange={(e) =>
												handleInputChange("marca_vehiculo", e.target.value)
											}
										/>
									</div>
									<div className="flex flex-col items-start gap-2">
										<dt className="font-medium text-zinc-500">Modelo:</dt>
										<Input
											className="rounded-full bg-white focus-visible:ring-0"
											type="text"
											required
											value={formData.modelo}
											onChange={(e) =>
												handleInputChange("modelo", e.target.value)
											}
										/>
									</div>
									<div className="flex flex-col items-start gap-2">
										<dt className="font-medium text-zinc-500">
											Año de fabricacion:
										</dt>
										<Input
											className="rounded-full bg-white focus-visible:ring-0"
											type="text"
											required
											value={formData.anio}
											onChange={(e) =>
												handleInputChange("anio", e.target.value)
											}
										/>
									</div>
									<div className="flex flex-col items-start gap-2">
										<dt className="font-medium text-zinc-500">Patente:</dt>
										<Input
											className="rounded-full bg-white focus-visible:ring-0"
											type="text"
											required
											value={formData.patente}
											onChange={(e) =>
												handleInputChange("patente", e.target.value)
											}
										/>
									</div>
									<div className="flex flex-col items-start gap-2">
										<dt className="font-medium text-zinc-500">Dominio:</dt>
										<Input
											className="rounded-full bg-white focus-visible:ring-0"
											type="text"
											required
											value={formData.dominio}
											onChange={(e) =>
												handleInputChange("dominio", e.target.value)
											}
										/>
									</div>
									<div className="flex flex-col items-start gap-2">
										<dt className="font-medium text-zinc-500">Color:</dt>
										<Input
											className="rounded-full bg-white focus-visible:ring-0"
											type="text"
											required
											value={formData.color}
											onChange={(e) =>
												handleInputChange("color", e.target.value)
											}
										/>
									</div>
									<div className="mb-4 flex flex-col gap-4 col-span-full">
										<Label
											htmlFor="observaciones_personales"
											className="font-medium text-zinc-500"
										>
											Observaciones personales
										</Label>
										<Textarea
											className="h-32"
											value={formData.observaciones_personales}
											id="observaciones_personales"
											name="observaciones_personales"
											onChange={(e) => {
												handleInputChange("observaciones_personales", e.target.value);
											}}
										/>
									</div>
								</dl>
							</CardContent>

							<CardHeader className="relative">
								<div className="flex items-center gap-4 w-full justify-between">
									<CardTitle className="text-xl font-light text-zinc-800">
										Detalles del Equipo
									</CardTitle>
								</div>
								{/* Icono condicional */}
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-2 items-center gap-6 text-sm">
									<div
										className="grid grid-cols-[auto,2fr] gap-2 border border-[#E4E4E7]
rounded-lg"
									>
										<Image
											src={myImage3}
											alt="Descripción de la imagen"
											className="w-56 h-full rounded-sm  object-contain opacity-90"
											loading="eager"
											priority
										/>
										<div className="flex flex-col gap-2 h-full  p-4">
											<div className="flex flex-row gap-2 items-center relative">
												<span className="absolute left-4 top-[50%] transform -translate-y-1/2">
													1
												</span>
												<Input
													className="rounded-full pl-8 items-center" // Agregar padding a la izquierda para el espacio
													value={formData.cuna || ""}
													onChange={(e) =>
														handleInputChange("cuna", e.target.value)
													}
												/>
											</div>
											<div className="flex flex-row gap-2 items-center relative">
												<span className="absolute left-4 top-1/2 transform -translate-y-1/2">
													2
												</span>
												<Input
													className="rounded-full pl-8 items-center"
													value={formData.cuna || ""}
													onChange={(e) =>
														handleInputChange("cuna", e.target.value)
													}
												/>
											</div>
											<div className="flex flex-row gap-2 items-center relative">
												<span className="absolute left-4 top-1/2 transform -translate-y-1/2">
													3
												</span>
												<Input
													className="rounded-full pl-8 items-center"
													value={formData.cuna || ""}
													onChange={(e) =>
														handleInputChange("cuna", e.target.value)
													}
												/>
											</div>
											<div className="flex flex-row gap-2 items-center relative">
												<span className="absolute left-4 top-1/2 transform -translate-y-1/2">
													4
												</span>
												<Input
													className="rounded-full pl-8 items-center"
													value={formData.cuna || ""}
													onChange={(e) =>
														handleInputChange("cuna", e.target.value)
													}
												/>
											</div>
											<div className="flex flex-row gap-2 items-center relative">
												<span className="absolute left-4 top-1/2 transform -translate-y-1/2">
													5
												</span>
												<Input
													className="rounded-full pl-8 items-center"
													value={formData.cuna || ""}
													onChange={(e) =>
														handleInputChange("cuna", e.target.value)
													}
												/>
											</div>
										</div>
									</div>
									<div className="grid grid-cols-[auto,2fr] gap-2 border border-[#E4E4E7]">
										<Image
											src={myDetalle2}
											alt="Descripción de la imagen"
											className="w-56 h-full rounded-sm object-contain opacity-90"
											loading="eager"
											priority
										/>
										<div className="flex flex-col gap-2 h-full p-4">
											<div className="flex flex-row gap-2 items-center relative">
												<span className="absolute left-4 top-1/2 transform -translate-y-1/2">
													6
												</span>
												<Input
													className="rounded-full pl-8 items-center"
													value={formData.cuna || ""}
													onChange={(e) =>
														handleInputChange("cuna", e.target.value)
													}
												/>
											</div>
											<div className="flex flex-row gap-2 items-center relative">
												<span className="absolute left-4 top-1/2 transform -translate-y-1/2">
													7
												</span>
												<Input
													className="rounded-full pl-8 items-center"
													value={formData.cuna || ""}
													onChange={(e) =>
														handleInputChange("cuna", e.target.value)
													}
												/>
											</div>
											<div className="flex flex-row gap-2 items-center relative">
												<span className="absolute left-4 top-1/2 transform -translate-y-1/2">
													8
												</span>
												<Input
													className="rounded-full pl-8 items-center"
													value={formData.cuna || ""}
													onChange={(e) =>
														handleInputChange("cuna", e.target.value)
													}
												/>
											</div>
											<div className="flex flex-row gap-2 items-center relative">
												<span className="absolute left-4 top-1/2 transform -translate-y-1/2">
													9
												</span>
												<Input
													className="rounded-full pl-8 items-center"
													value={formData.cuna || ""}
													onChange={(e) =>
														handleInputChange("cuna", e.target.value)
													}
												/>
											</div>
											<div className="flex flex-row gap-2 items-center relative">
												<span className="absolute left-4 top-1/2 transform -translate-y-1/2">
													10
												</span>
												<Input
													className="rounded-full pl-8 items-center"
													value={formData.cuna || ""}
													onChange={(e) =>
														handleInputChange("cuna", e.target.value)
													}
												/>
											</div>
										</div>
									</div>
									<div className="grid grid-cols-[auto,2fr] gap-2 border border-[#E4E4E7]">
										{/* <dt className="font-medium text-zinc-500">Detalle1:</dt> */}
										<Image
											src={myDetalle3}
											alt="Descripción de la imagen"
											className="w-56 h-full rounded-sm object-contain opacity-90"
											loading="eager"
											priority
										/>
										<div className="flex flex-col gap-2 p-4">
											<div className="flex flex-row gap-2 items-center relative">
												<span className="absolute left-4 top-1/2 transform -translate-y-1/2">
													11
												</span>
												<Input
													className="rounded-full pl-8 items-center"
													value={formData.cuna || ""}
													onChange={(e) =>
														handleInputChange("cuna", e.target.value)
													}
												/>
											</div>
											<div className="flex flex-row gap-2 items-center relative">
												<span className="absolute left-4 top-1/2 transform -translate-y-1/2">
													12
												</span>
												<Input
													className="rounded-full pl-8 items-center"
													value={formData.cuna || ""}
													onChange={(e) =>
														handleInputChange("cuna", e.target.value)
													}
												/>
											</div>
											<div className="flex flex-row gap-2 items-center relative">
												<span className="absolute left-4 top-1/2 transform -translate-y-1/2">
													13
												</span>
												<Input
													className="rounded-full pl-8 items-center"
													value={formData.cuna || ""}
													onChange={(e) =>
														handleInputChange("cuna", e.target.value)
													}
												/>
											</div>
											<div className="flex flex-row gap-2 items-center relative">
												<span className="absolute left-4 top-1/2 transform -translate-y-1/2">
													14
												</span>
												<Input
													className="rounded-full pl-8 items-center"
													value={formData.cuna || ""}
													onChange={(e) =>
														handleInputChange("cuna", e.target.value)
													}
												/>
											</div>
											<div className="flex flex-row gap-2 items-center relative">
												<span className="absolute left-4 top-1/2 transform -translate-y-1/2">
													15
												</span>
												<Input
													className="rounded-full pl-8 items-center"
													value={formData.cuna || ""}
													onChange={(e) =>
														handleInputChange("cuna", e.target.value)
													}
												/>
											</div>
										</div>
									</div>
									<div className="grid grid-cols-[auto,2fr] gap-2 border border-[#E4E4E7]">
										{/* <dt className="font-medium text-zinc-500">Detalle1:</dt> */}
										<Image
											src={myDetalle4}
											alt="Descripción de la imagen"
											className="w-56 h-full rounded-sm object-contain opacity-90"
											loading="eager"
											priority
										/>
										<div className="flex flex-col gap-2 p-4">
											<div className="flex flex-row gap-2 items-center relative">
												<span className="absolute left-4 top-1/2 transform -translate-y-1/2">
													16
												</span>
												<Input
													className="rounded-full pl-8 items-center"
													value={formData.cuna || ""}
													onChange={(e) =>
														handleInputChange("cuna", e.target.value)
													}
												/>
											</div>

											<div className="flex flex-row gap-2 items-center relative">
												<span className="absolute left-4 top-1/2 transform -translate-y-1/2">
													17
												</span>
												<Input
													className="rounded-full pl-8 items-center"
													value={formData.cuna || ""}
													onChange={(e) =>
														handleInputChange("cuna", e.target.value)
													}
												/>
											</div>

											<div className="flex flex-row gap-2 items-center relative">
												<span className="absolute left-4 top-1/2 transform -translate-y-1/2">
													18
												</span>
												<Input
													className="rounded-full pl-8 items-center"
													value={formData.cuna || ""}
													onChange={(e) =>
														handleInputChange("cuna", e.target.value)
													}
												/>
											</div>

											<div className="flex flex-row gap-2 items-center relative">
												<span className="absolute left-4 top-1/2 transform -translate-y-1/2">
													19
												</span>
												<Input
													className="rounded-full pl-8"
													value={formData.cuna || ""}
													onChange={(e) =>
														handleInputChange("cuna", e.target.value)
													}
												/>
											</div>

											<div className="flex flex-row gap-2 items-center relative">
												<span className="absolute left-4 top-1/2 transform -translate-y-1/2">
													20
												</span>
												<Input
													className="rounded-full pl-8"
													value={formData.cuna || ""}
													onChange={(e) =>
														handleInputChange("cuna", e.target.value)
													}
												/>
											</div>
										</div>
									</div>
									<div className="mb-4 flex flex-col gap-4 col-span-full">
										<Label
											htmlFor="observaciones_tecnicas"
											className="font-medium text-zinc-500"
										>
											Observaciones tecnicas
										</Label>
										<Textarea
											id="observaciones_tecnicas"
											name="observaciones_tecnicas"
											className="h-32" // Ajusta la altura según sea necesario
											value={formData.observaciones_tecnicas}
											onChange={(e) => {
												handleInputChange("observaciones_tecnicas", e.target.value);
											}}
										/>
									</div>
									{camposClaveVacios ? (
										<>
											<div className="flex items-center gap-4 col-start-2 col-end-3 justify-self-end self-end w-fit ">
												<span className="text-sm text-red-600">
													Agrega datos a la comanda.
												</span>
												<Link href={`/commands/edit/${comanda.id}`}>
													<Button
														variant="ghost"
														size="sm"
														className="rounded-full py-[1.15rem] px-[1rem] text-red-600 bg-red-100 hover:bg-red-50 inline-flex gap-2"
														onClick={(e) => {
															e.stopPropagation(); // Previene que el clic se propague al TableRow
														}}
													>
														<Pencil className="h-5 w-5 text-red-600" />
														Agregar
													</Button>
												</Link>
											</div>
										</>
									) : (
										<>
											<div className="flex items-center gap-4 col-start-2 col-end-3 justify-self-end self-end w-fit">
												<span className="text-sm text-green-600">
													Verificar, y editar si es necesario.
												</span>
												<Link href={`/commands/edit/${comanda.id}`}>
													<Button
														variant="ghost"
														size="sm"
														className="rounded-full py-[1.15rem] px-[1rem] text-green-600 bg-green-100 hover:bg-green-50 inline-flex gap-2"
														onClick={(e) => {
															e.stopPropagation(); // Previene que el clic se propague al TableRow
														}}
													>
														<Pencil className="h-5 w-5 text-green-600" />
														Editar
													</Button>
												</Link>
											</div>
										</>
									)}
									{/* <Button
									type="submit"
									variant="solid"
									className={`col-start-2 col-end-3 justify-self-end self-end w-fit rounded-full  ${bordeClase}`}
								>
									Editar comanda
								</Button> */}
								</div>
								<ToastNotification
									message={showToast}
									show={!!showToast}
									onClose={() => setShowToast("")}
									type={showToast.includes("Error") ? "error" : "success"} // Determina el tipo basado en el mensaje
								/>
							</CardContent>
						</form>
					</Card>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<Card className="col-span-2 bg-red-50 border-none rounded-tl-none rounded-tr-xl rounded-b-xl shadow-lg">
							<form onSubmit={handleSubmitChecklist}>
								<CardHeader>
									<CardTitle className="text-xl font-light text-zinc-800">
										Checklist de Salida
									</CardTitle>
								</CardHeader>
								<CardContent>
									<dl className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
										<div>
											<div className="flex flex-col items-start gap-2">
												<dt className="font-medium text-zinc-500">
													Pérdidas de Gas:
												</dt>
												<input
													type="checkbox"
													checked={formData.perdidas_gas}
													onChange={(e) =>
														handleInputChange("perdidas_gas", e.target.checked)
													}
												/>
											</div>
											<div className="flex flex-col items-start gap-2">
												<dt className="font-medium text-zinc-500">Cableado:</dt>
												<input
													type="checkbox"
													checked={formData.cableado}
													onChange={(e) =>
														handleInputChange("cableado", e.target.checked)
													}
												/>
											</div>
											<div className="flex flex-col items-start gap-2">
												<dt className="font-medium text-zinc-500">
													Nivel de Agua:
												</dt>
												<input
													type="checkbox"
													checked={formData.nivel_agua}
													onChange={(e) =>
														handleInputChange("nivel_agua", e.target.checked)
													}
												/>
											</div>
											<div className="flex flex-col items-start gap-2">
												<dt className="font-medium text-zinc-500">
													Nivel de Aceite:
												</dt>
												<input
													type="checkbox"
													checked={formData.nivel_aceite}
													onChange={(e) =>
														handleInputChange("nivel_aceite", e.target.checked)
													}
												/>
											</div>
											<div className="flex flex-col items-start gap-2">
												<dt className="font-medium text-zinc-500">
													Inspección Instalación:
												</dt>
												<input
													type="checkbox"
													checked={formData.inspeccion_instalacion}
													onChange={(e) =>
														handleInputChange(
															"inspeccion_instalacion",
															e.target.checked
														)
													}
												/>
											</div>
										</div>
										<div>
											<div className="flex flex-col items-start gap-2">
												<dt className="font-medium text-zinc-500">
													Funcionamiento Unidad:
												</dt>
												<input
													type="checkbox"
													checked={formData.funcionamiento_unidad}
													onChange={(e) =>
														handleInputChange(
															"funcionamiento_unidad",
															e.target.checked
														)
													}
												/>
											</div>
											<div className="flex flex-col items-start gap-2">
												<dt className="font-medium text-zinc-500">
													Herramientas:
												</dt>
												<input
													type="checkbox"
													checked={formData.herramientas}
													onChange={(e) =>
														handleInputChange("herramientas", e.target.checked)
													}
												/>
											</div>
											<div className="flex flex-col items-start gap-2">
												<dt className="font-medium text-zinc-500">
													Otras Observaciones:
												</dt>
												<Input
													className="rounded-full bg-white focus-visible:ring-0"
													type="text"
													value={formData.otras_observaciones}
													onChange={(e) =>
														handleInputChange(
															"otras_observaciones",
															e.target.value
														)
													}
												/>
											</div>
										</div>
									</dl>
								</CardContent>
							</form>
						</Card>
					</div>
				</div>
			</main>
		</div>
	);
}
