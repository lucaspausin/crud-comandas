"use client";
import { Card, CardContent } from "@/components/ui/card";
import ReservationForm from "@/components/ReservationForm";
import { useEffect } from "react";

import HomeIcon from "@/components/HomeIcon";

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
			<main className="flex-1 p-6 z-[40] relative">
				<div className="flex items-center justify-between mb-6">
					<div className="flex items-center gap-2">
						<HomeIcon label="Volver"></HomeIcon>
						<h2 className="text-base font-normal text-zinc-700">
							Añadir Reserva
						</h2>
					</div>
				</div>
				<Card className="border-none shadow-lg">
					<CardContent className="pt-6">
						<ReservationForm />
					</CardContent>
				</Card>
			</main>
		</div>
	);
}
