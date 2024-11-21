import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const VehicleDetailsCard = ({ comanda }) => {
	const detallesVehiculo = comanda.tecnica_tecnica_comanda_idTocomandas || {};

	const hasEmptyValues = !detallesVehiculo.marca_vehiculo &&
		!detallesVehiculo.modelo &&
		!detallesVehiculo.anio_fabricacion &&
		!detallesVehiculo.patente &&
		!detallesVehiculo.dominio &&
		!detallesVehiculo.color &&
		!detallesVehiculo.anio;

	if (hasEmptyValues) {
		return (
			<Card className="border-none shadow-lg rounded-lg col-span-2 lg:col-span-1">
				<CardHeader>
					<CardTitle className="text-xl font-light">
						Detalles del Vehículo
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col items-start justify-start">
						<p className="text-sm text-zinc-600">
							No hay información del vehículo disponible.
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="border-none shadow-lg rounded-lg col-span-2 lg:col-span-1">
			<CardHeader>
				<CardTitle className="text-xl font-light text-zinc-800">
					Detalles del Vehículo
				</CardTitle>
			</CardHeader>
			<CardContent>
				<dl className="grid grid-cols-2 gap-2 text-sm">
					<dt className="font-normal text-zinc-600">Marca:</dt>
					<dd>{detallesVehiculo.marca_vehiculo || "N/A"}</dd>
					<dt className="font-normal text-zinc-600">Modelo:</dt>
					<dd>{detallesVehiculo.modelo || "N/A"}</dd>
					<dt className="font-normal text-zinc-600">Año:</dt>
					<dd>{detallesVehiculo.anio_fabricacion || "N/A"}</dd>
					<dt className="font-normal text-zinc-600">Patente:</dt>
					<dd>{detallesVehiculo.patente || "N/A"}</dd>
					<dt className="font-normal text-zinc-600">Dominio:</dt>
					<dd>{detallesVehiculo.dominio || "N/A"}</dd>
					<dt className="font-normal text-zinc-600">Color:</dt>
					<dd>{detallesVehiculo.color || "N/A"}</dd>
				</dl>
			</CardContent>
		</Card>
	);
};

export default VehicleDetailsCard;
