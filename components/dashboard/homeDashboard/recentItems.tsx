"use client";
import React, { useEffect, useState } from "react";
import { Calendar, Box } from "lucide-react";
import { useRouter } from "next/navigation";

import { Item } from "@/utils/types";

export default function RecentItems({ limit = 6 }: { limit?: number }) {
	const router = useRouter();
	const [items, setItems] = useState<Item[]>([]);

	useEffect(() => {
		if (typeof window === "undefined") return;
		try {
			const raw = localStorage.getItem("inventory");
			const parsed: Item[] = raw ? JSON.parse(raw) : [];
			const sorted = parsed
				.slice()
				.sort((a, b) => {
					const da = a.created_at ? Date.parse(a.created_at) : 0;
					const db = b.created_at ? Date.parse(b.created_at) : 0;
					return db - da;
				})
				.slice(0, limit);
			setItems(sorted);
		} catch {
			setItems([]);
		}
	}, [limit]);

	return (
		<div className="bg-white dark:bg-[#1d1d28]  rounded-lg shadow dark:shadow-gray-700/30 p-6 border border-gray-200 dark:border-gray-800">
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-3">
					<Box className="h-5 w-5 text-gray-600 dark:text-gray-400" />
					<h3 className="text-xl font-medium text-gray-800 dark:text-gray-100">
						Recently Added
					</h3>
				</div>
				<button
					onClick={() => router.replace("/dashboard/?tab=items")}
					className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
				>
					View all
				</button>
			</div>

			{items.length === 0 ? (
				<div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
					No recent items
				</div>
			) : (
				<div className="overflow-auto">
					<table className="min-w-full table-fixed text-sm whitespace-nowrap">
						<thead className="bg-gray-50 dark:bg-[#1d1d28] border-b border-gray-200 dark:border-gray-700">
							<tr>
								<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">
									Item
								</th>
								<th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 hidden sm:table-cell">
									Category
								</th>
								<th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">
									Added
								</th>
								<th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300">
									Qty
								</th>
							</tr>
						</thead>
						<tbody>
							{items.map((it) => (
								<tr
									onClick={() =>
										router.replace(
											`/dashboard/?tab=items&search=${encodeURIComponent(
												it.name
											)}`
										)
									}
									key={it.id}
									className="hover:bg-gray-50 dark:hover:bg-gray-700 last:border-b-0 border-b border-gray-200 dark:border-gray-700 cursor-pointer"
								>
									<td className="px-4 py-3">
										<div className="flex items-center gap-3">
											<div className="h-9 w-9 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-medium">
												{it.name
													?.charAt(0)
													?.toUpperCase() ?? "?"}
											</div>
											<div>
												<div className="font-medium text-gray-800 dark:text-gray-100">
													{it.name}
												</div>
												<div className="text-xs text-gray-500 dark:text-gray-400">
													{it.supplierName ??
														it.location ??
														"—"}
												</div>
											</div>
										</div>
									</td>

									<td className="px-3 py-3 hidden sm:table-cell">
										<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
											{it.categoryName}
										</span>
									</td>

									<td className="px-3 py-3 text-gray-500 dark:text-gray-400">
										<div className="flex items-center gap-2">
											<Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
											<span className="text-xs">
												{it.created_at
													? new Date(
															it.created_at
													  ).toLocaleDateString(
															undefined,
															{
																year: "numeric",
																month: "short",
																day: "numeric",
															}
													  )
													: "—"}
											</span>
										</div>
									</td>

									<td className="px-3 py-3 text-right">
										<div
											className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${
												it.quantity <= 5
													? "bg-red-100 text-red-700"
													: "bg-green-100 text-green-800"
											}`}
										>
											{it.quantity}
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
