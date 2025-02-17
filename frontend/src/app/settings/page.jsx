"use client";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import Aside from "@/components/Aside";
import Link from "next/link";
import { PlusCircle, Eye, ArrowRight } from "lucide-react";

export default function Settings() {
	return (
		<div className="flex-1 bg-zinc-50">
			<Aside />
			<motion.main
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className="flex-1 gap-4 flex flex-col p-6 lg:px-8 xl:px-8 mt-12 overflow-y-auto"
			>
				<div className="space-y-6">
					<div className="rounded-xl h-fit bg-white/50 hover:border-zinc-300 duration-300 transition-all ease-in-out border-zinc-100 border backdrop-blur-sm p-6 shadow-xl">
						<div className="mb-6 text-center">
							<h2 className="text-2xl font-light text-zinc-900">
								Catálogo General
							</h2>
							<p className="text-zinc-600 text-sm mt-1">
								Gestiona todos los elementos del catálogo de productos.
							</p>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 grid-rows-1 gap-8 md:gap-4 col-span-2">
							<Card className="relative rounded-xl overflow-visible col-span-2 md:col-span-1 min-h-[250px] bg-gradient-to-b from-zinc-50/30 to-zinc-100/20 border-[1.5px] border-zinc-200 group shadow-sm hover:shadow-md hover:cursor-pointer hover:from-zinc-100/30 hover:to-zinc-200/20 transform transition-all duration-300 ease-in-out hover:scale-[1]">
								<Link
									href="/settings/brands"
									className="relative h-full p-8 flex flex-col justify-between"
								>
									<div className="space-y-4 transition-all duration-300 ease-in-out">
										<h3 className="text-xl font-light text-zinc-950">
											Gestión de Marcas
										</h3>
										<p className="text-zinc-600 text-sm font-normal leading-relaxed">
											Gestiona las marcas del catálogo.
										</p>
									</div>
									<div className="flex items-center text-zinc-700 transition-all duration-300 ease-in-out group-hover:text-zinc-900 mt-4">
										<span className="text-sm">Editar Marcas</span>
										<div className="ml-2 p-2 rounded-full bg-zinc-100 group-hover:bg-zinc-200 transition-all duration-300">
											<PlusCircle className="w-4 h-4" />
										</div>
									</div>
								</Link>
							</Card>
							<Card className="relative rounded-xl overflow-hidden col-span-2 md:col-span-1 min-h-[250px] bg-gradient-to-b from-zinc-50/30 to-zinc-100/20 border-[1.5px] border-zinc-200 group shadow-sm hover:shadow-md hover:cursor-pointer hover:from-zinc-100/30 hover:to-zinc-200/20 transform transition-all duration-300 ease-in-out hover:scale-[1]">
								<Link
									href="/settings/cylinders"
									className="relative h-full p-8 flex flex-col justify-between"
								>
									<div className="space-y-4 transition-all duration-300 ease-in-out">
										<h3 className="text-xl font-light text-zinc-950">
											Cilindros y Precios
										</h3>
										<p className="text-zinc-600 text-sm font-normal leading-relaxed">
											Actualizá el stock de cilindros y sus precios.
										</p>
									</div>
									<div className="flex items-center text-zinc-700 transition-all duration-300 ease-in-out group-hover:text-zinc-900 mt-4">
										<span className="text-sm">Gestionar Cilindros</span>
										<div className="ml-2 p-2 rounded-full bg-zinc-100 group-hover:bg-zinc-200 transition-all duration-300">
											<Eye className="w-4 h-4" />
										</div>
									</div>
								</Link>
							</Card>
							<Card className="relative rounded-xl overflow-hidden col-span-2 md:col-span-1 min-h-[250px] bg-gradient-to-b from-zinc-50/30 to-zinc-100/20 border-[1.5px] border-zinc-200 group shadow-sm hover:shadow-md hover:cursor-pointer hover:from-zinc-100/30 hover:to-zinc-200/20 transform transition-all duration-300 ease-in-out hover:scale-[1]">
								<Link
									href="/settings/vehicles"
									className="relative h-full p-8 flex flex-col justify-between"
								>
									<div className="space-y-4 transition-all duration-300 ease-in-out">
										<div className="flex items-center gap-2">
											<h3 className="text-xl font-light text-zinc-950">
												Vehículos
											</h3>
										</div>
										<p className="text-zinc-600 text-sm font-normal leading-relaxed">
											Gestiona vehículos y especificaciones.
										</p>
									</div>
									<div className="flex items-center text-zinc-700 transition-all duration-300 ease-in-out group-hover:text-zinc-900 mt-4">
										<span className="text-sm">Editar Vehículos</span>
										<div className="ml-2 p-2 rounded-full bg-zinc-100 group-hover:bg-zinc-200 transition-all duration-300">
											<ArrowRight className="w-4 h-4" />
										</div>
									</div>
								</Link>
							</Card>
							<Card className="relative rounded-xl overflow-hidden col-span-2 md:col-span-1 min-h-[250px] bg-gradient-to-b from-amber-50/20 to-amber-100/10 border-[1.5px] border-amber-100 group shadow-sm hover:shadow-md hover:cursor-pointer hover:from-amber-100/20 hover:to-amber-200/10 transform transition-all duration-300 ease-in-out hover:scale-[1]">
								<Link
									href="/settings/interest"
									className="relative h-full p-8 flex flex-col justify-between"
								>
									<div className="space-y-4 transition-all duration-300 ease-in-out">
										<div className="flex items-center gap-2">
											<h3 className="text-xl font-light text-zinc-950">
												Planes y Intereses
											</h3>
										</div>
										<p className="text-zinc-600 text-sm font-normal leading-relaxed">
											Configura tasas de interés y parámetros de financiamiento.
										</p>
									</div>
									<div className="flex items-center text-zinc-700 transition-all duration-300 ease-in-out group-hover:text-zinc-900 mt-4">
										<span className="text-sm">Editar Intereses</span>
										<div className="ml-2 p-2 rounded-full bg-zinc-100 group-hover:bg-zinc-200 transition-all duration-300">
											<ArrowRight className="w-4 h-4" />
										</div>
									</div>
								</Link>
							</Card>

							<Card className="relative rounded-xl overflow-visible col-span-2 md:col-span-1 min-h-[250px] bg-gradient-to-b from-rose-50/20 to-rose-100/10 border-[1.5px] border-rose-100 group shadow-sm hover:shadow-md hover:cursor-pointer hover:from-rose-100/20 hover:to-rose-200/10 transform transition-all duration-300 ease-in-out">
								<Link
									href="/settings/customers"
									className="relative h-full p-8 flex flex-col justify-between"
								>
									<div className="space-y-4 transition-all duration-300 ease-in-out">
										<h3 className="text-xl font-light text-zinc-950">
											Gestión de Clientes
										</h3>
										<p className="text-zinc-600 text-sm font-normal leading-relaxed">
											Visualiza los clientes y su historia de ventas.
										</p>
									</div>
									<div className="flex items-center text-zinc-700 transition-all duration-300 ease-in-out group-hover:text-zinc-900 mt-4">
										<span className="text-sm">Visualizar Clientes</span>
										<div className="ml-2 p-2 rounded-full bg-zinc-100 group-hover:bg-zinc-200 transition-all duration-300">
											<PlusCircle className="w-4 h-4" />
										</div>
									</div>
								</Link>
							</Card>
							{/* <Card className="relative rounded-xl  overflow-visible col-span-2 md:col-span-1 min-h-[250px] bg-transparent group border-none shadow-none hover:shadow-md hover:cursor-pointer transform transition-all duration-300 hover:scale-[1]">
								<Link
									href="/settings/sellers"
									className="relative h-full p-8 flex flex-col justify-between"
								>
									<div className="space-y-4 transition-all duration-300 ease-in-out">
										<h3 className="text-xl font-light text-zinc-950">
											Estadísticas de Vendedores
										</h3>
										<p className="text-zinc-600 text-sm font-normal leading-relaxed">
											Visualiza las estadísticas individuales de cada vendedor.
										</p>
									</div>
									<div className="flex items-center text-zinc-700 transition-all duration-300 ease-in-out group-hover:text-zinc-900 mt-4">
										<span className="text-sm">Ver Estadísticas</span>
										<div className="ml-2 p-2 rounded-full bg-zinc-100 group-hover:bg-zinc-200 transition-all duration-300">
											<Eye className="w-4 h-4" />
										</div>
									</div>
								</Link>
							</Card> */}
						</div>
					</div>
				</div>
				<div className="space-y-6"></div>
			</motion.main>
		</div>
	);
}
