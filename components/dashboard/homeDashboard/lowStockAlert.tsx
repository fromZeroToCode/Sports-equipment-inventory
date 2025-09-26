"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";

import { Item } from "@/utils/types";

type Settings = {
	lowStockThreshold?: number;
};

export default function LowStockAlert({ limit = 6 }: { limit?: number }) {
	const router = useRouter();
	const pageSize = Math.max(1, Math.floor(limit));
	const [items, setItems] = useState<Item[]>([]);
	const [threshold, setThreshold] = useState<number>(5);
	const [page, setPage] = useState<number>(1);

	useEffect(() => {
		if (typeof window === "undefined") return;
		try {
			const rawInv = localStorage.getItem("inventory");
			const inv = rawInv ? (JSON.parse(rawInv) as Item[]) : [];
			const rawSettings = localStorage.getItem("settings");
			const settings: Settings = rawSettings
				? JSON.parse(rawSettings)
				: {};
			const thr = Number(settings?.lowStockThreshold ?? threshold);
			setThreshold(thr);

			// keep all low-stock items (don't prematurely slice to `limit`)
			const low = inv
				.filter(
					(i) => typeof i.quantity === "number" && i.quantity <= thr
				)
				.sort((a, b) => a.quantity - b.quantity);

			setItems(low);
			setPage(1);
		} catch {
			setItems([]);
			setPage(1);
		}
	}, [limit]);

	const total = items.length;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const startIdx = (page - 1) * pageSize;
	const endIdx = Math.min(page * pageSize, total);
	const pagedItems = items.slice(startIdx, endIdx);

	return (
		<div className="bg-white rounded-lg shadow p-6 border border-gray-200">
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-3">
					<AlertTriangle className="h-5 w-5 text-yellow-500" />
					<div>
						<h3 className="text-xl font-medium text-gray-800">
							Low Stock Alerts
						</h3>
					</div>
				</div>
				<button
					onClick={() => router.replace("/dashboard/?tab=items")}
					className="text-sm text-blue-600 hover:underline"
				>
					View all
				</button>
			</div>

			{items.length === 0 ? (
				<div className="py-8 text-center text-sm text-gray-500">
					No low stock items
				</div>
			) : (
				<>
					<div className="divide-y divide-gray-200">
						{pagedItems.map((it) => (
							<div
								key={it.id}
								className="flex items-center justify-between px-4 py-3"
							>
								<div className="min-w-0">
									<div
										onClick={() =>
											router.replace(
												`/dashboard/?tab=items&search=${encodeURIComponent(
													it.name
												)}`
											)
										}
										className="text-sm font-medium text-gray-800 hover:underline cursor-pointer"
									>
										{it.name}
									</div>
									<div className="text-xs text-gray-500">
										{it.supplierName
											? `${it.supplierName} • `
											: ""}
										{it.location ?? "—"}
									</div>
									<div className="text-xs text-gray-400 mt-1">
										{it.updated_at
											? `Updated ${new Date(
													it.updated_at
											  ).toLocaleString()}`
											: "No recent update"}
									</div>
								</div>

								<div className="flex flex-col items-end ml-4">
									<div
										className={`text-xs font-semibold px-2 py-1 rounded-full ${
											it.quantity <=
											Math.max(
												1,
												Math.floor(threshold / 2)
											)
												? "bg-red-100 text-red-700"
												: "bg-yellow-100 text-yellow-800"
										}`}
									>
										{it.quantity} left
									</div>
									<div className="w-24 h-2 rounded-full bg-gray-100 mt-2 ">
										<div
											style={{
												width: `${Math.min(
													100,
													(it.quantity /
														Math.max(
															1,
															threshold
														)) *
														100
												)}%`,
											}}
											className={`h-full ${
												it.quantity <=
												Math.max(
													1,
													Math.floor(threshold / 2)
												)
													? "bg-red-500"
													: "bg-yellow-400"
											}`}
										/>
									</div>
								</div>
							</div>
						))}
					</div>

					{/* Pagination controls */}
					{totalPages > 1 && (
						<div className="mt-4 flex items-center justify-between text-sm text-gray-700 max-[445px]:flex-col max-[445px]:space-y-2">
							<div>
								Showing{" "}
								<span className="font-medium">
									{startIdx + 1}
								</span>{" "}
								to <span className="font-medium">{endIdx}</span>{" "}
								of <span className="font-medium">{total}</span>
							</div>
							<div className="flex items-center space-x-2">
								<button
									onClick={() =>
										setPage((p) => Math.max(1, p - 1))
									}
									disabled={page === 1}
									className="px-3 py-1 rounded-md border bg-white disabled:opacity-50"
								>
									Previous
								</button>
								<div>
									Page{" "}
									<span className="font-medium">{page}</span>{" "}
									of{" "}
									<span className="font-medium">
										{totalPages}
									</span>
								</div>
								<button
									onClick={() =>
										setPage((p) =>
											Math.min(totalPages, p + 1)
										)
									}
									disabled={page === totalPages}
									className="px-3 py-1 rounded-md border bg-white disabled:opacity-50"
								>
									Next
								</button>
							</div>
						</div>
					)}
				</>
			)}
		</div>
	);
}
