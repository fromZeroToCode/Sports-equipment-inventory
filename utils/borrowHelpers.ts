export function isBorrowOverdue(borrow: {
	expectedReturnDate?: string;
	status?: string;
}): boolean {
	if (!borrow?.expectedReturnDate) return false;

	if (borrow.status === "overdue") return true;

	const today = new Date();
	const expectedReturnDate = new Date(borrow.expectedReturnDate);

	return expectedReturnDate < today;
}

export function daysPastDue(borrow: { expectedReturnDate?: string }): number {
	if (!borrow?.expectedReturnDate) return 0;

	const expectedDate = new Date(borrow.expectedReturnDate);
	const now = new Date();

	expectedDate.setHours(0, 0, 0, 0);
	now.setHours(0, 0, 0, 0);

	const diffMs = now.getTime() - expectedDate.getTime();
	const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	return days > 0 ? days : 0;
}

export function getOverdueStatusText(borrow: {
	expectedReturnDate?: string;
	status?: string;
}): string {
	if (!isBorrowOverdue(borrow)) {
		return borrow.status || "borrowed";
	}

	const days = daysPastDue(borrow);
	return days > 0 ? `Overdue • ${days}d` : "Overdue";
}
