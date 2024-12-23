import { useState, useRef, useEffect } from "react";

// lazy, useEffect
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
// import DownloadIcon from "@/components/DownloadIcon";
// import { jsPDF } from "jspdf";
// import html2canvas from "html2canvas";
import { motion } from "framer-motion";
import myImage from "@/public/motorgas2.svg";
import { X, CloudDownload, Trash2 } from "lucide-react";
// Lazy load the VehicleViewerReadOnly component
// const VehicleViewerReadOnly = lazy(
// 	() => import("@/components/3D/VehicleViewerReadOnly")
// );

export default function TechnicalDetailsCard({ comanda, handleDeleteArchive }) {
	// const [selectedPoint, setSelectedPoint] = useState(null);
	const [loading] = useState(false);
	// const [isViewerVisible, setIsViewerVisible] = useState(false); // State to track visibility
	// const viewerRef = useRef(null);
	const slidesRef = useRef(null); // Ref para el contenido a descargar como PDF
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedImage, setSelectedImage] = useState(null);
	const [hoveredId, setHoveredId] = useState(null); // Agregado el estado hoveredId
	const [isImageLoaded, setIsImageLoaded] = useState({});

	// Extraemos los detalles técnicos de la comanda
	const detallesTecnicos = comanda?.tecnica_tecnica_comanda_idTocomandas || {};

	// Filtrar las imágenes del usuario ID 2
	const userImages =
		comanda?.archivo?.filter(
			(file) => file.usuario_id === 2 && file.tipo?.startsWith("image/")
		) || [];

	// const handlePointSelect = (point) => {
	// 	setSelectedPoint(point);
	// };

	// Verificamos si los campos específicos están vacíos
	const hasEmptyValues =
		!detallesTecnicos.marca_vehiculo &&
		!detallesTecnicos.modelo &&
		!detallesTecnicos.anio_fabricacion &&
		!detallesTecnicos.patente;

	// useEffect(() => {
	// 	const observer = new IntersectionObserver(
	// 		(entries) => {
	// 			entries.forEach((entry) => {
	// 				if (entry.isIntersecting) {
	// 					setIsViewerVisible(true); // Set to true when visible
	// 				} else {
	// 					setIsViewerVisible(false); // Set to false when not visible
	// 				}
	// 			});
	// 		},
	// 		{ threshold: 0.1 } // Trigger when 10% of the component is visible
	// 	);

	// 	const currentViewerRef = viewerRef.current; // Store the current ref value

	// 	if (currentViewerRef) {
	// 		observer.observe(currentViewerRef);
	// 	}

	// 	return () => {
	// 		if (currentViewerRef) {
	// 			observer.unobserve(currentViewerRef);
	// 		}
	// 	};
	// }, []);

	const openModal = (file) => {
		setSelectedImage(file);
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setSelectedImage(null);
		setIsModalOpen(false);
	};

	useEffect(() => {
		const handleKeyDown = (event) => {
			if (event.key === "Escape") {
				closeModal();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	const handleOutsideClick = (event) => {
		if (event.target.classList.contains("modal-overlay")) {
			closeModal();
		}
	};

	const handleDownload = () => {
		try {
			const link = document.createElement("a");
			link.href = selectedImage.url;
			link.setAttribute("download", selectedImage.nombre || "imagen");
			link.style.display = "none";
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		} catch (error) {
			console.error("Error al intentar descargar el archivo:", error);
		}
	};

	const handleImageLoad = (fileId) => {
		setIsImageLoaded((prev) => ({
			...prev,
			[fileId]: true,
		}));
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

	if (hasEmptyValues) {
		return (
			<Card className="border-none shadow-lg rounded-lg h-full col-span-2">
				<CardHeader>
					<CardTitle className="text-xl font-light">
						Inspección del Vehículo
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
			<Card
				className="col-span-2 border-none shadow-lg rounded-lg pdf-content pb-12"
				ref={slidesRef}
			>
				<CardHeader className="p-6 flex flex-row items-center justify-between">
					<CardTitle className="text-xl font-light text-zinc-800">
						Inspección del Vehículo
					</CardTitle>
					{/* <DownloadIcon onClick={handleGeneratePdf} label="Descargar" /> */}
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
									<dd className="text-zinc-900">{detallesTecnicos[key]}</dd>
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

					{/* Agregar grid de imágenes al final */}
					{userImages.length > 0 && (
						<div className="mt-6">
							<CardHeader className="px-0 flex flex-row items-center justify-between">
								<CardTitle className="text-xl font-light text-zinc-800">
									Imágenes de la Inspección del Vehículo
								</CardTitle>
							</CardHeader>
							<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
								{userImages.map((file, index) => (
									<div
										key={file.id}
										className="w-full aspect-square overflow-hidden relative cursor-pointer group rounded-none border p-0"
										onClick={() => openModal(file)}
										onMouseEnter={() => setHoveredId(file.id)}
										onMouseLeave={() => setHoveredId(null)}
									>
										<div className="relative h-full">
											<div
												className={`transition-transform duration-300 h-full ${
													hoveredId === file.id ? "scale-95" : ""
												}`}
											>
												<Image
													src={file.url}
													alt={`Archivo ${index + 1}`}
													width={500}
													height={500}
													className="object-cover w-full h-full shadow-lg"
													onLoad={() => handleImageLoad(file.id)}
												/>
												{isImageLoaded[file.id] && (
													<div
														className={`absolute top-0 left-0 right-0 h-[60%] 
														bg-gradient-to-b from-black via-transparent to-transparent 
														opacity-20 z-10`}
													></div>
												)}
											</div>
											<div
												className={`absolute bottom-0 left-0 right-0 w-full overflow-hidden group backdrop-blur-sm transition-transform duration-300 ${
													hoveredId === file.id ? "scale-100 w-fit" : ""
												}`}
											>
												<span
													className="block w-full bg-zinc-300 bg-opacity-5 text-center font-normal text-white py-2 whitespace-nowrap overflow-hidden text-ellipsis border border-transparent rounded-lg"
													title={file.nombre}
												>
													{file.nombre.length > 20
														? `${file.nombre.substring(0, 25)}...`
														: file.nombre}
												</span>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					)}
				</CardContent>
				{/* <CardContent
					className="col-span-2 border-none rounded-lg p-6"
					data-viewer-content
				>
					<div className="grid grid-cols-1 lg:grid-cols-2 col-span-2 rounded-lg border">
						<div className="col-span-1" ref={viewerRef}>
						
							{isViewerVisible && (
								<VehicleViewerReadOnly
									onPointSelect={handlePointSelect}
									pointsData={detallesTecnicos}
								/>
							)}
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
				</CardContent> */}
			</Card>

			{/* Modal */}
			{isModalOpen && selectedImage && (
				<div
					className="modal-overlay fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[100] shadow-2xl"
					onClick={handleOutsideClick}
				>
					<div
						className="bg-white shadow-2xl rounded-lg max-w-3xl w-full max-h-[90vh] p-4 relative flex flex-col items-center justify-center transform transition-transform"
						style={{
							animation: "scaleUp 0.2s ease-out forwards",
						}}
						onClick={(e) => e.stopPropagation()}
					>
						<div className="border-b pb-4 pt-2 px-4 w-full flex items-center self-end justify-end">
							<X
								onClick={closeModal}
								className="w-5 h-5 cursor-pointer hover:text-[#bbb9b9] transition-all ease-in-out duration-300"
							/>
						</div>
						<div className="w-[625px] h-[625px] overflow-y-hidden py-4">
							<Image
								src={selectedImage.url}
								alt={selectedImage.nombre || "Imagen"}
								width={1000}
								height={1000}
								className="rounded-md object-contain w-full h-full"
							/>
						</div>
						<div className="border-t pb-2 pt-6 px-4 w-full flex items-center justify-between">
							<CloudDownload
								onClick={handleDownload}
								className="w-5 h-5 cursor-pointer hover:text-[#bbb9b9] transition-all ease-in-out duration-300"
							/>
							<Trash2
								onClick={() => {
									const confirmDelete = window.confirm(
										"¿Está seguro de que desea eliminar este archivo?"
									);
									if (confirmDelete) {
										handleDeleteArchive(selectedImage.id);
										closeModal();
									}
								}}
								className="w-5 h-5 cursor-pointer hover:text-[#e57373] transition-all ease-in-out duration-300"
							/>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
