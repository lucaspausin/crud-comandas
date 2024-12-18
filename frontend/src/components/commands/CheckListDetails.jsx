import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { useRef, useState } from "react";
// import DownloadIcon from "@/components/DownloadIcon";
import { motion } from "framer-motion";
import myImage from "@/public/motorgas2.svg";
// import { jsPDF } from "jspdf";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

const CheckListDetails = ({ comanda }) => {
	const detallesCheckList = comanda.tecnica_tecnica_comanda_idTocomandas || {};
	const slidesRef = useRef(null);
	const [loading] = useState(false);
	// const [isPdf, setIsPdf] = useState(false);

	const hasEmptyValues =
		!detallesCheckList.perdidas_gas &&
		!detallesCheckList.cableado &&
		!detallesCheckList.nivel_agua &&
		!detallesCheckList.nivel_aceite &&
		!detallesCheckList.inspeccion_instalacion &&
		!detallesCheckList.funcionamiento_unidad &&
		!detallesCheckList.herramientas &&
		!detallesCheckList.otras_observaciones;

	// const handleGeneratePdf = async () => {
	// 	setIsPdf(true); // Activar el estado para el PDF
	// 	if (typeof window !== "undefined") {
	// 		const html2pdf = (await import("html2pdf.js")).default;
	// 		const opt = {
	// 			margin: 0.5,
	// 			filename: `Motorgas - Boleto de Reserva.pdf`,
	// 			image: { type: "jpeg", quality: 1 },
	// 			html2canvas: { scale: 2 },
	// 			jsPDF: { unit: "in", format: "A4", orientation: "portrait" },
	// 		};
	// 		html2pdf()
	// 			.from(slidesRef.current)
	// 			.set(opt)
	// 			.save()
	// 			.then(() => {
	// 				setIsPdf(false); // Restablecer el estado después de generar el PDF
	// 			});
	// 	}
	// };

	if (loading) {
		return (
			<div className="fixed inset-0 flex items-center justify-center bg-white z-[99]">
				<motion.div
					initial={{ opacity: 0 }}
					animate={{
						opacity: [0, 1, 1, 0],
						scale: [1, 1.05, 1],
					}}
					transition={{
						duration: 0.75,
						ease: "easeInOut",
						repeat: Infinity,
					}}
				>
					<Image
						src={myImage}
						alt="Descripción de la imagen"
						className="w-16 h-16 object-contain opacity-90"
						loading="eager"
						priority
					/>
				</motion.div>
			</div>
		);
	}

	if (hasEmptyValues) {
		return (
			<Card className="border-none shadow-lg rounded-lg h-full col-span-2 lg:col-span-2">
				<CardHeader>
					<CardTitle className="text-xl font-light">
						Checklist de Salida
					</CardTitle>
				</CardHeader>
				<CardContent ref={slidesRef}>
					<div className="flex flex-col items-start justify-start pb-24">
						<p className="text-sm text-zinc-600">
							No hay información del checklist disponible.
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<>
			<Card className="border-none shadow-lg rounded-lg h-full col-span-2 lg:col-span-2 pdf-content">
				<CardHeader className="p-6 flex flex-row items-center justify-between relative card-header">
					<Image
						src={myImage}
						alt="Logo MotorGas"
						className="w-14 h-14 object-contain opacity-90 hidden"
						loading="eager"
						priority
						data-header-logo
					/>
					<div className="flex justify-between items-center gap-4">
						<CardTitle className="text-xl font-light text-zinc-800">
							Checklist de Salida
						</CardTitle>
					</div>

					<div className="flex items-center gap-4">
						<Link href={`/checklist/edit/${detallesCheckList.id}`}>
							<Button
								variant="ghost"
								size="sm"
								className="rounded-full z-50 py-5 px-[0.75rem] bg-orange-100 hover:bg-orange-50"
								onClick={(e) => {
									e.stopPropagation(); // Previene que el clic se propague al TableRow
								}}
							>
								<Pencil className="h-4 w-4 text-orange-600" />
							</Button>
						</Link>
						{/* <DownloadIcon onClick={handleGeneratePdf} label="Descargar" /> */}
					</div>
				</CardHeader>
				<CardContent ref={slidesRef}>
					<dl className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
						<div className="contents">
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
							{detallesCheckList?.perdidas_gas_adicional && (
								<>
									<dt className="font-normal text-zinc-600">
										Detalle de las Pérdidas:
									</dt>
									<dd className="text-zinc-950">
										{detallesCheckList.perdidas_gas_adicional}
									</dd>
								</>
							)}

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
							{detallesCheckList?.cableado_adicional && (
								<>
									<dt className="font-normal text-zinc-600">
										Detalle de las Cableado:
									</dt>
									<dd className="text-zinc-950">
										{detallesCheckList.cableado_adicional}
									</dd>
								</>
							)}

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
							{detallesCheckList?.nivel_agua_adicional && (
								<>
									<dt className="font-normal text-zinc-950">
										Detalle del Nivel de Agua:
									</dt>
									<dd className="text-zinc-600">
										{detallesCheckList.nivel_agua_adicional}
									</dd>
								</>
							)}

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
							{detallesCheckList?.nivel_aceite_adicional && (
								<>
									<dt className="font-normal text-zinc-600">
										Detalle del Nivel de Aceite:
									</dt>
									<dd className="text-zinc-950">
										{detallesCheckList.nivel_aceite_adicional}
									</dd>
								</>
							)}

							<dt className="font-normal text-zinc-600">
								Inspección Instalación:
							</dt>
							<dd>
								{detallesCheckList
									? detallesCheckList.inspeccion_instalacion === true
										? "Sí"
										: detallesCheckList.inspeccion_instalacion === null
											? "No"
											: "No"
									: "N/A"}
							</dd>
							{detallesCheckList?.inspeccion_instalacion_adicional && (
								<>
									<dt className="font-normal text-zinc-600">
										Detalle de la Inspección de Instalación:
									</dt>
									<dd className="text-zinc-950">
										{detallesCheckList.inspeccion_instalacion_adicional}
									</dd>
								</>
							)}

							<dt className="font-normal text-zinc-600">
								Funcionamiento Unidad:
							</dt>
							<dd>
								{detallesCheckList
									? detallesCheckList.funcionamiento_unidad === true
										? "Sí"
										: detallesCheckList.funcionamiento_unidad === null
											? "No"
											: "No"
									: "N/A"}
							</dd>
							{detallesCheckList?.funcionamiento_unidad_adicional && (
								<>
									<dt className="font-normal text-zinc-600">
										Detalle del Funcionamiento de la Unidad:
									</dt>
									<dd className="text-zinc-950">
										{detallesCheckList.funcionamiento_unidad_adicional}
									</dd>
								</>
							)}

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
							{detallesCheckList?.herramientas_adicional && (
								<>
									<dt className="font-normal text-zinc-600">
										Detalle de las Herramientas:
									</dt>
									<dd className="text-zinc-950">
										{detallesCheckList.herramientas_adicional}
									</dd>
								</>
							)}

							<dt className="font-normal text-zinc-600">Kilometros:</dt>
							<dd>
								{detallesCheckList.kilometros
									? detallesCheckList.kilometros
									: "No"}
							</dd>

							<dt className="font-normal text-zinc-600">
								Otras Observaciones del Vehículo:
							</dt>
							<dd>
								{detallesCheckList
									? (detallesCheckList.otras_observaciones ?? "No")
									: "N/A"}
							</dd>

							<dt className="font-normal text-zinc-600 mb-2">
								Firma del Técnico:
							</dt>
							{detallesCheckList.firma_tecnico && (
								<Image
									src={`data:image/png;base64,${detallesCheckList.firma_tecnico}`}
									alt="Firma"
									width={300}
									height={100}
									className="border-none rounded-lg firma-tecnico"
									priority
									unoptimized
								/>
							)}
						</div>
					</dl>
				</CardContent>
			</Card>
		</>
	);
};

export default CheckListDetails;
