"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Aside from "@/components/Aside";
import HomeIcon from "@/components/HomeIcon";
import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";

export default function Calculator() {
	const [listPrice, setListPrice] = useState(0);
	const [downPayment, setDownPayment] = useState(0);

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
		const baseAmount = price - downPayment;
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
				className="flex-1 p-6 overflow-y-auto"
			>
				<div className="flex items-center mb-8">
					<HomeIcon label="Volver" />
					<h2 className="text-zinc-700 text-base">Calculadora de Cuotas</h2>
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
									Calculadora De Cuotas
								</CardTitle>
							</div>
						</CardHeader>
						<CardContent className="pt-6">
							<div className="space-y-6">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div className="space-y-4">
										<label className="text-sm text-zinc-600">
											Precio de lista
										</label>
										<Input
											type="number"
											value={listPrice}
											onChange={(e) => setListPrice(Number(e.target.value))}
											placeholder="Ingrese el precio de lista"
											className="w-full"
										/>
									</div>
									<div className="space-y-4">
										<label className="text-sm text-zinc-600">
											Seña o Anticipo
										</label>
										<Input
											type="number"
											value={downPayment}
											onChange={(e) => setDownPayment(Number(e.target.value))}
											placeholder="Ingrese seña o anticipo"
											className="w-full"
										/>
									</div>
								</div>

								<div className="mt-8">
									<h3 className="text-sm text-zinc-600 mb-4">
										Planes de pago disponibles
									</h3>
									<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
										{Object.entries(paymentPlans).map(([key, plan], index) => {
											const payment = calculatePayment(listPrice, plan);
											return (
												<motion.div
													initial={{ opacity: 0 }}
													animate={{ opacity: 1 }}
													transition={{ delay: index * 0.1 }}
													key={key}
													className="bg-zinc-50/50 p-4 rounded-md border space-y-2"
												>
													<h4 className="font-medium text-zinc-800">
														{plan.label}
													</h4>
													<div className="space-y-1 text-sm text-zinc-600">
														<p>
															Cuota:{" "}
															<span className="font-medium">
																ARS {payment.installmentAmount}
															</span>
														</p>
														<p>
															Total:{" "}
															<span className="font-medium">
																ARS {payment.totalAmount}
															</span>
														</p>
														{/* <p className="text-xs text-zinc-500">
															Interés: {((plan.interest - 1) * 100).toFixed(0)}%
														</p> */}
													</div>
												</motion.div>
											);
										})}
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</motion.div>
			</motion.main>
		</div>
	);
}
