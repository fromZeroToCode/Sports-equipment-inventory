"use client";

import React, { useState, useEffect } from "react";
import { HistoryRecord, Item, Category, Supplier } from "@/utils/types";
import {
	getHistory,
	getItems,
	getCategories,
	getSuppliers,
} from "@/utils/manipulateData";

interface HistoryComponentProps {
	isDarkMode: boolean;
}

const HistoryComponent: React.FC<HistoryComponentProps> = ({ isDarkMode }) => {
	const [history, setHistory] = useState<HistoryRecord[]>([]);
	const [filteredHistory, setFilteredHistory] = useState<HistoryRecord[]>([]);
	const [filters, setFilters] = useState({
		action: "",
		entityType: "",
		performedBy: "",
		dateFrom: "",
		dateTo: "",
		search: "",
	});
	const [items, setItems] = useState<Item[]>([]);
	const [categories, setCategories] = useState<Category[]>([]);
	const [suppliers, setSuppliers] = useState<Supplier[]>([]);

	// Pagination
	const PAGE_SIZE = 10;
	const [page, setPage] = useState(1);
	const totalPages = Math.max(
		1,
		Math.ceil(filteredHistory.length / PAGE_SIZE)
	);
	const pagedHistory = filteredHistory.slice(
		(page - 1) * PAGE_SIZE,
		page * PAGE_SIZE
	);

	// Load data
	useEffect(() => {
		const historyData = getHistory();
		// Sort by timestamp (newest first)
		const sortedHistory = historyData.sort(
			(a, b) =>
				new Date(b.timestamp).getTime() -
				new Date(a.timestamp).getTime()
		);
		setHistory(sortedHistory);
		setFilteredHistory(sortedHistory);

		// Load reference data for entity names
		setItems(getItems());
		setCategories(getCategories());
		setSuppliers(getSuppliers());
	}, []);

	// Reset page when filteredHistory changes
	useEffect(() => {
		setPage(1);
	}, [filteredHistory]);

	// Apply filters
	useEffect(() => {
		let filtered = [...history];

		// Filter by action
		if (filters.action) {
			filtered = filtered.filter(
				(record) => record.action === filters.action
			);
		}

		// Filter by entity type
		if (filters.entityType) {
			filtered = filtered.filter(
				(record) => record.entityType === filters.entityType
			);
		}

		// Filter by performed by
		if (filters.performedBy) {
			filtered = filtered.filter((record) =>
				record.performedBy
					.toLowerCase()
					.includes(filters.performedBy.toLowerCase())
			);
		}

		// Filter by date range
		if (filters.dateFrom) {
			const fromDate = new Date(filters.dateFrom);
			filtered = filtered.filter(
				(record) => new Date(record.timestamp) >= fromDate
			);
		}

		if (filters.dateTo) {
			const toDate = new Date(filters.dateTo);
			toDate.setHours(23, 59, 59, 999); // End of day
			filtered = filtered.filter(
				(record) => new Date(record.timestamp) <= toDate
			);
		}

		// Filter by search term (entity name or details)
		if (filters.search) {
			const searchTerm = filters.search.toLowerCase();
			filtered = filtered.filter(
				(record) =>
					record.entityName.toLowerCase().includes(searchTerm) ||
					record.details.toLowerCase().includes(searchTerm)
			);
		}

		setFilteredHistory(filtered);
	}, [history, filters]);

	// Clear filters
	const clearFilters = () => {
		setFilters({
			action: "",
			entityType: "",
			performedBy: "",
			dateFrom: "",
			dateTo: "",
			search: "",
		});
	};

	// Export history as CSV
	const exportHistoryCSV = () => {
		if (!history || history.length === 0) {
			// create an empty file
			const blob = new Blob([""], { type: "text/csv" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `history_export_${new Date().toISOString()}.csv`;
			document.body.appendChild(a);
			a.click();
			a.remove();
			URL.revokeObjectURL(url);
			return;
		}

		// Define CSV headers based on HistoryRecord keys
		const headers = Object.keys(history[0]);
		const csvRows = [];
		csvRows.push(headers.join(","));

		for (const record of history) {
			const row = headers.map((header) => {
				let val = (record as any)[header];
				if (val === null || val === undefined) return "";
				if (typeof val === "string") {
					// Escape double quotes
					return `"${val.replace(/"/g, '""')}"`;
				}
				if (typeof val === "object") {
					return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
				}
				return String(val);
			});
			csvRows.push(row.join(","));
		}

		const csvString = csvRows.join("\n");
		const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `history_export_${new Date().toISOString()}.csv`;
		document.body.appendChild(a);
		a.click();
		a.remove();
		URL.revokeObjectURL(url);
	};

	// Format date for display
	const formatDateTime = (dateString: string) => {
		return new Date(dateString).toLocaleString();
	};

	// Get action color
	const getActionColor = (action: string) => {
		switch (action) {
			case "add":
				return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
			case "update":
				return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
			case "delete":
				return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
			case "borrow":
				return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
			case "return":
				return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
			default:
				return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
		}
	};

	// Get entity type color
	const getEntityTypeColor = (entityType: string) => {
		switch (entityType) {
			case "item":
				return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300";
			case "category":
				return "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300";
			case "supplier":
				return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
			case "borrow":
				return "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300";
			default:
				return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
		}
	};

	// Get unique values for filter dropdowns
	const uniqueActions = [...new Set(history.map((record) => record.action))];
	const uniqueEntityTypes = [
		...new Set(history.map((record) => record.entityType)),
	];
	const uniquePerformers = [
		...new Set(history.map((record) => record.performedBy)),
	];

	return (
		<div>
			<h1 className="text-2xl font-bold text-[#1d1d28]  dark:text-gray-100 mb-6">
				Activity History
			</h1>
			<div>
				<p
					className={`${
						isDarkMode ? "text-gray-300" : "text-gray-800"
					} mb-6`}
				>
					View all system activities and changes. Total records:{" "}
					{filteredHistory.length}
				</p>

				{/* Filters */}
				<div
					className={`rounded-lg border p-4 mb-6 ${
						isDarkMode
							? "border-none bg-[#1d1d29]"
							: "border-gray-300 bg-gray-50"
					}`}
				>
					<h3 className="text-lg font-semibold mb-4 dark:text-white">
						Filters
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
						{/* Action Filter */}
						<div>
							<label
								className={`block text-sm font-medium mb-1 ${
									isDarkMode
										? "text-gray-300"
										: "text-gray-700"
								}`}
							>
								Action
							</label>
							<select
								value={filters.action}
								onChange={(e) =>
									setFilters({
										...filters,
										action: e.target.value,
									})
								}
								className={`w-full px-3 py-2 rounded-md border text-sm ${
									isDarkMode
										? "bg-[#2A2A3B] border-gray-800 text-white"
										: "bg-white border-gray-300 text-gray-900"
								} focus:outline-none focus:ring-2 focus:ring-blue-500`}
							>
								<option value="">All Actions</option>
								{uniqueActions.map((action) => (
									<option key={action} value={action}>
										{action}
									</option>
								))}
							</select>
						</div>

						{/* Entity Type Filter */}
						<div>
							<label
								className={`block text-sm font-medium mb-1 ${
									isDarkMode
										? "text-gray-300"
										: "text-gray-700"
								}`}
							>
								Entity Type
							</label>
							<select
								value={filters.entityType}
								onChange={(e) =>
									setFilters({
										...filters,
										entityType: e.target.value,
									})
								}
								className={`w-full px-3 py-2 rounded-md border text-sm ${
									isDarkMode
										? "bg-[#2A2A3B] border-gray-800 text-white"
										: "bg-white border-gray-300 text-gray-900"
								} focus:outline-none focus:ring-2 focus:ring-blue-500`}
							>
								<option value="">All Types</option>
								{uniqueEntityTypes.map((type) => (
									<option key={type} value={type}>
										{type}
									</option>
								))}
							</select>
						</div>

						{/* Performed By Filter */}
						<div>
							<label
								className={`block text-sm font-medium mb-1 ${
									isDarkMode
										? "text-gray-300"
										: "text-gray-700"
								}`}
							>
								Performed By
							</label>
							<select
								value={filters.performedBy}
								onChange={(e) =>
									setFilters({
										...filters,
										performedBy: e.target.value,
									})
								}
								className={`w-full px-3 py-2 rounded-md border text-sm ${
									isDarkMode
										? "bg-[#2A2A3B] border-gray-800 text-white"
										: "bg-white border-gray-300 text-gray-900"
								} focus:outline-none focus:ring-2 focus:ring-blue-500`}
							>
								<option value="">All Users</option>
								{uniquePerformers.map((performer) => (
									<option key={performer} value={performer}>
										{performer}
									</option>
								))}
							</select>
						</div>

						{/* Date From Filter */}
						<div>
							<label
								className={`block text-sm font-medium mb-1 ${
									isDarkMode
										? "text-gray-300"
										: "text-gray-700"
								}`}
							>
								From Date
							</label>
							<input
								type="date"
								value={filters.dateFrom}
								onChange={(e) =>
									setFilters({
										...filters,
										dateFrom: e.target.value,
									})
								}
								className={`w-full px-3 py-2 rounded-md border text-sm ${
									isDarkMode
										? "bg-[#2A2A3B] border-gray-800 text-white"
										: "bg-white border-gray-300 text-gray-900"
								} focus:outline-none focus:ring-2 focus:ring-blue-500`}
							/>
						</div>

						{/* Date To Filter */}
						<div>
							<label
								className={`block text-sm font-medium mb-1 ${
									isDarkMode
										? "text-gray-300"
										: "text-gray-700"
								}`}
							>
								To Date
							</label>
							<input
								type="date"
								value={filters.dateTo}
								onChange={(e) =>
									setFilters({
										...filters,
										dateTo: e.target.value,
									})
								}
								className={`w-full px-3 py-2 rounded-md border text-sm ${
									isDarkMode
										? "bg-[#2A2A3B] border-gray-800 text-white"
										: "bg-white border-gray-300 text-gray-900"
								} focus:outline-none focus:ring-2 focus:ring-blue-500`}
							/>
						</div>

						{/* Search Filter */}
						<div>
							<label
								className={`block text-sm font-medium mb-1 ${
									isDarkMode
										? "text-gray-300"
										: "text-gray-700"
								}`}
							>
								Search
							</label>
							<input
								type="text"
								placeholder="Entity name or details..."
								value={filters.search}
								onChange={(e) =>
									setFilters({
										...filters,
										search: e.target.value,
									})
								}
								className={`w-full px-3 py-2 rounded-md border text-sm ${
									isDarkMode
										? "bg-[#2A2A3B] border-gray-800 text-white"
										: "bg-white border-gray-300 text-gray-900"
								} focus:outline-none focus:ring-2 focus:ring-blue-500`}
							/>
						</div>
					</div>

					{/* Clear Filters Button */}
					<div className="mt-4">
						<div className="flex flex-wrap gap-2">
							<button
								onClick={clearFilters}
								className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
									isDarkMode
										? "bg-[#2A2A3B]  text-gray-300 hover:bg-[#2A2A3B] "
										: "bg-gray-200 text-gray-700 hover:bg-gray-300"
								}`}
							>
								Clear Filters
							</button>

							<button
								onClick={exportHistoryCSV}
								title="Export full history as CSV"
								className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
									isDarkMode
										? "bg-green-500 text-white hover:bg-green-600"
										: "bg-green-200 text-green-900 hover:bg-green-300"
								}`}
							>
								Export CSV
							</button>
						</div>
					</div>
				</div>
			</div>
			<div
				className={`p-2 rounded-xl ${
					isDarkMode
						? "bg-[#1d1d28] text-white"
						: "bg-white text-gray-900"
				}`}
			>
				<div className="mb-6">
					{/* History Table */}
					<div
						className={`rounded-xl border overflow-hidden ${
							isDarkMode ? "border-none" : "border-none"
						}`}
					>
						{filteredHistory.length === 0 ? (
							<div
								className={`p-8 text-center ${
									isDarkMode ? "bg-[#1d1d29]" : "bg-gray-50"
								}`}
							>
								<p
									className={
										isDarkMode
											? "text-gray-400"
											: "text-gray-800"
									}
								>
									No history records found
								</p>
							</div>
						) : (
							<div className="overflow-x-auto">
								<table className="w-full">
									<thead
										className={
											isDarkMode
												? "bg-[#1d1d29]"
												: "bg-gray-100"
										}
									>
										<tr>
											<th
												className={`text-left py-3 px-4 font-medium ${
													isDarkMode
														? "text-gray-300"
														: "text-gray-700"
												}`}
											>
												Date & Time
											</th>
											<th
												className={`text-left py-3 px-4 font-medium ${
													isDarkMode
														? "text-gray-300"
														: "text-gray-700"
												}`}
											>
												Action
											</th>
											<th
												className={`text-left py-3 px-4 font-medium ${
													isDarkMode
														? "text-gray-300"
														: "text-gray-700"
												}`}
											>
												Type
											</th>
											<th
												className={`text-left py-3 px-4 font-medium ${
													isDarkMode
														? "text-gray-300"
														: "text-gray-700"
												}`}
											>
												Entity
											</th>
											<th
												className={`text-left py-3 px-4 font-medium ${
													isDarkMode
														? "text-gray-300"
														: "text-gray-700"
												}`}
											>
												Details
											</th>
											<th
												className={`text-left py-3 px-4 font-medium ${
													isDarkMode
														? "text-gray-300"
														: "text-gray-700"
												}`}
											>
												Performed By
											</th>
										</tr>
									</thead>
									<tbody
										className={
											isDarkMode
												? "bg-[#1d1d28]"
												: "bg-white"
										}
									>
										{pagedHistory.map((record, index) => (
											<tr
												key={record.id}
												className={`border-t ${
													isDarkMode
														? "border-gray-800"
														: "border-gray-200"
												} ${
													index % 2 === 1
														? isDarkMode
															? "bg-[#1d1d28] "
															: "bg-gray-50"
														: ""
												}`}
											>
												<td className="py-3 px-4">
													<div className="text-sm">
														{formatDateTime(
															record.timestamp
														)}
													</div>
												</td>
												<td className="py-3 px-4">
													<span
														className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(
															record.action
														)}`}
													>
														{record.action}
													</span>
												</td>
												<td className="py-3 px-4">
													<span
														className={`px-2 py-1 rounded-full text-xs font-medium ${getEntityTypeColor(
															record.entityType
														)}`}
													>
														{record.entityType}
													</span>
												</td>
												<td className="py-3 px-4">
													<div className="font-medium">
														{record.entityName}
													</div>
												</td>
												<td className="py-3 px-4">
													<div
														className={`text-sm ${
															isDarkMode
																? "text-gray-300"
																: "text-gray-800"
														}`}
													>
														{record.details}
													</div>
												</td>
												<td className="py-3 px-4">
													<div className="text-sm font-medium">
														{record.performedBy}
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
						{/* Pagination controls */}
						<div className="px-4 py-3 bg-white dark:bg-[#1d1d28] border-t border-gray-200 dark:border-gray-700 flex items-center justify-between max-sm:flex-col gap-3">
							<div className="text-sm text-gray-700 dark:text-gray-300">
								Showing{" "}
								<span className="font-medium">
									{filteredHistory.length === 0
										? 0
										: (page - 1) * PAGE_SIZE + 1}
								</span>{" "}
								to{" "}
								<span className="font-medium">
									{Math.min(
										page * PAGE_SIZE,
										filteredHistory.length
									)}
								</span>{" "}
								of{" "}
								<span className="font-medium">
									{filteredHistory.length}
								</span>{" "}
								results
							</div>
							<div className="flex items-center space-x-2">
								<button
									onClick={() =>
										setPage((p) => Math.max(1, p - 1))
									}
									disabled={page === 1}
									className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-600"
								>
									Previous
								</button>

								<div className="text-sm text-gray-700 dark:text-gray-300">
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
									className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-600"
								>
									Next
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default HistoryComponent;
