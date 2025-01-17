"use client";
import { useEffect, useState } from "react";
// import myImage2 from "@/public/draw.png";
// memo;
// import { Button } from "@/components/ui/button";
import {
	Card,
	// CardContent,
	// CardDescription,
	// CardHeader,
	// CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";
// import {
// 	Table,
// 	TableBody,
// 	TableHead,
// 	TableCell,
// 	TableHeader,
// 	TableRow,
// } from "@/components/ui/table";

import { ArrowRight, PlusCircle, Eye } from "lucide-react";
// ArrowUpRight,
// ClipboardList, Car;
import Link from "next/link";

import { useSession } from "next-auth/react";

import { useRouter } from "next/navigation";
import { getDashboardData } from "../reservations/reservations.api";

import Aside from "@/components/Aside";
import Image from "next/image";
import myImage from "@/public/motorgas2.svg";
// import animeImage from "@/public/anime-kiss.webp";

// const OptimizedCard = memo(function OptimizedCard({
// 	title,
// 	value,
// 	description,
// 	icon,
// }) {
// 	useEffect(() => {
// 		document.title = "Motorgas - Dashboard";
// 	}, []);
// 	return (
// 		<Card className="rounded-xl shadow-lg border-none">
// 			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
// 				<CardTitle className="text-sm font-normal text-zinc-800">
// 					{title}
// 				</CardTitle>
// 				{icon}
// 			</CardHeader>
// 			<CardContent>
// 				<div className="text-2xl font-light">{value}</div>
// 				<p className="text-xs text-muted-foreground">{description}</p>
// 			</CardContent>
// 		</Card>
// 	);
// });

export default function Dashboard() {
	const router = useRouter();
	const { data: session } = useSession();
	// const userRole = session?.user?.role;

	const [dashboardData, setDashboardData] = useState({
		reservations: [],
		commands: [],
		reservationsSummary: {},
		commandsSummary: {},
	});
	const [loading, setLoading] = useState(true);
	const [dataFetched, setDataFetched] = useState(false);

	useEffect(() => {
		const fetchDashboardData = async () => {
			if (dataFetched && dashboardData.reservations.length > 0) {
				return;
			}

			if (!session?.user) return;

			setLoading(true);
			try {
				const data = await getDashboardData();
				setDashboardData(data);
				setDataFetched(true);
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
	}, [session, router, dataFetched, dashboardData.reservations.length]);

	// const lastFiveReservations = dashboardData.reservations
	// 	.filter((reservation) => {
	// 		if (userRole === 2 || userRole === 3) return true;
	// 		return reservation.usuarios.id === session?.user?.id;
	// 	})
	// 	.sort((a, b) => new Date(b.creado_en) - new Date(a.creado_en))
	// 	.slice(0, 5);

	return (
		<div className="flex-1 bg-gradient-to-br from-zinc-50 to-zinc-100/50">
			{loading ? (
				<div className="flex flex-col items-center justify-center h-[80vh] mx-auto">
					<motion.div
						initial={{ opacity: 0 }}
						animate={{
							opacity: [0, 1, 1, 0],
							scale: [1, 1.05, 1],
						}}
						transition={{
							duration: 0.75,
							ease: "easeInOut",
							repeat: Infinity,
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

					<main className="flex flex-col items-stretch justify-normal p-8 z-50 max-w-7xl mx-auto">
						<div className="mb-16 text-center">
							<h1 className="text-3xl md:text-3xl font-light text-zinc-900 mb-4 leading-tight">
								Convierte cada visita en una
								<span className="text-emerald-950"> oportunidad de venta.</span>
							</h1>
							<p className="text-zinc-600 text-base md:text-base leading-relaxed">
								Aumenta tus ingresos con nuestra plataforma diseñada para
								referidos. Cada contacto es una oportunidad para vender más.
							</p>
							<p className="text-zinc-600 text-base md:text-base leading-relaxed">
								Este programa de referidos de Motorgas está diseñado para
								ayudarte a maximizar tus ganancias mientras ofreces un servicio
								excepcional a tus clientes.
							</p>
						</div>

						<div className="grid grid-cols-1 gap-4 mb-8 lg:grid-cols-2 h-full">
							{/* <div
								className="absolute inset-x-0 top-[-10rem] z-0 transform-gpu overflow-hidden blur-3xl sm:top-[-20rem]"
								aria-hidden="true"
							>
								<div
									className="relative left-1/2 -z-10 aspect-[1155/678] w-[36.125rem] max-w-none -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#00008B] to-[#3636a3] opacity-10 sm:left-[calc(50%-40rem)] sm:w-[72.1875rem]"
									style={{
										clipPath:
											"polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
									}}
								></div>
							</div> */}
							<Card className="relative rounded-xl shadow-xl overflow-visible col-span-2 lg:col-span-1 min-h-[250px] bg-transparent group border-none hover:cursor-pointer transform transition-all duration-300 hover:scale-[1]">
								{/* <Image
									src={myImage2}
									alt="Flecha decorativa"
									className="w-12 h-12 sm:w-16 sm:h-16 object-contain opacity-80 absolute -top-6 -right-6 rotate-[325deg] transition-transform duration-300 z-10"
									loading="eager"
								/> */}
								{/* <div className="absolute inset-0 bg-gradient-to-br from-rose-200 to-red-300 opacity-10" />
								<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-sm bg-white/10" /> */}
								<div className="absolute inset-0 border border-rose-100/50 rounded-xl group-hover:border-rose-200/70 transition-all duration-500" />

								<Link
									href="/add-order"
									className="relative h-full p-8 flex flex-col justify-between"
								>
									<div className="space-y-4 transition-all duration-300 ease-in-out">
										<div className="flex items-center gap-2">
											<span className="px-3 py-1 text-xs font-medium bg-rose-100 text-rose-600 rounded-full">
												Crear Reserva
											</span>
										</div>
										<h3 className="text-2xl font-light text-rose-950">
											Nueva Reserva
										</h3>
										<p className="text-rose-900/70 text-sm font-normal leading-relaxed">
											Crea un nuevo boleto de reserva de manera rápida y
											sencilla.
										</p>
									</div>
									<div className="flex items-center text-rose-900 transition-all duration-300 ease-in-out group-hover:text-rose-700 mt-4">
										<span>Comenzar</span>
										<div className="ml-2 p-2 rounded-full bg-rose-100 group-hover:bg-rose-100/60 transition-all duration-300">
											<PlusCircle className="w-4 h-4" />
										</div>
									</div>
								</Link>
							</Card>

							<Card className="relative rounded-xl shadow-xl overflow-hidden col-span-2 lg:col-span-1 min-h-[250px] bg-gradient-to-b from-white to-emerald-50 group border-none hover:cursor-pointer transform transition-all duration-300 hover:scale-[1]">
								{/* <Image
									src={animeImage}
									alt="Anime characters"
									className="absolute inset-0 w-full h-full object-cover opacity-20"
									priority
								/> */}

								<div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 opacity-5" />
								<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-sm bg-white/5" />
								<div className="absolute inset-0 border border-emerald-200/30 rounded-xl group-hover:border-emerald-300/40 transition-all duration-500" />

								<Link
									href="/axis"
									className="relative h-full p-8 flex flex-col justify-between"
								>
									<div className="space-y-4 transition-all duration-300 ease-in-out">
										<div className="flex items-center gap-2">
											<span className="px-3 py-1 text-xs font-medium bg-emerald-100 text-emerald-600 rounded-full">
												Explorar
											</span>
										</div>
										<h3 className="text-2xl font-light text-emerald-950">
											Catálogo de Equipos
										</h3>
										<p className="text-emerald-900/70 text-sm font-normal leading-relaxed">
											Accede a nuestro catálogo completo de equipos y
											especificaciones técnicas.
										</p>
									</div>
									<div className="flex items-center text-emerald-900 transition-all duration-300 ease-in-out group-hover:text-emerald-700 mt-4">
										<span>Ver catálogo</span>
										<div className="ml-2 p-2 rounded-full bg-emerald-100 group-hover:bg-emerald-100/60 transition-all duration-300">
											<Eye className="w-4 h-4" />
										</div>
									</div>
								</Link>
							</Card>
							<Card className="relative rounded-xl shadow-xl overflow-hidden col-span-1 min-h-[250px] bg-gradient-to-b from-white to-zinc-50 group border-none">
								<div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 opacity-5" />
								<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-sm bg-white/5" />
								<div className="absolute inset-0 border border-zinc-200/80 rounded-xl group-hover:border-zinc-300/80 transition-all duration-500" />

								<div className="relative h-full p-8">
									<div className="flex items-center justify-between mb-6">
										<div className="space-y-1">
											<h3 className="text-2xl font-light text-zinc-900">
												Tus últimas ventas
											</h3>
											<p className="text-zinc-600 text-sm">
												Resumen de las últimas 5 reservas realizadas
											</p>
										</div>
										<Link href="/reservations">
											<div className="p-2 rounded-full bg-zinc-100 hover:bg-zinc-100/60 transition-all duration-300">
												<ArrowRight className="w-4 h-4 text-zinc-600" />
											</div>
										</Link>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
										{(() => {
											const filteredReservations = dashboardData.reservations
												.filter((reservation) => {
													if (
														session?.user?.role === 2 ||
														session?.user?.role === 3
													)
														return true;
													return reservation.usuarios.id === session?.user?.id;
												})
												.sort(
													(a, b) =>
														new Date(b.creado_en) - new Date(a.creado_en)
												)
												.slice(0, 5);

											if (filteredReservations.length === 0) {
												return (
													<p className="text-zinc-500 text-left col-span-full text-sm w-full">
														No hay ventas registradas aún.
													</p>
												);
											}

											return filteredReservations.map((reservation) => (
												<div
													key={reservation.id}
													onClick={() =>
														router.push(`/reservations/${reservation.id}`)
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
															{new Date(
																reservation.creado_en
															).toLocaleDateString("es-AR", {
																day: "2-digit",
																month: "2-digit",
															})}
														</span>
													</div>
													<div className="text-sm text-zinc-600 mb-2 truncate">
														{`${reservation.marca_vehiculo || ""} ${
															reservation.modelo_vehiculo || ""
														}`.trim()}
													</div>
													<div className="text-sm font-medium text-emerald-600">
														{new Intl.NumberFormat("es-AR", {
															style: "currency",
															currency: "ARS",
														}).format(reservation.precio)}
													</div>
												</div>
											));
										})()}
									</div>
								</div>
							</Card>
							<div className="flex flex-col gap-4">
								<Card className="relative rounded-xl shadow-xl overflow-hidden col-span-2 lg:col-span-1 min-h-[250px] bg-gradient-to-b from-white to-violet-50 group border-none hover:cursor-pointer transform transition-all duration-300 hover:scale-[1]">
									<div className="absolute inset-0 bg-gradient-to-br from-violet-200 to-violet-300 opacity-10" />
									<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-sm bg-white/10" />
									<div className="absolute inset-0 border border-violet-200/80 rounded-xl group-hover:border-violet-300/50 transition-all duration-300" />

									<Link
										href="/calculator"
										className="relative h-full p-8 flex flex-col justify-between"
									>
										<div className="space-y-4 transition-all duration-300 ease-in-out">
											<div className="flex items-center gap-2">
												<span className="px-3 py-1 text-xs font-medium bg-violet-100 text-violet-600 rounded-full">
													Herramienta
												</span>
											</div>
											<h3 className="text-2xl font-light text-violet-950">
												Calculadora
											</h3>
											<p className="text-violet-900/70 text-sm font-normal leading-relaxed">
												Calcula cotizaciones de equipos y genera presupuestos de
												manera rápida y precisa.
											</p>
										</div>
										<div className="flex items-center text-violet-900 transition-all duration-300 ease-in-out group-hover:text-violet-700 mt-4">
											<span>Calcular</span>
											<div className="ml-2 p-2 rounded-full bg-violet-100 group-hover:bg-violet-100/60 transition-all duration-300">
												<ArrowRight className="w-4 h-4" />
											</div>
										</div>
									</Link>
								</Card>
								<Card className="relative rounded-xl shadow-xl overflow-hidden col-span-2 lg:col-span-1 min-h-[250px] bg-gradient-to-b from-white to-indigo-50 group border-none hover:cursor-pointer transform transition-all duration-300 hover:scale-[1]">
									{/* <Image
									src={animeImage}
									alt="Anime characters"
									className="absolute inset-0 w-full h-full object-cover opacity-20"
									priority
								/> */}

									<div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 opacity-5" />
									<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-sm bg-white/5" />
									<div className="absolute inset-0 border border-indigo-200/60 rounded-xl group-hover:border-indigo-300/40 transition-all duration-300" />

									<Link
										href="/calendar"
										className="relative h-full p-8 flex flex-col justify-between"
									>
										<div className="space-y-4 transition-all duration-300 ease-in-out">
											<div className="flex items-center gap-2">
												<span className="px-3 py-1 text-xs font-medium bg-indigo-100 text-indigo-600 rounded-full">
													¡Nuevo!
												</span>
											</div>
											<h3 className="text-2xl font-light text-emerald-950">
												Calendario
											</h3>
											<p className="text-indigo-900/70 text-sm font-normal leading-relaxed">
												Accede en tiempo real a todos tus eventos y reservas en
												una vista unificada y elegante.
											</p>
										</div>
										<div className="flex items-center text-indigo-900 transition-all duration-300 ease-in-out group-hover:text-indigo-700 mt-4">
											<span>Explorar</span>
											<div className="ml-2 p-2 rounded-full bg-indigo-100 group-hover:bg-indigo-100/60 transition-all duration-300">
												<ArrowRight className="w-4 h-4" />
											</div>
										</div>
									</Link>
								</Card>
							</div>
						</div>
						{/* <footer className="flex justify-center py-4 bg-gray-100">
							<p className="text-sm text-gray-600">
								Creador por{" "}
								<a
									href="https://www.linkedin.com/in/lucaspausin"
									className="text-indigo-600 hover:underline opacity-50"
								>
									@lucaspausin
								</a>
							</p>
						</footer> */}
					</main>
				</>
			)}
		</div>
	);
}
