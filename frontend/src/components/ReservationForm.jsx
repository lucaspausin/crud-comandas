"use client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import axios from "axios";

function ReservationForm() {
	const [client, setClient] = useState({
		usuario_id: 1,
		nombre_completo: "",
		dni: "",
		domicilio: "",
		localidad: "",
		telefono: "",
	});

	const [vehicle, setVehicle] = useState({
		modelo_patente: "",
		equipo: "",
		precio: "",
		reforma_escape: false,
		carga_externa: false,
		sena: "",
		monto_final_abonar: "",
		fecha_instalacion: "", // Este campo se convertirá a un string ISO antes de enviar el formulario
	});

	const handleClientChange = (e) => {
		const { name, value } = e.target;
		setClient((prevClient) => ({
			...prevClient,
			[name]: value.toUpperCase(),
		}));
	};

	const formatCurrency = (value) => {
		const cleanedValue = value.replace(/[^0-9]/g, "");
		return cleanedValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
	};

	const handleVehicleChange = (e) => {
		const { name, type, checked, value } = e.target;
		const formattedValue =
			name === "precio" || name === "sena" || name === "monto_final_abonar"
				? formatCurrency(value)
				: value.toUpperCase(); // Convertir a mayúsculas

		setVehicle((prevVehicle) => ({
			...prevVehicle,
			[name]: type === "checkbox" ? checked : formattedValue,
		}));
	};

	const handleCheckboxChange = (name) => (checked) => {
		setVehicle((prevVehicle) => ({
			...prevVehicle,
			[name]: checked,
		}));
	};

	const form = useRef(null);

	const handleSubmit = async (e) => {
		e.preventDefault();

		// Obtener la fecha de instalación
		const fechaInstalacion = vehicle.fecha_instalacion;

		// Crear la fecha y hora actuales si hay una fecha de instalación
		const currentDateTime = new Date();

		// Solo asignar la hora actual si se ha ingresado una fecha
		let formattedFechaInstalacion = "";
		if (fechaInstalacion) {
			formattedFechaInstalacion = new Date(
				`${fechaInstalacion}T${currentDateTime.getHours()}:${currentDateTime.getMinutes()}:00.000Z`
			).toISOString();
		}

		const reservationData = {
			...client,
			...vehicle,
			fecha_instalacion: formattedFechaInstalacion, // Establecer la fecha y hora en el formato correcto
			precio:
				parseFloat(vehicle.precio.replace(/\./g, "").replace(",", ".")) || 0,
			sena: parseFloat(vehicle.sena.replace(/\./g, "").replace(",", ".")) || 0,
			monto_final_abonar:
				parseFloat(
					vehicle.monto_final_abonar.replace(/\./g, "").replace(",", ".")
				) || 0,
		};

		try {
			const response = await axios.post(
				`${process.env.NEXT_PUBLIC_API_URL}/api/reservations`,
				reservationData
			);
			console.log(response.data);
			if (form.current) form.current.reset();
			setClient({
				usuario_id: 1,
				nombre_completo: "",
				dni: "",
				domicilio: "",
				localidad: "",
				telefono: "",
			});
			setVehicle({
				modelo_patente: "",
				equipo: "",
				precio: "",
				reforma_escape: false,
				carga_externa: false,
				sena: "",
				monto_final_abonar: "",
				fecha_instalacion: "",
			});
		} catch (error) {
			console.error(
				"Error al crear la reserva:",
				error.response?.data || error
			);
		}
	};

	return (
		<form className="space-y-6 " onSubmit={handleSubmit} ref={form}>
			<div className="space-y-2">
				<Label htmlFor="usuario_id" className="font-normal">
					Asesor de ventas
				</Label>
				<Input
					id="usuario_id"
					name="usuario_id"
					placeholder="Nombre del asesor"
					className="rounded-full"
					value={1}
				/>
			</div>
			<div className="space-y-4">
				<h3 className="text-lg font-normal">Datos del cliente</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="space-y-2">
						<Label htmlFor="nombre_completo" className="font-normal">
							Nombre completo
						</Label>
						<Input
							name="nombre_completo"
							id="nombre_completo"
							placeholder="Nombre completo"
							className="rounded-full"
							value={client.nombre_completo}
							onChange={handleClientChange}
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="dni" className="font-normal">
							DNI
						</Label>
						<Input
							name="dni"
							id="dni"
							type="number"
							placeholder="Número de DNI"
							className="rounded-full"
							value={client.dni}
							onChange={handleClientChange}
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="domicilio" className="font-normal">
							Domicilio
						</Label>
						<Input
							name="domicilio"
							id="domicilio"
							placeholder="Dirección"
							value={client.domicilio}
							className="rounded-full"
							onChange={handleClientChange}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="localidad" className="font-normal">
							Localidad
						</Label>
						<Input
							name="localidad"
							id="localidad"
							placeholder="Localidad"
							value={client.localidad}
							onChange={handleClientChange}
							className="rounded-full"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="telefono" className="font-normal">
							Teléfono
						</Label>
						<Input
							name="telefono"
							id="telefono"
							type="tel"
							placeholder="Número de teléfono"
							value={client.telefono}
							onChange={handleClientChange}
							className="rounded-full"
						/>
					</div>
				</div>
			</div>
			<div className="space-y-4">
				<h3 className="text-lg font-normal">Datos del vehículo</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="space-y-2">
						<Label htmlFor="modelo_patente" className="font-normal">
							Modelo patente
						</Label>
						<Input
							name="modelo_patente"
							id="modelo_patente"
							placeholder="Modelo y patente"
							value={vehicle.modelo_patente}
							onChange={handleVehicleChange}
							className="rounded-full"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="equipo" className="font-normal">
							Equipo
						</Label>
						<Input
							name="equipo"
							id="equipo"
							placeholder="Equipo"
							value={vehicle.equipo}
							onChange={handleVehicleChange}
							className="rounded-full"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="precio" className="font-normal">
							Precio
						</Label>
						<Input
							name="precio"
							id="precio"
							type="text" // Cambiado a text
							placeholder="Precio"
							value={vehicle.precio}
							onChange={handleVehicleChange}
							className="rounded-full"
						/>
					</div>
					<div className="flex flex-col justify-between mt-4">
						<div className="flex items-center space-x-2 font-normal ">
							<Checkbox
								id="reforma_escape"
								checked={vehicle.reforma_escape}
								onCheckedChange={handleCheckboxChange("reforma_escape")}
							/>
							<Label htmlFor="reforma_escape" className="font-normal">
								Reforma de escape
							</Label>
						</div>
						<div className="flex items-center space-x-2 ">
							<Checkbox
								id="carga_externa"
								checked={vehicle.carga_externa}
								onCheckedChange={handleCheckboxChange("carga_externa")}
							/>
							<Label htmlFor="carga_externa" className="font-normal">
								Carga externa
							</Label>
						</div>
					</div>
					<div className="space-y-2">
						<Label htmlFor="sena" className="font-normal">
							Seña
						</Label>
						<Input
							name="sena"
							id="sena"
							type="text" // Cambiado a text
							placeholder="Monto de seña"
							value={vehicle.sena}
							onChange={handleVehicleChange}
							className="rounded-full"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="monto_final_abonar" className="font-normal">
							Monto final a abonar
						</Label>
						<Input
							name="monto_final_abonar"
							id="monto_final_abonar"
							type="text" // Cambiado a text
							placeholder="Monto final"
							value={vehicle.monto_final_abonar}
							onChange={handleVehicleChange}
							className="rounded-full"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="fecha_instalacion" className="font-normal">
							Fecha de instalación
						</Label>
						<Input
							name="fecha_instalacion"
							id="fecha_instalacion"
							type="date"
							value={vehicle.fecha_instalacion} // Este campo se mantiene en formato YYYY-MM-DD
							onChange={handleVehicleChange}
							required
							className="rounded-full"
						/>
					</div>
				</div>
			</div>
			<Button type="submit" className="w-full rounded-full">
				Añadir Comanda
			</Button>
		</form>
	);
}

export default ReservationForm;
