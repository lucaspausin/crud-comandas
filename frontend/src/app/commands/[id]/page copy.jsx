"use client";

import { useState, useEffect } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Aside from "@/components/Aside";
import HomeIcon from "@/components/HomeIcon";
import { Pencil, SquareArrowOutUpRight, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import Image from "next/image";
import myImage from "@/public/motorgas2.svg";
import ToastNotification from "@/components/ToastNotification";

import {
	getCommand,
	updateCommand,
	deleteArchive,
} from "../../reservations/reservations.api";
import CameraFileUpload from "@/components/CameraFileUpload";

export default function ComandaDetail({ params }) {
	const [showToast, setShowToast] = useState("");

	const [comanda, setComanda] = useState(null);
	const [formData, setFormData] = useState({
		reductor_cod: "",
		reductor_numero: "",
		cilindro_1_cod: "",
		cilindro_1_numero: "",
		valvula_1_cod: "",
		valvula_1_numero: "",
		reforma_escape_texto: "",
		carga_externa: false,
		precio_carga_externa: "",
		cilindro_2_cod: "",
		cilindro_2_numero: "",
		valvula_2_cod: "",
		valvula_2_numero: "",
		cuna: "",
		materiales: "",
	});

	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchComanda = async () => {
			try {
				const data = await getCommand(params.id);
				setComanda(data);
			} catch (err) {
				setError(err.message);
			}
		};
		fetchComanda();
	}, [params.id]);

	useEffect(() => {
		if (comanda) {
			setFormData({
				reductor_cod: comanda.reductor_cod || "",
				reductor_numero: comanda.reductor_numero || "",
				cilindro_1_cod: comanda.cilindro_1_cod || "",
				cilindro_1_numero: comanda.cilindro_1_numero || "",
				valvula_1_cod: comanda.valvula_1_cod || "",
				valvula_1_numero: comanda.valvula_1_numero || "",
				reforma_escape_texto: comanda.reforma_escape_texto || "",
				carga_externa: comanda.carga_externa,
				precio_carga_externa: comanda.precio_carga_externa || "",
				cilindro_2_cod: comanda.cilindro_2_cod || "",
				cilindro_2_numero: comanda.cilindro_2_numero || "",
				valvula_2_cod: comanda.valvula_2_cod || "",
				valvula_2_numero: comanda.valvula_2_numero || "",
				cuna: comanda.cuna || "",
				materiales: comanda.materiales || "",
			});
		}
	}, [comanda]);

	if (error) {
		return <div>Error: {error}</div>;
	}

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

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const dataToUpdate = {
				reductor_cod: formData.reductor_cod,
				reductor_numero: formData.reductor_numero
					? parseInt(formData.reductor_numero, 10)
					: null,
				cilindro_1_cod: formData.cilindro_1_cod,
				cilindro_1_numero: formData.cilindro_1_numero
					? parseInt(formData.cilindro_1_numero, 10)
					: null,
				valvula_1_cod: formData.valvula_1_cod,
				valvula_1_numero: formData.valvula_1_numero
					? parseInt(formData.valvula_1_numero, 10)
					: null,
				reforma_escape_texto: formData.reforma_escape_texto,
				carga_externa: formData.carga_externa,
				precio_carga_externa: formData.precio_carga_externa
					? parseFloat(formData.precio_carga_externa)
					: null,
				cilindro_2_cod: formData.cilindro_2_cod,
				cilindro_2_numero: formData.cilindro_2_numero
					? parseInt(formData.cilindro_2_numero, 10)
					: null,
				valvula_2_cod: formData.valvula_2_cod,
				valvula_2_numero: formData.valvula_2_numero
					? parseInt(formData.valvula_2_numero, 10)
					: null,
				cuna: formData.cuna,
				materiales: formData.materiales,
				estado: "en_proceso",
			};
			await updateCommand(params.id, dataToUpdate);
			setComanda((prevComanda) => ({ ...prevComanda, ...dataToUpdate }));

			const successMessage = "Edicion de la comanda exitosamente.";
			setShowToast(successMessage);
		} catch (error) {
			let responseErrorMessage = "Error al editar la comanda";
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
		? "bg-white border-none"
		: "bg-white border border-green-300";

	const handleDeleteArchive = async (id) => {
		const confirmDelete = window.confirm(
			"¿Está seguro de que desea eliminar este archivo?"
		);

		if (confirmDelete) {
			try {
				await deleteArchive(id);
				setComanda((prevComanda) => ({
					...prevComanda,
					archivo: prevComanda.archivo.filter((file) => file.id !== id),
				}));
			} catch (error) {
				console.error("Error al eliminar la reserva:", error);
			}
		}
	};

	return (
		<div className="flex-1 bg-zinc-50">
			<Aside />
			<main className="flex flex-col p-6 z-50 w-full">
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
									<dt className="font-normal text-zinc-600">Comanda:</dt>
									<dd>{comanda.id}</dd>
									<dt className="font-normal text-zinc-600">Reserva:</dt>
									<Link
										className="flex gap-2 items-center border-b border-zinc-800 w-fit"
										href={`/reservations/${comanda.boletos_reservas.id}`}
									>
										<dd>{comanda.boletos_reservas.id}</dd>
										<SquareArrowOutUpRight className="w-[0.9rem] h-[0.9rem] text-zinc-800" />
									</Link>

									<dt className="font-normal text-zinc-600">Servicio:</dt>
									<dd>Instalación de GNC</dd>
									<dt className="font-normal text-zinc-600">Creado:</dt>
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
									<dt className="font-normal text-zinc-600">Nombre:</dt>
									<dd>{comanda.boletos_reservas.clientes.nombre_completo}</dd>
									<dt className="font-normal text-zinc-600">DNI:</dt>
									<dd>{comanda.boletos_reservas.clientes.dni}</dd>
									<dt className="font-normal text-zinc-600">Domicilio:</dt>
									<dd>{comanda.boletos_reservas.clientes.domicilio}</dd>
									<dt className="font-normal text-zinc-600">Localidad:</dt>
									<dd>{comanda.boletos_reservas.clientes.localidad}</dd>
									<dt className="font-normal text-zinc-600">Teléfono:</dt>
									<dd className="truncate">
										+549{comanda.boletos_reservas.clientes.telefono}
										@s.whatsapp.net
									</dd>
								</dl>
							</CardContent>
						</Card>
					</div>

					<Card className={`rounded-xl shadow-lg ${bordeClase} `}>
						<CardHeader className="relative">
							<div className="flex items-center gap-4 w-full justify-between">
								<CardTitle className="text-xl font-light text-zinc-800">
									Detalles del Equipo
								</CardTitle>
							</div>
							{/* Icono condicional */}
						</CardHeader>
						<CardContent>
							<form
								onSubmit={handleSubmit}
								className="grid grid-cols-2 gap-6 text-sm"
							>
								<div className="flex flex-col gap-2">
									<div className="flex flex-col items-start gap-2">
										<dt className="font-normal text-zinc-600">Reductor COD:</dt>
										<Input
											className="rounded-full focus-visible:ring-0"
											type="text"
											required
											value={formData.reductor_cod}
											onChange={(e) =>
												handleInputChange("reductor_cod", e.target.value)
											}
										/>
										<dt className="font-normal text-zinc-600">Reductor N°</dt>
										<Input
											className="rounded-full focus-visible:ring-0"
											value={formData.reductor_numero || ""}
											required
											onChange={(e) =>
												handleInputChange("reductor_numero", e.target.value)
											}
										/>
									</div>
									<div className="flex flex-col items-start gap-2">
										<dt className="font-normal text-zinc-600">
											Cilindro 1 COD:
										</dt>
										<Input
											className="rounded-full focus-visible:ring-0"
											required
											value={formData.cilindro_1_cod || ""}
											onChange={(e) =>
												handleInputChange("cilindro_1_cod", e.target.value)
											}
										/>
										<dt className="font-normal text-zinc-600">Cilindro 1 N°</dt>
										<Input
											className="rounded-full focus-visible:ring-0"
											required
											value={formData.cilindro_1_numero || ""}
											onChange={(e) =>
												handleInputChange("cilindro_1_numero", e.target.value)
											}
										/>
									</div>
									<div className="flex flex-col items-start gap-2">
										<dt className="font-normal text-zinc-600">
											Válvula 1 COD:
										</dt>
										<Input
											className="rounded-full focus-visible:ring-0"
											required
											value={formData.valvula_1_cod || ""}
											onChange={(e) =>
												handleInputChange("valvula_1_cod", e.target.value)
											}
										/>
										<dt className="font-normal text-zinc-600">Válvula 1 N°</dt>
										<Input
											className="rounded-full focus-visible:ring-0"
											required
											value={formData.valvula_1_numero || ""}
											onChange={(e) =>
												handleInputChange("valvula_1_numero", e.target.value)
											}
										/>
									</div>
									<div className="flex flex-col items-start gap-2">
										<dt className="font-normal text-zinc-600">
											Reforma Escape:
										</dt>
										<Input
											className="rounded-full focus-visible:ring-0"
											value={formData.reforma_escape_texto || ""}
											onChange={(e) =>
												handleInputChange(
													"reforma_escape_texto",
													e.target.value
												)
											}
										/>
									</div>
									<div className="flex flex-col items-start gap-2 my-6">
										<label className="font-normal text-zinc-600 flex items-center gap-2">
											<span>Carga Externa:</span>
											<Input
												type="checkbox"
												className="rounded h-4 w-4 text-blue-500 focus:ring-blue-500"
												checked={formData.carga_externa}
												onChange={(e) =>
													handleInputChange("carga_externa", e.target.checked)
												}
											/>
										</label>
									</div>
									<div className="flex flex-col items-start gap-2">
										<dt className="font-normal text-zinc-600">
											Precio Carga Externa:
										</dt>
										<Input
											className="rounded-full focus-visible:ring-0"
											value={formData.precio_carga_externa || ""}
											onChange={(e) =>
												handleInputChange(
													"precio_carga_externa",
													e.target.value
												)
											}
										/>
									</div>
								</div>
								<div className="flex flex-col gap-2">
									<div className="flex flex-col items-start gap-2">
										<dt className="font-normal text-zinc-600">
											Cilindro 2 COD:
										</dt>
										<Input
											className="rounded-full focus-visible:ring-0"
											value={formData.cilindro_2_cod || ""}
											onChange={(e) =>
												handleInputChange("cilindro_2_cod", e.target.value)
											}
										/>
										<dt className="font-normal text-zinc-600">Cilindro 2 N°</dt>
										<Input
											className="rounded-full focus-visible:ring-0"
											value={formData.cilindro_2_numero || ""}
											onChange={(e) =>
												handleInputChange("cilindro_2_numero", e.target.value)
											}
										/>
									</div>
									<div className="flex flex-col items-start gap-2">
										<dt className="font-normal text-zinc-600">
											Válvula 2 COD:
										</dt>
										<Input
											className="rounded-full focus-visible:ring-0"
											value={formData.valvula_2_cod || ""}
											onChange={(e) =>
												handleInputChange("valvula_2_cod", e.target.value)
											}
										/>
										<dt className="font-normal text-zinc-600">Válvula 2 N°</dt>
										<Input
											className="rounded-full focus-visible:ring-0"
											value={formData.valvula_2_numero || ""}
											onChange={(e) =>
												handleInputChange("valvula_2_numero", e.target.value)
											}
										/>
									</div>
									<div className="flex flex-col items-start gap-2">
										<dt className="font-normal text-zinc-600">Cuna:</dt>
										<Input
											className="rounded-full focus-visible:ring-0"
											value={formData.cuna || ""}
											onChange={(e) =>
												handleInputChange("cuna", e.target.value)
											}
										/>
									</div>
									<div className="flex h-full flex-col items-start gap-2">
										<dt className="font-normal text-zinc-600">Materiales:</dt>
										<Textarea
											className="h-full w-full rounded-xl align-top focus-visible:ring-0"
											value={formData.materiales || ""}
											onChange={(e) =>
												handleInputChange("materiales", e.target.value)
											}
										/>
									</div>
								</div>
								{camposClaveVacios ? (
									<>
										<div className="flex items-center gap-4 col-start-2 col-end-3 justify-self-end self-end w-fit">
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
													{/* <Pencil className="h-5 w-5 text-red-600" /> */}
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
							</form>
							<ToastNotification
								message={showToast}
								show={!!showToast}
								onClose={() => setShowToast("")}
								type={showToast.includes("Error") ? "error" : "success"} // Determina el tipo basado en el mensaje
							/>
						</CardContent>
					</Card>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-full">
						<Card className="col-span-2 rounded-xl shadow-lg border-none">
							<CardHeader>
								<CardTitle className="text-xl font-light text-zinc-800">
									Archivos
								</CardTitle>
							</CardHeader>
							<CardContent className="flex flex-col items-stretch p-0 h-full">
								<CameraFileUpload
									comandaId={params.id}
									setComanda={setComanda}
								/>
							</CardContent>
						</Card>
						{comanda.archivo.length > 0 && (
							<Card className="col-span-2 border-none rounded-lg shadow-lg">
								<CardContent className="flex flex-col items-stretch h-full overflow-hidden p-4">
									<div className="flex overflow-x-auto gap-4 px-0 py-6 text-sm rounded-lg h-full">
										{comanda.archivo.map((file, index) => (
											<div
												key={file.id}
												className="flex flex-col items-center w-[250px] h-[275px] shrink-0"
											>
												{file.tipo && file.tipo.startsWith("image/") ? (
													<div className="w-[250px] h-full overflow-hidden relative">
														<Image
															src={file.url}
															alt={`Archivo ${index + 1}`}
															width={500}
															height={500}
															className="rounded-md object-cover w-full h-full shadow-lg"
														/>
														<div className="rounded-t-lg absolute top-0 left-0 right-0 h-[60%] bg-gradient-to-b from-black via-transparent to-transparent opacity-90"></div>
														<X
															strokeWidth={3}
															className="text-white absolute top-2 right-2 h-9 w-9 border-2 border-transparent p-2 rounded-full hover:border-white transition-all ease-in-out duration-500"
															onClick={() => handleDeleteArchive(file.id)} // Llama a la función de eliminación
														/>
													</div>
												) : file.tipo === "application/pdf" ? (
													<a
														href={file.url}
														target="_blank"
														rel="noopener noreferrer"
														className="flex flex-col items-center w-[250px] h-full"
													>
														<div className="bg-zinc-100 rounded-md shadow-sm w-full h-full flex items-center justify-center">
															<span className="text-5xl text-red-500">📄</span>
														</div>
														<span className="text-blue-500 underline mt-2">
															Ver PDF {file.url} {index + 1}
														</span>
													</a>
												) : (
													<a
														href={file.url}
														target="_blank"
														rel="noopener noreferrer"
														className="flex flex-col items-center w-[250px] h-full"
													>
														<div className="bg-gray-200 rounded-md shadow-sm w-full h-full flex items-center justify-center">
															<span className="text-3xl text-gray-500">📁</span>
														</div>
														<span className="text-blue-500 underline mt-2">
															Descargar archivo {index + 1}
														</span>
													</a>
												)}
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						)}

						<Card className="border-none rounded-lg shadow-lg">
							<CardHeader>
								<CardTitle className=" text-xl font-light  text-zinc-800">
									Detalles del Vehículo
								</CardTitle>
							</CardHeader>
							<CardContent>
								<dl className="grid grid-cols-2 gap-2 text-sm">
									<dt className="font-normal text-zinc-600">Marca:</dt>
									<dd>
										{comanda.tecnica_tecnica_comanda_idTocomandas
											?.marca_vehiculo || "N/A"}
									</dd>
									<dt className="font-normal text-zinc-600">Modelo:</dt>
									<dd>
										{comanda.tecnica_tecnica_comanda_idTocomandas?.modelo ||
											"N/A"}
									</dd>
									<dt className="font-normal text-zinc-600">Año:</dt>
									<dd>
										{comanda.tecnica_tecnica_comanda_idTocomandas
											?.anio_fabricacion || "N/A"}
									</dd>
									<dt className="font-normal text-zinc-600">Patente:</dt>
									<dd>
										{comanda.tecnica_tecnica_comanda_idTocomandas?.patente ||
											"N/A"}
									</dd>
									<dt className="font-normal text-zinc-600">Dominio:</dt>
									<dd>
										{comanda.tecnica_tecnica_comanda_idTocomandas?.dominio ||
											"N/A"}
									</dd>
									<dt className="font-normal text-zinc-600">Color:</dt>
									<dd>
										{comanda.tecnica_tecnica_comanda_idTocomandas?.color ||
											"N/A"}
									</dd>
								</dl>
							</CardContent>
						</Card>
						<Card className="border-none rounded-lg shadow-lg">
							<CardHeader>
								<CardTitle className="text-xl font-light  text-zinc-800">
									Detalles de la Reserva
								</CardTitle>
							</CardHeader>
							<CardContent>
								<dl className="grid grid-cols-2 gap-2 text-sm">
									<dt className="font-normal text-zinc-600">Reserva:</dt>
									<dd>{comanda.boletos_reservas.id}</dd>
									<dt className="font-normal text-zinc-600">
										Marca del vehículo:
									</dt>
									<dd>{comanda.boletos_reservas.marca_vehiculo}</dd>
									<dt className="font-normal text-zinc-600">
										Modelo del vehículo:
									</dt>
									<dd>{comanda.boletos_reservas.modelo_vehiculo}</dd>
									<dt className="font-normal text-zinc-600">Patente:</dt>
									<dd>{comanda.boletos_reservas.patente_vehiculo}</dd>
									<dt className="font-normal text-zinc-600">Equipo:</dt>
									<dd>{comanda.boletos_reservas.equipo}</dd>
									<dt className="font-normal text-zinc-600">Precio:</dt>
									<dd>${comanda.boletos_reservas.precio}</dd>
									<dt className="font-normal text-zinc-600">Seña:</dt>
									<dd>${comanda.boletos_reservas.sena}</dd>
									<dt className="font-normal text-zinc-600">Monto Final:</dt>
									<dd>${comanda.boletos_reservas.monto_final_abonar}</dd>
									<dt className="font-normal text-zinc-600">
										Fecha Instalación:
									</dt>
									<dd>
										{(() => {
											const fecha = new Date(
												comanda.boletos_reservas.fecha_instalacion
											);
											fecha.setHours(8, 30); // Establece la hora a 8 y los minutos a 30
											return fecha.toLocaleString("es-AR", {
												day: "2-digit",
												month: "2-digit",
												year: "numeric",
												hour: "2-digit",
												minute: "2-digit",
												hour12: false,
											});
										})()}
									</dd>
								</dl>
							</CardContent>
						</Card>
						<Card className="border-none rounded-lg shadow-lg">
							<CardHeader>
								<CardTitle className="text-xl font-light  text-zinc-800">
									Detalles Técnicos
								</CardTitle>
							</CardHeader>
							<CardContent>
								<dl className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
									<dt className="font-normal text-zinc-600">Detalle 1:</dt>
									<dd>
										{comanda.tecnica_tecnica_comanda_idTocomandas?.detalle1 ||
											"N/A"}
									</dd>

									<dt className="font-normal text-zinc-600">Detalle 2:</dt>
									<dd>
										{comanda.tecnica_tecnica_comanda_idTocomandas?.detalle2 ||
											"N/A"}
									</dd>

									<dt className="font-normal text-zinc-600">Detalle 3:</dt>
									<dd>
										{comanda.tecnica_tecnica_comanda_idTocomandas?.detalle3 ||
											"N/A"}
									</dd>

									<dt className="font-normal text-zinc-600">Detalle 4:</dt>
									<dd>
										{comanda.tecnica_tecnica_comanda_idTocomandas?.detalle4 ||
											"N/A"}
									</dd>

									<dt className="font-normal text-zinc-600">
										Observaciones Personales:
									</dt>
									<dd>
										{comanda.tecnica_tecnica_comanda_idTocomandas
											?.observaciones_personales || "N/A"}
									</dd>

									<dt className="font-normal text-zinc-600">
										Observaciones Técnicas:
									</dt>
									<dd>
										{comanda.tecnica_tecnica_comanda_idTocomandas
											?.observaciones_tecnicas || "N/A"}
									</dd>

									<dt className="font-normal text-zinc-600">Firma:</dt>
									<dd>
										{comanda.tecnica_tecnica_comanda_idTocomandas?.firma ||
											"N/A"}
									</dd>
								</dl>
							</CardContent>
						</Card>

						<Card className="border-none rounded-lg shadow-lg">
							<CardHeader>
								<CardTitle className="text-xl font-light  text-zinc-800">
									Checklist de Salida
								</CardTitle>
							</CardHeader>
							<CardContent>
								<dl className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
									<dt className="font-normal text-zinc-600">
										Pérdidas de Gas:
									</dt>
									<dd>
										{comanda.tecnica_tecnica_comanda_idTocomandas
											? comanda.tecnica_tecnica_comanda_idTocomandas
													.perdidas_gas === true
												? "Sí"
												: comanda.tecnica_tecnica_comanda_idTocomandas
														.perdidas_gas === null
												? "No"
												: "No"
											: "N/A"}
									</dd>

									<dt className="font-normal text-zinc-600">Cableado:</dt>
									<dd>
										{comanda.tecnica_tecnica_comanda_idTocomandas
											? comanda.tecnica_tecnica_comanda_idTocomandas
													.cableado === true
												? "Sí"
												: comanda.tecnica_tecnica_comanda_idTocomandas
														.cableado === null
												? "No"
												: "No"
											: "N/A"}
									</dd>

									<dt className="font-normal text-zinc-600">Nivel de Agua:</dt>
									<dd>
										{comanda.tecnica_tecnica_comanda_idTocomandas
											? comanda.tecnica_tecnica_comanda_idTocomandas
													.nivel_agua === true
												? "Sí"
												: comanda.tecnica_tecnica_comanda_idTocomandas
														.nivel_agua === null
												? "No"
												: "No"
											: "N/A"}
									</dd>

									<dt className="font-normal text-zinc-600">
										Nivel de Aceite:
									</dt>
									<dd>
										{comanda.tecnica_tecnica_comanda_idTocomandas
											? comanda.tecnica_tecnica_comanda_idTocomandas
													.nivel_aceite === true
												? "Sí"
												: comanda.tecnica_tecnica_comanda_idTocomandas
														.nivel_aceite === null
												? "No"
												: "No"
											: "N/A"}
									</dd>

									<dt className="font-normal text-zinc-600">
										Inspección Instalación:
									</dt>
									<dd>
										{comanda.tecnica_tecnica_comanda_idTocomandas
											? comanda.tecnica_tecnica_comanda_idTocomandas
													.inspeccion_instalacion === true
												? "Sí"
												: comanda.tecnica_tecnica_comanda_idTocomandas
														.inspeccion_instalacion === null
												? "No"
												: "No"
											: "N/A"}
									</dd>

									<dt className="font-normal text-zinc-600">
										Funcionamiento Unidad:
									</dt>
									<dd>
										{comanda.tecnica_tecnica_comanda_idTocomandas
											? comanda.tecnica_tecnica_comanda_idTocomandas
													.funcionamiento_unidad === true
												? "Sí"
												: comanda.tecnica_tecnica_comanda_idTocomandas
														.funcionamiento_unidad === null
												? "No"
												: "No"
											: "N/A"}
									</dd>

									<dt className="font-normal text-zinc-600">Herramientas:</dt>
									<dd>
										{comanda.tecnica_tecnica_comanda_idTocomandas
											? comanda.tecnica_tecnica_comanda_idTocomandas
													.herramientas === true
												? "Sí"
												: comanda.tecnica_tecnica_comanda_idTocomandas
														.herramientas === null
												? "No"
												: "No"
											: "N/A"}
									</dd>

									<dt className="font-normal text-zinc-600">
										Otras Observaciones:
									</dt>
									<dd>
										{comanda.tecnica_tecnica_comanda_idTocomandas
											? comanda.tecnica_tecnica_comanda_idTocomandas
													.otras_observaciones ?? "No"
											: "N/A"}
									</dd>
								</dl>
							</CardContent>
						</Card>
					</div>
				</div>
			</main>
		</div>
	);
}
