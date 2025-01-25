"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Aside from "@/components/Aside";
// import HomeIcon from "@/components/HomeIcon";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import api from "@/lib/axios";
import myImage from "@/public/motorgas2.svg";
// import { useRouter } from "next/navigation";

export default function Catalogue() {
	const [brands, setBrands] = useState({});
	const [vehicles, setVehicles] = useState({});
	const [supports, setSupports] = useState({});
	const [selectedMarca, setSelectedMarca] = useState("");
	const [selectedModelo, setSelectedModelo] = useState("");
	const [productInfo, setProductInfo] = useState([]);
	const [loading, setLoading] = useState(true);
	const [imageCache, setImageCache] = useState({});
	const [loadingImages, setLoadingImages] = useState(true);
	// const router = useRouter();

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
						nombre: vehicle.name,
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
			setLoadingImages(true);
			try {
				const imageUrls = Object.values(supports)
					.map((support) => support["imagen-principal"])
					.filter((url) => url); // Filtrar URLs vacías
				await Promise.all(imageUrls.map(preloadImage));
			} catch (error) {
				console.error("Error precargando imágenes:", error);
			}
			setLoadingImages(false);
		};

		if (Object.keys(supports).length > 0) {
			preloadAllImages();
		}
	}, [supports]);

	const handleMarcaChange = (event) => {
		setSelectedMarca(event.target.value);
		setSelectedModelo("");
		setProductInfo([]);
	};

	const handleModeloChange = async (event) => {
		const modeloSeleccionado = event.target.value;
		setSelectedModelo(modeloSeleccionado);

		if (vehicles[selectedMarca]?.[modeloSeleccionado]) {
			const vehicleData = vehicles[selectedMarca][modeloSeleccionado];
			const productos = vehicleData.productos;
			const infoProductos = productos
				.map((producto) => supports[producto])
				.filter(Boolean);
			setProductInfo(infoProductos);
		}
	};

	// const handleCardClick = (support) => {
		
	// 	const params = new URLSearchParams({
	// 		initial_price_brc: support.initial_price_brc?.toString() || "0",
	// 		list_price_brc: support.list_price_brc?.toString() || "0",
	// 		promo_price_brc: support.promo_price_brc?.toString() || "0",
	// 		initial_price_ta: support.initial_price_ta?.toString() || "0",
	// 		list_price_ta: support.list_price_ta?.toString() || "0",
	// 		promo_price_ta: support.promo_price_ta?.toString() || "0",
	// 		support_name: support.nombre,
	// 		support_code: support.code,
	// 	});

	// 	router.push(`/calculator?${params.toString()}`);
	// };

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
											{selectedMarca in vehicles &&
												Object.entries(vehicles[selectedMarca]).map(
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
										className="mt-12 "
									>
										<div className="flex justify-between items-center mb-4 ">
											{loadingImages && (
												<span className="text-sm text-zinc-500 flex items-center gap-2">
													<svg
														className="w-4 h-4 animate-spin"
														xmlns="http://www.w3.org/2000/svg"
														fill="none"
														viewBox="0 0 24 24"
													>
														<circle
															className="opacity-25"
															cx="12"
															cy="12"
															r="10"
															stroke="currentColor"
															strokeWidth="4"
														></circle>
														<path
															className="opacity-75"
															fill="currentColor"
															d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
														></path>
													</svg>
													Cargando imágenes...
												</span>
											)}
										</div>
										<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 ">
											{productInfo.map((producto, index) => (
												<motion.div
													initial={{ opacity: 0 }}
													animate={{ opacity: 1 }}
													transition={{ delay: index * 0.1 }}
													key={index}
													// onClick={() => handleCardClick(producto)}
													className="relative text-center flex flex-col p-4 rounded-md border bg-zinc-50 hover:bg-zinc-100 transition-all duration-300 cursor-pointer"
												>
													<div className="aspect-[3/1] flex items-center justify-center mb-4 relative">
														{!imageCache[producto["imagen-principal"]] && (
															<div className="absolute inset-0 flex items-center justify-center bg-zinc-100 animate-pulse rounded-md">
																<svg
																	className="w-8 h-8 text-zinc-400 animate-spin"
																	xmlns="http://www.w3.org/2000/svg"
																	fill="none"
																	viewBox="0 0 24 24"
																>
																	<circle
																		className="opacity-25"
																		cx="12"
																		cy="12"
																		r="10"
																		stroke="currentColor"
																		strokeWidth="4"
																	></circle>
																	<path
																		className="opacity-75"
																		fill="currentColor"
																		d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
																	></path>
																</svg>
															</div>
														)}
														<Image
															src={producto["imagen-principal"]}
															width={250}
															height={250}
															alt={producto.nombre}
															className={`w-[300px] h-full object-cover transition-opacity duration-300 ${
																imageCache[producto["imagen-principal"]]
																	? "opacity-100"
																	: "opacity-0"
															}`}
															loading="eager"
															priority
															onLoad={() => {
																setImageCache((prev) => ({
																	...prev,
																	[producto["imagen-principal"]]: true,
																}));
															}}
														/>
													</div>
													<div className="flex-1 text-white pt-4 p-8">
														<h4 className="text-zinc-800 text-base font-normal mb-3">
															{producto.nombre}
														</h4>
														<div className="space-y-2 text-sm text-zinc-600 ">
															<p className="my-2">
																Autonomía equivalente: {producto.autonomia}
															</p>

															{vehicles[selectedMarca][selectedModelo][
																"sugerencias-ventas"
															] && (
																<p>
																	Sugerencias de venta:{" "}
																	{
																		vehicles[selectedMarca][selectedModelo][
																			"sugerencias-ventas"
																		]
																	}
																</p>
															)}
															{vehicles[selectedMarca][selectedModelo][
																"tipo-cuna-disponible"
															] && (
																<p>
																	Tipo de cuna disponible:{" "}
																	{
																		vehicles[selectedMarca][selectedModelo][
																			"tipo-cuna-disponible"
																		]
																	}
																</p>
															)}
															{vehicles[selectedMarca][selectedModelo]
																.observaciones && (
																<p className="h-fit">
																	<span className="">Observaciones:</span>{" "}
																	{
																		vehicles[selectedMarca][selectedModelo]
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
