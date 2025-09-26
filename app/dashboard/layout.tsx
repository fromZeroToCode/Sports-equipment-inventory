import { Metadata } from "next";

const TAB_MAP: Record<string, string> = {
	items: "Items",
	categories: "Categories",
	suppliers: "Suppliers",
	reports: "Reports",
	settings: "Settings",
	dashboard: "Dashboard",
};

export async function generateMetadata({
	searchParams,
}: {
	searchParams: any;
}): Promise<Metadata> {
	const tab =
		typeof searchParams?.tab === "string"
			? searchParams.tab.toLowerCase()
			: "";
	const label = TAB_MAP[tab] ?? "Dashboard";
	return {
		title: `Sports Equipment Inventory | ${label}`,
	};
}

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
