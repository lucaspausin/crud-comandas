import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReservationForm from "@/components/ReservationForm";
import Link from "next/link";
import { ChevronLeft, User } from "lucide-react";

import Aside from "@/components/Aside";

export default function AddOrderPage() {
	return (
		<div className="flex h-screen bg-zinc-50">
			{/* Sidebar */}
			<div className="absolute h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
			<Aside />

			{/* Main Content */}
			<main className="flex-1 p-6 overflow-y-auto z-50">
				<div className="flex items-center justify-between mb-6">
					<div className="flex items-center">
						<Link href="/dashboard" className="mr-4">
							<Button variant="outline" size="sm" className="rounded-full">
								<ChevronLeft className="w-4 h-4 mr-2" />
								Volver al Dashboard
							</Button>
						</Link>
						<h2 className="text-2xl font-light">Añadir Comanda</h2>
					</div>
					<div className="flex items-center space-x-2">
						<Button variant="outline" size="sm" className="rounded-full">
							<User className="w-4 h-4 mr-2" />
							Perfil
						</Button>
						<Button variant="outline" size="sm" className="rounded-full">
							Cerrar Sesión
						</Button>
					</div>
				</div>

				<Card className="">
					<CardHeader>
						<CardTitle className="text-xl font-normal">
							Detalles de la Comanda
						</CardTitle>
					</CardHeader>
					<CardContent>
						<ReservationForm />
					</CardContent>
				</Card>
			</main>
		</div>
	);
}
