"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
// import ToastNotification from "@/components/ToastNotification";
import { Loader2 } from "lucide-react";
// import { useRouter } from "next/navigation";
import { getReservation } from "../../reservations.api";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";

import HomeIcon from "@/components/HomeIcon";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Aside from "@/components/Aside";

import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";

import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";

import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

export default function AddOrderPage({ params }) {
	const router = useRouter();

	const { data: session, status } = useSession();

	const [loggedUserId, setLoggedUserId] = useState(null);

	const [files, setFiles] = useState([]); // State para almacenar los archivos seleccionados
	const [comandaId, setComandaId] = useState(null);
	// const router = useRouter();
	const reservationId = params.id;
	useEffect(() => {
		document.title = `Motorgas - Editar Reserva #${params.id}`;
	}, [params.id]);

	const [initialReservation, setInitialReservation] = useState(null);

	const [client, setClient] = useState({
		nombre_completo: "",
		dni: "",
		domicilio: "",
		localidad: "",
		telefono: "",
	});

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
		fecha_instalacion: "",
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
		if (status === "authenticated" && session?.user?.id) {
			const userId = parseInt(session.user.id);
			if (!isNaN(userId)) {
				setLoggedUserId(userId);
			}
		}
	}, [session, status]);

	const currentUserId = loggedUserId;

	useEffect(() => {
		fetchEventCount(); // Llamar a la función al montar el componente
	}, []);

	useEffect(() => {
		const fetchReservation = async () => {
			setLoading(true);
			try {
				const data = await getReservation(reservationId);
				setInitialReservation(data);

				const fetchedComandaId = data.comandas[0]?.id; // Accede al id de la primera comanda
				setComandaId(fetchedComandaId);

				setClient({
					nombre_completo: data.clientes.nombre_completo || "",
					dni: data.clientes.dni || "",
					domicilio: data.clientes.domicilio || "",
					localidad: data.clientes.localidad || "",
					telefono: data.clientes.telefono || "",
				});
				setVehicle({
					marca_vehiculo: data.marca_vehiculo || "",
					modelo_vehiculo: data.modelo_vehiculo || "",
					patente_vehiculo: data.patente_vehiculo || "",
					equipo: data.equipo || "",
					precio: data.precio || "",
					reforma_escape: data.reforma_escape || false,
					carga_externa: data.carga_externa || false,
					sena: data.sena || "",
					monto_final_abonar: data.monto_final_abonar || "",
					fecha_instalacion: data.fecha_instalacion
						? new Date(data.fecha_instalacion).toISOString().split("T")[0]
						: "",
				});
			} catch (error) {
				console.error("Error al obtener la reserva:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchReservation();
	}, [reservationId]);

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
			const responseBA = await axios.get(
				"https://apis.datos.gob.ar/georef/api/localidades?provincia=buenos aires&campos=nombre&max=1000"
			);
			const localidadesUnicas = Array.from(
				new Set(
					responseBA.data.localidades.map((localidad) => localidad.nombre)
				)
			).map((nombre) => {
				return responseBA.data.localidades.find(
					(localidad) => localidad.nombre === nombre
				);
			});
			const sortedLocalidades = localidadesUnicas.sort((a, b) => {
				if (a.nombre < b.nombre) return -1;
				if (a.nombre > b.nombre) return 1;
				return 0;
			});

			setLocalidades(sortedLocalidades);
		} catch (error) {
			console.error("Error al obtener localidades:", error);
		}
	};

	useEffect(() => {
		fetchLocalidades();
	}, []);

	const handleLocalidadChange = (e) => {
		const value = e.target.value.toUpperCase();
		setClient((prevClient) => ({
			...prevClient,
			localidad: value,
		}));

		const filtered = localidades.filter((localidad) =>
			localidad.nombre.toUpperCase().includes(value)
		);

		setFilteredLocalidades(filtered);
		setShowSuggestions(value !== "");
	};

	const handleSuggestionClick = (localidad) => {
		setClient((prevClient) => ({
			...prevClient,
			localidad: localidad.nombre.toUpperCase(),
		}));
		setShowSuggestions(false);
	};

	const handleInputFocus = () => {
		setShowSuggestions(true);
		setFilteredLocalidades(localidades);
	};

	const handleClickOutside = (event) => {
		if (inputRef.current && !inputRef.current.contains(event.target)) {
			setShowSuggestions(false);
		}
	};

	useEffect(() => {
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	// const [showToast, setShowToast] = useState("");
	const [loading, setLoading] = useState(false); // Agregar estado de carga

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true); // Iniciar carga

		// Compara los datos actuales con los iniciales y crea un objeto con solo los campos modificados
		const updatedClient = {};
		const updatedVehicle = {};
		const updatedFiles = files.length > 0; // Verifica si hay archivos nuevos

		// Compara los datos del cliente
		Object.keys(client).forEach((key) => {
			if (client[key] !== initialReservation.clientes[key]) {
				updatedClient[key] = client[key];
			}
		});

		// Compara los datos del vehículo
		Object.keys(vehicle).forEach((key) => {
			if (key === "fecha_instalacion") {
				// Compara fechas como objetos Date o timestamps
				const originalDate = initialReservation[key]
					? new Date(initialReservation[key]).getTime()
					: null;
				const newDate = vehicle.fecha_instalacion
					? new Date(vehicle.fecha_instalacion).getTime()
					: null;

				if (originalDate !== newDate) {
					let formattedFechaInstalacion = "";

					// Asegurarse de que fechaInstalacion sea una fecha válida
					const utcDate = new Date(vehicle.fecha_instalacion);

					if (!isNaN(utcDate.getTime())) {
						// Convertir UTC a la hora local añadiendo 3 horas
						const localDate = new Date(utcDate.getTime() + 3 * 60 * 60 * 1000);

						// Establecer la hora a las 08:30
						localDate.setHours(8);
						localDate.setMinutes(30);
						localDate.setSeconds(0);
						localDate.setMilliseconds(0);

						// Convertir a formato ISO-8601
						formattedFechaInstalacion = localDate.toISOString();

						// Asigna la fecha formateada
						updatedVehicle[key] = formattedFechaInstalacion;
					} else {
						console.error(
							"Fecha de instalación inválida:",
							vehicle.fecha_instalacion
						);
					}
				}
			} else if (
				key === "precio" ||
				key === "sena" ||
				key === "monto_final_abonar"
			) {
				// Procesa los valores para comparación
				const originalValue = parseFloat(initialReservation[key]) || 0;
				const newValue =
					parseFloat(vehicle[key].replace(/\./g, "").replace(",", ".")) || 0;

				if (originalValue !== newValue) {
					updatedVehicle[key] = newValue;
				}
			} else if (vehicle[key] !== initialReservation[key]) {
				updatedVehicle[key] = vehicle[key];
			}
		});

		// Solo envía si hay campos modificados o archivos nuevos
		if (
			Object.keys(updatedClient).length > 0 ||
			Object.keys(updatedVehicle).length > 0 ||
			updatedFiles // Agregado para verificar archivos
		) {
			try {
				const response = await axios.patch(
					`${process.env.NEXT_PUBLIC_API_URL}/api/reservations/${reservationId}`,
					{
						...updatedClient,
						...updatedVehicle,
					}
				);

				console.log("Datos actualizados:", response.data);
				console.log("Datos que se han enviado:", {
					...updatedClient,
					...updatedVehicle,
				});

				await new Promise((resolve) => setTimeout(resolve, 1000));

				await Promise.all(
					files.map(async (file) => {
						const formData = new FormData();
						formData.append("file", file.file);
						formData.append("usuarioId", String(currentUserId));
						console.log(formData);

						await axios.post(
							`${process.env.NEXT_PUBLIC_API_URL}/api/files/${comandaId}`, // Usa el comandaId aquí
							formData,
							{
								headers: {
									"Content-Type": "multipart/form-data",
								},
							}
						);
					})
				);

				router.push(`/reservations/${reservationId}`);
			} catch (error) {
				console.error("Error al actualizar la reserva:", error);
			}
		} else {
			console.log("No se han realizado cambios.");
		}

		setLoading(false); // Detener carga al finalizar
	};
	return (
		<div className="flex bg-zinc-50">
			<Aside />
			<main className="flex-1 p-6 z-50">
				<div className="flex items-center justify-between mb-6">
					<div className="flex items-center gap-2">
						<HomeIcon href="/reservations" label="Volver"></HomeIcon>
						<h2 className="text-base font-normal text-zinc-700">
							Editar Reserva
						</h2>
					</div>
				</div>
				<Card className="border-none shadow-lg">
					<CardContent className="pt-6">
						<form
							className={`space-y-6 p-6 border rounded-lg  relative ${
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
										<Label
											htmlFor="domicilio"
											className="font-normal text-zinc-600"
										>
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
										<Label
											htmlFor="telefono"
											className="font-normal text-zinc-600"
										>
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
											placeholder="Modelo del vehículo"
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
										<Label
											htmlFor="equipo"
											className="font-normal text-zinc-600"
										>
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
										<Label
											htmlFor="precio"
											className="font-normal text-zinc-600"
										>
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
								className={`w-full rounded-sm ${
									eventCount >= 5 ? "opacity-50 cursor-not-allowed" : ""
								}`}
								disabled={eventCount >= 5 || loading} // Deshabilitar si hay carga o si hay demasiados eventos
							>
								{loading ? (
									<div className="flex items-center gap-2">
										<Loader2 className="animate-spin w-4 h-4" />
										Por favor, espera
									</div>
								) : (
									"Editar Reserva"
								)}
							</Button>
						</form>
						{/* <ToastNotification
							message={showToast}
							show={!!showToast}
							onClose={() => setShowToast("")}
							type={showToast.includes("Error") ? "error" : "success"} // Determina el tipo basado en el mensaje
						/> */}
					</CardContent>
				</Card>
			</main>
		</div>
	);
}
