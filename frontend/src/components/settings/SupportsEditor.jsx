"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "@/lib/axios";
import { Plus, Trash2, Edit, Upload } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export default function SupportsEditor() {
	const [supports, setSupports] = useState([]);
	const [newSupport, setNewSupport] = useState({
		code: "",
		name: "",
		autonomy: "",
		equivalent_km: "",
		initial_price: "",
		list_price: "",
		promo_price: "",
		image: null,
	});
	const [editingSupport, setEditingSupport] = useState(null);

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

	const handleImageUpload = (e) => {
		const file = e.target.files[0];
		const reader = new FileReader();
		reader.onloadend = () => {
			if (editingSupport) {
				setEditingSupport({ ...editingSupport, image: reader.result });
			} else {
				setNewSupport({ ...newSupport, image: reader.result });
			}
		};
		reader.readAsDataURL(file);
	};

	const handleAddSupport = async (e) => {
		e.preventDefault();
		try {
			const response = await api.post("/api/support", newSupport);
			setSupports([...supports, response.data]);
			setNewSupport({
				code: "",
				name: "",
				autonomy: "",
				equivalent_km: "",
				initial_price: "",
				list_price: "",
				promo_price: "",
				image: null,
			});
			toast.success("Soporte agregado exitosamente");
		} catch (error) {
			console.error("Error adding support:", error);
			toast.error("Error al agregar soporte");
		}
	};

	const handleUpdateSupport = async (e) => {
		e.preventDefault();
		try {
			const response = await api.patch(
				`/api/support/${editingSupport.id}`,
				editingSupport
			);
			setSupports(
				supports.map((support) =>
					support.id === editingSupport.id ? response.data : support
				)
			);
			setEditingSupport(null);
			toast.success("Soporte actualizado exitosamente");
		} catch (error) {
			console.error("Error updating support:", error);
			toast.error("Error al actualizar soporte");
		}
	};

	const handleDeleteSupport = async (supportId) => {
		try {
			await api.delete(`/api/support/${supportId}`);
			setSupports(supports.filter((support) => support.id !== supportId));
			toast.success("Soporte eliminado exitosamente");
		} catch (error) {
			console.error("Error deleting support:", error);
			toast.error("Error al eliminar soporte");
		}
	};

	return (
		<div className="p-4 space-y-4">
			<form
				onSubmit={editingSupport ? handleUpdateSupport : handleAddSupport}
				className="grid grid-cols-1 md:grid-cols-3 gap-3"
			>
				<div>
					<label className="block text-sm text-zinc-600 mb-1">Código</label>
					<input
						type="text"
						value={editingSupport ? editingSupport.code : newSupport.code}
						onChange={(e) =>
							editingSupport
								? setEditingSupport({ ...editingSupport, code: e.target.value })
								: setNewSupport({ ...newSupport, code: e.target.value })
						}
						className="w-full border border-zinc-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-200"
						placeholder="Código de soporte"
						required
					/>
				</div>
				<div>
					<label className="block text-sm text-zinc-600 mb-1">Nombre</label>
					<input
						type="text"
						value={editingSupport ? editingSupport.name : newSupport.name}
						onChange={(e) =>
							editingSupport
								? setEditingSupport({ ...editingSupport, name: e.target.value })
								: setNewSupport({ ...newSupport, name: e.target.value })
						}
						className="w-full border border-zinc-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-200"
						placeholder="Nombre de soporte"
						required
					/>
				</div>
				<div>
					<label className="block text-sm text-zinc-600 mb-1">Autonomía</label>
					<input
						type="text"
						value={
							editingSupport ? editingSupport.autonomy : newSupport.autonomy
						}
						onChange={(e) =>
							editingSupport
								? setEditingSupport({
										...editingSupport,
										autonomy: e.target.value,
									})
								: setNewSupport({ ...newSupport, autonomy: e.target.value })
						}
						className="w-full border border-zinc-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-200"
						placeholder="Autonomía"
						required
					/>
				</div>
				<div>
					<label className="block text-sm text-zinc-600 mb-1">
						Km Equivalentes
					</label>
					<input
						type="text"
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
						className="w-full border border-zinc-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-200"
						placeholder="Kilómetros equivalentes"
						required
					/>
				</div>
				<div>
					<label className="block text-sm text-zinc-600 mb-1">
						Precio Inicial
					</label>
					<input
						type="text"
						value={
							editingSupport
								? editingSupport.initial_price
								: newSupport.initial_price
						}
						onChange={(e) =>
							editingSupport
								? setEditingSupport({
										...editingSupport,
										initial_price: e.target.value,
									})
								: setNewSupport({
										...newSupport,
										initial_price: e.target.value,
									})
						}
						className="w-full border border-zinc-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-200"
						placeholder="Precio inicial"
						required
					/>
				</div>
				<div>
					<label className="block text-sm text-zinc-600 mb-1">
						Precio de Lista
					</label>
					<input
						type="text"
						value={
							editingSupport ? editingSupport.list_price : newSupport.list_price
						}
						onChange={(e) =>
							editingSupport
								? setEditingSupport({
										...editingSupport,
										list_price: e.target.value,
									})
								: setNewSupport({ ...newSupport, list_price: e.target.value })
						}
						className="w-full border border-zinc-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-200"
						placeholder="Precio de lista"
						required
					/>
				</div>
				<div>
					<label className="block text-sm text-zinc-600 mb-1">
						Precio Promocional
					</label>
					<input
						type="text"
						value={
							editingSupport
								? editingSupport.promo_price
								: newSupport.promo_price
						}
						onChange={(e) =>
							editingSupport
								? setEditingSupport({
										...editingSupport,
										promo_price: e.target.value,
									})
								: setNewSupport({ ...newSupport, promo_price: e.target.value })
						}
						className="w-full border border-zinc-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-200"
						placeholder="Precio promocional"
						required
					/>
				</div>
				<div className="flex items-end">
					<div className="w-full">
						<label className="block text-sm text-zinc-600 mb-1">Imagen</label>
						<div className="flex items-center gap-2">
							<input
								type="file"
								accept="image/*"
								onChange={handleImageUpload}
								className="hidden"
								id="imageUpload"
							/>
							<label
								htmlFor="imageUpload"
								className="w-full bg-zinc-100 text-zinc-700 px-4 py-2 rounded-md hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
							>
								<Upload className="w-4 h-4" />
								Subir Imagen
							</label>
						</div>
					</div>
				</div>
				<div className="flex items-end">
					<button
						type="submit"
						className="w-full bg-emerald-500 text-white px-4 py-2 rounded-md hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
					>
						<Plus className="w-4 h-4" />
						{editingSupport ? "Actualizar" : "Agregar"}
					</button>
					{editingSupport && (
						<button
							type="button"
							onClick={() => setEditingSupport(null)}
							className="ml-2 bg-zinc-200 text-zinc-700 px-4 py-2 rounded-md hover:bg-zinc-300 transition-colors"
						>
							Cancelar
						</button>
					)}
				</div>
			</form>

			<div className="border-t pt-4">
				<h3 className="text-lg font-medium text-zinc-800 mb-4">
					Soportes Existentes
				</h3>
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
				>
					{supports.map((support) => (
						<motion.div
							key={support.id}
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							className="bg-white border rounded-lg p-3 flex flex-col"
						>
							{support.image && (
								<div className="mb-3 w-full h-32 relative">
									<Image
										src={support.image}
										alt={support.name}
										fill
										className="object-cover rounded-md"
									/>
								</div>
							)}
							<div className="flex-1">
								<p className="text-sm font-medium text-zinc-800">
									{support.name}
								</p>
								<p className="text-xs text-zinc-500">{support.code}</p>
								<div className="text-xs text-zinc-600 mt-2">
									<p>Autonomía: {support.autonomy}</p>
									<p>Km Equivalentes: {support.equivalent_km}</p>
									<p>Precio: {support.list_price}</p>
								</div>
							</div>
							<div className="flex gap-2 mt-3">
								<button
									onClick={() => setEditingSupport(support)}
									className="text-zinc-600 hover:text-zinc-800 transition-colors"
								>
									<Edit className="w-4 h-4" />
								</button>
								<button
									onClick={() => handleDeleteSupport(support.id)}
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
