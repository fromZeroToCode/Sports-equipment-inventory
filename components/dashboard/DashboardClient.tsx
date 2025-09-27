"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
	Menu,
	LogOut,
	User,
	Home,
	Package,
	Tag,
	Truck,
	BarChart,
	Settings,
} from "lucide-react";
import { logoutUser } from "@/lib/dashboard";
import { toastError, toastSuccess } from "@/hooks/useToast";
import { useSessionRedirectToLogin } from "@/hooks/useSessionRedirect";

import HomeComponent from "@/components/dashboard/homeComponent";
import ItemsComponent from "@/components/dashboard/itemsComponent";
import CategoriesComponent from "@/components/dashboard/categoriesComponent";
import SupplierComponent from "@/components/dashboard/supplierComponent";
import ReportsComponent from "@/components/dashboard/reportsComponent";
import SettingsComponent from "@/components/dashboard/settingsComponent";

import { clearAllData } from "@/utils/localStorageManipulation";

// mock data
import generateMockData from "@/utils/generateMockData";

const TAB_MAP: Record<string, string> = {
	findroute: "Find Route",
	traffics: "Traffics",
	reports: "Reports",
	settings: "Settings",
	dashboard: "Dashboard",
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

	const initialTab = searchParams?.get("tab") || "dashboard";
	const [activeTab, setActiveTab] = useState(initialTab);

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
			name: "Categories",
			value: "categories",
			icon: <Tag className="h-5 w-5" />,
		},
		{
			name: "Suppliers",
			value: "suppliers",
			icon: <Truck className="h-5 w-5" />,
		},
		{
			name: "Reports",
			value: "reports",
			icon: <BarChart className="h-5 w-5" />,
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
			case "reports":
				return <ReportsComponent />;
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
		<div className="flex h-screen bg-gray-100">
			{/* Sidebar */}
			<aside
				className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 transform z-30 transition-transform duration-200 ease-in-out
                    ${
						sidebarOpen ? "translate-x-0" : "-translate-x-full"
					} lg:translate-x-0`}
				aria-hidden={!sidebarOpen && true}
			>
				<div className="flex items-center h-16 px-4 bg-blue-600 justify-between">
					<h1 className="text-xl font-bold text-white">
						GearSync
					</h1>
					<button
						type="button"
						className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-white  hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
						onClick={onMenuClick}
					>
						<span className="sr-only">Open sidebar</span>
						<Menu className="h-6 w-6" aria-hidden="true" />
					</button>
				</div>

				<div className="flex-1 flex flex-col overflow-y-auto">
					<nav className="flex-1 px-2 py-4">
						<ul className="space-y-1">
							{navItems.map((item) => (
								<li key={item.name}>
									<button
										onClick={() =>
											handleTabClick(item.value)
										}
										className={`w-full flex items-center px-4 py-2 text-sm font-medium text-left rounded-md ${
											activeTab === item.value
												? "bg-blue-100"
												: "hover:bg-gray-100 "
										}`}
									>
										<span className="mr-3">
											{item.icon}
										</span>
										<span>{item.name}</span>
									</button>
								</li>
							))}
							<li>
								<button
									onClick={handleLogout}
									className="w-full flex items-center px-4 py-2 text-sm font-medium text-left hover:bg-gray-100 rounded-md"
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
				<header className="bg-white shadow-sm z-10">
					<div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
						<button
							type="button"
							className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
							onClick={onMenuClick}
						>
							<span className="sr-only">Open sidebar</span>
							<Menu className="h-6 w-6" aria-hidden="true" />
						</button>

						<h2 className="text-xl font-semibold text-gray-800 hidden lg:block">
							Sports Inventory App
						</h2>

						<div className="flex items-center">
							<div className="flex items-center mr-4">
								<div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
									<User className="h-5 w-5 text-gray-500" />
								</div>
								<span className="ml-2 text-sm font-semibold text-gray-700">
									admin
								</span>
							</div>
							<button
								onClick={handleLogout}
								className="inline-flex items-center p-2 text-gray-500 rounded-full hover:bg-gray-100"
								aria-label="Log out"
							>
								<LogOut className="h-5 w-5" />
							</button>
						</div>
					</div>
				</header>

				<main className="p-6 overflow-auto w-full max-[445px]:p-4">
					{renderActiveTab()}
				</main>
			</div>

			{sidebarOpen && (
				<div className="lg:hidden fixed inset-0 bg-gray-800/50 w-screen h-screen z-20"></div>
			)}

			{/* button for generating data */}
			<button
				onClick={handleGenerateMockData}
				className="text-xs fixed bottom-4 right-4 bg-blue-600 text-white p-2 rounded-md shadow-md"
			>
				Generate Mock Data
			</button>

			<button
				onClick={() => {
					clearAllData();
					window.location.reload();
				}}
				className="text-xs fixed bottom-4 right-56 bg-blue-600 text-white p-2 rounded-md shadow-md"
			>
				delete all data
			</button>
		</div>
	);
}
