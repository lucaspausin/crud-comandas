import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const ReservationDetailsCard = ({ comanda }) => {
	// Verificar si la propiedad `comanda` está presente
	if (!comanda || !comanda.boletos_reservas) {
		return <div>Cargando detalles...</div>; // Mostrar mensaje de carga si no hay comanda o boletos_reservas
	}

	// Obtener detalles de la reserva, con valores por defecto en caso de que falten
	const detallesReserva = comanda.boletos_reservas || {};

	return (
		<Card className="border-none shadow-lg rounded-lg col-span-2">
			<CardHeader>
				<CardTitle className="text-xl font-light text-zinc-800">
					Detalles de la Reserva
				</CardTitle>
			</CardHeader>
			<CardContent>
				<dl className="grid grid-cols-2 gap-2 text-sm">
					<dt className="font-normal text-zinc-600">Reserva:</dt>
					<dd>{detallesReserva.id || "N/A"}</dd>

					<dt className="font-normal text-zinc-600">Marca del vehículo:</dt>
					<dd>{detallesReserva.marca_vehiculo || "N/A"}</dd>

					<dt className="font-normal text-zinc-600">Modelo del vehículo:</dt>
					<dd>{detallesReserva.modelo_vehiculo || "N/A"}</dd>

					<dt className="font-normal text-zinc-600">Patente:</dt>
					<dd>{detallesReserva.patente_vehiculo || "N/A"}</dd>

					<dt className="font-normal text-zinc-600">Equipo:</dt>
					<dd>{detallesReserva.equipo || "N/A"}</dd>

					<dt className="font-normal text-zinc-600">Precio:</dt>
					<dd>
						{detallesReserva.precio ? `$${detallesReserva.precio}` : "N/A"}
					</dd>

					<dt className="font-normal text-zinc-600">Seña:</dt>
					<dd>{detallesReserva.sena ? `$${detallesReserva.sena}` : "N/A"}</dd>

					<dt className="font-normal text-zinc-600">Monto Final:</dt>
					<dd>
						{detallesReserva.monto_final_abonar
							? `$${detallesReserva.monto_final_abonar}`
							: "N/A"}
					</dd>

					<dt className="font-normal text-zinc-600">Fecha Instalación:</dt>
					<dd>
						{detallesReserva.fecha_instalacion
							? (() => {
									const fecha = new Date(detallesReserva.fecha_instalacion);
									fecha.setHours(8, 30); // Establece la hora a 8:30
									return fecha.toLocaleString("es-AR", {
										day: "2-digit",
										month: "2-digit",
										year: "numeric",
										hour: "2-digit",
										minute: "2-digit",
										hour12: false,
									});
							  })()
							: "N/A"}
					</dd>
				</dl>
			</CardContent>
		</Card>
	);
};

export default ReservationDetailsCard;
