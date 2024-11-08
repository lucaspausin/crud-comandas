"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button"; // Importar el componente Button de Material-UI
import { ArrowDownToLine } from "lucide-react";
import { motion } from "framer-motion";

const DownloadIcon = ({ label = "Descargar", onClick }) => {
	// Asegúrate de aceptar onClick como prop
	const [hovered, setHovered] = useState(false);

	return (
		<nav className="flex items-center">
			<Button
				className="flex items-center group px-4 py-2 bg-[#18181B] text-zinc-50 hover:bg-[#2F2F31] rounded-full"
				variant="contained" // Estilo del botón
				color="primary" // Color del botón (puedes cambiarlo)
				onMouseEnter={() => setHovered(true)} // Mostrar texto al pasar el mouse
				onMouseLeave={() => setHovered(false)} // Ocultar texto al salir el mouse
				onClick={onClick} // Llama al prop onClick cuando se hace clic
			>
				<ArrowDownToLine strokeWidth={2} className="w-4 h-4" />
				<motion.span
					className={`ml-2 whitespace-nowrap text-sm overflow-hidden font-normal transition-colors duration-300 ${
						hovered ? "" : "opacity-0"
					}`}
					initial={{ opacity: 0, width: 0 }} // Comienza oculto
					animate={{
						opacity: hovered ? 1 : 0, // Mostrar u ocultar basado en el estado
						width: hovered ? "auto" : 0, // Ajustar el ancho
					}}
					transition={{ duration: 0.3 }} // Duración de la transición
				>
					{label} {/* Usar el prop label */}
				</motion.span>
			</Button>
		</nav>
	);
};

export default DownloadIcon;
