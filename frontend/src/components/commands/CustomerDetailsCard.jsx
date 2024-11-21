import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CustomerDetailsCard = ({ cliente }) => {
	return (
		<Card className="rounded-xl shadow-lg border-none">
			<CardHeader>
				<CardTitle className="text-xl font-light text-zinc-800">
					Detalles del Cliente
				</CardTitle>
			</CardHeader>
			<CardContent>
				<dl className="grid grid-cols-2 gap-2 text-sm">
					<dt className="font-normal text-zinc-600">Nombre:</dt>
					<dd>{cliente.nombre_completo}</dd>
					<dt className="font-normal text-zinc-600">DNI:</dt>
					<dd>{cliente.dni}</dd>
					<dt className="font-normal text-zinc-600">Domicilio:</dt>
					<dd>{cliente.domicilio}</dd>
					<dt className="font-normal text-zinc-600">Localidad:</dt>
					<dd>{cliente.localidad}</dd>
					<dt className="font-normal text-zinc-600">Teléfono:</dt>
					<dd className="truncate">+549{cliente.telefono}@s.whatsapp.net</dd>
				</dl>
			</CardContent>
		</Card>
	);
};

export default CustomerDetailsCard;
