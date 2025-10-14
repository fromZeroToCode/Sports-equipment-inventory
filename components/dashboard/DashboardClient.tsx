"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
	Menu,
	LogOut,
	User,
	Home,
	Package,
	Tag,
	Truck,
	ArrowLeftRight,
	BarChart,
	History,
	Settings,
	Lock,
	Bell,
} from "lucide-react";
import { logoutUser } from "@/lib/dashboard";
import { toastError, toastSuccess } from "@/hooks/useToast";
import { useSessionRedirectToLogin } from "@/hooks/useSessionRedirect";

import DarkModeButton from "../ui/DarkModeButton";

import HomeComponent from "@/components/dashboard/homeComponent";
import ItemsComponent from "@/components/dashboard/itemsComponent";
import CategoriesComponent from "@/components/dashboard/categoriesComponent";
import SupplierComponent from "@/components/dashboard/supplierComponent";
import BorrowComponent from "@/components/dashboard/borrowComponent";
import ReportsComponent from "@/components/dashboard/reportsComponent";
import HistoryComponent from "@/components/dashboard/historyComponent";
import SettingsComponent from "@/components/dashboard/settingsComponent";
import NotificationComponent from "@/components/dashboard/notificationComponent";
import { getUnreadNotificationsCount } from "@/utils/manipulateData";

const ROLE_PERMISSIONS: Record<string, string[]> = {
	admin: [
		"dashboard",
		"items",
		"categories",
		"suppliers",
		"borrows",
		"reports",
		"history",
		"notifications",
		"settings",
	],
	staff: ["dashboard", "items", "categories", "suppliers", "borrows"],
	coach: ["dashboard", "items", "categories", "suppliers", "borrows"],
};

import Image from "next/image";

import { clearAllData } from "@/utils/localStorageManipulation";

// mock data
import generateMockData from "@/utils/generateMockData";

const TAB_MAP: Record<string, string> = {
	dashboard: "Dashboard",
	items: "Items",
	categories: "Categories",
	suppliers: "Suppliers",
	borrows: "Borrows",
	reports: "Reports",
	history: "History",
	notifications: "Notifications",
	settings: "Settings",
};

