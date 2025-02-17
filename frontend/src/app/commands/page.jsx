"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Trash, Download, Search } from "lucide-react";

// import HomeIcon from "@/components/HomeIcon";

import {
	getCommands,
	getUsers,
	deleteCommand,
	getCommandCSV,
} from "../reservations/reservations.api";

import Aside from "@/components/Aside";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { saveAs } from "file-saver";
import Image from "next/image";
import myImage from "@/public/motorgas2.svg";
import { motion } from "framer-motion";

export const dynamic = "force-dynamic";

export default function AllOrdersPage() {
	const [commands, setCommands] = useState([]);
	const [users, setUsers] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [filterModel, setFilterModel] = useState("all");
	const [userFilter, setUserFilter] = useState("all");
	const [sortOrder, setSortOrder] = useState("date-desc");
	const [selectedCommands, setSelectedCommands] = useState([]);
	const [loading, setLoading] = useState(true);
	const [dataFetched, setDataFetched] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 8;

	const { data: session } = useSession();
	useEffect(() => {
		document.title = "Motorgas - Comandas";
	}, []);
	const userRole = session?.user?.role;
	const router = useRouter();

	useEffect(() => {
		const fetchData = async () => {
			if (dataFetched && commands.length > 0) {
				return;
			}

			if (!session?.user) return;

			setLoading(true);
			try {
				const [commandsData, usersData] = await Promise.all([
					getCommands(),
					getUsers(),
				]);

				setCommands(commandsData);
				const filteredUsers = usersData.filter(
					(user) => user.role_id === 1 || user.id === 1
				);
				setUsers(filteredUsers);
				setDataFetched(true);
			} catch (error) {
				console.error("Error loading data:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [session, dataFetched, commands.length]);

	const filteredCommands = () => {
		let filtered = commands;

		if (searchTerm) {
			filtered = filtered.filter(
				(command) =>
					command.boletos_reservas.clientes.nombre_completo
						.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					(command.boletos_reservas.clientes.dni != null &&
						String(command.boletos_reservas.clientes.dni).includes(
							searchTerm
						)) ||
					command.boletos_reservas.clientes.domicilio
						.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					command.boletos_reservas.usuarios.nombre_usuario
						.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					command.boletos_reservas.clientes.localidad
						.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					(command.boletos_reservas.clientes.telefono != null &&
						String(command.boletos_reservas.clientes.telefono).includes(
							searchTerm
						)) ||
					(command.boletos_reservas.patente_vehiculo &&
						command.boletos_reservas.patente_vehiculo
							.toLowerCase()
							.includes(searchTerm.toLowerCase())) ||
					command.boletos_reservas.equipo
						.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					(command.boletos_reservas.modelo_vehiculo &&
						command.boletos_reservas.modelo_vehiculo
							.toLowerCase()
							.includes(searchTerm.toLowerCase())) ||
					(command.boletos_reservas.marca_vehiculo &&
						command.boletos_reservas.marca_vehiculo
							.toLowerCase()
							.includes(searchTerm.toLowerCase())) ||
					(command.boletos_reservas.equipo &&
						command.boletos_reservas.equipo
							.toLowerCase()
							.includes(searchTerm.toLowerCase()))
			);
		}

		if (filterModel !== "all") {
			filtered = filtered.filter(
				(reservation) => reservation.estado === filterModel
			);
		}

		if (userFilter !== "all") {
			filtered = filtered.filter(
				(command) => command.boletos_reservas.usuario_id === userFilter
			);
		}

		const currentDate = new Date();
		const sevenDaysAgo = new Date();
		sevenDaysAgo.setDate(currentDate.getDate() - 7);
		const fifteenDaysAgo = new Date();
		fifteenDaysAgo.setDate(currentDate.getDate() - 15);

		if (sortOrder === "date-desc") {
			filtered.sort(
				(a, b) =>
					new Date(b.boletos_reservas.fecha_instalacion) -
					new Date(a.boletos_reservas.fecha_instalacion)
			);
		} else if (sortOrder === "date-asc") {
			filtered.sort(
				(a, b) =>
					new Date(a.boletos_reservas.fecha_instalacion) -
					new Date(b.boletos_reservas.fecha_instalacion)
			);
		} else if (sortOrder === "first-fortnight") {
			const today = new Date();
			const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
			const fifteenthDay = new Date(today.getFullYear(), today.getMonth(), 15);
			filtered = filtered.filter((command) => {
				const installationDate = new Date(
					command.boletos_reservas.fecha_instalacion
				);
				return installationDate >= firstDay && installationDate <= fifteenthDay;
			});
			filtered.sort(
				(a, b) =>
					new Date(a.boletos_reservas.fecha_instalacion) -
					new Date(b.boletos_reservas.fecha_instalacion)
			);
		} else if (sortOrder === "second-fortnight") {
			const today = new Date();
			const sixteenthDay = new Date(today.getFullYear(), today.getMonth(), 16);
			const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
			filtered = filtered.filter((command) => {
				const installationDate = new Date(
					command.boletos_reservas.fecha_instalacion
				);
				return installationDate >= sixteenthDay && installationDate <= lastDay;
			});
			filtered.sort(
				(a, b) =>
					new Date(a.boletos_reservas.fecha_instalacion) -
					new Date(b.boletos_reservas.fecha_instalacion)
			);
		} else if (sortOrder === "next-week") {
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			const nextWeekStart = new Date(today);
			nextWeekStart.setDate(today.getDate() + 1); // Empezar desde mañana
			const nextWeekEnd = new Date(today);
			nextWeekEnd.setDate(today.getDate() + 7); // 7 días desde hoy
			filtered = filtered.filter((command) => {
				const installationDate = new Date(
					command.boletos_reservas.fecha_instalacion
				);
				installationDate.setHours(0, 0, 0, 0);
				return (
					installationDate >= nextWeekStart && installationDate <= nextWeekEnd
				);
			});
			filtered.sort(
				(a, b) =>
					new Date(a.boletos_reservas.fecha_instalacion) -
					new Date(b.boletos_reservas.fecha_instalacion)
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
			filtered = filtered.filter((command) => {
				const installationDate = new Date(
					command.boletos_reservas.fecha_instalacion
				);
				return (
					installationDate >= nextMonthStart && installationDate <= nextMonthEnd
				);
			});
			filtered.sort(
				(a, b) =>
					new Date(a.boletos_reservas.fecha_instalacion) -
					new Date(b.boletos_reservas.fecha_instalacion)
			);
		}
		return filtered;
	};

	const handleDeleteCommand = async (id) => {
		const confirmDelete = window.confirm(
			"¿Está seguro de que desea eliminar esta comanda?"
		);

		if (confirmDelete) {
			try {
				await deleteCommand(id);
				setCommands((prevCommands) =>
					prevCommands.filter((command) => command.id !== id)
				);
			} catch (error) {
				console.error("Error al eliminar la reserva:", error);
			}
		}
	};

	const handleCommandSelection = (commandId) => {
		setSelectedCommands((prev) => {
			if (prev.includes(commandId)) {
				return prev.filter((id) => id !== commandId);
			} else {
				return [...prev, commandId];
			}
		});
	};

	const downloadSelectedCsv = async () => {
		try {
			const selectedData = await Promise.all(
				selectedCommands.map(async (id) => {
					const response = await getCommandCSV(id);
					return response;
				})
			);

			if (selectedData.length > 0) {
				generateCSV(selectedData);
			}
		} catch (error) {
			console.error("Error al descargar CSV:", error.message);
		}
	};

	const downloadCsv = async (id) => {
		try {
			const response = await getCommandCSV(id);
			if (!response || !response.id) {
				throw new Error("Datos de la comanda no son válidos.");
			}
			generateCSV([response]);
		} catch (error) {
			console.error("Error al descargar CSV:", error.message);
		}
	};

	const generateCSV = (data) => {
		if (!Array.isArray(data)) {
			data = [data];
		}

		const allKeys = new Set();
		data.forEach((item) => {
			Object.keys(item).forEach((key) => allKeys.add(key));
		});

		const mainColumns = [
			"id",
			"equipo",
			"nombre_usuario",
			"dominio",
			"carga_externa",
			"precio_carga_externa",
		];
		const paymentColumns = Array.from(allKeys)
			.filter((key) => !mainColumns.includes(key))
			.sort();

		const orderedHeaders = [...mainColumns, ...paymentColumns];

		const rows = data.map((item) => {
			return orderedHeaders.map((header) => {
				const value = item[header] || "";
				return value.toString();
			});
		});

		const csvContent = [
			orderedHeaders.join(","),
			...rows.map((row) => row.join(",")),
		].join("\n");

		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
		saveAs(blob, "comandas.csv");
	};

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
								<div className="flex justify-between items-center relative">
									<CardTitle className="text-xl font-light text-zinc-800">
										Lista de Comandas
									</CardTitle>
									{selectedCommands.length > 0 && (
										<Button
											variant="outline"
											size="sm"
											className="absolute top-0 right-0 rounded-full text-blue-600 hover:text-blue-600 font-normal bg-blue-100 hover:bg-blue-50 border-none"
											onClick={downloadSelectedCsv}
										>
											<Download className="h-4 w-4 text-blue-600 mr-2" />
											Descargar {selectedCommands.length} seleccionadas
										</Button>
									)}
								</div>
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
										<Select
											onValueChange={setUserFilter}
											className="py-4 border-none active:border-none focus-visible:border-none focus:border-none focus:ring-0 active:ring-0 focus-visible:ring-0 outline-none ring-0 ring-offset-0"
										>
											<SelectTrigger className="w-full rounded-2xl bg-white border-zinc-200 focus:ring-0 focus-visible:ring-0 focus:outline-none focus-visible:outline-none active:outline-none ring-0 ring-offset-0 data-[state=active]:ring-0 data-[state=focus]:ring-0 text-zinc-800">
												<SelectValue placeholder="Filtrar por asesor" />
											</SelectTrigger>
											<SelectContent className="focus:ring-0 focus-visible:ring-0 focus:outline-none focus-visible:outline-none active:outline-none ring-0 ring-offset-0 text-zinc-800">
												<SelectItem
													value="all"
													className="focus:ring-0 focus-visible:ring-0 focus:outline-none focus-visible:outline-none active:outline-none ring-0 ring-offset-0"
												>
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

										<Select
											onValueChange={setFilterModel}
											className="py-4 border-none active:border-none focus-visible:border-none focus:border-none focus:ring-0 active:ring-0 focus-visible:ring-0 outline-none ring-0 ring-offset-0"
										>
											<SelectTrigger className="w-full rounded-2xl bg-white border-zinc-200 focus:ring-0 focus-visible:ring-0 focus:outline-none focus-visible:outline-none active:outline-none ring-0 ring-offset-0 data-[state=active]:ring-0 data-[state=focus]:ring-0 text-zinc-800">
												<SelectValue placeholder="Estado de la comanda" />
											</SelectTrigger>
											<SelectContent className="focus:ring-0 focus-visible:ring-0 focus:outline-none focus-visible:outline-none active:outline-none ring-0 ring-offset-0 text-zinc-800">
												<SelectItem
													value="all"
													className="focus:ring-0 focus-visible:ring-0 focus:outline-none focus-visible:outline-none active:outline-none ring-0 ring-offset-0"
												>
													Todos los estados
												</SelectItem>
												<SelectItem
													value="pendiente"
													className="focus:ring-0 focus-visible:ring-0 focus:outline-none focus-visible:outline-none active:outline-none ring-0 ring-offset-0"
												>
													Pendientes
												</SelectItem>
												<SelectItem
													value="en_proceso"
													className="focus:ring-0 focus-visible:ring-0 focus:outline-none focus-visible:outline-none active:outline-none ring-0 ring-offset-0"
												>
													En Proceso
												</SelectItem>
												<SelectItem
													value="completado"
													className="focus:ring-0 focus-visible:ring-0 focus:outline-none focus-visible:outline-none active:outline-none ring-0 ring-offset-0"
												>
													Completadas
												</SelectItem>
											</SelectContent>
										</Select>

										<Select
											onValueChange={setSortOrder}
											className="py-4 border-none active:border-none focus-visible:border-none focus:border-none focus:ring-0 active:ring-0 focus-visible:ring-0 outline-none ring-0 ring-offset-0 "
										>
											<SelectTrigger className="w-full rounded-2xl bg-white border-zinc-200 focus:ring-0 focus-visible:ring-0 focus:outline-none focus-visible:outline-none active:outline-none ring-0 ring-offset-0 data-[state=active]:ring-0 data-[state=focus]:ring-0 text-zinc-800">
												<SelectValue placeholder="Ordenar comandas" />
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

										const todayCommands = filteredCommands().filter(
											(command) => {
												const installationDate = new Date(
													command.boletos_reservas.fecha_instalacion
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

										const otherCommands = filteredCommands().filter(
											(command) => {
												const installationDate = new Date(
													command.boletos_reservas.fecha_instalacion
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
										const upcomingInstallations = otherCommands
											.filter((command) => {
												const installationDate = new Date(
													command.boletos_reservas.fecha_instalacion
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
													new Date(a.boletos_reservas.fecha_instalacion) -
													new Date(b.boletos_reservas.fecha_instalacion)
											)
											.slice(0, 5);

										const startIndex = (currentPage - 1) * itemsPerPage;
										const paginatedOtherCommands = otherCommands
											.filter(
												(command) =>
													!upcomingInstallations.some(
														(upcoming) => upcoming.id === command.id
													)
											)
											.slice(startIndex, startIndex + itemsPerPage);

										return (
											<>
												{todayCommands.length > 0 ? (
													<div className="flex flex-col gap-4">
														<div className="flex items-center gap-2">
															<h3 className="text-xl font-light text-zinc-800">
																Instalaciones de hoy
															</h3>
															<span className="text-sm text-zinc-500">
																({todayCommands.length})
															</span>
														</div>
														<div className="grid grid-cols-2 gap-4">
															{todayCommands.map((command) => (
																<div
																	key={command.id}
																	onClick={() => {
																		if (userRole === 2) {
																			router.push(
																				`/add-technique/${command.id}/`
																			);
																		} else if (userRole === 3) {
																			router.push(`/commands/${command.id}`);
																		}
																	}}
																	className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-zinc-100/80 relative group"
																>
																	<div className="flex flex-col md:flex-row justify-between items-start gap-4">
																		<div className="flex-1">
																			<div className="flex justify-between items-start mb-4">
																				<div className="flex flex-col">
																					<div className="flex items-center gap-2 text-sm text-zinc-500">
																						<span className="flex items-center gap-1">
																							Instalación:{" "}
																							{(() => {
																								const date = new Date(
																									command.boletos_reservas.fecha_instalacion
																								);
																								date.setHours(
																									date.getHours() + 3
																								);
																								return date.toLocaleDateString(
																									"es-AR",
																									{
																										day: "2-digit",
																										month: "2-digit",
																										year: "2-digit",
																									}
																								);
																							})()}
																						</span>
																						<span className="text-zinc-300">
																							•
																						</span>
																						<span className="flex items-center gap-1">
																							Creada:{" "}
																							{(() => {
																								const date = new Date(
																									command.creado_en
																								);
																								return date.toLocaleDateString(
																									"es-AR",
																									{
																										day: "2-digit",
																										month: "2-digit",
																										year: "2-digit",
																									}
																								);
																							})()}
																						</span>
																					</div>
																				</div>
																			</div>

																			<div className="flex flex-col gap-2 mb-4">
																				<div className="text-sm text-zinc-600">
																					<span className="font-medium">
																						Vehículo:
																					</span>{" "}
																					{`${command.boletos_reservas.marca_vehiculo || ""} ${
																						command.boletos_reservas
																							.modelo_vehiculo || ""
																					} ${
																						command.boletos_reservas
																							.patente_vehiculo || ""
																					}`.trim()}
																				</div>
																				<div className="text-sm text-zinc-600">
																					<span className="font-medium">
																						Cliente:
																					</span>{" "}
																					{
																						command.boletos_reservas.clientes
																							.nombre_completo
																					}
																				</div>
																				<div className="text-sm text-zinc-600">
																					<span className="font-medium">
																						Asesor:
																					</span>{" "}
																					{
																						command.boletos_reservas.usuarios
																							.nombre_usuario
																					}
																				</div>
																			</div>

																			<div className="flex flex-wrap gap-3 items-center">
																				<span
																					className={`px-3 py-1 text-sm font-normal rounded-full ${
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
																				<span className="text-sm font-medium text-emerald-600">
																					{new Intl.NumberFormat("es-AR", {
																						style: "currency",
																						currency: "ARS",
																					}).format(
																						command.boletos_reservas.precio
																					)}
																				</span>
																				{command.boletos_reservas
																					.carga_externa > 0 && (
																					<span className="text-sm font-medium text-blue-600">
																						Carga Externa Incl.
																						{command.boletos_reservas
																							.precio_carga_externa > 0 &&
																							` ${new Intl.NumberFormat(
																								"es-AR",
																								{
																									style: "currency",
																									currency: "ARS",
																								}
																							).format(
																								command.boletos_reservas
																									.precio_carga_externa
																							)}`}
																					</span>
																				)}
																			</div>
																		</div>

																		{userRole !== 2 && (
																			<div className="flex gap-2 md:flex-col items-center">
																				{userRole === 3 && (
																					<Checkbox
																						checked={selectedCommands.includes(
																							command.id
																						)}
																						onCheckedChange={() =>
																							handleCommandSelection(command.id)
																						}
																						onClick={(e) => e.stopPropagation()}
																						className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 rounded-full border-zinc-400 group-hover:border-zinc-500 transition-all duration-300"
																					/>
																				)}
																				<Button
																					variant="ghost"
																					size="sm"
																					className="rounded-full z-50 px-[0.5rem] bg-blue-100 hover:bg-blue-50"
																					onClick={(e) => {
																						e.stopPropagation();
																						downloadCsv(command.id);
																					}}
																				>
																					<Download className="h-4 w-4 text-blue-600" />
																				</Button>
																				<Button
																					variant="ghost"
																					size="sm"
																					className="rounded-full z-50 px-[0.5rem] bg-red-100 hover:bg-red-50"
																					onClick={(e) => {
																						e.stopPropagation();
																						handleDeleteCommand(command.id);
																					}}
																				>
																					<Trash className="h-4 w-4 text-red-600" />
																				</Button>
																			</div>
																		)}
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
															<span className="text-sm text-zinc-500">
																(próximos 5 días)
															</span>
														</div>
														<div className="grid grid-cols-2 gap-4">
															{upcomingInstallations.map((command) => (
																<div
																	key={command.id}
																	onClick={() => {
																		if (userRole === 2) {
																			router.push(
																				`/add-technique/${command.id}/`
																			);
																		} else if (userRole === 3) {
																			router.push(`/commands/${command.id}`);
																		}
																	}}
																	className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-zinc-100/80 relative group"
																>
																	<div className="flex flex-col md:flex-row justify-between items-start gap-4">
																		<div className="flex-1">
																			<div className="flex justify-between items-start mb-4">
																				<div className="flex flex-col">
																					<div className="flex items-center gap-2 text-sm text-zinc-500">
																						<span className="flex items-center gap-1">
																							Instalación:{" "}
																							{(() => {
																								const date = new Date(
																									command.boletos_reservas.fecha_instalacion
																								);
																								date.setHours(
																									date.getHours() + 3
																								);
																								return date.toLocaleDateString(
																									"es-AR",
																									{
																										day: "2-digit",
																										month: "2-digit",
																										year: "2-digit",
																									}
																								);
																							})()}
																						</span>
																						<span className="text-zinc-300">
																							•
																						</span>
																						<span className="flex items-center gap-1">
																							Creada:{" "}
																							{(() => {
																								const date = new Date(
																									command.creado_en
																								);
																								return date.toLocaleDateString(
																									"es-AR",
																									{
																										day: "2-digit",
																										month: "2-digit",
																										year: "2-digit",
																									}
																								);
																							})()}
																						</span>
																					</div>
																				</div>
																			</div>

																			<div className="flex flex-col gap-2 mb-4">
																				<div className="text-sm text-zinc-600">
																					<span className="font-medium">
																						Vehículo:
																					</span>{" "}
																					{`${command.boletos_reservas.marca_vehiculo || ""} ${
																						command.boletos_reservas
																							.modelo_vehiculo || ""
																					} ${
																						command.boletos_reservas
																							.patente_vehiculo || ""
																					}`.trim()}
																				</div>
																				<div className="text-sm text-zinc-600">
																					<span className="font-medium">
																						Cliente:
																					</span>{" "}
																					{
																						command.boletos_reservas.clientes
																							.nombre_completo
																					}
																				</div>
																				<div className="text-sm text-zinc-600">
																					<span className="font-medium">
																						Asesor:
																					</span>{" "}
																					{
																						command.boletos_reservas.usuarios
																							.nombre_usuario
																					}
																				</div>
																			</div>

																			<div className="flex flex-wrap gap-3 items-center">
																				<span
																					className={`px-3 py-1 text-sm font-normal rounded-full ${
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
																				<span className="text-sm font-medium text-emerald-600">
																					{new Intl.NumberFormat("es-AR", {
																						style: "currency",
																						currency: "ARS",
																					}).format(
																						command.boletos_reservas.precio
																					)}
																				</span>
																				{command.boletos_reservas
																					.carga_externa > 0 && (
																					<span className="text-sm font-medium text-blue-600">
																						Carga Externa Incl.
																						{command.boletos_reservas
																							.precio_carga_externa > 0 &&
																							` ${new Intl.NumberFormat(
																								"es-AR",
																								{
																									style: "currency",
																									currency: "ARS",
																								}
																							).format(
																								command.boletos_reservas
																									.precio_carga_externa
																							)}`}
																					</span>
																				)}
																			</div>
																		</div>

																		{userRole !== 2 && (
																			<div className="flex gap-2 md:flex-col items-center">
																				{userRole === 3 && (
																					<Checkbox
																						checked={selectedCommands.includes(
																							command.id
																						)}
																						onCheckedChange={() =>
																							handleCommandSelection(command.id)
																						}
																						onClick={(e) => e.stopPropagation()}
																						className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 rounded-full border-zinc-400 group-hover:border-zinc-500 transition-all duration-300"
																					/>
																				)}
																				<Button
																					variant="ghost"
																					size="sm"
																					className="rounded-full z-50 px-[0.5rem] bg-blue-100 hover:bg-blue-50"
																					onClick={(e) => {
																						e.stopPropagation();
																						downloadCsv(command.id);
																					}}
																				>
																					<Download className="h-4 w-4 text-blue-600" />
																				</Button>
																				<Button
																					variant="ghost"
																					size="sm"
																					className="rounded-full z-50 px-[0.5rem] bg-red-100 hover:bg-red-50"
																					onClick={(e) => {
																						e.stopPropagation();
																						handleDeleteCommand(command.id);
																					}}
																				>
																					<Trash className="h-4 w-4 text-red-600" />
																				</Button>
																			</div>
																		)}
																	</div>
																</div>
															))}
														</div>
													</div>
												) : null}

												{paginatedOtherCommands.length > 0 && (
													<div className="flex flex-col gap-4">
														{(todayCommands.length > 0 ||
															upcomingInstallations.length > 0) && (
															<div className="flex items-center justify-center w-full">
																<div className="h-px bg-zinc-200 w-full" />
																<span className="px-4 text-zinc-400 whitespace-nowrap text-sm">
																	General ({otherCommands.length})
																</span>
																<div className="h-px bg-zinc-200 w-full" />
															</div>
														)}
														<div className="grid grid-cols-2 gap-4">
															{paginatedOtherCommands.map((command) => (
																<div
																	key={command.id}
																	onClick={() => {
																		if (userRole === 2) {
																			router.push(
																				`/add-technique/${command.id}/`
																			);
																		} else if (userRole === 3) {
																			router.push(`/commands/${command.id}`);
																		}
																	}}
																	className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-zinc-100/80 relative group"
																>
																	<div className="flex flex-col md:flex-row justify-between items-start gap-4">
																		<div className="flex-1">
																			<div className="flex justify-between items-start mb-4">
																				<div className="flex flex-col">
																					<div className="flex items-center gap-2 text-sm text-zinc-500">
																						{userRole === 3 && (
																							<Checkbox
																								checked={selectedCommands.includes(
																									command.id
																								)}
																								onCheckedChange={() =>
																									handleCommandSelection(
																										command.id
																									)
																								}
																								onClick={(e) =>
																									e.stopPropagation()
																								}
																								className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 rounded-full border-zinc-400 group-hover:border-zinc-500 transition-all duration-300"
																							/>
																						)}
																						<span className="flex items-center gap-1">
																							Instalación:{" "}
																							{(() => {
																								const date = new Date(
																									command.boletos_reservas.fecha_instalacion
																								);
																								date.setHours(
																									date.getHours() + 3
																								);
																								return date.toLocaleDateString(
																									"es-AR",
																									{
																										day: "2-digit",
																										month: "2-digit",
																										year: "2-digit",
																									}
																								);
																							})()}
																						</span>
																						<span className="text-zinc-300">
																							•
																						</span>
																						<span className="flex items-center gap-1">
																							Creada:{" "}
																							{(() => {
																								const date = new Date(
																									command.creado_en
																								);
																								return date.toLocaleDateString(
																									"es-AR",
																									{
																										day: "2-digit",
																										month: "2-digit",
																										year: "2-digit",
																									}
																								);
																							})()}
																						</span>
																					</div>
																				</div>
																			</div>

																			<div className="flex flex-col gap-2 mb-4">
																				<div className="text-sm text-zinc-600">
																					<span className="font-medium">
																						Vehículo:
																					</span>{" "}
																					{`${command.boletos_reservas.marca_vehiculo || ""} ${
																						command.boletos_reservas
																							.modelo_vehiculo || ""
																					} ${
																						command.boletos_reservas
																							.patente_vehiculo || ""
																					}`.trim()}
																				</div>
																				<div className="text-sm text-zinc-600">
																					<span className="font-medium">
																						Cliente:
																					</span>{" "}
																					{
																						command.boletos_reservas.clientes
																							.nombre_completo
																					}
																				</div>
																				<div className="text-sm text-zinc-600">
																					<span className="font-medium">
																						Asesor:
																					</span>{" "}
																					{
																						command.boletos_reservas.usuarios
																							.nombre_usuario
																					}
																				</div>
																			</div>

																			<div className="flex flex-wrap gap-3 items-center">
																				<span
																					className={`px-3 py-1 text-sm font-normal rounded-full ${
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
																				<span className="text-sm font-medium text-emerald-600">
																					{new Intl.NumberFormat("es-AR", {
																						style: "currency",
																						currency: "ARS",
																					}).format(
																						command.boletos_reservas.precio
																					)}
																				</span>
																				{command.boletos_reservas
																					.carga_externa > 0 && (
																					<span className="text-sm font-medium text-blue-600">
																						Carga Externa Incl.
																						{command.boletos_reservas
																							.precio_carga_externa > 0 &&
																							` ${new Intl.NumberFormat(
																								"es-AR",
																								{
																									style: "currency",
																									currency: "ARS",
																								}
																							).format(
																								command.boletos_reservas
																									.precio_carga_externa
																							)}`}
																					</span>
																				)}
																			</div>
																		</div>

																		{userRole !== 2 && (
																			<div className="flex gap-2 md:flex-col items-center">
																				<Button
																					variant="ghost"
																					size="sm"
																					className="rounded-full z-50 px-[0.5rem] bg-white hover:border-blue-600 border border-blue-200 transition-all duration-300 ease-in-out"
																					onClick={(e) => {
																						e.stopPropagation();
																						downloadCsv(command.id);
																					}}
																				>
																					<Download className="h-4 w-4 text-blue-600" />
																				</Button>
																				<Button
																					variant="ghost"
																					size="sm"
																					className="rounded-full z-50 px-[0.5rem] bg-white border border-red-200 hover:border-red-600 transition-all duration-300 ease-in-out hover:bg-red-50"
																					onClick={(e) => {
																						e.stopPropagation();
																						handleDeleteCommand(command.id);
																					}}
																				>
																					<Trash className="h-4 w-4 text-red-600" />
																				</Button>
																			</div>
																		)}
																	</div>
																</div>
															))}
														</div>
													</div>
												)}

												{filteredCommands().length === 0 && (
													<div className="text-center text-gray-600 py-8">
														No se encontraron resultados para los filtros
														aplicados.
													</div>
												)}

												{otherCommands.length > 0 && (
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
															{Math.ceil(otherCommands.length / itemsPerPage)}
														</span>
														<Button
															variant="outline"
															size="sm"
															onClick={() =>
																setCurrentPage((prev) =>
																	Math.min(
																		prev + 1,
																		Math.ceil(
																			otherCommands.length / itemsPerPage
																		)
																	)
																)
															}
															disabled={
																currentPage ===
																Math.ceil(otherCommands.length / itemsPerPage)
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
