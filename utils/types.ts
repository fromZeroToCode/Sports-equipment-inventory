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
