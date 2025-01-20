"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import Aside from "@/components/Aside";
import HomeIcon from "@/components/HomeIcon";
import { Edit, ChevronDown, ChevronUp } from "lucide-react";
import BrandsEditor from "@/components/settings/BrandsEditor";
import SupportsEditor from "@/components/settings/SupportsEditor";
import VehiclesEditor from "@/components/settings/VehiclesEditor";

export default function Settings() {
	const [expandedSection, setExpandedSection] = useState(null);

	const toggleSection = (section) => {
		setExpandedSection(expandedSection === section ? null : section);
	};

	return (
		<div className="flex-1 bg-zinc-50">
			<Aside />
			<motion.main
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className="flex-1 p-6 lg:px-8 xl:px-8 overflow-y-auto"
			>
				<HomeIcon />

				<motion.div
					initial={{ y: 20 }}
					animate={{ y: 0 }}
					transition={{ duration: 0.4 }}
				>
					<Card className="border-none bg-white shadow-lg">
						<CardHeader>
							<div className="flex justify-between items-center relative">
								<CardTitle className="text-xl font-light text-zinc-800">
									Editar Catálogo
								</CardTitle>
							</div>
						</CardHeader>
						<CardContent className="pt-6 space-y-4">
							{/* Brands Editor Card */}
							<div className="border rounded-lg">
								<div
									className="flex justify-between items-center p-4 cursor-pointer hover:bg-zinc-50 transition-colors"
									onClick={() => toggleSection("brands")}
								>
									<div className="flex items-center gap-4">
										<Edit className="w-5 h-5 text-zinc-600" />
										<span className="text-zinc-800">Editar Marcas</span>
									</div>
									{expandedSection === "brands" ? (
										<ChevronUp />
									) : (
										<ChevronDown />
									)}
								</div>
								{expandedSection === "brands" && (
									<motion.div
										initial={{ opacity: 0, height: 0 }}
										animate={{ opacity: 1, height: "auto" }}
										transition={{ duration: 0.3 }}
									>
										<BrandsEditor />
									</motion.div>
								)}
							</div>

							{/* Supports Editor Card */}
							<div className="border rounded-lg">
								<div
									className="flex justify-between items-center p-4 cursor-pointer hover:bg-zinc-50 transition-colors"
									onClick={() => toggleSection("supports")}
								>
									<div className="flex items-center gap-4">
										<Edit className="w-5 h-5 text-zinc-600" />
										<span className="text-zinc-800">Editar Soportes</span>
									</div>
									{expandedSection === "supports" ? (
										<ChevronUp />
									) : (
										<ChevronDown />
									)}
								</div>
								{expandedSection === "supports" && (
									<motion.div
										initial={{ opacity: 0, height: 0 }}
										animate={{ opacity: 1, height: "auto" }}
										transition={{ duration: 0.3 }}
									>
										<SupportsEditor />
									</motion.div>
								)}
							</div>

							{/* Vehicles Editor Card */}
							<div className="border rounded-lg">
								<div
									className="flex justify-between items-center p-4 cursor-pointer hover:bg-zinc-50 transition-colors"
									onClick={() => toggleSection("vehicles")}
								>
									<div className="flex items-center gap-4">
										<Edit className="w-5 h-5 text-zinc-600" />
										<span className="text-zinc-800">Editar Vehículos</span>
									</div>
									{expandedSection === "vehicles" ? (
										<ChevronUp />
									) : (
										<ChevronDown />
									)}
								</div>
								{expandedSection === "vehicles" && (
									<motion.div
										initial={{ opacity: 0, height: 0 }}
										animate={{ opacity: 1, height: "auto" }}
										transition={{ duration: 0.3 }}
									>
										<VehiclesEditor />
									</motion.div>
								)}
							</div>
						</CardContent>
					</Card>
				</motion.div>
			</motion.main>
		</div>
	);
}
