import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRef, useEffect } from "react";
// import Link from "next/link";
import { Button } from "@/components/ui/button";
import SignaturePad from "react-signature-canvas";

export default function CheckListForm({
	checkData,
	handleInputChange,
	handleSubmit,
}) {
	const sigPad = useRef(null);

	useEffect(() => {
		if (checkData.firma_tecnico && sigPad.current) {
			try {
				// Construir el data URL completo
				const dataUrl = `data:image/png;base64,${checkData.firma_tecnico}`;
				const img = new Image();
				img.onload = () => {
					const canvas = sigPad.current.getCanvas();
					const ctx = canvas.getContext("2d");
					ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpiar canvas primero
					ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
				};
				img.src = dataUrl;
			} catch (error) {
				console.error("Error al cargar la firma:", error);
			}
		}
	}, [checkData.firma_tecnico]);

	// Agregar un useEffect para ajustar el tamaño del canvas
	useEffect(() => {
		if (sigPad.current) {
			const canvas = sigPad.current.getCanvas();
			// const ratio = Math.max(window.devicePixelRatio || 1, 1);
			canvas.width = canvas.offsetWidth; // No escalar el ancho
			canvas.height = canvas.offsetHeight; // No escalar la altura
			canvas.getContext("2d").scale(1, 1); // No escalar el contexto
		}
	}, []);

	const handleClearSignature = () => {
		if (sigPad.current) {
			sigPad.current.clear();
			handleInputChange("firma_tecnico", ""); // Limpiar también el valor en checkData
		}
	};

	const handleEndStroke = () => {
		if (sigPad.current && !sigPad.current.isEmpty()) {
			try {
				const canvas = sigPad.current.getCanvas();
				const firmaBase64 = canvas.toDataURL("image/png").split(",")[1]; // No escalar la firma
				handleInputChange("firma_tecnico", firmaBase64);
			} catch (error) {
				console.error("Error al guardar la firma:", error);
			}
		}
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
					<dl className="grid grid-cols-2 gap-6 text-sm">
						<div className="flex flex-row items-start gap-2">
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
									handleInputChange("perdidas_gas", e.target.checked)
								}
							/>
						</div>
						<div className="flex flex-row items-start gap-2">
							<label htmlFor="cableado" className="font-normal text-zinc-500">
								Cableado:
							</label>
							<Input
								id="cableado"
								type="checkbox"
								checked={checkData.cableado}
								className="h-4 w-4"
								onChange={(e) =>
									handleInputChange("cableado", e.target.checked)
								}
							/>
						</div>
						<div className="flex flex-row items-start gap-2">
							<label htmlFor="nivel_agua" className="font-normal text-zinc-500">
								Nivel de Agua:
							</label>
							<Input
								id="nivel_agua"
								type="checkbox"
								checked={checkData.nivel_agua}
								className="h-4 w-4"
								onChange={(e) =>
									handleInputChange("nivel_agua", e.target.checked)
								}
							/>
						</div>
						<div className="flex flex-row items-start gap-2">
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
									handleInputChange("nivel_aceite", e.target.checked)
								}
							/>
						</div>
						<div className="flex flex-row items-start gap-2">
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
									handleInputChange("inspeccion_instalacion", e.target.checked)
								}
							/>
						</div>
						<div className="flex flex-row items-start gap-2">
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
									handleInputChange("funcionamiento_unidad", e.target.checked)
								}
							/>
						</div>
						<div className="flex flex-row items-start gap-2">
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
									handleInputChange("herramientas", e.target.checked)
								}
							/>
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
						<div className="border-none rounded-lg bg-white">
							<SignaturePad
								ref={sigPad}
								onEnd={handleEndStroke}
								canvasProps={{
									className: "w-full h-40 border rounded-lg",
									style: {
										width: "100%",
										height: "160px",
										maxWidth: "500px",
										touchAction: "none",
									},
								}}
								options={{
									minWidth: 1,
									maxWidth: 2,
									penColor: "black",
									backgroundColor: "rgb(255, 255, 255)",
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
					<div className="flex items-center gap-4 col-start-2 mt-12 col-end-3 justify-self-end self-end w-fit ">
						<Button
							variant="default"
							size="sm"
							className="rounded-full text-sm font-normal py-[1.15rem] px-[1.25rem] inline-flex gap-2"
							onClick={(e) => {
								e.stopPropagation();
							}}
						>
							Agregar
						</Button>
					</div>
				</CardContent>
			</form>
		</Card>
	);
}
