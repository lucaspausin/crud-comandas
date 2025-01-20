"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "@/lib/axios";
import { Plus, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";

export default function BrandsEditor() {
	const [brands, setBrands] = useState([]);
	const [newBrand, setNewBrand] = useState({ code: "", name: "" });
	const [editingBrand, setEditingBrand] = useState(null);

	useEffect(() => {
		const fetchBrands = async () => {
			try {
				const response = await api.get("/api/brands");
				setBrands(response.data);
			} catch (error) {
				console.error("Error fetching brands:", error);
				toast.error("Error al cargar marcas");
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
			toast.success("Marca agregada exitosamente");
		} catch (error) {
			console.error("Error adding brand:", error);
			toast.error("Error al agregar marca");
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
			toast.success("Marca actualizada exitosamente");
		} catch (error) {
			console.error("Error updating brand:", error);
			toast.error("Error al actualizar marca");
		}
	};

	const handleDeleteBrand = async (brandId) => {
		try {
			await api.delete(`/api/brands/${brandId}`);
			setBrands(brands.filter((brand) => brand.id !== brandId));
			toast.success("Marca eliminada exitosamente");
		} catch (error) {
			console.error("Error deleting brand:", error);
			toast.error("Error al eliminar marca");
		}
	};

	return (
		<div className="p-4 space-y-4">
			<form
				onSubmit={editingBrand ? handleUpdateBrand : handleAddBrand}
				className="grid grid-cols-1 md:grid-cols-[1fr,1fr,auto] gap-3"
			>
				<div>
					<label className="block text-sm text-zinc-600 mb-1">Código</label>
					<input
						type="text"
						value={editingBrand ? editingBrand.code : newBrand.code}
						onChange={(e) =>
							editingBrand
								? setEditingBrand({ ...editingBrand, code: e.target.value })
								: setNewBrand({ ...newBrand, code: e.target.value })
						}
						className="w-full border border-zinc-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-200"
						placeholder="Código de marca"
						required
					/>
				</div>
				<div>
					<label className="block text-sm text-zinc-600 mb-1">Nombre</label>
					<input
						type="text"
						value={editingBrand ? editingBrand.name : newBrand.name}
						onChange={(e) =>
							editingBrand
								? setEditingBrand({ ...editingBrand, name: e.target.value })
								: setNewBrand({ ...newBrand, name: e.target.value })
						}
						className="w-full border border-zinc-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-200"
						placeholder="Nombre de marca"
						required
					/>
				</div>
				<div className="flex items-end">
					<button
						type="submit"
						className="w-full bg-emerald-500 text-white px-4 py-2 rounded-md hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
					>
						<Plus className="w-4 h-4" />
						{editingBrand ? "Actualizar" : "Agregar"}
					</button>
					{editingBrand && (
						<button
							type="button"
							onClick={() => setEditingBrand(null)}
							className="ml-2 bg-zinc-200 text-zinc-700 px-4 py-2 rounded-md hover:bg-zinc-300 transition-colors"
						>
							Cancelar
						</button>
					)}
				</div>
			</form>

			<div className="border-t pt-4">
				<h3 className="text-lg font-medium text-zinc-800 mb-4">
					Marcas Existentes
				</h3>
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
				>
					{brands.map((brand) => (
						<motion.div
							key={brand.id}
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							className="bg-white border rounded-lg p-3 flex justify-between items-center"
						>
							<div>
								<p className="text-sm font-medium text-zinc-800">
									{brand.name}
								</p>
								<p className="text-xs text-zinc-500">{brand.code}</p>
							</div>
							<div className="flex gap-2">
								<button
									onClick={() => setEditingBrand(brand)}
									className="text-zinc-600 hover:text-zinc-800 transition-colors"
								>
									<Edit className="w-4 h-4" />
								</button>
								<button
									onClick={() => handleDeleteBrand(brand.id)}
									className="text-red-500 hover:text-red-600 transition-colors"
								>
									<Trash2 className="w-4 h-4" />
								</button>
							</div>
						</motion.div>
					))}
				</motion.div>
			</div>
		</div>
	);
}
