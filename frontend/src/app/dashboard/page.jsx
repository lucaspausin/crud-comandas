import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { ClipboardList, Search, User, Ticket, Car } from "lucide-react";
import Link from "next/link";

import axios from "axios";

import Aside from "@/components/Aside";
async function loadReservations() {
	try {
		const { data } = await axios.get(
			`${process.env.NEXT_PUBLIC_API_URL}/api/reservations`,
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

async function loadOrders() {
	const { data } = await axios.get(
		`${process.env.NEXT_PUBLIC_API_URL}/api/commands`
	);

	return data;
}

async function loadOrdersMonth() {
	const { data } = await axios.get(
		`${process.env.NEXT_PUBLIC_API_URL}/api/commands/summary`
	);
	return data;
}

async function loadReservationsMonth() {
	const { data } = await axios.get(
		`${process.env.NEXT_PUBLIC_API_URL}/api/reservations/summary`
	);
	return data;
}

export default async function Dashboard() {
	const reservations = await loadReservations();
	const orders = await loadOrders();
	const ordersMonth = await loadOrdersMonth();
	const reservationsMonth = await loadReservationsMonth();

	return (
		<div className="flex h-screen bg-zinc-50">
			{/* Sidebar */}

			<div className="absolute h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

			<Aside />

			{/* Main Content */}
			<main className="flex-1 p-6 overflow-y-auto z-50">
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-2xl font-light">Resumen</h2>
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

				{/* Statistics */}
				<div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-3">
					<Card className="rounded-xl">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-normal">
								Total de Comandas
							</CardTitle>
							<ClipboardList className="w-4 h-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-light">
								{ordersMonth.totalCompleted}
							</div>
							<p className="text-xs text-muted-foreground">
								{ordersMonth.percentageChange} desde el último mes.
							</p>
						</CardContent>
					</Card>
					{/* <Card className="rounded-xl">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-normal">
								Ventas Totales
							</CardTitle>
							<DollarSign className="w-4 h-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-light">$2,345,678</div>
							<p className="text-xs text-muted-foreground">
								+15% comparado con el mes anterior
							</p>
						</CardContent>
					</Card> */}
					<Card className="rounded-xl">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-normal">
								Vehículos Vendidos
							</CardTitle>
							<Car className="w-4 h-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-light">
								{ordersMonth.totalCompleted}
							</div>
							<p className="text-xs text-muted-foreground">
								{ordersMonth.percentageChange} desde el último mes.
							</p>
						</CardContent>
					</Card>
					<Card className="rounded-xl">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-normal">
								Reservas del Mes
							</CardTitle>
							<Ticket className="w-4 h-4 text-muted-foreground" />
						</CardHeader>

						<CardContent>
							<div className="text-2xl font-light">
								{reservationsMonth.totalReservations}
							</div>
							<p className="text-xs text-muted-foreground">
								{reservationsMonth.percentageChange} comparado con el mes.
							</p>
						</CardContent>
					</Card>
				</div>

				{/* Reservas */}

				<Card className="mb-6 rounded-xl">
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle className="text-xl font-light">
								Boletos de Reservas
							</CardTitle>
							<div className="flex items-center space-x-2">
								<Input
									placeholder="Buscar reservas..."
									className="w-64 rounded-full"
								/>
								<Button variant="outline" size="sm" className="rounded-full">
									<Search className="w-4 h-4 mr-2" />
									Buscar
								</Button>
							</div>
						</div>
						<CardDescription>Últimas 5 reservas realizadas</CardDescription>
					</CardHeader>
					<CardContent>
						<Table className="w-full">
							<TableHeader>
								<TableRow className="w-full">
									<TableHead className="w-1/5 text-center">Asesor</TableHead>
									<TableHead className="w-1/5 text-center">Cliente</TableHead>
									<TableHead className="w-1/5 text-center">Modelo</TableHead>
									<TableHead className="w-1/5 text-center">Fecha</TableHead>
									<TableHead className="w-1/5 text-center">Precio</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{reservations.map((reservation) => (
									<TableRow key={reservation.id} className="w-full">
										<TableCell className="w-1/5 text-center">
											{reservation.usuarios.nombre_usuario}
										</TableCell>
										<TableCell className="w-1/5 text-center">
											{reservation.clientes.nombre_completo}
										</TableCell>
										<TableCell className="w-1/5 text-center">
											{reservation.modelo_patente}
										</TableCell>
										<TableCell className="w-1/5 text-center">
											{new Date(
												reservation.fecha_instalacion
											).toLocaleDateString("es-AR", {
												day: "2-digit",
												month: "2-digit",
											})}
										</TableCell>
										<TableCell className="w-1/5 text-center">
											${reservation.precio}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
						<div className="flex justify-center mt-4">
							<Link href="/reservations">
								<Button variant="outline" size="sm" className="my-4">
									Ver todas las reservas
								</Button>
							</Link>
						</div>
					</CardContent>
				</Card>

				{/* Comandas */}

				<Card className="rounded-xl">
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle className="text-xl font-light">Comandas</CardTitle>
							<div className="flex items-center space-x-2">
								<Input
									placeholder="Buscar comandas..."
									className="w-64 rounded-full"
								/>
								<Button variant="outline" size="sm" className="rounded-full">
									<Search className="w-4 h-4 mr-2" />
									Buscar
								</Button>
							</div>
						</div>
						<CardDescription>Últimas 5 comandas registradas</CardDescription>
					</CardHeader>
					<CardContent>
						<Table className="w-full">
							<TableHeader>
								<TableRow className="w-full">
									<TableHead className="text-center w-1/5">Asesor</TableHead>
									<TableHead className="w-1/5 text-center">Cliente</TableHead>
									<TableHead className="text-center w-1/5">Modelo</TableHead>
									<TableHead className="text-center w-1/5">Fecha</TableHead>
									<TableHead className="text-center w-1/5">Estado</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{orders.map((order) => (
									<TableRow
										className="w-full cursor-pointer"
										key={order.id}
										style={{ textDecoration: "none", color: "inherit" }}
									>
										<TableCell className="text-center w-1/5">
											{order.boletos_reservas.usuarios.nombre_usuario}
										</TableCell>
										<TableCell className="text-center w-1/5">
											{order.boletos_reservas.clientes.nombre_completo}
										</TableCell>
										<TableCell className="text-center w-1/5">
											{order.boletos_reservas.modelo_patente}
										</TableCell>
										<TableCell className="text-center w-1/5">
											{new Date(
												order.boletos_reservas.fecha_instalacion
											).toLocaleDateString("es-AR", {
												day: "2-digit",
												month: "2-digit",
											})}
										</TableCell>
										<TableCell className="text-center w-1/5">
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
									</TableRow>
								))}
							</TableBody>
						</Table>
						<div className="flex justify-center mt-4">
							<Link href="/orders">
								<Button variant="outline" size="sm" className="my-4">
									Ver todas las comandas
								</Button>
							</Link>
						</div>
					</CardContent>
				</Card>
			</main>
		</div>
	);
}
