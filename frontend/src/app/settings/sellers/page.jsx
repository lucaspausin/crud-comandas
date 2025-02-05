"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import Aside from "@/components/Aside";
import { useSession } from "next-auth/react";
import api from "@/lib/axios";

export default function SellersStats() {
	const { data: session } = useSession();
	const [sellers, setSellers] = useState([]);
	const [selectedSeller, setSelectedSeller] = useState(null);
	const [stats, setStats] = useState({
		totalSales: 0,
		currentMonthSales: 0,
		firstHalfMonthSales: 0,
		secondHalfMonthSales: 0,
	});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchSellers = async () => {
			if (!session?.user?.token) return;

			try {
				api.defaults.headers.common["Authorization"] =
					`Bearer ${session.user.token}`;
				const response = await api.get("/api/users");
				// Filter only sellers (role_id === 1)
				const sellersList = response.data.filter((user) => user.role_id === 1);
				setSellers(sellersList);
				if (sellersList.length > 0) {
					setSelectedSeller(sellersList[0]);
				}
			} catch (error) {
				console.error("Error loading sellers:", error);
			}
		};

		fetchSellers();
	}, [session]);

	useEffect(() => {
		const fetchSellerStats = async () => {
			if (!selectedSeller || !session?.user?.token) return;

			setLoading(true);
			try {
				api.defaults.headers.common["Authorization"] =
					`Bearer ${session.user.token}`;

				console.log("Fetching stats for seller:", {
					id: selectedSeller.id,
					name: selectedSeller.nombre_usuario,
					role: selectedSeller.role_id,
				});

				const statsResponse = await api.get(
					`/api/reservations/dashboard-stats?userId=${selectedSeller.id}&role=${selectedSeller.role_id}`
				);

				console.log(
					"Stats response for seller",
					selectedSeller.nombre_usuario,
					":",
					statsResponse.data
				);
				setStats(statsResponse.data);
			} catch (error) {
				console.error("Error loading seller stats:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchSellerStats();
	}, [selectedSeller, session]);

	const handleSellerChange = (e) => {
		const seller = sellers.find((s) => s.id === Number(e.target.value));
		console.log("Selected new seller:", seller);
		setSelectedSeller(seller);
	};

	return (
		<div className="flex-1 bg-zinc-50">
			<Aside />
			<motion.main
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className="flex-1 gap-4 flex flex-col p-6 lg:px-8 xl:px-8 mt-12 overflow-y-auto"
			>
				<div className="space-y-6">
					<div className="rounded-xl h-fit bg-white/50 hover:border-zinc-300 duration-300 transition-all ease-in-out border-zinc-100 border backdrop-blur-sm p-6 shadow-xl">
						<div className="mb-6 text-center">
							<h2 className="text-2xl font-light text-zinc-900">
								Estadísticas de Vendedores
							</h2>
							<p className="text-zinc-600 text-sm mt-1">
								Visualiza las estadísticas individuales de cada vendedor.
							</p>
						</div>

						<div className="mb-8">
							<select
								value={selectedSeller?.id || ""}
								onChange={handleSellerChange}
								className="w-full p-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-200 transition-all duration-300"
							>
								{sellers.map((seller) => (
									<option key={seller.id} value={seller.id}>
										{seller.nombre_usuario}
									</option>
								))}
							</select>
						</div>

						{!loading && (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
								<Card className="rounded-lg border-none shadow-sm hover:shadow-md transition-all duration-300 bg-white p-4">
									<div className="space-y-2">
										<h3 className="text-sm font-normal text-zinc-600">
											1° Quincena
										</h3>
										<div className="text-2xl font-normal text-zinc-900">
											{stats.firstHalfMonthSales}
										</div>
										<p className="text-xs text-zinc-600">
											Ventas del inicio del mes hasta el 15.
										</p>
									</div>
								</Card>

								<Card className="rounded-lg border-none shadow-sm hover:shadow-md transition-all duration-300 bg-white p-4">
									<div className="space-y-2">
										<h3 className="text-sm font-normal text-zinc-600">
											2° Quincena
										</h3>
										<div className="text-2xl font-normal text-zinc-900">
											{stats.secondHalfMonthSales}
										</div>
										<p className="text-xs text-zinc-600">
											Ventas del 16 hasta el final del mes.
										</p>
									</div>
								</Card>

								<Card className="rounded-lg border-none shadow-sm hover:shadow-md transition-all duration-300 bg-white p-4">
									<div className="space-y-2">
										<h3 className="text-sm font-normal text-zinc-600">
											Mes Actual
										</h3>
										<div className="text-2xl font-normal text-zinc-900">
											{stats.currentMonthSales}
										</div>
										<p className="text-xs text-zinc-600">
											Total de ventas del mes.
										</p>
									</div>
								</Card>

								<Card className="rounded-lg border-none shadow-sm hover:shadow-md transition-all duration-300 bg-white p-4">
									<div className="space-y-2">
										<h3 className="text-sm font-normal text-zinc-600">Total</h3>
										<div className="text-2xl font-normal text-zinc-900">
											{stats.totalSales}
										</div>
										<p className="text-xs text-zinc-600">
											Ventas totales históricas.
										</p>
									</div>
								</Card>
							</div>
						)}
					</div>
				</div>
			</motion.main>
		</div>
	);
}
