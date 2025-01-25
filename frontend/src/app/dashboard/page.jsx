"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ClipboardList, ArrowRight, Car, PlusCircle, Eye } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import Aside from "@/components/Aside";
import Image from "next/image";
import myImage from "@/public/motorgas2.svg";
import CommandsTable from "@/components/CommandsTable";

export default function Dashboard() {
	const router = useRouter();
	const { data: session } = useSession();
	const userRole = session?.user?.role;

	const [dashboardData, setDashboardData] = useState({
		reservations: [],
		stats: {
			totalSales: 0,
			currentMonthSales: 0,
		},
	});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchDashboardData = async () => {
			if (!session?.user) return;

			setLoading(true);
			try {

				const token = session.user.token;

				api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

				const [reservationsResponse, statsResponse] = await Promise.all([
					api.get("/api/reservations"),
					api.get("/api/reservations/dashboard-stats"),
				]);

				setDashboardData({
					reservations: reservationsResponse.data,
					stats: statsResponse.data,
				});
			} catch (error) {
				console.error("Error loading dashboard:", error);
				if (error.message.includes("Session expired")) {
					router.push("/login");
				}
			} finally {
				setLoading(false);
			}
		};

		if (session) {
			fetchDashboardData();
		}
	}, [session, router]);

	return (
		<div className="flex-1 bg-zinc-50">
			
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
					<main className="flex flex-col items-center justify-center p-6 px-0 z-50">
						{userRole !== 2 && (
							<div className="grid grid-cols-2 gap-4 p-6 lg:px-6 xl:px-6 lg:grid-cols-4 h-full ">
								<Card className="rounded-xl shadow-xl overflow-hidden col-span-3 lg:col-span-2 min-h-[250px] bg-gradient-to-b from-white to-zinc-50 group border-zinc-100 border pb-10 relative hover:border-zinc-300 duration-300 transition-all ease-in-out">
									<div className="h-fit p-8 z-10">
										<div className="flex items-center justify-between mb-6">
											<div className="space-y-1">
												{(() => {
													const todayUTC = new Date();
													todayUTC.setHours(todayUTC.getHours() - 3);
													const todayString = todayUTC
														.toISOString()
														.split("T")[0];

													const userFilteredReservations =
														dashboardData.reservations.filter(
															(reservation) =>
																session?.user?.role === 2 ||
																session?.user?.role === 3 ||
																reservation.usuarios.id === session?.user?.id
														);

													const todayInstallations =
														userFilteredReservations.filter((reservation) => {
															const installationDate = new Date(
																reservation.fecha_instalacion
															);
															installationDate.setHours(
																installationDate.getHours() + 3
															);
															const installationString = installationDate
																.toISOString()
																.split("T")[0];
															return installationString === todayString;
														});

													if (todayInstallations.length > 0) {
														return (
															<>
																<h3 className="text-2xl font-light text-zinc-900">
																	Instalaciones de hoy
																</h3>
																<p className="text-zinc-600 text-sm">
																	Instalaciones programadas para hoy.
																</p>
															</>
														);
													}

													if (userFilteredReservations.length === 0) {
														return (
															<>
																<h3 className="text-2xl font-light text-zinc-900">
																	Sin instalaciones
																</h3>
																<p className="text-zinc-600 text-sm">
																	No hay instalaciones programadas en este
																	momento.
																</p>
															</>
														);
													}

													return (
														<>
															<h3 className="text-2xl font-light text-zinc-900">
																Próximas instalaciones
															</h3>
															<p className="text-zinc-600 text-sm">
																Mostrando las próximas 5 instalaciones
																programadas.
															</p>
														</>
													);
												})()}
											</div>
											<Link href="/reservations">
												<div className="p-2 rounded-full bg-zinc-100 hover:bg-zinc-100/60 transition-all duration-300">
													<ArrowRight className="w-4 h-4 text-zinc-600" />
												</div>
											</Link>
										</div>

										<motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
											{(() => {
												const todayUTC = new Date();
												todayUTC.setHours(todayUTC.getHours() - 3);
												const todayString = todayUTC
													.toISOString()
													.split("T")[0];

												// Filtrar primero por usuario
												const userFilteredReservations =
													dashboardData.reservations.filter(
														(reservation) =>
															session?.user?.role === 2 ||
															session?.user?.role === 3 ||
															reservation.usuarios.id === session?.user?.id
													);

												// Buscar instalaciones de hoy
												const todayInstallations =
													userFilteredReservations.filter((reservation) => {
														const installationDate = new Date(
															reservation.fecha_instalacion
														);
														installationDate.setHours(
															installationDate.getHours() + 3
														);
														const installationString = installationDate
															.toISOString()
															.split("T")[0];
														return installationString === todayString;
													});

												// Si hay instalaciones para hoy, mostrarlas
												if (todayInstallations.length > 0) {
													return todayInstallations
														.slice(0, 5)
														.map((reservation) => (
															<div
																key={reservation.id}
																onClick={() =>
																	router.push(
																		userRole === 3
																			? `/commands/${reservation.comandas[0].id}`
																			: `/reservations/${reservation.id}`
																	)
																}
																className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-zinc-100/80"
															>
																<div className="flex justify-between items-start mb-2">
																	<span className="text-sm font-medium text-zinc-900 truncate">
																		{reservation.clientes.nombre_completo
																			.trim()
																			.split(" ")
																			.slice(0, 2)
																			.join(" ")}
																	</span>
																	<span className="text-xs text-zinc-500">
																		{(() => {
																			const date = new Date(
																				reservation.fecha_instalacion
																			);
																			date.setHours(date.getHours() + 3);
																			return date.toLocaleDateString("es-AR", {
																				day: "2-digit",
																				month: "2-digit",
																			});
																		})()}
																	</span>
																</div>
																<div className="text-sm text-zinc-600 mb-2 truncate">
																	{`${reservation.marca_vehiculo || ""} ${
																		reservation.modelo_vehiculo || ""
																	} ${reservation.patente_vehiculo || ""}`.trim()}{" "}
																	- {reservation.usuarios.nombre_usuario || ""}
																</div>
																<div className="flex flex-col md:flex-row items-start md:items-center gap-2">
																	<div className="text-sm font-medium text-emerald-600">
																		{new Intl.NumberFormat("es-AR", {
																			style: "currency",
																			currency: "ARS",
																		}).format(reservation.monto_final_abonar)}
																	</div>
																	{reservation.carga_externa > 0 && (
																		<div className="text-sm font-medium text-blue-600">
																			Carga Externa Incl.
																			{reservation.precio_carga_externa > 0 &&
																				` ${new Intl.NumberFormat("es-AR", {
																					style: "currency",
																					currency: "ARS",
																				}).format(
																					reservation.precio_carga_externa
																				)}`}
																		</div>
																	)}
																</div>
															</div>
														));
												}

												// Si no hay instalaciones para hoy, mostrar las próximas 5
												const upcomingInstallations = userFilteredReservations
													.filter((reservation) => {
														const installationDate = new Date(
															reservation.fecha_instalacion
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
															new Date(a.fecha_instalacion) -
															new Date(b.fecha_instalacion)
													)
													.slice(0, 5);

												if (upcomingInstallations.length === 0) {
													return (
														<p className="text-zinc-500 text-left col-span-full text-sm w-full">
															{" "}
														</p>
													);
												}

												return upcomingInstallations.map((reservation) => (
													<div
														key={reservation.id}
														onClick={() =>
															router.push(
																userRole === 3
																	? `/commands/${reservation.comandas[0].id}`
																	: `/reservations/${reservation.id}`
															)
														}
														className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-zinc-100/80"
													>
														<div className="flex justify-between items-start mb-2">
															<span className="text-sm font-medium text-zinc-900 truncate">
																{reservation.clientes.nombre_completo
																	.trim()
																	.split(" ")
																	.slice(0, 2)
																	.join(" ")}
															</span>
															<span className="text-xs text-zinc-500">
																{(() => {
																	const date = new Date(
																		reservation.fecha_instalacion
																	);
																	date.setHours(date.getHours() + 3);
																	return date.toLocaleDateString("es-AR", {
																		day: "2-digit",
																		month: "2-digit",
																	});
																})()}
															</span>
														</div>
														<div className="text-sm text-zinc-600 mb-2 truncate">
															{`${reservation.marca_vehiculo || ""} ${
																reservation.modelo_vehiculo || ""
															} ${reservation.patente_vehiculo || ""}`.trim()}{" "}
															- {reservation.usuarios.nombre_usuario || ""}
														</div>
														<div className="flex flex-col md:flex-row items-start md:items-center gap-2">
															<div className="text-sm font-medium text-emerald-600">
																{new Intl.NumberFormat("es-AR", {
																	style: "currency",
																	currency: "ARS",
																}).format(reservation.monto_final_abonar)}
															</div>
															{reservation.carga_externa > 0 && (
																<div className="text-sm font-medium text-blue-600">
																	Carga Externa Incl.
																	{reservation.precio_carga_externa > 0 &&
																		` ${new Intl.NumberFormat("es-AR", {
																			style: "currency",
																			currency: "ARS",
																		}).format(
																			reservation.precio_carga_externa
																		)}`}
																</div>
															)}
														</div>
													</div>
												));
											})()}
										</motion.div>
									</div>
								</Card>
								<div className="grid grid-cols-2 grid-rows-[auto,2fr,2fr] gap-4 col-span-2">
									{userRole !== 2 && (
										<>
											<Card className="rounded-xl flex flex-col gap-0 shadow-lg min-h-[150px] group border border-zinc-100 hover:border-zinc-300/80 transition-all duration-300 bg-zinc-50 p-1">
												<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
													<CardTitle className="text-xl font-light text-zinc-800">
														Ventas Totales
													</CardTitle>
													<ClipboardList className="w-4 h-4 text-zinc-800 text-muted-foreground" />
												</CardHeader>
												<CardContent className="flex flex-col justify-between gap-2">
													<div className="text-xl font-light text-zinc-800">
														{dashboardData.stats.totalSales}
													</div>
													<p className="text-sm font-normal text-zinc-500 leading-relaxed text-muted-foreground">
														{userRole === 1
															? "Estas son tus ventas totales acumuladas hasta la fecha."
															: "Estas son todas las ventas totales acumuladas hasta la fecha."}
													</p>
												</CardContent>
											</Card>
											<Card className="rounded-xl flex flex-col gap-0 shadow-lg min-h-[150px] group border border-zinc-100 hover:border-zinc-300/80 transition-all duration-300 bg-zinc-50 p-1">
												<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
													<CardTitle className="text-xl font-light text-zinc-800">
														Ventas del Mes
													</CardTitle>
													<Car className="w-4 h-4 text-muted-foreground" />
												</CardHeader>
												<CardContent className="flex flex-col justify-between gap-2">
													<div className="text-xl font-light text-zinc-800">
														{dashboardData.stats.currentMonthSales}
													</div>
													<p className="text-sm font-normal text-zinc-500 leading-relaxed text-muted-foreground">
														{userRole === 1
															? "Estas son tus ventas del mes que han sido señaladas o procesadas hasta la fecha."
															: "Estas son todas las ventas del mes que han sido señaladas o procesadas hasta la fecha."}
													</p>
												</CardContent>
											</Card>
										</>
									)}
									<Card className="relative rounded-xl shadow-xl overflow-visible col-span-2 md:col-span-1 min-h-[250px] bg-transparent group border-rose-100 hover:border-rose-200 hover:cursor-pointer transform transition-all duration-300 hover:scale-[1]">
										<Link
											href="/add-order"
											className="relative h-full p-8 flex flex-col justify-between"
										>
											<div className="space-y-4 transition-all duration-300 ease-in-out">
												<h3 className="text-xl font-light text-rose-950">
													Nueva Reserva
												</h3>
												<p className="text-rose-900/70 text-sm font-normal leading-relaxed">
													Crea un nuevo boleto de reserva de manera rápida y
													sencilla.
												</p>
											</div>
											<div className="flex items-center text-rose-900 transition-all duration-300 ease-in-out group-hover:text-rose-700 mt-4">
												<span className="text-sm">Comenzar</span>
												<div className="ml-2 p-2 rounded-full bg-rose-100 group-hover:bg-rose-100/60 transition-all duration-300">
													<PlusCircle className="w-4 h-4" />
												</div>
											</div>
										</Link>
									</Card>
									<Card className="relative rounded-xl shadow-xl overflow-hidden col-span-2 md:col-span-1 min-h-[250px] bg-gradient-to-b from-white to-emerald-50 group border-emerald-100 hover:border-emerald-200/80 hover:cursor-pointer transform transition-all duration-300 hover:scale-[1]">
										<Link
											href="/catalogue"
											className="relative h-full p-8 flex flex-col justify-between"
										>
											<div className="space-y-4 transition-all duration-300 ease-in-out">
												<h3 className="text-xl font-light text-emerald-950">
													Catálogo
												</h3>
												<p className="text-emerald-900/70 text-sm font-normal leading-relaxed">
													Accede a nuestro catálogo completo de equipos y
													especificaciones técnicas.
												</p>
											</div>
											<div className="flex items-center text-emerald-900 transition-all duration-300 ease-in-out group-hover:text-emerald-700 mt-4">
												<span className="text-sm">Ver catálogo</span>
												<div className="ml-2 p-2 rounded-full bg-emerald-100 group-hover:bg-emerald-100/60 transition-all duration-300">
													<Eye className="w-4 h-4" />
												</div>
											</div>
										</Link>
									</Card>
									{/* <Card className="relative rounded-xl shadow-xl overflow-hidden col-span-2 md:col-span-1 min-h-[250px] bg-gradient-to-b from-white to-violet-50 group border-violet-200 hover:border-violet-300/80 hover:cursor-pointer transform transition-all duration-300 hover:scale-[1]">
										<Link
											href="/calculator"
											className="relative h-full p-8 flex flex-col justify-between"
										>
											<div className="space-y-4 transition-all duration-300 ease-in-out">
												<h3 className="text-2xl font-light text-violet-950">
													Calculadora
												</h3>
												<p className="text-violet-900/70 text-sm font-normal leading-relaxed">
													Calcula cotizaciones de equipos y genera presupuestos
													de manera rápida y precisa.
												</p>
											</div>
											<div className="flex items-center text-violet-900 transition-all duration-300 ease-in-out group-hover:text-violet-700 mt-4">
												<span>Calcular</span>
												<div className="ml-2 p-2 rounded-full bg-violet-100 group-hover:bg-violet-100/60 transition-all duration-300">
													<ArrowRight className="w-4 h-4" />
												</div>
											</div>
										</Link>
									</Card> */}
									<Card className="relative rounded-xl shadow-xl overflow-hidden col-span-2 md:col-span-1 min-h-[250px] bg-gradient-to-b from-white to-violet-50/50 group border-violet-100 cursor-not-allowed opacity-60 transform transition-all duration-300">
										<div className="relative h-full p-8 flex flex-col justify-between">
											<div className="space-y-4 transition-all duration-300 ease-in-out">
												<div className="flex items-center gap-2">
													<h3 className="text-xl font-light text-violet-950">
														Calculadora
													</h3>
												</div>
												<p className="text-violet-900/70 text-sm font-normal leading-relaxed">
													Calcula cotizaciones de equipos y genera presupuestos
													de manera rápida y precisa.
												</p>
											</div>
											<div className="flex items-center text-violet-900/70 transition-all duration-300 ease-in-out mt-4">
												<span className="text-sm">Calcular</span>
												<div className="ml-2 p-2 rounded-full bg-violet-100/70">
													<ArrowRight className="w-4 h-4" />
												</div>
											</div>
										</div>
									</Card>
									<Card className="relative rounded-xl shadow-xl overflow-hidden col-span-2 md:col-span-1 min-h-[250px] bg-gradient-to-b from-white to-indigo-50 group border-indigo-200/80 hover:border-indigo-300/70 hover:cursor-pointer transform transition-all duration-300 hover:scale-[1]">
										<Link
											href="/calendar"
											className="relative h-full p-8 flex flex-col justify-between"
										>
											<div className="space-y-4 transition-all duration-300 ease-in-out">
												<h3 className="text-xl font-light text-emerald-950">
													Calendario
												</h3>
												<p className="text-indigo-900/70 text-sm font-normal leading-relaxed">
													Accede en tiempo real a todos tus eventos y reservas
													en una vista unificada y elegante.
												</p>
											</div>
											<div className="flex items-center text-indigo-900 transition-all duration-300 ease-in-out group-hover:text-indigo-700 mt-4">
												<span className="text-sm">Explorar</span>
												<div className="ml-2 p-2 rounded-full bg-indigo-100 group-hover:bg-indigo-100/60 transition-all duration-300">
													<ArrowRight className="w-4 h-4" />
												</div>
											</div>
										</Link>
									</Card>
								</div>
							</div>
						)}
						{userRole === 2 && <CommandsTable />}
					</main>
				</>
			)}
		</div>
	);
}
