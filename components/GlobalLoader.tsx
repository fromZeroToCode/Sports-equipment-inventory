"use client";
import { useLoading } from "@/composables/LoadingManager";
import { HashLoader } from "react-spinners";
import { motion, AnimatePresence } from "framer-motion";

export const GlobalLoading = () => {
	const { isLoading } = useLoading();

	return (
		<AnimatePresence>
			{isLoading && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-[9999] flex items-center justify-center"
				>
					<motion.div
						initial={{ scale: 0.8, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						exit={{ scale: 0.8, opacity: 0 }}
						className=" rounded-lg p-6 "
					>
						<div className="flex flex-col items-center gap-4">
							<HashLoader
								color={
									typeof window !== "undefined" && document.documentElement.classList.contains("dark")
										? "#fb7c37"
										: "#fb923c"
								}
								size={40}
							/>
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};
