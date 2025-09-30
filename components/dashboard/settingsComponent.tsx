import React, { useEffect, useState } from "react";
import {
	clearAllData,
	isLocalStorageAvailable,
} from "@/utils/localStorageManipulation";
import { Save, Download, RefreshCw, Upload } from "lucide-react";
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
				inventory: localStorage.getItem("inventory")
					? JSON.parse(localStorage.getItem("inventory")!)
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
			toastSuccess("Export Successful", "Data exported successfully.");
		} catch (error) {
			console.error("Error exporting data:", error);
			toastError(
				"Export Failed",
				"Failed to export data. Please try again."
			);
		}
	};

	const importAll = async () => {
		if (!isLocalStorageAvailable()) {
			toastError(
				"Import Failed",
				"Cannot import: localStorage is not available."
			);
			return;
		}

		const ok = await confirm({
			title: "Import Data",
			description:
				"Are you sure you want to import data? This will overwrite all existing data and cannot be undone.",
			confirmText: "Import",
			cancelText: "Cancel",
		});
		if (!ok) return;

		try {
			const input = document.createElement("input");
			input.type = "file";
			input.accept = ".json";
			input.onchange = (event) => {
				const file = (event.target as HTMLInputElement).files?.[0];
				if (!file) return;

				const reader = new FileReader();
				reader.onload = (e) => {
					try {
						const data = JSON.parse(e.target?.result as string);

						if (!data || typeof data !== "object") {
							throw new Error("Invalid file format");
						}

						if (data.inventory && Array.isArray(data.inventory)) {
							localStorage.setItem(
								"inventory",
								JSON.stringify(data.inventory)
							);
						}

						if (data.categories && Array.isArray(data.categories)) {
							localStorage.setItem(
								"categories",
								JSON.stringify(data.categories)
							);
						}

						if (data.suppliers && Array.isArray(data.suppliers)) {
							localStorage.setItem(
								"suppliers",
								JSON.stringify(data.suppliers)
							);
						}

						if (
							data.settings &&
							typeof data.settings === "object"
						) {
							localStorage.setItem(
								"settings",
								JSON.stringify(data.settings)
							);
							if (data.settings.lowStockThreshold !== undefined) {
								setLowStockThreshold(
									data.settings.lowStockThreshold
								);
							}
							if (data.settings.currency !== undefined) {
								setCurrency(data.settings.currency);
							}
						}

						toastSuccess(
							"Import Successful",
							"Data imported successfully. The page will reload to apply changes."
						);

						setTimeout(() => {
							window.location.reload();
						}, 1500);
					} catch (parseError) {
						console.error(
							"Error parsing imported file:",
							parseError
						);
						toastError(
							"Import Failed",
							"Invalid file format. Please select a valid JSON file exported from this application."
						);
					}
				};
				reader.readAsText(file);
			};
			input.click();
		} catch (error) {
			console.error("Error importing data:", error);
			toastError(
				"Import Failed",
				"Failed to import data. Please try again."
			);
		}
	};

	return (
		<div className="space-y-6">
			{!storageAvailable && (
				<div className="bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-400 dark:border-yellow-500 p-4">
					<p className="text-sm text-yellow-700 dark:text-yellow-200">
						Warning: LocalStorage is not available. Settings and
						data will not be saved between sessions.
					</p>
				</div>
			)}

			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
					Settings
				</h1>
			</div>

			{/* System Settings Card */}
			<div className="bg-white dark:bg-gray-800 shadow rounded-lg ">
				<div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
					<h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
						System Settings
					</h3>
				</div>

				<form onSubmit={handleSubmit} className="p-6 space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Low Stock Threshold */}
						<div>
							<label
								htmlFor="lowStockThreshold"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300"
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
									className="block w-full pr-12 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
								/>
								<div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
									<span className="text-gray-500 dark:text-gray-400 sm:text-sm">
										items
									</span>
								</div>
							</div>
							<p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
								Items at or below this value will be flagged as
								Low Stock.
							</p>
						</div>

						{/* Currency */}
						<div>
							<label
								htmlFor="currency"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300"
							>
								Currency
							</label>
							<select
								id="currency"
								value={currency}
								onChange={(e) => setCurrency(e.target.value)}
								className="mt-1 block w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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

					<div className="pt-5 border-t border-gray-100 dark:border-gray-700">
						<div className="flex justify-end gap-3">
							<button
								type="submit"
								className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
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
			<div className="bg-white dark:bg-gray-800 shadow rounded-lg ">
				<div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
					<h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
						Data Management
					</h3>
					<p className="text-sm text-gray-500 dark:text-gray-400">
						Export / Reset
					</p>
				</div>

				<div className="p-6 space-y-4">
					<p className="text-sm text-gray-500 dark:text-gray-400">
						Use these options to manage your inventory data. Be
						careful — some actions cannot be undone.
					</p>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
						<button
							type="button"
							onClick={exportAll}
							disabled={!storageAvailable}
							className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-sm text-gray-900 dark:text-gray-100"
						>
							<Download className="h-4 w-4" />
							<span>Export All Data</span>
						</button>

						<button
							type="button"
							onClick={importAll}
							disabled={!storageAvailable}
							className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-sm text-gray-900 dark:text-gray-100"
						>
							<Upload className="h-4 w-4" />
							<span>Import Data</span>
						</button>

						<button
							type="button"
							onClick={handleResetData}
							disabled={!storageAvailable}
							className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent rounded-md bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-sm text-white"
						>
							<RefreshCw className="h-4 w-4" />
							<span>Reset All Data</span>
						</button>
					</div>

					{!storageAvailable && (
						<div className="text-sm text-gray-500 dark:text-gray-400">
							Some actions are disabled because localStorage is
							not available.
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
