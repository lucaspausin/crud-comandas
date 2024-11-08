"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableHead,
	TableCell,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

// import myImage2 from "@/public/girlgnc.jpeg";

import { ClipboardList, Ticket, Car, Search } from "lucide-react";
import Link from "next/link";

import { useSession } from "next-auth/react";

import { useRouter } from "next/navigation";
import {
	getReservations,
	getCommands,
	getReservationSummary,
	getCommandsSummary,
} from "../reservations/reservations.api";

import Aside from "@/components/Aside";
import Image from "next/image";
import myImage from "@/public/motorgas2.svg";
// import ButtonAuth from "@/components/ButtonAuth";

export default function Dashboard() {
	const router = useRouter();
	const { data: session } = useSession();

	const userRole = session?.user?.role;

	const [reservations, setReservations] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [filteredReservations, setFilteredReservations] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchReservations = async () => {
			const data = await getReservations();
			setReservations(data);
			setLoading(true);
			setTimeout(() => {
				setLoading(false);
			}, 750);
		};

		fetchReservations();
	}, []);

	useEffect(() => {
		const lowercasedFilter = searchTerm.toLowerCase();
		let filtered = reservations;

		// Filtrar por usuario (si hay una sesión activa)
		if (session && session.user) {
			if (session.user.role === 1) {
				// Si el rol es 1, filtra por usuario_id para mostrar solo las reservas de ese usuario
				filtered = filtered.filter(
					(reservation) => reservation.usuario_id === session.user.id
				);
			} else if (session.user.role === 3) {
				// Si el rol es 3, no se aplica filtro adicional y muestra todas las reservas
			}
		}

		// Aplicar filtro de búsqueda
		if (searchTerm) {
			filtered = filtered.filter(
				(reservation) =>
					reservation.clientes.nombre_completo
						.toLowerCase()
						.includes(lowercasedFilter) ||
					(reservation.clientes.dni != null &&
						String(reservation.clientes.dni).includes(lowercasedFilter)) ||
					(reservation.clientes.domicilio &&
						reservation.clientes.domicilio
							.toLowerCase()
							.includes(lowercasedFilter)) ||
					(reservation.clientes.localidad &&
						reservation.clientes.localidad
							.toLowerCase()
							.includes(lowercasedFilter)) ||
					(reservation.clientes.telefono != null &&
						String(reservation.clientes.telefono).includes(lowercasedFilter)) ||
					reservation.modelo_patente.toLowerCase().includes(lowercasedFilter) ||
					reservation.equipo.toLowerCase().includes(lowercasedFilter)
			);
		}

		setFilteredReservations(filtered);
	}, [searchTerm, reservations, session]);

	const [commands, setCommands] = useState([]);
	const [commandsSearchTerm, setCommandsSearchTerm] = useState(""); // Estado para el término de búsqueda de comandos
	const [filteredCommands, setFilteredCommands] = useState([]);

	useEffect(() => {
		const fetchCommands = async () => {
			const data = await getCommands();
			setCommands(data);
			setLoading(true);
			setTimeout(() => {
				setLoading(false);
			}, 750); // Terminar carga
		};

		fetchCommands();
	}, []);

	useEffect(() => {
		const lowercasedFilter = commandsSearchTerm.toLowerCase();
		let filtered = commands;

		// Filtrar por usuario (si hay una sesión activa)
		if (session && session.user) {
			if (session.user.role === 1) {
				// Si el rol es 1, filtra por usuario_id para mostrar solo las reservas de ese usuario
				filtered = filtered.filter(
					(reservation) =>
						reservation.boletos_reservas.usuario_id === session.user.id
				);
			} else if (session.user.role === 3) {
				// Si el rol es 3, no se aplica filtro adicional y muestra todas las reservas
			}
		}

		if (commandsSearchTerm) {
			filtered = filtered.filter(
				(command) =>
					command.boletos_reservas.clientes.nombre_completo
						.toLowerCase()
						.includes(lowercasedFilter) ||
					(command.boletos_reservas.clientes.dni != null &&
						String(command.boletos_reservas.clientes.dni).includes(
							lowercasedFilter
						)) ||
					command.boletos_reservas.clientes.domicilio
						.toLowerCase()
						.includes(lowercasedFilter) ||
					command.boletos_reservas.clientes.localidad
						.toLowerCase()
						.includes(lowercasedFilter) ||
					(command.boletos_reservas.clientes.telefono != null &&
						String(command.boletos_reservas.clientes.telefono).includes(
							lowercasedFilter
						)) ||
					command.boletos_reservas.modelo_patente
						.toLowerCase()
						.includes(lowercasedFilter) ||
					command.boletos_reservas.equipo
						.toLowerCase()
						.includes(lowercasedFilter)
			);
		}

		setFilteredCommands(filtered);
	}, [commandsSearchTerm, commands, session]);

	const [reservationsSummary, setReservationsSummary] = useState([]);
	useEffect(() => {
		const fetchReservationsSummary = async () => {
			const data = await getReservationSummary();
			setReservationsSummary(data);
		};

		fetchReservationsSummary();
	}, []);

	const [commandsSummary, setCommandsSummary] = useState([]);
	useEffect(() => {
		const fetchCommandsSummary = async () => {
			const data = await getCommandsSummary();
			setCommandsSummary(data);
		};

		fetchCommandsSummary();
	}, []);

	const lastFiveReservations = filteredReservations
		.sort((a, b) => new Date(b.creado_en) - new Date(a.creado_en))
		.slice(0, 5);

	const lastFiveCommands = filteredCommands
		.sort((a, b) => new Date(b.creado_en) - new Date(a.creado_en))
		.slice(0, 5);

	return (
		<div className="flex-1 bg-zinc-50">
			{/* Sidebar */}
			{loading ? ( // Condicional para mostrar un loader
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

					<main className="flex flex-col items-stretch justify-normal p-6 z-50">
						{/* Statistics */}
						{userRole !== 2 && (
							<>
								{/* <div className="grid gap-6 mb-8">
									<Link href={"/calendar"}>
										<Card className="relative rounded-t-none rounded-b-xl shadow-lg overflow-hidden pb-2 border-t-4 border-t-blue-950">
											<div className="relative z-10 text-zinc-900">
												<CardHeader className="flex flex-row items-center justify-between  space-y-0 pb-2">
													<CardTitle className="text-xs font-light">
														Nuevo!
													</CardTitle>
												</CardHeader>
												<CardContent className="flex flex-col gap-2">
													<p className="text-base font-light">
														Calendario con acceso en vivo a eventos y reservas.
													</p>
												</CardContent>
											</div>
										</Card>
									</Link>
								</div> */}
								<div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-3">
									<Card className="rounded-xl shadow-lg border-none">
										<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
											<CardTitle className="text-sm font-normal text-zinc-800">
												Total de Comandas
											</CardTitle>

											<ClipboardList className="w-4 h-4 text-muted-foreground" />
										</CardHeader>
										<CardContent>
											<div className="text-2xl font-light">
												{commandsSummary.totalCompleted}
											</div>
											<p className="text-xs text-muted-foreground">
												{commandsSummary.percentageChange} desde el último mes.
											</p>
										</CardContent>
									</Card>

									<Card className="rounded-xl shadow-lg border-none">
										<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
											<CardTitle className="text-sm font-normal  text-zinc-800">
												Vehículos Vendidos
											</CardTitle>
											<Car className="w-4 h-4 text-muted-foreground" />
										</CardHeader>
										<CardContent>
											<div className="text-2xl font-light">
												{commandsSummary.totalCompleted}
											</div>
											<p className="text-xs text-muted-foreground">
												{commandsSummary.percentageChange} desde el último mes.
											</p>
										</CardContent>
									</Card>
									<Card className="rounded-xl shadow-lg border-none">
										<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
											<CardTitle className="text-sm font-normal  text-zinc-800">
												Reservas del Mes
											</CardTitle>
											<Ticket className="w-4 h-4 text-muted-foreground " />
										</CardHeader>

										<CardContent>
											<div className="text-2xl font-light">
												{reservationsSummary.totalReservations}
											</div>
											<p className="text-xs text-muted-foreground">
												{reservationsSummary.percentageChange} comparado con el
												mes.
											</p>
										</CardContent>
									</Card>
								</div>
							</>
						)}
						{/* Reservas */}
						{userRole !== 2 && (
							<Card className="mb-6 rounded-xl shadow-lg border-none">
								<CardHeader>
									<div className="flex items-center justify-between">
										<CardTitle className="text-xl font-light  text-zinc-800">
											Boletos de Reservas
										</CardTitle>
										<div className="flex items-center space-x-2 relative">
											<Input
												placeholder="Buscar reservas..."
												className="w-64 rounded-full"
												value={searchTerm} // Bind search term to input
												onChange={(e) => setSearchTerm(e.target.value)} // Update search term on change
											/>
											<Search
												className="w-5 h-5 absolute right-2 text-[#71717A]"
												strokeWidth="1.75"
											></Search>
										</div>
									</div>
									<CardDescription>
										Últimas 5 reservas realizadas
									</CardDescription>
								</CardHeader>
								<CardContent className="w-full overflow-auto">
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead className="w-1/5 text-start md:text-center ">
													Asesor
												</TableHead>
												<TableHead className="w-1/5 text-start md:text-center">
													Cliente
												</TableHead>
												<TableHead className="w-1/5 text-start md:text-center">
													Modelo
												</TableHead>
												<TableHead className="w-1/5 text-start md:text-center">
													Fecha
												</TableHead>
												<TableHead className="w-1/5 text-start md:text-center">
													Precio
												</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{lastFiveReservations.length > 0 ? (
												lastFiveReservations.map((reservation) => (
													<TableRow
														key={reservation.id}
														className="w-full cursor-pointer"
														onClick={() =>
															router.push(`/reservations/${reservation.id}`)
														}
													>
														<TableCell className="w-1/5 text-start md:text-center text-zinc-800">
															{reservation.usuarios.nombre_usuario}
														</TableCell>
														<TableCell className="w-1/5 text-start md:text-center text-zinc-800 truncate">
															{reservation.clientes.nombre_completo
																.trim() // Elimina espacios en blanco al inicio y al final
																.split(" ") // Divide el nombre en un array de palabras
																.slice(0, 2) // Toma las primeras dos palabras
																.join(" ")}
														</TableCell>
														<TableCell className="w-1/5 text-start md:text-center text-zinc-800">
															{reservation.modelo_patente}
														</TableCell>
														<TableCell className="w-1/5 text-start md:text-center text-zinc-800">
															{new Date(
																reservation.creado_en
															).toLocaleDateString("es-AR", {
																day: "2-digit",
																month: "2-digit",
															})}
														</TableCell>
														<TableCell className="w-1/5 text-start md:text-center text-zinc-800">
															{new Intl.NumberFormat("es-AR", {
																style: "currency",
																currency: "ARS",
															}).format(reservation.precio)}
														</TableCell>
													</TableRow>
												))
											) : (
												<TableRow>
													<TableCell
														colSpan={5}
														className="text-center text-zinc-600"
													>
														Todavía no hiciste ninguna reserva.
													</TableCell>
												</TableRow>
											)}
										</TableBody>
									</Table>

									<div className="flex justify-center mt-4">
										<Link href="/reservations">
											<Button variant="outline" size="sm" className="my-4">
												Ver todas las reservas
											</Button>
										</Link>
									</div>
								</CardContent>
							</Card>
						)}

						<Card
							className={`rounded-xl shadow-lg border-none ${
								userRole === 1 ? "" : ""
							}`}
						>
							<CardHeader className="relative">
								<div className="flex items-center justify-between">
									<CardTitle className="text-xl font-light text-zinc-800 inline-flex items-center gap-2">
										Comandas
										{userRole === 1 && (
											<div className="flex items-center gap-2">
												<span>(solo búsqueda)</span>
												{/* <FolderLock
														className="w-5 h-5  text-red-500"
														strokeWidth="1.75"
													/> */}
											</div>
										)}
									</CardTitle>

									<div className="flex items-center space-x-2 relative">
										<Input
											placeholder="Buscar comandos..."
											className="w-64 rounded-full"
											value={commandsSearchTerm}
											onChange={(e) => setCommandsSearchTerm(e.target.value)}
										/>
										<Search
											className="w-5 h-5 absolute right-2 text-[#71717A]"
											strokeWidth="1.75"
										/>
									</div>
								</div>
								<CardDescription>
									Últimas 5 comandas registradas
								</CardDescription>
							</CardHeader>
							<CardContent className="w-full overflow-auto">
								<Table>
									<TableHeader>
										<TableRow className="w-full">
											<TableHead className="text-start md:text-center w-1/5">
												Asesor
											</TableHead>
											<TableHead className="w-1/5 text-start md:text-center">
												Cliente
											</TableHead>
											<TableHead className="text-start md:text-center w-1/5">
												Modelo
											</TableHead>
											<TableHead className="text-start md:text-center w-1/5 ">
												Fecha
											</TableHead>
											<TableHead className="text-start md:text-center w-1/5">
												Estado
											</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{lastFiveCommands.length > 0 ? (
											lastFiveCommands.map((command) => (
												<TableRow
													className={`w-full cursor-pointer ${
														userRole === 1 ? "cursor-not-allowed" : ""
													}`}
													key={command.id}
													style={{ textDecoration: "none", color: "inherit" }}
													onClick={() => {
														if (userRole === 2) {
															router.push(`/add-technique/${command.id}/`);
														} else if (userRole === 3) {
															router.push(`/commands/${command.id}`);
														}
													}}
												>
													<TableCell className="text-start md:text-center w-1/5 text-zinc-800">
														{command.boletos_reservas.usuarios.nombre_usuario}
													</TableCell>
													<TableCell className="text-start md:text-center w-1/5 text-zinc-800 truncate ">
														{command.boletos_reservas.clientes.nombre_completo
															.trim() // Elimina espacios en blanco al inicio y al final
															.split(" ") // Divide el nombre en un array de palabras
															.slice(0, 2) // Toma las primeras dos palabras
															.join(" ")}
													</TableCell>
													<TableCell className="text-start md:text-center w-1/5 text-zinc-800">
														{command.boletos_reservas.modelo_patente}
													</TableCell>
													<TableCell className="text-start md:text-center w-1/5 text-zinc-800 ">
														{new Date(
															command.boletos_reservas.fecha_instalacion
														).toLocaleDateString("es-AR", {
															day: "2-digit",
															month: "2-digit",
														})}
													</TableCell>
													<TableCell className="text-start md:text-center w-1/5 truncate">
														<span
															className={`px-2 py-1 text-xs font-normal rounded-full ${
																command.estado === "en_proceso"
																	? "bg-blue-100 text-blue-700"
																	: command.estado === "completado"
																	? "bg-green-100 text-green-700"
																	: "bg-yellow-100 text-yellow-700"
															}`}
														>
															{command.estado === "en_proceso"
																? "En Proceso"
																: command.estado === "completado"
																? "Completada"
																: "Pendiente"}
														</span>
													</TableCell>
												</TableRow>
											))
										) : (
											<TableRow>
												<TableCell
													colSpan={5}
													className="text-center  text-zinc-600"
												>
													Todavía no hay ningúna comanda.
												</TableCell>
											</TableRow>
										)}
									</TableBody>
								</Table>
								{userRole !== 1 ? (
									<div className="flex justify-center mt-4">
										<Link href="/commands">
											<Button variant="outline" size="sm" className="my-4">
												Ver todas las comandas
											</Button>
										</Link>
									</div>
								) : (
									<div
										className="flex justify-center mt-4"
										style={{ height: "75px" }}
									/> // Ajusta la altura según el botón
								)}
							</CardContent>
						</Card>
						{/* 
							<Card className="p-6 relative rounded-xl shadow-xl overflow-hidden pb-2 border border-black bg-white text-white h-full hover">
								<Image
									src={myImage2}
									alt="Descripción de la imagen"
									className="absolute inset-0 w-full h-full object-cover pointer-events-none brightness-[.25] opacity-100"
									loading="eager"
									priority
								/>
								<div className="absolute inset-0 bg-gradient-to-bl group-hover:opacity-0 from-black to-transparent opacity-100 pointer-events-none" />
								<Link href={"/calendar"} className="flex flex-col gap-2">
									<div className="relative z-10 text-zinc-900 w-fit rounded-xl bg-zinc-50 hover:bg-zinc-800 transition-all ease-in-out">
									
										<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
											<CardTitle className="text-xs font-light text-black">
												Nuevo!
											</CardTitle>
										</CardHeader>
										<CardContent className="flex flex-col gap-2 text-black">
											<p className="text-lg font-light">
												📅 Calendario con acceso en vivo a eventos y reservas.
											</p>
										</CardContent>
									</div>
									<div className="relative z-10 text-zinc-900 w-fit rounded-xl">
										<CardContent className="p-0 flex flex-col gap-2 text-white"></CardContent>
									</div>
								</Link>
							</Card> */}
					</main>
				</>
			)}
		</div>
	);
}
