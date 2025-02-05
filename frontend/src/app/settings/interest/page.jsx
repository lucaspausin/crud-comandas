"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Aside from "@/components/Aside";
import api from "@/lib/axios";
import { Plus, Edit, Trash2 } from "lucide-react";
import HomeIcon from "@/components/HomeIcon";

export default function InterestSettings() {
	const [paymentPlans, setPaymentPlans] = useState([]);
	const [newPlan, setNewPlan] = useState({
		name: "",
		interest: "",
		installments: 1,
		active: true,
	});
	const [editingPlan, setEditingPlan] = useState(null);
	const [successMessage, setSuccessMessage] = useState("");
	const [errorMessage, setErrorMessage] = useState("");

	useEffect(() => {
		const fetchPaymentPlans = async () => {
			try {
				const response = await api.get("/api/payment-plans");
				setPaymentPlans(response.data);
			} catch (error) {
				console.error("Error fetching payment plans:", error);
				setErrorMessage(
					"No se pudieron cargar los planes. Por favor, intenta nuevamente más tarde."
				);
				setTimeout(() => setErrorMessage(""), 2000);
			}
		};
		fetchPaymentPlans();
	}, []);

	const handleAddPlan = async (e) => {
		e.preventDefault();
		try {
			const response = await api.post("/api/payment-plans", newPlan);
			setPaymentPlans([...paymentPlans, response.data]);
			setNewPlan({
				name: "",
				interest: "",
				installments: 1,
				active: true,
			});
			setSuccessMessage("El plan se ha agregado con éxito.");
			setTimeout(() => setSuccessMessage(""), 2000);
		} catch (error) {
			console.error("Error adding payment plan:", error);
			setErrorMessage(
				"Hubo un problema al intentar agregar el plan. Por favor, inténtalo de nuevo."
			);
			setTimeout(() => setErrorMessage(""), 2000);
		}
	};

	const handleUpdatePlan = async (e) => {
		e.preventDefault();
		try {
			const response = await api.patch(
				`/api/payment-plans/${editingPlan.id}`,
				editingPlan
			);
			setPaymentPlans(
				paymentPlans.map((plan) =>
					plan.id === editingPlan.id ? response.data : plan
				)
			);
			setEditingPlan(null);
			setSuccessMessage("El plan se ha actualizado con éxito.");
			setTimeout(() => setSuccessMessage(""), 2000);
		} catch (error) {
			console.error("Error updating payment plan:", error);
			setErrorMessage("Ocurrió un error al intentar actualizar el plan.");
			setTimeout(() => setErrorMessage(""), 2000);
		}
	};

	const handleDeletePlan = async (planId) => {
		try {
			await api.delete(`/api/payment-plans/${planId}`);
			setPaymentPlans(paymentPlans.filter((plan) => plan.id !== planId));
			setSuccessMessage("El plan ha sido eliminado con éxito.");
			setTimeout(() => setSuccessMessage(""), 2000);
		} catch (error) {
			console.error("Error deleting payment plan:", error);
			setErrorMessage("Ocurrió un error al intentar eliminar el plan.");
			setTimeout(() => setErrorMessage(""), 2000);
		}
	};

	return (
		<div className="flex-1 bg-zinc-50">
			<Aside />
			<motion.main
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className="flex-1 p-6 lg:px-8 xl:px-8 mt-12 overflow-y-auto"
			>
				<HomeIcon />
				<div className="space-y-6">
					<div className="rounded-xl h-fit bg-white/50 backdrop-blur-sm p-6 shadow-xl">
						<div className="p-8 pt-0 space-y-8 rounded-xl bg-white/50 backdrop-blur-sm mt-8">
							<div className="mb-6">
								<h2 className="text-2xl font-light text-zinc-900">
									Gestión de Planes de Pago
								</h2>
								<p className="text-zinc-600 text-sm mt-1">
									Administra los planes de pago y sus intereses.
								</p>
							</div>

							<form
								onSubmit={editingPlan ? handleUpdatePlan : handleAddPlan}
								className="grid grid-cols-1 md:grid-cols-2 gap-4"
							>
								<div className="flex flex-col gap-2 w-full col-span-2">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-2">
											<label className="text-sm font-normal text-zinc-700">
												Nombre
											</label>
											<input
												type="text"
												value={editingPlan ? editingPlan.name : newPlan.name}
												onChange={(e) =>
													editingPlan
														? setEditingPlan({
																...editingPlan,
																name: e.target.value,
															})
														: setNewPlan({ ...newPlan, name: e.target.value })
												}
												className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-200 bg-white/50 text-zinc-900 placeholder:text-zinc-600"
												placeholder="Nombre del plan (ej: 3 Pagos)"
												required
											/>
										</div>
										<div className="space-y-2">
											<label className="text-sm font-normal text-zinc-700">
												Interés
											</label>
											<input
												type="number"
												step="0.01"
												value={
													editingPlan ? editingPlan.interest : newPlan.interest
												}
												onChange={(e) =>
													editingPlan
														? setEditingPlan({
																...editingPlan,
																interest: e.target.value,
															})
														: setNewPlan({
																...newPlan,
																interest: e.target.value,
															})
												}
												className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-200 bg-white/50 text-zinc-900 placeholder:text-zinc-600"
												placeholder="Factor de interés (ej: 1.75)"
												required
											/>
										</div>
										<div className="space-y-2">
											<label className="text-sm font-normal text-zinc-700">
												Cuotas
											</label>
											<input
												type="number"
												value={
													editingPlan
														? editingPlan.installments
														: newPlan.installments
												}
												onChange={(e) =>
													editingPlan
														? setEditingPlan({
																...editingPlan,
																installments: parseInt(e.target.value),
															})
														: setNewPlan({
																...newPlan,
																installments: parseInt(e.target.value),
															})
												}
												className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-200 bg-white/50 text-zinc-900 placeholder:text-zinc-600"
												placeholder="Número de cuotas"
												required
												min="1"
											/>
										</div>
									</div>
								</div>

								<motion.div
									className="flex items-center gap-2 col-span-2 w-full"
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -20 }}
									transition={{
										duration: 0.3,
										ease: "easeInOut",
									}}
									key={editingPlan ? "editing" : "adding"}
								>
									<motion.button
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: 0.1 }}
										type="submit"
										className="flex items-center justify-center gap-1 px-4 py-2.5 rounded-sm bg-zinc-900 text-white hover:bg-zinc-800 transition-colors duration-200 w-full font-normal text-sm"
									>
										<Plus className="w-4 h-4" />
										{editingPlan ? "Actualizar" : "Agregar"}
									</motion.button>
									{editingPlan && (
										<motion.button
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											exit={{ opacity: 0, x: 20 }}
											transition={{
												duration: 0.2,
												ease: "easeOut",
											}}
											type="button"
											onClick={() => setEditingPlan(null)}
											className="px-4 py-2.5 rounded-sm border border-zinc-200 text-zinc-700 hover:bg-zinc-100 transition-colors duration-200 w-full font-normal text-sm"
										>
											Cancelar
										</motion.button>
									)}
								</motion.div>

								<AnimatePresence mode="wait">
									{successMessage && (
										<motion.div
											className="col-span-2 mt-4"
											initial={{ opacity: 0, y: -10 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: 10 }}
											transition={{ duration: 0.3 }}
										>
											<motion.p
												className="text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 flex items-center justify-center"
												initial={{ scale: 0.95 }}
												animate={{ scale: 1 }}
												exit={{ scale: 0.95 }}
											>
												{successMessage}
											</motion.p>
										</motion.div>
									)}
									{errorMessage && (
										<motion.div
											className="col-span-2 mt-4"
											initial={{ opacity: 0, y: -10 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: 10 }}
											transition={{ duration: 0.3 }}
										>
											<motion.p
												className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center justify-center"
												initial={{ scale: 0.95 }}
												animate={{ scale: 1 }}
												exit={{ scale: 0.95 }}
											>
												{errorMessage}
											</motion.p>
										</motion.div>
									)}
								</AnimatePresence>
							</form>

							<div className="pt-6 border-t border-zinc-200">
								<h3 className="text-xl font-light text-zinc-900 mb-4">
									Planes Existentes
								</h3>
								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
								>
									{paymentPlans.map((plan) => (
										<motion.div
											key={plan.id}
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											className="group bg-white/50 backdrop-blur-sm border border-zinc-200 rounded-lg p-4 hover:border-zinc-300 transition-all duration-200"
										>
											<div className="flex justify-between items-start">
												<div>
													<p className="text-sm font-medium text-zinc-900">
														{plan.name}
													</p>

													<div className="mt-2 space-y-1">
														<p className="text-xs text-zinc-600">
															Tasa de Interés:{" "}
															<span className="font-medium">
																{((Number(plan.interest) - 1) * 100).toFixed(0)}
																%
															</span>{" "}
															(
															<span className="text-zinc-500">
																{plan.interest}
															</span>
															)
														</p>
														<p className="text-xs text-zinc-600">
															Cuotas:{" "}
															<span className="font-medium">
																{plan.installments}
															</span>
														</p>
													</div>
												</div>
												<div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
													<button
														onClick={() => setEditingPlan(plan)}
														className="p-1.5 rounded-md text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
													>
														<Edit className="w-4 h-4" />
													</button>
													<button
														onClick={() => handleDeletePlan(plan.id)}
														className="p-1.5 rounded-md text-zinc-600 hover:text-red-600 hover:bg-red-50 transition-colors"
													>
														<Trash2 className="w-4 h-4" />
													</button>
												</div>
											</div>
										</motion.div>
									))}
								</motion.div>
							</div>
						</div>
					</div>
				</div>
			</motion.main>
		</div>
	);
}