export default function DashboardClient() {
	useSessionRedirectToLogin();
	const router = useRouter();
	let searchParams;
	try {
		searchParams = useSearchParams();
	} catch {
		searchParams = null;
	}
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
	const avatarMenuRef = useRef<HTMLDivElement | null>(null);

	const initialTab = searchParams?.get("tab") || "dashboard";
	const [activeTab, setActiveTab] = useState(initialTab);
	const [currentUserName, setCurrentUserName] = useState<string>("");

	const [currentRole, setCurrentRole] = useState<string>("guest");
	const [isDarkMode, setIsDarkMode] = useState(false);
	const [unreadCount, setUnreadCount] = useState(0);

	useEffect(() => {
		if (typeof window === "undefined") return;
		try {
			const raw = localStorage.getItem("currentUser");
			const parsed = raw ? JSON.parse(raw) : null;
			const role = parsed?.role ?? "guest";
			const username = parsed?.username ?? "Guest";
			setCurrentUserName(username);
			setCurrentRole(role);

			const allowed = ROLE_PERMISSIONS[role] ?? ["dashboard"];
			if (!allowed.includes(initialTab)) {
				setActiveTab("dashboard");
				router.push("/dashboard?tab=dashboard", { scroll: false });
			}
		} catch {
			setCurrentRole("guest");
		}
	}, []);

	// Dark mode detection
	useEffect(() => {
		const updateDarkMode = () => {
			setIsDarkMode(document.documentElement.classList.contains("dark"));
		};

		// Initial check
		updateDarkMode();

		// Watch for changes
		const observer = new MutationObserver(updateDarkMode);
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class"],
		});

		return () => observer.disconnect();
	}, []);

	// Load unread notifications count
	useEffect(() => {
		const updateUnreadCount = () => {
			setUnreadCount(getUnreadNotificationsCount());
		};

		updateUnreadCount();

		// Update count every 30 seconds
		const interval = setInterval(updateUnreadCount, 30000);

		return () => clearInterval(interval);
	}, [activeTab]); // Refresh when tab changes

	const navItems = [
		{
			name: "Dashboard",
			value: "dashboard",
			icon: <Home className="h-5 w-5" />,
		},
		{
			name: "Items",
			value: "items",
			icon: <Package className="h-5 w-5" />,
		},
		{
			name: "Suppliers",
			value: "suppliers",
			icon: <Truck className="h-5 w-5" />,
		},
		{
			name: "Categories",
			value: "categories",
			icon: <Tag className="h-5 w-5" />,
		},
		{
			name: "Borrows",
			value: "borrows",
			icon: <ArrowLeftRight className="h-5 w-5" />,
		},
		{
			name: "Reports",
			value: "reports",
			icon: <BarChart className="h-5 w-5" />,
		},
		{
			name: "History",
			value: "history",
			icon: <History className="h-5 w-5" />,
		},
		{
			name: "Notifications",
			value: "notifications",
			icon: <Bell className="h-5 w-5" />,
		},
		{
			name: "Settings",
			value: "settings",
			icon: <Settings className="h-5 w-5" />,
		},
	];

	const onMenuClick = () => setSidebarOpen((s) => !s);

	const handleLogout = async () => {
		try {
			const success = await logoutUser();
			if (success) {
				toastSuccess(
					"Logged out",
					"You have been logged out successfully."
				);
				router.push("/");
				return;
			}
			toastError("Logout failed", "An error occurred while logging out.");
		} catch {
			toastError("Logout failed", "An error occurred while logging out.");
		}
	};

	const handleTabClick = (tab: string) => {
		const allowed = ROLE_PERMISSIONS[currentRole] ?? ["dashboard"];
		if (!allowed.includes(tab)) {
			toastError("Unauthorized", "Your role cannot access this section.");
			setActiveTab("dashboard");
			router.push(`/dashboard?tab=dashboard`, { scroll: false });
			return;
		}

		setActiveTab(tab);
		if (typeof window !== "undefined") {
			router.push(`/dashboard?tab=${tab}`, { scroll: false });
		}
	};

	useEffect(() => {
		if (searchParams) {
			const newTab = searchParams.get("tab") || "dashboard";
			setActiveTab(newTab);
		}
	}, [searchParams]);

	// close avatar menu when clicking outside
	useEffect(() => {
		function onDocClick(e: MouseEvent) {
			if (
				avatarMenuOpen &&
				avatarMenuRef.current &&
				!avatarMenuRef.current.contains(e.target as Node)
			) {
				setAvatarMenuOpen(false);
			}
		}
		document.addEventListener("click", onDocClick);
		return () => document.removeEventListener("click", onDocClick);
	}, [avatarMenuOpen]);

	useEffect(() => {
		if (typeof window !== "undefined" && searchParams) {
			const tab = (searchParams.get("tab") ?? "dashboard").toLowerCase();
			document.title = `Sports Equipment Inventory | ${
				TAB_MAP[tab] ?? "Dashboard"
			}`;
		}
	}, [searchParams]);

	const renderActiveTab = () => {
		switch (activeTab) {
			case "dashboard":
				return <HomeComponent />;
			case "items":
				return <ItemsComponent />;
			case "categories":
				return <CategoriesComponent />;
			case "suppliers":
				return <SupplierComponent />;
			case "borrows":
				return <BorrowComponent isDarkMode={isDarkMode} />;
			case "reports":
				return <ReportsComponent />;
			case "history":
				return <HistoryComponent isDarkMode={isDarkMode} />;
			case "notifications":
				return <NotificationComponent isDarkMode={isDarkMode} />;
			case "settings":
				return <SettingsComponent />;
			default:
				return <HomeComponent />;
		}
	};

	// generate mock data
	const handleGenerateMockData = () => {
		if (
			typeof window === "undefined" ||
			typeof localStorage === "undefined"
		) {
			toastError(
				"Error",
				"Cannot generate mock data: localStorage is not available."
			);
			return;
		}

		generateMockData();
		window.location.reload();
	};

	return (
		<div className="flex h-screen bg-[#f3f3f3] dark:bg-[#11111d] ">
			{/* Sidebar */}
			<aside
				className={`fixed inset-y-0 left-0 w-64 bg-white  border-r border-gray-200 dark:bg-[#1d1d28] dark:border-gray-800 transform z-30 transition-transform duration-200 ease-in-out
                    ${
						sidebarOpen ? "translate-x-0" : "-translate-x-full"
					} lg:translate-x-0`}
				aria-hidden={!sidebarOpen && true}
			>
				<div className="flex items-center h-16 px-4 bg-blue-600 dark:bg-inherit justify-between">
					<div className="flex items-center">
						<Image
							src="/Sports-equipment-inventory/logo.svg"
							alt="Logo"
							width={58}
							height={21}
							className="p-4"
						/>
						<h1 className="text-xl font-bold text-white">
							GearSync
						</h1>
					</div>
					<button
						type="button"
						className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
						onClick={onMenuClick}
					>
						<span className="sr-only">Open sidebar</span>
						<Menu className="h-6 w-6" aria-hidden="true" />
					</button>
				</div>

				<div className="flex-1 flex flex-col overflow-y-auto">
					<nav className="flex-1 px-2 py-4">
						<ul className="space-y-1">
							{navItems
								.filter((item) =>
									(
										ROLE_PERMISSIONS[currentRole] ?? []
									).includes(item.value)
								)
								.map((item) => {
									const allowed =
										ROLE_PERMISSIONS[currentRole]?.includes(
											item.value
										) ?? false;
									return (
										<li key={item.name}>
											<button
												onClick={() =>
													handleTabClick(item.value)
												}
												disabled={!allowed}
												className={`w-full flex items-center px-4 py-2 text-sm font-medium text-left rounded-md transition-colors ${
													activeTab === item.value
														? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
														: "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
												} ${
													!allowed
														? "opacity-50 cursor-not-allowed"
														: ""
												}`}
											>
												<span className="mr-3">
													{item.icon}
												</span>
												<span className="flex-1">
													{item.name}
												</span>
												{!allowed && (
													<span title="Locked">
														<Lock className="h-4 w-4 text-gray-400" />
													</span>
												)}
											</button>
										</li>
									);
								})}
							<li>
								<button
									onClick={handleLogout}
									className="w-full flex items-center px-4 py-2 text-sm font-medium text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
								>
									<span className="mr-3">
										<LogOut className="h-5 w-5" />
									</span>
									<span>Log out</span>
								</button>
							</li>
						</ul>
					</nav>
				</div>
			</aside>

			{/* Main content area */}
			<div className="flex-1 flex flex-col lg:pl-64 w-full ">
				{/* header */}
				<header className="bg-white shadow-sm z-10 dark:bg-[#1d1d28] border-b border-gray-200 dark:border-gray-800">
					<div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
						<button
							type="button"
							className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors"
							onClick={onMenuClick}
						>
							<span className="sr-only">Open sidebar</span>
							<Menu className="h-6 w-6" aria-hidden="true" />
						</button>

						<h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 hidden lg:block">
							Sports Inventory App
						</h2>

						<div className="flex items-center">
							<div className="flex items-center mr-4">
								{/* Notification Bell */}
								<button
									onClick={() =>
										handleTabClick("notifications")
									}
									className="relative p-2 text-gray-500 dark:text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors mr-2"
									aria-label="Notifications"
								>
									<Bell className="h-5 w-5" />
									{unreadCount > 0 && (
										<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
											{unreadCount > 9
												? "9+"
												: unreadCount}
										</span>
									)}
								</button>

								<div className="mr-4 flex items-center ">
									<DarkModeButton />
								</div>
								{/* Avatar + dropdown */}
								<div className="relative" ref={avatarMenuRef}>
									<div
										onClick={() =>
											setAvatarMenuOpen((s) => !s)
										}
										className="flex flex-row items-center cursor-pointer"
									>
										<button
											type="button"
											className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500"
											aria-expanded={avatarMenuOpen}
										>
											<User className="h-5 w-5 text-gray-500 dark:text-gray-300" />
										</button>
										<span className="ml-2 hidden sm:inline-block text-sm font-semibold text-gray-700 dark:text-gray-300">
											{currentUserName || currentRole}
										</span>
									</div>

									{avatarMenuOpen && (
										<div className="absolute right-0 mt-2 w-44 bg-white dark:bg-[#1d1d28] border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
											<div className="py-2">
												<button
													onClick={() => {
														// open settings tab
														setAvatarMenuOpen(
															false
														);
														setActiveTab(
															"settings"
														);
														router.push(
															`/dashboard?tab=settings`,
															{ scroll: false }
														);
													}}
													className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
												>
													<Settings className="h-4 w-4 mr-1" />
													<span>Settings</span>
												</button>
												<hr className="my-1 border-gray-100 dark:border-gray-700" />
												<button
													onClick={() => {
														setAvatarMenuOpen(
															false
														);
														handleLogout();
													}}
													className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
												>
													<LogOut className="h-4 w-4 mr-1" />
													<span>Log out</span>
												</button>
											</div>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				</header>

				<main className="p-6 overflow-auto w-full max-[445px]:p-4">
					{renderActiveTab()}
				</main>
			</div>

			{sidebarOpen && (
				<div className="lg:hidden fixed inset-0 bg-gray-800/50 dark:bg-gray-900/50 w-screen h-screen z-20"></div>
			)}

			{/* button for generating data */}
			<button
				onClick={handleGenerateMockData}
				className="text-xs fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white p-2 rounded-md shadow-md transition-colors"
			>
				Generate Mock Data
			</button>

			<button
				onClick={() => {
					clearAllData();
					window.location.reload();
				}}
				className="text-xs fixed bottom-4 right-56 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white p-2 rounded-md shadow-md transition-colors"
			>
				delete all data
			</button>
		</div>
	);
}
