"use client";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	ChevronLeft,
	User,

} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import myImage from "@/public/motorgasblue.png";

import html2pdf from "html2pdf.js";

import Aside from "@/components/Aside";

export default function ReservationDetailPage() {
	const slidesRef = useRef(null);
	const handleGeneratePdf = () => {
		const opt = {
			margin: 1,
			filename: "document.pdf",
			image: { type: "jpeg", quality: 0.98 },
			html2canvas: { scale: 2 },
			jsdPDF: { unit: "in", format: "letter", orientation: "portrait" },
		};
		html2pdf().from(slidesRef.current).set(opt).save();
	};
	return (
		<div className="flex h-screen bg-gray-50">
			{/* Sidebar */}
			<Aside />

			{/* Main Content */}
			<main className="flex-1 p-6 overflow-y-auto">
				<div className="flex items-center justify-between mb-6">
					<div className="flex items-center">
						<Link href="/reservations">
							<Button variant="outline" size="sm" className="rounded-full mr-4">
								<ChevronLeft className="w-4 h-4 mr-2" />
								Volver a Reservas
							</Button>
						</Link>
						<h2 className="text-2xl font-light">Detalle de Reserva</h2>
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
				<Button onClick={handleGeneratePdf}>Download</Button>
				<Card
					className="rounded-xl max-w-3xl mx-auto bg-white shadow-lg"
					ref={slidesRef}
				>
					<CardHeader className="border-b">
						<div className="flex justify-between items-center">
							<CardTitle className="text-xl font-light">
								Boleto de Reserva #R001
							</CardTitle>
							{/* <Button variant="outline" size="sm" className="rounded-full">
								<Download className="w-4 h-4 mr-2" />
								Descargar PDF
							</Button> */}
						</div>
					</CardHeader>
					<CardContent className="p-6">
						<div className="flex items-start mb-8 space-x-6">
							<Image
								src={myImage}
								alt="Motorgas GNC Logo"
								width={90}
								height={90}
								className="rounded-lg object-cover"
							/>
							<div className="text-sm text-gray-600">
								<p className="font-medium text-base mb-2">Motorgas GNC</p>
								<p>De Joaquín González Silvestri</p>
								<p>CUIT 20-31464354-3</p>
								<p>Av. Presidente Perón 3679</p>
								<p>Morón, BsAs, Argentina</p>
								<p>Whatsapp: 113869-3053</p>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-x-8 gap-y-6 mb-8">
							<div>
								<p className="text-sm font-medium text-gray-500 mb-1">
									Cliente
								</p>
								<p className="text-sm">Juan Pérez</p>
							</div>
							<div>
								<p className="text-sm font-medium text-gray-500 mb-1">DNI</p>
								<p className="text-sm">12345678</p>
							</div>
							<div>
								<p className="text-sm font-medium text-gray-500 mb-1">
									Teléfono
								</p>
								<p className="text-sm">+54 9 11 1234-5678</p>
							</div>
							<div>
								<p className="text-sm font-medium text-gray-500 mb-1">Email</p>
								<p className="text-sm">juan.perez@email.com</p>
							</div>
							<div>
								<p className="text-sm font-medium text-gray-500 mb-1">
									Modelo del Vehículo
								</p>
								<p className="text-sm">Toyota Corolla 2023</p>
							</div>
							<div>
								<p className="text-sm font-medium text-gray-500 mb-1">
									Patente
								</p>
								<p className="text-sm">ABC 123</p>
							</div>
							<div>
								<p className="text-sm font-medium text-gray-500 mb-1">
									Fecha de Reserva
								</p>
								<p className="text-sm">15 de Mayo, 2023</p>
							</div>
							<div>
								<p className="text-sm font-medium text-gray-500 mb-1">
									Hora de Reserva
								</p>
								<p className="text-sm">09:30 AM</p>
							</div>
							<div>
								<p className="text-sm font-medium text-gray-500 mb-1">
									Servicio
								</p>
								<p className="text-sm">Instalación de GNC</p>
							</div>
							<div>
								<p className="text-sm font-medium text-gray-500 mb-1">Precio</p>
								<p className="text-sm">$150,000</p>
							</div>
						</div>

						<div className="mt-8 pt-8 border-t text-sm text-gray-600 space-y-2">
							<p>
								La recepción de vehículos comienza a las 8:30 hs, por orden de
								llegada.
							</p>
							<p>El pago total deberá efectuarse al momento de ingreso.</p>
							<p>
								La entrega de los vehículos se realizará a partir de las 17:30
								hs de lunes a viernes, o a partir de las 13:30 hs los sábados.
							</p>
						</div>
					</CardContent>
				</Card>
			</main>
		</div>
	);
}
