"use client";
import React from "react";
import { Button } from "@/components/ui/button"; // Importar el componente Button de Material-UI
import { Download } from "lucide-react";

const DownloadIcon = ({ onClick, label }) => {
	return (
		<>
			<div
				className="flex items-center justify-between mb-2 bg-black text-white shadow-md rounded-lg w-full py-1 hover:bg-zinc-900 transition-all duration-300 border border-transparent hover:border-zinc-800 hover:text-zinc-300 group cursor-pointer"
				onClick={onClick}
			>
				<div className="flex items-center justify-center gap-2 w-full">
					<nav className="flex gap-2 items-center">
						<Button
							variant={"solid"}
							className="flex items-center group gap-2 py-2 font-normal text-zinc-100 rounded-full"
						>
							<Download
								strokeWidth={1.5}
								className={`w-5 h-5 text-white transition-transform duration-500 group-hover:scale-105`}
							/>
							{label}
						</Button>
					</nav>
				</div>
			</div>
		</>
	);
};

export default DownloadIcon;
