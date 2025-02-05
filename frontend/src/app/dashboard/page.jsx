"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowRight, PlusCircle, Eye } from "lucide-react";
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
			firstHalfMonthSales: 0,
			secondHalfMonthSales: 0,
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
							<div className="grid grid-cols-2 gap-4 px-6 lg:px-6 xl:px-6 lg:grid-cols-4 h-full ">
								<div className="grid grid-cols-4 grid-rows-1 gap-4 col-span-4 col-start-1 col-end-5">
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
													Crea un nuevo boleto de reserva fácilmente.
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
													Accede a nuestro catálogo de equipos.
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
									<Card className="relative rounded-xl shadow-xl overflow-hidden col-span-2 md:col-span-1 min-h-[250px] bg-gradient-to-b from-white to-violet-50 group border-violet-200 hover:border-violet-300/80 hover:cursor-pointer transform transition-all duration-300 hover:scale-[1]">
										<Link
											href="/calculator"
											className="relative h-full p-8 flex flex-col justify-between"
										>
											<div className="space-y-4 transition-all duration-300 ease-in-out">
												<h3 className="text-xl font-light text-violet-950">
													Calculadora
												</h3>
												<p className="text-violet-900/70 text-sm font-normal leading-relaxed">
													Calcula cotizaciones de equipos y genera presupuestos
													de manera rápida y precisa.
												</p>
											</div>
											<div className="flex items-center text-violet-900 transition-all duration-300 ease-in-out group-hover:text-violet-700 mt-4">
												<span className="text-sm">Calcular</span>
												<div className="ml-2 p-2 rounded-full bg-violet-100 group-hover:bg-violet-100/60 transition-all duration-300">
													<ArrowRight className="w-4 h-4" />
												</div>
											</div>
										</Link>
									</Card>

									<Card className="relative rounded-xl shadow-xl overflow-hidden col-span-2 md:col-span-1 min-h-[250px] bg-gradient-to-b from-white to-indigo-50 group border-indigo-200/80 hover:border-indigo-300/70 hover:cursor-pointer transform transition-all duration-300 hover:scale-[1]">
										<Link
											href="/calendar"
											className="relative h-full p-8 flex flex-col justify-between"
										>
											<div className="space-y-4 transition-all duration-300 ease-in-out">
												<h3 className="text-xl font-light text-indigo-900">
													Calendario
												</h3>
												<p className="text-indigo-900/70 text-sm font-normal leading-relaxed">
													Vista unificada de eventos y reservas en tiempo real.
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
								<Card className="rounded-xl shadow-xl overflow-hidden col-span-4 lg:col-span-4 min-h-[250px] bg-gradient-to-b from-white to-zinc-50 group border-zinc-100 border pb-10 relative hover:border-zinc-300 duration-300 transition-all ease-in-out">
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

													// Check for future installations
													const futureInstallations =
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
															return installationString > todayString;
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

													if (
														todayInstallations.length === 0 &&
														futureInstallations.length === 0
													) {
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
																					minimumFractionDigits: 0,
																					maximumFractionDigits: 0,
																				}).format(
																					parseFloat(
																						reservation.precio_carga_externa
																							.replace(/\./g, "")
																							.replace(/,/g, ".")
																					)
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
								{userRole !== 2 && (
									<>
										<div className="grid col-start-1 col-end-5 grid-cols-2 gap-3 col-span-4 border rounded-lg bg-white shadow-lg hover:border-zinc-300 transition-all duration-300 border-zinc-100 grid-rows-[auto] px-4 py-4">
											<Card className="rounded-lg border-none shadow-sm hover:shadow-md transition-all duration-300 bg-white p-2">
												<CardHeader className="p-4 pb-2 space-y-0">
													<div className="flex items-center justify-between">
														<CardTitle className="text-sm font-normal text-zinc-600">
															1° Quincena
														</CardTitle>
													</div>
												</CardHeader>
												<CardContent className="p-4 pt-1">
													<div className="text-2xl font-normal text-zinc-900">
														{dashboardData.stats.firstHalfMonthSales}
													</div>
													<p className="text-xs text-zinc-600 mt-1">
														{userRole === 1
															? "Tus ventas del inicio del mes hasta el 15."
															: "Ventas del inicio del mes hasta el 15."}
													</p>
												</CardContent>
											</Card>

											<Card className="rounded-lg border-none shadow-sm hover:shadow-md transition-all duration-300 bg-white p-2">
												<CardHeader className="p-4 pb-2 space-y-0">
													<div className="flex items-center justify-between">
														<CardTitle className="text-sm font-normal text-zinc-600">
															2° Quincena
														</CardTitle>
													</div>
												</CardHeader>
												<CardContent className="p-4 pt-1">
													<div className="text-2xl font-normal text-zinc-900">
														{dashboardData.stats.secondHalfMonthSales}
													</div>
													<p className="text-xs text-zinc-600 mt-1">
														{userRole === 1
															? "Tus ventas del 16 hasta el final del mes."
															: "Ventas del 16 hasta el final del mes."}
													</p>
												</CardContent>
											</Card>

											<Card className="rounded-lg border-none shadow-sm hover:shadow-md transition-all duration-300 bg-white p-2">
												<CardHeader className="p-4 pb-2 space-y-0">
													<div className="flex items-center justify-between">
														<CardTitle className="text-sm font-normal text-zinc-600">
															Mes Actual
														</CardTitle>
													</div>
												</CardHeader>
												<CardContent className="p-4 pt-1">
													<div className="text-2xl font-normal text-zinc-700">
														{dashboardData.stats.currentMonthSales}
													</div>
													<p className="text-xs text-zinc-600 mt-1">
														{userRole === 1
															? "Tus ventas del mes."
															: "Ventas del mes."}
													</p>
												</CardContent>
											</Card>
											<Card className="rounded-lg border-none shadow-sm hover:shadow-md transition-all duration-300 bg-white p-2">
												<CardHeader className="p-4 pb-2 space-y-0">
													<div className="flex items-center justify-between">
														<CardTitle className="text-sm font-normal text-zinc-600">
															Total
														</CardTitle>
													</div>
												</CardHeader>
												<CardContent className="p-4 pt-1">
													<div className="text-2xl font-normal text-zinc-900">
														{dashboardData.stats.totalSales}
													</div>
													<p className="text-xs text-zinc-600 mt-1">
														{userRole === 1
															? "Tus ventas totales."
															: "Ventas totales."}
													</p>
												</CardContent>
											</Card>

											{/* <p className="text-xs font-light text-zinc-900 px-2 col-span-4 my-0">
													Ventas contabilizadas únicamente si están procesadas,
													con señas o completas. *
												</p> */}
										</div>
									</>
								)}

								{/* {userRole !== 2 && userRole !== 2 && (
								<div className="col-span-4 text-center hover:border-zinc-300 transition-all duration-300 border-zinc-100 border rounded-lg">
									<Card className="rounded-lg border-none shadow-sm hover:shadow-md transition-all duration-300 bg-white p-2 text-center">
										<CardHeader className="p-4 pb-2 space-y-0 text-center">
											<div className="flex items-center justify-center text-center">
												<CardTitle className="text-sm font-normal text-center text-zinc-600">
													A cobrar de la primera quincena
												</CardTitle>
											</div>
										</CardHeader>
										<CardContent className="p-4 pt-1">
											<div className="text-2xl font-normal text-zinc-900">
												{new Intl.NumberFormat("es-AR", {
													style: "currency",
													currency: "ARS",
												}).format(
													dashboardData.stats.firstHalfMonthSales * 50000
												)}
											</div>
											<p className="text-xs text-zinc-600 mt-1">
												{userRole === 1
													? "Tus ventas del inicio del mes hasta el 15."
													: "Ventas del inicio del mes hasta el 15."}
											</p>
										</CardContent>
									</Card>
									<Card className="rounded-lg border-none shadow-sm hover:shadow-md transition-all duration-300 bg-white p-2">
										<CardHeader className="p-4 pb-2 space-y-0">
											<div className="flex items-center justify-center">
												<CardTitle className="text-sm font-normal text-zinc-600">
													A cobrar de la segunda quincena
												</CardTitle>
											</div>
										</CardHeader>
										<CardContent className="p-4 pt-1">
											<div className="text-2xl font-normal text-zinc-900">
												{new Intl.NumberFormat("es-AR", {
													style: "currency",
													currency: "ARS",
												}).format(
													dashboardData.stats.secondHalfMonthSales * 50000
												)}
											</div>
											<p className="text-xs text-zinc-600 mt-1">
												{userRole === 1
													? "Tus ventas del inicio del mes hasta el 15."
													: "Ventas del inicio del mes hasta el 15."}
											</p>
										</CardContent>
									</Card>
								</div>
								)} */}
							</div>
						)}
						{userRole === 2 && <CommandsTable />}
					</main>
				</>
			)}
		</div>
	);
}
