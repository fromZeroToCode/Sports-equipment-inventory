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
} from "@/utils/manipulateData";
import { Category, Supplier, Item } from "@/utils/types";
import { toastError } from "@/hooks/useToast";

export default function ItemForm({
	itemId,
	onClose,
	onSave,
}: {
	itemId?: string;
	onClose?: () => void;
	onSave?: (item: Item) => void;
}) {
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

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		const status = computeStatus(Number(quantity));

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
		<div className="space-y-6 bg-white rounded-lg p-6 shadow ">
			<div className="flex items-center justify-between">
				<div className="flex items-center">
					{onClose ? (
						<button
							onClick={() => finish()}
							className="mr-4 p-2 text-gray-500 rounded-full hover:bg-gray-100"
							type="button"
						>
							<ArrowLeft className="h-5 w-5" />
						</button>
					) : (
						<button
							onClick={() => router.push("/items")}
							className="mr-4 p-2 text-gray-500 rounded-full hover:bg-gray-100"
							type="button"
						>
							<ArrowLeft className="h-5 w-5" />
						</button>
					)}
					<h1 className="text-2xl font-bold text-gray-800">
						{isEditing ? "Edit Item" : "Add New Item"}
					</h1>
				</div>
			</div>
			<div className="bg-white rounded-lg ">
				<form onSubmit={handleSubmit} className=" space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Item Name */}
						<div>
							<label
								htmlFor="name"
								className="block text-sm font-medium text-gray-700"
							>
								Item Name
							</label>
							<input
								type="text"
								placeholder="e.g., Tennis Racket"
								id="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
								required
							/>
						</div>
						{/* Category */}
						<div>
							<label
								htmlFor="category"
								className="block text-sm font-medium text-gray-700"
							>
								Category
							</label>
							<select
								id="category"
								value={categoryId}
								onChange={(e) => setCategoryId(e.target.value)}
								className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
						</div>

						{/* Quantity */}
						<div>
							<label
								htmlFor="quantity"
								className="block text-sm font-medium text-gray-700"
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
								className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
								required
							/>
						</div>

						{/* Location */}
						<div>
							<label
								htmlFor="location"
								className="block text-sm font-medium text-gray-700"
							>
								Location
							</label>
							<input
								type="text"
								id="location"
								placeholder="e.g., Aisle 3, Shelf B"
								value={location}
								onChange={(e) => setLocation(e.target.value)}
								className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
								required
							/>
						</div>

						{/* Supplier */}
						<div>
							<label
								htmlFor="supplier"
								className="block text-sm font-medium text-gray-700"
							>
								Supplier
							</label>
							<select
								id="supplier"
								value={supplierId}
								onChange={(e) => setSupplierId(e.target.value)}
								className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
						</div>

						{/* Purchase Date */}
						<div>
							<label
								htmlFor="purchaseDate"
								className="block text-sm font-medium text-gray-700"
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
								className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
								required
							/>
						</div>

						{/* Price */}
						<div>
							<label
								htmlFor="price"
								className="block text-sm font-medium text-gray-700"
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
								className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
								required
							/>
						</div>
					</div>

					<div className="flex justify-end">
						<button
							type="button"
							onClick={() => finish()}
							className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
						>
							Cancel
						</button>
						<button
							type="submit"
							className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
						>
							<Save className="h-4 w-4 mr-1" />
							{isEditing ? "Update" : "Save"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
