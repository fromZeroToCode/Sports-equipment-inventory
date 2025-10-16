import React, { useEffect, useState } from "react";

import { Supplier } from "@/utils/types";
import { X } from "lucide-react";
import { useConfirm } from "@/components/ui/ConfirmProvider";

import { addSupplier, updateSupplier } from "@/utils/manipulateData";

export default function SupplierForm({
	editingSupplier,
	onClose,
	onSaved,
}: {
	editingSupplier?: Supplier | null;
	onClose: () => void;
	onSaved?: () => void;
}) {
	const confirm = useConfirm();
	const [name, setName] = useState("");
	const [contact, setContact] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const ok = await confirm({
			title: editingSupplier ? "Edit Supplier" : "Add Supplier",
			description: editingSupplier
				? "Are you sure you want to edit this supplier? This cannot be undone."
				: "Are you sure you want to add this supplier? This cannot be undone.",
			confirmText: editingSupplier ? "Edit" : "Add",
			cancelText: "Cancel",
			variant: "default",
		});
		if (!ok) return;
		if (editingSupplier) {
			updateSupplier({
				...editingSupplier,
				name,
				contact,
				email,
				phone,
			});
		} else {
			addSupplier({
				name,
				contact,
				email,
				phone,
			});
		}
		onSaved?.();
		onClose();
	};

	useEffect(() => {
		if (editingSupplier) {
			setName(editingSupplier.name);
			setContact(editingSupplier.contact);
			setEmail(editingSupplier.email);
			setPhone(editingSupplier.phone || "");
		} else {
			setName("");
			setContact("");
			setEmail("");
			setPhone("");
		}
	}, []);
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 !m-0 max-sm:p-0">
			<div className="w-full max-w-xl bg-white dark:bg-[#1d1d28] rounded-lg shadow-lg overflow-auto">
				<div className="px-6 py-4 border-b border-gray-200 dark:border-[#2A2A3B] flex justify-between items-center">
					<h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
						{editingSupplier ? "Edit Supplier" : "Add New Supplier"}
					</h3>
					<button
						onClick={onClose}
						className="text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-300"
					>
						<X className="h-5 w-5" />
					</button>
				</div>
				<form onSubmit={handleSubmit} className="p-6 space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label
								htmlFor="name"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300"
							>
								Supplier Name
							</label>
							<input
								type="text"
								id="name"
								placeholder="Supplier Name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								className="mt-1 block w-full border border-gray-300 dark:border-gray-800 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-[#2A2A3B] text-gray-900 dark:text-gray-100"
								required
							/>
						</div>
						<div>
							<label
								htmlFor="contact"
								className="block text-sm font-medium text-[#2A2A3B] dark:text-gray-300"
							>
								Contact Person
							</label>
							<input
								type="text"
								placeholder="Contact Person"
								id="contact"
								value={contact}
								onChange={(e) => setContact(e.target.value)}
								className="mt-1 block w-full border border-gray-300 dark:border-gray-800 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-[#2A2A3B] text-gray-900 dark:text-gray-100"
								required
							/>
						</div>
						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-[#2A2A3B] dark:text-gray-300"
							>
								Email
							</label>
							<input
								type="email"
								placeholder="Email Address"
								id="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="mt-1 block w-full border border-gray-300 dark:border-gray-800 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-[#2A2A3B] text-gray-900 dark:text-gray-100"
								required
							/>
						</div>
						<div>
							<label
								htmlFor="phone"
								className="block text-sm font-medium text-[#2A2A3B] dark:text-gray-300"
							>
								Phone Number
							</label>
							<input
								type="tel"
								placeholder="Phone Number"
								maxLength={11}
								id="phone"
								value={phone}
								onChange={(e) => setPhone(e.target.value)}
								className="mt-1 block w-full border border-gray-300 dark:border-gray-800 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-[#2A2A3B] text-gray-900 dark:text-gray-100"
							/>
						</div>
					</div>
					<div className="flex justify-end">
						<button
							type="button"
							onClick={onClose}
							className="bg-white dark:bg-[#2A2A3B] py-2 px-4 border border-gray-300 dark:border-gray-800 rounded-md shadow-sm text-sm font-medium text-[#2A2A3B] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
						>
							Cancel
						</button>
						<button
							type="submit"
							className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
						>
							{editingSupplier ? "Update" : "Save"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
