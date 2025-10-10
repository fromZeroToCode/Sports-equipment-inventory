import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash, Search } from "lucide-react";
import { useConfirm } from "@/components/ui/ConfirmProvider";
import { toastError } from "@/hooks/useToast";

import { getCategories, deleteCategory } from "@/utils/manipulateData";

import { Category } from "@/utils/types";
import CategoriesForm from "@/components/dashboard/categoriesComponentForm/categoriesForm";

export default function CategoriesComponent() {
	const confirm = useConfirm();
	const [categories, setCategories] = useState<Category[]>([]);
	const [filteredCategories, setFilteredCategories] = useState<Category[]>(
		[]
	);
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingCategory, setEditingCategory] = useState<Category | null>(
		null
	);

	// role
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

	// search + pagination
	const [searchTerm, setSearchTerm] = useState("");
	const PAGE_SIZE = 11;
	const [page, setPage] = useState(1);
	const totalPages = Math.max(
		1,
		Math.ceil(filteredCategories.length / PAGE_SIZE)
	);

	const pagedCategories = filteredCategories.slice(
		(page - 1) * PAGE_SIZE,
		page * PAGE_SIZE
	);

	const loadCategories = () => {
		const loaded = getCategories();
		setCategories(loaded);
	};

	// Handle edit category
	const handleEdit = (category: Category) => {
		if (!isManager) {
			toastError("Unauthorized", "Your role cannot edit categories.");
			return;
		}
		setEditingCategory(category);
		setIsFormOpen(true);
	};

	// Handle delete category
	const handleDelete = async (id: string) => {
		if (!isManager) {
			toastError("Unauthorized", "Your role cannot delete categories.");
			return;
		}
		const ok = await confirm({
			title: "Delete category",
			description:
				"Are you sure you want to delete this category? This cannot be undone.",
			confirmText: "Delete",
			cancelText: "Cancel",
		});
		if (!ok) return;
		deleteCategory(id);
		loadCategories();
	};

	useEffect(() => {
		loadCategories();
	}, []);

	// apply search and reset page when search or categories change
	useEffect(() => {
		const term = searchTerm.trim().toLowerCase();
		let result = categories.slice();

		if (term) {
			result = result.filter(
				(c) =>
					c.name.toLowerCase().includes(term) ||
					(c.description || "").toLowerCase().includes(term)
			);
		}

		setFilteredCategories(result);
		setPage(1);
	}, [categories, searchTerm]);

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center max-md:flex-col max-md:items-start gap-3 w-full">
				<h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
					Categories
				</h1>

				<div className="flex items-center gap-3 max-md:w-full max-sm:flex-col sm:flex-row sm:w-auto">
					{/* Search */}
					<div className="relative max-md:w-full">
						<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
						</div>
						<input
							type="text"
							aria-label="Search categories"
							placeholder="Search categories..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm sm:text-sm w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
						/>
					</div>

					<button
						onClick={() => {
							if (!isManager) {
								toastError(
									"Unauthorized",
									"Your role cannot add categories."
								);
								return;
							}
							setEditingCategory(null);
							setIsFormOpen(true);
						}}
						disabled={!isManager}
						className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
							isManager
								? "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
								: "bg-gray-300 cursor-not-allowed"
						} whitespace-nowrap`}
					>
						<Plus className="h-4 w-4 mr-1" />
						Add Category
					</button>
				</div>
			</div>

			{/* Category Form */}
			{isFormOpen && (
				<CategoriesForm
					editingCategory={editingCategory}
					onClose={() => {
						setIsFormOpen(false);
						setEditingCategory(null);
					}}
					onSaved={() => {
						loadCategories();
					}}
				/>
			)}

			{/* Categories List */}
			<div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700/30 rounded-lg">
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
						<thead className="bg-gray-50 dark:bg-gray-700">
							<tr>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
								>
									Name
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
								>
									Description
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
								>
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
							{pagedCategories.length > 0 ? (
								pagedCategories.map((category) => (
									<tr key={category.id}>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm font-medium text-gray-900 dark:text-gray-100">
												{category.name}
											</div>
										</td>
										<td className="px-6 py-4">
											<div className="text-sm text-gray-500 dark:text-gray-400">
												{category.description}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
											<div className="flex justify-end space-x-2">
												<button
													onClick={() =>
														handleEdit(category)
													}
													disabled={!isManager}
													className={`${
														isManager
															? "text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
															: "text-gray-400 cursor-not-allowed"
													}`}
													aria-label={`Edit ${category.name}`}
													title={`Edit ${category.name}`}
												>
													<Edit className="h-5 w-5" />
												</button>
												<button
													onClick={() =>
														handleDelete(
															category.id
														)
													}
													disabled={!isManager}
													className={`${
														isManager
															? "text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
															: "text-gray-400 cursor-not-allowed"
													}`}
													aria-label={`Delete ${category.name}`}
													title={`Delete ${category.name}`}
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
										colSpan={3}
										className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
									>
										No categories found
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
				{/* Pagination controls */}
				<div className="px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between max-sm:flex-col gap-3">
					<div className="text-sm text-gray-700 dark:text-gray-300">
						Showing{" "}
						<span className="font-medium">
							{filteredCategories.length === 0
								? 0
								: (page - 1) * PAGE_SIZE + 1}
						</span>{" "}
						to{" "}
						<span className="font-medium">
							{Math.min(
								page * PAGE_SIZE,
								filteredCategories.length
							)}
						</span>{" "}
						of{" "}
						<span className="font-medium">
							{filteredCategories.length}
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

						{/* simple page indicator */}
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
