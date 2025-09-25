import React, { useEffect, useState } from "react";
import { Supplier } from "@/utils/types";
import { Plus, Edit, Trash, Search } from "lucide-react";

import { getSuppliers, deleteSupplier } from "@/utils/manipulateData";
import SupplierForm from "@/components/dashboard/supplierComponentForm/supplierForm";

export default function SupplierComponent() {
	const [suppliers, setSuppliers] = useState<Supplier[]>([]);
	const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);

	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(
		null
	);

	// search + pagination
	const [searchTerm, setSearchTerm] = useState("");
	const PAGE_SIZE = 11;
	const [page, setPage] = useState(1);
	const totalPages = Math.max(
		1,
		Math.ceil(filteredSuppliers.length / PAGE_SIZE)
	);

	const pagedSuppliers = filteredSuppliers.slice(
		(page - 1) * PAGE_SIZE,
		page * PAGE_SIZE
	);

	const handleEdit = (supplier: Supplier) => {
		setEditingSupplier(supplier);
		setIsFormOpen(true);
	};

	// Handle delete supplier
	const handleDelete = (id: string) => {
		if (window.confirm("Are you sure you want to delete this supplier?")) {
			deleteSupplier(id);
			loadSuppliers();
		}
	};

	const loadSuppliers = () => {
		setSuppliers(getSuppliers());
	};

	useEffect(() => {
		const term = searchTerm.trim().toLowerCase();
		let result = suppliers.slice();

		if (term) {
			result = result.filter(
				(c) =>
					c.name.toLowerCase().includes(term) ||
					(c.contact || "").toLowerCase().includes(term) ||
					(c.email || "").toLowerCase().includes(term) ||
					(c.phone || "").toLowerCase().includes(term)
			);
		}

		setFilteredSuppliers(result);
		setPage(1);
	}, [suppliers, searchTerm]);

	useEffect(() => {
		loadSuppliers();
	}, []);

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold text-gray-800">Suppliers</h1>

				<div className="flex space-x-2">
					<div className="relative">
						<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<Search className="h-5 w-5 text-gray-400" />
						</div>
						<input
							type="text"
							aria-label="Search suppliers"
							placeholder="Search suppliers..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
						/>
					</div>

					<button
						onClick={() => setIsFormOpen(true)}
						className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
					>
						<Plus className="h-4 w-4 mr-1" />
						Add Supplier
					</button>
				</div>
			</div>

			{isFormOpen && (
				<SupplierForm
					editingSupplier={editingSupplier}
					onClose={() => {
						setIsFormOpen(false);
						setEditingSupplier(null);
					}}
					onSaved={loadSuppliers}
				/>
			)}

			{/* Suppliers List */}
			<div className="bg-white shadow rounded-lg overflow-hidden">
				<table className="min-w-full divide-y divide-gray-200">
					<thead className="bg-gray-50">
						<tr>
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Name
							</th>
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Contact
							</th>
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Email
							</th>
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Phone
							</th>
							<th
								scope="col"
								className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="bg-white divide-y divide-gray-200">
						{pagedSuppliers.length > 0 ? (
							pagedSuppliers.map((supplier) => (
								<tr key={supplier.id}>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="text-sm font-medium text-gray-900">
											{supplier.name}
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{supplier.contact}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{supplier.email}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{supplier.phone}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
										<div className="flex justify-end space-x-2">
											<button
												onClick={() =>
													handleEdit(supplier)
												}
												className="text-blue-600 hover:text-blue-900"
											>
												<Edit className="h-5 w-5" />
											</button>
											<button
												onClick={() =>
													handleDelete(supplier.id)
												}
												className="text-red-600 hover:text-red-900"
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
									colSpan={5}
									className="px-6 py-4 text-center text-sm text-gray-500"
								>
									No suppliers found
								</td>
							</tr>
						)}
					</tbody>
				</table>

				{/* pagination controls */}
				<div className="px-4 py-3 bg-white border-t border-gray-200 flex items-center justify-between">
					<div className="text-sm text-gray-700">
						Showing{" "}
						<span className="font-medium">
							{filteredSuppliers.length === 0
								? 0
								: (page - 1) * PAGE_SIZE + 1}
						</span>{" "}
						to{" "}
						<span className="font-medium">
							{Math.min(
								page * PAGE_SIZE,
								filteredSuppliers.length
							)}
						</span>{" "}
						of{" "}
						<span className="font-medium">
							{filteredSuppliers.length}
						</span>{" "}
						results
					</div>
					<div className="flex items-center space-x-2">
						<button
							onClick={() => setPage((p) => Math.max(1, p - 1))}
							disabled={page === 1}
							className="px-3 py-1 rounded-md border text-sm bg-white disabled:opacity-50"
						>
							Previous
						</button>

						{/* simple page indicator */}
						<div className="text-sm text-gray-700">
							Page <span className="font-medium">{page}</span> of{" "}
							<span className="font-medium">{totalPages}</span>
						</div>

						<button
							onClick={() =>
								setPage((p) => Math.min(totalPages, p + 1))
							}
							disabled={page === totalPages}
							className="px-3 py-1 rounded-md border text-sm bg-white disabled:opacity-50"
						>
							Next
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
