"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { useState, useEffect } from "react";
import ToastNotification from "@/components/ToastNotification";

export default function EquipmentDetailsCard({
	formData,
	handleInputChange,
	handleSubmit,
	comanda,
	showToast,
	setShowToast,
	camposClaveVacios,
}) {
	const [numTarjetas, setNumTarjetas] = useState(1);
	const [numCilindros, setNumCilindros] = useState(1);
	const [numValvulas, setNumValvulas] = useState(1);

	const bordeClase = camposClaveVacios
		? "bg-white border-none"
		: "bg-white border-none";

	useEffect(() => {
		let count = 1;
		for (let i = 1; i <= 4; i++) {
			if (
				formData[`cilindro_${i}_cod`] ||
				formData[`cilindro_${i}_numero`] ||
				formData[`valvula_${i}_cod`] ||
				formData[`valvula_${i}_numero`]
			) {
				count = i;
			}
		}
		setNumCilindros(count);
		setNumValvulas(count);
	}, [formData]);

	return (
		<Card className={`rounded-xl shadow-lg ${bordeClase} `}>
			<CardHeader className="relative">
				<div className="flex items-center gap-4 w-full justify-between">
					<CardTitle className="text-xl font-light text-zinc-800">
						Detalles del Equipo
					</CardTitle>
				</div>
			</CardHeader>
			<CardContent className="px-6 pt-6 pb-6">
				<form
					onSubmit={(e) => handleSubmit(e, comanda.id)}
					className="grid grid-cols-2 gap-6 text-sm"
				>
					<div className="flex flex-col items-start gap-2">
						<dt className="font-normal text-zinc-600">Reductor COD:</dt>
						<Input
							className="rounded-full focus-visible:ring-0"
							type="text"
							required
							value={formData.reductor_cod}
							onChange={(e) =>
								handleInputChange("reductor_cod", e.target.value)
							}
						/>
					</div>
					<div className="flex flex-col items-start gap-2">
						<dt className="font-normal text-zinc-600">Reductor N°</dt>
						<Input
							className="rounded-full focus-visible:ring-0"
							value={formData.reductor_numero || ""}
							required
							onChange={(e) =>
								handleInputChange("reductor_numero", e.target.value)
							}
						/>
					</div>

					{/* Cilindros y Válvulas */}
					<AnimatePresence mode="popLayout">
						{[...Array(Math.max(numCilindros, numValvulas))].map((_, index) => (
							<motion.div
								key={index}
								initial={{ opacity: 0, y: -20 }}
								animate={{
									opacity: 1,
									y: 0,
									transition: {
										type: "spring",
										stiffness: 300,
										damping: 25,
									},
								}}
								exit={{
									opacity: 0,
									y: -20,
									transition: {
										duration: 0.2,
									},
								}}
								className="col-span-2 grid grid-cols-2 gap-6 relative"
							>
								{/* Cilindro */}
								{index < numCilindros && (
									<div className="flex flex-col items-start gap-2">
										<dt className="font-normal text-zinc-600">
											Cilindro {index + 1} COD:
										</dt>
										<Input
											className="rounded-full focus-visible:ring-0"
											value={formData[`cilindro_${index + 1}_cod`] || ""}
											onChange={(e) =>
												handleInputChange(
													`cilindro_${index + 1}_cod`,
													e.target.value
												)
											}
										/>
										<dt className="font-normal text-zinc-600">
											Cilindro {index + 1} N°
										</dt>
										<Input
											className="rounded-full focus-visible:ring-0"
											value={formData[`cilindro_${index + 1}_numero`] || ""}
											onChange={(e) =>
												handleInputChange(
													`cilindro_${index + 1}_numero`,
													e.target.value
												)
											}
										/>
									</div>
								)}

								{/* Válvula */}
								{index < numValvulas && (
									<div className="flex flex-col items-start gap-2">
										<dt className="font-normal text-zinc-600">
											Válvula {index + 1} COD:
										</dt>
										<Input
											className="rounded-full focus-visible:ring-0"
											value={formData[`valvula_${index + 1}_cod`] || ""}
											onChange={(e) =>
												handleInputChange(
													`valvula_${index + 1}_cod`,
													e.target.value
												)
											}
										/>
										<dt className="font-normal text-zinc-600">
											Válvula {index + 1} N°
										</dt>
										<Input
											className="rounded-full focus-visible:ring-0"
											value={formData[`valvula_${index + 1}_numero`] || ""}
											onChange={(e) =>
												handleInputChange(
													`valvula_${index + 1}_numero`,
													e.target.value
												)
											}
										/>
									</div>
								)}

								{/* Remove Button */}
								{index > 0 && (
									<Button
										type="button"
										onClick={() => {
											setNumCilindros((prev) =>
												index < prev ? prev - 1 : prev
											);
											setNumValvulas((prev) =>
												index < prev ? prev - 1 : prev
											);
										}}
										className="absolute -top-3 right-0 flex items-center gap-2 font-normal rounded-full text-red-400 hover:text-red-600 hover:bg-transparent hover:scale-105 hover:rotate-6"
										variant="ghost"
									>
										<Minus strokeWidth={2.5} className="h-4 w-4" />
									</Button>
								)}
							</motion.div>
						))}
					</AnimatePresence>
					{numCilindros < 4 && numValvulas < 4 && (
						<Button
							type="button"
							onClick={() => {
								setNumCilindros((prev) => prev + 1);
								setNumValvulas((prev) => prev + 1);
							}}
							className="mt-2 col-span-2 flex items-center gap-2 text-zinc-600 font-normal"
							variant="outline"
						>
							<Plus className="h-4 w-4" />
							Agregar Cilindro y Válvula
						</Button>
					)}

					<div className="flex flex-col items-start gap-2">
						<dt className="font-normal text-zinc-600">Reforma Escape:</dt>
						<Input
							className="rounded-full focus-visible:ring-0"
							value={formData.reforma_escape_texto || ""}
							onChange={(e) =>
								handleInputChange("reforma_escape_texto", e.target.value)
							}
						/>
					</div>
					<div className="flex flex-col items-start gap-2 my-6">
						<label className="font-normal text-zinc-600 flex items-center gap-2">
							<span>Carga Externa:</span>
							<Input
								type="checkbox"
								className="rounded h-4 w-4 text-blue-500 focus:ring-blue-500"
								checked={formData.carga_externa}
								onChange={(e) =>
									handleInputChange("carga_externa", e.target.checked)
								}
							/>
						</label>
					</div>
					<div className="flex flex-col items-start gap-2">
						<dt className="font-normal text-zinc-600">Precio Carga Externa:</dt>
						<Input
							className="rounded-full focus-visible:ring-0"
							value={formData.precio_carga_externa || ""}
							onChange={(e) =>
								handleInputChange("precio_carga_externa", e.target.value)
							}
						/>
					</div>
					<div className="flex flex-col items-start gap-2">
						<dt className="font-normal text-zinc-600">Cuna:</dt>
						<Input
							className="rounded-full focus-visible:ring-0"
							value={formData.cuna || ""}
							onChange={(e) => handleInputChange("cuna", e.target.value)}
						/>
					</div>
					<div className="flex h-full flex-col items-start gap-2">
						<dt className="font-normal text-zinc-600">Materiales:</dt>
						<Textarea
							className="h-full w-full rounded-xl align-top focus-visible:ring-0"
							value={formData.materiales || ""}
							onChange={(e) => handleInputChange("materiales", e.target.value)}
						/>
					</div>

					{/* Other form fields remain unchanged */}
				</form>
				<ToastNotification
					message={showToast}
					show={!!showToast}
					onClose={() => setShowToast("")}
					type={showToast.includes("Error") ? "error" : "success"}
				/>
			</CardContent>
			<CardHeader className="relative">
				<div className="flex items-center gap-4 w-full justify-between">
					<CardTitle className="text-xl font-light text-zinc-800">
						Pagos
					</CardTitle>
				</div>
			</CardHeader>
			<CardContent>
				<form
					onSubmit={(e) => handleSubmit(e, comanda.id)}
					className="grid grid-cols-2 gap-6 text-sm"
				>
					<div className="flex flex-col items-start gap-2">
						<dt className="font-normal text-zinc-600">
							Monto en Efectivo o Transferencia:
						</dt>
						<Input
							className="rounded-full focus-visible:ring-0"
							value={formData.pagos_efectivo_transferencia || ""}
							onChange={(e) =>
								handleInputChange(
									"pagos_efectivo_transferencia",
									e.target.value
								)
							}
						/>
						<div className="flex flex-col items-start gap-2 w-full">
							<dt className="font-normal text-zinc-600">Dolares:</dt>
							<Input
								className="rounded-full focus-visible:ring-0"
								value={formData.pagos_dolares || ""}
								onChange={(e) =>
									handleInputChange("pagos_dolares", e.target.value)
								}
							/>
						</div>
					</div>

					<AnimatePresence mode="popLayout">
						{[...Array(numTarjetas)].map((_, index) => (
							<motion.div
								key={index}
								initial={{ opacity: 0, y: -20 }}
								animate={{
									opacity: 1,
									y: 0,
									transition: {
										type: "spring",
										stiffness: 300,
										damping: 25,
									},
								}}
								exit={{
									opacity: 0,
									y: -20,
									transition: {
										duration: 0.2,
									},
								}}
								className="flex flex-col items-start gap-2 w-full"
							>
								<div className="flex justify-between w-full relative">
									<dt className="font-normal text-zinc-600">
										Tarjeta N° {index + 1}:
									</dt>
									<Button
										type="button"
										onClick={() => setNumTarjetas((prev) => prev - 1)}
										className="absolute -top-3 right-0 flex items-center gap-2 font-normal rounded-full text-red-400 hover:text-red-600 hover:bg-transparent hover:scale-105 hover:rotate-6 p-2"
										variant="ghost"
									>
										<Minus strokeWidth={2.5} className="h-4 w-4" />
									</Button>
								</div>
								<Input
									className="rounded-full focus-visible:ring-0"
									value={formData[`pagos_tarjeta_${index + 1}`] || ""}
									onChange={(e) =>
										handleInputChange(
											`pagos_tarjeta_${index + 1}`,
											e.target.value
										)
									}
								/>
								<dt className="font-normal text-zinc-600">
									Plan Tarjeta N° {index + 1}:
								</dt>
								<Input
									className="rounded-full focus-visible:ring-0"
									value={formData[`pagos_plan_tarjeta_${index + 1}`] || ""}
									onChange={(e) =>
										handleInputChange(
											`pagos_plan_tarjeta_${index + 1}`,
											e.target.value
										)
									}
								/>
							</motion.div>
						))}
					</AnimatePresence>
					{numTarjetas < 5 && (
						<Button
							type="button"
							onClick={() => setNumTarjetas((prev) => prev + 1)}
							className="mt-2 flex items-center gap-2 text-zinc-600 font-normal"
							variant="outline"
						>
							<Plus className="h-4 w-4" />
							Agregar Tarjeta
						</Button>
					)}

					{camposClaveVacios ? (
						<>
							<div className="flex items-center gap-4 col-start-2 col-end-3 justify-self-end self-end w-fit">
								<span className="text-sm text-zinc-600">
									Complete los datos en la comanda.
								</span>
							</div>
						</>
					) : (
						<>
							<div className="flex items-center gap-4 col-start-2 col-end-3 justify-self-end self-end w-fit">
								<span className="text-sm text-zinc-600">
									Revisar y modificar si es necesario.
								</span>
							</div>
						</>
					)}
				</form>
				<ToastNotification
					message={showToast}
					show={!!showToast}
					onClose={() => setShowToast("")}
					type={showToast.includes("Error") ? "error" : "success"}
				/>
			</CardContent>
		</Card>
	);
}
