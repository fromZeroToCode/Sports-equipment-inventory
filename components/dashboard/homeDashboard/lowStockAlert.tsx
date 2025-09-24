"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

type Item = {
	id: string;
	itemName: string;
	quantity: number;
	location?: string;
	supplier?: string;
	updated_at?: string;
};

type Settings = {
	lowStockThreshold?: number;
};

export default function LowStockAlert({ limit = 10 }: { limit?: number }) {
	const [items, setItems] = useState<Item[]>([]);
	const [threshold, setThreshold] = useState<number>(5);

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

			const low = inv
				.filter(
					(i) => typeof i.quantity === "number" && i.quantity <= thr
				)
				.sort((a, b) => a.quantity - b.quantity)
				.slice(0, limit);
			setItems(low);
		} catch {
			setItems([]);
		}
	}, [limit]);

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
				<Link
					href="/items"
					className="text-sm text-blue-600 hover:underline"
				>
					View all
				</Link>
			</div>

			{items.length === 0 ? (
				<div className="py-8 text-center text-sm text-gray-500">
					No low stock items
				</div>
			) : (
				<div className="divide-y divide-gray-200">
					{items.map((it) => (
						<div
							key={it.id}
							className="flex items-center justify-between px-4 py-3"
						>
							<div className="min-w-0">
								<div className="text-sm font-medium text-gray-800 hover:underline cursor-pointer">
									{it.itemName}
								</div>
								<div className="text-xs text-gray-500">
									{it.supplier ? `${it.supplier} • ` : ""}
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
										Math.max(1, Math.floor(threshold / 2))
											? "bg-red-100 text-red-700"
											: "bg-yellow-100 text-yellow-800"
									}`}
								>
									{it.quantity} left
								</div>
								<div className="w-24 h-2 rounded-full bg-gray-100 mt-2 overflow-hidden">
									<div
										style={{
											width: `${Math.min(
												100,
												(it.quantity /
													Math.max(1, threshold)) *
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
			)}
		</div>
	);
}
