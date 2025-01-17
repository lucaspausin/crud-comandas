"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import ToastNotification from "@/components/ToastNotification";
import { useSession } from "next-auth/react";
// import { getEventsCalendar } from "../app/reservations/reservations.api";

import axios from "axios";
import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";

import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";

import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
// Registrar los plugins de FilePond
registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

function ReservationForm() {
	const router = useRouter();
	const { data: session, status } = useSession();

	// Inicializar con null o 0 en lugar de un posible NaN
	const [client, setClient] = useState({
		usuario_id: null,
		nombre_completo: "",
		dni: "",
		domicilio: "",
		localidad: "",
		telefono: "",
	});

	const [users, setUsers] = useState([]);

	const fetchUsers = async () => {
		try {
			const response = await axios.get(
				`${process.env.NEXT_PUBLIC_API_URL}/api/users/`
			);
			console.log("Usuarios obtenidos:", response.data);
			setUsers(response.data);
		} catch (error) {
			console.error("Error al obtener usuarios:", error);
		}
	};

	useEffect(() => {
		if (status === "authenticated" && session?.user?.id) {
			const userId = parseInt(session.user.id);
			if (!isNaN(userId)) {
				// Si NO es el admin (ID 3), establecemos el usuario_id automáticamente
				if (userId !== 1) {
					setClient((prev) => ({
						...prev,
						usuario_id: userId,
					}));
				}
				// Si es el admin, solo cargamos la lista de usuarios
				if (userId === 1) {
					console.log("Usuario es admin, cargando lista de usuarios");
					fetchUsers();
					// No establecemos usuario_id - se establecerá mediante el select
					setClient((prev) => ({
						...prev,
						usuario_id: null, // Reseteamos a null hasta que se seleccione un usuario
					}));
				}
			}
		}
	}, [session, status]);

	// const userRole = session?.user?.role;
	// const loggedUserEmail = session?.user?.email;
	const loggedUserId = Number(session?.user?.id);
	const loggedUserId2 = session?.user?.role;

	console.log(loggedUserId2);

	const [vehicle, setVehicle] = useState({
		marca_vehiculo: "",
		modelo_vehiculo: "",
		patente_vehiculo: "",

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

	const [files, setFiles] = useState([]); // State para almacenar los archivos seleccionados

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

	// Add loading state
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true); // Start loading
		if (loggedUserId === 3 && !client.usuario_id) {
			setShowToast("Por favor, seleccione un usuario");
			setLoading(false);
			return;
		}
		const fechaInstalacion = vehicle.fecha_instalacion;

		let formattedFechaInstalacion = "";

		const utcDate = new Date(fechaInstalacion);

		if (!isNaN(utcDate.getTime())) {
			// Configurar la hora en UTC a las 08:30
			utcDate.setUTCHours(8);
			utcDate.setUTCMinutes(30);
			utcDate.setUTCSeconds(0);
			utcDate.setUTCMilliseconds(0);

			// Convertir a formato ISO, lo cual será en UTC con la hora 08:30
			formattedFechaInstalacion = utcDate.toISOString();
			console.log(
				"Fecha de instalación ajustada en UTC:",
				formattedFechaInstalacion
			);
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

			const comandaId = response.data?.comanda?.id;
			console.log(comandaId);

			// Esperar un segundo antes de subir los archivos (opcional)
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Subir archivos a la comanda
			await Promise.all(
				files.map(async (file) => {
					const formData = new FormData();
					formData.append("file", file.file);
					formData.append(
						"usuarioId",
						String(client.usuario_id || loggedUserId)
					);
					console.log(formData);

					await axios.post(
						`${process.env.NEXT_PUBLIC_API_URL}/api/files/${comandaId}`,
						formData,
						{
							headers: {
								"Content-Type": "multipart/form-data",
							},
						}
					);
				})
			);

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
				marca_vehiculo: "",
				modelo_vehiculo: "",
				patente_vehiculo: "",
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
			router.push(`/reservations/${response.data?.reserva?.id}`);
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
			setLoading(false); // Stop loading on error
		}
		// setTimeout(() => {
		// 	router.push("/reservations");
		// 	router.refresh();
		// }, 5000);
	};

	return (
		<>
			<form
				className={`space-y-6 p-6 border rounded-lg relative ${
					loggedUserId2 === 3 || !warningMessage
						? ""
						: warningMessage
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
				<div className="my-4 mb-12 text-center">
					<h1 className="text-3xl md:text-3xl font-light text-zinc-900 mb-2 leading-tight">
						Optimiza tu proceso de{" "}
						<span className="text-red-700">reservas.</span>
					</h1>
					<p className="text-base text-zinc-700">
						Utiliza nuestra herramienta intuitiva para gestionar a tus clientes
						de manera eficiente y mejorar cada transacción.
					</p>
				</div>
				<div className="space-y-4">
					<div className="flex flex-row items-center justify-between w-full">
						<h3 className="text-xl font-light text-zinc-700">
							Datos del cliente
						</h3>
						{!(loggedUserId2 === 3) && warningMessage && (
							<div
								className={` text-sm z-[40] m-0 ${
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
						{loggedUserId2 === 3 && (
							<div className="space-y-2">
								<Label
									htmlFor="usuario_id"
									className="font-normal text-zinc-600"
								>
									Seleccionar Usuario *
								</Label>
								<select
									name="usuario_id"
									id="usuario_id"
									className="w-full rounded-full px-2 py-2 border border-[#E4E4E7] focus:outline-none text-sm text-zinc-600"
									onChange={(e) => {
										console.log("Valor seleccionado:", e.target.value);
										setClient((prev) => ({
											...prev,
											usuario_id: parseInt(e.target.value),
										}));
									}}
									value={client.usuario_id || ""}
									required
								>
									<option value="">Seleccione un usuario</option>
									{users
										.filter((user) => user.id !== 2) // Filtrar usuarios con ID 1 y 2
										.map((user) => (
											<option key={user.id} value={user.id}>
												{user.nombre_usuario}
											</option>
										))}
								</select>
							</div>
						)}
						<div className="space-y-2">
							<Label
								htmlFor="nombre_completo"
								className="font-normal text-zinc-600"
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
							<Label htmlFor="dni" className="font-normal text-zinc-600">
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
							<Label htmlFor="domicilio" className="font-normal text-zinc-600">
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
							<Label htmlFor="telefono" className="font-normal text-zinc-600">
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
								htmlFor="marca_vehiculo"
								className="text-zinc-800 font-normal"
							>
								Marca
							</Label>
							<Input
								name="marca_vehiculo"
								id="marca_vehiculo"
								placeholder="Marca del vehículo"
								value={vehicle.marca_vehiculo}
								onChange={handleVehicleChange}
								className="rounded-full"
								required
							/>
						</div>
						<div className="space-y-2">
							<Label
								htmlFor="modelo_vehiculo"
								className="text-zinc-800 font-normal"
							>
								Modelo
							</Label>
							<Input
								name="modelo_vehiculo"
								id="modelo_vehiculo"
								placeholder="Model del vehículo"
								value={vehicle.modelo_vehiculo}
								onChange={handleVehicleChange}
								className="rounded-full"
								required
							/>
						</div>
						<div className="space-y-2">
							<Label
								htmlFor="patente_vehiculo"
								className="text-zinc-800 font-normal"
							>
								Patente
							</Label>
							<Input
								name="patente_vehiculo"
								id="patente_vehiculo"
								placeholder="Patente"
								value={vehicle.patente_vehiculo}
								onChange={handleVehicleChange}
								className="rounded-full"
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="equipo" className="font-normal text-zinc-600">
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
							<Label htmlFor="precio" className="font-normal text-zinc-600">
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
									className="font-normal text-zinc-600"
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
									className="font-normal text-zinc-600"
								>
									Carga externa
								</Label>
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="sena" className="font-normal text-zinc-600">
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
								className="font-normal text-zinc-600"
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
								className="font-normal text-zinc-600"
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

				<div className="space-y-4">
					<h3 className="text-xl font-light text-zinc-700 flex items-center">
						Adjuntar Documentación
						{/* <span className="px-2 py-1 text-xs font-normal rounded-full inline-flex items-center gap-1 justify-center bg-green-100 text-green-600 border border-green-100 ml-2">
							¡Nuevo!
						</span> */}
					</h3>
					<FilePond
						files={files}
						onupdatefiles={setFiles} // Actualiza el estado de los archivos
						allowReorder={true}
						allowMultiple={true} // Permitir múltiples archivos
						maxFiles={5} // Limitar a 5 archivos
						name="files" // Nombre del input
						labelIdle='Arrastra y suelta tus archivos o <span class="filepond--label-action">Selecciona un archivo.</span>'
						acceptedFileTypes={["image/*", "application/pdf"]} // Tipos de archivos aceptados
						onprocessfile={(error, file) => {
							if (error) {
								console.error("Error al subir el archivo:", error);
							} else {
								console.log("Archivo subido:", file);
							}
						}}
						onprocessfileprogress={(file, progress) => {
							console.log(
								`Progreso de carga para ${file.filename}: ${progress}%`
							);
						}}
					/>
				</div>

				<Button
					type="submit"
					className={`w-full rounded-sm ${loggedUserId2 === 3 ? "" : eventCount >= 5 ? "opacity-50 cursor-not-allowed" : ""}`}
					disabled={(eventCount >= 5 && loggedUserId2 !== 3) || loading}
				>
					{loading ? (
						<div className="flex items-center gap-2">
							<Loader2 className="animate-spin w-4 h-4" />
							Por favor, espera
						</div>
					) : (
						"Añadir Reserva"
					)}
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
