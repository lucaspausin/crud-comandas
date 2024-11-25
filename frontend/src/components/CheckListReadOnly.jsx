import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Label } from "@/components/ui/label";
import Image from "next/image";

export default function CheckListForm({ checkData }) {
	return (
		<Card className="rounded-xl shadow-lg border-none">
			<CardHeader>
				<CardTitle className="text-xl font-light text-zinc-800">
					CheckList
				</CardTitle>
			</CardHeader>
			<CardContent className="pb-0">
				<dl className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
					<div className="contents">
						<dt className="font-normal text-zinc-600">Creado:</dt>
						<dd>
							{checkData.actualizado_en
								? `${checkData.actualizado_en.slice(8, 10)}/${checkData.actualizado_en.slice(5, 7)} ${checkData.actualizado_en.slice(11, 16)}`
								: "N/A"}
						</dd>
						<dt className="font-normal text-zinc-600">Pérdidas de Gas:</dt>
						<dd>
							{checkData
								? checkData.perdidas_gas === true
									? "Sí"
									: checkData.perdidas_gas === null
										? "No"
										: "No"
								: "N/A"}
						</dd>
						{checkData?.perdidas_gas_adicional && (
							<>
								<dt className="font-normal text-zinc-600">
									Detalle de las Pérdidas:
								</dt>
								<dd className="text-zinc-950">
									{checkData.perdidas_gas_adicional}
								</dd>
							</>
						)}

						<dt className="font-normal text-zinc-600">Cableado:</dt>
						<dd>
							{checkData
								? checkData.cableado === true
									? "Sí"
									: checkData.cableado === null
										? "No"
										: "No"
								: "N/A"}
						</dd>
						{checkData?.cableado_adicional && (
							<>
								<dt className="font-normal text-zinc-600">
									Detalle de las Cableado:
								</dt>
								<dd className="text-zinc-950">
									{checkData.cableado_adicional}
								</dd>
							</>
						)}

						<dt className="font-normal text-zinc-600">Nivel de Agua:</dt>
						<dd>
							{checkData
								? checkData.nivel_agua === true
									? "Sí"
									: checkData.nivel_agua === null
										? "No"
										: "No"
								: "N/A"}
						</dd>
						{checkData?.nivel_agua_adicional && (
							<>
								<dt className="font-normal text-zinc-600">
									Detalle del Nivel de Agua:
								</dt>
								<dd className="text-zinc-950">
									{checkData.nivel_agua_adicional}
								</dd>
							</>
						)}

						<dt className="font-normal text-zinc-600">Nivel de Aceite:</dt>
						<dd>
							{checkData
								? checkData.nivel_aceite === true
									? "Sí"
									: checkData.nivel_aceite === null
										? "No"
										: "No"
								: "N/A"}
						</dd>
						{checkData?.nivel_aceite_adicional && (
							<>
								<dt className="font-normal text-zinc-600">
									Detalle del Nivel de Aceite:
								</dt>
								<dd className="text-zinc-950">
									{checkData.nivel_aceite_adicional}
								</dd>
							</>
						)}

						<dt className="font-normal text-zinc-600">
							Inspección Instalación:
						</dt>
						<dd>
							{checkData
								? checkData.inspeccion_instalacion === true
									? "Sí"
									: checkData.inspeccion_instalacion === null
										? "No"
										: "No"
								: "N/A"}
						</dd>
						{checkData?.inspeccion_instalacion_adicional && (
							<>
								<dt className="font-normal text-zinc-600">
									Detalle de la Inspección de Instalación:
								</dt>
								<dd className="text-zinc-950">
									{checkData.inspeccion_instalacion_adicional}
								</dd>
							</>
						)}

						<dt className="font-normal text-zinc-600">
							Funcionamiento Unidad:
						</dt>
						<dd>
							{checkData
								? checkData.funcionamiento_unidad === true
									? "Sí"
									: checkData.funcionamiento_unidad === null
										? "No"
										: "No"
								: "N/A"}
						</dd>
						{checkData?.funcionamiento_unidad_adicional && (
							<>
								<dt className="font-normal text-zinc-600">
									Detalle del Funcionamiento de la Unidad:
								</dt>
								<dd className="text-zinc-950">
									{checkData.funcionamiento_unidad_adicional}
								</dd>
							</>
						)}

						<dt className="font-normal text-zinc-600">Herramientas:</dt>
						<dd>
							{checkData
								? checkData.herramientas === true
									? "Sí"
									: checkData.herramientas === null
										? "No"
										: "No"
								: "N/A"}
						</dd>
						{checkData?.herramientas_adicional && (
							<>
								<dt className="font-normal text-zinc-600">
									Detalle de las Herramientas:
								</dt>
								<dd className="text-zinc-950">
									{checkData.herramientas_adicional}
								</dd>
							</>
						)}

						<dt className="font-normal text-zinc-600">Otras Observaciones:</dt>
						<dd>
							{checkData ? (checkData.otras_observaciones ?? "No") : "N/A"}
						</dd>
						<dt className="font-normal text-zinc-600">Kilometros:</dt>
						<dd>{checkData.kilometros ? checkData.kilometros : "No"}</dd>

						<dt className="font-normal text-zinc-600 mb-2">
							Firma del Técnico:
						</dt>
						{checkData.firma_tecnico && (
							<Image
								src={`data:image/png;base64,${checkData.firma_tecnico}`}
								alt="Firma"
								width={300}
								height={100}
								className="border-none rounded-lg"
							/>
						)}
					</div>
				</dl>
			</CardContent>
		</Card>
	);
}
