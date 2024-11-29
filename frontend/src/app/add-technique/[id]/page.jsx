"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import Aside from "@/components/Aside";
import HomeIcon from "@/components/HomeIcon";

import { motion } from "framer-motion";
import Image from "next/image";
import myImage from "@/public/motorgas2.svg";

import { useSession } from "next-auth/react";
import axios from "axios";

import {
	getTechnique,
	updateCommand,
	updateCalendar,
} from "../../reservations/reservations.api";
import VehicleDetailsForm from "@/components/forms/VehicleDetailsForm";

export default function ComandaDetail({ params }) {
	const router = useRouter();
	const { data: session } = useSession();
	const loggedUserId = session?.user?.id;
	useEffect(() => {
		document.title = `Motorgas - Técnica ${params.id}`;
	}, [params.id]);
	const [comanda, setComanda] = useState(null);
	const [formData, setFormData] = useState({
		marca_vehiculo: "",
		modelo: "",
		patente: "",
		propietario: "",
		dni: "",
		observaciones_personales: "",
		observaciones_tecnicas: "",
		firma: "",
		detalle1: "",
		detalle2: "",
		detalle3: "",
		detalle4: "",
		detalle5: "",
		detalle6: "",
		detalle7: "",
		detalle8: "",
		detalle9: "",
		detalle10: "",
		detalle11: "",
		detalle12: "",
		detalle13: "",
		detalle14: "",
		detalle15: "",
		detalle16: "",
		detalle17: "",
		detalle18: "",
		detalle19: "",
		detalle20: "",
	});

	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const fetchTechnique = async () => {
			try {
				const data = await getTechnique(params.id);
				setComanda(data);

				setFormData({
					marca_vehiculo:
						data.marca_vehiculo ||
						data.comandas_tecnica_comanda_idTocomandas.boletos_reservas
							.marca_vehiculo,
					modelo:
						data.modelo ||
						data.comandas_tecnica_comanda_idTocomandas.boletos_reservas
							.modelo_vehiculo,

					dni: data.comandas_tecnica_comanda_idTocomandas.boletos_reservas
						.clientes.dni,
					propietario:
						data.comandas_tecnica_comanda_idTocomandas.boletos_reservas.clientes
							.nombre_completo,
					patente:
						data.comandas_tecnica_comanda_idTocomandas.boletos_reservas
							.patente_vehiculo,

					observaciones_personales: data.observaciones_personales,
					observaciones_tecnicas: data.observaciones_tecnicas,
					firma: data.firma,
					detalle1: data.detalle1 || "",
					detalle2: data.detalle2 || "",
					detalle3: data.detalle3 || "",
					detalle4: data.detalle4 || "",
					detalle5: data.detalle5 || "",
					detalle6: data.detalle6 || "",
					detalle7: data.detalle7 || "",
					detalle8: data.detalle8 || "",
					detalle9: data.detalle9 || "",
					detalle10: data.detalle10 || "",
					detalle11: data.detalle11 || "",
					detalle12: data.detalle12 || "",
					detalle13: data.detalle13 || "",
					detalle14: data.detalle14 || "",
					detalle15: data.detalle15 || "",
					detalle16: data.detalle16 || "",
					detalle17: data.detalle17 || "",
					detalle18: data.detalle18 || "",
					detalle19: data.detalle19 || "",
					detalle20: data.detalle20 || "",
				});
			} catch (err) {
				setError(err.message);
			}
		};

		fetchTechnique();
	}, [params.id]);

	const handleInputChange = (field, value) => {
		let processedValue = value;
		if (typeof value === "string" && field !== "firma") {
			processedValue = value.toUpperCase();
		}
		setFormData((prevFormData) => ({
			...prevFormData,
			[field]: processedValue,
		}));
	};

	const handleSubmitDetails = async (e) => {
		e.preventDefault();
		setLoading(true); // Iniciar carga
		const today = new Date();
		const day = today.getDate();
		const month = today.getMonth() + 1;

		try {
			const dataToUpdate = {
				dia: day,
				mes: month,
				marca_vehiculo: formData.marca_vehiculo,
				propietario: formData.propietario,
				dni: formData.dni,
				modelo: formData.modelo,
				patente: formData.patente,
				// comanda_id: Number(params.id),
				usuario_id: loggedUserId ? Number(loggedUserId) : null,
				observaciones_personales: formData.observaciones_personales,
				observaciones_tecnicas: formData.observaciones_tecnicas,
				estado: "pendiente",
				firma: formData.firma,
				detalle1: formData.detalle1,
				detalle2: formData.detalle2,
				detalle3: formData.detalle3,
				detalle4: formData.detalle4,
				detalle5: formData.detalle5,
				detalle6: formData.detalle6,
				detalle7: formData.detalle7,
				detalle8: formData.detalle8,
				detalle9: formData.detalle9,
				detalle10: formData.detalle10,
				detalle11: formData.detalle11,
				detalle12: formData.detalle12,
				detalle13: formData.detalle13,
				detalle14: formData.detalle14,
				detalle15: formData.detalle15,
				detalle16: formData.detalle16,
				detalle17: formData.detalle17,
				detalle18: formData.detalle18,
				detalle19: formData.detalle19,
				detalle20: formData.detalle20,
			};

			console.log("Enviando datos a la API...");

			const response = await axios.patch(
				`${process.env.NEXT_PUBLIC_API_URL}/api/techniques/${Number(params.id)}`,
				dataToUpdate,
				{
					headers: {
						"Content-Type": "application/json",
					},
				}
			);
			console.log("Respuesta de la API:", response.data);

			const commandId = comanda.comandas_tecnica_comanda_idTocomandas.id;
			await updateCommand(commandId, { estado: "en_proceso" });
			const calendarId =
				comanda.comandas_tecnica_comanda_idTocomandas.boletos_reservas
					.calendario[0].id;

			await updateCalendar(calendarId, { estado: "completado" });

			setComanda((prevComanda) => ({ ...prevComanda, ...dataToUpdate }));
			router.push("/dashboard");
		} catch (error) {
			console.error("Error al actualizar la técnica:", error);
			setShowToast("Error al actualizar la técnica");
		} finally {
			setLoading(false); // Detener carga al finalizar
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

	return (
		<div className="flex-1 bg-zinc-50">
			<Aside />
			<main className="flex flex-col items-stretch justify-normal p-6 z-50">
				<div className="flex items-center justify-between mb-6">
					<div className="flex items-center gap-2">
						<HomeIcon label="Volver"></HomeIcon>
						<h2 className="text-zinc-700 text-base">Tecnicas</h2>
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
										comanda.comandas_tecnica_comanda_idTocomandas.estado ===
										"en_proceso"
											? "bg-blue-100 text-blue-700"
											: comanda.comandas_tecnica_comanda_idTocomandas.estado ===
												  "completado"
												? "bg-green-100 text-green-700"
												: "bg-yellow-100 text-yellow-700"
									}`}
								>
									{comanda.comandas_tecnica_comanda_idTocomandas.estado ===
									"en_proceso"
										? "En Proceso"
										: comanda.comandas_tecnica_comanda_idTocomandas.estado ===
											  "completado"
											? "Completada"
											: "Pendiente"}
								</span>
							</CardHeader>
							<CardContent>
								<dl className="grid grid-cols-2 gap-2 text-sm">
									<dt className="font-medium text-zinc-500">Comanda:</dt>
									<dd>{comanda.comandas_tecnica_comanda_idTocomandas.id}</dd>
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
								<CardTitle className="text-xl font-light text-zinc-800">
									Detalles del Cliente
								</CardTitle>
							</CardHeader>
							<CardContent>
								<dl className="grid grid-cols-2 gap-2 text-sm">
									<dt className="font-medium text-zinc-500">Nombre:</dt>
									<dd>
										{comanda.comandas_tecnica_comanda_idTocomandas
											.boletos_reservas.clientes?.nombre_completo || "N/A"}
									</dd>
									<dt className="font-medium text-zinc-500">DNI:</dt>
									<dd>
										{comanda.comandas_tecnica_comanda_idTocomandas
											.boletos_reservas.clientes?.dni || "N/A"}
									</dd>
									<dt className="font-medium text-zinc-500">Domicilio:</dt>
									<dd>
										{comanda.comandas_tecnica_comanda_idTocomandas
											.boletos_reservas.clientes?.domicilio || "N/A"}
									</dd>
									<dt className="font-medium text-zinc-500">Localidad:</dt>
									<dd>
										{comanda.comandas_tecnica_comanda_idTocomandas
											.boletos_reservas.clientes?.localidad || "N/A"}
									</dd>
									<dt className="font-medium text-zinc-500">Teléfono:</dt>
									<dd className="truncate">
										{comanda.comandas_tecnica_comanda_idTocomandas
											.boletos_reservas.clientes?.telefono
											? `+549${comanda.comandas_tecnica_comanda_idTocomandas.boletos_reservas.clientes.telefono} @s.whatsapp.net`
											: "N/A"}
									</dd>
								</dl>
							</CardContent>
						</Card>
					</div>
					<VehicleDetailsForm
						formData={formData}
						handleInputChange={handleInputChange}
						handleSubmit={handleSubmitDetails}
						loading={loading}
					/>
				</div>
			</main>
		</div>
	);
}
