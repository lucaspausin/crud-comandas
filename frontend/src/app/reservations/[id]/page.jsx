"use client";
import { useRef, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import myImage from "@/public/motorgasblue.svg";
import myImage2 from "@/public/motorgas2.svg";

import HomeIcon from "@/components/HomeIcon";
import DownloadIcon from "@/components/DownloadIcon";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
// import html2pdf from "html2pdf.js";

// import { Button } from "next/button";

import { getReservation } from "../reservations.api";

import Aside from "@/components/Aside";

export default function ReservationDetailPage({ params }) {
	const slidesRef = useRef(null);
	const [loading, setLoading] = useState(true);

	const [reservation, setReservation] = useState(null);

	useEffect(() => {
		const fetchReservation = async () => {
			setLoading(true);
			try {
				const data = await getReservation(params.id);
				setReservation(data);
			} finally {
				setLoading(false);
			}
		};

		fetchReservation();
	}, [params.id]);

	const handleGeneratePdf = async () => {
		if (typeof window !== "undefined") {
			const html2pdf = (await import("html2pdf.js")).default;
			const opt = {
				margin: 0.5,
				filename: `Motorgas - Boleto de Reserva #${reservation.id}.pdf`,
				image: { type: "jpeg", quality: 1 },
				html2canvas: { scale: 2 },
				jsPDF: { unit: "in", format: "A4", orientation: "portrait" },
			};
			html2pdf().from(slidesRef.current).set(opt).save();
		}
	};
	return (
		<div className="flex bg-zinc-50">
			{/* Sidebar */}
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
							className="w-20 h-20 object-contain opacity-90"
							loading="eager"
						/>
					</motion.div>
				</div>
			) : (
				<>
					<Aside />

					{/* Main Content */}
					<main className="flex flex-col w-full p-6">
						<div className="flex items-center justify-between mb-6">
							<div className="flex items-center gap-2">
								<HomeIcon label="Volver"></HomeIcon>
								<h2 className="text-zinc-700 text-base">Reservas</h2>
							</div>
							{/* <Button onClick={handleGeneratePdf}>Hola</Button> */}
							<div className="flex items-center gap-4">
								<Link href={`/reservations/edit/${reservation.id}`}>
									<Button
										variant="ghost"
										size="sm"
										className="rounded-full z-50 py-5 px-[0.75rem] bg-orange-100 hover:bg-orange-50"
										onClick={(e) => {
											e.stopPropagation(); // Previene que el clic se propague al TableRow
										}}
									>
										<Pencil className="h-4 w-4 text-orange-600" />
									</Button>
								</Link>
								<DownloadIcon
									onClick={handleGeneratePdf} // Pasar el manejador aquí
									label="Descargar"
								/>
							</div>
						</div>

						<Card className="rounded-xl  bg-white border-none shadow-lg">
							<CardHeader className="border-b">
								<div className="flex justify-between items-center">
									<CardTitle className="text-lg font-light">
										Boleto de Reserva #{reservation.id}
									</CardTitle>
									{/* <Button variant="outline" size="sm" className="rounded-full">
								<Download className="w-4 h-4 mr-2" />
								Descargar PDF
							</Button> */}
								</div>
							</CardHeader>
							<CardContent className="p-6" ref={slidesRef}>
								<div className="flex items-start mb-8 space-x-6 ">
									<Image
										src={myImage}
										alt="Motorgas GNC Logo"
										className="rounded-lg object-cover w-20 h-20"
									/>
									<div className="text-sm text-gray-600">
										<p className="font-medium text-sm mb-2">Motorgas GNC.</p>
										{/* <p>De Joaquín González Silvestri</p>
										<p>CUIT 20-31464354-3</p> */}
										<p>Av. Presidente Perón 3679</p>
										<p>Morón, Buenos Aires, Argentina</p>
										<p>Whatsapp: +54 9 11 2308-4826</p>
									</div>
								</div>
								<div className="grid grid-cols-2 gap-x-8 gap-y-6 mb-8 border-t mt-8 pt-8">
									<div>
										<p className="text-sm font-medium text-gray-500 mb-1">
											Asesor De Venta
										</p>
										<p className="text-sm text-zinc-800">
											{reservation.usuarios.nombre_usuario}
										</p>
									</div>
									<div>
										<p className="text-sm font-medium text-gray-500 mb-1">
											Cliente
										</p>
										<p className="text-sm text-zinc-800">
											{reservation.clientes.nombre_completo}
										</p>
									</div>

									<div>
										<p className="text-sm font-medium text-gray-500 mb-1">
											DNI
										</p>
										<p className="text-sm text-zinc-800">
											{reservation.clientes.dni}
										</p>
									</div>
									<div>
										<p className="text-sm font-medium text-gray-500 mb-1">
											Domicilio
										</p>
										<p className="text-sm text-zinc-800">
											{reservation.clientes.domicilio}
										</p>
									</div>
									<div>
										<p className="text-sm font-medium text-gray-500 mb-1">
											Localidad
										</p>
										<p className="text-sm text-zinc-800">
											{reservation.clientes.localidad}
										</p>
									</div>
									<div>
										<p className="text-sm font-medium text-gray-500 mb-1">
											Teléfono
										</p>
										<p className="text-sm text-zinc-800 truncate">
											+549{reservation.clientes.telefono}@s.whatsapp.net
										</p>
									</div>
								</div>
								<div className="grid grid-cols-2 gap-x-8 gap-y-6 mb-8 mt-8 pt-8 border-t">
									<div>
										<p className="text-sm font-medium text-gray-500 mb-1">
											Marca del Vehículo
										</p>
										<p className="text-sm text-zinc-800">
											{reservation.marca_vehiculo}
										</p>
									</div>
									<div>
										<p className="text-sm font-medium text-gray-500 mb-1">
											Modelo del Vehículo
										</p>
										<p className="text-sm text-zinc-800">
											{reservation.modelo_vehiculo}
										</p>
									</div>
									<div>
										<p className="text-sm font-medium text-gray-500 mb-1">
											Patente
										</p>
										<p className="text-sm text-zinc-800">
											{reservation.patente_vehiculo}
										</p>
									</div>
									<div>
										<p className="text-sm font-medium text-gray-500 mb-1">
											Equipo
										</p>
										<p className="text-sm text-zinc-800">
											{reservation.equipo}
										</p>
									</div>
									<div>
										<p className="text-sm font-medium text-gray-500 mb-1">
											Reforma De Escape
										</p>
										<p className="text-sm text-zinc-800">
											{reservation.reforma_escape ? "Si" : "No"}
										</p>
									</div>
									<div>
										<p className="text-sm font-medium text-gray-500 mb-1">
											Carga Externa
										</p>
										<p className="text-sm text-zinc-800">
											{reservation.carga_externa ? "Si" : "No"}
										</p>
									</div>
									<div>
										<p className="text-sm font-medium text-gray-500 mb-1">
											Seña
										</p>
										<p className="text-sm text-zinc-800">
											{new Intl.NumberFormat("es-AR", {
												style: "currency",
												currency: "ARS",
											}).format(reservation.sena)}
										</p>
									</div>
									<div>
										<p className="text-sm font-medium text-gray-500 mb-1">
											Fecha de Reserva y Horario
										</p>
										<p className="text-sm text-zinc-800">
											{new Date(reservation.creado_en).toLocaleDateString(
												"es-ES",
												{
													day: "2-digit",
													month: "2-digit",
												}
											)}{" "}
											{new Date(reservation.creado_en).toLocaleTimeString(
												"es-ES",
												{
													hour: "2-digit",
													minute: "2-digit",
												}
											)}
										</p>
									</div>
									<div>
										<p className="text-sm font-medium text-gray-500 mb-1">
											Servicio
										</p>
										<p className="text-sm text-zinc-800">Instalación de GNC</p>
									</div>
									<div>
										<p className="text-sm font-medium text-gray-500 mb-1">
											Fecha de Instalacion
										</p>
										<p className="text-sm text-zinc-800">
											{(() => {
												const utcDate = new Date(reservation.fecha_instalacion);
												const localDate = new Date(
													utcDate.getTime() + 3 * 60 * 60 * 1000
												);

												return (
													localDate.toLocaleDateString("es-ES", {
														day: "2-digit",
														month: "2-digit",
													}) + " 08:30"
												);
											})()}
										</p>
									</div>
									<div>
										<p className="text-sm font-medium text-gray-500 mb-1">
											Precio
										</p>
										<p className="text-sm text-zinc-800">
											{new Intl.NumberFormat("es-AR", {
												style: "currency",
												currency: "ARS",
											}).format(reservation.precio)}
										</p>
									</div>
								</div>
								<div className="mt-8 pt-8 border-t text-sm text-gray-600 space-y-2">
									<p>
										La recepción de vehículos comienza a las 8:30 hs, por orden
										de llegada.
									</p>
									<p>El pago total deberá efectuarse al momento de ingreso.</p>
									<p>
										La entrega de los vehículos se realizará a partir de las
										17:30 hs de lunes a viernes, o a partir de las 13:30 hs los
										sábados.
									</p>
								</div>
							</CardContent>
						</Card>
					</main>
				</>
			)}
		</div>
	);
}
