"use client";

import { useState, useEffect } from "react";
import { Calendar as AntCalendar, Badge, Card, ConfigProvider } from "antd";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { motion } from "framer-motion";
import Image from "next/image";
import myImage from "@/public/motorgas2.svg";
import "dayjs/locale/es";
import esES from "antd/locale/es_ES";
import { getEventsCalendar } from "../reservations/reservations.api";
import { CardContent } from "@/components/ui/card";
// import { Tooltip } from "antd";

import Aside from "@/components/Aside";

dayjs.locale("es"); // Configura dayjs para usar español
dayjs.extend(utc);

export const dynamic = "force-dynamic";

export default function Calendar() {
	const [tooltipVisible, setTooltipVisible] = useState(false);
	const [tooltipContent, setTooltipContent] = useState([]);
	const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

	const handleMouseEnter = (event, date) => {
		const eventsForDate = eventsCalendar.filter((event) =>
			event.date.isSame(date, "day")
		);

		if (eventsForDate.length > 0) {
			setTooltipContent(eventsForDate);

			// Agregar lógica para el mensaje de advertencia
			let warningMessage = "";
			if (eventsForDate.length >= 5) {
				warningMessage = "¡Ya no hay lugares!";
			} else if (eventsForDate.length === 4) {
				warningMessage = "¡Lugares llenos, preguntar por un lugar extra!";
			}

			setTooltipContent((prev) => ({
				events: prev, // Mantener los eventos existentes
				warningMessage: warningMessage, // Agregar mensaje de advertencia
			}));

			setTooltipVisible(true);
		}
	};

	const handleMouseLeave = () => {
		setTooltipVisible(false);
	};

	const handleMouseMove = (event) => {
		setTooltipPosition({
			top: event.clientY - 75, // Ajustar para que esté arriba
			left: event.clientX + 55, // Ajustar para que esté a la derecha
		});
	};

	const [eventsCalendar, setEventsCalendar] = useState([]);
	// const [eventosPorUsuario, setEventosPorUsuario] = useState({});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchEventsCalendar = async () => {
			const data = await getEventsCalendar();

			const formattedEvents = data.map((event) => {
				let eventDate = dayjs.utc(event.fecha_inicio);
				eventDate = eventDate.hour(8).minute(30).second(0);

				return {
					id: event.id,
					title: event.titulo,
					date: eventDate.local(), // Convierte a la hora local después de ajustar la hora
					usuario: event.boletos_reservas.usuarios.nombre_usuario,
					estado: event.estado,
				};
			});

			setEventsCalendar(formattedEvents);
			setLoading(false);
		};

		fetchEventsCalendar();
	}, []);

	const getBadgeStatus = (estado) => {
		switch (estado) {
			case "pendiente":
				return "default"; // Color por defecto
			case "confirmado":
				return "success"; // Verde
			case "completado":
				return "processing"; // Amarillo
			case "cancelado":
				return "error"; // Rojo
			case "no_presentado":
				return "warning"; // Naranja
			default:
				return "default"; // Por defecto si no se encuentra
		}
	};
	// Función para mostrar eventos en las fechas específicas
	const cellRender = (value) => {
		const events = eventsCalendar.filter((event) =>
			event.date.isSame(value, "day")
		);

		let warningMessage = "";
		if (events.length >= 5) {
			warningMessage = "¡Ya no hay lugares!";
		} else if (events.length === 4) {
			warningMessage = "¡Lugares llenos, preguntar por un lugar extra!";
		}

		// const capitalizeFirstLetter = (str) => {
		// 	if (!str) return ""; // Retorna vacío si el string está vacío
		// 	return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
		// };

		return (
			<ul
				onMouseEnter={(e) => handleMouseEnter(e, value)} // Pasar el evento y la fecha
				onMouseLeave={handleMouseLeave}
				onMouseMove={handleMouseMove}
				className="list-none p-0 m-0 w-full h-full"
			>
				{warningMessage && (
					<div className="flex items-center gap-1 line-clamp-1">
						<span className="text-red-500 text-sm font-normal  line-clamp-1">
							{warningMessage}
						</span>
					</div>
				)}
				{events.map((event) => (
					<li
						onMouseEnter={(e) => handleMouseEnter(e, value)} // Pasar el evento y la fecha
						onMouseLeave={handleMouseLeave}
						key={event.id}
					>
						<div className="flex items-center">
							<Badge
								status={getBadgeStatus(event.estado)}
								className="mr-2" // Añade un margen derecho para separación
							/>
							<span className="line-clamp-1">{event.title}</span>
						</div>
					</li>
				))}
			</ul>
		);
	};

	return (
		<ConfigProvider locale={esES}>
			<div className="flex-1 bg-zinc-50">
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
								src={myImage}
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
						<main className="flex p-6 flex-col w-full gap-6">
							{/* <div className="flex items-center justify-between mb-6">
								<div className="flex items-center gap-2">
									<HomeIcon href="/dashboard" label="Dashboard" />
									<h2 className="text-zinc-700 text-base">Calendario</h2>
								</div>
							</div> */}

							<Card className="rounded-xl bg-white border-none shadow-lg p-0">
								<CardContent className="p-0">
									<div className="flex space-x-4 mb-4">
										<div className="flex items-center">
											<Badge
												status={getBadgeStatus("pendiente")}
												text="Pendiente"
											/>
										</div>
										<div className="flex items-center">
											<Badge
												status={getBadgeStatus("completado")}
												text="En Proceso"
											/>
										</div>
										<div className="flex items-center">
											<Badge
												status={getBadgeStatus("confirmado")}
												text="Completo"
											/>
										</div>
									</div>

									<AntCalendar cellRender={cellRender} />
								</CardContent>
							</Card>
							{tooltipVisible && (
								<div
									className="absolute flex flex-col gap-2 bg-white shadow-xl p-4 z-10 text-sm rounded-lg w-60"
									style={{
										top: tooltipPosition.top,
										left: tooltipPosition.left,
									}}
								>
									{/* Mostrar mensaje de advertencia si existe */}
									{tooltipContent.warningMessage && (
										<div className="flex items-center gap-1">
											<span className="text-red-500 text-sm font-normal">
												{tooltipContent.warningMessage}
											</span>
										</div>
									)}
									<ul className="flex flex-col gap-2 text-zinc-600">
										{tooltipContent.events.map((event) => (
											<li key={event.id} className="flex flex-col gap-12">
												<div className="flex items-center">
													<Badge
														status={getBadgeStatus(event.estado)}
														className="mr-2"
													/>
													<span className="">{event.title}</span>
												</div>
											</li>
										))}
									</ul>
								</div>
							)}
							{/* <div className="flex items-center justify-between w-full gap-6">
								<Card className="rounded-xl shadow-lg border-none mb-4 w-full">
									<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
										<CardTitle className="text-sm font-normal text-zinc-800">
											Eventos de Usuarios
										</CardTitle>
										<Users className="w-4 h-4 text-muted-foreground" />
									</CardHeader>
									<CardContent>
										<div className="flex flex-col">
											{Object.entries(eventosPorUsuario).map(
												([usuario, count]) => (
													<div key={usuario} className="flex items-center mb-2">
														<div className="w-1/2 text-sm text-muted-foreground">
															{usuario}
														</div>
														<div className="relative w-1/2 h-4 bg-gray-200 rounded">
															<div
																className="absolute top-0 left-0 h-full bg-red-500 rounded"
																style={{
																	width: `${
																		(count /
																			Math.max(
																				...Object.values(eventosPorUsuario)
																			)) *
																		100
																	}%`,
																}}
															></div>
														</div>
														<div className="text-sm text-muted-foreground ml-2">
															{count}
														</div>
													</div>
												)
											)}
										</div>
									</CardContent>
								</Card>
								<Card className="rounded-xl shadow-lg border-none mb-4 w-full">
									<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
										<CardTitle className="text-sm font-normal text-zinc-800">
											Eventos de Usuarios
										</CardTitle>
										<Users className="w-4 h-4 text-muted-foreground" />
									</CardHeader>
									<CardContent>
										<div className="flex flex-col">
											{Object.entries(eventosPorUsuario).map(
												([usuario, count]) => (
													<div key={usuario} className="flex items-center mb-2">
														<div className="w-1/2 text-sm text-muted-foreground">
															{usuario}
														</div>
														<div className="relative w-1/2 h-4 bg-gray-200 rounded">
															<div
																className="absolute top-0 left-0 h-full bg-red-500 rounded"
																style={{
																	width: `${
																		(count /
																			Math.max(
																				...Object.values(eventosPorUsuario)
																			)) *
																		100
																	}%`,
																}}
															></div>
														</div>
														<div className="text-sm text-muted-foreground ml-2">
															{count}
														</div>
													</div>
												)
											)}
										</div>
									</CardContent>
								</Card>
							</div> */}
						</main>
					</>
				)}
			</div>
		</ConfigProvider>
	);
}
