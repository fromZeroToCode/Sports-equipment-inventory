export const revalidate = 0;

import React, { Suspense } from "react";
import DashboardClient from "../../components/dashboard/DashboardClient";

export default function Page() {
	return (
		<Suspense fallback={<div className="p-8">Loading dashboard...</div>}>
			<DashboardClient />
		</Suspense>
	);
}
