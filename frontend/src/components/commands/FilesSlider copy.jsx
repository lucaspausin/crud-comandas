"use client";

import { useState } from "react";
import { FileText, Download, Trash2 } from "lucide-react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const FilesSlider = ({ file, index, handleDeleteArchive }) => {
	const [isModalOpen, setIsModalOpen] = useState(false);

	const handleDownload = (url) => {
		// Implementar lógica de descarga aquí
		console.log("Descargando:", url);
		// Por ejemplo, puedes usar window.open(url, '_blank') para abrir el archivo en una nueva pestaña
	};

	return (
		<div className="flex flex-col items-center w-[250px] h-[300px]">
			{file.tipo && file.tipo.startsWith("image/") ? (
				<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
					<DialogTrigger asChild>
						<div
							className={`w-[250px] h-full overflow-hidden relative transition-opacity duration-300 `}
							style={{ cursor: "pointer" }}
						>
							<Image
								src={file.url}
								alt={`Archivo ${index + 1}`}
								width={500}
								height={500}
								className={`rounded-lg object-cover w-full h-full shadow-lg transition-all duration-300`}
							/>
							<div className="rounded-t-lg absolute top-0 left-0 right-0 h-[60%] bg-gradient-to-b from-black via-transparent to-transparent opacity-90"></div>
							{/* <X
								strokeWidth={3}
								className="text-white absolute top-2 right-2 h-9 w-9 border-2 border-transparent p-2 rounded-full hover:border-white transition-all ease-in-out duration-500 z-10"
								onClick={(e) => {
									e.stopPropagation();
									handleDeleteArchive(file.id);
								}}
							/> */}
						</div>
					</DialogTrigger>
					<DialogContent className="sm:max-w-[625px] z-[100]">
						<div className="relative aspect-square z-[100]">
							<Image
								src={file.url}
								alt={`Archivo ${index + 1}`}
								layout="fill"
								objectFit="contain"
							/>
						</div>
						<div className="flex justify-between mt-4">
							<Button
								variant="ghost"
								size="icon"
								onClick={() => handleDownload(file.url)}
							>
								<Download className="h-5 w-5 text-zinc-700" />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								onClick={(e) => {
									e.stopPropagation();
									handleDeleteArchive(file.id);
								}}
							>
								<Trash2 className="h-5 w-5 text-zinc-700" />
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			) : file.tipo === "application/pdf" ? (
				<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
					<DialogTrigger asChild>
						<div
							className={`bg-zinc-100 flex flex-col justify-center items-center w-[250px] h-full border rounded-lg relative cursor-pointer transition-opacity duration-300`}
						>
							<div className="rounded-t-lg absolute top-0 left-0 right-0 h-[60%] bg-gradient-to-b from-black via-transparent to-transparent opacity-90"></div>
							<FileText
								strokeWidth={1.25}
								className="text-black h-12 w-12 flex items-center justify-center"
							/>
							<span className="mt-2 absolute bottom-2">{file.nombre}</span>
						</div>
					</DialogTrigger>
					<DialogContent className="sm:max-w-[625px] sm:max-h-[925px]">
						<iframe
							src={file.url}
							title={file.nombre}
							width="100%"
							height="500px"
							className="rounded-md"
						/>
						<div className="flex justify-between mt-4">
							<Button
								variant="ghost"
								size="icon"
								onClick={() => handleDownload(file.url)}
							>
								<Download className="h-5 w-5 text-zinc-700" />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								onClick={(e) => {
									e.stopPropagation();
									handleDeleteArchive(file.id);
								}}
							>
								<Trash2 className="h-5 w-5 text-zinc-700" />
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			) : (
				<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
					<DialogTrigger asChild>
						<div
							className={`flex flex-col items-center w-[250px] h-full cursor-pointer transition-opacity duration-300`}
						>
							<div className="bg-gray-200 rounded-md shadow-sm w-full h-full flex items-center justify-center">
								<span className="text-3xl text-gray-500">📁</span>
							</div>
							<span className="text-blue-500 underline mt-2">
								Descargar archivo {index + 1}
							</span>
						</div>
					</DialogTrigger>
					<DialogContent className="sm:max-w-[425px]">
						<div className="flex flex-col items-center justify-center h-[300px]">
							<span className="text-6xl mb-4">📁</span>
							<span className="text-xl text-gray-700">{file.nombre}</span>
						</div>
						<div className="flex justify-between mt-4">
							<Button
								variant="ghost"
								size="icon"
								onClick={() => handleDownload(file.url)}
							>
								<Download className="h-5 w-5 text-zinc-700" />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								onClick={(e) => {
									e.stopPropagation();
									handleDeleteArchive(file.id);
								}}
							>
								<Trash2 className="h-5 w-5 text-zinc-700" />
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			)}
		</div>
	);
};

export default FilesSlider;
