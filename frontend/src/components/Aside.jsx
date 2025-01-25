"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import myImage from "@/public/motorgas2.svg";
import {
	ClipboardList,
	PlusCircle,
	DoorOpen,
	Ticket,
	CalendarDays,
	LogIn,
	Settings,
} from "lucide-react";
// Settings,
// User,
// MessageCircleQuestion;
import { motion } from "framer-motion";
import { usePathname, useParams } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

function Aside() {
	const { data: session } = useSession();
	const pathname = usePathname();
	const params = useParams(); // Obtener los parámetros de la URL
	const [hoveredIndex, setHoveredIndex] = useState(null);

	const reservationId = pathname.startsWith("/reservations") ? params.id : null;
	// const userId = pathname.startsWith("/users") ? session?.user?.id : null;
	const commandId = pathname.startsWith("/commands") ? params.id : null;

	const settingsId = pathname.startsWith("/settings") ? params.id : null;

	// Determinar el rol del usuario
	const userRole = session?.user?.role; // Asume que el rol se almacena aquí

	// Crear el menú según el rol
	const menuItems = [];

	// Roles:
	// 1: Vendedor
	// 2: Técnico
	// 3: Charly

	if (userRole === 1) {
		// Vendedor
		menuItems.push(
			{
				href: "/add-order",
				icon: <PlusCircle className="w-5 h-5" />,
				label: "Añadir Reserva",
				showOnMobile: true,
			},
			{
				href: reservationId ? "/reservations" : "/reservations",
				icon: <Ticket className="w-5 h-5" />,
				label: "Reservas",
				showOnMobile: false,
			},
			{
				href: "/calendar",
				icon: <CalendarDays className="w-5 h-5" />,
				label: "Calendario",
				showOnMobile: true,
			}
			// {
			// 	href: "/axis",
			// 	icon: <MessageCircleQuestion className="w-5 h-5" />,
			// 	label: "Catalogo",
			// 	showOnMobile: true,
			// },
			// {
			// 	href: userId
			// 		? `/users/${session?.user?.id}`
			// 		: `/users/${session?.user?.id}`,
			// 	icon: <User className="w-5 h-5" />,
			// 	label: "Perfil",
			// 	showOnMobile: false,
			// }
		);
	} else if (userRole === 2) {
		// Técnico
		menuItems
			.push
			// {
			// 	href: "/commands",
			// 	icon: <ClipboardList className="w-5 h-5" />,
			// 	label: "Comandas",
			// 	showOnMobile: true,
			// },
			// {
			// 	href: userId
			// 		? `/users/${session?.user?.id}`
			// 		: `/users/${session?.user?.id}`,
			// 	icon: <User className="w-5 h-5" />,
			// 	label: "Perfil",
			// 	showOnMobile: true,
			// }
			();
	} else if (userRole === 3) {
		// Charly (Admin)
		menuItems.push(
			{
				href: "/add-order",
				icon: <PlusCircle className="w-5 h-5" />,
				label: "Añadir Reserva",
				showOnMobile: false,
			},
			// {
			// 	href: reservationId ? "/reservations" : "/reservations",
			// 	icon: <Ticket className="w-5 h-5" />,
			// 	label: "Reservas",
			// 	showOnMobile: true,
			// },
			{
				href: commandId ? "/commands" : "/commands",
				icon: <ClipboardList className="w-5 h-5" />,
				label: "Comandas",
				showOnMobile: true,
			},
			{
				href: "/calendar",
				icon: <CalendarDays className="w-5 h-5" />,
				label: "Calendario",
				showOnMobile: true,
			},
			{
				href: settingsId ? "/settings" : "/settings",
				icon: <Settings className="w-5 h-5" />,
				label: "Ajustes",
				showOnMobile: true,
			}
		);
	}
	if (!session) {
		menuItems.push({
			href: "/login",
			icon: <LogIn className="w-5 h-5" />,
			label: "Iniciar Sesión",
			showOnMobile: true,
		});
	}

	// 	{
	// 	href: userId
	// 		? `/users/${session?.user?.id}`
	// 		: `/users/${session?.user?.id}`,
	// 	icon: <User className="w-5 h-5" />,
	// 	label: "Perfil",
	// 	showOnMobile: true,
	// }

	return (
		<aside className="flex gap-2 sm:gap-4 items-center w-fit rounded-full bg-white shadow-lg z-[99] fixed top-4 mx-auto left-0 right-0 py-2 px-2 sm:px-4">
			<div>
				<Link
					href="/dashboard"
					className={`flex hover:bg-zinc-100 items-center px-2 sm:px-4 rounded-full ${
						pathname === "/dashboard" ? "bg-zinc-100" : ""
					}`}
					onMouseEnter={() => setHoveredIndex("dashboard")}
					onMouseLeave={() => setHoveredIndex(null)}
				>
					<Image
						src={myImage}
						alt="Descripción de la imagen"
						className="w-7 h-7 sm:w-9 sm:h-9 object-contain opacity-90"
						loading="eager"
					/>
					<motion.span
						className="ml-0 whitespace-nowrap overflow-hidden transition-colors duration-300 text-sm text-zinc-700 hidden sm:block"
						initial={{ opacity: 0, width: 0 }}
						animate={{
							opacity:
								pathname === "/dashboard" || hoveredIndex === "dashboard"
									? 1
									: 0,
							width:
								pathname === "/dashboard" || hoveredIndex === "dashboard"
									? "auto"
									: 0,
						}}
						transition={{ duration: 0.3 }}
					></motion.span>
				</Link>
			</div>
			<nav className="flex items-center gap-2 sm:gap-4">
				{menuItems.map(({ href, icon, label, showOnMobile }, index) => {
					const isActive =
						pathname === href ||
						(href === "/reservations" &&
							pathname.startsWith("/reservations")) ||
						(href === "/commands" && pathname.startsWith("/commands")) ||
						(href === "/settings" && pathname.startsWith("/settings"));

					return (
						<Link
							key={label}
							href={href}
							className={`flex items-center group px-4 py-2 rounded-full ${
								isActive ? "bg-zinc-100 text-zinc-700" : "text-zinc-700"
							} hover:bg-zinc-100 ${!showOnMobile ? "hidden sm:flex" : ""}`}
							onMouseEnter={() => setHoveredIndex(index)}
							onMouseLeave={() => setHoveredIndex(null)}
						>
							{icon}
							<motion.span
								className={`ml-2 whitespace-nowrap overflow-hidden transition-colors duration-300 text-sm text-zinc-700 hidden sm:block`}
								initial={{ opacity: 0, width: 0 }}
								animate={{
									opacity: isActive || hoveredIndex === index ? 1 : 0,
									width: isActive || hoveredIndex === index ? "auto" : 0,
								}}
								transition={{ duration: 0.3 }}
							>
								{label}
							</motion.span>
						</Link>
					);
				})}
				{session && (
					<button
						onClick={() => signOut()}
						className={`flex items-center group px-4 py-2 rounded-full text-zinc-700 hover:bg-zinc-100`}
						onMouseEnter={() => setHoveredIndex(menuItems.length)} // Índice ficticio para el botón
						onMouseLeave={() => setHoveredIndex(null)}
					>
						<DoorOpen className="w-5 h-5 text-red-500" />
						<motion.span
							className="ml-2 whitespace-nowrap overflow-hidden transition-colors duration-300 text-sm text-red-500 hidden sm:block"
							initial={{ opacity: 0, width: 0 }}
							animate={{
								opacity: hoveredIndex === menuItems.length ? 1 : 0,
								width: hoveredIndex === menuItems.length ? "auto" : 0,
							}}
							transition={{ duration: 0.3 }}
						>
							Cerrar Sesión
						</motion.span>
					</button>
				)}
			</nav>
		</aside>
	);
}

export default Aside;
