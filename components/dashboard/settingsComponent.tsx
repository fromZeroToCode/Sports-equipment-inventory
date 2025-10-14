import React, { useEffect, useState } from "react";
import {
	clearAllData,
	isLocalStorageAvailable,
} from "@/utils/localStorageManipulation";
import {
	Save,
	Download,
	RefreshCw,
	Upload,
	Plus,
	User,
	Trash,
} from "lucide-react";
import { toastError, toastSuccess } from "@/hooks/useToast";
import { useConfirm } from "@/components/ui/ConfirmProvider";

export default function SettingsComponent() {
	const confirm = useConfirm();
	const [lowStockThreshold, setLowStockThreshold] = useState(5);
	const [currency, setCurrency] = useState("PHP");
	const [storageAvailable, setStorageAvailable] = useState(true);

	type Role = "admin" | "coach" | "staff";
	type UserRecord = {
		id: string;
		username: string;
		password: string;
		role: Role;
	};

	const [users, setUsers] = useState<UserRecord[]>([]);
	const [isUserFormOpen, setIsUserFormOpen] = useState(false);
	const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
	const [formUsername, setFormUsername] = useState("");
	const [formPassword, setFormPassword] = useState("");
	const [formRole, setFormRole] = useState<Role>("staff");

	const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
	const [passwordPromptValue, setPasswordPromptValue] = useState("");
	const [pendingAction, setPendingAction] = useState<null | {
		type: "add" | "edit" | "delete";
		payload?: any;
	}>(null);

	const isCurrentUser = (u: UserRecord) => {
		const current = getCurrentUser();
		if (!current) return false;
		const curName = (
			current.username ??
			current.user ??
			current.email ??
			""
		)
			.toString()
			.toLowerCase();
		return curName && curName === (u.username ?? "").toLowerCase();
	};

	const loadUsers = () => {
		if (typeof window === "undefined") return;
		try {
			const raw = localStorage.getItem("roleAccess");
			if (raw) {
				setUsers(JSON.parse(raw));
			} else {
				const defaultRoles: UserRecord[] = [
					{
						id: "1",
						username: "admin",
						password: "admin123",
						role: "admin" as Role,
					},
					{
						id: "2",
						username: "coach",
						password: "coach123",
						role: "coach" as Role,
					},
					{
						id: "3",
						username: "staff",
						password: "staff123",
						role: "staff" as Role,
					},
				];
				localStorage.setItem(
					"roleAccess",
					JSON.stringify(defaultRoles)
				);
				setUsers(defaultRoles);
			}
		} catch (error) {
			console.error("Error loading users:", error);
			setUsers([]);
		}
	};

	useEffect(() => {
		setStorageAvailable(isLocalStorageAvailable());
		if (isLocalStorageAvailable()) {
			try {
				const settings = localStorage.getItem("settings");
				if (settings) {
					const parsedSettings = JSON.parse(settings);
					if (parsedSettings.lowStockThreshold === 0) {
						parsedSettings.lowStockThreshold = 1;
						localStorage.setItem(
							"settings",
							JSON.stringify(parsedSettings)
						);
					}
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
		loadUsers();
	}, []);

	const getCurrentUser = () => {
		try {
			const raw = localStorage.getItem("currentUser");
			if (!raw) return null;
			return JSON.parse(raw);
		} catch {
			return null;
		}
	};

	const saveUsers = (next: UserRecord[]) => {
		try {
			localStorage.setItem("roleAccess", JSON.stringify(next));
			setUsers(next);
		} catch (error) {
			console.error("Error saving users:", error);
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (lowStockThreshold <= 0) {
			toastError(
				"Invalid Input",
				"Low Stock Threshold must be at least 1."
			);
			return;
		}

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

	useEffect(() => {
		if (typeof window === "undefined") return;
		if (lowStockThreshold === 0) {
			setLowStockThreshold(1);
		}
	}, [lowStockThreshold]);

	const handleResetData = async () => {
		const ok = await confirm({
			title: "Reset Data",
			description:
				"Are you sure you want to reset all data? This cannot be undone.",
			confirmText: "Reset",
			cancelText: "Cancel",
			variant: "danger",
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
				history: localStorage.getItem("history")
					? JSON.parse(localStorage.getItem("history")!)
					: [],
				borrows: localStorage.getItem("borrows")
					? JSON.parse(localStorage.getItem("borrows")!)
					: [],
				roleAccess: localStorage.getItem("roleAccess"),
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
			variant: "default",
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

						if (data.history && Array.isArray(data.history)) {
							localStorage.setItem(
								"history",
								JSON.stringify(data.history)
							);
						}

						if (data.borrows && Array.isArray(data.borrows)) {
							localStorage.setItem(
								"borrows",
								JSON.stringify(data.borrows)
							);
						}

						if (data.roleAccess && Array.isArray(data.roleAccess)) {
							localStorage.setItem(
								"roleAccess",
								JSON.stringify(data.roleAccess)
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

	const openAddUserForm = () => {
		setEditingUser(null);
		setFormUsername("");
		setFormPassword("");
		setFormRole("staff");
		setIsUserFormOpen(true);
	};

	const openEditUserForm = (u: UserRecord) => {
		if (isCurrentUser(u)) {
			toastError("Action Forbidden", "You cannot edit your own account.");
			return;
		}
		setEditingUser(u);
		setFormUsername(u.username);
		setFormPassword("");
		setFormRole(u.role);
		setIsUserFormOpen(true);
	};

	const requestPasswordConfirmFor = (action: {
		type: "add" | "edit" | "delete";
		payload?: any;
	}) => {
		setPendingAction(action);
		setPasswordPromptValue("");
		setShowPasswordPrompt(true);
	};

	const performPendingAction = () => {
		const current = getCurrentUser();
		if (!current) {
			toastError("Action Failed", "No current user found.");
			setShowPasswordPrompt(false);
			return;
		}

		const currentId = (
			current.username ??
			current.id ??
			current.user ??
			""
		).toString();

		const userRec = users.find(
			(u) =>
				u.username.toLowerCase() === (currentId || "").toLowerCase() ||
				u.username.toLowerCase() ===
					(current.username ?? "").toLowerCase()
		);
		if (!userRec) {
			toastError("Action Failed", "Unable to verify current user.");
			setShowPasswordPrompt(false);
			return;
		}

		if (passwordPromptValue !== userRec.password) {
			toastError("Authentication Failed", "Incorrect password.");
			return;
		}

		const act = pendingAction;
		if (!act) {
			setShowPasswordPrompt(false);
			return;
		}

		if (act.type === "add") {
			// validate
			if (!formUsername || !formPassword) {
				toastError(
					"Invalid Input",
					"Username and password are required."
				);
				setShowPasswordPrompt(false);
				return;
			}
			// prevent duplicate user
			if (
				users.some(
					(u) =>
						u.username.toLowerCase() === formUsername.toLowerCase()
				)
			) {
				toastError(
					"Duplicate",
					"An account with that username already exists."
				);
				setShowPasswordPrompt(false);
				return;
			}
			const newUser: UserRecord = {
				id: `u_${Date.now()}`,
				username: formUsername,
				password: formPassword,
				role: formRole,
			};
			const next = [...users, newUser];
			saveUsers(next);
			toastSuccess("User Added", "Account created successfully.");
			setIsUserFormOpen(false);
			setShowPasswordPrompt(false);
			return;
		}

		if (act.type === "edit") {
			const payload = act.payload as { id: string };
			const next = users.map((u) =>
				u.id === payload.id
					? {
							...u,
							username: formUsername,
							role: formRole,
							password: formPassword ? formPassword : u.password,
					  }
					: u
			);
			saveUsers(next);
			toastSuccess("User Updated", "Account updated successfully.");
			setIsUserFormOpen(false);
			setShowPasswordPrompt(false);
			return;
		}

		if (act.type === "delete") {
			const payload = act.payload as { id: string };
			const next = users.filter((u) => u.id !== payload.id);
			saveUsers(next);
			toastSuccess("User Deleted", "Account removed.");
			setShowPasswordPrompt(false);
			return;
		}
	};

	const confirmDeleteUser = async (id: string) => {
		const u = users.find((x) => x.id === id);
		if (u && isCurrentUser(u)) {
			toastError(
				"Action Forbidden",
				"You cannot delete your own account."
			);
			return;
		}
		const ok = await confirm({
			title: "Delete Account",
			description:
				"Are you sure you want to delete this account? This cannot be undone.",
			confirmText: "Delete",
			cancelText: "Cancel",
			variant: "danger",
		});
		if (!ok) return;
		requestPasswordConfirmFor({ type: "delete", payload: { id } });
	};

	const submitUserForm = (e?: React.FormEvent) => {
		if (e) e.preventDefault();
		if (editingUser) {
			requestPasswordConfirmFor({
				type: "edit",
				payload: { id: editingUser.id },
			});
		} else {
			requestPasswordConfirmFor({ type: "add" });
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
			<div className="bg-white dark:bg-[#1d1d28]  shadow rounded-lg ">
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
									type="text"
									id="lowStockThreshold"
									value={lowStockThreshold}
									onChange={(e) =>
										setLowStockThreshold(
											parseInt(e.target.value) || 1
										)
									}
									min={1}
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

			<div className="bg-white dark:bg-[#1d1d28]  shadow rounded-lg ">
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

			{/* User Management Card */}
			<div className="bg-white dark:bg-[#1d1d28]  shadow rounded-lg ">
				<div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
					<h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
						Account Management
					</h3>
					<p className="text-sm text-gray-500 dark:text-gray-400">
						Create and manage user accounts
					</p>
				</div>

				<div className="p-6 space-y-4">
					<div className="flex justify-between items-center">
						<p className="text-sm text-gray-500 dark:text-gray-400">
							Admins can add/edit/delete accounts. Actions require
							entering your password for confirmation.
						</p>
						<button
							type="button"
							onClick={openAddUserForm}
							className="inline-flex items-center gap-2 px-3 py-2 border border-transparent rounded-md bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
						>
							<Plus className="h-4 w-4" />
							Add Account
						</button>
					</div>

					{/* users table */}
					<div className="overflow-x-auto">
						<table className="min-w-full text-sm divide-y divide-gray-200 dark:divide-gray-700">
							<thead className="bg-gray-50 dark:bg-[#1d1d28] ">
								<tr>
									<th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300">
										Username
									</th>
									<th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300">
										Role
									</th>
									<th className="px-4 py-2 text-right text-gray-600 dark:text-gray-300">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="bg-white dark:bg-[#1d1d28]  divide-y divide-gray-200 dark:divide-gray-700">
								{users.map((u) => (
									<tr key={u.id}>
										<td className="px-4 py-3 text-gray-800 dark:text-gray-100">
											{u.username}
										</td>
										<td className="px-4 py-3 text-gray-600 dark:text-gray-300">
											{u.role}
										</td>
										<td className="px-4 py-3 text-right">
											<div className="inline-flex gap-2">
												<button
													onClick={() =>
														!isCurrentUser(u) &&
														openEditUserForm(u)
													}
													disabled={isCurrentUser(u)}
													className={`px-2 py-1 rounded-md bg-white border border-gray-300 dark:bg-gray-700 dark:border-gray-600 text-sm text-gray-800 dark:text-gray-100 ${
														isCurrentUser(u)
															? "opacity-50 cursor-not-allowed"
															: "hover:shadow"
													}`}
												>
													<User className="h-4 w-4" />
												</button>
												<button
													onClick={() =>
														!isCurrentUser(u) &&
														confirmDeleteUser(u.id)
													}
													disabled={isCurrentUser(u)}
													className={`px-2 py-1 rounded-md text-sm text-white ${
														isCurrentUser(u)
															? "bg-red-600/50 opacity-50 cursor-not-allowed"
															: "bg-red-600 hover:bg-red-700"
													}`}
												>
													<Trash className="h-4 w-4" />
												</button>
											</div>
										</td>
									</tr>
								))}
								{users.length === 0 && (
									<tr>
										<td
											colSpan={3}
											className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400"
										>
											No accounts
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>
			</div>

			{/* user form modal */}
			{isUserFormOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
					<div className="w-full max-w-md bg-white dark:bg-[#1d1d28]  rounded-lg shadow-lg overflow-hidden">
						<div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
							<h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
								{editingUser ? "Edit Account" : "Add Account"}
							</h3>
						</div>
						<form
							onSubmit={submitUserForm}
							className="p-6 space-y-4"
						>
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
									Username
								</label>
								<input
									type="text"
									value={formUsername}
									onChange={(e) =>
										setFormUsername(e.target.value)
									}
									required
									className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
									{editingUser
										? "New Password (leave blank to keep)"
										: "Password"}
								</label>
								<input
									type="password"
									value={formPassword}
									onChange={(e) =>
										setFormPassword(e.target.value)
									}
									placeholder={
										editingUser
											? "Leave blank to keep current password"
											: ""
									}
									className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
									Role
								</label>
								<select
									value={formRole}
									onChange={(e) =>
										setFormRole(e.target.value as Role)
									}
									className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2"
								>
									<option value="admin">admin</option>
									<option value="coach">coach</option>
									<option value="staff">staff</option>
								</select>
							</div>

							<div className="flex justify-end gap-2">
								<button
									type="button"
									onClick={() => setIsUserFormOpen(false)}
									className="px-3 py-2 rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 dark:text-white"
								>
									Cancel
								</button>
								<button
									type="submit"
									className="px-3 py-2 rounded-md bg-blue-600 text-white"
								>
									Save
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* password prompt modal */}
			{showPasswordPrompt && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
					<div className="w-full max-w-sm bg-white dark:bg-[#1d1d28]  rounded-lg shadow-lg overflow-hidden p-6">
						<h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
							Confirm with Your Password
						</h4>
						<p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
							Enter your password to confirm this action.
						</p>
						<input
							type="password"
							value={passwordPromptValue}
							onChange={(e) =>
								setPasswordPromptValue(e.target.value)
							}
							className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 mb-4"
						/>
						<div className="flex justify-end gap-2">
							<button
								onClick={() => {
									setShowPasswordPrompt(false);
									setPendingAction(null);
								}}
								className="px-3 py-2 rounded-md dark:text-white bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
							>
								Cancel
							</button>
							<button
								onClick={performPendingAction}
								className="px-3 py-2 rounded-md bg-blue-600 text-white"
							>
								Confirm
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
