"use client";
import { useEffect, useState, memo } from "react";
// import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import {
	Table,
	TableBody,
	TableHead,
	TableCell,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import {
	ClipboardList,
	ArrowUpRight,
	ArrowRight,
	Car,
	PlusCircle,
	Eye,
} from "lucide-react";
import Link from "next/link";

import { useSession } from "next-auth/react";
import CommandsTable from "@/components/CommandsTable";
import { useRouter } from "next/navigation";
import { getDashboardData } from "../reservations/reservations.api";

import Aside from "@/components/Aside";
import Image from "next/image";
import myImage from "@/public/motorgas2.svg";

const OptimizedCard = memo(function OptimizedCard({
	title,
	value,
	description,
	icon,
}) {
	useEffect(() => {
		document.title = "Motorgas - Dashboard";
	}, []);
	return (
		<Card className="rounded-xl shadow-lg border-none">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-normal text-zinc-800">
					{title}
				</CardTitle>
				{icon}
			</CardHeader>
			<CardContent>
				<div className="text-2xl font-light">{value}</div>
				<p className="text-xs text-muted-foreground">{description}</p>
			</CardContent>
		</Card>
	);
});

export default function Dashboard() {
	const router = useRouter();
	const { data: session } = useSession();
	const userRole = session?.user?.role;

	const [dashboardData, setDashboardData] = useState({
		reservations: [],
		commands: [],
		reservationsSummary: {},
		commandsSummary: {},
	});
	const [loading, setLoading] = useState(true);
	const [dataFetched, setDataFetched] = useState(false);

	useEffect(() => {
		const fetchDashboardData = async () => {
			if (dataFetched && dashboardData.reservations.length > 0) {
				return;
			}

			if (!session?.user) return;

			setLoading(true);
			try {
				const data = await getDashboardData();
				setDashboardData(data);
				setDataFetched(true);
			} catch (error) {
				console.error("Error loading dashboard:", error);
				if (error.message.includes("Session expired")) {
					router.push("/login");
				}
			} finally {
				setLoading(false);
			}
		};

		if (session) {
			fetchDashboardData();
		}
	}, [session, router, dataFetched, dashboardData.reservations.length]);

	const lastFiveReservations = dashboardData.reservations
		.filter((reservation) => {
			if (userRole === 2 || userRole === 3) return true;
			return reservation.usuarios.id === session?.user?.id;
		})
		.sort((a, b) => new Date(b.creado_en) - new Date(a.creado_en))
		.slice(0, 5);

	const lastFiveCommands = dashboardData.commands
		.filter((command) => {
			if (userRole === 2 || userRole === 3) return true;
			return command.boletos_reservas.usuarios.id === session?.user?.id;
		})
		.sort((a, b) => new Date(b.creado_en) - new Date(a.creado_en))
		.slice(0, 5);

	// Inicializar los estados fuera de vista
	// const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
	// const [cursorPosition, setCursorPosition] = useState({ x: -9999, y: -9999 });

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
								<div className="grid gap-6 mb-4 md:grid-cols-2 lg:grid-cols-3">
									<OptimizedCard
										title="Total de Comandas"
										value={dashboardData.commandsSummary.totalCompleted}
										description={`${dashboardData.commandsSummary.percentageChange} desde el último mes.`}
										icon={
											<ClipboardList className="w-4 h-4 text-muted-foreground" />
										}
									/>
									<OptimizedCard
										title="Vehículos Vendidos"
										value={dashboardData.commandsSummary.totalCompleted}
										description={`${dashboardData.commandsSummary.percentageChange} desde el último mes.`}
										icon={<Car className="w-4 h-4 text-muted-foreground" />}
									/>
									<OptimizedCard
										title="Reservas del Mes"
										value={dashboardData.reservationsSummary.totalReservations}
										description={`${dashboardData.reservationsSummary.percentageChange} comparado con el mes.`}
										icon={
											<ClipboardList className="w-4 h-4 text-muted-foreground" />
										}
									/>
								</div>
							</>
						)}
						{/* Reservas */}
						<div className="grid grid-cols-1 gap-6 mb-0 lg:grid-cols-3 h-full">
							{userRole !== 2 && (
								<>
									{/* <Card className="relative rounded-xl shadow-lg overflow-hidden col-span-3 h-full bg-gradient-to-b from-white to-emerald-50 group border-none hover:cursor-[not-allowed]">
										<style jsx global>{`
											.not-available {
												cursor:
													url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23ef4444' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3Cline x1='15' y1='9' x2='9' y2='15'%3E%3C/line%3E%3Cline x1='9' y1='9' x2='15' y2='15'%3E%3C/line%3E%3C/svg%3E")
														12 12,
													not-allowed !important;
											}
										`}</style>
										<div className="absolute inset-0 bg-gradient-to-br from-emerald-200 to-green-300" />

										<div className="absolute inset-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-sm bg-white" />

										<div className="absolute inset-0 border border-emerald-200 rounded-xl group-hover:border-emerald-300 transition-all duration-500" />

										<div className="relative h-full p-8 flex flex-col justify-between">
											<div className="space-y-4 transition-all duration-300 ease-in-out">
												<div className="flex items-center gap-2">
													<span className="px-3 py-1 text-xs font-medium bg-emerald-100 text-emerald-600 rounded-full">
														Próximamente
													</span>
												</div>
												<h3 className="text-2xl font-light text-emerald-950">
													Catálogo de Equipos
												</h3>
												<p className="text-emerald-700 text-sm font-light leading-relaxed">
													Accede a nuestro catálogo completo de equipos y
													especificaciones técnicas.
												</p>
											</div>
											<div className="flex items-center text-emerald-600 transition-all duration-300 ease-in-out mt-4">
												<span>En desarrollo</span>
												<div className="ml-2 p-2 rounded-full bg-emerald-100">
													<Eye className="w-4 h-4" />
												</div>
											</div>
										</div>
									</Card> */}
									<Card className="relative rounded-xl shadow-lg overflow-hidden col-span-3 h-full bg-gradient-to-b from-white to-emerald-50 group border-none hover:cursor-none">
										<div className="absolute inset-0 bg-gradient-to-br from-emerald-200 to-green-300 opacity-10" />

										<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-sm bg-white/10" />

										<div className="absolute inset-0 border border-emerald-200/50 rounded-xl group-hover:border-emerald-300/70 transition-all duration-500" />

										<Link
											href="/axis"
											className="relative h-full p-8 flex flex-col justify-between"
										>
											<div className="space-y-4 transition-all duration-300 ease-in-out">
												<div className="flex items-center gap-2">
													<span className="px-3 py-1 text-xs font-medium bg-emerald-100 text-emerald-600 rounded-full">
														Explorar
													</span>
												</div>
												<h3 className="text-2xl font-light text-emerald-950">
													Catálogo de Equipos
												</h3>
												<p className="text-emerald-700/70 text-sm font-normal leading-relaxed">
													Accede a nuestro catálogo completo de equipos y
													especificaciones técnicas.
												</p>
											</div>
											<div className="flex items-center text-emerald-600 transition-all duration-300 ease-in-out group-hover:text-emerald-700 mt-4">
												<span>Ver catálogo</span>
												<div className="ml-2 p-2 rounded-full bg-emerald-100 group-hover:bg-emerald-200 transition-all duration-300">
													<Eye className="w-4 h-4" />
												</div>
											</div>
										</Link>
									</Card>

									<Card className="relative rounded-xl shadow-lg overflow-hidden col-span-3 lg:col-span-1 h-full bg-gradient-to-b from-white to-rose-50 group border-none hover:cursor-none">
										<div className="absolute inset-0 bg-gradient-to-br from-rose-200 to-red-300 opacity-10" />

										<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-sm bg-white/10" />

										<div className="absolute inset-0 border border-rose-200/50 rounded-xl group-hover:border-rose-300/70 transition-all duration-500" />

										<Link
											href="/add-order"
											className="relative h-full p-8 flex flex-col justify-between"
										>
											<div className="space-y-4 transition-all duration-300 ease-in-out">
												<div className="flex items-center gap-2">
													<span className="px-3 py-1 text-xs font-medium bg-rose-100 text-rose-600 rounded-full">
														Crear Reserva
													</span>
												</div>
												<h3 className="text-2xl font-light text-rose-950">
													Nueva Reserva
												</h3>
												<p className="text-rose-700/70 text-sm font-normal leading-relaxed">
													Crea un nuevo boleto de reserva de manera rápida y
													sencilla.
												</p>
											</div>
											<div className="flex items-center text-rose-600 transition-all duration-300 ease-in-out group-hover:text-rose-700 mt-4">
												<span>Comenzar</span>
												<div className="ml-2 p-2 rounded-full bg-rose-100 group-hover:bg-rose-200 transition-all duration-300">
													<PlusCircle className="w-4 h-4" />
												</div>
											</div>
										</Link>
									</Card>
								</>
							)}
							{userRole !== 2 && (
								<Card className="rounded-xl shadow-lg border-none col-span-3 lg:col-span-2">
									<CardHeader>
										<div className="flex flex-row items-center justify-between">
											<div className="flex flex-col gap-0">
												<CardTitle className="text-xl font-light text-zinc-800">
													Boletos de Reservas
												</CardTitle>
												<CardDescription className="text-sm">
													Últimas 5 reservas realizadas
												</CardDescription>
											</div>
											<Link href="/reservations">
												<div className="relative group">
													<ArrowUpRight
														strokeWidth={1.75}
														className="w-5 h-5 text-zinc-500 hover:text-zinc-400 transition-all"
													/>
												</div>
											</Link>
										</div>
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
													<TableHead className="w-1/5 hidden md:table-cell text-start md:text-center">
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
															className="w-full cursor-pointer hover:bg-zinc-100 transition-all duration-300 ease-in-out"
															onClick={() =>
																router.push(`/reservations/${reservation.id}`)
															}
														>
															<TableCell className="w-1/5 text-start md:text-center text-zinc-800 truncate">
																{reservation.usuarios.nombre_usuario}
															</TableCell>
															<TableCell className="w-1/5 text-start md:text-center text-zinc-800 truncate">
																{reservation.clientes.nombre_completo
																	.trim() // Elimina espacios en blanco al inicio y al final
																	.split(" ") // Divide el nombre en un array de palabras
																	.slice(0, 2) // Toma las primeras dos palabras
																	.join(" ")}
															</TableCell>
															<TableCell className="text-zinc-800 truncate">
																{`${reservation.marca_vehiculo || ""} ${
																	reservation.modelo_vehiculo || ""
																}`.trim()}
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
									</CardContent>
								</Card>
							)}
							{userRole !== 2 && (
								<>
									<Card className="relative rounded-xl shadow-lg overflow-hidden col-span-3 lg:col-span-1 h-full bg-gradient-to-b from-white to-indigo-50 group border-none hover:cursor-none">
										<div className="absolute inset-0 bg-gradient-to-br from-indigo-200 to-violet-300 opacity-10" />

										<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-sm bg-white/10" />

										<div className="absolute inset-0 border border-indigo-200/50 rounded-xl group-hover:border-indigo-300/70 transition-all duration-500" />

										<Link
											href="/calendar"
											className="relative h-full p-8 flex flex-col justify-between"
										>
											<div className="space-y-4 transition-all duration-300 ease-in-out">
												<div className="flex items-center gap-2">
													<span className="px-3 py-1 text-xs font-medium bg-indigo-100 text-indigo-600 rounded-full">
														¡Nuevo!
													</span>
													<div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
												</div>
												<h3 className="text-2xl font-light text-indigo-950">
													Calendario
												</h3>
												<p className="text-indigo-700/70 text-sm font-normal leading-relaxed">
													Accede en tiempo real a todos tus eventos y reservas
													en una vista unificada y elegante.
												</p>
											</div>
											<div className="flex items-center text-indigo-600 transition-all duration-300 ease-in-out group-hover:text-indigo-700 mt-4">
												<span>Explorar</span>
												<div className="ml-2 p-2 rounded-full bg-indigo-100 group-hover:bg-indigo-200 transition-all duration-300">
													<ArrowRight className="w-4 h-4" />
												</div>
											</div>
										</Link>
									</Card>
								</>
							)}
							{userRole !== 2 && (
								<Card
									className={`rounded-xl shadow-lg border-none col-span-3 lg:col-span-2 ${
										userRole === 1 ? "" : ""
									}`}
								>
									<CardHeader>
										<div className="flex flex-row items-center justify-between">
											<div className="flex flex-col gap-1">
												<CardTitle className="text-xl font-light text-zinc-800 inline-flex items-center gap-2">
													Comandas
													{userRole === 1 && (
														<div className="flex items-center gap-2">
															<span className="text-sm">(solo búsqueda)</span>
														</div>
													)}
												</CardTitle>
												<CardDescription className="text-sm">
													Últimas 5 comandas registradas
												</CardDescription>
											</div>
											{userRole !== 1 && (
												<Link href="/commands">
													<div className="relative group">
														<ArrowUpRight
															strokeWidth={1.75}
															className="w-5 h-5 text-zinc-500 hover:text-zinc-400 transition-all"
														/>
													</div>
												</Link>
											)}
										</div>
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
													<TableHead className="w-1/5 hidden md:table-cell text-start md:text-center">
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
															className={`w-full cursor-pointer hover:bg-zinc-100 transition-all duration-300 ease-in-out ${
																userRole === 1 ? "cursor-not-allowed" : ""
															}`}
															key={command.id}
															style={{
																textDecoration: "none",
																color: "inherit",
															}}
															onClick={() => {
																if (userRole === 2) {
																	router.push(`/add-technique/${command.id}/`);
																} else if (userRole === 3) {
																	router.push(`/commands/${command.id}`);
																}
															}}
														>
															<TableCell className="text-start md:text-center w-1/5 text-zinc-800 truncate">
																{
																	command.boletos_reservas.usuarios
																		.nombre_usuario
																}
															</TableCell>
															<TableCell className="text-start md:text-center w-1/5 text-zinc-800 truncate ">
																{command.boletos_reservas.clientes.nombre_completo
																	.trim() // Elimina espacios en blanco al inicio y al final
																	.split(" ") // Divide el nombre en un array de palabras
																	.slice(0, 2) // Toma las primeras dos palabras
																	.join(" ")}
															</TableCell>
															<TableCell className="text-zinc-800 truncate">
																{`${
																	command.boletos_reservas.marca_vehiculo || ""
																} ${
																	command.boletos_reservas.modelo_vehiculo || ""
																}`.trim()}
															</TableCell>
															<TableCell className="text-start md:text-center w-1/5 text-zinc-800 ">
																{(() => {
																	const utcDate = new Date(
																		command.boletos_reservas.fecha_instalacion
																	);
																	const localDate = new Date(
																		utcDate.getTime() + 3 * 60 * 60 * 1000
																	);

																	return localDate.toLocaleDateString("es-ES", {
																		day: "2-digit",
																		month: "2-digit",
																	});
																})()}
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
									</CardContent>
								</Card>
							)}
							{userRole === 2 && <CommandsTable />}
						</div>
					</main>
				</>
			)}
		</div>
	);
}
