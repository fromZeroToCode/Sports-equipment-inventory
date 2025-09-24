"use client";
import React from "react";
import { logoutUser } from "@/lib/dashboard";
import { useRouter } from "next/navigation";
import { toastError, toastSuccess } from "@/composables/toast";

export default function DashboardPage() {
	const router = useRouter();
	const handleLogout = async () => {
		try {
			const success = await logoutUser();
			if (success) {
				toastSuccess("Logged out", "You have been logged out successfully.");
				router.push("/login");
				return;
			}
			toastError("Logout failed", "An error occurred while logging out.");
			return;
		} catch (error) {
			toastError("Logout failed", "An error occurred while logging out.");
		}
	};

	return (
		<div>
			<h1>Dashboard</h1>
			<button onClick={handleLogout}>Logout</button>
			<p>Welcome to the dashboard!</p>
		</div>
	);
}
