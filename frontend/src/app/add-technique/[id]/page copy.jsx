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
	getCommand,
	updateCommand,
	getTechnique,
} from "../../reservations/reservations.api";
import VehicleDetailsForm from "@/components/forms/VehicleDetailsForm";
import ChecklistForm from "@/components/forms/ChecklistForm";

export default function ComandaDetail({ params }) {
	const [showToast, setShowToast] = useState("");
	const { data: session } = useSession();
	const loggedUserId = session?.user?.id;

	const [comanda, setComanda] = useState(null);
	const [formData, setFormData] = useState({
		marca_vehiculo: "",
		modelo: "",
		anio: "",
		anio_fabricacion: "",
		patente: "",
		dominio: "",
		color: "",
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

	const [checkData] = useState({
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
						anio_fabricacion: tecnicaData.anio,
						dni: tecnicaData.dni,
						propietario: data.boletos_reservas.clientes.nombre_completo,
						patente: tecnicaData.patente,
						dominio: tecnicaData.dominio,
						color: tecnicaData.color,
						observaciones_personales: tecnicaData.observaciones_personales,
						observaciones_tecnicas: tecnicaData.observaciones_tecnicas,
						firma: tecnicaData.firma,
						detalle1: tecnicaData.detalle1 || "",
						detalle2: tecnicaData.detalle2 || "",
						detalle3: tecnicaData.detalle3 || "",
						detalle4: tecnicaData.detalle4 || "",
						detalle5: tecnicaData.detalle5 || "",
						detalle6: tecnicaData.detalle6 || "",
						detalle7: tecnicaData.detalle7 || "",
						detalle8: tecnicaData.detalle8 || "",
						detalle9: tecnicaData.detalle9 || "",
						detalle10: tecnicaData.detalle10 || "",
						detalle11: tecnicaData.detalle11 || "",
						detalle12: tecnicaData.detalle12 || "",
						detalle13: tecnicaData.detalle13 || "",
						detalle14: tecnicaData.detalle14 || "",
						detalle15: tecnicaData.detalle15 || "",
						detalle16: tecnicaData.detalle16 || "",
						detalle17: tecnicaData.detalle17 || "",
						detalle18: tecnicaData.detalle18 || "",
						detalle19: tecnicaData.detalle19 || "",
						detalle20: tecnicaData.detalle20 || "",
					});
				} else {
					setFormData({
						marca_vehiculo: data.boletos_reservas.marca_vehiculo,
						anio_fabricacion: data.boletos_reservas.anio_vehiculo,
						dni: data.boletos_reservas.clientes.dni,
						propietario: data.boletos_reservas.clientes.nombre_completo,
						modelo: data.boletos_reservas.modelo_vehiculo,
						anio: data.boletos_reservas.anio_vehiculo,
						dominio: data.boletos_reservas.dominio_vehiculo,
						color: data.boletos_reservas.color_vehiculo,
						observaciones_personales:
							data.boletos_reservas.observaciones_personales,
						observaciones_tecnicas:
							data.boletos_reservas.observaciones_tecnicas,
						patente: data.boletos_reservas.patente_vehiculo,
						firma: data.boletos_reservas.firma,
						detalle1: data.boletos_reservas.detalle1,
						detalle2: data.boletos_reservas.detalle2,
						detalle3: data.boletos_reservas.detalle3,
						detalle4: data.boletos_reservas.detalle4,
						detalle5: data.boletos_reservas.detalle5,
						detalle6: data.boletos_reservas.detalle6,
						detalle7: data.boletos_reservas.detalle7,
						detalle8: data.boletos_reservas.detalle8,
						detalle9: data.boletos_reservas.detalle9,
						detalle10: data.boletos_reservas.detalle10,
						detalle11: data.boletos_reservas.detalle11,
						detalle12: data.boletos_reservas.detalle12,
						detalle13: data.boletos_reservas.detalle13,
						detalle14: data.boletos_reservas.detalle14,
						detalle15: data.boletos_reservas.detalle15,
						detalle16: data.boletos_reservas.detalle16,
						detalle17: data.boletos_reservas.detalle17,
						detalle18: data.boletos_reservas.detalle18,
						detalle19: data.boletos_reservas.detalle19,
						detalle20: data.boletos_reservas.detalle20,
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
				anio: formData.anio ? parseInt(formData.anio, 10) : null,
				anio_fabricacion: formData.anio ? parseInt(formData.anio, 10) : null,
				patente: formData.patente,
				dominio: formData.dominio,
				color: formData.color,
				comanda_id: Number(params.id),
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

			if (comanda.tecnica_id) {
				const response = await axios.patch(
					`${process.env.NEXT_PUBLIC_API_URL}/api/techniques/${comanda.tecnica_id}`,
					dataToUpdate,
					{
						headers: {
							"Content-Type": "application/json",
						},
					}
				);
				console.log("Respuesta de la API:", response.data);
			} else {
				const response = await axios.post(
					`${process.env.NEXT_PUBLIC_API_URL}/api/techniques`,
					dataToUpdate,
					{
						headers: {
							"Content-Type": "application/json",
						},
					}
				);
				console.log("Respuesta de la API:", response.data);
			}

			setComanda((prevComanda) => ({ ...prevComanda, ...dataToUpdate }));
			const successMessage = "Edición de los detalles exitosa.";
			setShowToast(successMessage);
		} catch (error) {
			console.error("Error completo:", error);
			const responseErrorMessage =
				error.response?.data?.message || "Error al editar los detalles";
			console.log("Error:", error.response?.data || error.message);
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
									<dt className="font-medium text-zinc-500 ">Teléfono:</dt>
									<dd className="truncate">
										+549{comanda.boletos_reservas.clientes.telefono}
										@s.whatsapp.net
									</dd>
								</dl>
							</CardContent>
						</Card>
					</div>
					<VehicleDetailsForm
						formData={formData}
						handleInputChange={handleInputChange}
						handleSubmit={handleSubmitDetails}
						comanda={comanda}
						camposClaveVacios={camposClaveVacios}
						showToast={showToast}
						setShowToast={setShowToast}
					/>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* <ChecklistForm 
							formData={formData}
							handleInputChange={handleInputChange}
							handleSubmit={handleSubmitChecklist}
						/> */}
					</div>
				</div>
			</main>
		</div>
	);
}
