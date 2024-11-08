"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { motion } from "framer-motion";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import { Search, Pencil, Trash } from "lucide-react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import HomeIcon from "@/components/HomeIcon";
import Image from "next/image";
import myImage from "@/public/motorgas2.svg";
import {
	getReservations,
	getUsers,
	deleteReservation,
} from "../reservations/reservations.api";

import Aside from "@/components/Aside";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export const dynamic = "force-dynamic";

export default function AllReservationsPage() {
	const router = useRouter();
	const { data: session } = useSession();
	const [reservations, setReservations] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [loading, setLoading] = useState(true);
	const [sortOrder, setSortOrder] = useState("date-desc");

	const [users, setUsers] = useState([]);
	const [userFilter, setUserFilter] = useState("all");

	useEffect(() => {
		const fetchReservations = async () => {
			setLoading(true);
			try {
				const data = await getReservations();
				setReservations(data);
				await new Promise((resolve) => setTimeout(resolve, 150));
			} finally {
				setLoading(false);
			}
		};

		fetchReservations();
	}, []);

	useEffect(() => {
		const fetchUsers = async () => {
			setLoading(true);
			try {
				const data = await getUsers();
				const filteredUsers = data.filter((user) => user.role_id === 1);
				setUsers(filteredUsers);
				await new Promise((resolve) => setTimeout(resolve, 150));
			} finally {
				setLoading(false);
			}
			// Filtrar usuarios con rol = 1
			// Actualizar el estado con los usuarios filtrados
		};

		fetchUsers();
	}, []);

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
					(reservation.clientes.dni != null && // Asegurarse de que no sea null o undefined
						String(reservation.clientes.dni).includes(searchTerm)) || // Convertir DNI a string para la búsqueda
					reservation.clientes.domicilio
						.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					reservation.clientes.localidad
						.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					(reservation.clientes.telefono != null && // Asegurarse de que no sea null o undefined
						String(reservation.clientes.telefono).includes(searchTerm)) ||
					reservation.modelo_patente
						.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					reservation.equipo.toLowerCase().includes(searchTerm.toLowerCase())
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
			filtered.sort((a, b) => new Date(b.creado_en) - new Date(a.creado_en));
		} else if (sortOrder === "date-asc") {
			filtered.sort((a, b) => new Date(a.creado_en) - new Date(b.creado_en));
		} else if (sortOrder === "price-desc") {
			filtered.sort((a, b) => b.precio - a.precio);
		} else if (sortOrder === "price-asc") {
			filtered.sort((a, b) => a.precio - b.precio);
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

	const handleDeleteReservation = async (id) => {
		const confirmDelete = window.confirm(
			"¿Está seguro de que desea eliminar esta reserva?"
		);

		if (confirmDelete) {
			try {
				await deleteReservation(id);
				// Actualizar el estado de reservas
				setReservations((prevReservations) =>
					prevReservations.filter((reservation) => reservation.id !== id)
				);
				// Opcionalmente, redirigir a la página de reservas
				// router.push(`/reservations`);
				// router.refresh();
			} catch (error) {
				console.error("Error al eliminar la reserva:", error);
			}
		}
	};
	return (
		<div className="flex bg-zinc-50">
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
					{/* Main Content */}
					<main className="flex-1 p-6">
						<div className="flex items-center justify-between mb-6">
							<div className="flex items-center gap-2">
								<HomeIcon label="Volver"></HomeIcon>
								<h2 className="text-zinc-700 text-base font-normal">
									{session?.user?.role === 1 ? "Tus Reservas" : "Reservas"}
								</h2>
							</div>
						</div>
						<Card className="rounded-xl shadow-lg border-none">
							<CardHeader>
								<CardTitle className="text-xl font-light text-zinc-800">
									Lista de Reservas
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="flex flex-col justify-between md:flex-row gap-4 mb-6 ">
									<div className="flex items-center w-full md:w-1/3 relative">
										<Input
											placeholder="Buscar reservas..."
											className="rounded-full"
											value={searchTerm}
											onChange={(e) => setSearchTerm(e.target.value)}
										/>
										<Search
											className="w-5 h-5 absolute right-2 text-[#71717A]"
											strokeWidth="1.75"
										></Search>
									</div>
									<div className="flex gap-2 items-center justify-end w-full flex-row">
										{session?.user?.role === 3 && (
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
										)}
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

									{/* <Select onValueChange={setFilterModel}>
								<SelectTrigger className="w-full md:w-1/4 rounded-full">
									<SelectValue placeholder="Filtrar por modelo" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Todos los modelos</SelectItem>
									<SelectItem value="modelA">Modelo A</SelectItem>
									<SelectItem value="modelB">Modelo B</SelectItem>
									<SelectItem value="modelC">Modelo C</SelectItem>
								</SelectContent>
							</Select> */}

									{/* <Button className="w-full md:w-auto rounded-full">
								Aplicar Filtros
							</Button> */}
								</div>
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Asesor</TableHead>
											<TableHead>Cliente</TableHead>
											<TableHead>Modelo</TableHead>
											<TableHead>Fecha</TableHead>
											<TableHead>Precio</TableHead>
											<TableHead>Acciones</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{filteredReservations().length > 0 ? (
											filteredReservations().map((reservation) => (
												<TableRow
													key={reservation.id}
													className="cursor-pointer"
													onClick={() =>
														router.push(`/reservations/${reservation.id}`)
													}
												>
													<TableCell className="text-zinc-800">
														{reservation.usuarios.nombre_usuario}
													</TableCell>
													<TableCell className="text-zinc-800">
														{reservation.clientes.nombre_completo}
													</TableCell>
													<TableCell className="text-zinc-800">
														{reservation.modelo_patente}
													</TableCell>
													<TableCell className="text-zinc-800">
														{new Date(reservation.creado_en).toLocaleDateString(
															"es-AR",
															{
																day: "2-digit",
																month: "2-digit",
															}
														)}
													</TableCell>
													<TableCell className="text-zinc-800">
														{new Intl.NumberFormat("es-AR", {
															style: "currency",
															currency: "ARS",
														}).format(reservation.precio)}
													</TableCell>
													<TableCell>
														<div className="flex flex-row items-center gap-2">
															{/* <Link href="/dashboard">
																<Button
																	variant="outline"
																	size="sm"
																	className="rounded-full z-50"
																	onClick={(e) => {
																		e.stopPropagation(); // Previene que el clic se propague al TableRow
																	}}
																>
																	Ver Detalles
																</Button>
															</Link> */}
															<Link
																href={`/reservations/edit/${reservation.id}`}
															>
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
																	handleDeleteReservation(reservation.id); // Llama a la función de eliminación
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
