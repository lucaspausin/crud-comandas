"use client";

import { X, FileText, Trash2, CloudDownload, CheckCircle } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
// import { Button } from "@/components/ui/button";
import { updateFileVerification } from "@/app/reservations/reservations.api";

const FilesSlider = ({ file, index, handleDeleteArchive, onVerify }) => {
	const { data: session, status } = useSession();

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isImageLoaded, setIsImageLoaded] = useState(false);
	const [isHovered, setIsHovered] = useState(false);
	const [loggedUserId, setLoggedUserId] = useState(null);
	const [isVerified, setIsVerified] = useState(file.verificado || false);

	const openModal = () => setIsModalOpen(true);
	const closeModal = () => setIsModalOpen(false);

	useEffect(() => {
		if (status === "authenticated" && session?.user?.id) {
			const userId = parseInt(session.user.id);
			if (!isNaN(userId)) {
				setLoggedUserId(userId);
			}
		}
	}, [session, status]);

	const currentUserId = loggedUserId;

	// console.log("Current User ID:", currentUserId);
	// console.log("File User ID:", file.usuario_id);

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
			link.href = file.url;
			link.setAttribute("download", file.nombre || `archivo-${index + 1}`);
			link.style.display = "none";
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		} catch (error) {
			console.error("Error al intentar descargar el archivo:", error);
		}
	};

	const handleImageLoad = () => {
		setIsImageLoaded(true);
	};

	return (
		<>
			<div className="flex flex-col items-center w-[300px] shrink-0">
				{file.tipo && file.tipo.startsWith("image/") ? (
					<div
						className="w-[300px] aspect-square overflow-hidden relative cursor-pointer group rounded-none border p-0"
						onClick={openModal}
						onMouseEnter={() => setIsHovered(true)}
						onMouseLeave={() => setIsHovered(false)}
					>
						{!isVerified &&
							file.usuario_id !== null &&
							file.usuario_id !== currentUserId && (
								<div className="absolute z-[89] top-2 right-2 h-2 w-2 bg-red-400 rounded-full animate-pulse" />
							)}
						<div className="relative h-full">
							<div
								className={`transition-transform duration-300 h-full ${
									isHovered ? "scale-95" : ""
								}`}
							>
								<Image
									src={file.url}
									alt={`Archivo ${index + 1}`}
									width={500}
									height={500}
									className=" object-cover w-full h-full shadow-lg"
									onLoad={handleImageLoad}
								/>
								{isImageLoaded && (
									<div
										className={` absolute top-0 left-0 right-0 h-[60%] 
									bg-gradient-to-b from-black via-transparent to-transparent 
									opacity-20 z-10`}
									></div>
								)}
							</div>
							<div
								className={`absolute bottom-0 left-0 right-0 w-full overflow-hidden group backdrop-blur-sm transition-transform duration-300 ${
									isHovered ? "scale-100 w-fit" : ""
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
				) : file.tipo === "application/pdf" ? (
					<div
						onClick={openModal}
						className="bg-zinc-50 flex flex-col justify-center items-center w-[300px] aspect-square border rounded-lg relative cursor-pointer transition-all duration-300 hover:bg-[#F4F4F5] group"
						onMouseEnter={() => setIsHovered(true)}
						onMouseLeave={() => setIsHovered(false)}
					>
						{!isVerified &&
							file.usuario_id !== null &&
							file.usuario_id !== currentUserId && (
								<div className="absolute z-[89] top-2 right-2 h-2 w-2 bg-red-400 rounded-full animate-pulse" />
							)}
						<FileText
							strokeWidth={1.25}
							className="text-black h-9 w-9 flex items-center justify-center transition-transform duration-300 group-hover:scale-95"
						/>
						<span className="mt-2 absolute bottom-9 text-center line-clamp-2">
							{file.nombre}
						</span>
					</div>
				) : (
					<div
						onClick={openModal}
						className="bg-zinc-50 flex flex-col justify-center items-center w-[300px] aspect-square border rounded-lg relative cursor-pointer transition-all duration-300 hover:bg-zinc-100 group"
						onMouseEnter={() => setIsHovered(true)}
						onMouseLeave={() => setIsHovered(false)}
					>
						{!isVerified &&
							file.usuario_id !== null &&
							file.usuario_id !== currentUserId && (
								<div className="absolute z-[89] top-2 right-2 h-2 w-2 bg-red-400 rounded-full animate-pulse" />
							)}
						<FileText
							strokeWidth={1.25}
							className="text-black h-12 w-12 flex items-center justify-center transition-transform duration-300 group-hover:scale-95"
						/>
						<span className="mt-2 absolute bottom-2 text-center line-clamp-2">
							{file.nombre}
						</span>
					</div>
				)}
				{isModalOpen && (
					<div
						className="modal-overlay fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[100] shadow-2xl"
						onClick={handleOutsideClick}
					>
						<div
							className="bg-white shadow-2xl rounded-lg max-w-3xl w-full max-h-[90vh] p-4 relative flex flex-col items-center justify-center transform transition-transform"
							style={{
								animation: "scaleUp 0.2s ease-out forwards",
							}}
							onClick={(e) => {
								e.stopPropagation();
								if (
									file.usuario_id !== null &&
									file.usuario_id !== currentUserId &&
									!isVerified
								) {
									updateFileVerification(file.id)
										.then(() => {
											setIsVerified(true);
											onVerify();
										})
										.catch((error) =>
											console.error("Error al verificar el archivo:", error)
										);
								}
							}}
						>
							{isVerified && (
								<div className="absolute top-4 right-4">
									<CheckCircle className="text-green-500 h-6 w-6" />
								</div>
							)}
							<div className="border-b pb-4 pt-2 px-4 w-full flex items-center self-end justify-end">
								<X
									onClick={closeModal}
									className="w-5 h-5 cursor-pointer hover:text-[#bbb9b9] transition-all ease-in-out duration-300"
								/>
							</div>
							<div className="w-[625px] h-[625px] overflow-y-hidden py-4">
								{file.tipo && file.tipo.startsWith("image/") ? (
									<>
										<Image
											src={file.url}
											alt={`Archivo ${index + 1}`}
											width={1000}
											height={1000}
											className="rounded-md object-contain w-full h-full"
										/>
										<p className=" text-white">{file.nombre}</p>
									</>
								) : file.tipo === "application/pdf" ? (
									<iframe
										src={`https://docs.google.com/gview?url=${file.url}&embedded=true`}
										width="100%"
										height="100%"
										className="rounded-md"
										title={`Archivo ${index + 1}`}
									></iframe>
								) : (
									<div className="flex flex-col items-center justify-center h-full">
										<p className="text-zinc-800">
											No hay vista previa para este archivo.
										</p>
									</div>
								)}
							</div>
							<div className="border-t pb-2 pt-6 px-4 w-full flex items-center justify-between">
								<CloudDownload
									onClick={handleDownload}
									className="w-5 h-5 cursor-pointer hover:text-[#bbb9b9] transition-all ease-in-out duration-300"
								/>
								<Trash2
									onClick={() => handleDeleteArchive(file.id)}
									className="w-5 h-5 cursor-pointer hover:text-[#e57373] transition-all ease-in-out duration-300"
								/>
							</div>
						</div>
					</div>
				)}
			</div>
		</>
	);
};

export default FilesSlider;
