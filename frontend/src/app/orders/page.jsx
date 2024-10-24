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
import { ChevronLeft, ChevronRight, User } from "lucide-react";
import Link from "next/link";

import Aside from "@/components/Aside";

import axios from "axios";

async function loadOrders() {
	try {
		const { data } = await axios.get(
			`${process.env.NEXT_PUBLIC_API_URL}/api/commands`,
			{
				headers: {
					"Content-Type": "application/json",
				},
			}
		);
		return data;
	} catch (error) {
		console.error(
			"Error fetching reservations:",
			error.response?.data || error.message
		);
	}
}

export default async function AllOrdersPage() {
	const orders = await loadOrders();
	return (
		<div className="flex h-screen bg-gray-50">
			{/* Sidebar */}
			<Aside />
			{/* Main Content */}
			<main className="flex-1 p-6 overflow-y-auto">
				<div className="flex items-center justify-between mb-6">
					<div className="flex items-center">
						<Link href="/dashboard" className="mr-4">
							<Button variant="outline" size="sm" className="rounded-full">
								<ChevronLeft className="w-4 h-4 mr-2" />
								Volver al Dashboard
							</Button>
						</Link>
						<h2 className="text-2xl font-light">Todas las Comandas</h2>
					</div>
					<div className="flex items-center space-x-2">
						<Button variant="outline" size="sm" className="rounded-full">
							<User className="w-4 h-4 mr-2" />
							Perfil
						</Button>
						<Button variant="outline" size="sm" className="rounded-full">
							Cerrar Sesión
						</Button>
					</div>
				</div>

				<Card className="rounded-xl">
					<CardHeader>
						<CardTitle className="text-xl font-light">
							Lista de Comandas
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex flex-col md:flex-row gap-4 mb-6">
							<Input
								placeholder="Buscar comandas..."
								className="w-full md:w-1/3 rounded-full"
							/>
							<Select>
								<SelectTrigger className="w-full md:w-1/4 rounded-full">
									<SelectValue placeholder="Filtrar por estado" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Todos</SelectItem>
									<SelectItem value="pending">Pendiente</SelectItem>
									<SelectItem value="in-progress">En Proceso</SelectItem>
									<SelectItem value="completed">Completado</SelectItem>
								</SelectContent>
							</Select>
							<Select>
								<SelectTrigger className="w-full md:w-1/4 rounded-full">
									<SelectValue placeholder="Ordenar por" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="date-desc">
										Fecha (Más reciente)
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
							<Button className="w-full md:w-auto rounded-full">
								Aplicar Filtros
							</Button>
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
								{orders.map((order) => (
									<TableRow key={order.id}>
										<TableCell>
											{order.boletos_reservas.usuarios.nombre_usuario}
										</TableCell>
										<TableCell>
											{order.boletos_reservas.clientes.nombre_completo}
										</TableCell>
										<TableCell>
											{order.boletos_reservas.modelo_patente}
										</TableCell>
										<TableCell>
											{new Date(
												order.boletos_reservas.fecha_instalacion
											).toLocaleDateString("es-AR", {
												day: "2-digit",
												month: "2-digit",
											})}
										</TableCell>
										<TableCell>
											<span
												className={`px-2 py-1 text-xs font-normal rounded-full ${
													order.estado === "en_proceso"
														? "bg-blue-100 text-blue-700"
														: order.estado === "completado"
														? "bg-green-100 text-green-700"
														: "bg-yellow-100 text-yellow-700"
												}`}
											>
												{order.estado === "en_proceso"
													? "En Proceso"
													: order.estado === "completado"
													? "Completada"
													: "Pendiente"}
											</span>
										</TableCell>
										<TableCell>
											<Button
												variant="outline"
												size="sm"
												className="rounded-full"
											>
												Ver Detalles
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
						<div className="flex items-center justify-between mt-4">
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
						</div>
					</CardContent>
				</Card>
			</main>
		</div>
	);
}
