"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "@/lib/axios";
import { Plus, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";

export default function VehiclesEditor() {
	const [vehicles, setVehicles] = useState([]);
	const [brands, setBrands] = useState([]);
	const [supports, setSupports] = useState([]);
	const [newVehicle, setNewVehicle] = useState({
		name: "",
		brand_id: "",
		observations: "",
		sales_suggestions: "",
		cradle_type: "",
		support_ids: [],
	});
	const [editingVehicle, setEditingVehicle] = useState(null);

	useEffect(() => {
		const fetchInitialData = async () => {
			try {
				const [vehiclesResponse, brandsResponse, supportsResponse] =
					await Promise.all([
						api.get("/api/vehicles"),
						api.get("/api/brands"),
						api.get("/api/support"),
					]);
				setVehicles(vehiclesResponse.data);
				setBrands(brandsResponse.data);
				setSupports(supportsResponse.data);
			} catch (fetchError) {
				console.error("Error al cargar datos:", fetchError);
				toast.error("Error al cargar datos");
			}
		};
		fetchInitialData();
	}, []);

	const handleAddVehicle = async (e) => {
		e.preventDefault();
		try {
			// Transformar los códigos de soporte en IDs de soporte
			const supportIds =
				newVehicle.support_ids.length > 0
					? supports
							.filter((support) =>
								newVehicle.support_ids.includes(support.code)
							)
							.map((support) => support.id)
					: [];

			const response = await api.post("/api/vehicles", {
				...newVehicle,
				support_ids: supportIds,
			});
			setVehicles([...vehicles, response.data]);
			setNewVehicle({
				name: "",
				brand_id: "",
				observations: "",
				sales_suggestions: "",
				cradle_type: "",
				support_ids: [],
			});
			toast.success("Vehículo agregado exitosamente");
		} catch (error) {
			console.error("Error al agregar vehículo:", error);
			toast.error("Error al agregar vehículo");
		}
	};

	const handleUpdateVehicle = async (e) => {
		e.preventDefault();
		try {
			// Transformar los códigos de soporte en IDs de soporte
			const supportIds =
				editingVehicle.support_ids.length > 0
					? supports
							.filter((support) =>
								editingVehicle.support_ids.includes(support.code)
							)
							.map((support) => support.id)
					: [];

			const response = await api.patch(`/api/vehicles/${editingVehicle.id}`, {
				...editingVehicle,
				support_ids: supportIds,
			});
			setVehicles(
				vehicles.map((vehicle) =>
					vehicle.id === editingVehicle.id ? response.data : vehicle
				)
			);
			setEditingVehicle(null);
			toast.success("Vehículo actualizado exitosamente");
		} catch (error) {
			console.error("Error al actualizar vehículo:", error);
			toast.error("Error al actualizar vehículo");
		}
	};

	const handleDeleteVehicle = async (vehicleId) => {
		try {
			await api.delete(`/api/vehicles/${vehicleId}`);
			setVehicles(vehicles.filter((vehicle) => vehicle.id !== vehicleId));
			toast.success("Vehículo eliminado exitosamente");
		} catch (error) {
			console.error("Error al eliminar vehículo:", error);
			toast.error("Error al eliminar vehículo");
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

	return (
		<div className="p-4 space-y-4">
			<form
				onSubmit={editingVehicle ? handleUpdateVehicle : handleAddVehicle}
				className="grid grid-cols-1 md:grid-cols-3 gap-3"
			>
				<div>
					<label className="block text-sm text-zinc-600 mb-1">
						Nombre del Modelo
					</label>
					<input
						type="text"
						value={editingVehicle ? editingVehicle.name : newVehicle.name}
						onChange={(e) =>
							editingVehicle
								? setEditingVehicle({ ...editingVehicle, name: e.target.value })
								: setNewVehicle({ ...newVehicle, name: e.target.value })
						}
						className="w-full border border-zinc-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-200"
						placeholder="Nombre del modelo"
						required
					/>
				</div>
				<div>
					<label className="block text-sm text-zinc-600 mb-1">Marca</label>
					<select
						value={
							editingVehicle ? editingVehicle.brand_id : newVehicle.brand_id
						}
						onChange={(e) =>
							editingVehicle
								? setEditingVehicle({
										...editingVehicle,
										brand_id: parseInt(e.target.value, 10),
									})
								: setNewVehicle({
										...newVehicle,
										brand_id: parseInt(e.target.value, 10),
									})
						}
						className="w-full border border-zinc-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-200"
						required
					>
						<option value="">Seleccionar Marca</option>
						{brands.map((brand) => (
							<option key={brand.id} value={brand.id}>
								{brand.name}
							</option>
						))}
					</select>
				</div>
				<div>
					<label className="block text-sm text-zinc-600 mb-1">
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
								: setNewVehicle({ ...newVehicle, observations: e.target.value })
						}
						className="w-full border border-zinc-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-200"
						placeholder="Observaciones"
					/>
				</div>
				<div>
					<label className="block text-sm text-zinc-600 mb-1">
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
						className="w-full border border-zinc-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-200"
						placeholder="Sugerencias de venta"
					/>
				</div>
				<div>
					<label className="block text-sm text-zinc-600 mb-1">
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
								: setNewVehicle({ ...newVehicle, cradle_type: e.target.value })
						}
						className="w-full border border-zinc-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-200"
						placeholder="Tipo de cuna"
					/>
				</div>
				<div className="col-span-full">
					<label className="block text-sm text-zinc-600 mb-1">
						Soportes Compatibles
					</label>
					<div className="grid grid-cols-3 md:grid-cols-6 gap-2">
						{supports.map((support) => (
							<div
								key={support.id}
								className={`p-2 rounded-md cursor-pointer transition-all duration-300 ${
									(
										editingVehicle
											? editingVehicle.support_ids.includes(support.code)
											: newVehicle.support_ids.includes(support.code)
									)
										? "bg-emerald-100 border-emerald-300 border"
										: "bg-zinc-100 border border-transparent hover:bg-zinc-200"
								}`}
								onClick={() => handleSupportToggle(support.code)}
							>
								<p className="text-xs text-center">{support.name}</p>
							</div>
						))}
					</div>
				</div>
				<div className="flex items-end col-span-full">
					<button
						type="submit"
						className="w-full bg-emerald-500 text-white px-4 py-2 rounded-md hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
					>
						<Plus className="w-4 h-4" />
						{editingVehicle ? "Actualizar" : "Agregar"}
					</button>
					{editingVehicle && (
						<button
							type="button"
							onClick={() => setEditingVehicle(null)}
							className="ml-2 bg-zinc-200 text-zinc-700 px-4 py-2 rounded-md hover:bg-zinc-300 transition-colors"
						>
							Cancelar
						</button>
					)}
				</div>
			</form>

			<div className="border-t pt-4">
				<h3 className="text-lg font-medium text-zinc-800 mb-4">
					Vehículos Existentes
				</h3>
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
				>
					{vehicles.map((vehicle) => (
						<motion.div
							key={vehicle.id}
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							className="bg-white border rounded-lg p-3 flex flex-col"
						>
							<div className="flex-1">
								<p className="text-sm font-medium text-zinc-800">
									{vehicle.name}
								</p>
								<p className="text-xs text-zinc-500">{vehicle.brands.name}</p>
								<div className="text-xs text-zinc-600 mt-2">
									{vehicle.observations && (
										<p>Observaciones: {vehicle.observations}</p>
									)}
									{vehicle.sales_suggestions && (
										<p>Sugerencias: {vehicle.sales_suggestions}</p>
									)}
									{vehicle.cradle_type && (
										<p>Tipo de Cuna: {vehicle.cradle_type}</p>
									)}
								</div>
								<div className="mt-2">
									<p className="text-xs font-medium text-zinc-700">
										Soportes Compatibles:
									</p>
									<div className="flex flex-wrap gap-1 mt-1">
										{vehicle.support.map((support) => (
											<span
												key={support.id}
												className="text-[10px] bg-zinc-100 px-2 py-1 rounded-full"
											>
												{support.name}
											</span>
										))}
									</div>
								</div>
							</div>
							<div className="flex gap-2 mt-3">
								<button
									onClick={() =>
										setEditingVehicle({
											...vehicle,
											brand_id: vehicle.brands.id,
											support_ids: vehicle.support.map((s) => s.code),
										})
									}
									className="text-zinc-600 hover:text-zinc-800 transition-colors"
								>
									<Edit className="w-4 h-4" />
								</button>
								<button
									onClick={() => handleDeleteVehicle(vehicle.id)}
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
