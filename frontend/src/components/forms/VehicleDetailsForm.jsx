import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useRef, useEffect, lazy } from "react";
import { Button } from "@/components/ui/button";
// import SignaturePad from "react-signature-canvas";
import SignaturePad from "signature_pad";
import LegalText from "@/components/LegalText";

// Lazy load the Vehicle3DViewer component
const Vehicle3DViewer = lazy(() => import("../3D/VehicleViewer.jsx"));

export default function VehicleDetailsForm({
	formData,
	handleInputChange,
	handleSubmit,
}) {
	const [selectedPoint, setSelectedPoint] = useState(null);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const suggestionsRef = useRef(null);
	const [isVisible, setIsVisible] = useState(false); // State to track visibility

	const canvasRef = useRef(null);
	const signaturePadRef = useRef(null);

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
			handleInputChange("firma", "");
		}
	};

	const handleEndStroke = () => {
		if (signaturePadRef.current) {
			try {
				const firmaBase64 = signaturePadRef.current
					.toDataURL("image/png")
					.split(",")[1];
				handleInputChange("firma", firmaBase64);
			} catch (error) {
				console.error("Error al guardar la firma:", error);
			}
		}
	};

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				suggestionsRef.current &&
				!suggestionsRef.current.contains(event.target)
			) {
				setShowSuggestions(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const condicionesOptions = [
		"Sin daños",
		"Pintura Faltante",
		"Rayón superficial",
		"Rayón Profundo",
		"Marca de Granizo",
		"Abolladura leve",
	];

	const handlePointSelect = (point) => {
		setSelectedPoint(point);
	};

	// Intersection Observer to track visibility of Vehicle3DViewer
	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setIsVisible(true); // Set to true when visible
					} else {
						setIsVisible(false); // Set to false when not visible
					}
				});
			},
			{ threshold: 0.1 } // Trigger when 10% of the component is visible
		);

		const target = document.getElementById("vehicle-3d-viewer");
		if (target) {
			observer.observe(target);
		}

		return () => {
			if (target) {
				observer.unobserve(target);
			}
		};
	}, []);

	return (
		<Card className="rounded-xl shadow-lg border-none">
			<form onSubmit={handleSubmit} className="rounded-xl">
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
								value={formData.marca_vehiculo || ""}
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
								value={formData.modelo || ""}
								onChange={(e) => handleInputChange("modelo", e.target.value)}
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
								value={formData.patente || ""}
								onChange={(e) => handleInputChange("patente", e.target.value)}
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
								value={formData.observaciones_personales || ""}
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
							Firma del Cliente
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
				</CardContent>
				<CardHeader>
					<CardTitle className="text-xl font-light text-zinc-800">
						Inspección del Vehículo
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 lg:grid-cols-2 border rounded-lg">
						<div className="col-span-1" id="vehicle-3d-viewer">
							{isVisible && ( // Load Vehicle3DViewer only when visible
								<Vehicle3DViewer
									onPointSelect={handlePointSelect}
									pointsWithData={Object.keys(formData).reduce((acc, key) => {
										if (key.startsWith("detalle") && formData[key]) {
											const pointId = parseInt(key.replace("detalle", ""));
											acc[pointId] = true;
										}
										return acc;
									}, {})}
								/>
							)}
						</div>
						<div className="col-span-1 bg-zinc-50 p-4 rounded-lg">
							{selectedPoint ? (
								<div className="space-y-4">
									<h3 className="text-lg font-normal">{selectedPoint.label}</h3>

									<div className="space-y-4">
										<div>
											<Label className="font-normal text-zinc-600">
												Condición
											</Label>
											<div className="relative w-full" ref={suggestionsRef}>
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
											<Label className="font-normal text-zinc-600">
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
								<div className="flex items-center justify-center h-full font-normal text-zinc-600 text-sm">
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
							value={formData.observaciones_tecnicas || ""}
							onChange={(e) => {
								handleInputChange("observaciones_tecnicas", e.target.value);
							}}
						/>
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
