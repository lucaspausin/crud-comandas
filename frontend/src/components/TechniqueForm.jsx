"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
// import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

export default function TechniqueForm() {
	const searchParams = useSearchParams();
	const commandId = searchParams.get("commandId");
	console.log(commandId);

	const [page, setPage] = useState(1);
	const [formData, setFormData] = useState({
		// Page 1
		day: "",
		month: "",
		dni: "",
		vehicle: "",
		model: "",
		year: "",
		patente: "",
		observaciones: "",

		// Page 2
		dominio: "",
		modeloPage2: "",
		color: "",
		anoPage2: "",
		detalles1: "",
		detalles2: "",
		detalles3: "",
		detalles4: "",
		observacionesEquipo: "",
		nombrePage2: "",
		firmaAclaracion: "",
		fechaPage2: "",

		// Page 3
		perdidasGas: false,
		cableado: false,
		nivelAgua: false,
		nivelAceite: false,
		inspeccionInstalacion: false,
		funcionamientoUnidad: false,
		herramientas: false,
		observacionesVehiculo: "",
		encargadoRevision: "",
		fechaPage3: "",
		kilometros: "",
		firmaPage3: "",
	});

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData((prevData) => ({
			...prevData,
			[name]: type === "checkbox" ? checked : value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (page < 3) {
			setPage(page + 1);
		} else {
			try {
				const response = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/api/techniques`,
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ ...formData, comanda_id: commandId }),
					}
				);
				if (response.ok) {
					router.push(`/commands/${commandId}`);
				} else {
					console.error("Error submitting the form");
				}
			} catch (error) {
				console.error("Request error:", error);
			}
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-8 h-screen">
			{page === 1 && (
				<div>
					<p>
						Formulario técnico de la comanda{" "}
						{commandId ? commandId : "desconocida"}
					</p>
					<div className="grid grid-cols-2 gap-4 mb-4">
						<div>
							<Label htmlFor="day">Día</Label>

							<Input
								id="day"
								name="day"
								value={formData.day}
								onChange={handleChange}
								required
							/>
						</div>
						<div>
							<Label htmlFor="month">Mes</Label>
							<Input
								id="month"
								name="month"
								value={formData.month}
								onChange={handleChange}
								required
							/>
						</div>
					</div>
					<div className="mb-4">
						<Label htmlFor="dni">DNI</Label>
						<Input
							id="dni"
							name="dni"
							value={formData.dni}
							onChange={handleChange}
							required
						/>
					</div>
					<div className="grid grid-cols-2 gap-4 mb-4">
						<div>
							<Label htmlFor="vehicle">Marca del Vehículo</Label>
							<Input
								id="vehicle"
								name="vehicle"
								value={formData.vehicle}
								onChange={handleChange}
								required
							/>
						</div>
						<div>
							<Label htmlFor="model">Modelo</Label>
							<Input
								id="model"
								name="model"
								value={formData.model}
								onChange={handleChange}
								required
							/>
						</div>
					</div>
					<div className="grid grid-cols-2 gap-4 mb-4">
						<div>
							<Label htmlFor="year">Año de Fabricación</Label>
							<Input
								id="year"
								name="year"
								value={formData.year}
								onChange={handleChange}
								required
							/>
						</div>
						<div>
							<Label htmlFor="patente">Patente</Label>
							<Input
								id="patente"
								name="patente"
								value={formData.patente}
								onChange={handleChange}
								required
							/>
						</div>
					</div>
					<div className="mb-4">
						<Label htmlFor="observaciones">Observaciones</Label>
						<Textarea
							id="observaciones"
							name="observaciones"
							value={formData.observaciones}
							onChange={handleChange}
						/>
					</div>
					<p className="text-sm text-zinc-600 mb-4">
						En el día{" "}
						<span className="text-red-500">
							{formData.day ? formData.day : "Pendiente"}
						</span>{" "}
						del mes{" "}
						<span className="text-red-500">
							{formData.month ? formData.month : "Pendiente"}
						</span>{" "}
						del 2024, en la provincia de Buenos Aires, el propietario de nombre
						y DNI{" "}
						<span className="text-red-500">
							{formData.dni ? formData.dni : "Pendiente"}
						</span>{" "}
						en adelante el Cliente del automotor, cuyas características son:
						Marca del vehículo:{" "}
						<span className="text-red-500">
							{formData.vehicle ? formData.vehicle : "Pendiente"}
						</span>
						, Modelo{" "}
						<span className="text-red-500">
							{formData.model ? formData.model : "Pendiente"}
						</span>{" "}
						y Año de fabricación:{" "}
						<span className="text-red-500">
							{formData.year ? formData.year : "Pendiente"}
						</span>
						, Patente:{" "}
						<span className="text-red-500">
							{formData.patente ? formData.patente : "Pendiente"}
						</span>
						, deja en manos conocidas como la Unidad, deja en poder del
						encargado de llevar a cabo los trabajos sobre la Unidad, en adelante
						conocido como el Establecimiento, acuerda los siguientes puntos.
					</p>
					<p className="text-sm text-zinc-600 mb-4">
						1. - El cliente manifiesta sobre la unidad los siguientes
						desperfectos o detalles no relacionados con los trabajos a realizar
						detallados en el punto anterior. Los cuales son:{" "}
						<span className="text-red-500">
							{formData.observaciones ? formData.observaciones : "Pendiente"}
						</span>
					</p>
				</div>
			)}

			{page === 2 && (
				<div className="p-6">
					<h2 className="text-2xl font-semibold mb-6">Detalles del Vehículo</h2>
					<div className="grid grid-cols-2 gap-4 mb-4">
						<div>
							<Label htmlFor="dominio">Dominio</Label>
							<Input
								id="dominio"
								name="dominio"
								value={formData.dominio}
								onChange={handleChange}
								required
							/>
						</div>
						<div>
							<Label htmlFor="modeloPage2">Modelo</Label>
							<Input
								id="modeloPage2"
								name="modeloPage2"
								value={formData.modeloPage2}
								onChange={handleChange}
								required
							/>
						</div>
					</div>
					<div className="grid grid-cols-2 gap-4 mb-4">
						<div>
							<Label htmlFor="color">Color</Label>
							<Input
								id="color"
								name="color"
								value={formData.color}
								onChange={handleChange}
								required
							/>
						</div>
						<div>
							<Label htmlFor="anoPage2">Año</Label>
							<Input
								id="anoPage2"
								name="anoPage2"
								type="number"
								value={formData.anoPage2}
								onChange={handleChange}
								required
							/>
						</div>
					</div>

					{["detalles1", "detalles2", "detalles3", "detalles4"].map(
						(detalle, index) => (
							<div key={detalle} className="mb-4 flex items-start">
								<Image
									src={`/placeholder.svg?height=100&width=100&text=Detalle ${
										index + 1
									}`}
									alt={`Detalle ${index + 1}`}
									width={100}
									height={100}
									className="mr-4"
								/>
								<div className="flex-grow">
									<Label htmlFor={detalle}>{`Detalles ${index + 1}`}</Label>
									<Select
										name={detalle}
										value={formData[detalle]}
										onValueChange={(value) =>
											handleChange({ target: { name: detalle, value } })
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Seleccione una opción" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="opcion1">Opción 1</SelectItem>
											<SelectItem value="opcion2">Opción 2</SelectItem>
											<SelectItem value="opcion3">Opción 3</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
						)
					)}

					<div className="mb-4">
						<Label htmlFor="observacionesEquipo">
							Observaciones del equipo
						</Label>
						<Textarea
							id="observacionesEquipo"
							name="observacionesEquipo"
							value={formData.observacionesEquipo}
							onChange={handleChange}
						/>
					</div>
					<div className="grid grid-cols-3 gap-4 mb-4">
						<div>
							<Label htmlFor="nombrePage2">Nombre</Label>
							<Input
								id="nombrePage2"
								name="nombrePage2"
								value={formData.nombrePage2}
								onChange={handleChange}
								required
							/>
						</div>
						<div>
							<Label htmlFor="firmaAclaracion">Firma y aclaración</Label>
							<Input
								id="firmaAclaracion"
								name="firmaAclaracion"
								value={formData.firmaAclaracion}
								onChange={handleChange}
								required
							/>
						</div>
						<div>
							<Label htmlFor="fechaPage2">Fecha</Label>
							<Input
								id="fechaPage2"
								name="fechaPage2"
								type="date"
								value={formData.fechaPage2}
								onChange={handleChange}
								required
							/>
						</div>
					</div>
				</div>
			)}

			{page === 3 && (
				<div className="p-6">
					<h2 className="text-2xl font-semibold mb-6">Check de Salida</h2>
					<div className="space-y-4">
						{[
							{ id: "perdidasGas", label: "Pérdidas de gas" },
							{ id: "cableado", label: "Cableado" },
							{ id: "nivelAgua", label: "Nivel de agua" },
							{ id: "nivelAceite", label: "Nivel de aceite" },
							{
								id: "inspeccionInstalacion",
								label: "Inspección instalación/arreglo",
							},
							{
								id: "funcionamientoUnidad",
								label: "Funcionamiento de la unidad",
							},
							{ id: "herramientas", label: "Herramientas" },
						].map(({ id, label }) => (
							<div key={id} className="flex items-center">
								<Checkbox
									id={id}
									name={id}
									checked={formData[id]}
									onCheckedChange={(checked) =>
										handleChange({
											target: { name: id, type: "checkbox", checked },
										})
									}
								/>
								<Label htmlFor={id} className="ml-2">
									{label}
								</Label>
							</div>
						))}
					</div>
					<div className="mt-4">
						<Label htmlFor="observacionesVehiculo">
							Observaciones del vehículo
						</Label>
						<Textarea
							id="observacionesVehiculo"
							name="observacionesVehiculo"
							value={formData.observacionesVehiculo}
							onChange={handleChange}
						/>
					</div>
					<div className="grid grid-cols-2 gap-4 mt-4">
						<div>
							<Label htmlFor="encargadoRevision">
								Encargado de revisión vehicular
							</Label>
							<Input
								id="encargadoRevision"
								name="encargadoRevision"
								value={formData.encargadoRevision}
								onChange={handleChange}
								required
							/>
						</div>
						<div>
							<Label htmlFor="fechaPage3">Fecha</Label>
							<Input
								id="fechaPage3"
								name="fechaPage3"
								type="date"
								value={formData.fechaPage3}
								onChange={handleChange}
								required
							/>
						</div>
						<div>
							<Label htmlFor="kilometros">Kilómetros</Label>
							<Input
								id="kilometros"
								name="kilometros"
								type="number"
								value={formData.kilometros}
								onChange={handleChange}
								required
							/>
						</div>
						<div>
							<Label htmlFor="firmaPage3">Firma</Label>
							<Input
								id="firmaPage3"
								name="firmaPage3"
								value={formData.firmaPage3}
								onChange={handleChange}
								required
							/>
						</div>
					</div>
				</div>
			)}

			<div className="flex justify-between">
				{page > 1 && (
					<Button type="button" onClick={() => setPage(page - 1)}>
						Anterior
					</Button>
				)}
				<Button type="submit">{page === 3 ? "Finalizar" : "Siguiente"}</Button>
			</div>
		</form>
	);
}
