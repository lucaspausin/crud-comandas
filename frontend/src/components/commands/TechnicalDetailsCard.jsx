import { useState } from "react";
import VehicleViewerReadOnly from "@/components/3D/VehicleViewerReadOnly";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

export default function TechnicalDetailsCard({ comanda }) {
	const [selectedPoint, setSelectedPoint] = useState(null);

	// Extraemos los detalles técnicos de la comanda
	const detallesTecnicos = comanda?.tecnica_tecnica_comanda_idTocomandas || {};

	const handlePointSelect = (point) => {
		setSelectedPoint(point);
	};

	// Verificamos si los campos específicos están vacíos
	const hasEmptyValues =
		!detallesTecnicos.marca_vehiculo &&
		!detallesTecnicos.modelo &&
		!detallesTecnicos.anio_fabricacion &&
		!detallesTecnicos.patente;

	if (hasEmptyValues) {
		return (
			<Card className="border-none shadow-lg rounded-lg h-full col-span-2">
				<CardHeader>
					<CardTitle className="text-xl font-light">
						Detalles Técnicos
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col items-start justify-start">
						<p className="text-sm text-zinc-600 pb-24">
							No hay información de los detalles técnicos disponibles.
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<>
			<Card className="col-span-2 border-none shadow-lg rounded-lg">
				<CardHeader className="p-6">
					<CardTitle className="text-xl font-light text-zinc-800">
						Inspección del Vehículo
					</CardTitle>
				</CardHeader>
				<CardContent className="py-0 px-6">
					<dl className="grid grid-cols-4 gap-2 text-sm">
						<dt className="font-normal text-zinc-600 mb-1">
							Marca del Vehículo:
						</dt>
						<dd className="text-zinc-800">
							{detallesTecnicos.marca_vehiculo || "N/A"}
						</dd>
						<dt className="font-normal text-zinc-600 mb-1">
							Modelo del Vehículo:
						</dt>
						<dd className="text-zinc-800">
							{detallesTecnicos.modelo || "N/A"}
						</dd>
						<dt className="font-normal text-zinc-600 mb-1">
							Patente del Vehículo:
						</dt>
						<dd className="text-zinc-800">
							{detallesTecnicos.patente || "N/A"}
						</dd>
						<dt className="font-normal text-zinc-600 mb-1">Dominio:</dt>
						<dd className="text-zinc-800">
							{detallesTecnicos.dominio || "N/A"}
						</dd>
						<dt className="font-normal text-zinc-600 mb-1">Color:</dt>
						<dd className="text-zinc-800">{detallesTecnicos.color || "N/A"}</dd>
						<dt className="font-normal text-zinc-600 mb-1">Año:</dt>
						<dd className="text-zinc-800">
							{detallesTecnicos.anio_fabricacion || "N/A"}
						</dd>
						<dt className="font-normal text-zinc-600 mb-1">
							Observaciones Personales:
						</dt>
						<dd className="text-zinc-800">
							{detallesTecnicos.observaciones_personales || "N/A"}
						</dd>

						<dt className="font-normal text-zinc-600 mb-1">
							Observaciones Técnicas:
						</dt>
						<dd className="text-zinc-800">
							{detallesTecnicos.observaciones_tecnicas || "N/A"}
						</dd>
					</dl>
				</CardContent>
				<CardContent className="col-span-2 border-none rounded-lg p-6">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 col-span-2 rounded-lg border">
						<div className="col-span-1">
							<VehicleViewerReadOnly
								onPointSelect={handlePointSelect}
								pointsData={detallesTecnicos}
							/>
						</div>
						<div className="col-span-1 bg-zinc-50 p-4 rounded-lg">
							{selectedPoint ? (
								<div className="space-y-4">
									<h3 className="text-lg font-normal text-zinc-600">
										{selectedPoint.label}
									</h3>
									<div className="space-y-2">
										<p className="font-normal text-zinc-600 text-sm">
											Condición:
										</p>
										<p className="text-md text-zinc-800">
											{detallesTecnicos[`detalle${selectedPoint.id}`]?.split(
												"`"
											)[0] || "Sin detalles"}
										</p>

										{detallesTecnicos[`detalle${selectedPoint.id}`]?.split(
											"`"
										)[1] && (
											<>
												<p className="font-normal text-zinc-600 text-sm">
													Observaciones:
												</p>
												<p className="text-md text-zinc-800">
													{
														detallesTecnicos[
															`detalle${selectedPoint.id}`
														].split("`")[1]
													}
												</p>
											</>
										)}
									</div>
								</div>
							) : (
								<div className="flex items-center text-sm justify-center font-normal h-full text-zinc-600">
									Selecciona un punto en el modelo 3D para ver los detalles.
								</div>
							)}
						</div>
					</div>
				</CardContent>
				<CardContent>
					<dl className="grid grid-cols-[auto,auto,auto,auto] lg:grid-cols-4 gap-2 text-sm">
						{Object.keys(detallesTecnicos)
							.filter(
								(key) => key.startsWith("detalle") && !isNaN(key.slice(7))
							)
							.filter(
								(key) =>
									detallesTecnicos[key] !== null && detallesTecnicos[key] !== ""
							)
							.filter((key, index) => index < 20)
							.map((key) => (
								<div key={key} className="contents">
									<dt className="text-zinc-600 font-normal">
										Detalle {key.slice(7)}:
									</dt>
									<dd>{detallesTecnicos[key]}</dd>
								</div>
							))}
						<dt className="font-normal text-zinc-600 mb-2">
							Firma del Cliente:
						</dt>
						{detallesTecnicos.firma && (
							<Image
								src={`data:image/png;base64,${detallesTecnicos.firma}`}
								alt="Firma"
								width={300}
								height={100}
								className="border-none rounded-lg"
							/>
						)}
					</dl>
				</CardContent>
			</Card>
		</>
	);
}
