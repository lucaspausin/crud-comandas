"use client";
import React from "react";
// import Link from "next/link";
import { ChevronLeft } from "lucide-react";
// import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function HomeIcon() {
	const router = useRouter();

	return (
		<>
			<div
				className="flex items-center justify-between mb-2 bg-zinc-50 shadow-md rounded-lg w-full py-1 hover:bg-zinc-100 transition-all duration-300 border border-transparent hover:border-zinc-300 hover:text-zinc-300 group cursor-pointer"
				onClick={() => router.back()}
			>
				<div className="flex items-center justify-center gap-2 w-full">
					<nav className="flex items-center">
						<Button
							variant={"solid"}
							className="flex items-center group py-2 text-zinc-700 hover:bg-zinc-100 rounded-full"
						>
							<ChevronLeft
								strokeWidth={1.25}
								className={`w-5 h-5 text-black transition-transform duration-500 group-hover:scale-105`}
							/>
						</Button>
					</nav>
				</div>
			</div>
		</>
	);
}

// export default HomeIcon;
