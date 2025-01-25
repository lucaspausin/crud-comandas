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
			<div className="flex items-center justify-between bg-zinc-50 rounded-lg w-full transition-all duration-300 border border-transparent hover:text-zinc-300 group cursor-pointer mb-2">
				<div className="flex items-center justify-center gap-2 w-full">
					<nav className="flex items-center">
						<Button
							variant={"solid"}
							onClick={() => router.back()}
							className="flex items-center font-normal  group gap-1 py-2.5 px-4 text-zinc-700 hover:bg-zinc-200/40 rounded-full transition-all duration-300"
						>
							<ChevronLeft
								strokeWidth={1.25}
								className={`w-5 h-5 text-black transition-transform duration-500 group-hover:scale-105`}
							/>
							Atrás
						</Button>
					</nav>
				</div>
			</div>
		</>
	);
}

// export default HomeIcon;
