"use client";

import React, { useState, useEffect } from "react";
import { Item, BorrowRecord } from "@/utils/types";
import {
	getItems,
	getBorrows,
	addBorrow,
	returnBorrow,
} from "@/utils/manipulateData";
import { toastSuccess, toastError } from "@/hooks/useToast";

interface BorrowComponentProps {
	isDarkMode: boolean;
}

const BorrowComponent: React.FC<BorrowComponentProps> = ({ isDarkMode }) => {
	const [items, setItems] = useState<Item[]>([]);
	const [borrows, setBorrows] = useState<BorrowRecord[]>([]);
	const [activeTab, setActiveTab] = useState<"borrow" | "return" | "active">(
		"borrow"
	);
	const [loading, setLoading] = useState(false);

	// Borrow form state
	const [borrowForm, setBorrowForm] = useState({
		itemId: "",
		borrowerName: "",
		borrowerEmail: "",
		borrowerPhone: "",
		quantityBorrowed: 1,
		expectedReturnDate: "",
		notes: "",
	});

	// Return form state
	const [returnForm, setReturnForm] = useState({
		borrowId: "",
		returnNotes: "",
	});

	// Load data
	const loadData = () => {
		setItems(getItems());
		setBorrows(getBorrows());
	};

	useEffect(() => {
		loadData();
	}, []);

	// Handle borrow form submission
	const handleBorrow = async (e: React.FormEvent) => {
		e.preventDefault();
		if (
			!borrowForm.itemId ||
			!borrowForm.borrowerName ||
			!borrowForm.expectedReturnDate
		) {
			toastError("Please fill in all required fields");
			return;
		}

		const selectedItem = items.find(
			(item) => item.id === borrowForm.itemId
		);
		if (!selectedItem) {
			toastError("Selected item not found");
			return;
		}

		if (borrowForm.quantityBorrowed > selectedItem.quantity) {
			toastError("Not enough items in stock");
			return;
		}

		setLoading(true);
		try {
			const success = addBorrow({
				itemId: borrowForm.itemId,
				itemName: selectedItem.name,
				borrowerName: borrowForm.borrowerName,
				borrowerEmail: borrowForm.borrowerEmail,
				borrowerPhone: borrowForm.borrowerPhone,
				quantityBorrowed: borrowForm.quantityBorrowed,
				borrowDate: new Date().toISOString(),
				expectedReturnDate: borrowForm.expectedReturnDate,
				status: "borrowed" as const,
				notes: borrowForm.notes,
				borrowedBy: "current_user", // We'll update this when we have proper user context
			});

			if (success) {
				setBorrowForm({
					itemId: "",
					borrowerName: "",
					borrowerEmail: "",
					borrowerPhone: "",
					quantityBorrowed: 1,
					expectedReturnDate: "",
					notes: "",
				});
				loadData();
				toastSuccess("Item borrowed successfully!");
			}
		} catch (error) {
			toastError("An error occurred while borrowing the item");
		}
		setLoading(false);
	};

	// Handle return form submission
	const handleReturn = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!returnForm.borrowId) {
			toastError("Please select a borrow record to return");
			return;
		}

		setLoading(true);
		try {
			const success = returnBorrow(
				returnForm.borrowId,
				returnForm.returnNotes
			);

			if (success) {
				setReturnForm({
					borrowId: "",
					returnNotes: "",
				});
				loadData();
				toastSuccess("Item returned successfully!");
			} else {
				toastError("Failed to return item");
			}
		} catch (error) {
			toastError("An error occurred while returning the item");
		}
		setLoading(false);
	};

	// Get available items for borrowing
	const availableItems = items.filter((item) => item.quantity > 0);

	// Get active borrows (not returned)
	const activeBorrows = borrows.filter(
		(borrow) => borrow.status === "borrowed" || borrow.status === "overdue"
	);

	// Format date for display
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString();
	};

	return (
		<div
			className={`p-6 ${
				isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
			}`}
		>
			<div className="mb-6">
				<h2 className="text-2xl font-bold mb-4">Borrow Management</h2>

				{/* Tab Navigation */}
				<div className="flex space-x-4 mb-6">
					<button
						onClick={() => setActiveTab("borrow")}
						className={`px-4 py-2 rounded-lg font-medium transition-colors ${
							activeTab === "borrow"
								? isDarkMode
									? "bg-blue-600 text-white"
									: "bg-blue-500 text-white"
								: isDarkMode
								? "bg-gray-700 text-gray-300 hover:bg-gray-600"
								: "bg-gray-200 text-gray-700 hover:bg-gray-300"
						}`}
					>
						Borrow Item
					</button>
					<button
						onClick={() => setActiveTab("return")}
						className={`px-4 py-2 rounded-lg font-medium transition-colors ${
							activeTab === "return"
								? isDarkMode
									? "bg-blue-600 text-white"
									: "bg-blue-500 text-white"
								: isDarkMode
								? "bg-gray-700 text-gray-300 hover:bg-gray-600"
								: "bg-gray-200 text-gray-700 hover:bg-gray-300"
						}`}
					>
						Return Item
					</button>
					<button
						onClick={() => setActiveTab("active")}
						className={`px-4 py-2 rounded-lg font-medium transition-colors ${
							activeTab === "active"
								? isDarkMode
									? "bg-blue-600 text-white"
									: "bg-blue-500 text-white"
								: isDarkMode
								? "bg-gray-700 text-gray-300 hover:bg-gray-600"
								: "bg-gray-200 text-gray-700 hover:bg-gray-300"
						}`}
					>
						Active Borrows ({activeBorrows.length})
					</button>
				</div>
			</div>

			{/* Borrow Tab */}
			{activeTab === "borrow" && (
				<div
					className={`rounded-lg border p-6 ${
						isDarkMode
							? "border-gray-600 bg-gray-700"
							: "border-gray-300 bg-gray-50"
					}`}
				>
					<h3 className="text-xl font-semibold mb-4">
						Borrow Equipment
					</h3>
					<form onSubmit={handleBorrow} className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{/* Item Selection */}
							<div>
								<label
									className={`block text-sm font-medium mb-2 ${
										isDarkMode
											? "text-gray-300"
											: "text-gray-700"
									}`}
								>
									Item *
								</label>
								<select
									value={borrowForm.itemId}
									onChange={(e) =>
										setBorrowForm({
											...borrowForm,
											itemId: e.target.value,
										})
									}
									className={`w-full px-3 py-2 rounded-md border ${
										isDarkMode
											? "bg-gray-600 border-gray-500 text-white"
											: "bg-white border-gray-300 text-gray-900"
									} focus:outline-none focus:ring-2 focus:ring-blue-500`}
									required
								>
									<option value="">Select an item</option>
									{availableItems.map((item) => (
										<option key={item.id} value={item.id}>
											{item.name} (Available:{" "}
											{item.quantity})
										</option>
									))}
								</select>
							</div>

							{/* Quantity */}
							<div>
								<label
									className={`block text-sm font-medium mb-2 ${
										isDarkMode
											? "text-gray-300"
											: "text-gray-700"
									}`}
								>
									Quantity *
								</label>
								<input
									type="number"
									min="1"
									max={
										borrowForm.itemId
											? items.find(
													(i) =>
														i.id ===
														borrowForm.itemId
											  )?.quantity || 1
											: 1
									}
									value={borrowForm.quantityBorrowed}
									onChange={(e) =>
										setBorrowForm({
											...borrowForm,
											quantityBorrowed:
												parseInt(e.target.value) || 1,
										})
									}
									className={`w-full px-3 py-2 rounded-md border ${
										isDarkMode
											? "bg-gray-600 border-gray-500 text-white"
											: "bg-white border-gray-300 text-gray-900"
									} focus:outline-none focus:ring-2 focus:ring-blue-500`}
									required
								/>
							</div>

							{/* Borrower Name */}
							<div>
								<label
									className={`block text-sm font-medium mb-2 ${
										isDarkMode
											? "text-gray-300"
											: "text-gray-700"
									}`}
								>
									Borrower Name *
								</label>
								<input
									type="text"
									value={borrowForm.borrowerName}
									onChange={(e) =>
										setBorrowForm({
											...borrowForm,
											borrowerName: e.target.value,
										})
									}
									className={`w-full px-3 py-2 rounded-md border ${
										isDarkMode
											? "bg-gray-600 border-gray-500 text-white"
											: "bg-white border-gray-300 text-gray-900"
									} focus:outline-none focus:ring-2 focus:ring-blue-500`}
									required
								/>
							</div>

							{/* Borrower Email */}
							<div>
								<label
									className={`block text-sm font-medium mb-2 ${
										isDarkMode
											? "text-gray-300"
											: "text-gray-700"
									}`}
								>
									Borrower Email
								</label>
								<input
									type="email"
									value={borrowForm.borrowerEmail}
									onChange={(e) =>
										setBorrowForm({
											...borrowForm,
											borrowerEmail: e.target.value,
										})
									}
									className={`w-full px-3 py-2 rounded-md border ${
										isDarkMode
											? "bg-gray-600 border-gray-500 text-white"
											: "bg-white border-gray-300 text-gray-900"
									} focus:outline-none focus:ring-2 focus:ring-blue-500`}
								/>
							</div>

							{/* Borrower Phone */}
							<div>
								<label
									className={`block text-sm font-medium mb-2 ${
										isDarkMode
											? "text-gray-300"
											: "text-gray-700"
									}`}
								>
									Borrower Phone
								</label>
								<input
									type="tel"
									value={borrowForm.borrowerPhone}
									onChange={(e) =>
										setBorrowForm({
											...borrowForm,
											borrowerPhone: e.target.value,
										})
									}
									className={`w-full px-3 py-2 rounded-md border ${
										isDarkMode
											? "bg-gray-600 border-gray-500 text-white"
											: "bg-white border-gray-300 text-gray-900"
									} focus:outline-none focus:ring-2 focus:ring-blue-500`}
								/>
							</div>

							{/* Expected Return Date */}
							<div>
								<label
									className={`block text-sm font-medium mb-2 ${
										isDarkMode
											? "text-gray-300"
											: "text-gray-700"
									}`}
								>
									Expected Return Date *
								</label>
								<input
									type="date"
									min={new Date().toISOString().split("T")[0]}
									value={borrowForm.expectedReturnDate}
									onChange={(e) =>
										setBorrowForm({
											...borrowForm,
											expectedReturnDate: e.target.value,
										})
									}
									className={`w-full px-3 py-2 rounded-md border ${
										isDarkMode
											? "bg-gray-600 border-gray-500 text-white"
											: "bg-white border-gray-300 text-gray-900"
									} focus:outline-none focus:ring-2 focus:ring-blue-500`}
									required
								/>
							</div>
						</div>

						{/* Notes */}
						<div>
							<label
								className={`block text-sm font-medium mb-2 ${
									isDarkMode
										? "text-gray-300"
										: "text-gray-700"
								}`}
							>
								Notes
							</label>
							<textarea
								value={borrowForm.notes}
								onChange={(e) =>
									setBorrowForm({
										...borrowForm,
										notes: e.target.value,
									})
								}
								rows={3}
								className={`w-full px-3 py-2 rounded-md border ${
									isDarkMode
										? "bg-gray-600 border-gray-500 text-white"
										: "bg-white border-gray-300 text-gray-900"
								} focus:outline-none focus:ring-2 focus:ring-blue-500`}
								placeholder="Additional notes..."
							/>
						</div>

						<button
							type="submit"
							disabled={loading}
							className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
								loading
									? "bg-gray-400 cursor-not-allowed"
									: "bg-blue-500 hover:bg-blue-600 text-white"
							}`}
						>
							{loading ? "Processing..." : "Borrow Item"}
						</button>
					</form>
				</div>
			)}

			{/* Return Tab */}
			{activeTab === "return" && (
				<div
					className={`rounded-lg border p-6 ${
						isDarkMode
							? "border-gray-600 bg-gray-700"
							: "border-gray-300 bg-gray-50"
					}`}
				>
					<h3 className="text-xl font-semibold mb-4">
						Return Equipment
					</h3>
					<form onSubmit={handleReturn} className="space-y-4">
						{/* Borrow Selection */}
						<div>
							<label
								className={`block text-sm font-medium mb-2 ${
									isDarkMode
										? "text-gray-300"
										: "text-gray-700"
								}`}
							>
								Select Borrow Record *
							</label>
							<select
								value={returnForm.borrowId}
								onChange={(e) =>
									setReturnForm({
										...returnForm,
										borrowId: e.target.value,
									})
								}
								className={`w-full px-3 py-2 rounded-md border ${
									isDarkMode
										? "bg-gray-600 border-gray-500 text-white"
										: "bg-white border-gray-300 text-gray-900"
								} focus:outline-none focus:ring-2 focus:ring-blue-500`}
								required
							>
								<option value="">Select a borrow record</option>
								{activeBorrows.map((borrow) => {
									const item = items.find(
										(i) => i.id === borrow.itemId
									);
									return (
										<option
											key={borrow.id}
											value={borrow.id}
										>
											{item?.name} - {borrow.borrowerName}{" "}
											({borrow.quantityBorrowed} units) -
											Due:{" "}
											{formatDate(
												borrow.expectedReturnDate
											)}
										</option>
									);
								})}
							</select>
						</div>

						{/* Return Notes */}
						<div>
							<label
								className={`block text-sm font-medium mb-2 ${
									isDarkMode
										? "text-gray-300"
										: "text-gray-700"
								}`}
							>
								Return Notes
							</label>
							<textarea
								value={returnForm.returnNotes}
								onChange={(e) =>
									setReturnForm({
										...returnForm,
										returnNotes: e.target.value,
									})
								}
								rows={3}
								className={`w-full px-3 py-2 rounded-md border ${
									isDarkMode
										? "bg-gray-600 border-gray-500 text-white"
										: "bg-white border-gray-300 text-gray-900"
								} focus:outline-none focus:ring-2 focus:ring-blue-500`}
								placeholder="Condition of returned item, any damages, etc..."
							/>
						</div>

						<button
							type="submit"
							disabled={loading || activeBorrows.length === 0}
							className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
								loading || activeBorrows.length === 0
									? "bg-gray-400 cursor-not-allowed"
									: "bg-green-500 hover:bg-green-600 text-white"
							}`}
						>
							{loading ? "Processing..." : "Return Item"}
						</button>

						{activeBorrows.length === 0 && (
							<p
								className={`text-center text-sm ${
									isDarkMode
										? "text-gray-400"
										: "text-gray-600"
								}`}
							>
								No active borrows to return
							</p>
						)}
					</form>
				</div>
			)}

			{/* Active Borrows Tab */}
			{activeTab === "active" && (
				<div
					className={`rounded-lg border ${
						isDarkMode
							? "border-gray-600 bg-gray-700"
							: "border-gray-300 bg-gray-50"
					}`}
				>
					<div className="p-6">
						<h3 className="text-xl font-semibold mb-4">
							Active Borrows
						</h3>
						{activeBorrows.length === 0 ? (
							<p
								className={`text-center py-8 ${
									isDarkMode
										? "text-gray-400"
										: "text-gray-600"
								}`}
							>
								No active borrows found
							</p>
						) : (
							<div className="overflow-x-auto">
								<table className="w-full">
									<thead>
										<tr
											className={`border-b ${
												isDarkMode
													? "border-gray-600"
													: "border-gray-300"
											}`}
										>
											<th
												className={`text-left py-3 px-4 font-medium ${
													isDarkMode
														? "text-gray-300"
														: "text-gray-700"
												}`}
											>
												Item
											</th>
											<th
												className={`text-left py-3 px-4 font-medium ${
													isDarkMode
														? "text-gray-300"
														: "text-gray-700"
												}`}
											>
												Borrower
											</th>
											<th
												className={`text-left py-3 px-4 font-medium ${
													isDarkMode
														? "text-gray-300"
														: "text-gray-700"
												}`}
											>
												Quantity
											</th>
											<th
												className={`text-left py-3 px-4 font-medium ${
													isDarkMode
														? "text-gray-300"
														: "text-gray-700"
												}`}
											>
												Borrow Date
											</th>
											<th
												className={`text-left py-3 px-4 font-medium ${
													isDarkMode
														? "text-gray-300"
														: "text-gray-700"
												}`}
											>
												Expected Return
											</th>
											<th
												className={`text-left py-3 px-4 font-medium ${
													isDarkMode
														? "text-gray-300"
														: "text-gray-700"
												}`}
											>
												Status
											</th>
											<th
												className={`text-left py-3 px-4 font-medium ${
													isDarkMode
														? "text-gray-300"
														: "text-gray-700"
												}`}
											>
												Actions
											</th>
										</tr>
									</thead>
									<tbody>
										{activeBorrows.map((borrow) => {
											const item = items.find(
												(i) => i.id === borrow.itemId
											);
											const isOverdue =
												new Date(
													borrow.expectedReturnDate
												) < new Date() &&
												borrow.status === "borrowed";

											return (
												<tr
													key={borrow.id}
													className={`border-b ${
														isDarkMode
															? "border-gray-600"
															: "border-gray-200"
													} ${
														isOverdue
															? "bg-red-50 dark:bg-red-900/20"
															: ""
													}`}
												>
													<td className="py-3 px-4">
														{item?.name ||
															"Unknown Item"}
													</td>
													<td className="py-3 px-4">
														<div>
															<div className="font-medium">
																{
																	borrow.borrowerName
																}
															</div>
															{borrow.borrowerEmail && (
																<div
																	className={`text-sm ${
																		isDarkMode
																			? "text-gray-400"
																			: "text-gray-600"
																	}`}
																>
																	{
																		borrow.borrowerEmail
																	}
																</div>
															)}
														</div>
													</td>
													<td className="py-3 px-4">
														{
															borrow.quantityBorrowed
														}
													</td>
													<td className="py-3 px-4">
														{formatDate(
															borrow.borrowDate
														)}
													</td>
													<td className="py-3 px-4">
														{formatDate(
															borrow.expectedReturnDate
														)}
													</td>
													<td className="py-3 px-4">
														<span
															className={`px-2 py-1 rounded-full text-xs font-medium ${
																isOverdue
																	? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
																	: borrow.status ===
																	  "borrowed"
																	? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
																	: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
															}`}
														>
															{isOverdue
																? "Overdue"
																: borrow.status}
														</span>
													</td>
													<td className="py-3 px-4">
														<button
															onClick={() => {
																setReturnForm({
																	...returnForm,
																	borrowId:
																		borrow.id,
																});
																setActiveTab(
																	"return"
																);
															}}
															className="text-blue-500 hover:text-blue-700 text-sm font-medium"
														>
															Return
														</button>
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default BorrowComponent;
