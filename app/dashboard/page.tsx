import React, { Suspense } from "react";
import DashboardClient from "@/components/dashboard/DashboardClient";

function DashboardFallback() {
	return (
		<div className="flex h-screen bg-gray-100">
			<div className="flex-1 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-pulse">
						<div className="h-8 bg-gray-300 rounded w-48 mx-auto mb-4"></div>
						<div className="h-4 bg-gray-300 rounded w-32 mx-auto"></div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default function DashboardPage() {
	return (
		<Suspense fallback={<DashboardFallback />}>
			<DashboardClient />
		</Suspense>
	);
}
