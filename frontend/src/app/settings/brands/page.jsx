"use client";
// import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Aside from "@/components/Aside";
// import Link from "next/link";
import api from "@/lib/axios";
import { Plus, Edit, Trash2 } from "lucide-react";
import HomeIcon from "@/components/HomeIcon";

export default function Settings() {
	const [brands, setBrands] = useState([]);
	const [newBrand, setNewBrand] = useState({ code: "", name: "" });
	const [editingBrand, setEditingBrand] = useState(null);
	const [successMessage, setSuccessMessage] = useState("");
	const [errorMessage, setErrorMessage] = useState("");

	useEffect(() => {
		const fetchBrands = async () => {
			try {
				const response = await api.get("/api/brands");
				setBrands(response.data);
			} catch (error) {
				console.error("Error fetching brands:", error);
				setErrorMessage(
					"No se pudieron cargar las marcas. Por favor, intenta nuevamente más tarde."
				);
				setTimeout(() => setErrorMessage(""), 2000);
			}
		};
		fetchBrands();
	}, []);

	const handleAddBrand = async (e) => {
		e.preventDefault();
		try {
			const response = await api.post("/api/brands", newBrand);
			setBrands([...brands, response.data]);
			setNewBrand({ code: "", name: "" });
			setSuccessMessage("La marca se ha agregado con éxito.");
			setTimeout(() => setSuccessMessage(""), 2000);
		} catch (error) {
			console.error("Error adding brand:", error);
			setErrorMessage(
				"Hubo un problema al intentar agregar la marca. Por favor, inténtalo de nuevo."
			);
			setTimeout(() => setErrorMessage(""), 2000);
		}
	};

	const handleUpdateBrand = async (e) => {
		e.preventDefault();
		try {
			const response = await api.patch(
				`/api/brands/${editingBrand.id}`,
				editingBrand
			);
			setBrands(
				brands.map((brand) =>
					brand.id === editingBrand.id ? response.data : brand
				)
			);
			setEditingBrand(null);
			setSuccessMessage("La marca se ha actualizado con éxito.");
			setTimeout(() => setSuccessMessage(""), 2000);
		} catch (error) {
			console.error("Error updating brand:", error);
			setErrorMessage("Ocurrió un error al intentar actualizar la marca.");
			setTimeout(() => setErrorMessage(""), 2000);
		}
	};

	const handleDeleteBrand = async (brandId) => {
		try {
			await api.delete(`/api/brands/${brandId}`);
			setBrands(brands.filter((brand) => brand.id !== brandId));
			setSuccessMessage("La marca ha sido eliminada con éxito.");
			setTimeout(() => setSuccessMessage(""), 2000);
		} catch (error) {
			console.error("Error deleting brand:", error);
			setErrorMessage("Ocurrió un error al intentar eliminar la marca.");
			setTimeout(() => setErrorMessage(""), 2000);
		}
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
									Gestión de Marcas
								</h2>
								<p className="text-zinc-600 text-sm mt-1">
									Agrega o modifica las marcas del catálogo.
								</p>
							</div>

							<form
								onSubmit={editingBrand ? handleUpdateBrand : handleAddBrand}
								className="grid grid-cols-1 md:grid-cols-2 gap-4"
							>
								<div className="flex flex-col md:flex-row gap-2 w-full col-span-2">
									<div className="space-y-2 w-full">
										<label className="text-sm font-normal text-zinc-700">
											Código
										</label>
										<input
											type="text"
											value={editingBrand ? editingBrand.code : newBrand.code}
											onChange={(e) =>
												editingBrand
													? setEditingBrand({
															...editingBrand,
															code: e.target.value,
														})
													: setNewBrand({ ...newBrand, code: e.target.value })
											}
											className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-200 bg-white/50 text-zinc-900 placeholder:text-zinc-600 transition-all duration-200"
											placeholder="Código de la marca (ej: alfa-romeo)"
											required
										/>
									</div>
									<div className="space-y-2 w-full">
										<label className="text-sm font-normal text-zinc-700">
											Nombre
										</label>
										<input
											type="text"
											value={editingBrand ? editingBrand.name : newBrand.name}
											onChange={(e) =>
												editingBrand
													? setEditingBrand({
															...editingBrand,
															name: e.target.value,
														})
													: setNewBrand({ ...newBrand, name: e.target.value })
											}
											className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-200 bg-white/50 placeholder:text-zinc-600 text-zinc-900 transition-all duration-200"
											placeholder="Nombre de la marca (ej: Alfa Romeo)"
											required
										/>
									</div>
								</div>
								<motion.div
									className="flex items-center gap-2 col-span-2 w-full"
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -20 }}
									transition={{
										duration: 0.3,
										ease: "easeInOut",
									}}
									key={editingBrand ? "editing" : "adding"}
								>
									<motion.button
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: 0.1 }}
										type="submit"
										className="flex items-center justify-center gap-1 px-4 py-2.5 rounded-sm bg-zinc-900 text-white hover:bg-zinc-800 transition-colors duration-200 w-full font-normal text-sm"
									>
										<Plus className="w-4 h-4" />
										{editingBrand ? "Actualizar" : "Agregar"}
									</motion.button>
									{editingBrand && (
										<motion.button
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											exit={{ opacity: 0, x: 20 }}
											transition={{
												duration: 0.2,
												ease: "easeOut",
											}}
											type="button"
											onClick={() => setEditingBrand(null)}
											className="px-4 py-3.5 rounded-sm border border-zinc-200 text-zinc-700 hover:bg-zinc-100 transition-colors duration-200 w-full font-normal text-sm"
										>
											Cancelar
										</motion.button>
									)}
								</motion.div>

								<AnimatePresence mode="wait">
									{successMessage && (
										<motion.div
											className="col-span-2 mt-4"
											initial={{ opacity: 0, y: -10 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: 10 }}
											transition={{ duration: 0.3 }}
										>
											<motion.p
												className="text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 flex items-center justify-center"
												initial={{ scale: 0.95 }}
												animate={{ scale: 1 }}
												exit={{ scale: 0.95 }}
											>
												{successMessage}
											</motion.p>
										</motion.div>
									)}
									{errorMessage && (
										<motion.div
											className="col-span-2 mt-4"
											initial={{ opacity: 0, y: -10 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: 10 }}
											transition={{ duration: 0.3 }}
										>
											<motion.p
												className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center justify-center"
												initial={{ scale: 0.95 }}
												animate={{ scale: 1 }}
												exit={{ scale: 0.95 }}
											>
												{errorMessage}
											</motion.p>
										</motion.div>
									)}
								</AnimatePresence>
							</form>

							<div className="pt-6 border-t border-zinc-200">
								<h3 className="text-xl font-light text-zinc-900 mb-4">
									Marcas Existentes
								</h3>
								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
								>
									{brands.map((brand) => (
										<motion.div
											key={brand.id}
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											className="group bg-white/50 backdrop-blur-sm border border-zinc-200 rounded-lg p-4 hover:border-zinc-300 transition-all duration-200"
										>
											<div className="flex justify-between items-center">
												<div>
													<p className="text-sm font-medium text-zinc-900">
														{brand.name}
													</p>
													<p className="text-xs text-zinc-500 mt-0.5">
														{brand.code}
													</p>
												</div>
												<div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
													<button
														onClick={() => setEditingBrand(brand)}
														className="p-1.5 rounded-md text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
													>
														<Edit className="w-4 h-4" />
													</button>
													<button
														onClick={() => handleDeleteBrand(brand.id)}
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
