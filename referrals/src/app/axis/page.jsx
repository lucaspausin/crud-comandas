"use client";
import { Card, CardContent,  } from "@/components/ui/card";
// CardHeader, CardTitle;
import Aside from "@/components/Aside";
import HomeIcon from "@/components/HomeIcon";
import brands from "@/public/jsons/brands.json";
import models from "@/public/jsons/modificaciones.json";
import support from "@/public/jsons/support.json";
import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import cilindro40 from "@/public/TUBOGNC-10M3-40LTS-850X273.png";
import cilindro60 from "@/public/TUBOGNC-15M3-60LTS-930X323.png";
import cilindro70 from "@/public/TUBOGNC-17.5M3-70LTS-900X355.png";
import cilindro2x30 from "@/public/TUBOGNC-2X-75M3-30LTS-780X244.png";
import cilindro2x35 from "@/public/TUBOGNC-2X-75M3-35LTS-780X244.png";

// Crear un objeto que mapee los nombres de archivo a las constantes importadas
const imageMap = {
	"TUBOGNC-10M3-40LTS-850X273.png": cilindro40,
	"TUBOGNC-15M3-60LTS-930X323.png": cilindro60,
	"TUBOGNC-17.5M3-70LTS-900X355.png": cilindro70,
	"TUBOGNC-2X-75M3-30LTS-780X244.png": cilindro2x30,
	"TUBOGNC-2X-75M3-35LTS-780X244.png": cilindro2x35,
};

export default function Axis() {
	const [selectedMarca, setSelectedMarca] = useState("");
	const [selectedModelo, setSelectedModelo] = useState("");
	const [productInfo, setProductInfo] = useState([]);

	const handleMarcaChange = (event) => {
		setSelectedMarca(event.target.value);
		setSelectedModelo("");
		setProductInfo([]);
	};

	const handleModeloChange = (event) => {
		const modeloSeleccionado = event.target.value;
		setSelectedModelo(modeloSeleccionado);

		const productos = models[selectedMarca][modeloSeleccionado].productos;
		const infoProductos = productos
			.map((producto) => support[producto])
			.filter(Boolean);
		setProductInfo(infoProductos);
	};

	return (
		<div className="flex-1 bg-zinc-50">
			<Aside />
			<motion.main
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className="flex-1 p-6 overflow-y-auto"
			>
				<div className="flex items-center mb-8">
					<HomeIcon label="Volver" />
					<h2 className="text-zinc-700 text-base">Catálogo de Equipos</h2>
				</div>

				<motion.div
					initial={{ y: 20 }}
					animate={{ y: 0 }}
					transition={{ duration: 0.4 }}
				>
					<Card className="border-none bg-transparent shadow-lg">
						<div className="my-4 mb-12 text-center">
							<h1 className="text-3xl md:text-3xl font-light text-zinc-900 mb-2 leading-tight">
								Encuentra el cilindro{" "}
								<span className="text-red-700">ideal para cada vehículo</span>
							</h1>
							<p className="text-base text-zinc-700">
								Explora nuestro catálogo completo de cilindros GNC por marca y
								modelo para encontrar la mejor opción para tu cliente.
							</p>
						</div>
						{/* <CardHeader>
							<div className="flex justify-between items-center relative">
								<CardTitle className="text-xl font-light text-zinc-800">
									Lista de Equipos
								</CardTitle>
							</div>
						</CardHeader> */}
						<CardContent className="pt-6">
							<div className="space-y-6">
								<div className="grid grid-cols-1 md:grid-cols-[140px,1fr] items-center gap-3">
									<label htmlFor="marca" className="text-sm text-zinc-600">
										Elegir Marcas
									</label>
									<select
										id="marca"
										name="marca"
										className="w-full border border-zinc-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-200"
										onChange={handleMarcaChange}
										value={selectedMarca}
									>
										<option value="" disabled>
											Elegir Marcas
										</option>
										{Object.entries(brands).map(([key, value]) => (
											<option key={key} value={key}>
												{value}
											</option>
										))}
									</select>
								</div>

								{selectedMarca && (
									<motion.div
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										className="grid grid-cols-1 md:grid-cols-[140px,1fr] items-center gap-3"
									>
										<label htmlFor="modelo" className="text-sm text-zinc-600">
											Elegir Modelos
										</label>
										<select
											id="modelo"
											name="modelo"
											className="w-full border border-zinc-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-200"
											onChange={handleModeloChange}
											value={selectedModelo}
										>
											<option value="" disabled>
												Elegir Modelos
											</option>
											{selectedMarca in models &&
												Object.entries(models[selectedMarca]).map(
													([key, model]) => (
														<option key={key} value={key}>
															{model.nombre}
														</option>
													)
												)}
										</select>
									</motion.div>
								)}

								{productInfo.length > 0 && (
									<motion.div
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										className="mt-8"
									>
										<h3 className="text-sm text-zinc-600 mb-4">
											Información de Productos
										</h3>
										<div className="grid gap-4 md:grid-cols-2 ">
											{productInfo.map((producto, index) => (
												<motion.div
													initial={{ opacity: 0 }}
													animate={{ opacity: 1 }}
													transition={{ delay: index * 0.1 }}
													key={index}
													className="relative grid items-stretch grid-cols-1 lg:grid-cols-[auto,1fr] gap-4 bg-zinc-50/50 p-4 rounded-md space-y-2 border"
												>
													<Image
														src={
															imageMap[producto["imagen-principal"]] ||
															producto["imagen-principal"]
														}
														width={250}
														height={250}
														alt="Descripción de la imagen"
														className="w-[250px] h-full rounded-sm object-contain opacity-90"
														loading="eager"
														priority
													/>
													<div className="h-fit">
														<h4 className="relative text-zinc-800">
															{producto.nombre}
														</h4>
														<div className="relative h-full space-y-2 text-sm text-zinc-600">
															<p className="my-2">
																Autonomía equivalente a {producto.autonomia}
															</p>

															{models[selectedMarca][selectedModelo][
																"sugerencias-ventas"
															] && (
																<p>
																	Sugerencias de venta:{" "}
																	{
																		models[selectedMarca][selectedModelo][
																			"sugerencias-ventas"
																		]
																	}
																</p>
															)}
															{models[selectedMarca][selectedModelo][
																"tipo-cuna-disponible"
															] && (
																<p>
																	Tipo de cuna:{" "}
																	{
																		models[selectedMarca][selectedModelo][
																			"tipo-cuna-disponible"
																		]
																	}
																</p>
															)}
															{models[selectedMarca][selectedModelo]
																.observaciones && (
																<p className="h-fit">
																	<span className="">Observaciones:</span>{" "}
																	{
																		models[selectedMarca][selectedModelo]
																			.observaciones
																	}
																</p>
															)}
														</div>
													</div>
												</motion.div>
											))}
										</div>
									</motion.div>
								)}
							</div>
						</CardContent>
					</Card>
				</motion.div>
			</motion.main>
		</div>
	);
}
