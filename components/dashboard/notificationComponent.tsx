"use client";
import React, { useState, useEffect } from "react";
import { NotificationRecord } from "@/utils/types";
import {
	getNotifications,
	markNotificationAsRead,
	markAllNotificationsAsRead,
	deleteNotification,
} from "@/utils/manipulateData";
import { Bell, CheckCheck, Trash2, Eye } from "lucide-react";
import { useConfirm } from "@/components/ui/ConfirmProvider";

interface NotificationComponentProps {
	isDarkMode: boolean;
}

const NotificationComponent: React.FC<NotificationComponentProps> = ({
	isDarkMode,
}) => {
	const confirm = useConfirm();
	const [notifications, setNotifications] = useState<NotificationRecord[]>(
		[]
	);
	const [filteredNotifications, setFilteredNotifications] = useState<
		NotificationRecord[]
	>([]);
	const [filters, setFilters] = useState({
		type: "",
		isRead: "",
		search: "",
	});

	// Pagination
	const PAGE_SIZE = 10;
	const [page, setPage] = useState(1);
	const totalPages = Math.max(
		1,
		Math.ceil(filteredNotifications.length / PAGE_SIZE)
	);
	const pagedNotifications = filteredNotifications.slice(
		(page - 1) * PAGE_SIZE,
		page * PAGE_SIZE
	);

	// Load notifications
	const loadNotifications = () => {
		const loaded = getNotifications();
		setNotifications(loaded);
	};

	useEffect(() => {
		loadNotifications();
		function onNotificationsChanged() {
			loadNotifications();
		}
		window.addEventListener(
			"notifications:changed",
			onNotificationsChanged
		);
		return () =>
			window.removeEventListener(
				"notifications:changed",
				onNotificationsChanged
			);
	}, []);

	// Reset page when filteredNotifications changes
	useEffect(() => {
		setPage(1);
	}, [filteredNotifications]);

	// Apply filters
	useEffect(() => {
		let filtered = [...notifications];

		// Filter by type
		if (filters.type) {
			filtered = filtered.filter((notif) => notif.type === filters.type);
		}

		// Filter by read status
		if (filters.isRead === "read") {
			filtered = filtered.filter((notif) => notif.isRead);
		} else if (filters.isRead === "unread") {
			filtered = filtered.filter((notif) => !notif.isRead);
		}

		// Filter by search term
		if (filters.search) {
			const searchTerm = filters.search.toLowerCase();
			filtered = filtered.filter(
				(notif) =>
					notif.title.toLowerCase().includes(searchTerm) ||
					notif.message.toLowerCase().includes(searchTerm) ||
					notif.createdBy.toLowerCase().includes(searchTerm)
			);
		}

		setFilteredNotifications(filtered);
	}, [notifications, filters]);

	// Clear filters
	const clearFilters = () => {
		setFilters({
			type: "",
			isRead: "",
			search: "",
		});
	};

	// Mark notification as read
	const handleMarkAsRead = (id: string) => {
		markNotificationAsRead(id);
		loadNotifications();
	};

	// Mark all as read
	const handleMarkAllAsRead = async () => {
		const ok = await confirm({
			title: "Mark All as Read",
			description:
				"Are you sure you want to mark all notifications as read?",
			confirmText: "Mark All",
			cancelText: "Cancel",
			variant: "default",
		});
		if (!ok) return;

		markAllNotificationsAsRead();
		loadNotifications();
	};

	// Delete notification
	const handleDelete = async (id: string) => {
		const ok = await confirm({
			title: "Delete Notification",
			description:
				"Are you sure you want to delete this notification? This cannot be undone.",
			confirmText: "Delete",
			cancelText: "Cancel",
			variant: "danger",
		});
		if (!ok) return;

		deleteNotification(id);
		loadNotifications();
	};

	// Format date for display
	const formatDateTime = (dateString: string) => {
		return new Date(dateString).toLocaleString();
	};

	// Get notification type color
	const getTypeColor = (type: string) => {
		switch (type) {
			case "borrow":
				return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
			case "return":
				return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
			case "overdue":
				return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
			case "low_stock":
				return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
			default:
				return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
		}
	};

	// Get unique types for filter dropdown
	const uniqueTypes = [...new Set(notifications.map((notif) => notif.type))];

	const unreadCount = notifications.filter((n) => !n.isRead).length;

	return (
		<div>
			<h1 className="text-2xl font-bold text-[#1d1d28] dark:text-gray-100 mb-6">
				Notifications {unreadCount > 0 && `(${unreadCount} unread)`}
			</h1>
			<div>
				<p
					className={`${
						isDarkMode ? "text-gray-300" : "text-gray-800"
					} mb-6`}
				>
					View all system notifications. Total notifications:{" "}
					{filteredNotifications.length}
				</p>

				{/* Filters */}
				<div
					className={`rounded-lg border p-4 mb-6 ${
						isDarkMode
							? "border-none bg-[#1d1d29]"
							: "border-gray-300 bg-gray-50"
					}`}
				>
					<h3 className="text-lg font-semibold mb-4 dark:text-white">
						Filters
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						{/* Type Filter */}
						<div>
							<label
								className={`block text-sm font-medium mb-1 ${
									isDarkMode
										? "text-gray-300"
										: "text-gray-700"
								}`}
							>
								Type
							</label>
							<select
								value={filters.type}
								onChange={(e) =>
									setFilters({
										...filters,
										type: e.target.value,
									})
								}
								className={`w-full px-3 py-2 rounded-md border text-sm ${
									isDarkMode
										? "bg-[#2A2A3B] border-gray-800 text-white"
										: "bg-white border-gray-300 text-gray-900"
								} focus:outline-none focus:ring-2 focus:ring-blue-500`}
							>
								<option value="">All Types</option>
								{uniqueTypes.map((type) => (
									<option key={type} value={type}>
										{type.replace("_", " ")}
									</option>
								))}
							</select>
						</div>

						{/* Read Status Filter */}
						<div>
							<label
								className={`block text-sm font-medium mb-1 ${
									isDarkMode
										? "text-gray-300"
										: "text-gray-700"
								}`}
							>
								Status
							</label>
							<select
								value={filters.isRead}
								onChange={(e) =>
									setFilters({
										...filters,
										isRead: e.target.value,
									})
								}
								className={`w-full px-3 py-2 rounded-md border text-sm ${
									isDarkMode
										? "bg-[#2A2A3B] border-gray-800 text-white"
										: "bg-white border-gray-300 text-gray-900"
								} focus:outline-none focus:ring-2 focus:ring-blue-500`}
							>
								<option value="">All Status</option>
								<option value="unread">Unread</option>
								<option value="read">Read</option>
							</select>
						</div>

						{/* Search Filter */}
						<div className="md:col-span-2">
							<label
								className={`block text-sm font-medium mb-1 ${
									isDarkMode
										? "text-gray-300"
										: "text-gray-700"
								}`}
							>
								Search
							</label>
							<input
								type="text"
								placeholder="Search notifications..."
								value={filters.search}
								onChange={(e) =>
									setFilters({
										...filters,
										search: e.target.value,
									})
								}
								className={`w-full px-3 py-2 rounded-md border text-sm ${
									isDarkMode
										? "bg-[#2A2A3B] border-gray-800 text-white"
										: "bg-white border-gray-300 text-gray-900"
								} focus:outline-none focus:ring-2 focus:ring-blue-500`}
							/>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="mt-4">
						<div className="flex flex-wrap gap-2">
							<button
								onClick={clearFilters}
								className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
									isDarkMode
										? "bg-[#2A2A3B] text-gray-300 hover:bg-[#2A2A3B]"
										: "bg-gray-200 text-gray-700 hover:bg-gray-300"
								}`}
							>
								Clear Filters
							</button>

							{unreadCount > 0 && (
								<button
									onClick={handleMarkAllAsRead}
									className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
										isDarkMode
											? "bg-blue-500 text-white hover:bg-blue-600"
											: "bg-blue-200 text-blue-900 hover:bg-blue-300"
									}`}
								>
									<CheckCheck className="h-4 w-4 inline mr-1" />
									Mark All Read
								</button>
							)}
						</div>
					</div>
				</div>

				{/* Notifications List */}
				<div
					className={`p-2 rounded-xl ${
						isDarkMode
							? "bg-[#1d1d28] text-white"
							: "bg-white text-gray-900"
					}`}
				>
					<div className="mb-6">
						<div
							className={`rounded-xl border overflow-hidden ${
								isDarkMode ? "border-none" : "border-none"
							}`}
						>
							{filteredNotifications.length === 0 ? (
								<div
									className={`p-8 text-center ${
										isDarkMode
											? "bg-[#1d1d29]"
											: "bg-gray-50"
									}`}
								>
									<Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
									<p
										className={
											isDarkMode
												? "text-gray-400"
												: "text-gray-800"
										}
									>
										No notifications found
									</p>
								</div>
							) : (
								<div className="space-y-2">
									{pagedNotifications.map((notification) => (
										<div
											key={notification.id}
											className={`p-4 rounded-lg border transition-colors ${
												notification.isRead
													? isDarkMode
														? "bg-[#1d1d29] border-gray-800"
														: "bg-gray-50 border-gray-200"
													: isDarkMode
													? "bg-[#2A2A3B] border-blue-800"
													: "bg-blue-50 border-blue-200"
											}`}
										>
											<div className="flex items-start justify-between">
												<div className="flex-1 min-w-0">
													<div className="flex items-center gap-2 mb-2">
														<span
															className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
																notification.type
															)}`}
														>
															{notification.type.replace(
																"_",
																" "
															)}
														</span>
														{!notification.isRead && (
															<span className="w-2 h-2 bg-blue-500 rounded-full"></span>
														)}
													</div>
													<h4
														className={`font-semibold text-sm mb-1 ${
															isDarkMode
																? "text-gray-100"
																: "text-gray-900"
														}`}
													>
														{notification.title}
													</h4>
													<p
														className={`text-sm mb-2 ${
															isDarkMode
																? "text-gray-300"
																: "text-gray-600"
														}`}
													>
														{notification.message}
													</p>
													<div
														className={`text-xs ${
															isDarkMode
																? "text-gray-400"
																: "text-gray-500"
														}`}
													>
														{formatDateTime(
															notification.timestamp
														)}{" "}
														• by{" "}
														{notification.createdBy}
													</div>
												</div>
												<div className="flex gap-2 ml-4">
													{!notification.isRead && (
														<button
															onClick={() =>
																handleMarkAsRead(
																	notification.id
																)
															}
															className="p-1 rounded text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/30"
															title="Mark as read"
														>
															<Eye className="h-4 w-4" />
														</button>
													)}
													<button
														onClick={() =>
															handleDelete(
																notification.id
															)
														}
														className="p-1 rounded text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/30"
														title="Delete notification"
													>
														<Trash2 className="h-4 w-4" />
													</button>
												</div>
											</div>
										</div>
									))}

									{/* Pagination controls */}
									<div className="px-4 py-3 bg-white dark:bg-[#1d1d28] border-t border-gray-200 dark:border-gray-700 flex items-center justify-between max-sm:flex-col gap-3">
										<div className="text-sm text-gray-700 dark:text-gray-300">
											Showing{" "}
											<span className="font-medium">
												{filteredNotifications.length ===
												0
													? 0
													: (page - 1) * PAGE_SIZE +
													  1}
											</span>{" "}
											to{" "}
											<span className="font-medium">
												{Math.min(
													page * PAGE_SIZE,
													filteredNotifications.length
												)}
											</span>{" "}
											of{" "}
											<span className="font-medium">
												{filteredNotifications.length}
											</span>{" "}
											results
										</div>
										<div className="flex items-center space-x-2">
											<button
												onClick={() =>
													setPage((p) =>
														Math.max(1, p - 1)
													)
												}
												disabled={page === 1}
												className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-600"
											>
												Previous
											</button>

											<div className="text-sm text-gray-700 dark:text-gray-300">
												Page{" "}
												<span className="font-medium">
													{page}
												</span>{" "}
												of{" "}
												<span className="font-medium">
													{totalPages}
												</span>
											</div>

											<button
												onClick={() =>
													setPage((p) =>
														Math.min(
															totalPages,
															p + 1
														)
													)
												}
												disabled={page === totalPages}
												className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-600"
											>
												Next
											</button>
										</div>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default NotificationComponent;
