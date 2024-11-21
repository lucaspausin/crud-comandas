"use client";
import React, { useState } from "react";
// import Link from "next/link";
import { CircleArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function HomeIcon({ label = "Inicio" }) {
	const router = useRouter();

	const [hovered, setHovered] = useState(false);

	return (
		<nav className="flex items-center">
			<Button
			variant={"solid"}
				onClick={() => router.back()}
				className="flex items-center group px-4 py-2 text-zinc-700 hover:bg-zinc-100 rounded-full"
				onMouseEnter={() => setHovered(true)} // Mostrar texto al pasar el mouse
				onMouseLeave={() => setHovered(false)} // Ocultar texto al salir el mouse
			>
				<CircleArrowLeft strokeWidth={1.25} className="w-7 h-7" />
				<motion.span
					className={`ml-2 whitespace-nowrap text-md font-normal overflow-hidden transition-colors duration-300 ${
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
}

// export default HomeIcon;
