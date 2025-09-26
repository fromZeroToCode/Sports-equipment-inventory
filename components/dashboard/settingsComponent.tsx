import React, { useEffect, useState } from "react";
import {
	clearAllData,
	isLocalStorageAvailable,
} from "@/utils/localStorageManipulation";
import { Save, Download, RefreshCw } from "lucide-react";
import { toastError, toastSuccess } from "@/hooks/useToast";
import { useConfirm } from "@/components/ui/ConfirmProvider";

export default function SettingsComponent() {
	const confirm = useConfirm();
	const [lowStockThreshold, setLowStockThreshold] = useState(5);
	const [currency, setCurrency] = useState("PHP");
	const [storageAvailable, setStorageAvailable] = useState(true);

	useEffect(() => {
		setStorageAvailable(isLocalStorageAvailable());
		if (isLocalStorageAvailable()) {
			try {
				const settings = localStorage.getItem("settings");
				if (settings) {
					const parsedSettings = JSON.parse(settings);
					setLowStockThreshold(parsedSettings.lowStockThreshold ?? 5);
					setCurrency(parsedSettings.currency ?? "PHP");
				}
			} catch (error) {
				console.error(
					"Error loading settings from localStorage:",
					error
				);
			}
		}
	}, []);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!isLocalStorageAvailable()) {
			toastError("Error", "Cannot save: localStorage is not available.");
			return;
		}
		try {
			const settings = {
				lowStockThreshold,
				currency,
			};
			localStorage.setItem("settings", JSON.stringify(settings));
			const old = document.activeElement as HTMLElement | null;
			toastSuccess("Settings Saved", "Your settings have been saved.");
			old?.focus();
		} catch (error) {
			console.error("Error saving settings to localStorage:", error);
			toastError("Error", "Failed to save settings. Please try again.");
		}
	};

	const handleResetData = async () => {
		const ok = await confirm({
			title: "Reset Data",
			description:
				"Are you sure you want to reset all data? This cannot be undone.",
			confirmText: "Reset",
			cancelText: "Cancel",
		});
		if (!ok) return;
		clearAllData();
		toastSuccess("Data Reset", "All data has been reset.");
		window.location.reload();
	};

	const exportAll = () => {
		if (!isLocalStorageAvailable()) {
			toastError(
				"Export Failed",
				"Cannot export: localStorage is not available."
			);
			return;
		}
		try {
			const exportData = {
				items: localStorage.getItem("items")
					? JSON.parse(localStorage.getItem("items")!)
					: [],
				categories: localStorage.getItem("categories")
					? JSON.parse(localStorage.getItem("categories")!)
					: [],
				suppliers: localStorage.getItem("suppliers")
					? JSON.parse(localStorage.getItem("suppliers")!)
					: [],
				settings: localStorage.getItem("settings")
					? JSON.parse(localStorage.getItem("settings")!)
					: {},
			};
			const dataStr = JSON.stringify(exportData, null, 2);
			const dataUri =
				"data:application/json;charset=utf-8," +
				encodeURIComponent(dataStr);
			const linkElement = document.createElement("a");
			linkElement.setAttribute("href", dataUri);
			linkElement.setAttribute("download", "inventory_data.json");
			document.body.appendChild(linkElement);
			linkElement.click();
			document.body.removeChild(linkElement);
		} catch (error) {
			console.error("Error exporting data:", error);
			toastError(
				"Export Failed",
				"Failed to export data. Please try again."
			);
		}
	};

	return (
		<div className="space-y-6">
			{!storageAvailable && (
				<div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
					<p className="text-sm text-yellow-700">
						Warning: LocalStorage is not available. Settings and
						data will not be saved between sessions.
					</p>
				</div>
			)}

			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold text-gray-800">Settings</h1>
			</div>

			{/* System Settings Card */}
			<div className="bg-white shadow rounded-lg overflow-hidden">
				<div className="px-6 py-4 border-b border-gray-200">
					<h3 className="text-lg font-medium text-gray-900">
						System Settings
					</h3>
				</div>

				<form onSubmit={handleSubmit} className="p-6 space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Low Stock Threshold */}
						<div>
							<label
								htmlFor="lowStockThreshold"
								className="block text-sm font-medium text-gray-700"
							>
								Low Stock Threshold
							</label>
							<div className="mt-1 relative rounded-md shadow-sm">
								<input
									type="number"
									id="lowStockThreshold"
									value={lowStockThreshold}
									onChange={(e) =>
										setLowStockThreshold(
											parseInt(e.target.value) || 0
										)
									}
									min={0}
									className="block w-full pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2"
								/>
								<div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
									<span className="text-gray-500 sm:text-sm">
										items
									</span>
								</div>
							</div>
							<p className="mt-2 text-sm text-gray-500">
								Items at or below this value will be flagged as
								Low Stock.
							</p>
						</div>

						{/* Currency */}
						<div>
							<label
								htmlFor="currency"
								className="block text-sm font-medium text-gray-700"
							>
								Currency
							</label>
							<select
								id="currency"
								value={currency}
								onChange={(e) => setCurrency(e.target.value)}
								className="mt-1 block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
							>
								<option value="PHP">PHP (₱)</option>
								<option value="USD">USD ($)</option>
								<option value="EUR">EUR (€)</option>
								<option value="GBP">GBP (£)</option>
								<option value="CAD">CAD ($)</option>
								<option value="AUD">AUD ($)</option>
							</select>
						</div>
					</div>

					<div className="pt-5 border-t border-gray-100">
						<div className="flex justify-end gap-3">
							<button
								type="submit"
								className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
								disabled={!storageAvailable}
							>
								<Save className="h-4 w-4 mr-2" />
								Save Settings
							</button>
						</div>
					</div>
				</form>
			</div>

			{/* Data Management Card */}
			<div className="bg-white shadow rounded-lg overflow-hidden">
				<div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
					<h3 className="text-lg font-medium text-gray-900">
						Data Management
					</h3>
					<p className="text-sm text-gray-500">Export / Reset</p>
				</div>

				<div className="p-6 space-y-4">
					<p className="text-sm text-gray-500">
						Use these options to manage your inventory data. Be
						careful — some actions cannot be undone.
					</p>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
						<button
							type="button"
							onClick={exportAll}
							disabled={!storageAvailable}
							className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-sm"
						>
							<Download className="h-4 w-4" />
							<span>Export All Data</span>
						</button>

						<button
							type="button"
							onClick={handleResetData}
							disabled={!storageAvailable}
							className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent rounded-md bg-red-600 hover:bg-red-700 text-sm text-white"
						>
							<RefreshCw className="h-4 w-4" />
							<span>Reset All Data</span>
						</button>
					</div>

					{!storageAvailable && (
						<div className="text-sm text-gray-500">
							Some actions are disabled because localStorage is
							not available.
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
