"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import myImage2 from "@/public/motorgas2.svg";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import axios from "axios";
import HomeIcon from "@/components/HomeIcon";
import { useSession } from "next-auth/react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import Aside from "@/components/Aside";

export default function TechniqueForm({ params }) {
	const { data: session } = useSession();
	const commandId = params.id;
	const today = new Date();
	const currentDay = today.getDate();
	const currentMonth = today.getMonth() + 1;
	const [loading, setLoading] = useState(true);
	const [techniqueData, setTechniqueData] = useState(null);
	const [page, setPage] = useState(1);
	const [formData, setFormData] = useState({
		usuario_id: session?.user?.id,
		dia: currentDay,
		mes: currentMonth,
		propietario: "",
		dni: "",
		marca_vehiculo: "",
		modelo: "",
		anio_fabricacion: "",
		patente: "",
		observaciones_personales: "",
		dominio: "",
		color: "",
		anio: 2001,
		detalle1: "",
		detalle2: "",
		detalle3: "",
		detalle4: "",
		observaciones_tecnicas: "",
		estado: null,
	});

	useEffect(() => {
		const fetchCommand = async () => {
			try {
				const response = await axios.get(
					`${process.env.NEXT_PUBLIC_API_URL}/api/commands/${commandId}`
				);

				if (response.data.tecnica_id) {
					const techniqueResponse = await axios.get(
						`${process.env.NEXT_PUBLIC_API_URL}/api/techniques/${response.data.tecnica_id}`
					);
					setTechniqueData(techniqueResponse.data);
					setFormData((prevFormData) => ({
						...prevFormData,
						...techniqueResponse.data,
					}));

					if (techniqueResponse.data.creado_en) {
						setPage(2);
					}
				} else {
					setFormData((prevFormData) => ({
						...prevFormData,
						propietario:
							response.data.boletos_reservas.clientes.nombre_completo,
						dni: response.data.boletos_reservas.clientes.dni,
					}));
				}

				setLoading(false);
			} catch (err) {
				console.error("Error al obtener la comanda:", err);
				setLoading(true);
			}
		};

		fetchCommand();
	}, [commandId]);

	// Nuevo efecto para manejar el indicador de carga en el cambio de página
	useEffect(() => {
		// Activa el loading cuando cambias de página
		setLoading(true);

		const timer = setTimeout(() => setLoading(false), 1500); // Simula un pequeño tiempo de carga

		return () => clearTimeout(timer); // Limpia el temporizador
	}, [page]);

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;

		setFormData((prevData) => ({
			...prevData,
			[name]: type === "checkbox" ? checked : value.toUpperCase(),
		}));
	};
	const handleSubmit = async (e) => {
		e.preventDefault();
		const comandaIdNumber = Number(commandId);

		if (page === 1) {
			setLoading(true);
			try {
				if (techniqueData) {
					const { ...dataToUpdate } = formData;
					const updates = Object.keys(dataToUpdate).reduce((acc, key) => {
						if (dataToUpdate[key] !== techniqueData[key]) {
							acc[key] = dataToUpdate[key];
						}
						return acc;
					}, {});

					if (Object.keys(updates).length > 0) {
						const response = await axios.patch(
							`${process.env.NEXT_PUBLIC_API_URL}/api/techniques/${techniqueData.id}`,
							updates
						);
						console.log("Técnica actualizada:", response.data);
					}
				} else {
					const response = await axios.post(
						`${process.env.NEXT_PUBLIC_API_URL}/api/techniques`,
						{
							comanda_id: comandaIdNumber,
							...formData,
						}
					);
					console.log("Técnica creada:", response.data);
				}
			} catch (error) {
				console.error("Error de solicitud:", error);
			}
		} else if (page === 2) {
			try {
				if (techniqueData) {
					const { ...dataToUpdate } = formData;
					const updates = Object.keys(dataToUpdate).reduce((acc, key) => {
						if (dataToUpdate[key] !== techniqueData[key]) {
							acc[key] = dataToUpdate[key];
						}
						return acc;
					}, {});

					if (Object.keys(updates).length > 0) {
						const response = await axios.patch(
							`${process.env.NEXT_PUBLIC_API_URL}/api/techniques/${techniqueData.id}`,
							updates
						);
						console.log("Técnica actualizada en página 2:", response.data);
					}
				}
			} catch (error) {
				console.error("Error de solicitud al actualizar en página 2:", error);
			}
		}
	};
	return (
		<div className="flex bg-zinc-50">
			{loading ? (
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
							src={myImage2}
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
					<main className="flex-1 p-6 z-50">
						<div className="flex items-center justify-between mb-6">
							<div className="flex items-center gap-2">
								<HomeIcon label="Volver"></HomeIcon>
								<h2 className="text-zinc-700">Añadir Formulario Tecnico</h2>
							</div>
							<div className="flex space-x-4 mb-6 ">
								{[1, 2].map((num) => (
									<div
										key={num}
										className={`flex items-center justify-center w-6 h-6 rounded-full ${
											page > num
												? "bg-green-500 p-4"
												: page === num
												? "bg-rose-500 p-4"
												: "bg-gray-300 p-4"
										}`}
									>
										<span className="text-white text-sm">{num}</span>
									</div>
								))}
							</div>
						</div>
						<Card className="border-none shadow-lg">
							<CardContent>
								<form onSubmit={handleSubmit} className="space-y-8">
									{page === 1 && (
										<div>
											<p className="py-4">
												Formulario técnico de la comanda{" "}
												{commandId ? commandId : "desconocida"}
											</p>
											<div className="grid grid-cols-2 gap-4 mb-4">
												<div>
													<Label htmlFor="dia">Día</Label>
													<Input
														id="dia"
														name="dia"
														type="number"
														value={formData.dia}
														onChange={handleChange}
														required
													/>
												</div>
												<div>
													<Label htmlFor="mes">Mes</Label>
													<Input
														id="mes"
														name="mes"
														type="number"
														value={formData.mes}
														onChange={handleChange}
														required
													/>
												</div>
											</div>
											<div className="mb-4">
												<Label htmlFor="propietario">Propietario</Label>
												<Input
													id="propietario"
													name="propietario"
													value={formData.propietario}
													onChange={handleChange}
													required
												/>
											</div>
											<div className="mb-4">
												<Label htmlFor="dni">DNI</Label>
												<Input
													id="dni"
													name="dni"
													value={formData.dni}
													onChange={handleChange}
													required
												/>
											</div>
											<div className="grid grid-cols-2 gap-4 mb-4">
												<div>
													<Label htmlFor="marca_vehiculo">
														Marca del Vehículo
													</Label>
													<Input
														id="marca_vehiculo"
														name="marca_vehiculo"
														value={formData.marca_vehiculo}
														onChange={handleChange}
														required
													/>
												</div>
												<div>
													<Label htmlFor="modelo">Modelo</Label>
													<Input
														id="modelo"
														name="modelo"
														value={formData.modelo}
														onChange={handleChange}
														required
													/>
												</div>
											</div>
											<div className="grid grid-cols-2 gap-4 mb-4">
												<div className="mb-4">
													<Label htmlFor="anio_fabricacion">
														Año de Fabricacion
													</Label>
													<Input
														id="anio_fabricacion"
														name="anio_fabricacion"
														type="number"
														value={formData.anio_fabricacion}
														onChange={handleChange}
														required
													/>
												</div>
												<div>
													<Label htmlFor="patente">Patente</Label>
													<Input
														id="patente"
														name="patente"
														value={formData.patente}
														onChange={handleChange}
														required
													/>
												</div>
											</div>
											<div className="mb-4">
												<Label htmlFor="observaciones_personales">
													Observaciones
												</Label>
												<Textarea
													id="observaciones_personales"
													name="observaciones_personales"
													value={formData.observaciones_personales}
													onChange={handleChange}
												/>
											</div>
											<p className="text-sm text-zinc-600 mb-4">
												En el día{" "}
												<span
													className={
														formData.dia ? "text-green-700" : "text-red-500"
													}
												>
													{formData.dia ? formData.dia : "Pendiente"}
												</span>{" "}
												del mes{" "}
												<span
													className={
														formData.mes ? "text-green-700" : "text-red-500"
													}
												>
													{formData.mes ? formData.mes : "Pendiente"}
												</span>{" "}
												del 2024, en la provincia de Buenos Aires, el
												propietario de nombre{" "}
												<span
													className={
														formData.propietario
															? "text-green-700"
															: "text-red-500"
													}
												>
													{formData.propietario
														? formData.propietario
														: "Pendiente"}
												</span>{" "}
												y DNI{" "}
												<span
													className={
														formData.dni ? "text-green-700" : "text-red-500"
													}
												>
													{formData.dni ? formData.dni : "Pendiente"}
												</span>{" "}
												en adelante el Cliente del automotor, cuyas
												características son: Marca del vehículo:{" "}
												<span
													className={
														formData.marca_vehiculo
															? "text-green-700"
															: "text-red-500"
													}
												>
													{formData.marca_vehiculo
														? formData.marca_vehiculo
														: "Pendiente"}
												</span>
												, Modelo{" "}
												<span
													className={
														formData.modelo ? "text-green-700" : "text-red-500"
													}
												>
													{formData.modelo ? formData.modelo : "Pendiente"}
												</span>{" "}
												y Año de fabricación:{" "}
												<span
													className={
														formData.anio_fabricacion
															? "text-green-700"
															: "text-red-500"
													}
												>
													{formData.anio_fabricacion
														? formData.anio_fabricacion
														: "Pendiente"}
												</span>
												, Patente:{" "}
												<span
													className={
														formData.patente ? "text-green-700" : "text-red-500"
													}
												>
													{formData.patente ? formData.patente : "Pendiente"}
												</span>
												, deja en manos conocidas como la Unidad, deja en poder
												del
											</p>
											<Button type="button" onClick={() => setPage(2)}>
												Siguiente
											</Button>
										</div>
									)}
									{page === 2 && (
										<Card>
											<CardContent className="p-6">
												<h2 className="text-2xl font-semibold mb-6">
													Detalles del Vehículo
												</h2>
												<div className="grid grid-cols-2 gap-4 mb-4">
													<div>
														<Label htmlFor="dominio">Dominio</Label>
														<Input
															id="dominio"
															name="dominio"
															value={formData.dominio}
															onChange={handleChange}
															required
														/>
													</div>
												</div>
												<div className="grid grid-cols-2 gap-4 mb-4">
													<div>
														<Label htmlFor="color">Color</Label>
														<Input
															id="color"
															name="color"
															value={formData.color}
															onChange={handleChange}
															required
														/>
													</div>
													<div>
														<Label htmlFor="anio">Año</Label>
														<Input
															id="anio"
															name="anio"
															type="number"
															value={formData.anio}
															onChange={handleChange}
															required
														/>
													</div>
												</div>

												{["detalle1", "detalle2", "detalle3", "detalle4"].map(
													(detalle, index) => (
														<div
															key={detalle}
															className="mb-4 flex items-start"
														>
															<Image
																src={`/placeholder.svg?height=100&width=100&text=Detalle ${
																	index + 1
																}`}
																alt={`Detalle ${index + 1}`}
																width={100}
																height={100}
																className="mr-4"
															/>
															<div className="flex-grow">
																<Label htmlFor={detalle}>{`Detalles ${
																	index + 1
																}`}</Label>
																<Select
																	name={detalle}
																	value={formData[detalle]}
																	onValueChange={(value) =>
																		handleChange({
																			target: { name: detalle, value },
																		})
																	}
																>
																	<SelectTrigger>
																		<SelectValue placeholder="Seleccione una opción" />
																	</SelectTrigger>
																	<SelectContent>
																		<SelectItem value="1">Opción 1</SelectItem>
																		<SelectItem value="2">Opción 2</SelectItem>
																		<SelectItem value="3">Opción 3</SelectItem>
																		<SelectItem value="4">Opción 4</SelectItem>
																	</SelectContent>
																</Select>
															</div>
														</div>
													)
												)}

												<div className="mb-4">
													<Label htmlFor="observaciones_tecnicas">
														Observaciones del equipo
													</Label>
													<Textarea
														id="observaciones_tecnicas"
														name="observaciones_tecnicas"
														value={formData.observaciones_tecnicas}
														onChange={handleChange}
													/>
												</div>
												<div className="grid grid-cols-3 gap-4 mb-4">
													<div>
														<Label htmlFor="nombrePage2">Nombre</Label>
														<Input
															id="nombrePage2"
															name="nombrePage2"
															value={formData.nombrePage2}
															onChange={handleChange}
															required
														/>
													</div>
													<div>
														<Label htmlFor="firmaAclaracion">
															Firma y aclaración
														</Label>
														<Input
															id="firmaAclaracion"
															name="firmaAclaracion"
															value={formData.firmaAclaracion}
															onChange={handleChange}
															required
														/>
													</div>
													<div>
														<Label htmlFor="fechaPage2">Fecha</Label>
														<Input
															id="fechaPage2"
															name="fechaPage2"
															type="date"
															value={formData.fechaPage2}
															onChange={handleChange}
															required
														/>
													</div>
												</div>
											</CardContent>
										</Card>
									)}
								</form>
							</CardContent>
						</Card>
					</main>
				</>
			)}
		</div>
	);
}
