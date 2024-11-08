"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import axios from "axios";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import myImage2 from "@/public/motorgas2.svg";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import HomeIcon from "@/components/HomeIcon";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Aside from "@/components/Aside";

export default function TechniqueForm({ params }) {
	const { data: session } = useSession();
	const commandId = params.id;
	const today = new Date();
	const [loading, setLoading] = useState(true);
	const [formData, setFormData] = useState({
		usuario_id: session?.user?.id,
		dia: today.getDate(),
		mes: today.getMonth() + 1,
		propietario: "",
		dni: "",
		marca_vehiculo: "",
		modelo: "",
		anio_fabricacion: "",
		patente: "",
		observaciones_personales: "",
		dominio: "",
		color: "",
		anio: new Date().getFullYear(),
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
					setFormData((prevFormData) => ({
						...prevFormData,
						...techniqueResponse.data,
					}));
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
				setLoading(false);
			}
		};
		fetchCommand();
	}, [commandId, session?.user?.id]);

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData((prevData) => ({
			...prevData,
			[name]:
				type === "checkbox"
					? checked
					: name === "anio_fabricacion"
					? parseInt(value, 10)
					: value.toUpperCase(),
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			const response = await axios.post(
				`${process.env.NEXT_PUBLIC_API_URL}/api/techniques`,
				{
					comanda_id: Number(commandId),
					...formData,
				}
			);
			console.log("Técnica creada:", response.data);
			setLoading(false);
		} catch (error) {
			console.error("Error de solicitud:", error);
			setLoading(false);
		}
	};

	if (loading) {
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
						src={myImage2}
						alt="Descripción de la imagen"
						className="w-16 h-16 object-contain opacity-90"
						loading="eager"
						priority
					/>
				</motion.div>
			</div>
		);
	}

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
								<h2 className="text-zinc-700">Añadir Fsormulario Tecnico</h2>
							</div>
						</div>
						<Card className="border-none shadow-lg">
							<CardHeader>
								<CardTitle className="text-2xl font-bold">
									Formulario Técnico
								</CardTitle>
							</CardHeader>
							<CardContent>
								<form onSubmit={handleSubmit} className="space-y-6">
									<Tabs defaultValue="informacion-general" className="w-full">
										<TabsList className="grid w-full grid-cols-2">
											<TabsTrigger value="informacion-general">
												Información General
											</TabsTrigger>
											<TabsTrigger value="detalles-tecnicos">
												Detalles Técnicos
											</TabsTrigger>
										</TabsList>
										<TabsContent
											value="informacion-general"
											className="space-y-4"
										>
											<div className="grid grid-cols-2 gap-4">
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
											<div>
												<Label htmlFor="propietario">Propietario</Label>
												<Input
													id="propietario"
													name="propietario"
													value={formData.propietario}
													onChange={handleChange}
													required
												/>
											</div>
											<div>
												<Label htmlFor="dni">DNI</Label>
												<Input
													id="dni"
													name="dni"
													value={formData.dni}
													onChange={handleChange}
													required
												/>
											</div>
											<div className="grid grid-cols-2 gap-4">
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
											<div className="grid grid-cols-2 gap-4">
												<div>
													<Label htmlFor="anio_fabricacion">
														Año de Fabricación
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
											<div>
												<Label htmlFor="observaciones_personales">
													Observaciones Personales
												</Label>
												<Textarea
													id="observaciones_personales"
													name="observaciones_personales"
													value={formData.observaciones_personales}
													onChange={handleChange}
												/>
											</div>
										</TabsContent>
										<TabsContent
											value="detalles-tecnicos"
											className="space-y-4"
										>
											<div className="grid grid-cols-2 gap-4">
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
											{["detalle1", "detalle2", "detalle3", "detalle4"].map(
												(detalle, index) => (
													<div
														key={detalle}
														className="flex items-center space-x-4"
													>
														<Image
															src={`/placeholder.svg?height=50&width=50&text=${
																index + 1
															}`}
															alt={`Detalle ${index + 1}`}
															width={50}
															height={50}
														/>
														<div className="flex-grow">
															<Label htmlFor={detalle}>{`Detalle ${
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
											<div>
												<Label htmlFor="observaciones_tecnicas">
													Observaciones Técnicas
												</Label>
												<Textarea
													id="observaciones_tecnicas"
													name="observaciones_tecnicas"
													value={formData.observaciones_tecnicas}
													onChange={handleChange}
												/>
											</div>
										</TabsContent>
									</Tabs>
									<div className="pt-6">
										<Button type="submit" className="w-full">
											Guardar Formulario Técnico
										</Button>
									</div>
								</form>
							</CardContent>
						</Card>
					</main>
				</>
			)}
		</div>
	);
}
