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
import { io } from "socket.io-client";
import Aside from "@/components/Aside";

// import { Tooltip } from "antd";

dayjs.locale("es");
dayjs.extend(utc);

export default function Calendar() {
	const [eventsCalendar, setEventsCalendar] = useState([]);

	const [loading, setLoading] = useState(true);
	// const [userEventCounts, setUserEventCounts] = useState({});

	useEffect(() => {
		document.title = "Motorgas - Calendario";
	}, []);

	const formatEvents = (data) => {
		return data.map((event) => {
			let eventDate = dayjs.utc(event.fecha_inicio);
			eventDate = eventDate.hour(8).minute(30).second(0);

			return {
				id: event.id,
				title: event.titulo,
				date: eventDate.local(),
				usuario: event.boletos_reservas.usuarios.nombre_usuario,
				estado: event.estado,
			};
		});
	};

	useEffect(() => {
		const fetchEventsCalendar = async () => {
			const data = await getEventsCalendar();
			setEventsCalendar(formatEvents(data));
			setLoading(false);
		};

		fetchEventsCalendar();
	}, []);

	useEffect(() => {
		// Solo inicializar WebSocket después de que los datos iniciales se hayan cargado
		if (!loading) {
			const socket = io(
				process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
				{
					withCredentials: true,
					reconnection: true,
					reconnectionAttempts: 5,
					reconnectionDelay: 1000,
					reconnectionDelayMax: 5000,
					timeout: 10000,
					autoConnect: false, // Cambiado a false para control manual
					transports: ["websocket"], // Solo usar websocket para mejor rendimiento
				}
			);

			let retryCount = 0;
			const maxRetries = 3;

			socket.on("connect_error", (error) => {
				console.error("Error de conexión:", error);
				if (retryCount < maxRetries) {
					retryCount++;
					setTimeout(() => {
						console.log(`Intento de reconexión ${retryCount}...`);
						socket.connect();
					}, 1000 * retryCount);
				}
			});

			socket.on("connect", () => {
				console.log("Conectado al servidor de WebSocket");
				retryCount = 0;
				socket.emit("requestUpdate");
			});

			socket.on("calendarUpdate", (updatedEvents) => {
				if (updatedEvents && Array.isArray(updatedEvents)) {
					setEventsCalendar(formatEvents(updatedEvents));
				}
			});

			socket.on("calendarEvent", ({ type, event }) => {
				if (type === "add") {
					setEventsCalendar((prevEvents) => {
						const formattedEvent = formatEvents([event])[0];
						return [...prevEvents, formattedEvent];
					});
				}
			});

			// Conectar después de configurar todos los listeners
			socket.connect();

			return () => {
				socket.disconnect();
			};
		}
	}, [loading]);

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
			case "senado":
				return "warning"; // Amarillo
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
						<main className="flex p-6 lg:px-8 xl:px-8 flex-col w-full gap-6">
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
											<Badge status={getBadgeStatus("senado")} text="Señado" />
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
