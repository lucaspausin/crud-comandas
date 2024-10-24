import React from "react";
import Link from "next/link";
import Image from "next/image";
import myImage from "@/public/motorgas2.svg";

import {
	ClipboardList,
	Home,
	PlusCircle,
	Settings,
	Ticket,
} from "lucide-react";

function Aside() {
	return (
		<aside className="w-64 bg-white shadow-md z-50 px-4 border border-[#E4E4E7]">
			<div className="p-2">
				<Image
					src={myImage}
					alt="Descripción de la imagen"
					className="w-16 h-16 object-contain opacity-90"
					loading="eager"
				/>
			</div>
			<nav className="mt-6">
				<Link
					href="/dashboard"
					className="flex items-center px-4 py-2 text-zinc-700 bg-zinc-100 rounded-r-full"
				>
					<Home className="w-5 h-5 mr-2" />
					Inicio
				</Link>
				<Link
					href="/add-order"
					className="flex items-center px-4 py-2 mt-2 text-zinc-600 hover:bg-zinc-100 rounded-r-full"
				>
					<PlusCircle className="w-5 h-5 mr-2" />
					Añadir Boleta
				</Link>
				<Link
					href="/reservations"
					className="flex items-center px-4 py-2 mt-2 text-zinc-600 hover:bg-zinc-100 rounded-r-full"
				>
					<Ticket className="w-5 h-5 mr-2" />
					Reservas
				</Link>
				<Link
					href="/orders"
					className="flex items-center px-4 py-2 mt-2 text-zinc-600 hover:bg-zinc-100 rounded-r-full"
				>
					<ClipboardList className="w-5 h-5 mr-2" />
					Comandas
				</Link>
				{/* <Link
						href="#"
						className="flex items-center px-4 py-2 mt-2 text-zinc-600 hover:bg-zinc-100 rounded-r-full"
					>
						<BarChart3 className="w-5 h-5 mr-2" />
						Estadísticas
					</Link> */}
				<Link
					href="#"
					className="flex items-center px-4 py-2 mt-2 text-zinc-600 hover:bg-zinc-100 rounded-r-full"
				>
					<Settings className="w-5 h-5 mr-2" />
					Configuración
				</Link>
			</nav>
		</aside>
	);
}

export default Aside;
