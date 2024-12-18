"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Trash, Download, Search } from "lucide-react";

import HomeIcon from "@/components/HomeIcon";

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
					(command.boletos_reservas.modelo_patente && 
						command.boletos_reservas.modelo_patente
							.toLowerCase()
							.includes(searchTerm.toLowerCase())) ||
					command.boletos_reservas.equipo
						.toLowerCase()
						.includes(searchTerm.toLowerCase())
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
			filtered.sort((a, b) => new Date(b.creado_en) - new Date(a.creado_en));
		} else if (sortOrder === "date-asc") {
			filtered.sort((a, b) => new Date(a.creado_en) - new Date(b.creado_en));
		} else if (sortOrder === "price-desc") {
			filtered.sort(
				(a, b) =>
					parseFloat(b.boletos_reservas.precio) -
					parseFloat(a.boletos_reservas.precio)
			);
		} else if (sortOrder === "price-asc") {
			filtered.sort(
				(a, b) =>
					parseFloat(a.boletos_reservas.precio) -
					parseFloat(b.boletos_reservas.precio)
			);
		} else if (sortOrder === "last-7-days") {
			filtered = filtered.filter(
				(reservation) => new Date(reservation.creado_en) >= sevenDaysAgo
			);
		} else if (sortOrder === "last-15-days") {
			filtered = filtered.filter(
				(reservation) => new Date(reservation.creado_en) >= fifteenDaysAgo
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

		// Obtener todas las claves únicas de los objetos
		const allKeys = new Set();
		data.forEach((item) => {
			Object.keys(item).forEach((key) => allKeys.add(key));
		});

		// Convertir Set a Array y ordenar las columnas principales primero
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
					<main className="flex-1 p-6 overflow-y-auto">
						<div className="flex items-center justify-between mb-6">
							<div className="flex items-center gap-2">
								<HomeIcon label="Volver"></HomeIcon>
								<h2 className="text-zinc-700 text-base">Comandas</h2>
							</div>
						</div>

						<Card className="rounded-xl shadow-lg border-none">
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
								<div className="flex flex-col md:flex-row gap-4 mb-6">
									<div className="flex items-center w-full md:w-1/3 relative">
										<Input
											placeholder="Buscar comandas"
											className="rounded-full focus-visible:ring-0"
											value={searchTerm}
											onChange={(e) => setSearchTerm(e.target.value)}
										/>
										<Search
											className="w-5 h-5 absolute right-2 text-[#71717A]"
											strokeWidth="1.75"
										></Search>
									</div>

									<Select onValueChange={setUserFilter}>
										<SelectTrigger className="w-full md:w-1/4 rounded-full">
											<SelectValue placeholder="Filtrar por usuario" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">Todos</SelectItem>
											{users.map((user) => (
												<SelectItem key={user.id} value={user.id}>
													{user.nombre_usuario}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<Select onValueChange={setFilterModel}>
										<SelectTrigger className="w-full md:w-1/4 rounded-full">
											<SelectValue placeholder="Filtrar por estado" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">Todos</SelectItem>
											<SelectItem value="pendiente">Pendiente</SelectItem>
											<SelectItem value="en_proceso">En Proceso</SelectItem>
											<SelectItem value="completado">Completado</SelectItem>
										</SelectContent>
									</Select>
									<Select onValueChange={setSortOrder}>
										<SelectTrigger className="w-full md:w-1/4 rounded-full">
											<SelectValue placeholder="Ordenar por" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="date-desc">
												Fecha (Más reciente)
											</SelectItem>
											<SelectItem value="last-7-days">
												Fecha (Últimos 7 días)
											</SelectItem>
											<SelectItem value="last-15-days">
												Fecha (Última quincena)
											</SelectItem>
											<SelectItem value="date-asc">
												Fecha (Más antigua)
											</SelectItem>
											<SelectItem value="price-desc">
												Precio (Mayor a menor)
											</SelectItem>
											<SelectItem value="price-asc">
												Precio (Menor a mayor)
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<Table>
									<TableHeader>
										<TableRow>
											{userRole === 3 && (
												<TableHead className="w-[50px]">Seleccionar</TableHead>
											)}
											<TableHead>Asesor</TableHead>
											<TableHead>Cliente</TableHead>
											<TableHead>Modelo</TableHead>
											<TableHead>Patente</TableHead>
											<TableHead>Fecha</TableHead>
											<TableHead>Estado</TableHead>
											{userRole !== 2 && <TableHead>Acciones</TableHead>}
										</TableRow>
									</TableHeader>
									<TableBody>
										{filteredCommands().length > 0 ? (
											filteredCommands().map((command) => (
												<TableRow
													key={command.id}
													className="cursor-pointer"
													onClick={(e) => {
														// Solo navegar si no se hace clic en el checkbox o botones
														if (
															!e.target.closest("button") &&
															!e.target.closest(".checkbox-cell")
														) {
															if (userRole === 2) {
																router.push(`/add-technique/${command.id}/`);
															} else if (userRole === 3) {
																router.push(`/commands/${command.id}`);
															}
														}
													}}
												>
													{userRole === 3 && (
														<TableCell className="checkbox-cell">
															<Checkbox
																checked={selectedCommands.includes(command.id)}
																onCheckedChange={() =>
																	handleCommandSelection(command.id)
																}
																onClick={(e) => e.stopPropagation()}
															/>
														</TableCell>
													)}
													<TableCell className="text-zinc-800">
														{command.boletos_reservas.usuarios.nombre_usuario}
													</TableCell>
													<TableCell className="text-zinc-800">
														{command.boletos_reservas.clientes.nombre_completo}
													</TableCell>
													<TableCell className="text-zinc-800">
														{`${command.boletos_reservas.marca_vehiculo || ""} ${
															command.boletos_reservas.modelo_vehiculo || ""
														}`.trim()}
													</TableCell>
													<TableCell className="text-zinc-800">
														{command.boletos_reservas.patente_vehiculo}
													</TableCell>
													<TableCell className="text-zinc-800">
														{new Date(
															command.boletos_reservas.creado_en
														).toLocaleDateString("es-AR", {
															day: "2-digit",
															month: "2-digit",
														})}
													</TableCell>
													<TableCell>
														<span
															className={`px-2 truncate py-1 text-xs font-normal rounded-full ${
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
													{userRole !== 2 && (
														<TableCell>
															<div className="flex flex-row items-start gap-2">
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
														</TableCell>
													)}
												</TableRow>
											))
										) : (
											<TableRow>
												<TableCell
													colSpan={7}
													className="text-center text-gray-600"
												>
													No se encontraron resultados para los filtros
													aplicados.
												</TableCell>
											</TableRow>
										)}
									</TableBody>
								</Table>
							</CardContent>
						</Card>
					</main>
				</>
			)}
		</div>
	);
}
