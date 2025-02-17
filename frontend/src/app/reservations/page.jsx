"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { motion } from "framer-motion";

import { Search, Pencil } from "lucide-react";
// Trash;
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

// import HomeIcon from "@/components/HomeIcon";
import Image from "next/image";
import myImage from "@/public/motorgas2.svg";
import {
	getReservations,
	getUsers,
	// deleteReservation,
} from "../reservations/reservations.api";

import Aside from "@/components/Aside";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export const dynamic = "force-dynamic";

export default function AllReservationsPage() {
	const router = useRouter();
	const { data: session } = useSession();
	const [reservations, setReservations] = useState([]);
	const [users, setUsers] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [loading, setLoading] = useState(true);
	const [sortOrder, setSortOrder] = useState("date-desc");
	const [userFilter, setUserFilter] = useState("all");
	const [dataFetched, setDataFetched] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 8;

	useEffect(() => {
		document.title = "Motorgas - Reservas";
	}, []);

	useEffect(() => {
		const fetchData = async () => {
			if (dataFetched && reservations.length > 0) {
				return;
			}

			if (!session?.user) return;

			setLoading(true);
			try {
				const [reservationsData, usersData] = await Promise.all([
					getReservations(),
					getUsers(),
				]);

				setReservations(reservationsData);
				const filteredUsers = usersData.filter((user) => user.role_id === 1);
				setUsers(filteredUsers);
				setDataFetched(true);
			} catch (error) {
				console.error("Error loading data:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [session, dataFetched, reservations.length]);

	const filteredReservations = () => {
		let filtered = reservations;

		// Filtrar por usuario (si hay una sesión activa)
		if (session && session.user) {
			if (session.user.role === 1) {
				// Si el rol es 1
				filtered = filtered.filter(
					(reservation) => reservation.usuario_id === session.user.id // Filtra por usuario_id
				);
			} else if (session.user.role === 3) {
				// Si el rol es 3
				// No filtra, muestra todas las reservas
				// No se necesita ninguna lógica adicional aquí
			}
		}

		if (searchTerm) {
			filtered = filtered.filter(
				(reservation) =>
					reservation.clientes.nombre_completo
						.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					(reservation.clientes.dni != null &&
						String(reservation.clientes.dni).includes(searchTerm)) ||
					reservation.clientes.domicilio
						.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					reservation.clientes.localidad
						.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					(reservation.clientes.telefono != null &&
						String(reservation.clientes.telefono).includes(searchTerm)) ||
					(reservation.patente_vehiculo != null &&
						reservation.patente_vehiculo
							.toLowerCase()
							.includes(searchTerm.toLowerCase())) ||
					(reservation.equipo != null &&
						reservation.equipo
							.toLowerCase()
							.includes(searchTerm.toLowerCase())) ||
					(reservation.marca_vehiculo != null &&
						reservation.marca_vehiculo
							.toLowerCase()
							.includes(searchTerm.toLowerCase())) ||
					(reservation.modelo_vehiculo != null &&
						reservation.modelo_vehiculo
							.toLowerCase()
							.includes(searchTerm.toLowerCase())) ||
					(reservation.usuarios.nombre_usuario != null &&
						reservation.usuarios.nombre_usuario
							.toLowerCase()
							.includes(searchTerm.toLowerCase())) ||
					(reservation.equipo != null &&
						reservation.equipo.toLowerCase().includes(searchTerm.toLowerCase()))
			);
		}

		if (userFilter !== "all") {
			// Si se seleccionó un usuario específico
			filtered = filtered.filter(
				(reservation) => reservation.usuario_id === userFilter
			);
		}
		// Ordenar reservas
		const currentDate = new Date();

		// Calcular fechas para los filtros
		const sevenDaysAgo = new Date();
		sevenDaysAgo.setDate(currentDate.getDate() - 7);

		const fifteenDaysAgo = new Date();
		fifteenDaysAgo.setDate(currentDate.getDate() - 15);

		if (sortOrder === "date-desc") {
			filtered.sort(
				(a, b) => new Date(b.fecha_instalacion) - new Date(a.fecha_instalacion)
			);
		} else if (sortOrder === "date-asc") {
			filtered.sort(
				(a, b) => new Date(a.fecha_instalacion) - new Date(b.fecha_instalacion)
			);
		} else if (sortOrder === "first-fortnight") {
			const today = new Date();
			const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
			const fifteenthDay = new Date(today.getFullYear(), today.getMonth(), 15);
			filtered = filtered.filter((reservation) => {
				const installationDate = new Date(reservation.fecha_instalacion);
				return installationDate >= firstDay && installationDate <= fifteenthDay;
			});
			filtered.sort(
				(a, b) => new Date(a.fecha_instalacion) - new Date(b.fecha_instalacion)
			);
		} else if (sortOrder === "second-fortnight") {
			const today = new Date();
			const sixteenthDay = new Date(today.getFullYear(), today.getMonth(), 16);
			const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
			filtered = filtered.filter((reservation) => {
				const installationDate = new Date(reservation.fecha_instalacion);
				return installationDate >= sixteenthDay && installationDate <= lastDay;
			});
			filtered.sort(
				(a, b) => new Date(a.fecha_instalacion) - new Date(b.fecha_instalacion)
			);
		} else if (sortOrder === "next-week") {
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			const nextWeekStart = new Date(today);
			nextWeekStart.setDate(today.getDate() + 1); // Empezar desde mañana
			const nextWeekEnd = new Date(today);
			nextWeekEnd.setDate(today.getDate() + 7); // 7 días desde hoy
			filtered = filtered.filter((reservation) => {
				const installationDate = new Date(reservation.fecha_instalacion);
				installationDate.setHours(0, 0, 0, 0);
				return (
					installationDate >= nextWeekStart && installationDate <= nextWeekEnd
				);
			});
			filtered.sort(
				(a, b) => new Date(a.fecha_instalacion) - new Date(b.fecha_instalacion)
			);
		} else if (sortOrder === "next-month") {
			const today = new Date();
			const nextMonthStart = new Date(
				today.getFullYear(),
				today.getMonth() + 1,
				1
			);
			const nextMonthEnd = new Date(
				today.getFullYear(),
				today.getMonth() + 2,
				0
			);
			filtered = filtered.filter((reservation) => {
				const installationDate = new Date(reservation.fecha_instalacion);
				return (
					installationDate >= nextMonthStart && installationDate <= nextMonthEnd
				);
			});
			filtered.sort(
				(a, b) => new Date(a.fecha_instalacion) - new Date(b.fecha_instalacion)
			);
		}
		return filtered;
	};

	// const paginatedReservations = () => {
	// 	const filtered = filteredReservations();
	// 	const startIndex = (currentPage - 1) * itemsPerPage;
	// 	return filtered.slice(startIndex, startIndex + itemsPerPage);
	// };

	// const totalPages = Math.ceil(filteredReservations().length / itemsPerPage);

	// const handleDeleteReservation = async (id) => {
	// 	const confirmDelete = window.confirm(
	// 		"¿Está seguro de que desea eliminar esta reserva?"
	// 	);

	// 	if (confirmDelete) {
	// 		try {
	// 			await deleteReservation(id);
	// 			// Actualizar el estado de reservas
	// 			setReservations((prevReservations) =>
	// 				prevReservations.filter((reservation) => reservation.id !== id)
	// 			);
	// 			// Opcionalmente, redirigir a la página de reservas
	// 			// router.push(`/reservations`);
	// 			// router.refresh();
	// 		} catch (error) {
	// 			console.error("Error al eliminar la reserva:", error);
	// 		}
	// 	}
	// };
	return (
		<div className="flex bg-zinc-50">
			{loading ? (
				<div className="flex flex-col items-center justify-center h-[80vh] mx-auto w-full">
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
			) : (
				<>
					<Aside />
					<main className="flex-1 p-6 lg:px-8 xl:px-8 overflow-y-auto">
						<Card className="rounded-xl shadow-lg border-none p-3">
							<CardHeader>
								<CardTitle className="text-xl font-light text-zinc-800">
									Lista de Reservas
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="flex flex-col gap-4 mb-6">
									<div className="flex items-center w-full relative bg-white rounded-2xl shadow-sm border border-zinc-200 p-1">
										<Search
											className="w-5 h-5 ml-3 text-zinc-800"
											strokeWidth="1.5"
										/>
										<Input
											placeholder="Buscar por cliente, vehículo, asesor o equipo..."
											className="border-0 rounded-full focus-visible:ring-0 bg-transparent pl-2"
											value={searchTerm}
											onChange={(e) => setSearchTerm(e.target.value)}
										/>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
										{session?.user?.role === 3 && (
											<Select
												onValueChange={setUserFilter}
												className="py-4 border-none active:border-none focus-visible:border-none focus:border-none focus:ring-0 active:ring-0 focus-visible:ring-0 outline-none ring-0 ring-offset-0"
											>
												<SelectTrigger className="w-full rounded-2xl bg-white border-zinc-200 focus:ring-0 focus-visible:ring-0 focus:outline-none focus-visible:outline-none active:outline-none ring-0 ring-offset-0 data-[state=active]:ring-0 data-[state=focus]:ring-0 text-zinc-800">
													<SelectValue placeholder="Filtrar por asesor" />
												</SelectTrigger>
												<SelectContent className="focus:ring-0 focus-visible:ring-0 focus:outline-none focus-visible:outline-none active:outline-none ring-0 ring-offset-0 text-zinc-800">
													<SelectItem value="all">
														Todos los asesores
													</SelectItem>
													{users.map((user) => (
														<SelectItem
															key={user.id}
															value={user.id}
															className="focus:ring-0 focus-visible:ring-0 focus:outline-none focus-visible:outline-none active:outline-none ring-0 ring-offset-0"
														>
															{user.nombre_usuario}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										)}

										<Select
											onValueChange={setSortOrder}
											className="py-4 border-none active:border-none focus-visible:border-none focus:border-none focus:ring-0 active:ring-0 focus-visible:ring-0 outline-none ring-0 ring-offset-0"
										>
											<SelectTrigger className="w-full rounded-2xl bg-white border-zinc-200 focus:ring-0 focus-visible:ring-0 focus:outline-none focus-visible:outline-none active:outline-none ring-0 ring-offset-0 data-[state=active]:ring-0 data-[state=focus]:ring-0 text-zinc-800">
												<SelectValue placeholder="Ordenar reservas" />
											</SelectTrigger>
											<SelectContent className="focus:ring-0 focus-visible:ring-0 focus:outline-none focus-visible:outline-none active:outline-none ring-0 ring-offset-0 text-zinc-800">
												<SelectItem value="date-desc">
													Próximas instalaciones
												</SelectItem>
												<SelectItem value="date-asc">
													Instalaciones más antiguas
												</SelectItem>
												<SelectItem value="first-fortnight">
													Primera quincena del mes
												</SelectItem>
												<SelectItem value="second-fortnight">
													Segunda quincena del mes
												</SelectItem>
												<SelectItem value="next-week">
													Próxima semana
												</SelectItem>
												<SelectItem value="next-month">Próximo mes</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>

								<div className="flex flex-col gap-6">
									{(() => {
										const todayUTC = new Date();
										todayUTC.setHours(todayUTC.getHours() - 3);
										const todayString = todayUTC.toISOString().split("T")[0];

										const todayReservations = filteredReservations().filter(
											(reservation) => {
												const installationDate = new Date(
													reservation.fecha_instalacion
												);
												installationDate.setHours(
													installationDate.getHours() + 3
												);
												const installationString = installationDate
													.toISOString()
													.split("T")[0];
												return installationString === todayString;
											}
										);

										const otherReservations = filteredReservations().filter(
											(reservation) => {
												const installationDate = new Date(
													reservation.fecha_instalacion
												);
												installationDate.setHours(
													installationDate.getHours() + 3
												);
												const installationString = installationDate
													.toISOString()
													.split("T")[0];
												return installationString !== todayString;
											}
										);

										// Filtrar las próximas instalaciones
										const upcomingInstallations = otherReservations
											.filter((reservation) => {
												const installationDate = new Date(
													reservation.fecha_instalacion
												);
												installationDate.setHours(
													installationDate.getHours() + 3
												);
												const installationString = installationDate
													.toISOString()
													.split("T")[0];
												return installationString > todayString;
											})
											.sort(
												(a, b) =>
													new Date(a.fecha_instalacion) -
													new Date(b.fecha_instalacion)
											)
											.slice(0, 5);

										const startIndex = (currentPage - 1) * itemsPerPage;
										const paginatedOtherReservations = otherReservations
											.filter(
												(reservation) =>
													!upcomingInstallations.some(
														(upcoming) => upcoming.id === reservation.id
													)
											)
											.slice(startIndex, startIndex + itemsPerPage);

										return (
											<>
												{todayReservations.length > 0 ? (
													<div className="flex flex-col gap-4">
														<div className="flex items-center gap-2">
															<h3 className="text-xl font-light text-zinc-800">
																Instalaciones de hoy
															</h3>
															<span className="text-sm text-zinc-500">
																({todayReservations.length})
															</span>
														</div>
														<div className="grid grid-cols-2 gap-4">
															{todayReservations.map((reservation) => (
																<div
																	key={reservation.id}
																	onClick={() =>
																		router.push(
																			`/reservations/${reservation.id}`
																		)
																	}
																	className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-zinc-100/80 relative group"
																>
																	<div className="flex flex-col md:flex-row justify-between items-start gap-4">
																		<div className="flex-1">
																			<div className="flex justify-between items-start mb-4">
																				<div className="flex flex-col">
																					<div className="flex items-center gap-2 text-sm text-zinc-500">
																						<span className="flex items-center gap-1">
																							Instalación:{" "}
																							{new Date(
																								reservation.fecha_instalacion
																							).toLocaleDateString("es-AR", {
																								day: "2-digit",
																								month: "2-digit",
																								year: "2-digit",
																							})}
																						</span>
																						<span className="text-zinc-300">
																							•
																						</span>
																						<span className="flex items-center gap-1">
																							Creada:{" "}
																							{new Date(
																								reservation.creado_en
																							).toLocaleDateString("es-AR", {
																								day: "2-digit",
																								month: "2-digit",
																								year: "2-digit",
																							})}
																						</span>
																					</div>
																				</div>
																			</div>

																			<div className="flex flex-col gap-2 mb-4">
																				<div className="text-sm text-zinc-600">
																					<span className="font-medium">
																						Vehículo:
																					</span>{" "}
																					{`${reservation.marca_vehiculo || ""} ${
																						reservation.modelo_vehiculo || ""
																					} ${
																						reservation.patente_vehiculo || ""
																					}`.trim()}
																				</div>
																				<div className="text-sm text-zinc-600">
																					<span className="font-medium">
																						Cliente:
																					</span>{" "}
																					{reservation.clientes.nombre_completo}
																				</div>
																				<div className="text-sm text-zinc-600">
																					<span className="font-medium">
																						Asesor:
																					</span>{" "}
																					{reservation.usuarios.nombre_usuario}
																				</div>
																			</div>

																			<div className="flex flex-wrap gap-3 items-center">
																				<span className="text-sm font-medium text-emerald-600">
																					{new Intl.NumberFormat("es-AR", {
																						style: "currency",
																						currency: "ARS",
																					}).format(
																						reservation.monto_final_abonar
																					)}
																				</span>
																				{reservation.carga_externa > 0 && (
																					<span className="text-sm font-medium text-blue-600">
																						Carga Externa Incl.
																						{reservation.precio_carga_externa >
																							0 &&
																							` ${new Intl.NumberFormat(
																								"es-AR",
																								{
																									style: "currency",
																									currency: "ARS",
																								}
																							).format(
																								reservation.precio_carga_externa
																							)}`}
																					</span>
																				)}
																			</div>
																		</div>

																		<div className="flex gap-2 md:flex-col items-center">
																			<Link
																				href={`/reservations/edit/${reservation.id}`}
																			>
																				<Button
																					variant="ghost"
																					size="sm"
																					className="rounded-full z-50 px-[0.5rem] bg-white hover:border-orange-600 border border-orange-200 transition-all duration-300 ease-in-out"
																					onClick={(e) => e.stopPropagation()}
																				>
																					<Pencil className="h-4 w-4 text-orange-600" />
																				</Button>
																			</Link>
																		</div>
																	</div>
																</div>
															))}
														</div>
													</div>
												) : upcomingInstallations.length > 0 ? (
													<div className="flex flex-col gap-4">
														<div className="flex items-center gap-2">
															<h3 className="text-xl font-light text-zinc-800">
																Próximas instalaciones
															</h3>
														</div>
														<div className="grid grid-cols-2 gap-4">
															{upcomingInstallations.map((reservation) => (
																<div
																	key={reservation.id}
																	onClick={() =>
																		router.push(
																			`/reservations/${reservation.id}`
																		)
																	}
																	className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-zinc-100/80 relative group"
																>
																	<div className="flex flex-col md:flex-row justify-between items-start gap-4">
																		<div className="flex-1">
																			<div className="flex justify-between items-start mb-4">
																				<div className="flex flex-col">
																					<div className="flex items-center gap-2 text-sm text-zinc-500">
																						<span className="flex items-center gap-1">
																							Instalación:{" "}
																							{new Date(
																								reservation.fecha_instalacion
																							).toLocaleDateString("es-AR", {
																								day: "2-digit",
																								month: "2-digit",
																								year: "2-digit",
																							})}
																						</span>
																						<span className="text-zinc-300">
																							•
																						</span>
																						<span className="flex items-center gap-1">
																							Creada:{" "}
																							{new Date(
																								reservation.creado_en
																							).toLocaleDateString("es-AR", {
																								day: "2-digit",
																								month: "2-digit",
																								year: "2-digit",
																							})}
																						</span>
																					</div>
																				</div>
																			</div>

																			<div className="flex flex-col gap-2 mb-4">
																				<div className="text-sm text-zinc-600">
																					<span className="font-medium">
																						Vehículo:
																					</span>{" "}
																					{`${reservation.marca_vehiculo || ""} ${
																						reservation.modelo_vehiculo || ""
																					} ${
																						reservation.patente_vehiculo || ""
																					}`.trim()}
																				</div>
																				<div className="text-sm text-zinc-600">
																					<span className="font-medium">
																						Cliente:
																					</span>{" "}
																					{reservation.clientes.nombre_completo}
																				</div>
																				<div className="text-sm text-zinc-600">
																					<span className="font-medium">
																						Asesor:
																					</span>{" "}
																					{reservation.usuarios.nombre_usuario}
																				</div>
																			</div>

																			<div className="flex flex-wrap gap-3 items-center">
																				<span className="text-sm font-medium text-emerald-600">
																					{new Intl.NumberFormat("es-AR", {
																						style: "currency",
																						currency: "ARS",
																					}).format(
																						reservation.monto_final_abonar
																					)}
																				</span>
																				{reservation.carga_externa > 0 && (
																					<span className="text-sm font-medium text-blue-600">
																						Carga Externa Incl.
																						{reservation.precio_carga_externa >
																							0 &&
																							` ${new Intl.NumberFormat(
																								"es-AR",
																								{
																									style: "currency",
																									currency: "ARS",
																								}
																							).format(
																								reservation.precio_carga_externa
																							)}`}
																					</span>
																				)}
																			</div>
																		</div>

																		<div className="flex gap-2 md:flex-col items-center">
																			<Link
																				href={`/reservations/edit/${reservation.id}`}
																			>
																				<Button
																					variant="ghost"
																					size="sm"
																					className="rounded-full z-50 px-[0.5rem] bg-white hover:border-orange-600 border border-orange-200 transition-all duration-300 ease-in-out"
																					onClick={(e) => e.stopPropagation()}
																				>
																					<Pencil className="h-4 w-4 text-orange-600" />
																				</Button>
																			</Link>
																		</div>
																	</div>
																</div>
															))}
														</div>
													</div>
												) : null}

												{paginatedOtherReservations.length > 0 && (
													<div className="flex flex-col gap-4">
														{(todayReservations.length > 0 ||
															upcomingInstallations.length > 0) && (
															<div className="flex items-center justify-center w-full">
																<div className="h-px bg-zinc-200 w-full" />
																<span className="px-4 text-zinc-400 whitespace-nowrap text-sm">
																	General ({otherReservations.length})
																</span>
																<div className="h-px bg-zinc-200 w-full" />
															</div>
														)}
														<div className="grid grid-cols-2 gap-4">
															{paginatedOtherReservations.map((reservation) => (
																<div
																	key={reservation.id}
																	onClick={() =>
																		router.push(
																			`/reservations/${reservation.id}`
																		)
																	}
																	className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-zinc-100/80 relative group"
																>
																	<div className="flex flex-col md:flex-row justify-between items-start gap-4">
																		<div className="flex-1">
																			<div className="flex justify-between items-start mb-4">
																				<div className="flex flex-col">
																					<div className="flex items-center gap-2 text-sm text-zinc-500">
																						<span className="flex items-center gap-1">
																							Instalación:{" "}
																							{new Date(
																								reservation.fecha_instalacion
																							).toLocaleDateString("es-AR", {
																								day: "2-digit",
																								month: "2-digit",
																								year: "2-digit",
																							})}
																						</span>
																						<span className="text-zinc-300">
																							•
																						</span>
																						<span className="flex items-center gap-1">
																							Creada:{" "}
																							{new Date(
																								reservation.creado_en
																							).toLocaleDateString("es-AR", {
																								day: "2-digit",
																								month: "2-digit",
																								year: "2-digit",
																							})}
																						</span>
																					</div>
																				</div>
																			</div>

																			<div className="flex flex-col gap-2 mb-4">
																				<div className="text-sm text-zinc-600">
																					<span className="font-medium">
																						Vehículo:
																					</span>{" "}
																					{`${reservation.marca_vehiculo || ""} ${
																						reservation.modelo_vehiculo || ""
																					} ${
																						reservation.patente_vehiculo || ""
																					}`.trim()}
																				</div>
																				<div className="text-sm text-zinc-600">
																					<span className="font-medium">
																						Cliente:
																					</span>{" "}
																					{reservation.clientes.nombre_completo}
																				</div>
																				<div className="text-sm text-zinc-600">
																					<span className="font-medium">
																						Asesor:
																					</span>{" "}
																					{reservation.usuarios.nombre_usuario}
																				</div>
																			</div>

																			<div className="flex flex-wrap gap-3 items-center">
																				<span className="text-sm font-medium text-emerald-600">
																					{new Intl.NumberFormat("es-AR", {
																						style: "currency",
																						currency: "ARS",
																					}).format(
																						reservation.monto_final_abonar
																					)}
																				</span>
																				{reservation.carga_externa > 0 && (
																					<span className="text-sm font-medium text-blue-600">
																						Carga Externa Incl.
																						{reservation.precio_carga_externa >
																							0 &&
																							` ${new Intl.NumberFormat(
																								"es-AR",
																								{
																									style: "currency",
																									currency: "ARS",
																								}
																							).format(
																								reservation.precio_carga_externa
																							)}`}
																					</span>
																				)}
																			</div>
																		</div>

																		<div className="flex gap-2 md:flex-col items-center">
																			<Link
																				href={`/reservations/edit/${reservation.id}`}
																			>
																				<Button
																					variant="ghost"
																					size="sm"
																					className="rounded-full z-50 px-[0.5rem] bg-white hover:border-orange-600 border border-orange-200 transition-all duration-300 ease-in-out"
																					onClick={(e) => e.stopPropagation()}
																				>
																					<Pencil className="h-4 w-4 text-orange-600" />
																				</Button>
																			</Link>
																		</div>
																	</div>
																</div>
															))}
														</div>
													</div>
												)}

												{filteredReservations().length === 0 && (
													<div className="text-center text-sm text-gray-600 py-8">
														No se encontraron resultados para los filtros
														aplicados.
													</div>
												)}

												{otherReservations.length > 0 && (
													<div className="flex justify-center items-center gap-2 mt-6">
														<Button
															variant="outline"
															size="sm"
															onClick={() =>
																setCurrentPage((prev) => Math.max(prev - 1, 1))
															}
															disabled={currentPage === 1}
															className="rounded-full px-4 py-2 text-zinc-600 hover:text-zinc-600 font-normal bg-zinc-100 hover:bg-zinc-50 border-none text-sm"
														>
															Anterior
														</Button>
														<span className="text-sm text-zinc-600">
															Página {currentPage} de{" "}
															{Math.ceil(
																otherReservations.length / itemsPerPage
															)}
														</span>
														<Button
															variant="outline"
															size="sm"
															onClick={() =>
																setCurrentPage((prev) =>
																	Math.min(
																		prev + 1,
																		Math.ceil(
																			otherReservations.length / itemsPerPage
																		)
																	)
																)
															}
															disabled={
																currentPage ===
																Math.ceil(
																	otherReservations.length / itemsPerPage
																)
															}
															className="rounded-full px-4 py-2 text-zinc-600 hover:text-zinc-600 font-normal bg-zinc-100 hover:bg-zinc-50 border-none text-sm"
														>
															Siguiente
														</Button>
													</div>
												)}
											</>
										);
									})()}
								</div>
							</CardContent>
						</Card>
					</main>
				</>
			)}
		</div>
	);
}
