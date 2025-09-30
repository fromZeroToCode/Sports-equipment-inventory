"use client";
import React, { useState, useEffect } from "react";
import { Plus, List, Tag, Package, Truck } from "lucide-react";
import RecentItems from "@/components/dashboard/homeDashboard/recentItems";
import LowStockAlert from "@/components/dashboard/homeDashboard/lowStockAlert";
import { useRouter } from "next/navigation";

export default function HomeComponent() {
	const router = useRouter();
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

	const addNewItem = () => {
		router.replace("/dashboard/?tab=items&mode=add");
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center max-[436px]:flex-col max-[436px]:items-start">
				<h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
					Dashboard
				</h1>
				<div className="flex space-x-2 max-[436px]:mt-4">
					<button
						onClick={addNewItem}
						className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-150"
					>
						<Plus className="h-4 w-4 mr-1" />
						Add Item
					</button>
					<button
						onClick={() =>
							router.replace("/dashboard/?tab=reports")
						}
						className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-150"
					>
						<List className="h-4 w-4 mr-1" />
						View Reports
					</button>
				</div>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700/30 p-6 flex flex-row items-center">
					<div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400">
						<Package className="h-6 w-6" />
					</div>
					<div className="ml-4">
						<h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
							Total Items
						</h3>
						<p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-gray-100">
							{totalItems}
						</p>
					</div>
				</div>
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700/30 p-6 flex flex-row items-center">
					<div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-md bg-yellow-100 dark:bg-yellow-900/30 text-yellow-500 dark:text-yellow-400">
						<Tag className="h-6 w-6" />
					</div>
					<div className="ml-4">
						<h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
							Categories
						</h3>
						<p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-gray-100">
							{totalCategories}
						</p>
					</div>
				</div>
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700/30 p-6 flex flex-row items-center">
					<div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-500 dark:text-purple-400">
						<Truck className="h-6 w-6" />
					</div>
					<div className="ml-4">
						<h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
							Suppliers
						</h3>
						<p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-gray-100">
							{totalSuppliers}
						</p>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<RecentItems limit={7} />
				<LowStockAlert limit={5} />
			</div>
		</div>
	);
}
