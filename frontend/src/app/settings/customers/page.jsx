"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Aside from "@/components/Aside";
import api from "@/lib/axios";
import {
	Search,
	Calendar,
	Car,
	MapPin,
	Phone,
	User,
	FileText,
} from "lucide-react";
import HomeIcon from "@/components/HomeIcon";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { useRouter, useSearchParams } from "next/navigation";

export default function CustomerSettings() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [clients, setClients] = useState([]);
	const [filteredClients, setFilteredClients] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [searchFilter, setSearchFilter] = useState("all");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [currentPage, setCurrentPage] = useState(1);
	const clientsPerPage = 5;

	useEffect(() => {
		const page = searchParams.get("page");
		if (page) {
			setCurrentPage(parseInt(page));
		}
	}, [searchParams]);

	useEffect(() => {
		const fetchClients = async () => {
			try {
				const response = await api.get("/api/clients");
				setClients(response.data);
				setFilteredClients(response.data);
			} catch (error) {
				console.error("Error fetching clients:", error);
				setError("Error al cargar los clientes");
			} finally {
				setLoading(false);
			}
		};
		fetchClients();
	}, []);

	useEffect(() => {
		if (searchTerm === "") {
			setFilteredClients(clients);
			return;
		}

		const searchTermLower = searchTerm.toLowerCase();
		const filtered = clients.filter((client) => {
			switch (searchFilter) {
				case "nombre":
					return client.nombre_completo.toLowerCase().includes(searchTermLower);
				case "dni":
					return client.dni.toString().includes(searchTermLower);
				case "domicilio":
					return client.domicilio.toLowerCase().includes(searchTermLower);
				case "localidad":
					return client.localidad.toLowerCase().includes(searchTermLower);
				case "telefono":
					return client.telefono.toString().includes(searchTermLower);
				case "vehiculo":
					return client.boletos_reservas.some(
						(boleto) =>
							boleto.marca_vehiculo.toLowerCase().includes(searchTermLower) ||
							boleto.modelo_vehiculo.toLowerCase().includes(searchTermLower) ||
							boleto.patente_vehiculo.toLowerCase().includes(searchTermLower)
					);
				case "all":
				default:
					return (
						client.nombre_completo.toLowerCase().includes(searchTermLower) ||
						client.dni.toString().includes(searchTermLower) ||
						client.domicilio.toLowerCase().includes(searchTermLower) ||
						client.localidad.toLowerCase().includes(searchTermLower) ||
						client.telefono.toString().includes(searchTermLower) ||
						client.boletos_reservas.some(
							(boleto) =>
								boleto.marca_vehiculo.toLowerCase().includes(searchTermLower) ||
								boleto.modelo_vehiculo
									.toLowerCase()
									.includes(searchTermLower) ||
								boleto.patente_vehiculo.toLowerCase().includes(searchTermLower)
						)
					);
			}
		});
		setFilteredClients(filtered);
	}, [searchTerm, searchFilter, clients]);

	const formatDate = (date) => {
		const parsedDate = parseISO(date);
		const adjustedDate = new Date(
			parsedDate.getTime() + parsedDate.getTimezoneOffset() * 60 * 1000
		);

		return format(adjustedDate, "d 'de' MMMM 'de' yyyy", {
			locale: es,
		});
	};

	const indexOfLastClient = currentPage * clientsPerPage;
	const indexOfFirstClient = indexOfLastClient - clientsPerPage;
	const currentClients = filteredClients.slice(
		indexOfFirstClient,
		indexOfLastClient
	);
	const totalPages = Math.ceil(filteredClients.length / clientsPerPage);

	const paginate = (pageNumber) => {
		setCurrentPage(pageNumber);
		const params = new URLSearchParams(searchParams);
		params.set("page", pageNumber);
		router.push(`/settings/customers?${params.toString()}`, { scroll: false });
		document.title = `Clientes - Página ${pageNumber}`;
	};

	const nextPage = () => {
		const nextPageNum = Math.min(currentPage + 1, totalPages);
		paginate(nextPageNum);
	};

	const prevPage = () => {
		const prevPageNum = Math.max(currentPage - 1, 1);
		paginate(prevPageNum);
	};

	useEffect(() => {
		document.title = `Clientes${currentPage > 1 ? ` - Página ${currentPage}` : ""}`;
	}, [currentPage]);

	// Agregar esta función helper para obtener el texto del estado
	const getEstadoText = (estado) => {
		const estados = {
			pendiente: "Pendiente",
			confirmado: "Completado",
			completado: "Completado",
			cancelado: "Cancelado",
			no_presentado: "No se presentó",
			senado: "Señado",
		};
		return estados[estado] || estado;
	};

	// Agregar esta función helper para obtener el color del estado
	const getEstadoColor = (estado) => {
		const colors = {
			pendiente: "bg-yellow-100 text-yellow-700",
			confirmado: "bg-green-100 text-green-700",
			completado: "bg-green-100 text-green-700",
			cancelado: "bg-red-100 text-red-700",
			no_presentado: "bg-gray-100 text-gray-700",
			senado: "bg-purple-100 text-purple-700",
		};
		return colors[estado] || "bg-gray-100 text-gray-700";
	};

	// Agregar esta función helper para obtener el texto descriptivo según el estado
	const getEventDescription = (estado) => {
		const descriptions = {
			pendiente: `El vehículo está pendiente de ingreso al taller`,
			confirmado: `El vehículo completó su instalación exitosamente`,
			completado: `El vehículo completó su instalación exitosamente`,
			cancelado: `Se canceló el turno para el vehículo`,
			no_presentado: `El vehículo no se presentó en el taller`,
			senado: `Se registró la seña para el vehículo`,
		};
		return descriptions[estado] || `Estado desconocido para el vehículo`;
	};

	const getPageRange = () => {
		const delta = 2; // Número de páginas a mostrar antes y después de la página actual
		const range = [];
		const rangeWithDots = [];

		for (let i = 1; i <= totalPages; i++) {
			if (
				i === 1 ||
				i === totalPages ||
				(i >= currentPage - delta && i <= currentPage + delta)
			) {
				range.push(i);
			}
		}

		let l;
		for (let i of range) {
			if (l) {
				if (i - l === 2) {
					rangeWithDots.push(l + 1);
				} else if (i - l !== 1) {
					rangeWithDots.push("...");
				}
			}
			rangeWithDots.push(i);
			l = i;
		}

		return rangeWithDots;
	};

	return (
		<div className="flex-1 bg-zinc-50">
			<Aside />
			<motion.main
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className="flex-1 p-6 lg:px-8 xl:px-8 mt-12 overflow-y-auto"
			>
				<HomeIcon forcePath="/settings" />
				<div className="space-y-6">
					<div className="rounded-xl h-fit bg-white/50 backdrop-blur-sm p-6 shadow-xl">
						<div className="p-8 pt-0 space-y-8">
							<div className="mb-6">
								<h2 className="text-2xl font-light text-zinc-900">
									Gestión de Clientes
								</h2>
								<p className="text-zinc-600 text-sm mt-1">
									Visualiza y gestiona la información de los clientes y su
									historial.
								</p>
							</div>

							{/* Buscador */}
							<div className="flex flex-col md:flex-row gap-4">
								<div className="relative flex-1">
									<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
									<input
										type="text"
										placeholder="Buscar clientes..."
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										className="w-full pl-10 pr-4 py-2.5 rounded-xl border placeholder:text-zinc-700 text-zinc-700 border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-200 text-sm"
									/>
								</div>
								<select
									value={searchFilter}
									onChange={(e) => setSearchFilter(e.target.value)}
									className="px-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-200 text-sm text-zinc-600 min-w-[200px]"
								>
									<option value="all">Todos los campos</option>
									<option value="nombre">Nombre</option>
									<option value="dni">DNI</option>
									<option value="domicilio">Domicilio</option>
									<option value="localidad">Localidad</option>
									<option value="telefono">Teléfono</option>
									<option value="vehiculo">Vehículo</option>
								</select>
							</div>

							{/* Lista de Clientes */}
							<div className="space-y-6">
								{loading ? (
									<div className="text-center py-8">
										<div className="animate-spin w-8 h-8 border-2 border-zinc-300 border-t-zinc-600 rounded-full mx-auto"></div>
										<p className="text-zinc-600 mt-4">Cargando clientes...</p>
									</div>
								) : error ? (
									<div className="text-center py-8 text-red-600">{error}</div>
								) : filteredClients.length === 0 ? (
									<div className="text-center py-8 text-zinc-600">
										No se encontraron clientes con los criterios de búsqueda.
									</div>
								) : (
									<>
										<div className="grid grid-cols-1 gap-6">
											{currentClients.map((client) => (
												<motion.div
													key={client.id}
													initial={{ opacity: 0, y: 20 }}
													animate={{ opacity: 1, y: 0 }}
													className="bg-white rounded-xl border border-zinc-200 overflow-hidden"
												>
													{/* Información del Cliente */}
													<div className="p-6 border-b border-zinc-100">
														<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
															<div className="space-y-1">
																<div className="flex items-center gap-2">
																	<User className="w-4 h-4 text-zinc-400" />
																	<h3 className="text-lg font-medium text-zinc-800">
																		{client.nombre_completo}
																	</h3>
																</div>

																<div className="flex items-center gap-2 text-sm text-zinc-600">
																	<FileText className="w-4 h-4 text-zinc-400" />
																	<span>DNI: {client.dni}</span>
																</div>
															</div>
															<div className="flex flex-col md:flex-row gap-4 text-sm">
																<div className="flex items-center gap-2 text-zinc-600">
																	<MapPin className="w-4 h-4 text-zinc-400" />
																	<span>
																		{client.domicilio}, {client.localidad}
																	</span>
																</div>
																<div className="flex items-center gap-2 text-zinc-600">
																	<Phone className="w-4 h-4 text-zinc-400" />
																	<span>{client.telefono}</span>
																</div>
															</div>
														</div>
													</div>

													{/* Línea de Tiempo */}
													<div className="p-6">
														<div className="space-y-4">
															{/* Fecha de Creación del Cliente */}
															<div className="flex items-start gap-4">
																<div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
																	<Calendar className="w-4 h-4 text-emerald-600" />
																</div>
																<div>
																	<p className="text-sm font-normal text-zinc-900">
																		Cliente registrado
																	</p>
																	<p className="text-sm text-zinc-600">
																		{formatDate(client.creado_en)}
																	</p>
																</div>
															</div>

															{/* Boletos de Reserva */}
															{client.boletos_reservas.map((boleto) => (
																<div key={boleto.id} className="space-y-4">
																	{/* Evento de Reserva */}
																	<div className="flex items-start gap-4">
																		<div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
																			<Car className="w-4 h-4 text-blue-600" />
																		</div>
																		<div className="space-y-2 flex-1">
																			<div>
																				<p className="text-sm font-normal text-zinc-900">
																					Reserva de equipo
																				</p>
																				<p className="text-sm text-zinc-600">
																					{formatDate(boleto.creado_en)}
																				</p>
																			</div>
																			<div className="bg-zinc-50 rounded-lg p-4 space-y-4">
																				{/* Info del Cliente Asignado */}
																				<div className="border-b border-zinc-200 w-fit pb-4">
																					<div className="flex items-center gap-2 mb-2">
																						<User className="w-4 h-4 text-violet-600" />
																						<p className="text-sm font-normal text-zinc-900">
																							Cliente asignado
																						</p>
																					</div>
																					<p className="text-sm text-zinc-600">
																						Atendido por{" "}
																						{boleto.usuarios.nombre_usuario
																							.charAt(0)
																							.toUpperCase() +
																							boleto.usuarios.nombre_usuario.slice(
																								1
																							)}{" "}
																						y boleta generada exitosamente.
																					</p>
																				</div>

																				{/* Info del Vehículo y Equipo */}
																				<div className="space-y-2">
																					<p className="text-sm text-zinc-600">
																						<span className="font-normal">
																							Vehículo:
																						</span>{" "}
																						{boleto.marca_vehiculo}{" "}
																						{boleto.modelo_vehiculo} (
																						{boleto.patente_vehiculo})
																					</p>
																					<p className="text-sm text-zinc-600">
																						<span className="font-normal">
																							Equipo:
																						</span>{" "}
																						{boleto.equipo}
																					</p>
																					<p className="text-sm text-zinc-600">
																						<span className="font-normal">
																							Precio:
																						</span>{" "}
																						$
																						{Number(
																							boleto.precio
																						).toLocaleString()}
																					</p>
																					<p className="text-sm text-zinc-600">
																						<span className="font-normal">
																							Monto final:
																						</span>{" "}
																						$
																						{Number(
																							boleto.monto_final_abonar
																						).toLocaleString()}
																					</p>
																					<p className="text-sm text-zinc-600">
																						<span className="font-normal">
																							Fecha de instalación:
																						</span>{" "}
																						{formatDate(
																							boleto.fecha_instalacion
																						)}
																					</p>
																					{(boleto.reforma_escape ||
																						boleto.carga_externa) && (
																						<div className="flex gap-2 mt-2">
																							{boleto.reforma_escape && (
																								<span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-700">
																									Reforma de escape
																								</span>
																							)}
																							{boleto.carga_externa && (
																								<span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700">
																									Carga externa
																								</span>
																							)}
																						</div>
																					)}
																				</div>
																			</div>
																		</div>
																	</div>

																	{/* Evento de Seña (si existe) */}
																	{Number(boleto.sena) > 0 && (
																		<div className="flex items-start gap-4">
																			<div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
																				<svg
																					className="w-4 h-4 text-green-600"
																					fill="none"
																					viewBox="0 0 24 24"
																					stroke="currentColor"
																				>
																					<path
																						strokeLinecap="round"
																						strokeLinejoin="round"
																						strokeWidth={2}
																						d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
																					/>
																				</svg>
																			</div>
																			<div>
																				<p className="text-sm font-normal text-zinc-900">
																					Pago de seña
																				</p>
																				<p className="text-sm text-zinc-600">
																					{formatDate(boleto.creado_en)}
																				</p>
																				<p className="text-sm text-zinc-600 mt-1 p-4">
																					El cliente pago una seña del total de
																					$
																					{Number(boleto.sena).toLocaleString()}
																				</p>
																			</div>
																		</div>
																	)}

																	{/* Eventos del Calendario */}
																	{boleto.calendario?.map((evento) => (
																		<div
																			key={evento.id}
																			className="flex items-start gap-4"
																		>
																			<div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
																				<svg
																					className="w-4 h-4 text-indigo-600"
																					fill="none"
																					viewBox="0 0 24 24"
																					stroke="currentColor"
																				>
																					<path
																						strokeLinecap="round"
																						strokeLinejoin="round"
																						strokeWidth={2}
																						d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
																					/>
																				</svg>
																			</div>
																			<div className="space-y-1">
																				<div className="flex items-center gap-2">
																					<p className="text-sm font-normal text-zinc-900">
																						{getEventDescription(
																							evento.estado,
																							`${boleto.marca_vehiculo} ${boleto.modelo_vehiculo} (${boleto.patente_vehiculo})`
																						)}
																					</p>
																					<span
																						className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(evento.estado)}`}
																					>
																						{getEstadoText(evento.estado)}
																					</span>
																				</div>
																				<p className="text-sm text-zinc-600">
																					{formatDate(evento.fecha_inicio)}
																				</p>
																				{evento.descripcion && (
																					<p className="text-sm text-zinc-600 mt-1 bg-zinc-50 p-3 rounded-lg">
																						Observaciones: {evento.descripcion}
																					</p>
																				)}
																			</div>
																		</div>
																	))}
																</div>
															))}
														</div>
													</div>
												</motion.div>
											))}
										</div>

										{/* Pagination Controls */}
										<div className="mt-6 flex items-center justify-between border-t border-zinc-200 pt-4">
											<div className="flex items-center text-sm text-zinc-600">
												Mostrando {indexOfFirstClient + 1} a{" "}
												{Math.min(indexOfLastClient, filteredClients.length)} de{" "}
												{filteredClients.length} clientes
											</div>
											<div className="flex items-center gap-2">
												<button
													onClick={prevPage}
													disabled={currentPage === 1}
													className="px-3 py-1.5 text-sm border border-zinc-200 rounded-md hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed"
												>
													Anterior
												</button>
												<div className="flex items-center gap-1">
													{getPageRange().map((pageNumber, index) =>
														pageNumber === "..." ? (
															<span
																key={`dots-${index}`}
																className="px-2 text-zinc-400"
															>
																{pageNumber}
															</span>
														) : (
															<button
																key={pageNumber}
																onClick={() => paginate(pageNumber)}
																className={`min-w-[32px] h-8 flex items-center justify-center rounded-md text-sm ${
																	currentPage === pageNumber
																		? "bg-zinc-900 text-white"
																		: "border border-zinc-200 hover:bg-zinc-50"
																}`}
															>
																{pageNumber}
															</button>
														)
													)}
												</div>
												<button
													onClick={nextPage}
													disabled={currentPage === totalPages}
													className="px-3 py-1.5 text-sm border border-zinc-200 rounded-md hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed"
												>
													Siguiente
												</button>
											</div>
										</div>
									</>
								)}
							</div>
						</div>
					</div>
				</div>
			</motion.main>
		</div>
	);
}
