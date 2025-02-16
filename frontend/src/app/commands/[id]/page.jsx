"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Aside from "@/components/Aside";
import HomeIcon from "@/components/HomeIcon";
import { motion } from "framer-motion";
import Image from "next/image";
// import { Button } from "@/components/ui/button";
import myImage from "@/public/motorgas2.svg";
import { saveAs } from "file-saver";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import {
	getCommand,
	updateCommand,
	deleteArchive,
	getCommandCSV,
} from "../../reservations/reservations.api";

import CameraFileUpload from "@/components/CameraFileUpload";
import GeneralInfoCard from "@/components/commands/GeneralInfoCard";
import CustomerDetailsCard from "@/components/commands/CustomerDetailsCard";
import EquipmentDetailsCard from "@/components/commands/EquipmentDetailsCard";
import FilesSlider from "@/components/commands/FilesSlider";
import TechnicalDetailsCard from "@/components/commands/TechnicalDetailsCard";
import ReservationDetailsCard from "@/components/commands/ReservationDetailsCard";
import CheckListDetails from "@/components/commands/CheckListDetails";
import DownloadIcon from "@/components/DownloadIcon";
import { useSession } from "next-auth/react";
// import VehicleDetailsCard from "@/components/commands/VehicleDetailsCard";

export default function ComandaDetail({ params }) {
	const { data: session, status } = useSession();
	const [loggedUserId, setLoggedUserId] = useState(null);
	const [loading, setLoading] = useState(false);
	const [showToast, setShowToast] = useState("");
	useEffect(() => {
		document.title = `Motorgas - Comanda ${params.id}`;
	}, [params.id]); // Added params.id as a dependency
	const [comanda, setComanda] = useState(null);
	const [formData, setFormData] = useState({
		reductor_cod: "",
		reductor_numero: "",
		cilindro_1_cod: "",
		cilindro_1_numero: "",
		valvula_1_cod: "",
		valvula_1_numero: "",
		cilindro_2_cod: "",
		cilindro_2_numero: "",
		valvula_2_cod: "",
		valvula_2_numero: "",
		cilindro_3_cod: "",
		cilindro_3_numero: "",
		valvula_3_cod: "",
		valvula_3_numero: "",
		cilindro_4_cod: "",
		cilindro_4_numero: "",
		valvula_4_cod: "",
		valvula_4_numero: "",
		reforma_escape_texto: "",
		carga_externa: false,
		precio_carga_externa: "",
		cuna: "",
		materiales: "",
		pagos_efectivo_transferencia: "",
		pagos_tarjeta_1: "",
		pagos_plan_tarjeta_1: "",
		pagos_tarjeta_2: "",
		pagos_plan_tarjeta_2: "",
		pagos_tarjeta_3: "",
		pagos_plan_tarjeta_3: "",
		pagos_tarjeta_4: "",
		pagos_plan_tarjeta_4: "",
		pagos_tarjeta_5: "",
		pagos_plan_tarjeta_5: "",
		pagos_dolares: "",
	});

	const [error, setError] = useState(null);
	// const [debounceTimeout, setDebounceTimeout] = useState(null);

	useEffect(() => {
		if (status === "authenticated" && session?.user?.id) {
			const userId = parseInt(session.user.id);
			if (!isNaN(userId)) {
				setLoggedUserId(userId);
			}
		}
	}, [session, status]);

	const currentUserId = loggedUserId;
	console.log(currentUserId);

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
			// Verificar si todos los archivos están verificados después de una actualización
			const allVerified = comanda.archivo.every((file) => file.verificado);
			if (allVerified) {
				setShowToast(""); // O cualquier otra lógica que necesites
			}
		}
	}, [comanda]); // Dependencia en el objeto comanda

	useEffect(() => {
		if (comanda) {
			setFormData((prevFormData) => ({
				...prevFormData,
				...{
					reductor_cod: comanda.reductor_cod || "",
					reductor_numero: comanda.reductor_numero || "",
					cilindro_1_cod: comanda.cilindro_1_cod || "",
					cilindro_1_numero: comanda.cilindro_1_numero || "",
					valvula_1_cod: comanda.valvula_1_cod || "",
					valvula_1_numero: comanda.valvula_1_numero || "",
					cilindro_2_cod: comanda.cilindro_2_cod || "",
					cilindro_2_numero: comanda.cilindro_2_numero || "",
					valvula_2_cod: comanda.valvula_2_cod || "",
					valvula_2_numero: comanda.valvula_2_numero || "",
					cilindro_3_cod: comanda.cilindro_3_cod || "",
					cilindro_3_numero: comanda.cilindro_3_numero || "",
					valvula_3_cod: comanda.valvula_3_cod || "",
					valvula_3_numero: comanda.valvula_3_numero || "",
					cilindro_4_cod: comanda.cilindro_4_cod || "",
					cilindro_4_numero: comanda.cilindro_4_numero || "",
					valvula_4_cod: comanda.valvula_4_cod || "",
					valvula_4_numero: comanda.valvula_4_numero || "",
					reforma_escape_texto: comanda.reforma_escape_texto || "",
					carga_externa: comanda.carga_externa,
					precio_carga_externa: comanda.precio_carga_externa || "",
					cuna: comanda.cuna || "",
					materiales: comanda.materiales || "",
					pagos_efectivo_transferencia:
						comanda.pagos_efectivo_transferencia || "",
					pagos_tarjeta_1: comanda.pagos_tarjeta_1 || "",
					pagos_plan_tarjeta_1: comanda.pagos_plan_tarjeta_1 || "",
					pagos_tarjeta_2: comanda.pagos_tarjeta_2 || "",
					pagos_plan_tarjeta_2: comanda.pagos_plan_tarjeta_2 || "",
					pagos_tarjeta_3: comanda.pagos_tarjeta_3 || "",
					pagos_plan_tarjeta_3: comanda.pagos_plan_tarjeta_3 || "",
					pagos_tarjeta_4: comanda.pagos_tarjeta_4 || "",
					pagos_plan_tarjeta_4: comanda.pagos_plan_tarjeta_4 || "",
					pagos_tarjeta_5: comanda.pagos_tarjeta_5 || "",
					pagos_plan_tarjeta_5: comanda.pagos_plan_tarjeta_5 || "",
					pagos_dolares: comanda.pagos_dolares || "",
				},
			}));
		}
	}, [comanda]);

	if (error) {
		return <div>Error: {error}</div>;
	}

	const handleInputChange = (field, value) => {
		// Convertir el valor a mayúsculas si es un string
		const processedValue =
			typeof value === "string" ? value.toUpperCase() : value;

		// Actualizar únicamente el campo modificado en el estado local
		setFormData((prevFormData) => ({
			...prevFormData,
			[field]: processedValue,
		}));
	};

	// // Inicia debounce para actualizar la API
	// if (debounceTimeout) {
	// 	clearTimeout(debounceTimeout);
	// }

	// const timeout = setTimeout(() => {
	// 	updateCommandData(field, processedValue);
	// }, 500);

	// setDebounceTimeout(timeout);
	// const updateCommandData = async (field, value) => {
	// 	setLoading(true); // Iniciar carga
	// 	try {
	// 		const dataToUpdate = {
	// 			...formData,
	// 			[field]: value,
	// 		};
	// 		await updateCommand(comanda.id, dataToUpdate);
	// 		setComanda((prevComanda) => ({ ...prevComanda, ...dataToUpdate }));
	// 		setShowToast("Actualización exitosa.");
	// 	} catch (error) {
	// 		console.error("Error al actualizar", error);
	// 		setShowToast("Error al actualizar la comanda.");
	// 	} finally {
	// 		setLoading(false); // Detener carga al finalizar
	// 	}
	// };

	const handleSubmitDetails = async (event) => {
		event.preventDefault();
		setLoading(true); // Iniciar carga

		// Filtrar solo los campos modificados
		const changes = Object.keys(formData).reduce((acc, key) => {
			// Si el valor ha cambiado, lo agregamos al objeto de cambios
			if (formData[key] !== comanda[key]) {
				acc[key] = formData[key];
			}
			return acc;
		}, {});

		// Si no hay cambios, no hacer nada
		if (Object.keys(changes).length === 0) {
			setShowToast("Error. No se han realizado cambios.");
			setLoading(false);
			return;
		}

		try {
			// Actualizar solo los campos modificados
			await updateCommand(comanda.id, changes);

			// Actualizar comanda local con los cambios
			setComanda((prevComanda) => ({ ...prevComanda, ...changes }));

			setShowToast("Actualización exitosa.");
		} catch (error) {
			console.error("Error al actualizar", error);
			setShowToast("Error al actualizar la comanda.");
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

	const downloadCsv = async (id) => {
		console.log("ID de la comanda:", id); // Verificar que el ID es correcto

		try {
			// Llamada a la API para obtener los datos
			const response = await getCommandCSV(id);
			console.log("Datos recibidos:", response); // Verificar la respuesta

			if (!response || !response.id) {
				throw new Error("Datos de la comanda no son válidos.");
			}

			// Usamos la función para generar el CSV directamente
			generateCSV([response]); // Aseguramos que se pase un array de objetos
		} catch (error) {
			console.error("Error al descargar CSV:", error.message); // Imprimir el error
		}
	};

	const generateCSV = (data) => {
		// Verificar que el tipo de dato es un array
		if (!Array.isArray(data)) {
			data = [data]; // Convertimos el objeto en un array de un solo objeto si es necesario
		}

		// Aquí generamos el CSV a partir del array de objetos
		const headers = Object.keys(data[0]);
		const rows = data.map(
			(item) => headers.map((header) => (item[header] || "").toString()) // Aseguramos que cada valor sea una cadena
		);

		const csvContent = [
			headers.join(","), // Los encabezados de las columnas
			...rows.map((row) => row.join(",")),
		].join("\n");

		// Descargar el CSV utilizando file-saver
		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
		saveAs(blob, `comanda-${data[0].id}.csv`); // Usamos la función saveAs de file-saver para descargar el archivo
	};

	return (
		<div className="flex-1 bg-zinc-50">
			<Aside />
			<main className="flex flex-col p-6 lg:px-8 xl:px-8 z-50 w-full">
				<HomeIcon />
				<Link
					href={`/reservations/${comanda.boletos_reservas.id}`}
					className="flex items-center justify-between mb-2 bg-emerald-100 shadow-md rounded-lg w-full py-1 hover:bg-emerald-50 transition-all duration-300 border border-transparent hover:border-emerald-300 hover:text-emerald-300 group cursor-pointer"
				>
					<div className="flex items-center justify-center gap-2 w-full">
						<nav className="flex items-center">
							<>
								<Button
									variant="ghost"
									size="sm"
									className="rounded-full font-normal text-emerald-600 hover:text-emerald-600 flex items-center gap-2 z-50 py-4 hover:bg-transparent text-sm"
									onClick={(e) => {
										e.stopPropagation(); // Previene que el clic se propague al TableRow
									}}
								>
									Ver Reserva
									<Eye strokeWidth={1.5} className="h-5 w-5 text-emerald-600" />
								</Button>
							</>
						</nav>
					</div>
				</Link>
				<DownloadIcon
					onClick={() => downloadCsv(params.id)}
					label="Descargar"
				/>

				<div className="grid gap-6 w-full">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
						{/* //TODO: INFORMACION GENERAL DE LA COMANDA. */}
						<GeneralInfoCard comanda={comanda} />
						{/* //TODO: INFORMCACION GENERAL DEL CLIENTE. */}
						<CustomerDetailsCard cliente={comanda.boletos_reservas.clientes} />
						<ReservationDetailsCard comanda={comanda} />
					</div>
					{/* //TODO: FORM DE LA COMANDA 1era PARTE. */}

					<EquipmentDetailsCard
						formData={formData}
						handleSubmit={handleSubmitDetails}
						handleInputChange={handleInputChange}
						comanda={comanda}
						showToast={showToast}
						setShowToast={setShowToast}
						camposClaveVacios={camposClaveVacios}
						loading={loading}
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
								{/* <CardHeader>
									<CardTitle className="text-xl font-light text-zinc-800">
										Previsualización de Archivos
									</CardTitle>
								</CardHeader> */}
								<CardContent className="flex flex-col items-stretch h-full overflow-hidden p-6 pt-6 relative">
									{/* {comanda.archivo.some(
										(file) =>
											file.usuario_id !== null &&
											file.usuario_id !== currentUserId &&
											file.usuario_id !== 2 &&
											!file.verificado
									) && (
										<div className="pt-6 absolute -top-2 left-6 w-full">
											<p className="text-sm text-red-500">
												Verificar la documentacion adjuntada por el usuario.
											</p>
										</div>
									)} */}
									<div className="flex overflow-x-auto gap-4 px-0 py-6 text-sm rounded-lg h-full w-full">
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

						<div className="grid grid-cols-2 gap-4 P-6 border-none rounded-lg col-span-2">
							<TechnicalDetailsCard
								comanda={comanda}
								handleDeleteArchive={handleDeleteArchive}
							/>
							{/* <VehicleDetailsCard comanda={comanda} /> */}
							<CheckListDetails comanda={comanda} />
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
