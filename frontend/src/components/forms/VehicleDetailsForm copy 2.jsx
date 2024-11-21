import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useRef, useEffect } from "react";
// import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import ToastNotification from "@/components/ToastNotification";
import Vehicle3DViewer from "../3D/VehicleViewer.jsx";
import SignaturePad from "react-signature-canvas";
import LegalText from "@/components/LegalText";

// Importa las imágenes
// import myImage3 from "@/public/auto1.jpg";
// import myDetalle2 from "@/public/2.png";
// import myDetalle3 from "@/public/3.png";
// import myDetalle4 from "@/public/4.png";

export default function VehicleDetailsForm({
	formData,
	handleInputChange,
	handleSubmit,
	comanda,
	camposClaveVacios,
	showToast,
	setShowToast,
}) {
	const [selectedPoint, setSelectedPoint] = useState(null);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const sigPad = useRef(null);

	useEffect(() => {
		if (formData.firma && sigPad.current) {
			try {
				// Construir el data URL completo
				const dataUrl = `data:image/png;base64,${formData.firma}`;
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
	}, [formData.firma]);

	// Agregar un useEffect para ajustar el tamaño del canvas
	useEffect(() => {
		if (sigPad.current) {
			const canvas = sigPad.current.getCanvas();
			const ratio = Math.max(window.devicePixelRatio || 1, 1);
			canvas.width = canvas.offsetWidth * ratio;
			canvas.height = canvas.offsetHeight * ratio;
			canvas.getContext("2d").scale(ratio, ratio);
		}
	}, []);

	const condicionesOptions = [
		"Sin daños",
		"Rayón superficial",
		"Abolladura leve",
	];

	const handlePointSelect = (point) => {
		setSelectedPoint(point);
	};

	const handleClearSignature = () => {
		if (sigPad.current) {
			sigPad.current.clear();
			handleInputChange("firma", ""); // Limpiar también el valor en formData
		}
	};

	const handleEndStroke = () => {
		if (sigPad.current && !sigPad.current.isEmpty()) {
			try {
				const canvas = sigPad.current.getCanvas();
				const tempCanvas = document.createElement("canvas");
				const tempCtx = tempCanvas.getContext("2d");

				const originalWidth = canvas.width;
				const originalHeight = canvas.height;
				const aspectRatio = originalWidth / originalHeight;

				const targetWidth = 500;
				const targetHeight = targetWidth / aspectRatio;

				tempCanvas.width = targetWidth;
				tempCanvas.height = targetHeight;

				tempCtx.imageSmoothingEnabled = true;
				tempCtx.imageSmoothingQuality = "high";
				tempCtx.drawImage(canvas, 0, 0, targetWidth, targetHeight);

				const firmaBase64 = tempCanvas.toDataURL("image/png").split(",")[1];
				handleInputChange("firma", firmaBase64);
			} catch (error) {
				console.error("Error al guardar la firma:", error);
			}
		}
	};

	return (
		<Card className="rounded-t-xl rounded-b-none shadow-lg border-none">
			<form onSubmit={handleSubmit}>
				<CardHeader>
					<CardTitle className="text-xl font-light text-zinc-800">
						Detalles del Vehículo
					</CardTitle>
				</CardHeader>
				<CardContent className="pb-0">
					<dl className="grid grid-cols-2 gap-6 text-sm">
						<div className="flex flex-col items-start gap-2">
							<dt className="font-normal text-zinc-500">Marca del Vehículo:</dt>
							<Input
								className="rounded-full bg-white focus-visible:ring-0"
								type="text"
								required
								value={formData.marca_vehiculo}
								onChange={(e) =>
									handleInputChange("marca_vehiculo", e.target.value)
								}
							/>
						</div>
						<div className="flex flex-col items-start gap-2">
							<dt className="font-normal text-zinc-500">
								Modelo del Vehículo:
							</dt>
							<Input
								className="rounded-full bg-white focus-visible:ring-0"
								type="text"
								required
								value={formData.modelo}
								onChange={(e) => handleInputChange("modelo", e.target.value)}
							/>
						</div>
						<div className="flex flex-col items-start gap-2">
							<dt className="font-normal text-zinc-500">Año de Fabricación:</dt>
							<Input
								className="rounded-full bg-white focus-visible:ring-0"
								type="text"
								required
								value={formData.anio}
								onChange={(e) => handleInputChange("anio", e.target.value)}
							/>
						</div>
						<div className="flex flex-col items-start gap-2">
							<dt className="font-normal text-zinc-500">
								Patente del Vehículo:
							</dt>
							<Input
								className="rounded-full bg-white focus-visible:ring-0"
								type="text"
								required
								value={formData.patente}
								onChange={(e) => handleInputChange("patente", e.target.value)}
							/>
						</div>
						<div className="flex flex-col items-start gap-2">
							<dt className="font-normal text-zinc-500">
								Dominio del Vehículo:
							</dt>
							<Input
								className="rounded-full bg-white focus-visible:ring-0"
								type="text"
								required
								value={formData.dominio}
								onChange={(e) => handleInputChange("dominio", e.target.value)}
							/>
						</div>
						<div className="flex flex-col items-start gap-2">
							<dt className="font-normal text-zinc-500">Color del Vehículo:</dt>
							<Input
								className="rounded-full bg-white focus-visible:ring-0"
								type="text"
								required
								value={formData.color}
								onChange={(e) => handleInputChange("color", e.target.value)}
							/>
						</div>
						<div className="mb-4 flex flex-col gap-4 col-span-full">
							<Label
								htmlFor="observaciones_personales"
								className="font-normal text-zinc-500 "
							>
								Observaciones personales
							</Label>
							<Textarea
								className="h-32 focus-visible:ring-0"
								value={formData.observaciones_personales}
								id="observaciones_personales"
								name="observaciones_personales"
								onChange={(e) => {
									handleInputChange("observaciones_personales", e.target.value);
								}}
							/>
						</div>
					</dl>
				</CardContent>
				<LegalText
					fecha={formData.dia}
					mes={formData.mes}
					nombre={formData.propietario}
					dni={formData.dni}
					vehiculo={formData.marca_vehiculo}
					modelo={formData.modelo}
					anio={formData.anio}
					patente={formData.patente}
				/>
				<CardContent className="mt-6">
					<div className="mb-4 flex flex-col gap-4 col-span-full border-none">
						<Label htmlFor="firma" className="font-normal text-zinc-500">
							Firma
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
							<div className="flex gap-2 mt-2">
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
				</CardContent>
				<CardHeader>
					<CardTitle className="text-xl font-light text-zinc-800">
						Inspección del Vehículo
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 border rounded-lg">
						<div className="col-span-1">
							<Vehicle3DViewer onPointSelect={handlePointSelect} />
						</div>
						<div className="col-span-1 bg-zinc-50 p-4 rounded-lg">
							{selectedPoint ? (
								<div className="space-y-4">
									<h3 className="text-lg font-normal">{selectedPoint.label}</h3>

									<div className="space-y-4">
										<div>
											<Label className="font-normal">Condición</Label>
											<div className="relative w-full">
												<Input
													type="text"
													value={formData[`detalle${selectedPoint.id}`] || ""}
													onChange={(e) =>
														handleInputChange(
															`detalle${selectedPoint.id}`,
															e.target.value
														)
													}
													onFocus={() => setShowSuggestions(true)}
													placeholder="Selecciona la condición..."
													className="w-full rounded-md focus-visible:ring-0 px-2 py-[0.25rem] border-[#E4E4E7] border focus:outline placeholder:font-normal placeholder:text-zinc-500 text-sm"
												/>
												{showSuggestions && (
													<ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md max-h-60 overflow-auto">
														{condicionesOptions.map((opcion) => (
															<li
																key={opcion}
																onClick={() => {
																	handleInputChange(
																		`detalle${selectedPoint.id}`,
																		opcion
																	);
																	setShowSuggestions(false);
																}}
																className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
															>
																{opcion}
															</li>
														))}
													</ul>
												)}
											</div>
										</div>
										<div>
											<Label className="font-normal">
												Observaciones adicionales
											</Label>
											<Textarea
												value={
													formData[`detalle${selectedPoint.id}`]?.split(
														"`"
													)[1] || ""
												}
												onChange={(e) => {
													const condicion =
														formData[`detalle${selectedPoint.id}`]
															?.split("`")[0]
															?.trim() || "";
													const nuevaObservacion = e.target.value;

													if (condicion) {
														handleInputChange(
															`detalle${selectedPoint.id}`,
															nuevaObservacion
																? `${condicion} \`${nuevaObservacion}\``
																: condicion
														);
													}
												}}
												placeholder="Describe los detalles específicos..."
												className="h-24 focus-visible:ring-0"
											/>
										</div>
									</div>
								</div>
							) : (
								<div className="flex items-center justify-center h-full text-zinc-500">
									Selecciona un punto en el modelo 3D para agregar detalles.
								</div>
							)}
						</div>
					</div>
				</CardContent>

				<CardHeader className="relative">
					<div className="flex items-center gap-4 w-full justify-between">
						<CardTitle className="text-xl font-light text-zinc-800">
							Detalles del Equipo
						</CardTitle>
					</div>
				</CardHeader>
				<CardContent>
					<div className="mb-4 flex flex-col gap-4 col-span-full">
						<Label
							htmlFor="observaciones_tecnicas"
							className="font-normal text-zinc-500"
						>
							Observaciones tecnicas
						</Label>
						<Textarea
							id="observaciones_tecnicas"
							name="observaciones_tecnicas"
							className="h-32 focus-visible:ring-0"
							value={formData.observaciones_tecnicas}
							onChange={(e) => {
								handleInputChange("observaciones_tecnicas", e.target.value);
							}}
						/>
					</div>
					{/* <div className="mb-4 flex flex-col gap-4 col-span-full border-none">
						<Label htmlFor="firma" className="font-normal text-zinc-500">
							Firma
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
							<div className="flex gap-2 mt-2">
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
					</div> */}
					{camposClaveVacios ? (
						<>
							<div className="flex items-center gap-4 col-start-2 col-end-3 justify-self-end self-end w-fit ">
								<span className="text-sm text-red-600">
									Agrega datos a la comanda.
								</span>
								<Link href={`/commands/edit/${comanda.id}`}>
									<Button
										variant="ghost"
										size="sm"
										className="rounded-full py-[1.15rem] px-[1rem] text-red-600 bg-red-100 hover:bg-red-50 inline-flex gap-2"
										onClick={(e) => {
											e.stopPropagation();
										}}
									>
										<Pencil className="h-5 w-5 text-red-600" />
										Agregar
									</Button>
								</Link>
							</div>
						</>
					) : (
						<>
							<div className="flex items-center gap-4 col-start-2 col-end-3 justify-self-end self-end w-fit">
								<span className="text-sm text-green-600">
									Verificar, y editar si es necesario.
								</span>
								<Link href={`/commands/edit/${comanda.id}`}>
									<Button
										variant="ghost"
										size="sm"
										className="rounded-full py-[1.15rem] px-[1rem] text-green-600 bg-green-100 hover:bg-green-50 inline-flex gap-2"
										onClick={(e) => {
											e.stopPropagation();
										}}
									>
										<Pencil className="h-5 w-5 text-green-600" />
										Editar
									</Button>
								</Link>
							</div>
						</>
					)}
				</CardContent>
				<ToastNotification
					message={showToast}
					show={!!showToast}
					onClose={() => setShowToast("")}
					type={showToast.includes("Error") ? "error" : "success"}
				/>
			</form>
		</Card>
	);
}
