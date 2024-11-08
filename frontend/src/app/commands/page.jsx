"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { Pencil, Trash } from "lucide-react";
import Link from "next/link";

import HomeIcon from "@/components/HomeIcon";

import { getCommands, getUsers } from "../reservations/reservations.api";

import Aside from "@/components/Aside";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AllOrdersPage() {
	const [commands, setCommands] = useState([]);
	const [users, setUsers] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [filterModel, setFilterModel] = useState("all");
	const [userFilter, setUserFilter] = useState("all");
	const [sortOrder, setSortOrder] = useState("date-desc");

	const { data: session } = useSession();
	const userRole = session?.user?.role;
	const router = useRouter();

	useEffect(() => {
		const fetchCommands = async () => {
			const data = await getCommands();
			setCommands(data); // Actualizar el estado con las reservas
		};

		fetchCommands();
	}, []);

	useEffect(() => {
		const fetchUsers = async () => {
			const data = await getUsers();
			const filteredUsers = data.filter((user) => user.role_id === 1); // Filtrar usuarios con rol = 1
			setUsers(filteredUsers); // Actualizar el estado con los usuarios filtrados
		};

		fetchUsers();
	}, []);

	const filteredCommands = () => {
		let filtered = commands;

		if (searchTerm) {
			filtered = filtered.filter(
				(command) =>
					command.boletos_reservas.clientes.nombre_completo
						.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					(command.boletos_reservas.clientes.dni != null && // Asegurarse de que no sea null o undefined
						String(command.boletos_reservas.clientes.dni).includes(
							searchTerm
						)) || // Convertir DNI a string para la búsqueda
					command.boletos_reservas.clientes.domicilio
						.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					command.boletos_reservas.usuarios.nombre_usuario
						.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					command.boletos_reservas.clientes.localidad
						.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					(command.boletos_reservas.clientes.telefono != null && // Asegurarse de que no sea null o undefined
						String(command.boletos_reservas.clientes.telefono).includes(
							searchTerm
						)) ||
					command.boletos_reservas.modelo_patente
						.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
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
				(command) => command.boletos_reservas.usuario_id === userFilter // Asegúrate de que esto sea correcto según tu estructura de datos
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

	return (
		<div className="flex bg-zinc-50">
			{/* Sidebar */}
			<Aside />
			{/* Main Content */}
			<main className="flex-1 p-6 overflow-y-auto">
				<div className="flex items-center justify-between mb-6">
					<div className="flex items-center gap-2">
						<HomeIcon label="Volver"></HomeIcon>
						<h2 className="text-zinc-700 text-base">Comandas</h2>
					</div>
				</div>

				<Card className="rounded-xl shadow-lg border-none">
					<CardHeader>
						<CardTitle className="text-xl font-light text-zinc-800">
							Lista de Comandas
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex flex-col md:flex-row gap-4 mb-6">
							<Input
								placeholder="Buscar reservas..."
								className="rounded-full"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
							<Select onValueChange={setUserFilter}>
								<SelectTrigger className="w-full md:w-1/4 rounded-full">
									<SelectValue placeholder="Filtrar por usuario" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Todos</SelectItem>
									{users.map((user) => (
										<SelectItem key={user.id} value={user.id}>
											{user.nombre_usuario}{" "}
											{/* Cambia esto según el campo que quieras mostrar */}
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
									<SelectItem value="date-asc">Fecha (Más antigua)</SelectItem>
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
									<TableHead>Asesor</TableHead>
									<TableHead>Cliente</TableHead>
									<TableHead>Modelo</TableHead>

									<TableHead>Fecha</TableHead>
									<TableHead>Estado</TableHead>
									<TableHead>Acciones</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredCommands().length > 0 ? (
									filteredCommands().map((command) => (
										<TableRow
											key={command.id}
											className="cursor-pointer"
											onClick={() => {
												if (userRole === 2) {
													router.push(`/add-technique/${command.id}/`);
												} else if (userRole === 3) {
													router.push(`/commands/${command.id}`);
												}
											}}
										>
											<TableCell className="text-zinc-800">
												{command.boletos_reservas.usuarios.nombre_usuario}
											</TableCell>
											<TableCell className="text-zinc-800">
												{command.boletos_reservas.clientes.nombre_completo}
											</TableCell>
											<TableCell className="text-zinc-800">
												{command.boletos_reservas.modelo_patente}
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
											<TableCell>
												<div className="flex flex-row items-center gap-2">
													<Link href={`/commands/edit/${command.id}`}>
														<Button
															variant="ghost"
															size="sm"
															className="rounded-full z-50 px-[0.5rem] bg-orange-100 hover:bg-orange-50"
															onClick={(e) => {
																e.stopPropagation(); // Previene que el clic se propague al TableRow
															}}
														>
															<Pencil className="h-4 w-4 text-orange-600" />
														</Button>
													</Link>
													<Button
														variant="ghost"
														size="sm"
														className="rounded-full z-50 px-[0.5rem] bg-red-100 hover:bg-red-50"
														onClick={(e) => {
															e.stopPropagation(); // Previene que el clic se propague al TableRow
															handleDeleteReservation(command.id); // Llama a la función de eliminación
														}}
													>
														<Trash className="h-4 w-4 text-red-600" />
													</Button>
												</div>
											</TableCell>
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell
											colSpan={6}
											className="text-center text-gray-600"
										>
											No se encontraron resultados para los filtros aplicados.
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
						{/* <div className="flex items-center justify-between mt-4">
							<p className="text-sm text-muted-foreground">
								Mostrando 1-10 de 100 resultados
							</p>
							<div className="flex items-center space-x-2">
								<Button variant="outline" size="sm" className="rounded-full">
									<ChevronLeft className="w-4 h-4 mr-2" />
									Anterior
								</Button>
								<Button variant="outline" size="sm" className="rounded-full">
									Siguiente
									<ChevronRight className="w-4 h-4 ml-2" />
								</Button>
							</div>
						</div> */}
					</CardContent>
				</Card>
			</main>
		</div>
	);
}
