"use client";
import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CircleAlert } from "lucide-react"; // Importa el ícono que quieres usar

function ToastNotification({
	message = "Todo está OK",
	show,
	onClose,
	type = "success",
}) {
	useEffect(() => {
		if (show) {
			const timer = setTimeout(() => {
				onClose(); // Llama a onClose después de 5 segundos para ocultar el toast
			}, 5000);
			return () => clearTimeout(timer); // Limpia el temporizador al desmontar
		}
	}, [show, onClose]);

	// Clases base y de tipo
	const baseClasses =
		"fixed flex flex-row items-center gap-1 top-4 right-4 px-4 py-3 rounded-md shadow-lg";
	const typeClasses =
		type === "success"
			? "bg-green-50 text-green-700" // Estilos para éxito
			: "bg-red-50 text-red-700"; // Estilos para error

	return (
		<AnimatePresence className="z-[222]">
			{show && (
				<motion.div
					initial={{ opacity: 0, x: 50, y: -20 }} // Aparece desde la derecha y ligeramente hacia arriba
					animate={{ opacity: 1, x: 0, y: 0 }} // Anima a posición y opacidad originales
					exit={{ opacity: 0, x: 50, y: -20 }} // Desaparece de la misma manera
					transition={{ duration: 0.4 }}
					className={`${baseClasses} ${typeClasses} z-[150]`} // Combina las clases base con las de tipo
				>
					<p className="text-sm font-normal">{message}</p>
					<CircleAlert className="w-4 h-4" /> {/* Icono de error */}
				</motion.div>
			)}
		</AnimatePresence>
	);
}

export default ToastNotification;
