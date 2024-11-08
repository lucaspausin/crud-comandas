"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import ToastNotification from "@/components/ToastNotification";
import { useSession } from "next-auth/react";
// import { getEventsCalendar } from "../app/reservations/reservations.api";

import axios from "axios";

function ReservationForm() {
	const router = useRouter();
	const { data: session } = useSession();

	// const userRole = session?.user?.role;
	// const loggedUserEmail = session?.user?.email;
	const loggedUserId = session?.user?.id;

	const [client, setClient] = useState({
		usuario_id: loggedUserId ? Number(loggedUserId) : null,
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

	const [eventCount, setEventCount] = useState(0);
	const [warningMessage, setWarningMessage] = useState("");

	const fetchEventCount = async (selectedDate) => {
		try {
			const { data } = await axios.get(
				`${process.env.NEXT_PUBLIC_API_URL}/api/calendar/`
			);

			// Filtrar eventos en la fecha seleccionada
			const eventsOnDate = data.filter((event) => {
				const eventDate = new Date(event.fecha_inicio)
					.toISOString()
					.split("T")[0];
				return eventDate === selectedDate;
			});

			setEventCount(eventsOnDate.length); // Actualiza el conteo de eventos para la fecha seleccionada

			if (eventsOnDate.length >= 5) {
				setWarningMessage(
					"ATENCIÓN: Ya no hay lugares disponibles en esta fecha."
				);
			} else if (eventsOnDate.length === 4) {
				setWarningMessage(
					"ATENCIÓN: Lugares llenos, preguntar por un lugar extra."
				);
			} else {
				setWarningMessage(""); // Resetear el mensaje si no hay advertencias
			}
		} catch (error) {
			console.error("Error al obtener eventos:", error);
		}
	};

	useEffect(() => {
		fetchEventCount(); // Llamar a la función al montar el componente
	}, []);

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
				: value.toUpperCase();

		setVehicle((prevVehicle) => ({
			...prevVehicle,
			[name]: type === "checkbox" ? checked : formattedValue,
		}));

		// Check if the name is "fecha_instalacion" and trigger event count check
		if (name === "fecha_instalacion") {
			// Verifica si el valor tiene exactamente 10 caracteres (formato YYYY-MM-DD)
			if (value.length === 10) {
				try {
					const selectedDate = new Date(value).toISOString().split("T")[0];
					fetchEventCount(selectedDate);
				} catch (error) {
					console.error("Fecha inválida:", error);
				}
			} else {
				// Resetea el mensaje de advertencia si no se ha ingresado una fecha completa
				setWarningMessage("");
			}
		}
	};

	const handleCheckboxChange = (name) => (checked) => {
		setVehicle((prevVehicle) => ({
			...prevVehicle,
			[name]: checked,
		}));
	};

	const [localidades, setLocalidades] = useState([]);
	const [filteredLocalidades, setFilteredLocalidades] = useState([]);
	const [showSuggestions, setShowSuggestions] = useState(false);

	const form = useRef(null);
	const inputRef = useRef(null);
	const fetchLocalidades = async () => {
		try {
			// Llamada para obtener localidades de Buenos Aires
			const responseBA = await axios.get(
				"https://apis.datos.gob.ar/georef/api/localidades?provincia=buenos aires&campos=nombre&max=1000"
			);

			// Obtener localidades y eliminar duplicados
			const localidadesUnicas = Array.from(
				new Set(
					responseBA.data.localidades.map((localidad) => localidad.nombre)
				)
			).map((nombre) => {
				return responseBA.data.localidades.find(
					(localidad) => localidad.nombre === nombre
				);
			});

			// Ordenar localidades alfabéticamente
			const sortedLocalidades = localidadesUnicas.sort((a, b) => {
				if (a.nombre < b.nombre) return -1;
				if (a.nombre > b.nombre) return 1;
				return 0;
			});

			setLocalidades(sortedLocalidades); // Guardar las localidades de Buenos Aires en el estado
		} catch (error) {
			console.error("Error al obtener localidades:", error);
		}
	};

	useEffect(() => {
		fetchLocalidades(); // Llamar a la función al montar el componente
	}, []);

	const handleLocalidadChange = (e) => {
		const value = e.target.value.toUpperCase(); // Convertir a mayúsculas
		setClient((prevClient) => ({
			...prevClient,
			localidad: value,
		}));

		// Filtrar las localidades basadas en el valor ingresado
		const filtered = localidades.filter(
			(localidad) => localidad.nombre.toUpperCase().includes(value) // Comparar en mayúsculas
		);

		setFilteredLocalidades(filtered);
		setShowSuggestions(value !== ""); // Muestra sugerencias si hay texto
	};

	const handleSuggestionClick = (localidad) => {
		setClient((prevClient) => ({
			...prevClient,
			localidad: localidad.nombre.toUpperCase(), // Convertir a mayúsculas al seleccionar
		}));
		setShowSuggestions(false);
	};

	const handleInputFocus = () => {
		setShowSuggestions(true); // Mostrar sugerencias al enfocar
		setFilteredLocalidades(localidades); // Mostrar todas las localidades
	};

	const handleClickOutside = (event) => {
		if (inputRef.current && !inputRef.current.contains(event.target)) {
			setShowSuggestions(false); // Ocultar sugerencias si se hace clic fuera
		}
	};

	useEffect(() => {
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const [showToast, setShowToast] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();

		const fechaInstalacion = vehicle.fecha_instalacion;

		let formattedFechaInstalacion = "";

		const utcDate = new Date(fechaInstalacion);

		if (!isNaN(utcDate.getTime())) {
			const localDate = new Date(utcDate.getTime() + 3 * 60 * 60 * 1000);

			// Establecer la hora a las 08:30
			localDate.setHours(8);
			localDate.setMinutes(30);
			localDate.setSeconds(0);
			localDate.setMilliseconds(0);

			formattedFechaInstalacion = localDate.toISOString();
		} else {
			console.error("Fecha de instalación inválida:", fechaInstalacion);
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

			const reservationId = response.data?.reserva?.id;
			console.log(reservationId);

			if (form.current) form.current.reset();
			setClient({
				usuario_id: "",
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
			// const successMessage = "Reserva añadida exitosamente.";

			// setShowToast(successMessage);
			router.push(`/reservations/${reservationId}`);
		} catch (error) {
			let responseErrorMessage = "Error al crear la reserva";

			// Verifica si hay respuesta del servidor
			if (error.response) {
				const { data } = error.response;
				responseErrorMessage = data.message;
			}

			// Muestra el mensaje de error capturado
			console.log(responseErrorMessage); // Muestra el mensaje de error en consola
			setShowToast(responseErrorMessage);
		}
		// setTimeout(() => {
		// 	router.push("/reservations");
		// 	router.refresh();
		// }, 5000);
	};

	return (
		<>
			<form
				className={`space-y-6 p-6 border  rounded-lg  relative ${
					warningMessage
						? eventCount >= 5
							? "border border-pink-900"
							: eventCount === 4
							? "border border-red-500"
							: ""
						: ""
				}`}
				onSubmit={handleSubmit}
				ref={form}
			>
				<div className="space-y-4">
					<div className="flex flex-row items-center justify-between w-full">
						<h3 className="text-xl font-light text-zinc-700">
							Datos del cliente
						</h3>
						{warningMessage && (
							<div
								className={` text-sm z-50 m-0 ${
									eventCount >= 5
										? "text-pink-900"
										: eventCount === 4
										? "text-red-500"
										: ""
								}`}
							>
								{warningMessage} ({eventCount} reservas)
							</div>
						)}
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label
								htmlFor="nombre_completo"
								className="font-normal text-zinc-800"
							>
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
							<Label htmlFor="dni" className="font-normal text-zinc-800">
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
							<Label htmlFor="domicilio" className="font-normal text-zinc-800">
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
						<div className="space-y-2 flex flex-col justify-center text-sm">
							<Label
								htmlFor="localidad"
								className="font-normal mt-2 text-zinc-800"
							>
								Localidad
							</Label>
							<div className="relative w-full" ref={inputRef}>
								<Input
									type="text"
									name="localidad"
									id="localidad"
									value={client.localidad}
									onChange={handleLocalidadChange}
									onFocus={handleInputFocus} // Mostrar todas las localidades al enfocar
									placeholder="Buscar localidad..."
									className="w-full rounded-full px-4 py-[0.5rem] border-[#E4E4E7] border focus:outline placeholder:font-normal placeholder:text-zinc-500"
								/>
								{showSuggestions && (
									<ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md max-h-60 overflow-auto">
										{filteredLocalidades.map((localidad) => (
											<li
												key={localidad.id}
												onClick={() => handleSuggestionClick(localidad)}
												className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
											>
												{localidad.nombre.toUpperCase()}
											</li>
										))}
									</ul>
								)}
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="telefono" className="font-normal text-zinc-800">
								Teléfono (Ej: 1124033487, sin +549)
							</Label>
							<Input
								name="telefono"
								id="telefono"
								type="number"
								placeholder="Número de teléfono"
								value={client.telefono}
								onChange={handleClientChange}
								className="rounded-full"
								required
							/>
						</div>
					</div>
				</div>
				<div className="space-y-4">
					<h3 className="text-xl font-light text-zinc-700">
						Datos del vehículo
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label
								htmlFor="modelo_patente"
								className="text-zinc-800 font-normal"
							>
								Modelo patente
							</Label>
							<Input
								name="modelo_patente"
								id="modelo_patente"
								placeholder="Modelo y patente"
								value={vehicle.modelo_patente}
								onChange={handleVehicleChange}
								className="rounded-full"
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="equipo" className="font-normal text-zinc-800">
								Equipo
							</Label>
							<Input
								name="equipo"
								id="equipo"
								placeholder="Equipo"
								value={vehicle.equipo}
								onChange={handleVehicleChange}
								className="rounded-full"
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="precio" className="font-normal text-zinc-800">
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
								required
							/>
						</div>
						<div className="flex flex-col justify-between mt-4 gap-4 md:gap-0">
							<div className="flex items-center space-x-2 font-normal ">
								<Checkbox
									id="reforma_escape"
									checked={vehicle.reforma_escape}
									onCheckedChange={handleCheckboxChange("reforma_escape")}
								/>
								<Label
									htmlFor="reforma_escape"
									className="font-normal text-zinc-800"
								>
									Reforma de escape
								</Label>
							</div>
							<div className="flex items-center space-x-2 ">
								<Checkbox
									id="carga_externa"
									checked={vehicle.carga_externa}
									onCheckedChange={handleCheckboxChange("carga_externa")}
								/>
								<Label
									htmlFor="carga_externa"
									className="font-normal text-zinc-800"
								>
									Carga externa
								</Label>
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="sena" className="font-normal text-zinc-800">
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
							<Label
								htmlFor="monto_final_abonar"
								className="font-normal text-zinc-800"
							>
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
								required
							/>
						</div>

						<div className="space-y-2">
							<Label
								htmlFor="fecha_instalacion"
								className="font-normal text-zinc-800"
							>
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
				<Button
					type="submit"
					className={`w-full rounded-full ${
						eventCount >= 5 ? "opacity-50 cursor-not-allowed" : ""
					}`}
					disabled={eventCount >= 5} // Deshabilita el botón si el eventCount es 5 o más
				>
					Añadir Reserva
				</Button>
			</form>
			<ToastNotification
				message={showToast}
				show={!!showToast}
				onClose={() => setShowToast("")}
				type={showToast.includes("Error") ? "error" : "success"} // Determina el tipo basado en el mensaje
			/>
		</>
	);
}

export default ReservationForm;
