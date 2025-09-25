"use client";
import React, { useState, useEffect } from "react";
import { Plus, List, Tag, Package, Truck } from "lucide-react";
import RecentItems from "@/components/dashboard/homeDashboard/recentItems";
import LowStockAlert from "@/components/dashboard/homeDashboard/lowStockAlert";

export default function HomeComponent() {
	const [totalCategories, setTotalCategories] = useState(0);
	const [totalSuppliers, setTotalSuppliers] = useState(0);
	const [totalItems, setTotalItems] = useState(0);

	useEffect(() => {
		if (
			typeof window === "undefined" ||
			typeof localStorage === "undefined"
		) {
			return;
		}
		const categories = localStorage.getItem("categories");
		const suppliers = localStorage.getItem("suppliers");
		const inventory = localStorage.getItem("inventory");

		setTotalCategories(categories ? JSON.parse(categories).length : 0);
		setTotalSuppliers(suppliers ? JSON.parse(suppliers).length : 0);
		setTotalItems(inventory ? JSON.parse(inventory).length : 0);
	}, []);

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
				<div className="flex space-x-2">
					<button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-all duration-150">
						<Plus className="h-4 w-4 mr-1" />
						Add Item
					</button>
					<button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 transition-all duration-150">
						<List className="h-4 w-4 mr-1" />
						View Reports
					</button>
				</div>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				<div className="bg-white rounded-lg shadow p-6 flex flex-row items-center">
					<div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 text-blue-500">
						<Package className="h-6 w-6" />
					</div>
					<div className="ml-4">
						<h3 className="text-lg leading-6 font-medium text-gray-900">
							Total Items
						</h3>
						<p className="mt-1 text-3xl font-semibold text-gray-900">
							{totalItems}
						</p>
					</div>
				</div>
				<div className="bg-white rounded-lg shadow p-6 flex flex-row items-center">
					<div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-md bg-yellow-100 text-yellow-500">
						<Tag className="h-6 w-6" />
					</div>
					<div className="ml-4">
						<h3 className="text-lg leading-6 font-medium text-gray-900">
							Categories
						</h3>
						<p className="mt-1 text-3xl font-semibold text-gray-900">
							{totalCategories}
						</p>
					</div>
				</div>
				<div className="bg-white rounded-lg shadow p-6 flex flex-row items-center">
					<div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-md bg-purple-100 text-purple-500">
						<Truck className="h-6 w-6" />
					</div>
					<div className="ml-4">
						<h3 className="text-lg leading-6 font-medium text-gray-900">
							Suppliers
						</h3>
						<p className="mt-1 text-3xl font-semibold text-gray-900">
							{totalSuppliers}
						</p>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<RecentItems limit={6} />
				<LowStockAlert limit={5} />
			</div>
		</div>
	);
}
