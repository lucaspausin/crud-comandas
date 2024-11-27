import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Label } from "@/components/ui/label";
import Image from "next/image";
import { useRef, useState } from "react";
import DownloadIcon from "@/components/DownloadIcon";
import { motion } from "framer-motion";
import myImage from "@/public/motorgas2.svg";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export default function CheckListForm({ checkData }) {
	const slidesRef = useRef(null);
	const [loading, setLoading] = useState(false);

	const handleGeneratePdf = async () => {
		setLoading(true);
		if (typeof window !== "undefined") {
			const element = slidesRef.current;

			html2canvas(element, {
				useCORS: true,
				scale: 3,
				backgroundColor: "#ffffff",
				width: 850,
				height: 1500,
				logging: false,
				onclone: function (clonedDoc) {
					const clonedElement = clonedDoc.body.querySelector(".pdf-content");
					if (clonedElement) {
						const downloadButton = clonedElement.querySelector(
							"[data-download-button]"
						);
						if (downloadButton) {
							downloadButton.remove();
						}

						const headerLogo =
							clonedElement.querySelector("[data-header-logo]");
						if (headerLogo) {
							headerLogo.style.display = "block";
							headerLogo.style.width = "64px";
							headerLogo.style.height = "64px";
							headerLogo.style.objectFit = "contain";
							headerLogo.style.opacity = "0.9";
							headerLogo.classList.remove("hidden");
							headerLogo.style.visibility = "visible";
							headerLogo.style.position = "static";
						}

						const headerTitle = clonedElement.querySelector(".text-xl");
						if (headerTitle) {
							headerTitle.style.textAlign = "left";
							headerTitle.style.width = "100%";
							headerTitle.style.marginBottom = "20px";
							headerTitle.style.fontSize = "24px";
							headerTitle.style.paddingLeft = "0px";
						}

						clonedElement.style.display = "block";
						clonedElement.style.padding = "30px";
						clonedElement.style.boxSizing = "border-box";
						clonedElement.style.margin = "0";

						const dlElement = clonedElement.querySelector("dl");
						if (dlElement) {
							dlElement.style.display = "grid";
							dlElement.style.gridTemplateColumns = "1fr";
							dlElement.style.width = "100%";
							dlElement.style.maxWidth = "none";
							dlElement.style.margin = "0";
							dlElement.style.gap = "1rem";
						}

						// Primero, encontrar y eliminar todos los detalles
						const dtElements = clonedElement.querySelectorAll("dt");
						dtElements.forEach((dt) => {
							// Usar toLowerCase() para hacer la búsqueda insensible a mayúsculas/minúsculas
							if (dt.textContent.toLowerCase().includes("detalle")) {
								// Encontrar el siguiente dd y eliminarlo
								let nextElement = dt.nextElementSibling;
								while (nextElement && nextElement.tagName !== "DD") {
									nextElement = nextElement.nextElementSibling;
								}
								if (nextElement && nextElement.tagName === "DD") {
									nextElement.remove();
								}
								dt.remove();
							}
						});

						// Aplicar estilos a los elementos restantes
						const remainingDt = clonedElement.querySelectorAll("dt");
						const remainingDd = clonedElement.querySelectorAll("dd");

						remainingDt.forEach((dt) => {
							dt.style.textAlign = "left";
							dt.style.width = "100%";
							dt.style.marginBottom = "4px";
						});

						remainingDd.forEach((dd) => {
							dd.style.textAlign = "left";
							dd.style.width = "100%";
							dd.style.marginBottom = "12px";
						});

						// Asegurarse de que la imagen de la firma sea visible
						const imageContainer =
							clonedElement.querySelector(".firma-tecnico");
						if (imageContainer) {
							imageContainer.style.margin = "10px 0";
							imageContainer.style.display = "block";
							imageContainer.style.maxWidth = "300px";
						}

						// Ensure kilometers and signature are visible
						const kilometrosElement =
							clonedElement.querySelector("dd:last-of-type");
						if (kilometrosElement) {
							kilometrosElement.style.marginBottom = "20px";
						}

						const firmaContainer =
							clonedElement.querySelector(".firma-tecnico");
						if (firmaContainer) {
							firmaContainer.style.display = "block";
							firmaContainer.style.maxWidth = "300px";
							firmaContainer.style.height = "auto";
							firmaContainer.style.marginTop = "20px";
							firmaContainer.style.visibility = "visible";
							firmaContainer.style.opacity = "1";
						}
					}
				},
			})
				.then((canvas) => {
					const imgData = canvas.toDataURL("image/jpeg", 1.0);
					const pdf = new jsPDF({
						orientation: "portrait",
						unit: "mm",
						format: "a4",
					});
					const pdfWidth = pdf.internal.pageSize.getWidth();
					const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
					pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
					pdf.save(`Checklist de Salida - ${checkData.id || "N/A"}.pdf`);
					setLoading(false);
				})
				.catch((err) => {
					console.error("Error en la generación del PDF:", err);
					setLoading(false);
				});
		}
	};

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

	return (
		<Card
			className="rounded-xl shadow-lg border-none pdf-content"
			ref={slidesRef}
		>
			<CardHeader className="p-6 flex flex-row items-center justify-between relative">
				<div className="flex items-center gap-4">
					<CardTitle className="text-xl font-light text-zinc-800">
						Checklist de Salida
					</CardTitle>
				</div>
				<Image
					src={myImage}
					alt="Logo MotorGas"
					className="w-16 h-16 object-contain opacity-90 absolute top-0 right-0 hidden"
					loading="eager"
					priority
					data-header-logo
				/>
				<DownloadIcon
					onClick={handleGeneratePdf}
					label="Descargar"
					data-download-button
				/>
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
