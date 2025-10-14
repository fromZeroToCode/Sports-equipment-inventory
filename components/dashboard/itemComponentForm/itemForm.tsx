import React, { useState, useEffect } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import {
	getItem,
	addItem,
	updateItem,
	getCategories,
	getSuppliers,
	getCurrency,
	addCategory,
	addSupplier,
} from "@/utils/manipulateData";
import { Category, Supplier, Item } from "@/utils/types";
import { toastError } from "@/hooks/useToast";
import { useConfirm } from "@/components/ui/ConfirmProvider";
import SupplierForm from "@/components/dashboard/supplierComponentForm/supplierForm";
import CategoriesForm from "@/components/dashboard/categoriesComponentForm/categoriesForm";

export default function ItemForm({
	itemId,
	onClose,
	onSave,
}: {
	itemId?: string;
	onClose?: () => void;
	onSave?: (item: Item) => void;
}) {
	const confirm = useConfirm();
	const currency = getCurrency();
	const router = useRouter();
	const params = useSearchParams();
	const idFromParams = params?.get("id") ?? "";
	const id = itemId ?? idFromParams ?? "";

	const [name, setName] = useState("");
	const [categoryId, setCategoryId] = useState("");
	const [quantity, setQuantity] = useState(0);
	const [location, setLocation] = useState("");
	const [supplierId, setSupplierId] = useState("");
	const [purchaseDate, setPurchaseDate] = useState("");
	const [price, setPrice] = useState(0);

	const isEditing = Boolean(id);

	const [categories, setCategories] = useState<Category[]>([]);
	const [suppliers, setSuppliers] = useState<Supplier[]>([]);

	// Inline add UI state
	const [showAddCategory, setShowAddCategory] = useState(false);
	const [newCategoryName, setNewCategoryName] = useState("");
	const [showAddSupplier, setShowAddSupplier] = useState(false);
	const [newSupplierName, setNewSupplierName] = useState("");

	useEffect(() => {
		setCategories(getCategories());
		setSuppliers(getSuppliers());

		if (isEditing && id) {
			const item = getItem(id);
			if (item) {
				setName(item.name);
				setCategoryId(item.categoryId);
				setQuantity(item.quantity);
				setLocation(item.location);
				setSupplierId(item.supplierId);
				setPurchaseDate(item.purchaseDate);
				setPrice(item.price);
			}
		}
	}, [id, isEditing]);

	const createCategoryInline = (label: string) => {
		const trimmed = label.trim();
		if (!trimmed) return;
		try {
			const created = addCategory({ name: trimmed, description: "" });
			// refresh list and select new
			const updated = getCategories();
			setCategories(updated);
			if (created?.id) setCategoryId(created.id);
		} catch {
			// fallback: refresh categories anyway
			setCategories(getCategories());
		}
		setNewCategoryName("");
		setShowAddCategory(false);
	};

	const createSupplierInline = (label: string) => {
		const trimmed = label.trim();
		if (!trimmed) return;
		try {
			const created = addSupplier({
				name: trimmed,
				contact: "",
				email: "",
				phone: "",
			});
			const updated = getSuppliers();
			setSuppliers(updated);
			if (created?.id) setSupplierId(created.id);
		} catch {
			setSuppliers(getSuppliers());
		}
		setNewSupplierName("");
		setShowAddSupplier(false);
	};

	// handlers when modal forms finish saving
	const onCategoryModalSaved = () => {
		const updated = getCategories();
		setCategories(updated);
		// auto-select the most recently added category
		if (updated.length > 0) {
			setCategoryId(updated[updated.length - 1].id);
		}
		setShowAddCategory(false);
	};

	const onSupplierModalSaved = () => {
		const updated = getSuppliers();
		setSuppliers(updated);
		// auto-select the most recently added supplier
		if (updated.length > 0) {
			setSupplierId(updated[updated.length - 1].id);
		}
		setShowAddSupplier(false);
	};

	const computeStatus = (qty: number) => {
		try {
			const raw = localStorage.getItem("settings");
			const settings = raw ? JSON.parse(raw) : null;
			const threshold = settings?.lowStockThreshold ?? 5;
			if (qty <= 0) return "Out of Stock" as const;
			if (qty <= threshold) return "Low Stock" as const;
			return "In Stock" as const;
		} catch {
			if (qty <= 0) return "Out of Stock" as const;
			if (qty <= 5) return "Low Stock" as const;
			return "In Stock" as const;
		}
	};

	const finish = () => {
		if (onClose) {
			onClose();
		} else {
			router.push("/items");
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const status = computeStatus(Number(quantity));

		if (price <= 0) {
			toastError(
				"Price Cannot be 0 or Negative",
				"Please make sure to enter a valid price greater than zero."
			);
			return;
		}

		if (quantity < 0) {
			toastError(
				"Quantity Cannot be Negative",
				"Please make sure to enter a valid quantity greater than or equal to zero."
			);
			return;
		}

		if (isEditing && id) {
			const existing = getItem(id);
			if (!existing) {
				toastError("Error", "Item not found for editing.");
				return;
			}
			const updated: Item = {
				...existing,
				name,
				categoryId,
				quantity,
				location,
				supplierId,
				purchaseDate,
				price,
				status,
				updated_at: new Date().toISOString(),
			};
			const ok = await confirm({
				title: "Update Item",
				description:
					"Are you sure you want to update this item? This cannot be undone.",
				confirmText: "Update",
				cancelText: "Cancel",
				variant: "default",
			});

			if (!ok) return;

			updateItem(updated);

			try {
				onSave?.(updated);
			} catch {}
			finish();
			return;
		}

		const newItemPayload = {
			name,
			categoryId,
			categoryName: categories.find((c) => c.id === categoryId)?.name,
			quantity,
			location,
			supplierId,
			supplierName: suppliers.find((s) => s.id === supplierId)?.name,
			purchaseDate,
			price,
			status,
		};
		const created = addItem(newItemPayload as any);

		try {
			onSave?.(created);
		} catch {}
		finish();
	};

	return (
		<div className="space-y-6 bg-white dark:bg-[#1d1d28] rounded-lg p-6 shadow ">
			<div className="flex items-center justify-between">
				<div className="flex items-center">
					{onClose ? (
						<button
							onClick={() => finish()}
							className="mr-4 p-2 text-gray-500 dark:text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
							type="button"
						>
							<ArrowLeft className="h-5 w-5" />
						</button>
					) : (
						<button
							onClick={() => router.push("/items")}
							className="mr-4 p-2 text-gray-500 dark:text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
							type="button"
						>
							<ArrowLeft className="h-5 w-5" />
						</button>
					)}
					<h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
						{isEditing ? "Edit Item" : "Add New Item"}
					</h1>
				</div>
			</div>
			<div className="bg-white dark:bg-[#1d1d28] rounded-lg ">
				<form onSubmit={handleSubmit} className=" space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Item Name */}
						<div>
							<label
								htmlFor="name"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300"
							>
								Item Name
							</label>
							<input
								type="text"
								placeholder="e.g., Tennis Racket"
								id="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								className="mt-1 block w-full border border-gray-300 dark:border-gray-800 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-[#2A2A3B] text-gray-900 dark:text-gray-100"
								required
							/>
						</div>
						{/* Category */}
						<div>
							<label
								htmlFor="category"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300"
							>
								Category
							</label>
							<div className="mt-1 flex gap-2 items-center">
								<select
									id="category"
									value={categoryId}
									onChange={(e) =>
										setCategoryId(e.target.value)
									}
									className="block w-full border border-gray-300 dark:border-gray-800 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-[#2A2A3B] text-gray-900 dark:text-gray-100"
									required
								>
									<option value="">Select Category</option>
									{categories.map((category) => (
										<option
											key={category.id}
											value={category.id}
										>
											{category.name}
										</option>
									))}
								</select>
								{/* open category modal */}
								<button
									type="button"
									onClick={() => setShowAddCategory(true)}
									className="px-2 py-1 rounded-md border text-sm bg-gray-50 dark:bg-[#2A2A3B] text-gray-700 dark:text-gray-200"
								>
									Add
								</button>
							</div>

							{/* prompt when none exist */}
							{categories.length === 0 && !showAddCategory && (
								<div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
									No categories yet.{" "}
									<button
										type="button"
										onClick={() => setShowAddCategory(true)}
										className="underline text-blue-600 dark:text-blue-300"
									>
										Add a category
									</button>{" "}
									to continue.
								</div>
							)}
						</div>

						{/* Quantity */}
						<div>
							<label
								htmlFor="quantity"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300"
							>
								Quantity
							</label>
							<input
								type="text"
								id="quantity"
								value={quantity}
								onChange={(e) =>
									setQuantity(parseInt(e.target.value) || 0)
								}
								min={0}
								className="mt-1 block w-full border border-gray-300 dark:border-gray-800 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-[#2A2A3B] text-gray-900 dark:text-gray-100"
								required
							/>
						</div>
						{/* Location */}
						<div>
							<label
								htmlFor="location"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300"
							>
								Location
							</label>
							<input
								type="text"
								id="location"
								placeholder="e.g., Aisle 3, Shelf B"
								value={location}
								onChange={(e) => setLocation(e.target.value)}
								className="mt-1 block w-full border border-gray-300 dark:border-gray-800 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-[#2A2A3B] text-gray-900 dark:text-gray-100"
								required
							/>
						</div>

						{/* Supplier */}
						<div>
							<label
								htmlFor="supplier"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300"
							>
								Supplier
							</label>
							<div className="mt-1 flex gap-2 items-center">
								<select
									id="supplier"
									value={supplierId}
									onChange={(e) =>
										setSupplierId(e.target.value)
									}
									className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-[#2A2A3B] dark:border-gray-800 dark:text-gray-100 bg-white text-gray-900"
									required
								>
									<option value="">Select Supplier</option>
									{suppliers.map((supplier) => (
										<option
											key={supplier.id}
											value={supplier.id}
										>
											{supplier.name}
										</option>
									))}
								</select>
								{/* open supplier modal */}
								<button
									type="button"
									onClick={() => setShowAddSupplier(true)}
									className="px-2 py-1 rounded-md border text-sm bg-gray-50 dark:bg-[#2A2A3B] text-gray-700 dark:text-gray-200"
								>
									Add
								</button>
							</div>

							{/* prompt when none exist */}
							{suppliers.length === 0 && !showAddSupplier && (
								<div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
									No suppliers yet.{" "}
									<button
										type="button"
										onClick={() => setShowAddSupplier(true)}
										className="underline text-blue-600 dark:text-blue-300"
									>
										Add a supplier
									</button>{" "}
									to continue.
								</div>
							)}
						</div>

						{/* Purchase Date */}
						<div>
							<label
								htmlFor="purchaseDate"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300"
							>
								Purchase Date
							</label>
							<input
								type="date"
								id="purchaseDate"
								value={purchaseDate}
								onChange={(e) =>
									setPurchaseDate(e.target.value)
								}
								className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-[#2A2A3B] dark:border-gray-800 dark:text-gray-100 bg-white text-gray-900"
								required
							/>
						</div>

						{/* Price */}
						<div>
							<label
								htmlFor="price"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300"
							>
								Price ({currency})
							</label>
							<input
								type="text"
								id="price"
								value={price}
								onChange={(e) =>
									setPrice(parseFloat(e.target.value) || 0)
								}
								step="0.01"
								min="0"
								className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-[#2A2A3B] dark:border-gray-800 dark:text-gray-100 bg-white text-gray-900"
								required
							/>
						</div>
					</div>

					<div className="flex justify-end">
						<button
							type="button"
							onClick={() => finish()}
							className="bg-white dark:bg-[#2A2A3B] py-2 px-4 border border-gray-300 dark:border-gray-800 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
						>
							Cancel
						</button>
						<button
							type="submit"
							className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
						>
							<Save className="h-4 w-4 mr-1" />
							{isEditing ? "Update" : "Save"}
						</button>
					</div>
				</form>
			</div>

			{/* Category modal */}
			{showAddCategory && (
				<CategoriesForm
					editingCategory={null}
					onClose={() => setShowAddCategory(false)}
					onSaved={onCategoryModalSaved}
				/>
			)}

			{/* Supplier modal */}
			{showAddSupplier && (
				<SupplierForm
					editingSupplier={null}
					onClose={() => setShowAddSupplier(false)}
					onSaved={onSupplierModalSaved}
				/>
			)}
		</div>
	);
}
