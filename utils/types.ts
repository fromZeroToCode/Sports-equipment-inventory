export interface Item {
	id: string;
	name: string;
	categoryId: string;
	categoryName?: string;
	quantity: number;
	location: string;
	supplierId: string;
	supplierName?: string;
	purchaseDate: string;
	price: number;
	status: "In Stock" | "Low Stock" | "Out of Stock";
	created_at: string;
	updated_at: string;
}
export interface Category {
	id: string;
	name: string;
	description?: string;
}
export interface Supplier {
	id: string;
	name: string;
	contact: string;
	email: string;
	phone?: string;
}

export interface Settings {
	currency?: string;
	lowStockThreshold: number;
}

export interface BorrowRecord {
	id: string;
	itemId: string;
	itemName: string;
	borrowerName: string;
	borrowerEmail: string;
	borrowerPhone?: string;
	quantityBorrowed: number;
	borrowDate: string;
	expectedReturnDate: string;
	actualReturnDate?: string;
	status: "borrowed" | "returned" | "overdue";
	notes?: string;
	borrowedBy: string; // username of who processed the borrow
	returnedBy?: string; // username of who processed the return
	created_at: string;
	updated_at: string;
}

export interface HistoryRecord {
	id: string;
	action: "add" | "update" | "delete" | "borrow" | "return";
	entityType: "item" | "category" | "supplier" | "borrow";
	entityId: string;
	entityName: string;
	details: string;
	performedBy: string;
	timestamp: string;
}
