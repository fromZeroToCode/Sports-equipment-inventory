import React, { useEffect, useState } from "react";
import { Item } from "@/utils/types";
import { Download, FileText } from "lucide-react";
import { getItems, getCategoryName, getCurrency } from "@/utils/manipulateData";

import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";

export default function ReportsComponent() {
	const currency = getCurrency();
	const [items, setItems] = useState<Item[]>([]);
	const [totalValue, setTotalValue] = useState(0);
	const [categoryData, setCategoryData] = useState<any[]>([]);
	const [stockStatusData, setStockStatusData] = useState<any[]>([]);

	const generateInventoryCSV = () => {
		const headers = [
			"Name",
			"Category",
			"Quantity",
			"Location",
			"Price",
			"Value",
			"Status",
		];
		const rows = items.map((item) => [
			item.name,
			getCategoryName(item.categoryId),
			item.quantity,
			item.location,
			item.price.toFixed(2),
			(item.price * item.quantity).toFixed(2),
			item.status,
		]);
		const csvContent = [
			headers.join(","),
			...rows.map((row) => row.join(",")),
		].join("\n");
		const blob = new Blob([csvContent], {
			type: "text/csv;charset=utf-8;",
		});
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.setAttribute("href", url);
		link.setAttribute("download", "inventory_report.csv");
		link.style.visibility = "hidden";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	useEffect(() => {
		const loadedItems = getItems();
		setItems(loadedItems);
		// Calculate total inventory value
		const total = loadedItems.reduce(
			(sum, item) => sum + item.price * item.quantity,
			0
		);
		setTotalValue(total);
		// Prepare data for category chart
		const categoryMap = new Map();
		loadedItems.forEach((item) => {
			const categoryName = getCategoryName(item.categoryId);
			const currentValue = categoryMap.get(categoryName) || 0;
			categoryMap.set(
				categoryName,
				currentValue + item.price * item.quantity
			);
		});
		const categoryChartData = Array.from(categoryMap).map(
			([name, value]) => ({
				name,
				value: Number(value.toFixed(2)),
			})
		);
		setCategoryData(categoryChartData);
		// Prepare data for stock status chart
		const stockStatusCounts = {
			"In Stock": loadedItems.filter((item) => item.status === "In Stock")
				.length,
			"Low Stock": loadedItems.filter(
				(item) => item.status === "Low Stock"
			).length,
			"Out of Stock": loadedItems.filter(
				(item) => item.status === "Out of Stock"
			).length,
		};
		const stockStatusChartData = [
			{
				name: "In Stock",
				value: stockStatusCounts["In Stock"],
			},
			{
				name: "Low Stock",
				value: stockStatusCounts["Low Stock"],
			},
			{
				name: "Out of Stock",
				value: stockStatusCounts["Out of Stock"],
			},
		];
		setStockStatusData(stockStatusChartData);
	}, []);
	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold text-gray-800">Reports</h1>
				<button
					onClick={generateInventoryCSV}
					className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
				>
					<Download className="h-4 w-4 mr-1" />
					Export Inventory CSV
				</button>
			</div>
			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex items-center">
						<div className="rounded-full p-3 bg-blue-100 text-blue-600">
							<FileText className="h-6 w-6" />
						</div>
						<div className="ml-5">
							<p className="text-sm font-medium text-gray-500">
								Total Items
							</p>
							<p className="mt-1 text-3xl font-semibold text-gray-900">
								{items.length}
							</p>
						</div>
					</div>
				</div>
				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex items-center">
						<div className="rounded-full p-3 bg-green-100 text-green-600">
							<FileText className="h-6 w-6" />
						</div>
						<div className="ml-5">
							<p className="text-sm font-medium text-gray-500">
								Total Inventory Value
							</p>
							<p className="mt-1 text-3xl font-semibold text-gray-900">
								{currency + totalValue.toFixed(2)}
							</p>
						</div>
					</div>
				</div>
				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex items-center">
						<div className="rounded-full p-3 bg-yellow-100 text-yellow-600">
							<FileText className="h-6 w-6" />
						</div>
						<div className="ml-5">
							<p className="text-sm font-medium text-gray-500">
								Low Stock Items
							</p>
							<p className="mt-1 text-3xl font-semibold text-gray-900">
								{
									items.filter(
										(item) => item.status === "Low Stock"
									).length
								}
							</p>
						</div>
					</div>
				</div>
			</div>
			{/* Charts */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Category Value Chart */}
				<div className="bg-white rounded-lg shadow p-6">
					<h3 className="text-lg font-medium text-gray-900 mb-4">
						Inventory Value by Category
					</h3>
					<div className="h-80">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart
								data={categoryData}
								margin={{
									top: 20,
									right: 30,
									left: 20,
									bottom: 50,
								}}
							>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis
									dataKey="name"
									angle={-45}
									textAnchor="end"
									height={70}
								/>
								<YAxis />
								<Tooltip formatter={(value) => `$${value}`} />
								<Legend />
								<Bar
									dataKey="value"
									name={`Value (${currency})`}
									fill="#3b82f6"
								/>
							</BarChart>
						</ResponsiveContainer>
					</div>
				</div>
				{/* Stock Status Chart */}
				<div className="bg-white rounded-lg shadow p-6">
					<h3 className="text-lg font-medium text-gray-900 mb-4">
						Items by Stock Status
					</h3>
					<div className="h-80">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart
								data={stockStatusData}
								margin={{
									top: 20,
									right: 30,
									left: 20,
									bottom: 5,
								}}
							>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="name" />
								<YAxis />
								<Tooltip />
								<Legend />
								<Bar
									dataKey="value"
									name="Number of Items"
									fill="#10b981"
								/>
							</BarChart>
						</ResponsiveContainer>
					</div>
				</div>
			</div>

			{/* Inventory Value Table */}
			<div className="bg-white shadow rounded-lg overflow-hidden">
				<div className="px-6 py-4 border-b border-gray-200">
					<h3 className="text-lg font-medium text-gray-900">
						Inventory Value Report
					</h3>
				</div>
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gray-50">
							<tr>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									Item Name
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									Category
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									Quantity
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									Unit Price
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									Total Value
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{items.length > 0 ? (
								items.map((item) => (
									<tr key={item.id}>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
											{item.name}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											{getCategoryName(item.categoryId)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											{item.quantity}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											{currency + item.price.toFixed(2)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											{currency}
											{(
												item.price * item.quantity
											).toFixed(2)}
										</td>
									</tr>
								))
							) : (
								<tr>
									<td
										colSpan={5}
										className="px-6 py-4 text-center text-sm text-gray-500"
									>
										No items found
									</td>
								</tr>
							)}
							{items.length > 0 && (
								<tr className="bg-gray-50">
									<td
										colSpan={4}
										className="px-6 py-4 text-right text-sm font-medium text-gray-900"
									>
										Total Inventory Value:
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
										${totalValue.toFixed(2)}
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
