"use client";
import { Card, CardContent } from "@/components/ui/card";
import ReservationForm from "@/components/ReservationForm";
import { useEffect } from "react";

// import HomeIcon from "@/components/HomeIcon";

import Aside from "@/components/Aside";

export default function AddOrderPage() {
	useEffect(() => {
		document.title = "Motorgas - Añadir Reserva";
	}, []);

	return (
		<div className="flex bg-zinc-50">
			{/* Sidebar */}

			<Aside />

			{/* Main Content */}
			<main className="flex-1 p-6 lg:px-8 xl:px-8 z-[40]">
				{/* <HomeIcon /> */}
				<Card className="border-none shadow-lg">
					<CardContent className="pt-6 ">
						<ReservationForm />
					</CardContent>
				</Card>
			</main>
		</div>
	);
}
