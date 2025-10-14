"use client";
import React, { useState, useEffect } from "react";
import { AlertTriangle, Clock, User, Calendar } from "lucide-react";
import { BorrowRecord } from "@/utils/types";
import { getOverdueBorrows } from "@/utils/manipulateData";
import { useRouter } from "next/navigation";

interface OverdueBorrowsAlertProps {
	limit?: number;
}

const OverdueBorrowsAlert: React.FC<OverdueBorrowsAlertProps> = ({
	limit = 5,
}) => {
	const router = useRouter();
	const [overdueBorrows, setOverdueBorrows] = useState<BorrowRecord[]>([]);

	useEffect(() => {
		const loadOverdueBorrows = () => {
			const overdueItems = getOverdueBorrows();
			setOverdueBorrows(overdueItems.slice(0, limit));
		};

		loadOverdueBorrows();
		// Refresh every 30 seconds to sync with notification check
		const interval = setInterval(loadOverdueBorrows, 30000);
		return () => clearInterval(interval);
	}, [limit]);

	// Calculate days overdue
	const getDaysOverdue = (expectedReturnDate: string): number => {
		const today = new Date();
		const returnDate = new Date(expectedReturnDate);
		const diffTime = today.getTime() - returnDate.getTime();
		return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
	};

	// Format date for display
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString();
	};

	const handleViewAll = () => {
		router.push("/dashboard?tab=borrows");
	};

	if (overdueBorrows.length === 0) {
		return (
			<div className="bg-white dark:bg-[#1d1d28] rounded-lg shadow dark:shadow-gray-700/30 p-6">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
						<AlertTriangle className="h-5 w-5 text-green-500 mr-2" />
						Overdue Items
					</h3>
				</div>
				<div className="text-center py-8">
					<div className="text-green-500 mb-2">
						<AlertTriangle className="h-12 w-12 mx-auto opacity-50" />
					</div>
					<p className="text-gray-500 dark:text-gray-400 text-sm">
						No overdue items! All borrows are on time.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-white dark:bg-[#1d1d28] rounded-lg shadow dark:shadow-gray-700/30 p-6">
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
					<AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
					Overdue Items ({overdueBorrows.length})
				</h3>
				{overdueBorrows.length > 0 && (
					<button
						onClick={handleViewAll}
						className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
					>
						View All
					</button>
				)}
			</div>

			<div className="space-y-3">
				{overdueBorrows.map((borrow) => (
					<div
						key={borrow.id}
						className="flex items-start justify-between p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
					>
						<div className="flex-1">
							<div className="flex items-center gap-2 mb-1">
								<h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
									{borrow.itemName}
								</h4>
								<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">
									{getDaysOverdue(borrow.expectedReturnDate)}{" "}
									days overdue
								</span>
							</div>
							<div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
								<div className="flex items-center gap-1">
									<User className="h-3 w-3" />
									<span>{borrow.borrowerName}</span>
								</div>
								<div className="flex items-center gap-1">
									<Calendar className="h-3 w-3" />
									<span>
										Due:{" "}
										{formatDate(borrow.expectedReturnDate)}
									</span>
								</div>
								<div className="flex items-center gap-1">
									<span>Qty: {borrow.quantityBorrowed}</span>
								</div>
							</div>
						</div>
						<div className="flex-shrink-0 ml-2">
							<Clock className="h-4 w-4 text-red-500" />
						</div>
					</div>
				))}
			</div>

			{overdueBorrows.length === limit && (
				<div className="mt-4 text-center">
					<button
						onClick={handleViewAll}
						className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
					>
						View all overdue items →
					</button>
				</div>
			)}
		</div>
	);
};

export default OverdueBorrowsAlert;
