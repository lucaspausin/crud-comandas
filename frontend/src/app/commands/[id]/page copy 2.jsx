"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Aside from "@/components/Aside";
import HomeIcon from "@/components/HomeIcon";
// import { X } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import myImage from "@/public/motorgas2.svg";

import {
	getCommand,
	updateCommand,
	deleteArchive,
} from "../../reservations/reservations.api";

import CameraFileUpload from "@/components/CameraFileUpload";
import GeneralInfoCard from "@/components/commands/GeneralInfoCard";
import CustomerDetailsCard from "@/components/commands/CustomerDetailsCard";
import EquipmentDetailsCard from "@/components/commands/EquipmentDetailsCard";
import FilesSlider from "@/components/commands/FilesSlider";
import TechnicalDetailsCard from "@/components/commands/TechnicalDetailsCard";
import ReservationDetailsCard from "@/components/commands/ReservationDetailsCard";
import CheckListDetails from "@/components/commands/CheckListDetails";
import VehicleDetailsCard from "@/components/commands/VehicleDetailsCard";

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
	const handleSubmit = async (e, comandaId) => {
		e.preventDefault();
		try {
			const dataToUpdate = {
				reductor_cod: formData.reductor_cod,
				reductor_numero: formData.reductor_numero || null,
				cilindro_1_cod: formData.cilindro_1_cod,
				cilindro_1_numero: formData.cilindro_1_numero || null,
				valvula_1_cod: formData.valvula_1_cod,
				valvula_1_numero: formData.valvula_1_numero || null,
				reforma_escape_texto: formData.reforma_escape_texto,
				carga_externa: formData.carga_externa,
				precio_carga_externa: formData.precio_carga_externa || null,
				cilindro_2_cod: formData.cilindro_2_cod,
				cilindro_2_numero: formData.cilindro_2_numero || null,
				valvula_2_cod: formData.valvula_2_cod,
				valvula_2_numero: formData.valvula_2_numero || null,
				cuna: formData.cuna,
				materiales: formData.materiales,
				estado: "pendiente",
			};

			await updateCommand(comandaId, dataToUpdate);
			setComanda((prevComanda) => ({ ...prevComanda, ...dataToUpdate }));

			const successMessage = "Edición de la comanda exitosa.";
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
						{/* //TODO: INFORMACION GENERAL DE LA COMANDA. */}

						<GeneralInfoCard comanda={comanda} />
						{/* //TODO: INFORMCACION GENERAL DEL CLIENTE. */}
						<CustomerDetailsCard cliente={comanda.boletos_reservas.clientes} />
					</div>
					{/* //TODO: FORM DE LA COMANDA 1era PARTE. */}

					<EquipmentDetailsCard
						formData={formData}
						handleInputChange={handleInputChange}
						handleSubmit={handleSubmit}
						comanda={comanda}
						showToast={showToast}
						setShowToast={setShowToast}
						camposClaveVacios={camposClaveVacios}
					/>
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
						{/* ARCHIVOS */}
						{comanda.archivo.length > 0 && (
							<Card className="col-span-2 border-none rounded-lg shadow-lg">
								<CardContent className="flex flex-col items-stretch h-full overflow-hidden p-4">
									<div className="flex overflow-x-auto gap-4 px-0 py-6 text-sm rounded-lg h-full">
										{comanda.archivo.map((file, index) => (
											<FilesSlider
												key={file.id}
												file={file}
												index={index}
												handleDeleteArchive={handleDeleteArchive}
											/>
										))}
									</div>
								</CardContent>
							</Card>
						)}
						<VehicleDetailsCard comanda={comanda} />
						<ReservationDetailsCard comanda={comanda} />
						<TechnicalDetailsCard comanda={comanda} />
						<CheckListDetails comanda={comanda} />
					</div>
				</div>
			</main>
		</div>
	);
}