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

async function loadReservations() {
	const { data } = await axios.get(
		`${process.env.NEXT_PUBLIC_API_URL}/api/reservations`
	);
	return data;
}

export default async function AllReservationsPage() {
	const reservations = await loadReservations();
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
						<h2 className="text-2xl font-light">Todas las Reservas</h2>
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
							Lista de Reservas
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex flex-col md:flex-row gap-4 mb-6">
							<Input
								placeholder="Buscar reservas..."
								className="w-full md:w-1/3 rounded-full"
							/>
							<Select>
								<SelectTrigger className="w-full md:w-1/4 rounded-full">
									<SelectValue placeholder="Filtrar por modelo" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Todos los modelos</SelectItem>
									<SelectItem value="modelA">Modelo A</SelectItem>
									<SelectItem value="modelB">Modelo B</SelectItem>
									<SelectItem value="modelC">Modelo C</SelectItem>
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
									<TableHead>Precio</TableHead>
									<TableHead>Acciones</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{reservations.map((reservation) => (
									<TableRow key={reservation.id}>
										<TableCell>{reservation.usuarios.nombre_usuario}</TableCell>
										<TableCell>
											{reservation.clientes.nombre_completo}
										</TableCell>
										<TableCell>{reservation.modelo_patente}</TableCell>

										<TableCell>
											{new Date(
												reservation.fecha_instalacion
											).toLocaleDateString("es-AR", {
												day: "2-digit",
												month: "2-digit",
											})}
										</TableCell>
										<TableCell>${reservation.precio}</TableCell>
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
