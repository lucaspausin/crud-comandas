"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Aside from "@/components/Aside";
import HomeIcon from "@/components/HomeIcon";
import brands from "@/public/jsons/brands.json";
import models from "@/public/jsons/models.json";
import support from "@/public/jsons/support.json";
import { useState } from "react";
import { motion } from "framer-motion";

export default function Axis() {
	const [selectedMarca, setSelectedMarca] = useState("");
	const [selectedModelo, setSelectedModelo] = useState("");
	const [productInfo, setProductInfo] = useState([]);
	const [mousePositions, setMousePositions] = useState({});
	const [cursorPositions, setCursorPositions] = useState({});

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
					<Card className="border-none bg-white shadow-lg">
						<CardHeader>
							<div className="flex justify-between items-center relative">
								<CardTitle className="text-xl font-light text-zinc-800">
									Lista de Equipos
								</CardTitle>
							</div>
						</CardHeader>
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
										<div className="grid gap-4 md:grid-cols-2">
											{productInfo.map((producto, index) => (
												<motion.div
													initial={{ opacity: 0 }}
													animate={{ opacity: 1 }}
													transition={{ delay: index * 0.1 }}
													key={index}
													className="relative bg-zinc-50/50 p-4 rounded-md space-y-2 border cursor-none overflow-hidden"
													onMouseMove={(e) => {
														const rect =
															e.currentTarget.getBoundingClientRect();
														const x =
															((e.clientX - rect.left) / rect.width) * 100;
														const y =
															((e.clientY - rect.top) / rect.height) * 100;
														setMousePositions((prev) => ({
															...prev,
															[index]: { x, y },
														}));
														setCursorPositions((prev) => ({
															...prev,
															[index]: {
																x: e.clientX - rect.left,
																y: e.clientY - rect.top,
															},
														}));
													}}
													onMouseLeave={() => {
														setMousePositions((prev) => ({
															...prev,
															[index]: { x: -100, y: -100 },
														}));
														setCursorPositions((prev) => ({
															...prev,
															[index]: { x: -9999, y: -9999 },
														}));
													}}
												>
													<div
														className="absolute inset-0 transition-opacity duration-300 ease-out"
														style={{
															backgroundImage: `radial-gradient(circle at ${
																mousePositions[index]?.x ?? -100
															}% ${
																mousePositions[index]?.y ?? -100
															}%, rgb(251 146 60 / 0.75), transparent 70%)`,
															opacity:
																mousePositions[index]?.x === -100 ? 0 : 0.75,
														}}
													/>
													<div
														className="pointer-events-none absolute w-8 h-8 rounded-full mix-blend-difference z-50"
														style={{
															background:
																"radial-gradient(circle, rgb(251 146 60), rgb(239 68 68))",
															transform: `translate(${
																(cursorPositions[index]?.x ?? -9999) - 16
															}px, ${
																(cursorPositions[index]?.y ?? -9999) - 16
															}px)`,
															opacity:
																cursorPositions[index]?.x === -9999 ? 0 : 1,
															transition: "opacity 150ms ease-out",
														}}
													/>

													<h4 className="relative text-zinc-800">
														{producto.nombre}
													</h4>
													<div className="relative space-y-1 text-sm text-zinc-600">
														<p>Autonomía equivalente a {producto.autonomia} </p>
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
