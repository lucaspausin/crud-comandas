"use client";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Ta from "@/public/ta.png";
import BRC from "@/public/brc.png";
import Aside from "@/components/Aside";
import HomeIcon from "@/components/HomeIcon";
import api from "@/lib/axios";

export default function Calculator() {
	const searchParams = useSearchParams();
	const [listPrice, setListPrice] = useState("");
	const [initialPrice, setInitialPrice] = useState("");
	const [promoPrice, setPromoPrice] = useState("");
	const [downPayment, setDownPayment] = useState("");
	const [isBRC, setIsBRC] = useState(true);
	// const [supportName, setSupportName] = useState("");
	const [selectedPrice, setSelectedPrice] = useState("list"); // "initial", "list", "promo"
	const [supports, setSupports] = useState([]);
	const [selectedSupport, setSelectedSupport] = useState(null);
	const [paymentPlans, setPaymentPlans] = useState({});
	const [selectedGeneration, setSelectedGeneration] = useState("");

	// Agregar array con los códigos de los supports más utilizados
	const topSupports = ["5ta-40l", "5ta-60l", "5ta-30lx2b"];

	// Envolver generations en useMemo
	const generations = useMemo(
		() => ["3ra-", "4ta-", "5ta-", "5taesp", "6ta-", "6taesp"],
		[]
	);

	useEffect(() => {
		// Cargar los soportes al montar el componente
		const fetchSupports = async () => {
			try {
				const response = await api.get("/api/support");
				setSupports(response.data);

				// Si hay un support_code en la URL, seleccionarlo
				const supportCode = searchParams.get("support_code");
				if (supportCode) {
					const support = response.data.find((s) => s.code === supportCode);
					if (support) {
						// Encontrar la generación correspondiente
						const generation = generations.find((gen) =>
							support.code.startsWith(gen)
						);
						if (generation) {
							setSelectedGeneration(generation);
						}
						setSelectedSupport(support);
					}
				}
			} catch (error) {
				console.error("Error fetching supports:", error);
			}
		};

		fetchSupports();
	}, [searchParams, generations]);

	useEffect(() => {
		// Si hay un soporte seleccionado, actualizar los precios según el modo BRC/TA
		if (selectedSupport) {
			if (isBRC) {
				setInitialPrice(selectedSupport.initial_price_brc || "");
				setListPrice(selectedSupport.list_price_brc || "");
				setPromoPrice(selectedSupport.promo_price_brc || "");
			} else {
				setInitialPrice(selectedSupport.initial_price_ta || "");
				setListPrice(selectedSupport.list_price_ta || "");
				setPromoPrice(selectedSupport.promo_price_ta || "");
			}
		} else {
			// Si no hay soporte seleccionado, usar los valores de la URL
			if (isBRC) {
				const initial = searchParams.get("initial_price_brc");
				const list = searchParams.get("list_price_brc");
				const promo = searchParams.get("promo_price_brc");

				setInitialPrice(initial || "");
				setListPrice(list || "");
				setPromoPrice(promo || "");
			} else {
				const initial = searchParams.get("initial_price_ta");
				const list = searchParams.get("list_price_ta");
				const promo = searchParams.get("promo_price_ta");

				setInitialPrice(initial || "");
				setListPrice(list || "");
				setPromoPrice(promo || "");
			}
		}
	}, [searchParams, isBRC, selectedSupport]);

	useEffect(() => {
		// Cargar los planes de pago al montar el componente
		const fetchPaymentPlans = async () => {
			try {
				const response = await api.get("/api/payment-plans");
				// Convertir el array de planes a un objeto con el formato requerido
				const plans = response.data.reduce((acc, plan) => {
					if (plan.active) {
						// Usar el ID como key si no hay code, o crear un key basado en el nombre
						const key = plan.name.toLowerCase().replace(/\s+/g, "");
						acc[key] = {
							interest: Number(plan.interest),
							installments: plan.installments,
							label: plan.name,
						};
					}
					return acc;
				}, {});
				setPaymentPlans(plans);
			} catch (error) {
				console.error("Error fetching payment plans:", error);
			}
		};

		fetchPaymentPlans();
	}, []);

	const handleSupportSelect = (support) => {
		// Si no hay soporte seleccionado, solo limpiamos los estados
		if (!support) {
			setSelectedSupport(null);
			setSelectedGeneration("");
			setInitialPrice("");
			setListPrice("");
			setPromoPrice("");
			return;
		}

		setSelectedSupport(support);

		// Actualizar la generación seleccionada basada en el código del soporte
		const generation = generations.find((gen) => support.code.startsWith(gen));
		if (generation) {
			setSelectedGeneration(generation);
		}

		// Actualizar precios según el modo actual
		if (isBRC) {
			setInitialPrice(support.initial_price_brc || "");
			setListPrice(support.list_price_brc || "");
			setPromoPrice(support.promo_price_brc || "");
		} else {
			setInitialPrice(support.initial_price_ta || "");
			setListPrice(support.list_price_ta || "");
			setPromoPrice(support.promo_price_ta || "");
		}
	};

	// Obtener el precio activo según la selección
	const getActivePrice = () => {
		switch (selectedPrice) {
			case "initial":
				return initialPrice === "" ? "" : initialPrice;
			case "promo":
				return promoPrice === "" ? "" : promoPrice;
			default:
				return listPrice === "" ? "" : listPrice;
		}
	};

	// Función para formatear números a formato de moneda argentina
	const formatCurrency = (number) => {
		return new Intl.NumberFormat("es-AR", {
			style: "decimal",
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(number);
	};

	// Función para calcular los pagos
	const calculatePayment = (price, plan) => {
		const numericPrice = Number(price) || 0;
		const numericDownPayment = Number(downPayment) || 0;
		const baseAmount = numericPrice - numericDownPayment;
		const totalAmount = baseAmount * plan.interest;
		const installmentAmount = totalAmount / plan.installments;

		return {
			installmentAmount: formatCurrency(installmentAmount),
			totalAmount: formatCurrency(totalAmount),
		};
	};

	// Función para agrupar los soportes por generación
	const getSupportsByGeneration = (generation) => {
		return supports.filter((support) => support.code.startsWith(generation));
	};

	// Función para manejar el cambio de generación
	const handleGenerationChange = (e) => {
		setSelectedGeneration(e.target.value);
		setSelectedSupport(null); // Reset selected support when generation changes
	};

	return (
		<div className="flex-1 bg-zinc-50">
			<Aside />
			<motion.main
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className="flex-1 p-6 lg:px-8 xl:px-8 overflow-y-auto"
			>
				<HomeIcon />
				<motion.div
					initial={{ y: 20 }}
					animate={{ y: 0 }}
					transition={{ duration: 0.4 }}
					className="space-y-6"
				>
					<div className="rounded-xl bg-white shadow-lg">
						<div className="p-6 flex flex-col gap-4">
							<div className="flex flex-row items-center justify-between w-full gap-4">
								<h2 className="text-xl font-light text-zinc-800">
									Calculadora De Cuotas
								</h2>
								{/* {supportName && (
										<p className="text-sm text-zinc-600 mt-1">{supportName}</p>
									)} */}
							</div>
							<div className="flex items-center justify-center space-x-4 border border-zinc-200 rounded-md">
								<div className="relative flex items-center gap-4 bg-zinc-100/50 rounded-md px-2.5">
									<motion.button
										onClick={() => setIsBRC(true)}
										className={`relative flex items-center justify-center h-12 w-12 rounded-lg transition-colors z-10 ${
											isBRC
												? "opacity-100"
												: "opacity-20 hover:opacity-50 grayscale"
										}`}
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
									>
										<Image
											src={BRC}
											alt="BRC"
											width={40}
											height={40}
											className="object-contain"
										/>
									</motion.button>
									<div className="h-8 w-px bg-zinc-300" /> {/* Separator */}
									<motion.button
										onClick={() => setIsBRC(false)}
										className={`relative flex items-center justify-center h-12 w-12 rounded-lg transition-colors z-10 ${
											!isBRC
												? "opacity-100"
												: "opacity-20 hover:opacity-50 grayscale"
										}`}
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
									>
										<Image
											src={Ta}
											alt="TA"
											width={40}
											height={40}
											className="object-contain"
										/>
									</motion.button>
								</div>
							</div>

							<div className="space-y-4">
								<motion.div
									className="space-y-2"
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.3 }}
								>
									<p className="text-sm font-normal text-zinc-600">
										Seleccionar Generación
									</p>
									<select
										value={selectedGeneration}
										onChange={handleGenerationChange}
										className="w-full border border-zinc-200 rounded-md px-2 py-2.5 text-sm focus:outline-none bg-white/50 text-zinc-600 placeholder:text-zinc-600 transition-all duration-200"
									>
										<option value="">Seleccionar generación</option>
										{generations.map((gen) => (
											<option key={gen} value={gen}>
												{gen.replace("-", "")} Generación
											</option>
										))}
									</select>

									{selectedGeneration && (
										<>
											<p className="text-sm font-normal text-zinc-600">
												Seleccionar Cilindro
											</p>
											<motion.select
												initial={{ opacity: 0, y: 5 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ duration: 0.2 }}
												value={selectedSupport?.id || ""}
												onChange={(e) => {
													const support = supports.find(
														(s) => s.id === Number(e.target.value)
													);
													handleSupportSelect(support);
												}}
												className="w-full border border-zinc-200 rounded-md px-2 py-2.5 text-sm focus:outline-none bg-white/50 text-zinc-600 placeholder:text-zinc-600 transition-all duration-200"
											>
												<option value="">Seleccionar soporte</option>
												{getSupportsByGeneration(selectedGeneration).map(
													(support) => (
														<option key={support.id} value={support.id}>
															{support.code}
														</option>
													)
												)}
											</motion.select>
										</>
									)}
								</motion.div>

								<motion.div
									className="space-y-2"
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.3, delay: 0.1 }}
								>
									<p className="text-sm font-normal text-zinc-600">
										Soportes más utilizados
									</p>
									<div className="flex flex-wrap gap-2">
										{supports
											.filter((support) => topSupports.includes(support.code))
											.map((support, index) => (
												<motion.div
													key={support.id}
													initial={{ opacity: 0, scale: 0.95 }}
													animate={{ opacity: 1, scale: 1 }}
													transition={{ duration: 0.2, delay: index * 0.05 }}
													whileHover={{ scale: 1.02 }}
													whileTap={{ scale: 0.98 }}
													onClick={() => handleSupportSelect(support)}
													className={`cursor-pointer p-2.5 rounded-md text-sm border ${
														selectedSupport?.id === support.id
															? isBRC
																? "border hover:border-red-100 border-red-200 "
																: "border hover:border-blue-100 border-blue-200 "
															: "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300"
													} transition-colors`}
												>
													{support.code}
												</motion.div>
											))}
									</div>
								</motion.div>

								<motion.select
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.3, delay: 0.2 }}
									value={selectedPrice}
									onChange={(e) => setSelectedPrice(e.target.value)}
									className="w-full border border-zinc-200 rounded-md px-2 py-2.5 text-sm focus:outline-none bg-white/50 text-zinc-600 placeholder:text-zinc-600 transition-all duration-200"
								>
									<option value="initial">Precio Inicial</option>
									<option value="list">Precio de Lista</option>
									<option value="promo">Precio Promocional</option>
								</motion.select>
							</div>
						</div>
						<div className="p-6 pt-0">
							<div className="space-y-6">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div className="space-y-4">
										<label className="text-lg font-light text-zinc-800">
											Precio (
											{selectedPrice === "initial"
												? "Inicial"
												: selectedPrice === "promo"
													? "Promocional"
													: "de Lista"}
											)
										</label>
										<input
											type="number"
											value={getActivePrice()}
											onChange={(e) => {
												const value = e.target.value;
												switch (selectedPrice) {
													case "initial":
														setInitialPrice(value);
														break;
													case "promo":
														setPromoPrice(value);
														break;
													default:
														setListPrice(value);
												}
											}}
											placeholder="Ingrese el precio"
											className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-200 bg-white/50 text-zinc-900 placeholder:text-zinc-600"
										/>
									</div>
									<div className="space-y-4">
										<label className="text-lg font-light text-zinc-800">
											Seña o Anticipo
										</label>
										<input
											type="number"
											value={downPayment}
											onChange={(e) => setDownPayment(e.target.value)}
											placeholder="Ingrese seña o anticipo"
											className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-200 bg-white/50 text-zinc-900 placeholder:text-zinc-600"
										/>
									</div>
								</div>

								<div className="mt-8">
									<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
										{Object.entries(paymentPlans).map(([key, plan], index) => {
											const payment = calculatePayment(getActivePrice(), plan);
											return (
												<motion.div
													key={`${key}-${isBRC}`}
													initial={{ opacity: 0 }}
													animate={{
														opacity: 1,
														rotateY: [-10, 0],
														scale: [0.95, 1],
													}}
													transition={{
														duration: 0.4,
														ease: "easeOut",
														delay: index * 0.1,
													}}
													style={{
														perspective: 1000,
														transformStyle: "preserve-3d",
													}}
													className={`p-4 rounded-md space-y-2 border  text-zinc-600 font-light transition-all duration-300 ${
														isBRC
															? "border-none shadow-sm hover:shadow-md"
															: "border-none shadow-sm hover:shadow-md"
													}`}
												>
													<motion.div
														animate={{
															rotateX: [-2, 0],
															y: [10, 0],
														}}
														transition={{
															duration: 0.4,
															ease: "easeOut",
															delay: index * 0.1,
														}}
													>
														<h4 className="font-normal">{plan.label}</h4>
														<div className="space-y-1 text-sm">
															<p>
																Cuota:{" "}
																<span className="font-medium">
																	ARS ${payment.installmentAmount}
																</span>
															</p>
															<p>
																Total:{" "}
																<span className="font-medium">
																	ARS ${payment.totalAmount}
																</span>
															</p>
														</div>
													</motion.div>
												</motion.div>
											);
										})}
									</div>
								</div>
							</div>
						</div>
					</div>
				</motion.div>
			</motion.main>
		</div>
	);
}
