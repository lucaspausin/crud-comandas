"use client";
import { useEffect, useState } from "react";
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
import { Search } from "lucide-react";
import { getTechniques } from "../app/reservations/reservations.api";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function TechniquesTable() {
	const [techniques, setTechniques] = useState([]);
	const [searchTermPending, setSearchTermPending] = useState("");
	const [searchTermComplete, setSearchTermComplete] = useState("");
	const [sortOrderPending, setSortOrderPending] = useState("today");
	const [error, setError] = useState(null);
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 15;

	const { data: session } = useSession();
	const userRole = session?.user?.role;
	const router = useRouter();

	useEffect(() => {
		const fetchTechniques = async () => {
			try {
				const data = await getTechniques();
				setTechniques(data);
			} catch (err) {
				setError(err.message);
				console.error("Error fetching techniques:", err);
			}
		};

		// Llamar a la función para obtener datos
		fetchTechniques();
	}, [router]);

	const filteredPendingTechniques = () => {
		const pendingTechniques = techniques
			.filter((technique) => technique.estado !== "completo")
			.filter((technique) => {
				if (!searchTermPending) return true;

				const searchLower = searchTermPending.toLowerCase();
				const fields = [
					technique.comandas_tecnica_comanda_idTocomandas?.boletos_reservas
						?.clientes?.nombre_completo,
					technique.comandas_tecnica_comanda_idTocomandas?.boletos_reservas
						?.clientes?.dni,
					technique.comandas_tecnica_comanda_idTocomandas?.boletos_reservas
						?.marca_vehiculo,
					technique.comandas_tecnica_comanda_idTocomandas?.boletos_reservas
						?.modelo_vehiculo,
					technique.comandas_tecnica_comanda_idTocomandas?.boletos_reservas
						?.patente_vehiculo,
					technique.comandas_tecnica_comanda_idTocomandas?.boletos_reservas
						?.usuarios?.nombre_usuario,
				];

				return fields.some((field) =>
					field?.toString().toLowerCase().includes(searchLower)
				);
			});

		// Aplicar filtro de fecha después de la búsqueda
		switch (sortOrderPending) {
			case "today": {
				const todayUTC = new Date();
				todayUTC.setHours(todayUTC.getHours() - 3);
				const todayString = todayUTC.toISOString().split("T")[0];

				return pendingTechniques.filter((technique) => {
					const installationDate =
						technique.comandas_tecnica_comanda_idTocomandas?.boletos_reservas
							?.fecha_instalacion;
					if (!installationDate) return false;

					const installationUTC = new Date(installationDate);
					const installationString = installationUTC
						.toISOString()
						.split("T")[0];

					return installationString === todayString;
				});
			}
			case "last-week": {
				const today = new Date();
				today.setHours(today.getHours() - 3);
				const lastWeek = new Date(today);
				lastWeek.setDate(lastWeek.getDate() - 7);

				const filtered = pendingTechniques.filter((technique) => {
					const installationDateStr =
						technique.comandas_tecnica_comanda_idTocomandas?.boletos_reservas
							?.fecha_instalacion;
					if (!installationDateStr) return false;

					const installationDate = new Date(installationDateStr);
					return installationDate >= lastWeek && installationDate <= today;
				});
				return filtered.sort((a, b) => {
					// Ordenar por fecha de instalación
					const dateA = new Date(
						a.comandas_tecnica_comanda_idTocomandas?.boletos_reservas?.fecha_instalacion
					);
					const dateB = new Date(
						b.comandas_tecnica_comanda_idTocomandas?.boletos_reservas?.fecha_instalacion
					);
					return dateB - dateA; // Ordenar de más reciente a más antiguo
				});
			}
			case "all": {
				return pendingTechniques.sort((a, b) => {
					// Ordenar por fecha de instalación
					const dateA = new Date(
						a.comandas_tecnica_comanda_idTocomandas?.boletos_reservas?.fecha_instalacion
					);
					const dateB = new Date(
						b.comandas_tecnica_comanda_idTocomandas?.boletos_reservas?.fecha_instalacion
					);
					return dateB - dateA; // Ordenar de más reciente a más antiguo
				});
			}
			default:
				return pendingTechniques;
		}
	};

	const filteredCompleteTechniques = () => {
		const completeTechniques = techniques.filter(
			(technique) => technique.estado === "completo"
		);

		// Ordenar por fecha de instalación
		return completeTechniques.sort((a, b) => {
			const dateA = new Date(
				a.comandas_tecnica_comanda_idTocomandas?.boletos_reservas?.fecha_instalacion
			);
			const dateB = new Date(
				b.comandas_tecnica_comanda_idTocomandas?.boletos_reservas?.fecha_instalacion
			);
			return dateB - dateA; // Ordenar de más reciente a más antiguo
		});
	};

	const filteredCompleteTechniquesBySearch = () => {
		return filteredCompleteTechniques().filter((technique) => {
			if (!searchTermComplete) return true;

			const searchLower = searchTermComplete.toLowerCase();
			const fields = [
				technique.comandas_tecnica_comanda_idTocomandas?.boletos_reservas
					?.clientes?.nombre_completo,
				technique.comandas_tecnica_comanda_idTocomandas?.boletos_reservas
					?.clientes?.dni,
				technique.comandas_tecnica_comanda_idTocomandas?.boletos_reservas
					?.marca_vehiculo,
				technique.comandas_tecnica_comanda_idTocomandas?.boletos_reservas
					?.modelo_vehiculo,
				technique.comandas_tecnica_comanda_idTocomandas?.boletos_reservas
					?.patente_vehiculo,
				technique.comandas_tecnica_comanda_idTocomandas?.boletos_reservas
					?.usuarios?.nombre_usuario,
			];

			return fields.some((field) =>
				field?.toString().toLowerCase().includes(searchLower)
			);
		});
	};

	const paginatedCompleteTechniques = () => {
		const filtered = filteredCompleteTechniquesBySearch();
		const startIndex = (currentPage - 1) * itemsPerPage;
		return filtered.slice(startIndex, startIndex + itemsPerPage);
	};

	const totalPages = Math.ceil(
		filteredCompleteTechniquesBySearch().length / itemsPerPage
	);

	return (
		<div className="flex flex-col gap-6 col-span-3">
			<Card className="rounded-xl shadow-lg border-none col-span-2">
				<CardHeader className="pb-2">
					<CardTitle className="text-xl font-light text-zinc-800">
						Ingresos para hoy
					</CardTitle>
				</CardHeader>
				<CardContent>
					{error ? (
						<div className="text-center text-red-500 py-8">{error}</div>
					) : (
						<>
							<div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
								<div className="flex items-center w-full md:w-1/2 relative">
									<Input
										placeholder="Buscar comanda"
										className="rounded-full focus-visible:ring-0"
										value={searchTermPending}
										onChange={(e) => setSearchTermPending(e.target.value)}
									/>
									<Search
										className="w-5 h-5 absolute right-2 text-[#71717A]"
										strokeWidth="1.75"
									/>
								</div>
								<Select
									onValueChange={setSortOrderPending}
									value={sortOrderPending}
								>
									<SelectTrigger className="w-full md:w-1/3 rounded-full">
										<SelectValue placeholder="Ordenar por" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="today">Hoy</SelectItem>
										<SelectItem value="last-week">Última semana</SelectItem>
										<SelectItem value="all">Todas</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="overflow-x-auto">
								<Table>
									<TableHeader>
										<TableRow>
											{/* <TableHead className="text-zinc-700 font-medium text-center">
												Asesor
											</TableHead> */}
											<TableHead className="text-zinc-700 font-medium text-center">
												Cliente
											</TableHead>
											<TableHead className="text-zinc-700 font-medium text-center">
												Modelo
											</TableHead>
											<TableHead className="text-zinc-700 font-medium text-center">
												Patente
											</TableHead>
											<TableHead className="text-zinc-700 font-medium text-center">
												Fecha de Instalación
											</TableHead>
											<TableHead className="text-zinc-700 font-medium text-center">
												Estado
											</TableHead>
											{userRole !== 2 && (
												<TableHead className="text-zinc-700 font-medium text-center">
													Acciones
												</TableHead>
											)}
										</TableRow>
									</TableHeader>
									<TableBody>
										{filteredPendingTechniques().length > 0 ? (
											filteredPendingTechniques().map((technique) => (
												<TableRow
													key={technique.id}
													className="cursor-pointer hover:bg-gray-100 transition-colors duration-150"
													onClick={(e) => {
														if (
															!e.target.closest("button") &&
															!e.target.closest(".checkbox-cell")
														) {
															if (technique.estado === "pendiente") {
																router.push(`/add-checklist/${technique.id}/`);
															} else {
																router.push(`/add-technique/${technique.id}/`);
															}
														}
													}}
												>
													{/* <TableCell className="text-zinc-700 font-medium text-center">
														{
															technique.comandas_tecnica_comanda_idTocomandas
																?.boletos_reservas?.usuarios?.nombre_usuario
														}
													</TableCell> */}
													<TableCell className="text-zinc-700 text-center">
														{
															technique.comandas_tecnica_comanda_idTocomandas
																?.boletos_reservas?.clientes?.nombre_completo
														}
													</TableCell>
													<TableCell className="text-zinc-700 text-center">
														{`${
															technique.comandas_tecnica_comanda_idTocomandas
																?.boletos_reservas?.marca_vehiculo || ""
														} ${
															technique.comandas_tecnica_comanda_idTocomandas
																?.boletos_reservas?.modelo_vehiculo || ""
														}`.trim()}
													</TableCell>
													<TableCell className="text-zinc-700 text-center">
														{
															technique.comandas_tecnica_comanda_idTocomandas
																?.boletos_reservas?.patente_vehiculo
														}
													</TableCell>
													<TableCell className="text-zinc-700 text-center">
														{technique.comandas_tecnica_comanda_idTocomandas
															?.boletos_reservas?.fecha_instalacion &&
															`${new Date(
																technique.comandas_tecnica_comanda_idTocomandas?.boletos_reservas?.fecha_instalacion
															)
																.getUTCDate()
																.toString()
																.padStart(2, "0")}/${(
																new Date(
																	technique.comandas_tecnica_comanda_idTocomandas?.boletos_reservas?.fecha_instalacion
																).getUTCMonth() + 1
															)
																.toString()
																.padStart(2, "0")}`}
													</TableCell>
													<TableCell className="text-center">
														<span
															className={`px-3 py-1.5 text-xs font-medium rounded-full inline-flex items-center gap-1 justify-center ${
																technique.estado === "pendiente"
																	? "bg-red-50 text-red-600 border border-red-100"
																	: "bg-gray-100 text-gray-600 border border-gray-100"
															}`}
														>
															{technique.estado === null
																? "Pendiente"
																: technique.estado === "pendiente"
																	? "Checklist Faltante"
																	: ""}
														</span>
													</TableCell>
												</TableRow>
											))
										) : (
											<TableRow>
												<TableCell
													colSpan={5}
													className="text-center text-gray-600 py-8"
												>
													<div className="flex flex-row justify-center items-center gap-2">
														<svg
															xmlns="http://www.w3.org/2000/svg"
															width="24"
															height="24"
															viewBox="0 0 24 24"
															fill="none"
															stroke="currentColor"
															strokeWidth="2"
															strokeLinecap="round"
															strokeLinejoin="round"
															className="text-zinc-600 h-4 w-4"
														>
															<rect
																width="18"
																height="18"
																x="3"
																y="4"
																rx="2"
																ry="2"
															/>
															<line x1="16" x2="16" y1="2" y2="6" />
															<line x1="8" x2="8" y1="2" y2="6" />
															<line x1="3" x2="21" y1="10" y2="10" />
														</svg>
														<span>No hay ingresos programados para hoy.</span>
													</div>
												</TableCell>
											</TableRow>
										)}
									</TableBody>
								</Table>
							</div>
						</>
					)}
				</CardContent>
			</Card>
			<Card className="rounded-xl shadow-lg border-none col-span-2">
				<CardHeader className="pb-2">
					<CardTitle className="text-xl font-light text-zinc-800">
						Técnicas Completas
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
						<div className="flex items-center w-full md:w-1/2 relative">
							<Input
								placeholder="Buscar técnica completa"
								className="rounded-full focus-visible:ring-0"
								value={searchTermComplete}
								onChange={(e) => setSearchTermComplete(e.target.value)}
							/>
							<Search
								className="w-5 h-5 absolute right-2 text-[#71717A]"
								strokeWidth="1.75"
							/>
						</div>
					</div>
					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="text-zinc-700 font-medium text-center">
										Cliente
									</TableHead>
									<TableHead className="text-zinc-700 font-medium text-center">
										Modelo
									</TableHead>
									<TableHead className="text-zinc-700 font-medium text-center">
										Patente
									</TableHead>
									<TableHead className="text-zinc-700 font-medium text-center">
										Fecha de Instalación
									</TableHead>
									<TableHead className="text-zinc-700 font-medium text-center">
										Estado
									</TableHead>
									{userRole !== 2 && (
										<TableHead className="text-zinc-700 font-medium text-center">
											Acciones
										</TableHead>
									)}
								</TableRow>
							</TableHeader>
							<TableBody>
								{paginatedCompleteTechniques().length > 0 ? (
									paginatedCompleteTechniques().map((technique) => (
										<TableRow
											key={technique.id}
											className="cursor-pointer hover:bg-gray-100 transition-colors duration-150"
											onClick={(e) => {
												if (
													!e.target.closest("button") &&
													!e.target.closest(".checkbox-cell")
												) {
													router.push(`/checklist/${technique.id}/`);
												}
											}}
										>
											{/* <TableCell className="text-zinc-700 font-medium text-center">
												{
													technique.comandas_tecnica_comanda_idTocomandas
														?.boletos_reservas?.usuarios?.nombre_usuario
												}
											</TableCell> */}
											<TableCell className="text-zinc-700 text-center">
												{
													technique.comandas_tecnica_comanda_idTocomandas
														?.boletos_reservas?.clientes?.nombre_completo
												}
											</TableCell>
											<TableCell className="text-zinc-700 text-center">
												{`${
													technique.comandas_tecnica_comanda_idTocomandas
														?.boletos_reservas?.marca_vehiculo || ""
												} ${
													technique.comandas_tecnica_comanda_idTocomandas
														?.boletos_reservas?.modelo_vehiculo || ""
												}`.trim()}
											</TableCell>
											<TableCell className="text-zinc-700 text-center">
												{
													technique.comandas_tecnica_comanda_idTocomandas
														?.boletos_reservas?.patente_vehiculo
												}
											</TableCell>
											<TableCell className="text-zinc-700 text-center">
												{technique.comandas_tecnica_comanda_idTocomandas
													?.boletos_reservas?.fecha_instalacion &&
													`${new Date(
														technique.comandas_tecnica_comanda_idTocomandas?.boletos_reservas?.fecha_instalacion
													)
														.getUTCDate()
														.toString()
														.padStart(2, "0")}/${(
														new Date(
															technique.comandas_tecnica_comanda_idTocomandas?.boletos_reservas?.fecha_instalacion
														).getUTCMonth() + 1
													)
														.toString()
														.padStart(2, "0")}`}
											</TableCell>
											<TableCell className="text-center">
												<span
													className={`px-3 py-1.5 text-xs font-medium rounded-full inline-flex items-center gap-1 justify-center ${
														technique.estado === "completo"
															? "bg-green-100 text-green-600 border border-green-100"
															: ""
													}`}
												>
													Completo
												</span>
											</TableCell>
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell
											colSpan={5}
											className="text-center text-gray-500 py-8"
										>
											<div className="flex flex-row justify-center items-center gap-2">
												<span>No hay ingresos completos registrados.</span>
											</div>
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
						{totalPages > 1 && (
							<div className="flex justify-center items-center gap-2 mt-4">
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
									Página {currentPage} de {totalPages}
								</span>
								<Button
									variant="outline"
									size="sm"
									onClick={() =>
										setCurrentPage((prev) => Math.min(prev + 1, totalPages))
									}
									disabled={currentPage === totalPages}
									className="rounded-full px-4 py-2 text-zinc-600 hover:text-zinc-600 font-normal bg-zinc-100 hover:bg-zinc-50 border-none text-sm"
								>
									Siguiente
								</Button>
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
