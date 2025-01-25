"use client";

import { motion, AnimatePresence } from "framer-motion";
import Aside from "@/components/Aside";

import api from "@/lib/axios";
import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import HomeIcon from "@/components/HomeIcon";

export default function Settings() {
	const [supports, setSupports] = useState([]);
	const [expandedCard, setExpandedCard] = useState(null);
	const [loadingSupports, setLoadingSupports] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [categoryDetails, setCategoryDetails] = useState({});
	const [newSupport, setNewSupport] = useState({
		code: "",
		name: "",
		autonomy: "",
		equivalent_km: "",
		initial_price_brc: "",
		list_price_brc: "",
		promo_price_brc: "",
		initial_price_ta: "",
		list_price_ta: "",
		promo_price_ta: "",
		image: null,
	});
	const [editingSupport, setEditingSupport] = useState(null);
	const [successMessage, setSuccessMessage] = useState("");
	const [errorMessage, setErrorMessage] = useState("");

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
		const fetchSupports = async () => {
			try {
				const response = await api.get("/api/support");
				setSupports(response.data);
			} catch (error) {
				console.error("Error fetching supports:", error);
				toast.error("Error al cargar soportes");
			}
		};
		fetchSupports();
	}, []);

	const fetchCategoryDetails = async (prefix) => {
		if (categoryDetails[prefix]) return;

		setLoadingSupports(true);
		try {
			const response = await api.get("/api/support");
			const filteredSupports = response.data.filter((support) =>
				support.code.toLowerCase().startsWith(prefix.toLowerCase())
			);
			setCategoryDetails((prev) => ({
				...prev,
				[prefix]: filteredSupports,
			}));
		} catch (error) {
			console.error("Error fetching category details:", error);
			toast.error("Error al cargar detalles de la categoría");
		} finally {
			setLoadingSupports(false);
		}
	};

	const handleExpandCard = async (prefix) => {
		if (expandedCard === prefix) {
			setExpandedCard(null);
		} else {
			setExpandedCard(prefix);
			fetchCategoryDetails(prefix);
		}
	};

	const handleImageUpload = async (e) => {
		const file = e.target.files[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onloadend = () => {
			if (editingSupport) {
				setEditingSupport((prev) => ({
					...prev,
					tempImage: reader.result,
					tempFile: file,
				}));
			} else {
				setNewSupport((prev) => ({
					...prev,
					tempImage: reader.result,
					tempFile: file,
				}));
			}
		};
		reader.readAsDataURL(file);
	};

	const handleAddSupport = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);
		try {
			const autonomyFormatted = newSupport.autonomy
				.toString()
				.replace(".", ",");
			const supportData = {
				...newSupport,
				equivalent_km: Number(newSupport.equivalent_km),
				initial_price_brc: Number(newSupport.initial_price_brc),
				list_price_brc: Number(newSupport.list_price_brc),
				promo_price_brc: Number(newSupport.promo_price_brc),
				initial_price_ta: Number(newSupport.initial_price_ta),
				list_price_ta: Number(newSupport.list_price_ta),
				promo_price_ta: Number(newSupport.promo_price_ta),
				autonomy: `${autonomyFormatted} Litros de Nafta`,
			};
			delete supportData.tempImage;
			delete supportData.tempFile;

			const response = await api.post("/api/support", supportData);
			let newSupportData = response.data;

			if (newSupport.tempFile) {
				const formData = new FormData();
				formData.append("file", newSupport.tempFile);

				const imageResponse = await api.post(
					`/api/support-images/${response.data.id}`,
					formData,
					{
						headers: {
							"Content-Type": "multipart/form-data",
						},
					}
				);
				newSupportData = {
					...newSupportData,
					support_images: [imageResponse.data],
				};
			}

			setSupports((prev) => [...prev, newSupportData]);

			const prefix = newSupportData.code.split("-")[0].toLowerCase();
			setCategoryDetails((prevDetails) => {
				const newDetails = { ...prevDetails };
				if (newDetails[prefix]) {
					newDetails[prefix] = [...newDetails[prefix], newSupportData];
				}
				return newDetails;
			});

			setNewSupport({
				code: "",
				name: "",
				autonomy: "",
				equivalent_km: "",
				initial_price_brc: "",
				list_price_brc: "",
				promo_price_brc: "",
				initial_price_ta: "",
				list_price_ta: "",
				promo_price_ta: "",
				tempImage: null,
				tempFile: null,
			});
			setSuccessMessage("Soporte agregado exitosamente");
		} catch (error) {
			console.error("Error adding support:", error);
			setErrorMessage("Error al agregar soporte");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleUpdateSupport = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);
		try {
			const autonomyFormatted = editingSupport.autonomy
				.toString()
				.replace(".", ",");
			const updateData = {
				code: editingSupport.code,
				name: editingSupport.name,
				autonomy: `${autonomyFormatted} Litros de Nafta`,
				equivalent_km: Number(editingSupport.equivalent_km),
				initial_price_brc: Number(editingSupport.initial_price_brc),
				list_price_brc: Number(editingSupport.list_price_brc),
				promo_price_brc: Number(editingSupport.promo_price_brc),
				initial_price_ta: Number(editingSupport.initial_price_ta),
				list_price_ta: Number(editingSupport.list_price_ta),
				promo_price_ta: Number(editingSupport.promo_price_ta),
			};

			const response = await api.patch(
				`/api/support/${editingSupport.id}`,
				updateData
			);

			if (editingSupport.tempFile) {
				if (editingSupport.support_images?.length > 0) {
					await Promise.all(
						editingSupport.support_images.map((img) =>
							api.delete(`/api/support-images/${img.id}`)
						)
					);
				}

				const formData = new FormData();
				formData.append("file", editingSupport.tempFile);
				const imageResponse = await api.post(
					`/api/support-images/${editingSupport.id}`,
					formData,
					{
						headers: {
							"Content-Type": "multipart/form-data",
						},
					}
				);

				response.data.support_images = [imageResponse.data];
			}

			const updatedSupport = response.data;

			setSupports(
				supports.map((support) =>
					support.id === editingSupport.id ? updatedSupport : support
				)
			);

			setCategoryDetails((prevDetails) => {
				const newDetails = { ...prevDetails };
				Object.keys(newDetails).forEach((prefix) => {
					if (newDetails[prefix]) {
						newDetails[prefix] = newDetails[prefix].map((support) =>
							support.id === editingSupport.id ? updatedSupport : support
						);
					}
				});
				return newDetails;
			});

			setEditingSupport(null);
			setSuccessMessage("Soporte actualizado exitosamente");
		} catch (error) {
			console.error("Error updating support:", error);
			setErrorMessage("Error al actualizar soporte");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDeleteSupport = async (supportId) => {
		try {
			// Primero buscamos el support para obtener sus imágenes
			const supportToDelete = supports.find((s) => s.id === supportId);

			// Si el support tiene imágenes, las eliminamos primero
			if (supportToDelete?.support_images?.length > 0) {
				await Promise.all(
					supportToDelete.support_images.map((img) =>
						api.delete(`/api/support-images/${img.id}`)
					)
				);
			}

			// Luego eliminamos el support
			await api.delete(`/api/support/${supportId}`);

			// Actualizamos el estado principal de supports
			setSupports(supports.filter((support) => support.id !== supportId));

			// Actualizamos categoryDetails
			setCategoryDetails((prevDetails) => {
				const newDetails = { ...prevDetails };
				// Actualizamos cada categoría que exista
				Object.keys(newDetails).forEach((prefix) => {
					if (newDetails[prefix]) {
						newDetails[prefix] = newDetails[prefix].filter(
							(support) => support.id !== supportId
						);
					}
				});
				return newDetails;
			});

			setSuccessMessage("Soporte eliminado exitosamente");
		} catch (error) {
			console.error("Error deleting support:", error);
			setErrorMessage("Error al eliminar soporte");
		}
	};

	const handleEditClick = (support) => {
		// Primero limpiamos el estado anterior
		setEditingSupport(null);

		// Después de un pequeño delay, establecemos el nuevo estado
		setTimeout(() => {
			// Extraer solo el número de la cadena "X Litros de Nafta"
			const autonomyNumber = support.autonomy
				? support.autonomy.split(" ")[0].replace(",", ".")
				: "";

			setEditingSupport({
				...support,
				initial_price_brc: support.initial_price_brc || "",
				list_price_brc: support.list_price_brc || "",
				promo_price_brc: support.promo_price_brc || "",
				initial_price_ta: support.initial_price_ta || "",
				list_price_ta: support.list_price_ta || "",
				promo_price_ta: support.promo_price_ta || "",
				code: support.code || "",
				name: support.name || "",
				autonomy: autonomyNumber,
				equivalent_km: support.equivalent_km || "",
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
						<div className="p-8 pt-0 space-y-8 rounded-xl bg-white/50 backdrop-blur-sm mt-8">
							<div className="mb-6">
								<h2 className="text-2xl font-light text-zinc-900">
									Cilindros y Precios
								</h2>
								<p className="text-zinc-600 text-sm mt-1">
									Actualiza el inventario de cilindros y gestiona sus precios.
								</p>
							</div>

							<form
								onSubmit={
									editingSupport ? handleUpdateSupport : handleAddSupport
								}
								className="grid grid-cols-1 md:grid-cols-3 gap-3"
							>
								<div className="space-y-2 col-span-3 md:col-span-1">
									<label className="text-sm font-normal text-zinc-700">
										Código
									</label>
									<input
										type="text"
										value={
											editingSupport ? editingSupport.code : newSupport.code
										}
										onChange={(e) =>
											editingSupport
												? setEditingSupport({
														...editingSupport,
														code: e.target.value,
													})
												: setNewSupport({ ...newSupport, code: e.target.value })
										}
										className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-200 bg-white/50 text-zinc-900 placeholder:text-zinc-600 transition-all duration-200"
										placeholder="Ej: 3ra-, 4ta-, 5ta-, 6ta-"
										required
									/>
								</div>
								<div className="space-y-2 col-span-3 md:col-span-1 ">
									<label className="text-sm font-normal text-zinc-700">
										Nombre
									</label>
									<input
										type="text"
										value={
											editingSupport ? editingSupport.name : newSupport.name
										}
										onChange={(e) =>
											editingSupport
												? setEditingSupport({
														...editingSupport,
														name: e.target.value,
													})
												: setNewSupport({ ...newSupport, name: e.target.value })
										}
										className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-200 bg-white/50 text-zinc-900 placeholder:text-zinc-600 transition-all duration-200"
										placeholder="Ejemplo de cilindro: 5ta 2x30"
										required
									/>
								</div>
								<div className="space-y-2 col-span-3 md:col-span-1">
									<label className="text-sm font-normal text-zinc-700">
										Autonomía (Litros de Nafta)
									</label>
									<input
										type="number"
										value={
											editingSupport
												? editingSupport.autonomy
												: newSupport.autonomy
										}
										onChange={(e) =>
											editingSupport
												? setEditingSupport({
														...editingSupport,
														autonomy: e.target.value,
													})
												: setNewSupport({
														...newSupport,
														autonomy: e.target.value,
													})
										}
										className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-200 bg-white/50 text-zinc-900 placeholder:text-zinc-600 transition-all duration-200"
										placeholder="Ej: 15"
										required
									/>
								</div>
								<div className="space-y-2">
									<label className="text-sm font-normal text-zinc-700">
										Km Equivalentes
									</label>
									<input
										type="number"
										value={
											editingSupport
												? editingSupport.equivalent_km
												: newSupport.equivalent_km
										}
										onChange={(e) =>
											editingSupport
												? setEditingSupport({
														...editingSupport,
														equivalent_km: e.target.value,
													})
												: setNewSupport({
														...newSupport,
														equivalent_km: e.target.value,
													})
										}
										className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-200 bg-white/50 text-zinc-900 placeholder:text-zinc-600 transition-all duration-200"
										placeholder="Ej: 100 km"
										required
									/>
								</div>
								{/* Precios BRC */}
								<div className="col-span-3 mt-4">
									<h3 className="text-xl font-light text-zinc-900 mb-4">
										Precios BRC
									</h3>
									<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
										<div className="space-y-2">
											<label className="text-sm font-normal text-zinc-700">
												Precio Inicial BRC
											</label>
											<input
												type="number"
												value={
													editingSupport
														? editingSupport.initial_price_brc
														: newSupport.initial_price_brc
												}
												onChange={(e) =>
													editingSupport
														? setEditingSupport({
																...editingSupport,
																initial_price_brc: e.target.value,
															})
														: setNewSupport({
																...newSupport,
																initial_price_brc: e.target.value,
															})
												}
												className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-200 bg-white/50 text-zinc-900 placeholder:text-zinc-600 transition-all duration-200"
												placeholder="Ej: $1,126,000"
											/>
										</div>
										<div className="space-y-2">
											<label className="text-sm font-normal text-zinc-700">
												Precio de Lista BRC
											</label>
											<input
												type="number"
												value={
													editingSupport
														? editingSupport.list_price_brc
														: newSupport.list_price_brc
												}
												onChange={(e) =>
													editingSupport
														? setEditingSupport({
																...editingSupport,
																list_price_brc: e.target.value,
															})
														: setNewSupport({
																...newSupport,
																list_price_brc: e.target.value,
															})
												}
												className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-200 bg-white/50 text-zinc-900 placeholder:text-zinc-600 transition-all duration-200"
												placeholder="Ej: $1,126,000"
											/>
										</div>
										<div className="space-y-2">
											<label className="text-sm font-normal text-zinc-700">
												Precio Promocional BRC
											</label>
											<input
												type="number"
												value={
													editingSupport
														? editingSupport.promo_price_brc
														: newSupport.promo_price_brc
												}
												onChange={(e) =>
													editingSupport
														? setEditingSupport({
																...editingSupport,
																promo_price_brc: e.target.value,
															})
														: setNewSupport({
																...newSupport,
																promo_price_brc: e.target.value,
															})
												}
												className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-200 bg-white/50 text-zinc-900 placeholder:text-zinc-600 transition-all duration-200"
												placeholder="Ej: $1,126,000"
											/>
										</div>
									</div>
								</div>
								{/* Precios TA */}
								<div className="col-span-3 mt-4">
									<h3 className="text-xl font-light text-zinc-900 mb-4">
										Precios TA
									</h3>
									<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
										<div className="space-y-2">
											<label className="text-sm font-normal text-zinc-700">
												Precio Inicial TA
											</label>
											<input
												type="number"
												value={
													editingSupport
														? editingSupport.initial_price_ta
														: newSupport.initial_price_ta
												}
												onChange={(e) =>
													editingSupport
														? setEditingSupport({
																...editingSupport,
																initial_price_ta: e.target.value,
															})
														: setNewSupport({
																...newSupport,
																initial_price_ta: e.target.value,
															})
												}
												className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-200 bg-white/50 text-zinc-900 placeholder:text-zinc-600 transition-all duration-200"
												placeholder="Ej: $1,126,000"
											/>
										</div>
										<div className="space-y-2">
											<label className="text-sm font-normal text-zinc-700">
												Precio de Lista TA
											</label>
											<input
												type="number"
												value={
													editingSupport
														? editingSupport.list_price_ta
														: newSupport.list_price_ta
												}
												onChange={(e) =>
													editingSupport
														? setEditingSupport({
																...editingSupport,
																list_price_ta: e.target.value,
															})
														: setNewSupport({
																...newSupport,
																list_price_ta: e.target.value,
															})
												}
												className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-200 bg-white/50 text-zinc-900 placeholder:text-zinc-600 transition-all duration-200"
												placeholder="Ej: $1,126,000"
											/>
										</div>
										<div className="space-y-2">
											<label className="text-sm font-normal text-zinc-700">
												Precio Promocional TA
											</label>
											<input
												type="number"
												value={
													editingSupport
														? editingSupport.promo_price_ta
														: newSupport.promo_price_ta
												}
												onChange={(e) =>
													editingSupport
														? setEditingSupport({
																...editingSupport,
																promo_price_ta: e.target.value,
															})
														: setNewSupport({
																...newSupport,
																promo_price_ta: e.target.value,
															})
												}
												className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-200 bg-white/50 text-zinc-900 placeholder:text-zinc-600 transition-all duration-200"
												placeholder="Ej: $1,126,000"
											/>
										</div>
									</div>
								</div>
								<div className="col-span-3">
									<label className="text-sm font-normal text-zinc-700">
										Imagen
									</label>
									<div className="mt-2">
										<div className="relative">
											{editingSupport?.tempImage ? (
												<>
													<div className="relative w-full h-48 overflow-hidden border border-zinc-200">
														<Image
															src={editingSupport.tempImage}
															alt="Preview"
															fill
															className="object-contain"
														/>
													</div>
													<div className="absolute top-2 right-2">
														<button
															type="button"
															onClick={() => {
																setEditingSupport({
																	...editingSupport,
																	tempImage: null,
																	tempFile: null,
																});
															}}
															className="p-2 rounded-md bg-white/90 backdrop-blur-sm border border-zinc-200 text-red-600 hover:bg-red-50 transition-colors duration-200"
														>
															<Trash2 className="w-4 h-4" />
														</button>
													</div>
												</>
											) : editingSupport?.support_images?.length > 0 ? (
												<>
													<div className="relative w-full h-48 overflow-hidden border border-zinc-200">
														<Image
															src={editingSupport.support_images[0].url}
															alt={editingSupport.support_images[0].name}
															fill
															className="object-contain"
														/>
													</div>
													<div className="absolute top-2 right-2 flex gap-2">
														<label
															htmlFor="imageUpload"
															className="p-2 rounded-md bg-white/90 backdrop-blur-sm border border-zinc-200 text-zinc-700 hover:bg-zinc-100 transition-colors duration-200 cursor-pointer"
														>
															<Edit className="w-4 h-4" />
														</label>
														<button
															type="button"
															onClick={async () => {
																try {
																	await api.delete(
																		`/api/support-images/${editingSupport.support_images[0].id}`
																	);
																	setEditingSupport({
																		...editingSupport,
																		support_images: [],
																	});
																	setSupports(
																		supports.map((s) =>
																			s.id === editingSupport.id
																				? { ...s, support_images: [] }
																				: s
																		)
																	);
																	toast.success(
																		"Imagen eliminada exitosamente"
																	);
																} catch (error) {
																	console.error("Error deleting image:", error);
																	toast.error("Error al eliminar la imagen");
																}
															}}
															className="p-2 rounded-md bg-white/90 backdrop-blur-sm border border-zinc-200 text-red-600 hover:bg-red-50 transition-colors duration-200"
														>
															<Trash2 className="w-4 h-4" />
														</button>
													</div>
												</>
											) : newSupport.tempImage ? (
												<>
													<div className="relative w-full h-48 overflow-hidden border border-zinc-200">
														<Image
															src={newSupport.tempImage}
															alt="Preview"
															fill
															className="object-contain"
														/>
													</div>
													<div className="absolute top-2 right-2">
														<button
															type="button"
															onClick={() => {
																setNewSupport({
																	...newSupport,
																	tempImage: null,
																	tempFile: null,
																});
															}}
															className="p-2 rounded-md bg-white/90 backdrop-blur-sm border border-zinc-200 text-red-600 hover:bg-red-50 transition-colors duration-200"
														>
															<Trash2 className="w-4 h-4" />
														</button>
													</div>
												</>
											) : (
												<label
													htmlFor="imageUpload"
													className="flex items-center justify-center w-full gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-100 transition-colors duration-200 cursor-pointer"
												>
													<Upload className="w-4 h-4" />
													<span className="text-sm">Subir Imagen</span>
												</label>
											)}
											<input
												type="file"
												id="imageUpload"
												accept="image/*"
												onChange={handleImageUpload}
												className="hidden"
											/>
										</div>
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
									key={editingSupport ? "editing" : "adding"}
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
												{editingSupport ? "Actualizando..." : "Agregando..."}
											</div>
										) : (
											<>
												<Plus className="w-4 h-4" />
												{editingSupport ? "Actualizar" : "Agregar"}
											</>
										)}
									</motion.button>
									{editingSupport && (
										<motion.button
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											exit={{ opacity: 0, x: 20 }}
											transition={{
												duration: 0.2,
												ease: "easeOut",
											}}
											type="button"
											onClick={() => setEditingSupport(null)}
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

							<div className="pt-6 border-t border-zinc-200">
								<h3 className="text-2xl font-light text-zinc-900 mb-4">
									Cilindros Existentes
								</h3>
								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									className="flex flex-col text-sm gap-4"
								>
									{["3ra", "4ta", "5ta"].map((prefix) => {
										const categorySupports = supports.filter((support) =>
											support.code
												.toLowerCase()
												.startsWith(prefix.toLowerCase())
										);

										return (
											<motion.div
												key={prefix}
												initial={{ opacity: 0, y: 10 }}
												animate={{ opacity: 1, y: 0 }}
												className="w-full"
											>
												<div className="bg-white/50 backdrop-blur-sm border border-zinc-200 rounded-lg p-4 hover:border-zinc-300 transition-all duration-200">
													<div
														onClick={() => handleExpandCard(prefix)}
														className="flex gap-2 cursor-pointer"
													>
														<h3 className="text-base font-normal text-zinc-600">
															<span className="uppercase">{prefix}</span>{" "}
															Generación
														</h3>
														<p className="text-sm text-zinc-500 mt-1">
															- {categorySupports.length} cilindros disponibles.
														</p>
													</div>

													<AnimatePresence>
														{expandedCard === prefix && (
															<motion.div
																initial={{ opacity: 0, height: 0 }}
																animate={{ opacity: 1, height: "auto" }}
																exit={{ opacity: 0, height: 0 }}
																transition={{ duration: 0.2 }}
																className="bg-white rounded-lg mt-4 overflow-hidden"
															>
																<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
																	{loadingSupports
																		? // Skeleton loading cards
																			[...Array(4)].map((_, index) => (
																				<div
																					key={`skeleton-${index}`}
																					className="bg-white/50 backdrop-blur-sm border border-zinc-100 rounded-lg p-4"
																				>
																					<div className="mb-3 w-full h-48 bg-zinc-200 animate-pulse rounded-lg"></div>
																					<div className="space-y-2">
																						<div className="h-4 bg-zinc-200 animate-pulse rounded"></div>
																						<div className="h-3 bg-zinc-200 animate-pulse rounded w-3/4"></div>
																					</div>
																				</div>
																			))
																		: categoryDetails[prefix]?.map(
																				(support) => (
																					<div
																						key={support.id}
																						className="bg-white/50 backdrop-blur-sm border border-zinc-200 rounded-lg p-4 hover:border-zinc-300 transition-all duration-200 flex flex-col h-full"
																					>
																						{support.support_images &&
																							support.support_images.length >
																								0 && (
																								<div className="mb-3 w-full h-48 relative overflow-hidden">
																									<Image
																										src={
																											support.support_images[0]
																												.url
																										}
																										alt={
																											support.support_images[0]
																												.name
																										}
																										fill
																										sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
																										className="object-contain w-full h-full max-h-48"
																										priority={false}
																									/>
																								</div>
																							)}
																						<div className="flex flex-col flex-grow">
																							<div>
																								<p className="text-base text-zinc-800">
																									{support.code}
																								</p>
																								<p className="text-xs mt-2 font-normal text-zinc-600">
																									{support.name}
																								</p>
																							</div>
																							{/* <div className="space-y-1">
																								<p className="text-xs text-zinc-600">
																									Autonomía: {support.autonomy}
																								</p>
																								<p className="text-xs text-zinc-600">
																									Km Equiv.:{" "}
																									{support.equivalent_km}
																								</p>
																								<p className="text-xs text-zinc-600">
																									Precio: ${support.list_price}
																								</p>
																							</div> */}
																							<div className="flex gap-2 pt-4 mt-auto">
																								<button
																									onClick={() =>
																										handleEditClick(support)
																									}
																									className="flex-1 p-1.5 rounded-md text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
																								>
																									<Edit className="w-4 h-4 mx-auto" />
																								</button>
																								<button
																									onClick={() =>
																										handleDeleteSupport(
																											support.id
																										)
																									}
																									className="flex-1 p-1.5 rounded-md text-zinc-600 hover:text-red-600 hover:bg-red-50 transition-colors"
																								>
																									<Trash2 className="w-4 h-4 mx-auto" />
																								</button>
																							</div>
																						</div>
																					</div>
																				)
																			)}
																</div>
															</motion.div>
														)}
													</AnimatePresence>
												</div>
											</motion.div>
										);
									})}
								</motion.div>
							</div>
						</div>
					</div>
				</div>
			</motion.main>
		</div>
	);
}
