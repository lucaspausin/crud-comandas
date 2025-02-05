"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Aside from "@/components/Aside";
// import HomeIcon from "@/components/HomeIcon";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import api from "@/lib/axios";
import myImage from "@/public/motorgas2.svg";
import { useRouter, useSearchParams } from "next/navigation";

export default function Catalogue() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [brands, setBrands] = useState({});
	const [vehicles, setVehicles] = useState({});
	const [supports, setSupports] = useState({});
	const [selectedMarca, setSelectedMarca] = useState("");
	const [selectedModelo, setSelectedModelo] = useState("");
	const [productInfo, setProductInfo] = useState([]);
	const [loading, setLoading] = useState(true);
	const [imageCache, setImageCache] = useState({});
	const [selectedVehicle, setSelectedVehicle] = useState(null);

	// Cargar datos iniciales
	useEffect(() => {
		const fetchInitialData = async () => {
			try {
				const [brandsResponse, vehiclesResponse, supportsResponse] =
					await Promise.all([
						api.get("/api/brands"),
						api.get("/api/vehicles"),
						api.get("/api/support"),
					]);

				// Transformar la respuesta de marcas en el formato esperado
				const brandsData = brandsResponse.data.reduce((acc, brand) => {
					acc[brand.code] = brand.name;
					return acc;
				}, {});
				setBrands(brandsData);

				// Transformar la respuesta de vehículos en el formato esperado
				const vehiclesData = vehiclesResponse.data.reduce((acc, vehicle) => {
					if (!acc[vehicle.brands.code]) {
						acc[vehicle.brands.code] = {};
					}
					acc[vehicle.brands.code][vehicle.name] = {
						...vehicle,
						nombre: vehicle.name,
						cradle_type: vehicle.cradle_type,
						observaciones: vehicle.observations,
						"sugerencias-ventas": vehicle.sales_suggestions,
						"tipo-cuna-disponible": vehicle.cradle_type,
						productos: vehicle.support.map((s) => s.code),
					};
					return acc;
				}, {});
				setVehicles(vehiclesData);

				// Transformar la respuesta de soportes en el formato esperado
				const supportsData = supportsResponse.data.reduce((acc, support) => {
					const imageUrl =
						support.support_images?.[0]?.url || support.image || "";

					acc[support.code] = {
						code: support.code,
						nombre: support.name,
						autonomia: support.autonomy,
						"imagen-principal": imageUrl,
						"kilometros-equivalentes": support.equivalent_km,
						initial_price_brc: support.initial_price_brc || 0,
						list_price_brc: support.list_price_brc || 0,
						promo_price_brc: support.promo_price_brc || 0,
						initial_price_ta: support.initial_price_ta || 0,
						list_price_ta: support.list_price_ta || 0,
						promo_price_ta: support.promo_price_ta || 0,
					};
					return acc;
				}, {});
				setSupports(supportsData);

				setLoading(false);
			} catch (error) {
				console.error("Error fetching data:", error);
				setLoading(false);
			}
		};

		fetchInitialData();
	}, []);

	useEffect(() => {
		// Función para precargar una imagen
		const preloadImage = (url) => {
			return new Promise((resolve, reject) => {
				const img = document.createElement("img");
				img.src = url;
				img.onload = () => {
					setImageCache((prev) => ({ ...prev, [url]: true }));
					resolve();
				};
				img.onerror = reject;
			});
		};

		// Precargar todas las imágenes cuando supports cambia
		const preloadAllImages = async () => {
			try {
				const imageUrls = Object.values(supports)
					.map((support) => support["imagen-principal"])
					.filter((url) => url);
				await Promise.all(imageUrls.map(preloadImage));
			} catch (error) {
				console.error("Error precargando imágenes:", error);
			}
		};

		if (Object.keys(supports).length > 0) {
			preloadAllImages();
		}
	}, [supports]);

	// Agregar este useEffect para manejar la sincronización con la URL
	useEffect(() => {
		const marca = searchParams.get("marca");
		const modelo = searchParams.get("modelo");

		if (marca) {
			setSelectedMarca(marca);
		}
		if (modelo) {
			setSelectedModelo(modelo);
		}

		if (marca && modelo && vehicles[marca]?.[modelo]) {
			const vehicleData = vehicles[marca][modelo];
			const productos = vehicleData.productos;
			const infoProductos = productos
				.map((producto) => supports[producto])
				.filter(Boolean);
			setProductInfo(infoProductos);
			setSelectedVehicle(vehicleData);
		}
	}, [searchParams, vehicles, supports]); // Dependencias del efecto

	const handleMarcaChange = (event) => {
		const newMarca = event.target.value;
		setSelectedMarca(newMarca);
		setSelectedModelo("");
		setProductInfo([]);

		// Actualizar URL
		const params = new URLSearchParams(searchParams.toString());
		params.set("marca", newMarca);
		params.delete("modelo"); // Limpiar el modelo cuando cambia la marca
		router.replace(`/catalogue?${params.toString()}`);
	};

	const handleModeloChange = async (event) => {
		const modeloSeleccionado = event.target.value;
		setSelectedModelo(modeloSeleccionado);

		// Actualizar URL
		const params = new URLSearchParams(searchParams.toString());
		params.set("marca", selectedMarca);
		params.set("modelo", modeloSeleccionado);
		router.replace(`/catalogue?${params.toString()}`);

		if (vehicles[selectedMarca]?.[modeloSeleccionado]) {
			const vehicleData = vehicles[selectedMarca][modeloSeleccionado];
			const productos = vehicleData.productos;
			const infoProductos = productos
				.map((producto) => supports[producto])
				.filter(Boolean);
			setProductInfo(infoProductos);
			setSelectedVehicle(vehicleData);
		}
	};

	const handleCardClick = (support) => {
		const params = new URLSearchParams({
			initial_price_brc: support.initial_price_brc?.toString() || "0",
			list_price_brc: support.list_price_brc?.toString() || "0",
			promo_price_brc: support.promo_price_brc?.toString() || "0",
			initial_price_ta: support.initial_price_ta?.toString() || "0",
			list_price_ta: support.list_price_ta?.toString() || "0",
			promo_price_ta: support.promo_price_ta?.toString() || "0",
			support_name: support.nombre,
			support_code: support.code,
		});

		router.push(`/calculator?${params.toString()}`);
	};

	if (loading) {
		return (
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
		);
	}

	return (
		<div className="flex-1 bg-zinc-50">
			<Aside />
			<motion.main
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className="flex-1 p-6 lg:px-8 xl:px-8 overflow-y-auto"
			>
				{/* <HomeIcon /> */}

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
								<div className="grid grid-cols-2 gap-8">
									<div className="grid grid-cols-1 md:grid-cols-[auto,1fr] items-center gap-4">
										<label htmlFor="marca" className="text-sm text-zinc-600">
											Elegir Marcas
										</label>
										<select
											id="marca"
											name="marca"
											className="w-full border border-zinc-200 rounded-md px-3 py-2 text-sm focus:outline-none font-normal placeholder:font-normal text-zinc-600"
											onChange={handleMarcaChange}
											value={selectedMarca}
										>
											<option value="" disabled>
												Elegir Marcas
											</option>
											{Object.entries(brands).map(([key, value]) => (
												<option
													key={key}
													value={key}
													className="font-normal text-zinc-600"
												>
													{value}
												</option>
											))}
										</select>
									</div>

									{selectedMarca && selectedMarca !== "" && (
										<motion.div
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ duration: 0.2 }}
											className="grid grid-cols-1 md:grid-cols-[auto,1fr] items-center gap-4"
										>
											<label htmlFor="modelo" className="text-sm text-zinc-600">
												Elegir Modelos
											</label>
											<select
												id="modelo"
												name="modelo"
												className="w-full border border-zinc-200 rounded-md px-3 py-2 text-sm focus:outline-none font-normal placeholder:font-light text-zinc-600"
												onChange={handleModeloChange}
												value={selectedModelo}
											>
												<option value="" disabled>
													Elegir Modelos
												</option>
												{selectedMarca in vehicles &&
													Object.entries(vehicles[selectedMarca]).map(
														([key, model]) => (
															<option
																key={key}
																value={key}
																className="font-normal text-zinc-600"
															>
																{model.nombre}
															</option>
														)
													)}
											</select>
										</motion.div>
									)}
								</div>
								{productInfo.length > 0 && (
									<motion.div
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										className="mt-12"
									>
										<div className="flex items-center gap-2">
											<p className="text-sm font-normal text-zinc-600 mb-4">
												El vehiculo es compatible con los siguientes cilindros:{" "}
											</p>
											{productInfo.map((producto, index) => (
												<p
													key={index}
													className="text-sm font-normal text-zinc-600 mb-4"
												>
													{producto.code}{index < productInfo.length - 1 ? ',' : '.'}
												</p>
											))}
										</div>

										<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-8">
											{productInfo.map((producto, index) => (
												<motion.div
													initial={{ opacity: 0, y: 20 }}
													animate={{ opacity: 1, y: 0 }}
													transition={{
														delay: index * 0.1,
														type: "spring",
														damping: 20,
													}}
													key={index}
													onClick={() => handleCardClick(producto)}
													className="group bg-gradient-to-b from-white/80 to-white/40 backdrop-blur-sm rounded-3xl overflow-hidden 
                                                    hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 border hover:border-zinc-300 
                                                    cursor-pointer relative hover:-translate-y-1 hover:scale-[1.01]"
												>
													{/* Add a dark overlay that appears on hover */}
													<div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300" />

													<div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
														<span className="flex items-center gap-1 bg-zinc-800 text-white font-light text-sm px-4 py-1 rounded-full">
															Calculadora{" "}
															<ArrowRight
																strokeWidth={1.75}
																className="w-4 h-4"
															/>
														</span>
													</div>

													<div className="flex flex-col h-full relative">
														<div
															className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
                                                            bg-gradient-to-t from-zinc-100/50 to-transparent pointer-events-none"
														/>
														{/* Nombre del producto */}
														<div className="px-6 pt-6 text-center">
															<h3 className="text-sm mb-2 font-light text-zinc-700 bg-zinc-200/70 rounded-full px-4 py-1 w-fit mx-auto">
																{producto.code}
															</h3>
															<h4 className="text-lg font-light text-zinc-700">
																{producto.nombre}
															</h4>

															{/* Grid de badges */}
															<div className="flex flex-wrap justify-center gap-2 mt-2">
																{/* Tipo de Cuna */}
																{selectedVehicle?.cradle_type && (
																	<div className="flex flex-col items-center px-3 py-1 rounded-full bg-zinc-100/80 text-sm text-zinc-600">
																		<span className="mr-2">Tipo de Cuna:</span>
																		{selectedVehicle.cradle_type} 🔧
																	</div>
																)}
																{producto["kilometros-equivalentes"] && (
																	<div
																		className="flex flex-col items-center px-3 py-1 rounded-full bg-white/80 
                                                                backdrop-blur-sm text-sm text-zinc-600 shadow-sm"
																	>
																		<span className="mr-2">
																			Km. Equivalente:
																		</span>
																		{producto["kilometros-equivalentes"]} km 🛣️
																	</div>
																)}
																{/* Autonomía */}
																<div className="flex flex-col items-center px-3 py-1 rounded-full bg-zinc-100/80 text-sm text-zinc-600">
																	<span className="mr-2">Autonomía:</span>
																	{producto.autonomia} ⛽
																</div>
															</div>
														</div>

														{/* Imagen Principal */}
														<div className="flex-1 flex items-center justify-center p-6">
															{!imageCache[producto["imagen-principal"]] && (
																<div className="w-6 h-6 border-[1.5px] border-zinc-200 border-t-zinc-400 rounded-full animate-spin" />
															)}
															<Image
																src={producto["imagen-principal"]}
																width={300}
																height={200}
																alt={producto.nombre}
																className={`w-auto max-h-[120px] object-contain transition-opacity duration-500 ${
																	imageCache[producto["imagen-principal"]]
																		? "opacity-100"
																		: "opacity-0"
																}`}
																loading="lazy"
																quality={50}
															/>
														</div>

														{/* Observaciones */}
														{selectedVehicle?.observations && (
															<motion.div
																initial={{ opacity: 0 }}
																animate={{ opacity: 1 }}
																className="text-center px-6 pb-6 pt-2 border-t border-zinc-100"
															>
																<p className="text-sm text-zinc-500 leading-relaxed font-normal">
																	{selectedVehicle.observations
																		.charAt(0)
																		.toUpperCase() +
																		selectedVehicle.observations.slice(1)}
																</p>
															</motion.div>
														)}
													</div>
												</motion.div>
											))}
										</div>
									</motion.div>
								)}

								{selectedVehicle &&
									selectedVehicle.vehicle_images &&
									selectedVehicle.vehicle_images.length > 0 &&
									(console.log("2"),
									(
										<motion.div
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											className="mt-8"
										>
											<h3 className="text-xl font-light text-zinc-800 mb-8">
												Imágenes de Instalación
											</h3>
											<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
												{selectedVehicle.vehicle_images
													.slice(0, 8)
													.map((image, index) => (
														<motion.div
															key={image.id}
															initial={{ opacity: 0 }}
															animate={{ opacity: 1 }}
															transition={{ delay: index * 0.05 }}
															className="group relative aspect-video rounded-lg overflow-hidden bg-zinc-50"
														>
															{!imageCache[image.url] && (
																<div className="absolute inset-0 flex items-center justify-center">
																	<div className="w-6 h-6 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin" />
																</div>
															)}
															<Image
																src={image.url}
																alt={`Instalación ${index + 1}`}
																width={400}
																height={300}
																className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
																	imageCache[image.url]
																		? "opacity-100"
																		: "opacity-0"
																}`}
																onLoad={() => {
																	setImageCache((prev) => ({
																		...prev,
																		[image.url]: true,
																	}));
																}}
																quality={60}
																loading={index < 4 ? "eager" : "lazy"}
															/>
															<div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
														</motion.div>
													))}
											</div>
										</motion.div>
									))}
							</div>
						</CardContent>
					</Card>
				</motion.div>
			</motion.main>
		</div>
	);
}
