import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Image from "next/image";

const CheckListDetails = ({ comanda }) => {
	const detallesCheckList = comanda.tecnica_tecnica_comanda_idTocomandas || {};

	const hasEmptyValues =
		!detallesCheckList.perdidas_gas &&
		!detallesCheckList.cableado &&
		!detallesCheckList.nivel_agua &&
		!detallesCheckList.nivel_aceite &&
		!detallesCheckList.inspeccion_instalacion &&
		!detallesCheckList.funcionamiento_unidad &&
		!detallesCheckList.herramientas &&
		!detallesCheckList.otras_observaciones;

	if (hasEmptyValues) {
		return (
			<Card className="border-none shadow-lg rounded-lg h-full col-span-2 lg:col-span-2">
				<CardHeader>
					<CardTitle className="text-xl font-light">
						Checklist de Salida
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col items-start justify-start">
						<p className="text-sm text-zinc-600">
							No hay información del checklist disponible.
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="border-none shadow-lg rounded-lg h-full col-span-2 lg:col-span-2">
			<CardHeader>
				<CardTitle className="text-xl font-light  text-zinc-800">
					Checklist de Salida
				</CardTitle>
			</CardHeader>
			<CardContent>
				<dl className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
					<dt className="font-normal text-zinc-600">Pérdidas de Gas:</dt>
					<dd>
						{detallesCheckList
							? detallesCheckList.perdidas_gas === true
								? "Sí"
								: detallesCheckList.perdidas_gas === null
								? "No"
								: "No"
							: "N/A"}
					</dd>

					<dt className="font-normal text-zinc-600">Cableado:</dt>
					<dd>
						{detallesCheckList
							? detallesCheckList.cableado === true
								? "Sí"
								: detallesCheckList.cableado === null
								? "No"
								: "No"
							: "N/A"}
					</dd>

					<dt className="font-normal text-zinc-600">Nivel de Agua:</dt>
					<dd>
						{detallesCheckList
							? detallesCheckList.nivel_agua === true
								? "Sí"
								: detallesCheckList.nivel_agua === null
								? "No"
								: "No"
							: "N/A"}
					</dd>

					<dt className="font-normal text-zinc-600">Nivel de Aceite:</dt>
					<dd>
						{detallesCheckList
							? detallesCheckList.nivel_aceite === true
								? "Sí"
								: detallesCheckList.nivel_aceite === null
								? "No"
								: "No"
							: "N/A"}
					</dd>

					<dt className="font-normal text-zinc-600">Inspección Instalación:</dt>
					<dd>
						{detallesCheckList
							? detallesCheckList.inspeccion_instalacion === true
								? "Sí"
								: detallesCheckList.inspeccion_instalacion === null
								? "No"
								: "No"
							: "N/A"}
					</dd>

					<dt className="font-normal text-zinc-600">Funcionamiento Unidad:</dt>
					<dd>
						{detallesCheckList
							? detallesCheckList.funcionamiento_unidad === true
								? "Sí"
								: detallesCheckList.funcionamiento_unidad === null
								? "No"
								: "No"
							: "N/A"}
					</dd>

					<dt className="font-normal text-zinc-600">Herramientas:</dt>
					<dd>
						{detallesCheckList
							? detallesCheckList.herramientas === true
								? "Sí"
								: detallesCheckList.herramientas === null
								? "No"
								: "No"
							: "N/A"}
					</dd>

					<dt className="font-normal text-zinc-600">Otras Observaciones:</dt>
					<dd>
						{detallesCheckList
							? detallesCheckList.otras_observaciones ?? "No"
							: "N/A"}
					</dd>
					<dt className="font-normal text-zinc-600">Kilometros:</dt>
					<dd>
						{detallesCheckList
							? detallesCheckList.kilometros === true
								? "Sí"
								: detallesCheckList.kilometros === null
								? "No"
								: "No"
							: "N/A"}
					</dd>
					<dt className="font-normal text-zinc-600 mb-2">Firma del Técnico:</dt>
					{detallesCheckList.firma_tecnico && (
						<Image
							src={`data:image/png;base64,${detallesCheckList.firma_tecnico}`}
							alt="Firma"
							width={300}
							height={100}
							className="border-none rounded-lg"
						/>
					)}
				</dl>
			</CardContent>
		</Card>
	);
};

export default CheckListDetails;
