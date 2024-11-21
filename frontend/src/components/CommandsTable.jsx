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

export default function TechniquesTable() {
	const [techniques, setTechniques] = useState([]);
	const [searchTermPending, setSearchTermPending] = useState("");
	const [searchTermNull, setSearchTermNull] = useState("");
	const [sortOrderPending, setSortOrderPending] = useState("date-desc");
	const [sortOrderNull, setSortOrderNull] = useState("date-desc");

	const { data: session } = useSession();
	const userRole = session?.user?.role;
	const router = useRouter();

	useEffect(() => {
		console.log("Fecha actual en UTC:", new Date().toUTCString());
		const fetchTechniques = async () => {
			const data = await getTechniques();
			setTechniques(data);
		};
		fetchTechniques();
	}, []);

	const filteredPendingTechniques = () => {
		let filtered = techniques.filter(
			(technique) => technique.estado === "pendiente"
		);

		if (searchTermPending) {
			filtered = filtered.filter((technique) => {
				const reserva =
					technique.comandas_tecnica_comanda_idTocomandas?.boletos_reservas;
				const searchLower = searchTermPending.toLowerCase();

				return (
					reserva?.equipo?.toLowerCase().includes(searchLower) ||
					reserva?.precio?.toString().includes(searchLower) ||
					reserva?.marca_vehiculo?.toLowerCase().includes(searchLower) ||
					reserva?.modelo_vehiculo?.toLowerCase().includes(searchLower) ||
					reserva?.patente_vehiculo?.toLowerCase().includes(searchLower) ||
					reserva?.clientes?.nombre_completo
						?.toLowerCase()
						.includes(searchLower)
				);
			});
		}

		if (sortOrderPending === "date-desc") {
			filtered.sort((a, b) => new Date(b.creado_en) - new Date(a.creado_en));
		} else if (sortOrderPending === "date-asc") {
			filtered.sort((a, b) => new Date(a.creado_en) - new Date(b.creado_en));
		}

		return filtered;
	};

	const filteredNullTechniques = () => {
		let filtered = techniques.filter(
			(technique) => technique.estado === null || technique.estado === ""
		);

		if (searchTermNull) {
			filtered = filtered.filter((technique) => {
				const reserva =
					technique.comandas_tecnica_comanda_idTocomandas?.boletos_reservas;
				const searchLower = searchTermNull.toLowerCase();

				return (
					reserva?.equipo?.toLowerCase().includes(searchLower) ||
					reserva?.precio?.toString().includes(searchLower) ||
					reserva?.marca_vehiculo?.toLowerCase().includes(searchLower) ||
					reserva?.modelo_vehiculo?.toLowerCase().includes(searchLower) ||
					reserva?.patente_vehiculo?.toLowerCase().includes(searchLower) ||
					reserva?.clientes?.nombre_completo
						?.toLowerCase()
						.includes(searchLower)
				);
			});
		}

		if (sortOrderNull === "date-desc") {
			filtered.sort((a, b) => new Date(b.creado_en) - new Date(a.creado_en));
		} else if (sortOrderNull === "date-asc") {
			filtered.sort((a, b) => new Date(a.creado_en) - new Date(b.creado_en));
		}

		return filtered;
	};

	const filteredTodayTechniques = () => {
		const todayUTC = new Date();
		todayUTC.setHours(todayUTC.getHours() - 3);
		const todayString = todayUTC.toISOString().split("T")[0];

		console.log("Fecha ajustada a UTC-3:", todayUTC.toUTCString());

		return techniques.filter((technique) => {
			const installationDate =
				technique.comandas_tecnica_comanda_idTocomandas?.boletos_reservas
					?.fecha_instalacion;
			if (!installationDate) return false;

			const installationUTC = new Date(installationDate);
			const installationString = installationUTC.toISOString().split("T")[0];

			console.log("Fecha de instalación:", installationString);
			return installationString === todayString;
		});
	};

	return (
		<div className="flex flex-col gap-6 col-span-2">
			<Card className="rounded-xl shadow-lg bg-red-100 border-2 border-red-200/50 transition-shadow duration-200 col-span-2">
				<CardHeader className="pb-2 flex items-center justify-center">
					<CardTitle className="text-xl text-center font-normal text-red-800 flex items-center gap-2 mb-4">
						Técnicas para hoy <span className="animate-pulse">•</span>
					</CardTitle>
				</CardHeader>
				<CardContent className="flex justify-center">
					<Table>
						<TableHeader>
							<TableRow className="hover:bg-red-200/50 text-center">
								<TableHead className="text-red-700 font-medium text-center">
									Asesor
								</TableHead>
								<TableHead className="text-red-700 font-medium text-center">
									Cliente
								</TableHead>
								<TableHead className="text-red-700 font-medium text-center">
									Modelo
								</TableHead>
								<TableHead className="text-red-700 font-medium text-center">
									Estado
								</TableHead>
								{userRole !== 2 && (
									<TableHead className="text-red-700 font-medium text-center">
										Acciones
									</TableHead>
								)}
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredTodayTechniques().length > 0 ? (
								filteredTodayTechniques().map((technique) => (
									<TableRow
										key={technique.id}
										className="cursor-pointer hover:bg-white/50 transition-colors duration-150 text-center"
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
										<TableCell className="text-zinc-700 font-medium text-center">
											{
												technique.comandas_tecnica_comanda_idTocomandas
													?.boletos_reservas?.usuarios?.nombre_usuario
											}
										</TableCell>
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
										<TableCell className="text-center">
											<span
												className={`px-3 py-1.5 text-xs font-medium rounded-full inline-flex items-center gap-1 justify-center ${
													technique.estado === null
														? "bg-amber-100 text-amber-700 border border-amber-200"
														: technique.estado === "pendiente"
														? "bg-red-200 text-red-700 border border-red-300"
														: ""
												}`}
											>
												{technique.estado === null && (
													<svg
														xmlns="http://www.w3.org/2000/svg"
														width="12"
														height="12"
														viewBox="0 0 24 24"
														fill="none"
														stroke="currentColor"
														strokeWidth="2"
														strokeLinecap="round"
														strokeLinejoin="round"
													>
														<path d="M12 16v-4" />
														<path d="M12 8h.01" />
														<circle cx="12" cy="12" r="10" />
													</svg>
												)}
												{technique.estado === "pendiente" && (
													<svg
														xmlns="http://www.w3.org/2000/svg"
														width="12"
														height="12"
														viewBox="0 0 24 24"
														fill="none"
														stroke="currentColor"
														strokeWidth="2"
														strokeLinecap="round"
														strokeLinejoin="round"
													>
														<path d="M12 8v4" />
														<path d="M12 16h.01" />
														<circle cx="12" cy="12" r="10" />
													</svg>
												)}
												{technique.estado === null
													? "Pendiente Visual"
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
										className="text-center text-gray-500 py-8"
									>
										<div className="flex flex-col items-center gap-2">
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
												className="text-gray-400"
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
											<span>No hay técnicas programadas para hoy.</span>
										</div>
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<Card className="rounded-xl shadow-lg border-none col-span-1">
					<CardHeader>
						<CardTitle className="text-xl font-light text-zinc-800">
							Pendientes de Checklist
						</CardTitle>
					</CardHeader>
					<CardContent>
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
									<SelectItem value="date-desc">
										Fecha (Más reciente)
									</SelectItem>
									<SelectItem value="date-asc">Fecha (Más antigua)</SelectItem>
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

									{userRole !== 2 && <TableHead>Acciones</TableHead>}
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredPendingTechniques().length > 0 ? (
									filteredPendingTechniques().map((technique) => (
										<TableRow
											key={technique.id}
											className="cursor-pointer"
											onClick={(e) => {
												if (
													!e.target.closest("button") &&
													!e.target.closest(".checkbox-cell")
												) {
													router.push(`/add-checklist/${technique.id}/`);
												}
											}}
										>
											<TableCell className="text-zinc-800">
												{
													technique.comandas_tecnica_comanda_idTocomandas
														?.boletos_reservas?.usuarios?.nombre_usuario
												}
											</TableCell>
											<TableCell className="text-zinc-800">
												{
													technique.comandas_tecnica_comanda_idTocomandas
														?.boletos_reservas?.clientes?.nombre_completo
												}
											</TableCell>
											<TableCell className="text-zinc-800">
												{`${
													technique.comandas_tecnica_comanda_idTocomandas
														?.boletos_reservas?.marca_vehiculo || ""
												} ${
													technique.comandas_tecnica_comanda_idTocomandas
														?.boletos_reservas?.modelo_vehiculo || ""
												}`.trim()}
											</TableCell>
											<TableCell className="text-zinc-800">
												{new Date(technique.creado_en).toLocaleDateString(
													"es-AR",
													{
														day: "2-digit",
														month: "2-digit",
													}
												)}
											</TableCell>
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell
											colSpan={7}
											className="text-center text-gray-600"
										>
											No hay técnicas pendientes de checklist.
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
				<Card className="rounded-xl shadow-lg border-none col-span-1">
					<CardHeader>
						<CardTitle className="text-xl font-light text-zinc-800">
							Lista de Técnicas
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
							<div className="flex items-center w-full md:w-1/2 relative">
								<Input
									placeholder="Buscar comanda"
									className="rounded-full focus-visible:ring-0"
									value={searchTermNull}
									onChange={(e) => setSearchTermNull(e.target.value)}
								/>
								<Search
									className="w-5 h-5 absolute right-2 text-[#71717A]"
									strokeWidth="1.75"
								/>
							</div>
							<Select onValueChange={setSortOrderNull} value={sortOrderNull}>
								<SelectTrigger className="w-full md:w-1/3 rounded-full">
									<SelectValue placeholder="Ordenar por" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="date-desc">
										Fecha (Más reciente)
									</SelectItem>
									<SelectItem value="date-asc">Fecha (Más antigua)</SelectItem>
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

									{userRole !== 2 && <TableHead>Acciones</TableHead>}
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredNullTechniques().length > 0 ? (
									filteredNullTechniques().map((technique) => (
										<TableRow
											key={technique.id}
											className="cursor-pointer"
											onClick={(e) => {
												if (
													!e.target.closest("button") &&
													!e.target.closest(".checkbox-cell")
												) {
													router.push(`/add-technique/${technique.id}/`);
												}
											}}
										>
											<TableCell className="text-zinc-800">
												{
													technique.comandas_tecnica_comanda_idTocomandas
														?.boletos_reservas?.usuarios?.nombre_usuario
												}
											</TableCell>
											<TableCell className="text-zinc-800">
												{
													technique.comandas_tecnica_comanda_idTocomandas
														?.boletos_reservas?.clientes?.nombre_completo
												}
											</TableCell>
											<TableCell className="text-zinc-800">
												{`${
													technique.comandas_tecnica_comanda_idTocomandas
														?.boletos_reservas?.marca_vehiculo || ""
												} ${
													technique.comandas_tecnica_comanda_idTocomandas
														?.boletos_reservas?.modelo_vehiculo || ""
												}`.trim()}
											</TableCell>
											<TableCell className="text-zinc-800">
												{new Date(technique.creado_en).toLocaleDateString(
													"es-AR",
													{
														day: "2-digit",
														month: "2-digit",
													}
												)}
											</TableCell>
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell
											colSpan={7}
											className="text-center text-gray-600"
										>
											No hay técnicas disponibles.
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
