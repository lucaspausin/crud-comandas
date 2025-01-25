"use client";
import { useState, useEffect } from "react";
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
						setSelectedSupport(support);
					}
				}
			} catch (error) {
				console.error("Error fetching supports:", error);
			}
		};

		fetchSupports();
	}, [searchParams]);

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

	const handleSupportSelect = (support) => {
		setSelectedSupport(support);

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

	// Objeto con los planes de pago y sus intereses
	const paymentPlans = {
		debit: { interest: 1.13, installments: 1, label: "Débito" },
		onePayment: { interest: 1.23, installments: 1, label: "1 Pago" },
		threePayments: { interest: 1.75, installments: 3, label: "3 Pagos" },
		sixPayments: { interest: 1.92, installments: 6, label: "6 Pagos" },
		simpleThree: { interest: 1.18, installments: 3, label: "Cuota Simple 3" },
		simpleSix: { interest: 1.25, installments: 6, label: "Cuota Simple 6" },
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
							<select
								value={selectedPrice}
								onChange={(e) => setSelectedPrice(e.target.value)}
								className="w-full border border-zinc-200 rounded-md px-2 py-2.5 text-sm focus:outline-none  bg-white/50 text-zinc-900 placeholder:text-zinc-600 transition-all duration-200"
							>
								<option value="initial">Precio Inicial</option>
								<option value="list">Precio de Lista</option>
								<option value="promo">Precio Promocional</option>
							</select>
							<div className="grid grid-cols-3 md:grid-cols-8 gap-2">
								{supports.map((support) => (
									<div
										key={support.id}
										onClick={() => handleSupportSelect(support)}
										className={`cursor-pointer p-2.5 rounded-md text-sm border ${
											selectedSupport?.id === support.id
												? isBRC
													? "border hover:border-red-100 border-red-200 bg-zinc-50 text-red-500"
													: "border hover:border-blue-100 border-blue-200 bg-blue-50 text-blue-500"
												: "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300"
										} transition-colors`}
									>
										{support.code}
									</div>
								))}
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
													initial={{ opacity: 0 }}
													animate={{ opacity: 1 }}
													transition={{ delay: index * 0.1 }}
													key={key}
													className={`p-4 rounded-md space-y-2 border transition-colors ${
														isBRC
															? "bg-zinc-50 border-red-100 hover:border-red-200"
															: "bg-zinc-50 border-blue-100 hover:border-blue-200"
													}`}
												>
													<h4
														className={`font-normal ${
															isBRC ? "text-red-700" : "text-blue-700"
														}`}
													>
														{plan.label}
													</h4>
													<div className="space-y-1 text-sm">
														<p
															className={
																isBRC ? "text-red-600/70" : "text-blue-600/70"
															}
														>
															Cuota:{" "}
															<span className="font-medium">
																ARS ${payment.installmentAmount}
															</span>
														</p>
														<p
															className={
																isBRC ? "text-red-600/70" : "text-blue-600/70"
															}
														>
															Total:{" "}
															<span className="font-medium">
																ARS ${payment.totalAmount}
															</span>
														</p>
													</div>
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
