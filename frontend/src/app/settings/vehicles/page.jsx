"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Aside from "@/components/Aside";

import api from "@/lib/axios";
import { Plus, Trash2, Edit, Loader2, Upload } from "lucide-react";
// import { toast } from "sonner";
import HomeIcon from "@/components/HomeIcon";
import Image from "next/image";

export default function Settings() {
	const [brands, setBrands] = useState({});
	const [vehicles, setVehicles] = useState({});
	const [supports, setSupports] = useState([]);
	const [selectedMarca, setSelectedMarca] = useState("");
	const [selectedModelo, setSelectedModelo] = useState("");
	const [filteredVehicles, setFilteredVehicles] = useState([]);
	const [newVehicle, setNewVehicle] = useState({
		name: "",
		brand_id: "",
		observations: "",
		sales_suggestions: "",
		cradle_type: "",
		support_ids: [],
		tempImages: [],
		tempFiles: [],
	});
	const [editingVehicle, setEditingVehicle] = useState(null);
	const [tempEditImages, setTempEditImages] = useState([]);
	const [tempEditFiles, setTempEditFiles] = useState([]);
	const [imagesToDelete, setImagesToDelete] = useState([]);
	const [successMessage, setSuccessMessage] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		if (successMessage || errorMessage) {
			const timer = setTimeout(() => {
				if (successMessage) setSuccessMessage("");
				if (errorMessage) setErrorMessage("");
			}, 2500);

			return () => clearTimeout(timer);
		}
	}, [successMessage, errorMessage]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [brandsResponse, vehiclesResponse, supportsResponse] =
					await Promise.all([
						api.get("/api/brands"),
						api.get("/api/vehicles"),
						api.get("/api/support"),
					]);

				const brandsData = brandsResponse.data.reduce((acc, brand) => {
					acc[brand.id] = {
						name: brand.name,
						code: brand.code,
					};
					return acc;
				}, {});
				setBrands(brandsData);

				setSupports(supportsResponse.data);

				const vehiclesGrouped = vehiclesResponse.data.reduce((acc, vehicle) => {
					if (!acc[vehicle.brands.id]) {
						acc[vehicle.brands.id] = [];
					}
					acc[vehicle.brands.id].push(vehicle);
					return acc;
				}, {});
				setVehicles(vehiclesGrouped);
			} catch (error) {
				console.error("Error fetching data:", error);
			}
		};
		fetchData();
	}, []);

	const handleMarcaChange = (event) => {
		const marca = event.target.value ? parseInt(event.target.value) : "";
		setSelectedMarca(marca);
		setSelectedModelo("");
		const filteredByBrand = marca ? vehicles[marca] || [] : [];
		setFilteredVehicles(filteredByBrand);
	};

	const handleModeloChange = (event) => {
		const modelo = event.target.value;
		setSelectedModelo(modelo);

		if (selectedMarca && modelo) {
			const vehiculosFiltrados = (vehicles[selectedMarca] || []).filter(
				(vehicle) => vehicle.name === modelo
			);
			setFilteredVehicles(vehiculosFiltrados);
		} else if (selectedMarca) {
			setFilteredVehicles(vehicles[selectedMarca] || []);
		}
	};

	const handleImageUpload = async (e, vehicleId = null) => {
		const files = Array.from(e.target.files);
		if (!files.length) return;

		if (vehicleId) {
			// Si estamos agregando imágenes a un vehículo existente en modo edición
			const tempImages = [];
			const tempFiles = [];

			for (const file of files) {
				const reader = new FileReader();
				await new Promise((resolve) => {
					reader.onloadend = () => {
						tempImages.push(reader.result);
						tempFiles.push(file);
						resolve();
					};
					reader.readAsDataURL(file);
				});
			}

			setTempEditImages((prev) => [...prev, ...tempImages]);
			setTempEditFiles((prev) => [...prev, ...tempFiles]);
		} else {
			// Si estamos agregando imágenes a un nuevo vehículo
			const tempImages = [];
			const tempFiles = [];

			for (const file of files) {
				const reader = new FileReader();
				await new Promise((resolve) => {
					reader.onloadend = () => {
						tempImages.push(reader.result);
						tempFiles.push(file);
						resolve();
					};
					reader.readAsDataURL(file);
				});
			}

			setNewVehicle((prev) => ({
				...prev,
				tempImages: tempImages,
				tempFiles: tempFiles,
			}));
		}
	};

	const handleDeleteImage = async (imageId, vehicleId) => {
		if (editingVehicle) {
			// Si estamos en modo edición, solo marcamos la imagen para eliminar
			setImagesToDelete((prev) => [...prev, imageId]);
			setEditingVehicle((prev) => ({
				...prev,
				vehicle_images: prev.vehicle_images.filter((img) => img.id !== imageId),
			}));
		} else {
			// Si no estamos en modo edición, eliminamos la imagen inmediatamente
			try {
				await api.delete(`/api/vehicles-images/${imageId}`);

				// Actualizar el estado de vehicles y filteredVehicles
				setVehicles((prev) => {
					const updatedVehicles = { ...prev };
					const brandId = Object.keys(prev).find((brandId) =>
						prev[brandId].some((v) => v.id === vehicleId)
					);

					if (brandId) {
						updatedVehicles[brandId] = prev[brandId].map((v) =>
							v.id === vehicleId
								? {
										...v,
										vehicle_images: v.vehicle_images.filter(
											(img) => img.id !== imageId
										),
									}
								: v
						);
					}
					return updatedVehicles;
				});

				setFilteredVehicles((prev) =>
					prev.map((v) =>
						v.id === vehicleId
							? {
									...v,
									vehicle_images: v.vehicle_images.filter(
										(img) => img.id !== imageId
									),
								}
							: v
					)
				);

				setSuccessMessage("Imagen eliminada exitosamente");
			} catch (error) {
				console.error("Error al eliminar imagen:", error);
				setErrorMessage("Error al eliminar imagen");
			}
		}
	};

	const handleDeleteTempImage = (index) => {
		setTempEditImages((prev) => prev.filter((_, i) => i !== index));
		setTempEditFiles((prev) => prev.filter((_, i) => i !== index));
	};

	const handleAddVehicle = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);
		try {
			const supportIds =
				newVehicle.support_ids.length > 0
					? supports
							.filter((support) =>
								newVehicle.support_ids.includes(support.code)
							)
							.map((support) => support.id)
					: [];

			// Asegurarnos de que brand_id sea número
			const vehicleData = {
				...newVehicle,
				brand_id: Number(newVehicle.brand_id),
				support_ids: supportIds,
			};
			delete vehicleData.tempImages;
			delete vehicleData.tempFiles;

			const response = await api.post("/api/vehicles", vehicleData);

			let newVehicleData = response.data;

			if (newVehicle.tempFiles?.length > 0) {
				const uploadPromises = newVehicle.tempFiles.map((file) => {
					const formData = new FormData();
					formData.append("file", file);

					return api.post(
						`/api/vehicles-images/${response.data.id}`,
						formData,
						{
							headers: {
								"Content-Type": "multipart/form-data",
							},
						}
					);
				});

				const imageResponses = await Promise.all(uploadPromises);
				newVehicleData = {
					...newVehicleData,
					vehicle_images: imageResponses.map((response) => response.data),
				};
			}

			// Update vehicles state with new vehicle
			setVehicles((prev) => {
				const brandVehicles = prev[newVehicle.brand_id] || [];
				return {
					...prev,
					[newVehicle.brand_id]: [...brandVehicles, newVehicleData],
				};
			});

			// Update filtered vehicles if the current selected brand matches
			if (selectedMarca === newVehicle.brand_id) {
				setFilteredVehicles((prev) => [...prev, newVehicleData]);
			}

			setNewVehicle({
				name: "",
				brand_id: "",
				observations: "",
				sales_suggestions: "",
				cradle_type: "",
				support_ids: [],
				tempImages: [],
				tempFiles: [],
			});
			setSuccessMessage("Vehículo agregado exitosamente");
		} catch (error) {
			console.error("Error al agregar vehículo:", error);
			setErrorMessage("Error al agregar vehículo");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleUpdateVehicle = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);
		try {
			// Primero eliminamos las imágenes marcadas para eliminar
			if (imagesToDelete.length > 0) {
				const deletePromises = imagesToDelete.map((imageId) =>
					api.delete(`/api/vehicles-images/${imageId}`)
				);
				await Promise.all(deletePromises);
			}

			const supportIds =
				editingVehicle.support_ids.length > 0
					? supports
							.filter((support) =>
								editingVehicle.support_ids.includes(support.code)
							)
							.map((support) => support.id)
					: [];

			// Asegurarnos de que brand_id sea número
			const updateData = {
				name: editingVehicle.name,
				brand_id: Number(editingVehicle.brand_id),
				observations: editingVehicle.observations,
				sales_suggestions: editingVehicle.sales_suggestions,
				cradle_type: editingVehicle.cradle_type,
				exhaust_reform: editingVehicle.exhaust_reform,
				support_ids: supportIds,
			};

			const response = await api.patch(
				`/api/vehicles/${editingVehicle.id}`,
				updateData
			);

			// Si hay imágenes temporales, las subimos
			if (tempEditFiles.length > 0) {
				const uploadPromises = tempEditFiles.map((file) => {
					const formData = new FormData();
					formData.append("file", file);

					return api.post(
						`/api/vehicles-images/${editingVehicle.id}`,
						formData,
						{
							headers: {
								"Content-Type": "multipart/form-data",
							},
						}
					);
				});

				const imageResponses = await Promise.all(uploadPromises);
				const newImages = imageResponses.map((response) => response.data);

				response.data.vehicle_images = [
					...response.data.vehicle_images,
					...newImages,
				];
			}

			// Update vehicles state with updated vehicle
			setVehicles((prev) => {
				const brandVehicles = prev[editingVehicle.brand_id] || [];
				const updatedVehicles = brandVehicles.map((vehicle) =>
					vehicle.id === editingVehicle.id ? response.data : vehicle
				);
				return {
					...prev,
					[editingVehicle.brand_id]: updatedVehicles,
				};
			});

			// Update filtered vehicles if the current selected brand matches
			if (selectedMarca === editingVehicle.brand_id) {
				setFilteredVehicles((prev) =>
					prev.map((vehicle) =>
						vehicle.id === editingVehicle.id ? response.data : vehicle
					)
				);
			}

			setEditingVehicle(null);
			setTempEditImages([]);
			setTempEditFiles([]);
			setImagesToDelete([]);
			setSuccessMessage("Vehículo actualizado exitosamente");
		} catch (error) {
			console.error("Error al actualizar vehículo:", error);
			setErrorMessage("Error al actualizar vehículo");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDeleteVehicle = async (vehicleId, brandId) => {
		try {
			// Primero eliminamos todas las imágenes asociadas al vehículo
			const vehicle = vehicles[brandId]?.find((v) => v.id === vehicleId);
			if (vehicle?.vehicle_images?.length > 0) {
				const deleteImagePromises = vehicle.vehicle_images.map((image) =>
					api.delete(`/api/vehicles-images/${image.id}`)
				);
				await Promise.all(deleteImagePromises);
			}

			// Luego eliminamos el vehículo
			await api.delete(`/api/vehicles/${vehicleId}`);

			// Update vehicles state by removing the deleted vehicle
			setVehicles((prev) => {
				const brandVehicles = prev[brandId] || [];
				return {
					...prev,
					[brandId]: brandVehicles.filter(
						(vehicle) => vehicle.id !== vehicleId
					),
				};
			});

			// Update filtered vehicles if we're currently viewing that brand
			if (selectedMarca === brandId) {
				setFilteredVehicles((prev) =>
					prev.filter((vehicle) => vehicle.id !== vehicleId)
				);
			}

			setSuccessMessage("Vehículo eliminado exitosamente");
		} catch (error) {
			console.error("Error al eliminar vehículo:", error);
			setErrorMessage("Error al eliminar vehículo");
		}
	};

	const handleSupportToggle = (supportCode) => {
		const currentSupports = editingVehicle
			? editingVehicle.support_ids
			: newVehicle.support_ids;

		const updatedSupports = currentSupports.includes(supportCode)
			? currentSupports.filter((code) => code !== supportCode)
			: [...currentSupports, supportCode];

		return editingVehicle
			? setEditingVehicle({ ...editingVehicle, support_ids: updatedSupports })
			: setNewVehicle({ ...newVehicle, support_ids: updatedSupports });
	};

	const handleEditClick = (vehicle) => {
		// First clear the previous state
		setEditingVehicle(null);

		// After a small delay, set the new state
		setTimeout(() => {
			setEditingVehicle({
				...vehicle,
				brand_id: vehicle.brands.id,
				support_ids: vehicle.support.map((s) => s.code),
			});
		}, 0);

		// Scroll to top of the form
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	return (
		<div className="flex-1 bg-zinc-50">
			<Aside />
			<motion.main
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className="flex-1 p-6 lg:px-8 xl:px-8 mt-12 overflow-y-auto"
			>
				<HomeIcon />
				<div className="space-y-6">
					<div className="rounded-xl h-fit bg-white/50 backdrop-blur-sm p-6 shadow-xl">
						<div className="p-8 pt-0 space-y-8">
							<div className="mb-6">
								<h2 className="text-2xl font-light text-zinc-900">
									Gestión de Vehículos
								</h2>
								<p className="text-zinc-600 text-sm mt-1">
									Administra el catálogo de vehículos y sus especificaciones.
								</p>
							</div>

							<form
								onSubmit={
									editingVehicle ? handleUpdateVehicle : handleAddVehicle
								}
								className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
							>
								<div className="space-y-2 col-span-3 md:col-span-2 lg:col-span-1">
									<label className="text-sm font-normal text-zinc-700">
										Nombre
									</label>
									<input
										type="text"
										value={
											editingVehicle ? editingVehicle.name : newVehicle.name
										}
										onChange={(e) =>
											editingVehicle
												? setEditingVehicle({
														...editingVehicle,
														name: e.target.value,
													})
												: setNewVehicle({ ...newVehicle, name: e.target.value })
										}
										className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-200 bg-white/50 text-zinc-900 placeholder:text-zinc-600 transition-all duration-200"
										placeholder="Nombre del modelo"
										required
									/>
								</div>

								<div className="space-y-2 col-span-3 md:col-span-2 lg:col-span-1">
									<label className="text-sm font-normal text-zinc-700">
										Marca
									</label>
									<select
										value={
											editingVehicle
												? editingVehicle.brand_id
												: newVehicle.brand_id
										}
										onChange={(e) =>
											editingVehicle
												? setEditingVehicle({
														...editingVehicle,
														brand_id: parseInt(e.target.value),
													})
												: setNewVehicle({
														...newVehicle,
														brand_id: parseInt(e.target.value),
													})
										}
										className="w-full text-zinc-600 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-200 bg-white/50 placeholder:text-zinc-600 transition-all duration-200"
										required
									>
										<option value="" className="text-zinc-600">
											Seleccionar Marca
										</option>
										{Object.entries(brands).map(([id, brand]) => (
											<option key={id} value={id}>
												{brand.name}
											</option>
										))}
									</select>
								</div>

								<div className="space-y-2 col-span-3 md:col-span-2 lg:col-span-1">
									<label className="text-sm font-normal text-zinc-700">
										Observaciones
									</label>
									<input
										type="text"
										value={
											editingVehicle
												? editingVehicle.observations
												: newVehicle.observations
										}
										onChange={(e) =>
											editingVehicle
												? setEditingVehicle({
														...editingVehicle,
														observations: e.target.value,
													})
												: setNewVehicle({
														...newVehicle,
														observations: e.target.value,
													})
										}
										className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-200 bg-white/50 text-zinc-900 placeholder:text-zinc-600 transition-all duration-200"
										placeholder="Observaciones"
									/>
								</div>

								<div className="space-y-2 col-span-3 md:col-span-2 lg:col-span-1">
									<label className="text-sm font-normal text-zinc-700">
										Sugerencias de Venta
									</label>
									<input
										type="text"
										value={
											editingVehicle
												? editingVehicle.sales_suggestions
												: newVehicle.sales_suggestions
										}
										onChange={(e) =>
											editingVehicle
												? setEditingVehicle({
														...editingVehicle,
														sales_suggestions: e.target.value,
													})
												: setNewVehicle({
														...newVehicle,
														sales_suggestions: e.target.value,
													})
										}
										className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-200 bg-white/50 text-zinc-900 placeholder:text-zinc-600 transition-all duration-200"
										placeholder="Sugerencias de venta"
									/>
								</div>

								<div className="space-y-2 col-span-3 md:col-span-2 lg:col-span-1">
									<label className="text-sm font-normal text-zinc-700">
										Tipo de Cuna
									</label>
									<input
										type="text"
										value={
											editingVehicle
												? editingVehicle.cradle_type
												: newVehicle.cradle_type
										}
										onChange={(e) =>
											editingVehicle
												? setEditingVehicle({
														...editingVehicle,
														cradle_type: e.target.value,
													})
												: setNewVehicle({
														...newVehicle,
														cradle_type: e.target.value,
													})
										}
										className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-200 bg-white/50 text-zinc-900 placeholder:text-zinc-600 transition-all duration-200"
										placeholder="Tipo de cuna"
									/>
								</div>

								<div className="col-span-3 md:col-span-full w-full">
									<label className="text-sm font-normal text-zinc-700 block mb-2">
										Soportes Compatibles
									</label>
									<div className="grid grid-cols-3 md:grid-cols-6 gap-2 col-span-full">
										{supports.map((support) => (
											<div
												key={support.id}
												onClick={() => handleSupportToggle(support.code)}
												className={`cursor-pointer p-2 rounded-md text-sm border ${
													(editingVehicle
														? editingVehicle.support_ids
														: newVehicle.support_ids
													).includes(support.code)
														? "border hover:border-emerald-300 border-emerald-300 bg-emerald-100 text-emerald-600"
														: "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300"
												} transition-colors`}
											>
												{support.code}
											</div>
										))}
									</div>
								</div>

								<div className="col-span-full">
									<label className="text-sm font-normal text-zinc-700 block mb-2">
										Imagen
									</label>
									<div className="mt-2">
										{editingVehicle ? (
											// Si estamos editando un vehículo
											<div className="grid grid-cols-2 gap-2">
												{editingVehicle.vehicle_images?.map((image) => (
													<div key={image.id} className="relative">
														<div className="relative w-full h-24 overflow-hidden border border-zinc-200 rounded-lg">
															<Image
																src={image.url}
																alt={image.name}
																fill
																className="object-contain"
															/>
														</div>
														<button
															type="button"
															onClick={() =>
																handleDeleteImage(image.id, editingVehicle.id)
															}
															className="absolute top-1 right-1 p-1 rounded-md bg-white/90 backdrop-blur-sm border border-zinc-200 text-red-600 hover:bg-red-50 transition-colors duration-200"
														>
															<Trash2 className="w-3 h-3" />
														</button>
													</div>
												))}
												{tempEditImages.map((image, index) => (
													<div key={`temp-${index}`} className="relative">
														<div className="relative w-full h-24 overflow-hidden border border-zinc-200 rounded-lg">
															<Image
																src={image}
																alt={`Nueva imagen ${index + 1}`}
																fill
																className="object-contain"
															/>
														</div>
														<button
															type="button"
															onClick={() => handleDeleteTempImage(index)}
															className="absolute top-1 right-1 p-1 rounded-md bg-white/90 backdrop-blur-sm border border-zinc-200 text-red-600 hover:bg-red-50 transition-colors duration-200"
														>
															<Trash2 className="w-3 h-3" />
														</button>
													</div>
												))}
												<label
													htmlFor="imageUpload"
													className="flex items-center justify-center w-full h-24 gap-2 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-100 transition-colors duration-200 cursor-pointer"
												>
													<Upload className="w-4 h-4" />
												</label>
												<input
													type="file"
													id="imageUpload"
													accept="image/*"
													onChange={(e) =>
														handleImageUpload(e, editingVehicle.id)
													}
													className="hidden"
													multiple
												/>
											</div>
										) : (
											// Si estamos creando un nuevo vehículo
											<>
												{newVehicle.tempImages?.length > 0 ? (
													<div className="grid grid-cols-2 gap-2">
														{newVehicle.tempImages.map((image, index) => (
															<div key={index} className="relative">
																<div className="relative w-full h-24 overflow-hidden border border-zinc-200 rounded-lg">
																	<Image
																		src={image}
																		alt={`Preview ${index + 1}`}
																		fill
																		className="object-contain"
																	/>
																</div>
																<button
																	type="button"
																	onClick={() => {
																		setNewVehicle((prev) => ({
																			...prev,
																			tempImages: prev.tempImages.filter(
																				(_, i) => i !== index
																			),
																			tempFiles: prev.tempFiles.filter(
																				(_, i) => i !== index
																			),
																		}));
																	}}
																	className="absolute top-1 right-1 p-1 rounded-md bg-white/90 backdrop-blur-sm border border-zinc-200 text-red-600 hover:bg-red-50 transition-colors duration-200"
																>
																	<Trash2 className="w-3 h-3" />
																</button>
															</div>
														))}
														<label
															htmlFor="imageUpload"
															className="flex items-center justify-center w-full h-24 gap-2 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-100 transition-colors duration-200 cursor-pointer"
														>
															<Upload className="w-4 h-4" />
														</label>
													</div>
												) : (
													<label
														htmlFor="imageUpload"
														className="flex items-center justify-center w-full gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-100 transition-colors duration-200 cursor-pointer"
													>
														<Upload className="w-4 h-4" />
														<span className="text-sm">Subir Imágenes</span>
													</label>
												)}
												<input
													type="file"
													id="imageUpload"
													accept="image/*"
													onChange={(e) => handleImageUpload(e)}
													className="hidden"
													multiple
												/>
											</>
										)}
									</div>
								</div>

								<motion.div
									className="flex items-center gap-2 col-span-3 w-full"
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -20 }}
									transition={{
										duration: 0.3,
										ease: "easeInOut",
									}}
									key={editingVehicle ? "editing" : "adding"}
								>
									<motion.button
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: 0.1 }}
										type="submit"
										disabled={isSubmitting}
										className="flex items-center justify-center gap-1 px-4 py-2.5 rounded-sm bg-zinc-900 text-white hover:bg-zinc-800 transition-colors duration-200 w-full font-normal text-sm disabled:opacity-70 disabled:cursor-not-allowed"
									>
										{isSubmitting ? (
											<div className="flex items-center gap-2">
												<Loader2 className="animate-spin w-4 h-4" />
												{editingVehicle ? "Actualizando..." : "Agregando..."}
											</div>
										) : (
											<>
												<Plus className="w-4 h-4" />
												{editingVehicle ? "Actualizar" : "Agregar"}
											</>
										)}
									</motion.button>
									{editingVehicle && (
										<motion.button
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											exit={{ opacity: 0, x: 20 }}
											transition={{
												duration: 0.2,
												ease: "easeOut",
											}}
											type="button"
											onClick={() => setEditingVehicle(null)}
											className="px-4 py-2.5 rounded-sm border border-zinc-200 text-zinc-700 hover:bg-zinc-100 transition-colors duration-200 w-full font-normal text-sm"
										>
											Cancelar
										</motion.button>
									)}
								</motion.div>

								<AnimatePresence mode="wait">
									{(successMessage || errorMessage) && (
										<motion.div
											className="col-span-3 mt-4"
											initial={{ opacity: 0, y: -10 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: 10 }}
											transition={{ duration: 0.3 }}
										>
											{successMessage && (
												<motion.p
													layout
													className="text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 flex items-center justify-center"
													initial={{ scale: 0.95, opacity: 0 }}
													animate={{ scale: 1, opacity: 1 }}
													exit={{ scale: 0.95, opacity: 0 }}
													transition={{ duration: 0.2 }}
												>
													{successMessage}
												</motion.p>
											)}
											{errorMessage && (
												<motion.p
													layout
													className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center justify-center"
													initial={{ scale: 0.95, opacity: 0 }}
													animate={{ scale: 1, opacity: 1 }}
													exit={{ scale: 0.95, opacity: 0 }}
													transition={{ duration: 0.2 }}
												>
													{errorMessage}
												</motion.p>
											)}
										</motion.div>
									)}
								</AnimatePresence>
							</form>

							<div className="space-y-6">
								<div className="grid grid-cols-1 md:grid-cols-[140px,1fr] items-center gap-3">
									<label className="text-sm text-zinc-600">
										Filtrar por Marca
									</label>
									<select
										className="w-full border border-zinc-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-200 text-zinc-600"
										onChange={handleMarcaChange}
										value={selectedMarca}
									>
										<option value="">Elegir Marca</option>
										{Object.entries(brands).map(([id, brand]) => (
											<option key={id} value={id}>
												{brand.name}
											</option>
										))}
									</select>
								</div>

								{selectedMarca && (
									<motion.div
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										className="grid grid-cols-1 md:grid-cols-[140px,1fr] items-center gap-3"
									>
										<label className="text-sm text-zinc-600">
											Filtrar por Modelo
										</label>
										<select
											className="w-full border border-zinc-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-200 text-zinc-600"
											onChange={handleModeloChange}
											value={selectedModelo}
										>
											<option value="">Elegir Modelo</option>
											{Array.isArray(vehicles[selectedMarca])
												? vehicles[selectedMarca].map((vehicle) => (
														<option key={vehicle.id} value={vehicle.name}>
															{vehicle.name}
														</option>
													))
												: null}
										</select>
									</motion.div>
								)}

								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-6"
								>
									{filteredVehicles.map((vehicle) => (
										<motion.div
											key={vehicle.id}
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											className="group bg-white/50 backdrop-blur-sm border border-zinc-200 rounded-lg p-4 hover:border-zinc-300 transition-all duration-200"
										>
											<div className="flex justify-between">
												<div className="space-y-2">
													<p className="text-sm font-medium text-zinc-900">
														{vehicle.name}
													</p>
													<p className="text-xs text-zinc-500">
														{brands[vehicle.brands.id].name}
													</p>
													{vehicle.observations && (
														<p className="text-xs text-zinc-600">
															Observaciones: {vehicle.observations}
														</p>
													)}
													{vehicle.sales_suggestions && (
														<p className="text-xs text-zinc-600">
															Sugerencias: {vehicle.sales_suggestions}
														</p>
													)}
													{vehicle.cradle_type && (
														<p className="text-xs text-zinc-600">
															Tipo de Cuna: {vehicle.cradle_type}
														</p>
													)}
													{/* Mostrar imágenes del vehículo */}
													{vehicle.vehicle_images &&
														vehicle.vehicle_images.length > 0 && (
															<div className="grid grid-cols-2 gap-2 mt-2">
																{vehicle.vehicle_images.map((image) => (
																	<div
																		key={image.id}
																		className="relative group"
																	>
																		<div className="relative w-full h-24 overflow-hidden border border-zinc-200 rounded-lg">
																			<Image
																				src={image.url}
																				alt={image.name}
																				fill
																				className="object-contain"
																			/>
																		</div>
																		<button
																			onClick={() =>
																				handleDeleteImage(image.id, vehicle.id)
																			}
																			className="absolute top-1 right-1 p-1 rounded-md bg-white/90 backdrop-blur-sm border border-zinc-200 text-red-600 hover:bg-red-50 transition-colors duration-200 opacity-0 group-hover:opacity-100"
																		>
																			<Trash2 className="w-3 h-3" />
																		</button>
																	</div>
																))}
																{/* Botón para agregar más imágenes */}
																<input
																	type="file"
																	id={`imageUpload-${vehicle.id}`}
																	accept="image/*"
																	onChange={(e) =>
																		handleImageUpload(e, vehicle.id)
																	}
																	className="hidden"
																	multiple
																/>
															</div>
														)}
												</div>
												<div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
													<button
														onClick={() => handleEditClick(vehicle)}
														className="p-1.5 rounded-md text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
													>
														<Edit className="w-4 h-4" />
													</button>
													<button
														onClick={() =>
															handleDeleteVehicle(vehicle.id, vehicle.brands.id)
														}
														className="p-1.5 rounded-md text-zinc-600 hover:text-red-600 hover:bg-red-50 transition-colors"
													>
														<Trash2 className="w-4 h-4" />
													</button>
												</div>
											</div>
										</motion.div>
									))}
								</motion.div>
							</div>
						</div>
					</div>
				</div>
			</motion.main>
		</div>
	);
}
