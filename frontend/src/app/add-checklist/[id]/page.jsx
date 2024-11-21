"use client";

import { useState, useEffect } from "react";

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
} from "../../reservations/reservations.api";
// import VehicleDetailsForm from "@/components/forms/VehicleDetailsForm";

import ChecklistForm2 from "@/components/forms/CheckListForm2";
export default function ComandaDetail({ params }) {
	// const [showToast, setShowToast] = useState("");
	const { data: session } = useSession();
	const loggedUserId = session?.user?.id;

	const [comanda, setComanda] = useState(null);
	const [checkData, setCheckData] = useState({
		perdidas_gas: false,
		cableado: false,
		nivel_agua: false,
		nivel_aceite: false,
		inspeccion_instalacion: false,
		funcionamiento_unidad: false,
		herramientas: false,
		otras_observaciones: "",
		kilometros: "",
		firma_tecnico: "",
		estado: "",
	});

	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchTechnique = async () => {
			try {
				const data = await getTechnique(params.id);
				setComanda(data);

				setCheckData({
					perdidas_gas: data.perdidas_gas || false,
					cableado: data.cableado || false,
					nivel_agua: data.nivel_agua || false,
					nivel_aceite: data.nivel_aceite || false,
					inspeccion_instalacion: data.inspeccion_instalacion || false,
					funcionamiento_unidad: data.funcionamiento_unidad || false,
					herramientas: data.herramientas || false,
					otras_observaciones: data.otras_observaciones || "",
					kilometros: data.kilometros || "",
					firma_tecnico: data.firma_tecnico || "",
				});
			} catch (err) {
				setError(err.message);
			}
		};

		fetchTechnique();
	}, [params.id]);

	const handleInputChange = (field, value) => {
		let processedValue = value;
		if (typeof value === "string" && field !== "firma_tecnico") {
			processedValue = value.toUpperCase();
		}
		setCheckData((prevCheckData) => ({
			...prevCheckData,
			[field]: processedValue,
		}));
	};

	const handleSubmitDetails = async (e) => {
		e.preventDefault();
		const today = new Date();
		const day = today.getDate();
		const month = today.getMonth() + 1;

		try {
			const dataToUpdate = {
				dia: day,
				mes: month,
				usuario_id: loggedUserId ? Number(loggedUserId) : null,
				...checkData,
				estado: "completo",
			};

			console.log("Enviando datos a la API...");

			const response = await axios.patch(
				`${process.env.NEXT_PUBLIC_API_URL}/api/techniques/${Number(
					params.id
				)}`,
				dataToUpdate,
				{
					headers: {
						"Content-Type": "application/json",
					},
				}
			);
			console.log("Respuesta de la API:", response.data);

			const commandId = comanda.comandas_tecnica_comanda_idTocomandas.id;
			await updateCommand(commandId, { estado: "completado" });

			setComanda((prevComanda) => ({ ...prevComanda, ...dataToUpdate }));
			// const successMessage = "Edición de los detalles exitosa.";
			// setShowToast(successMessage);
		} catch (error) {
			console.error("Error al actualizar la técnica:", error);
			// setShowToast("Error al actualizar la técnica");
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
					{/* <ChecklistForm
						checkData={checkData}
						handleInputChange={handleInputChange}
						handleSubmit={handleSubmitDetails}
					/> */}
					<ChecklistForm2
						checkData={checkData}
						handleInputChange={handleInputChange}
						handleSubmit={handleSubmitDetails}
					/>
				</div>
			</main>
		</div>
	);
}
