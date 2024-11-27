import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import SignaturePad from "signature_pad";
import { motion } from "framer-motion";

export default function CheckListForm({
	checkData,
	handleInputChange,
	handleSubmit,
}) {
	const canvasRef = useRef(null);
	const signaturePadRef = useRef(null);
	const [expandedTextareas, setExpandedTextareas] = useState({});

	useEffect(() => {
		if (canvasRef.current && !signaturePadRef.current) {
			const canvas = canvasRef.current;
			const ratio = Math.max(window.devicePixelRatio || 1, 1);
			canvas.width = canvas.offsetWidth * ratio;
			canvas.height = canvas.offsetHeight * ratio;
			canvas.getContext("2d").scale(ratio, ratio);

			signaturePadRef.current = new SignaturePad(canvas, {
				minWidth: 1,
				maxWidth: 2,
				penColor: "black",
				backgroundColor: "rgb(255, 255, 255)",
			});
		}
	}, []);

	const handleClearSignature = () => {
		if (signaturePadRef.current) {
			signaturePadRef.current.clear();
			handleInputChange("firma_tecnico", "");
		}
	};

	const handleEndStroke = () => {
		if (signaturePadRef.current) {
			try {
				const firmaBase64 = signaturePadRef.current
					.toDataURL("image/png")
					.split(",")[1];
				handleInputChange("firma_tecnico", firmaBase64);
			} catch (error) {
				console.error("Error al guardar la firma:", error);
			}
		}
	};

	const handleCheckboxChange = (field, checked) => {
		handleInputChange(field, checked);
		setExpandedTextareas((prev) => ({
			...prev,
			[field]: checked,
		}));
	};

	return (
		<Card className="rounded-xl shadow-lg border-none">
			<form onSubmit={handleSubmit} className="rounded-xl">
				<CardHeader>
					<CardTitle className="text-xl font-light text-zinc-800">
						CheckList
					</CardTitle>
				</CardHeader>
				<CardContent className="pb-0">
					<dl className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-sm">
						<div className="flex flex-col items-start gap-2">
							<div className="flex flex-row items-center gap-2">
								<label
									htmlFor="perdidas_gas"
									className="font-normal text-zinc-500"
								>
									Pérdidas de Gas:
								</label>
								<Input
									id="perdidas_gas"
									type="checkbox"
									checked={checkData.perdidas_gas}
									className="h-4 w-4"
									onChange={(e) =>
										handleCheckboxChange("perdidas_gas", e.target.checked)
									}
								/>
							</div>
							<motion.div
								initial={{ height: 0, opacity: 0 }}
								animate={{
									height: expandedTextareas.perdidas_gas ? "auto" : 0,
									opacity: expandedTextareas.perdidas_gas ? 1 : 0,
								}}
								transition={{ duration: 0.3 }}
								className="overflow-hidden w-full"
							>
								<Textarea
									className="h-20 focus-visible:ring-0"
									value={checkData.perdidas_gas_adicional || ""}
									onChange={(e) =>
										handleInputChange("perdidas_gas_adicional", e.target.value)
									}
									placeholder="Notas adicionales"
								/>
							</motion.div>
						</div>
						<div className="flex flex-col items-start gap-2">
							<div className="flex flex-row items-center gap-2">
								<label htmlFor="cableado" className="font-normal text-zinc-500">
									Cableado:
								</label>
								<Input
									id="cableado"
									type="checkbox"
									checked={checkData.cableado}
									className="h-4 w-4"
									onChange={(e) =>
										handleCheckboxChange("cableado", e.target.checked)
									}
								/>
							</div>
							<motion.div
								initial={{ height: 0, opacity: 0 }}
								animate={{
									height: expandedTextareas.cableado ? "auto" : 0,
									opacity: expandedTextareas.cableado ? 1 : 0,
								}}
								transition={{ duration: 0.3 }}
								className="overflow-hidden w-full"
							>
								<Textarea
									className="h-20 focus-visible:ring-0"
									value={checkData.cableado_adicional || ""}
									onChange={(e) =>
										handleInputChange("cableado_adicional", e.target.value)
									}
									placeholder="Notas adicionales"
								/>
							</motion.div>
						</div>
						<div className="flex flex-col items-start gap-2">
							<div className="flex flex-row items-center gap-2">
								<label
									htmlFor="nivel_agua"
									className="font-normal text-zinc-500 truncate"
								>
									Nivel de Agua:
								</label>
								<Input
									id="nivel_agua"
									type="checkbox"
									checked={checkData.nivel_agua}
									className="h-4 w-4"
									onChange={(e) =>
										handleCheckboxChange("nivel_agua", e.target.checked)
									}
								/>
							</div>
							<motion.div
								initial={{ height: 0, opacity: 0 }}
								animate={{
									height: expandedTextareas.nivel_agua ? "auto" : 0,
									opacity: expandedTextareas.nivel_agua ? 1 : 0,
								}}
								transition={{ duration: 0.3 }}
								className="overflow-hidden w-full"
							>
								<Textarea
									className="h-20 focus-visible:ring-0"
									value={checkData.nivel_agua_adicional || ""}
									onChange={(e) =>
										handleInputChange("nivel_agua_adicional", e.target.value)
									}
									placeholder="Notas adicionales"
								/>
							</motion.div>
						</div>
						<div className="flex flex-col items-start gap-2">
							<div className="flex flex-row items-center gap-2">
								<label
									htmlFor="nivel_aceite"
									className="font-normal text-zinc-500"
								>
									Nivel de Aceite:
								</label>
								<Input
									id="nivel_aceite"
									type="checkbox"
									checked={checkData.nivel_aceite}
									className="h-4 w-4"
									onChange={(e) =>
										handleCheckboxChange("nivel_aceite", e.target.checked)
									}
								/>
							</div>
							<motion.div
								initial={{ height: 0, opacity: 0 }}
								animate={{
									height: expandedTextareas.nivel_aceite ? "auto" : 0,
									opacity: expandedTextareas.nivel_aceite ? 1 : 0,
								}}
								transition={{ duration: 0.3 }}
								className="overflow-hidden w-full"
							>
								<Textarea
									className="h-20 focus-visible:ring-0"
									value={checkData.nivel_aceite_adicional || ""}
									onChange={(e) =>
										handleInputChange("nivel_aceite_adicional", e.target.value)
									}
									placeholder="Notas adicionales"
								/>
							</motion.div>
						</div>
						<div className="flex flex-col items-start gap-2">
							<div className="flex flex-row items-center gap-2">
								<label
									htmlFor="inspeccion_instalacion"
									className="font-normal text-zinc-500"
								>
									Inspección de Instalación:
								</label>
								<Input
									id="inspeccion_instalacion"
									type="checkbox"
									checked={checkData.inspeccion_instalacion}
									className="h-4 w-4"
									onChange={(e) =>
										handleCheckboxChange(
											"inspeccion_instalacion",
											e.target.checked
										)
									}
								/>
							</div>
							<motion.div
								initial={{ height: 0, opacity: 0 }}
								animate={{
									height: expandedTextareas.inspeccion_instalacion ? "auto" : 0,
									opacity: expandedTextareas.inspeccion_instalacion ? 1 : 0,
								}}
								transition={{ duration: 0.3 }}
								className="overflow-hidden w-full"
							>
								<Textarea
									className="h-20 focus-visible:ring-0"
									value={checkData.inspeccion_instalacion_adicional || ""}
									onChange={(e) =>
										handleInputChange(
											"inspeccion_instalacion_adicional",
											e.target.value
										)
									}
									placeholder="Notas adicionales"
								/>
							</motion.div>
						</div>
						<div className="flex flex-col items-start gap-2">
							<div className="flex flex-row items-center gap-2">
								<label
									htmlFor="funcionamiento_unidad"
									className="font-normal text-zinc-500"
								>
									Funcionamiento de Unidad:
								</label>
								<Input
									id="funcionamiento_unidad"
									type="checkbox"
									checked={checkData.funcionamiento_unidad}
									className="h-4 w-4"
									onChange={(e) =>
										handleCheckboxChange(
											"funcionamiento_unidad",
											e.target.checked
										)
									}
								/>
							</div>
							<motion.div
								initial={{ height: 0, opacity: 0 }}
								animate={{
									height: expandedTextareas.funcionamiento_unidad ? "auto" : 0,
									opacity: expandedTextareas.funcionamiento_unidad ? 1 : 0,
								}}
								transition={{ duration: 0.3 }}
								className="overflow-hidden w-full"
							>
								<Textarea
									className="h-20 focus-visible:ring-0"
									value={checkData.funcionamiento_unidad_adicional || ""}
									onChange={(e) =>
										handleInputChange(
											"funcionamiento_unidad_adicional",
											e.target.value
										)
									}
									placeholder="Notas adicionales"
								/>
							</motion.div>
						</div>
						<div className="flex flex-col items-start gap-2">
							<div className="flex flex-row items-center gap-2">
								<label
									htmlFor="herramientas"
									className="font-normal text-zinc-500"
								>
									Herramientas:
								</label>
								<Input
									id="herramientas"
									type="checkbox"
									checked={checkData.herramientas}
									className="h-4 w-4"
									onChange={(e) =>
										handleCheckboxChange("herramientas", e.target.checked)
									}
								/>
							</div>
							<motion.div
								initial={{ height: 0, opacity: 0 }}
								animate={{
									height: expandedTextareas.herramientas ? "auto" : 0,
									opacity: expandedTextareas.herramientas ? 1 : 0,
								}}
								transition={{ duration: 0.3 }}
								className="overflow-hidden"
							>
								<Textarea
									className="h-20 focus-visible:ring-0"
									value={checkData.herramientas_adicional || ""}
									onChange={(e) =>
										handleInputChange("herramientas_adicional", e.target.value)
									}
									placeholder="Notas adicionales"
								/>
							</motion.div>
						</div>
						<div className="flex flex-col gap-4 col-span-full">
							<dt className="font-normal text-zinc-500">Kilometros:</dt>
							<Input
								className="rounded-sm bg-white focus-visible:ring-0"
								type="text"
								required
								value={checkData.kilometros || ""}
								onChange={(e) =>
									handleInputChange("kilometros", e.target.value)
								}
							/>
						</div>
					</dl>
				</CardContent>

				<CardContent className="mt-6">
					<dl className="grid grid-cols-2 gap-6 text-sm">
						<div className="flex flex-row items-start gap-2">
							<label
								htmlFor="falla_encendido"
								className="font-normal text-zinc-500"
							>
								Falla de Encendido:
							</label>
							<Input
								id="falla_encendido"
								type="checkbox"
								checked={checkData.falla_encendido}
								className="h-4 w-4"
								onChange={(e) =>
									handleInputChange("falla_encendido", e.target.checked)
								}
							/>
						</div>
						<div className="flex flex-row items-start gap-2">
							<label htmlFor="luz_check" className="font-normal text-zinc-500">
								Luz del Check:
							</label>
							<Input
								id="luz_check"
								type="checkbox"
								checked={checkData.luz_check}
								className="h-4 w-4"
								onChange={(e) =>
									handleInputChange("luz_check", e.target.checked)
								}
							/>
						</div>
						<div className="flex flex-row items-start gap-2">
							<label
								htmlFor="vehiculo_fuera_punto"
								className="font-normal text-zinc-500"
							>
								Vehículo Fuera de Punto:
							</label>
							<Input
								id="vehiculo_fuera_punto"
								type="checkbox"
								checked={checkData.vehiculo_fuera_punto}
								className="h-4 w-4"
								onChange={(e) =>
									handleInputChange("vehiculo_fuera_punto", e.target.checked)
								}
							/>
						</div>
						<div className="flex flex-row items-start gap-2">
							<label
								htmlFor="arreglo_reciente"
								className="font-normal text-zinc-500"
							>
								Arreglo Reciente:
							</label>
							<Input
								id="arreglo_reciente"
								type="checkbox"
								checked={checkData.arreglo_reciente}
								className="h-4 w-4"
								onChange={(e) =>
									handleInputChange("arreglo_reciente", e.target.checked)
								}
							/>
						</div>
						<div className="mb-4 flex flex-col gap-4 col-span-full">
							<Label
								htmlFor="otras_observaciones"
								className="font-normal text-zinc-500 "
							>
								Otras Observaciones
							</Label>
							<Textarea
								className="h-32 focus-visible:ring-0"
								value={checkData.otras_observaciones || ""}
								id="otras_observaciones"
								name="otras_observaciones"
								onChange={(e) => {
									handleInputChange("otras_observaciones", e.target.value);
								}}
							/>
						</div>
					</dl>
				</CardContent>

				<CardContent className="mt-6">
					<div className="mb-4 flex flex-col gap-4 col-span-full border-none">
						<Label
							htmlFor="firma_tecnico"
							className="font-normal text-zinc-500"
						>
							Firma del Técnico
						</Label>
						<div className="border-none rounded-lg bg-white w-[275px] h-[160px]">
							<canvas
								ref={canvasRef}
								onMouseUp={handleEndStroke}
								onTouchEnd={handleEndStroke}
								className="border rounded-lg"
								style={{
									width: "100%",
									height: "160px",
									touchAction: "none",
								}}
							/>
							<div className="flex gap-2 mt-4">
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={handleClearSignature}
								>
									Limpiar
								</Button>
							</div>
						</div>
					</div>
					<div className="flex items-center gap-4 col-start-2 mt-20 col-end-3 justify-self-end self-end w-full">
						<Button
							variant="default"
							size="sm"
							className="rounded-sm w-full text-sm font-normal py-[1.15rem] px-[1.25rem] inline-flex gap-2"
							onClick={(e) => {
								e.stopPropagation();
							}}
						>
							Guardar Cambios
						</Button>
					</div>
				</CardContent>
			</form>
		</Card>
	);
}
