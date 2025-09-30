import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { addCategory, updateCategory } from "@/utils/manipulateData";
import { Category } from "@/utils/types";

export default function CategoriesForm({
	editingCategory,
	onClose,
	onSaved,
}: {
	editingCategory?: Category | null;
	onClose: () => void;
	onSaved?: () => void;
}) {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");

	useEffect(() => {
		if (editingCategory) {
			setName(editingCategory.name);
			setDescription(editingCategory.description || "");
		} else {
			setName("");
			setDescription("");
		}
	}, [editingCategory]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (editingCategory) {
			updateCategory({
				...editingCategory,
				name,
				description,
			});
		} else {
			addCategory({
				name,
				description,
			});
		}
		onSaved?.();
		onClose();
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 !m-0">
			<div className="w-full max-w-xl bg-white rounded-lg shadow-lg overflow-auto dark:bg-gray-800">
				<div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
					<h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
						{editingCategory ? "Edit Category" : "Add New Category"}
					</h3>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-gray-500"
						aria-label="Close category form"
						title="Close"
						type="button"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				<form onSubmit={handleSubmit} className="p-6 space-y-6">
					<div>
						<label
							htmlFor="category-name"
							className="block text-sm font-medium text-gray-700 dark:text-gray-300"
						>
							Category Name
						</label>
						<input
							id="category-name"
							placeholder="Category Name"
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 bg-white text-gray-900"
							required
							autoFocus
						/>
					</div>
					<div>
						<label
							htmlFor="category-description"
							className="block text-sm font-medium text-gray-700 dark:text-gray-300"
						>
							Description
						</label>
						<textarea
							id="category-description"
							placeholder="Description (optional)"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							rows={3}
							className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 bg-white text-gray-900"
						/>
					</div>

					<div className="flex justify-end">
						<button
							type="button"
							onClick={onClose}
							className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
						>
							Cancel
						</button>
						<button
							type="submit"
							className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
						>
							{editingCategory ? "Update" : "Save"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
