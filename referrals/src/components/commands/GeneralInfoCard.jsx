import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SquareArrowOutUpRight } from "lucide-react";
import Link from "next/link";

const GeneralInfoCard = ({ comanda }) => {
	const estadoClase =
		comanda.estado === "en_proceso"
			? "bg-blue-100 text-blue-700"
			: comanda.estado === "completado"
				? "bg-green-100 text-green-700"
				: "bg-yellow-100 text-yellow-700";

	return (
		<Card className="rounded-xl shadow-lg border-none ">
			<CardHeader className="flex flex-row items-center w-full justify-between">
				<CardTitle className="text-xl font-light text-zinc-800">
					Información General
				</CardTitle>
				<span
					className={`px-2 py-1 text-xs font-normal w-fit rounded-full ${estadoClase}`}
				>
					{comanda.estado === "en_proceso"
						? "En Proceso"
						: comanda.estado === "completado"
							? "Completada"
							: "Pendiente"}
				</span>
			</CardHeader>
			<CardContent>
				<dl className="grid grid-cols-2 gap-2 text-sm">
					<dt className="font-normal text-zinc-600">Comanda:</dt>
					<dd>{comanda.id}</dd>
					<dt className="font-normal text-zinc-600">Reserva:</dt>
					<Link
						className="flex gap-1 items-center border-b border-zinc-700 w-fit"
						href={`/reservations/${comanda.boletos_reservas.id}`}
					>
						<dd>{comanda.boletos_reservas.id}</dd>
						<SquareArrowOutUpRight className="w-[0.9rem] h-[0.9rem] text-zinc-700" />
					</Link>
					<dt className="font-normal text-zinc-600">Servicio:</dt>
					<dd>Instalación de GNC</dd>
					<dt className="font-normal text-zinc-600">Creado:</dt>
					<dd>
						{new Date(comanda.creado_en).toLocaleString("es-AR", {
							day: "2-digit",
							month: "2-digit",
							year: "numeric",
							hour: "2-digit",
							minute: "2-digit",
							hour12: false,
						})}
					</dd>
				</dl>
			</CardContent>
		</Card>
	);
};

export default GeneralInfoCard;
