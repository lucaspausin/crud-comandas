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

dayjs.locale("es");
dayjs.extend(utc);

export const dynamic = "force-dynamic";

export default function Calendar() {
	const [eventsCalendar, setEventsCalendar] = useState([]);
	// const [eventosPorUsuario, setEventosPorUsuario] = useState({});
	const [loading, setLoading] = useState(true);

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
								</CardContent>
							</Card>
						</main>
					</>
				)}
			</div>
		</ConfigProvider>
	);
}
