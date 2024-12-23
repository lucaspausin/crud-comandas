"use client";
import { useState, useEffect } from "react";
import {
	Calendar as AntCalendar,
	Badge,
	Card,
	ConfigProvider,
	Tooltip,
} from "antd";
import dayjs from "dayjs";
import { CardContent } from "@/components/ui/card";
import utc from "dayjs/plugin/utc";
import { motion } from "framer-motion";
import Image from "next/image";
import myImage from "@/public/motorgas2.svg";
import "dayjs/locale/es";
import esES from "antd/locale/es_ES";
import { getEventsCalendar } from "../reservations/reservations.api";

// import { Tooltip } from "antd";

import Aside from "@/components/Aside";

dayjs.locale("es");
dayjs.extend(utc);

export default function Calendar() {
	const [eventsCalendar, setEventsCalendar] = useState([]);

	const [loading, setLoading] = useState(true);
	// const [userEventCounts, setUserEventCounts] = useState({});

	useEffect(() => {
		document.title = "Motorgas - Calendario";
	}, []);

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

	// useEffect(() => {
	// 	if (eventsCalendar.length > 0) {
	// 		const currentMonth = dayjs().startOf("month");
	// 		const nextMonth = dayjs().endOf("month");
	// 		const today = dayjs();

	// 		// Filter events for current month
	// 		const currentMonthEvents = eventsCalendar.filter((event) => {
	// 			const eventDate = dayjs(event.date);
	// 			return (
	// 				(eventDate.isAfter(currentMonth) && eventDate.isBefore(nextMonth)) ||
	// 				eventDate.isSame(currentMonth, "day") ||
	// 				eventDate.isSame(nextMonth, "day")
	// 			);
	// 		});

	// 		// Filter events from start of month until today
	// 		const monthToDateEvents = currentMonthEvents.filter(
	// 			(event) =>
	// 				dayjs(event.date).isBefore(today) ||
	// 				dayjs(event.date).isSame(today, "day")
	// 		);

	// 		// Filter completed events for current month
	// 		const completedEvents = currentMonthEvents.filter(
	// 			(event) =>
	// 				event.estado === "confirmado" || event.estado === "completado"
	// 		);

	// 		// Initialize counts object with all users from current month events
	// 		const counts = {};
	// 		currentMonthEvents.forEach((event) => {
	// 			if (!counts[event.usuario]) {
	// 				counts[event.usuario] = { total: 0, untilToday: 0, completed: 0 };
	// 			}
	// 		});

	// 		// Count total events per user
	// 		currentMonthEvents.forEach((event) => {
	// 			counts[event.usuario].total++;
	// 		});

	// 		// Count events until today
	// 		monthToDateEvents.forEach((event) => {
	// 			counts[event.usuario].untilToday++;
	// 		});

	// 		// Count completed events
	// 		completedEvents.forEach((event) => {
	// 			counts[event.usuario].completed++;
	// 		});

	// 		setUserEventCounts(counts);
	// 	}
	// }, [eventsCalendar]);

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

	const getTooltipContent = (date) => {
		const eventsForDate = eventsCalendar.filter((event) =>
			event.date.isSame(date, "day")
		);

		if (eventsForDate.length === 0) return null;

		let warningMessage = "";
		if (eventsForDate.length >= 5) {
			warningMessage = "¡Ya no hay lugares!";
		} else if (eventsForDate.length === 4) {
			warningMessage = "¡Lugares llenos, preguntar por un lugar extra!";
		}

		return (
			<div className="flex flex-col gap-2 text-zinc-700">
				{warningMessage && (
					<span className="text-red-500 text-sm font-normal">
						{warningMessage}
					</span>
				)}
				<ul className="flex flex-col gap-2">
					{eventsForDate.map((event) => (
						<li key={event.id} className="flex items-center">
							<Badge status={getBadgeStatus(event.estado)} className="mr-2" />
							<span>{event.title}</span>
						</li>
					))}
				</ul>
			</div>
		);
	};

	const cellRender = (value) => {
		const events = eventsCalendar.filter((event) =>
			event.date.isSame(value, "day")
		);

		return (
			<Tooltip
				title={getTooltipContent(value)}
				trigger="click"
				overlayClassName="w-60"
				overlayInnerStyle={{
					backgroundColor: "white",
					boxShadow:
						"0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
					borderRadius: "0.5rem",
				}}
			>
				<ul className="list-none p-0 m-0 w-full h-full">
					{events.map((event) => (
						<li key={event.id}>
							<div className="flex items-center">
								<Badge status={getBadgeStatus(event.estado)} className="mr-2" />
								<span className="line-clamp-1">{event.title}</span>
							</div>
						</li>
					))}
				</ul>
			</Tooltip>
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
									{/* <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-200 opacity-10" />

									<div className="absolute inset-0 rounded-xl" />

									<CardContent className="relative py-0 px-0 overflow-hidden">
									
										<div className="relative h-full flex flex-col p-0">
											<div className="space-y-4 mb-6">
											
											</div>

											<div className="grid grid-cols-5 gap-0">
												{Object.entries(userEventCounts)
													.sort(([, a], [, b]) => b.total - a.total)
													.map(([userName, counts], index) => (
														<div
															key={userName}
															className="flex flex-col p-12 bg-white border border-zinc-100 hover:bg-zinc-50/80 transition-all duration-200"
														>
															<div className="flex items-center gap-3 mb-4">
																<span className="text-lg text-zinc-400">
																	0{index + 1}.
																</span>
																<span className="text-lg text-zinc-500 capitalize">
																	{userName}
																</span>
															</div>
															<div className="flex flex-col gap-3 text-sm">
																<div className="space-y-1">
																	<p className="text-zinc-500">Total del mes</p>
																	<p className="text-zinc-700">
																		{counts.total}{" "}
																		{counts.total === 1
																			? "vehículo"
																			: "vehículos"}
																	</p>
																</div>
																<div className="flex flex-row items-center gap-4">
																	<div className="space-y-1 border-r pr-4">
																		<p className="text-zinc-500">Hasta hoy</p>
																		<p className="text-zinc-700">
																			{counts.untilToday}
																		</p>
																	</div>
																	<div className="space-y-1">
																		<p className="text-zinc-500">Completados</p>
																		<p className="text-zinc-700">
																			{counts.completed}{" "}
																			{counts.completed === 1
																				? "vehículo"
																				: "vehículos"}
																		</p>
																	</div>
																</div>
															</div>
														</div>
													))}
											</div>
										</div>
									</CardContent> */}
								</CardContent>
							</Card>
						</main>
					</>
				)}
			</div>
		</ConfigProvider>
	);
}
