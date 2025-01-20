import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const ReservationDetailsCard = ({ comanda }) => {
	// Verificar si la propiedad `comanda` está presente
	if (!comanda || !comanda.boletos_reservas) {
		return <div>Cargando detalles...</div>; // Mostrar mensaje de carga si no hay comanda o boletos_reservas
	}

	// Obtener detalles de la reserva, con valores por defecto en caso de que falten
	const detallesReserva = comanda.boletos_reservas || {};

	return (
		<Card className="border-none shadow-lg rounded-lg col-span-1 lg:col-span-2">
			<CardHeader>
				<CardTitle className="text-xl font-light text-zinc-800">
					Detalles de la Reserva
				</CardTitle>
			</CardHeader>
			<CardContent>
				<dl className="grid grid-cols-2 gap-2 text-sm">
					<dt className="font-normal text-zinc-600">Reserva:</dt>
					<dd>{detallesReserva.id || "N/A"}</dd>
					<dt className="font-normal text-zinc-600">Asesor:</dt>
					<dd className="text-emerald-700">{detallesReserva.usuarios.nombre_usuario || "N/A"}</dd>
					<dt className="font-normal text-zinc-600">Vehículo:</dt>
					<dd>{`${detallesReserva.marca_vehiculo || "N/A"} ${detallesReserva.modelo_vehiculo || "N/A"} ${detallesReserva.patente_vehiculo || "N/A"}`}</dd>

					<dt className="font-normal text-zinc-600">Equipo:</dt>
					<dd>{detallesReserva.equipo || "N/A"}</dd>

					<dt className="font-normal text-zinc-600">Precio:</dt>
					<dd>
						{detallesReserva.precio
							? `$${parseFloat(detallesReserva.precio).toLocaleString("es-AR")}`
							: "N/A"}
					</dd>
					<dt className="font-normal text-zinc-600">Carga Externa:</dt>
					<dd className={detallesReserva.carga_externa ? "text-blue-500" : "text-red-500"}>
						{detallesReserva.carga_externa ? "Carga Externa Incluida." : "No incluyo Carga Externa."}
					</dd>
					{detallesReserva.carga_externa && (
						<>
							<dt className="font-normal text-zinc-600">
								Precio de la Carga Externa:
							</dt>
							<dd
								className={
									detallesReserva.precio_carga_externa === null ||
									detallesReserva.precio_carga_externa === 0
										? "text-red-500"
										: ""
								}
							>
								{detallesReserva.precio_carga_externa === null ||
								detallesReserva.precio_carga_externa === 0
									? "Consultar con el vendedor el precio proporcionado."
									: `$${parseFloat(detallesReserva.precio_carga_externa).toLocaleString("es-AR")}`}
							</dd>
						</>
					)}
					{detallesReserva.sena > 0 && (
						<>
							<dt className="font-normal text-zinc-600">Seña:</dt>
							<dd>
								{`$${parseFloat(detallesReserva.sena).toLocaleString("es-AR")}`}
							</dd>
						</>
					)}

					<dt className="font-normal text-zinc-600">Monto Final:</dt>
					<dd>
						{detallesReserva.monto_final_abonar
							? `$${parseFloat(detallesReserva.monto_final_abonar).toLocaleString("es-AR")}`
							: "N/A"}
					</dd>

					<dt className="font-normal text-zinc-600">Fecha Instalación:</dt>
					<dd>
						{detallesReserva.fecha_instalacion
							? (() => {
									const fecha = new Date(detallesReserva.fecha_instalacion);
									const dia = String(fecha.getUTCDate()).padStart(2, "0");
									const mes = String(fecha.getUTCMonth() + 1).padStart(2, "0"); // Los meses son 0-indexed
									return `${dia}/${mes} 08:30`; // Hora hardcodeada a 08:30
								})()
							: "N/A"}
					</dd>
				</dl>
			</CardContent>
		</Card>
	);
};

export default ReservationDetailsCard;
