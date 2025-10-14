"use client";
import React, { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash, Filter } from "lucide-react";
import { useConfirm } from "@/components/ui/ConfirmProvider";
import { toastError } from "@/hooks/useToast";

import { Item, Category, Supplier } from "@/utils/types";
import {
	getItems,
	getCategories,
	getSuppliers,
	deleteItem,
	getCurrency,
} from "@/utils/manipulateData";
import ItemForm from "./itemComponentForm/itemForm";
import { useSearchParams, useRouter } from "next/navigation";

export default function ItemsComponent() {
	const currency = getCurrency();
	const confirm = useConfirm();
	const router = useRouter();
	const searchParams = useSearchParams();
	const isAddMode = searchParams?.get("mode") === "add";
	const searchedItems = searchParams?.get("search") || "";
	const lowStockFilter = searchParams?.get("filter") === "low-stock";
	const [items, setItems] = useState<Item[]>([]);
	const [filteredItems, setFilteredItems] = useState<Item[]>([]);
	const [categories, setCategories] = useState<Category[]>([]);
	const [suppliers, setSuppliers] = useState<Supplier[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("");
	const [supplierFilter, setSupplierFilter] = useState("");
	const [stockFilter, setStockFilter] = useState("");

	const [showForm, setShowForm] = useState(false);
	const [editingId, setEditingId] = useState<string | undefined>(undefined);

	const [currentRole, setCurrentRole] = useState<string>("guest");
	useEffect(() => {
		if (typeof window === "undefined") return;
		try {
			const raw = localStorage.getItem("currentUser");
			const parsed = raw ? JSON.parse(raw) : null;
			setCurrentRole(parsed?.role ?? "guest");
		} catch {
			setCurrentRole("guest");
		}
	}, []);

	const isManager = currentRole === "admin" || currentRole === "coach";
	const isViewOnly = currentRole === "staff";

	// pagination
	const PAGE_SIZE = 7;
	const [page, setPage] = useState(1);
	const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
	const pagedItems = filteredItems.slice(
		(page - 1) * PAGE_SIZE,
		page * PAGE_SIZE
	);

	const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
	const [isInitialized, setIsInitialized] = useState(false); // Add this state

	const sortByCreated = (arr: Item[]) =>
		arr.slice().sort((a, b) => {
			const ta = Date.parse(a.created_at || "0");
			const tb = Date.parse(b.created_at || "0");
			return sortOrder === "desc" ? tb - ta : ta - tb;
		});

	useEffect(() => {
		const loadedItems = getItems();
		const loadedCategories = getCategories();
		const loadedSuppliers = getSuppliers();

		const sortedItems = sortByCreated(loadedItems);
		const savedFilters = localStorage.getItem("itemsFilters");

		setItems(sortedItems);
		setFilteredItems(sortedItems);
		setCategories(loadedCategories);
		setSuppliers(loadedSuppliers);

		if (isAddMode && isManager) {
			setShowForm(true);
			setEditingId(undefined);
		} else if (isAddMode && !isManager) {
			router.replace("/dashboard/?tab=items");
		}
		if (searchedItems) {
			setSearchTerm(searchedItems);
			setPage(1);
		}
		if (lowStockFilter) {
			setStockFilter("Low Stock");
			setPage(1);
		}

		if (savedFilters && !searchedItems && !lowStockFilter) {
			const parsedFilters = JSON.parse(savedFilters);

			setSearchTerm(parsedFilters.searchTerm || "");
			setStockFilter(parsedFilters.stockFilter || "");
			setCategoryFilter(parsedFilters.categoryFilter || "");
			setSupplierFilter(parsedFilters.supplierFilter || "");
			setSortOrder(parsedFilters.sortOrder || "desc");
		}
		setIsInitialized(true);
		router.replace("/dashboard/?tab=items");
	}, []);

	useEffect(() => {
		if (typeof window === "undefined" || !isInitialized) return;

		try {
			const filtersToSave = {
				searchTerm,
				categoryFilter,
				supplierFilter,
				stockFilter,
				sortOrder,
			};
			localStorage.setItem("itemsFilters", JSON.stringify(filtersToSave));
		} catch (error) {
			console.error("Error saving filters to localStorage:", error);
		}
	}, [
		searchTerm,
		categoryFilter,
		supplierFilter,
		stockFilter,
		sortOrder,
		isInitialized,
	]);

	// re-sort when sortOrder changes
	useEffect(() => {
		setItems((prev) => sortByCreated(prev));
		setFilteredItems((prev) => sortByCreated(prev));
		setPage(1);
	}, [sortOrder]);

	useEffect(() => {
		let result = [...items];
		// Apply search filter
		if (searchTerm) {
			result = result.filter((item) =>
				item.name.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}
		// Apply category filter
		if (categoryFilter) {
			result = result.filter(
				(item) => item.categoryId === categoryFilter
			);
		}
		// Apply supplier filter
		if (supplierFilter) {
			result = result.filter(
				(item) => item.supplierId === supplierFilter
			);
		}
		// Apply stock filter
		if (stockFilter) {
			result = result.filter((item) => item.status === stockFilter);
		}

		// keep order according to sortOrder
		result = result.sort((a, b) => {
			const ta = Date.parse(a.created_at || "0");
			const tb = Date.parse(b.created_at || "0");
			return sortOrder === "desc" ? tb - ta : ta - tb;
		});

		setFilteredItems(result);
		setPage(1);
	}, [
		items,
		searchTerm,
		categoryFilter,
		supplierFilter,
		stockFilter,
		sortOrder,
	]);

	const openAdd = () => {
		if (!isManager) {
			toastError("Unauthorized", "Your role cannot add items.");
			return;
		}
		setEditingId(undefined);
		setShowForm(true);
	};
	const openEdit = (id: string) => {
		if (!isManager) {
			toastError("Unauthorized", "Your role cannot edit items.");
			return;
		}
		setEditingId(id);
		setShowForm(true);
	};
	const closeForm = () => {
		setShowForm(false);
		const updated = getItems();
		setItems(sortByCreated(updated));
	};

	const handleSave = (saved: Item) => {
		if (editingId) {
			setItems((prev) =>
				sortByCreated(prev.map((i) => (i.id === saved.id ? saved : i)))
			);
			setFilteredItems((prev) =>
				sortByCreated(prev.map((i) => (i.id === saved.id ? saved : i)))
			);
		} else {
			setItems((prev) => sortByCreated([saved, ...prev]));
			setFilteredItems((prev) => sortByCreated([saved, ...prev]));
		}
		setPage(1);
		setShowForm(false);
		setEditingId(undefined);
		router.replace("/dashboard/?tab=items");
	};

	const getCategoryName = (categoryId: string): string => {
		const category = categories.find((c) => c.id === categoryId);
		return category ? category.name : "Other";
	};

	const getSupplierName = (supplierId: string): string => {
		const supplier = suppliers.find((s) => s.id === supplierId);
		return supplier ? supplier.name : "Other";
	};

	const getStatusBadgeClass = (status: string): string => {
		switch (status) {
			case "In Stock":
				return "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100";
			case "Low Stock":
				return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100";
			case "Out of Stock":
				return "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100";
			default:
				return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
		}
	};

	const handleDelete = async (id: string) => {
		if (!isManager) {
			toastError("Unauthorized", "Your role cannot delete items.");
			return;
		}
		const ok = await confirm({
			title: "Delete Item",
			description:
				"Are you sure you want to delete this item? This cannot be undone.",
			confirmText: "Delete",
			cancelText: "Cancel",
		});
		if (!ok) return;
		deleteItem(id);
		const updated = getItems();
		setItems(sortByCreated(updated));
	};

	return (
		<div className="space-y-6 ">
			<div className="flex justify-between items-center max-[436px]:flex-col max-[436px]:items-start">
				<h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
					Inventory Items
				</h1>

				<div className="flex items-center gap-3 max-[436px]:mt-4">
					<button
						onClick={() => {
							if (isManager) openAdd();
							else
								toastError(
									"Unauthorized",
									"Your role cannot add items."
								);
						}}
						disabled={!isManager}
						className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
							isManager
								? "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
								: "bg-gray-300 cursor-not-allowed"
						} transition-all duration-150`}
					>
						<Plus className="h-4 w-4 mr-1" />
						Add New Item
					</button>
				</div>
			</div>

			{showForm && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 !m-0">
					<div className="w-full max-w-3xl shadow-lg overflow-auto">
						<ItemForm
							itemId={editingId}
							onClose={closeForm}
							onSave={handleSave}
						/>
					</div>
				</div>
			)}

			{/* Filters */}
			<div className="bg-white dark:bg-[#1d1d28] p-4 rounded-lg shadow dark:shadow-gray-700/30">
				<div className="grid grid-cols-5 max-[1280px]:grid-cols-2 max-sm:grid-cols-1 gap-4">
					{/* Search */}
					<div className="relative">
						<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
						</div>
						<input
							type="text"
							className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-800 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-[#2A2A3B] text-gray-900 dark:text-gray-100"
							placeholder="Search items..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>
					{/* Category Filter */}
					<div className="bg-gray-100 dark:bg-[#2A2A3B] rounded-md">
						<select
							className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-800 focus:outline-none  sm:text-sm rounded-md bg-gray-100 dark:bg-[#2A2A3B] text-gray-900 dark:text-gray-100"
							value={categoryFilter}
							onChange={(e) => setCategoryFilter(e.target.value)}
						>
							<option value="">All Categories</option>
							{categories.map((category) => (
								<option key={category.id} value={category.id}>
									{category.name}
								</option>
							))}
						</select>
					</div>
					{/* Supplier Filter */}
					<div className="bg-gray-100 dark:bg-[#2A2A3B] rounded-md">
						<select
							className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-800 focus:outline-none  sm:text-sm rounded-md bg-gray-100 dark:bg-[#2A2A3B] text-gray-900 dark:text-gray-100"
							value={supplierFilter}
							onChange={(e) => setSupplierFilter(e.target.value)}
						>
							<option value="">All Suppliers</option>
							{suppliers.map((supplier) => (
								<option key={supplier.id} value={supplier.id}>
									{supplier.name}
								</option>
							))}
						</select>
					</div>
					{/* Stock Status Filter */}
					<div className="bg-gray-100 dark:bg-[#2A2A3B] rounded-md">
						<select
							className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-800 focus:outline-none  sm:text-sm rounded-md bg-gray-100 dark:bg-[#2A2A3B] text-gray-900 dark:text-gray-100"
							value={stockFilter}
							onChange={(e) => setStockFilter(e.target.value)}
						>
							<option value="">All Stock Status</option>
							<option value="In Stock">In Stock</option>
							<option value="Low Stock">Low Stock</option>
							<option value="Out of Stock">Out of Stock</option>
						</select>
					</div>
					{/* Clear Filters */}
					<div className="flex items-end gap-4">
						{/* Sort toggle button */}
						<button
							type="button"
							onClick={() =>
								setSortOrder((s) =>
									s === "desc" ? "asc" : "desc"
								)
							}
							className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-800 bg-white dark:bg-[#2A2A3B] text-sm rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600"
							title="Toggle sort order"
						>
							<Filter
								className={`h-5 w-5 ${
									sortOrder === "desc"
										? "text-gray-500 dark:text-gray-400"
										: "text-blue-500 dark:text-blue-400"
								}`}
							/>
						</button>

						<button
							onClick={() => {
								setSearchTerm("");
								setCategoryFilter("");
								setSupplierFilter("");
								setStockFilter("");
								setSortOrder("desc");

								if (typeof window !== "undefined") {
									try {
										localStorage.removeItem("itemsFilters");
									} catch (error) {
										console.error(
											"Error clearing saved filters:",
											error
										);
									}
								}
							}}
							className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-800 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-[#2A2A3B] hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-150"
						>
							Clear Filters
						</button>
					</div>
				</div>
			</div>

			{/* Items Table */}
			<div className="bg-white dark:bg-[#1d1d28]  shadow dark:shadow-gray-700/30 rounded-lg ">
				<div className="overflow-x-auto">
					<table className="min-w-full table-fixed text-sm whitespace-nowrap">
						<thead className="bg-white dark:bg-[#1d1d28] border-b border-gray-200 dark:border-gray-700">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
									Item Name
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
									Category
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
									Quantity
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
									Location
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
									Supplier
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
									Status
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="bg-white dark:bg-[#1d1d28]  divide-y divide-gray-200 dark:divide-gray-700">
							{pagedItems.length > 0 ? (
								pagedItems.map((item) => (
									<tr key={item.id}>
										<td className="px-6 py-4 ">
											<div className="text-sm font-medium text-gray-900 dark:text-gray-100">
												{item.name}
											</div>
											<div className="text-sm text-gray-500 dark:text-gray-400">
												{currency +
													item.price.toLocaleString(
														"en-US",
														{
															minimumFractionDigits: 2,
															maximumFractionDigits: 2,
														}
													)}
											</div>
										</td>
										<td className="px-6 py-4  text-sm text-gray-500 dark:text-gray-400">
											{getCategoryName(item.categoryId)}
										</td>
										<td className="px-6 py-4  text-sm text-gray-500 dark:text-gray-400">
											{item.quantity}
										</td>
										<td className="px-6 py-4  text-sm text-gray-500 dark:text-gray-400">
											{item.location}
										</td>
										<td className="px-6 py-4  text-sm text-gray-500 dark:text-gray-400">
											{getSupplierName(item.supplierId)}
										</td>
										<td className="px-6 py-4 ">
											<span
												className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
													item.status
												)}`}
											>
												{item.status}
											</span>
										</td>
										<td className="px-6 py-4  text-sm font-medium">
											<div className="flex space-x-2">
												<button
													onClick={() =>
														openEdit(item.id)
													}
													disabled={!isManager}
													className={`${
														isManager
															? "text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
															: "text-gray-400 cursor-not-allowed"
													}`}
												>
													<Edit className="h-5 w-5" />
												</button>
												<button
													onClick={() =>
														isManager
															? handleDelete(
																	item.id
															  )
															: toastError(
																	"Unauthorized",
																	"Your role cannot delete items."
															  )
													}
													disabled={!isManager}
													className={`${
														isManager
															? "text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
															: "text-gray-400 cursor-not-allowed"
													}`}
												>
													<Trash className="h-5 w-5" />
												</button>
											</div>
										</td>
									</tr>
								))
							) : (
								<tr>
									<td
										colSpan={7}
										className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
									>
										No items found
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
				{/* Pagination controls */}
				<div className="px-4 py-3 bg-white dark:bg-[#1d1d28]  border-t border-gray-200 dark:border-gray-700 flex items-center justify-between max-sm:flex-col gap-3">
					<div className="text-sm text-gray-700 dark:text-gray-300">
						Showing{" "}
						<span className="font-medium">
							{filteredItems.length === 0
								? 0
								: (page - 1) * PAGE_SIZE + 1}
						</span>{" "}
						to{" "}
						<span className="font-medium">
							{Math.min(page * PAGE_SIZE, filteredItems.length)}
						</span>{" "}
						of{" "}
						<span className="font-medium">
							{filteredItems.length}
						</span>{" "}
						results
					</div>
					<div className="flex items-center space-x-2">
						<button
							onClick={() => setPage((p) => Math.max(1, p - 1))}
							disabled={page === 1}
							className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-600"
						>
							Previous
						</button>

						<div className="text-sm text-gray-700 dark:text-gray-300">
							Page <span className="font-medium">{page}</span> of{" "}
							<span className="font-medium">{totalPages}</span>
						</div>

						<button
							onClick={() =>
								setPage((p) => Math.min(totalPages, p + 1))
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
	);
}
