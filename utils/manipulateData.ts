import { Item, Category, Supplier, Settings } from "@/utils/types";
import { v4 as uuidv4 } from "uuid";
import {
	isLocalStorageAvailable,
	getFromStorage,
	saveToStorage,
	KEYS,
} from "@/utils/localStorageManipulation";
import { toastError, toastSuccess } from "@/composables/toast";

export const initializeData = () => {
	// First check if localStorage is available
	if (!isLocalStorageAvailable()) {
		toastError(
			"localStorage Unavailable",
			"Your browser may have localStorage disabled."
		);
		return;
	}
	if (!localStorage.getItem(KEYS.categories)) {
		saveToStorage(KEYS.categories, [] as Category[]);
	}
	if (!localStorage.getItem(KEYS.suppliers)) {
		saveToStorage(KEYS.suppliers, [] as Supplier[]);
	}
	if (!localStorage.getItem(KEYS.inventory)) {
		saveToStorage(KEYS.inventory, [] as Item[]);
	}
};

export const getCategories = (): Category[] => {
	return getFromStorage<Category[]>(KEYS.categories, []);
};
export const getSuppliers = (): Supplier[] => {
	return getFromStorage<Supplier[]>(KEYS.suppliers, []);
};
export const getItems = (): Item[] => {
	return getFromStorage<Item[]>(KEYS.inventory, []);
};
export const getItem = (id: string): Item | undefined => {
	const items = getItems();
	return items.find((item) => item.id === id);
};

export const addItem = (
	item: Omit<Item, "id" | "created_at" | "updated_at">
): Item => {
	const ts = new Date().toISOString();
	const newItem: Item = {
		...item,
		id: uuidv4(),
		created_at: ts,
		updated_at: ts,
	};
	const items = getItems();
	const updatedItems = [...items, newItem];
	saveToStorage(KEYS.inventory, updatedItems);
	toastSuccess(
		"Item added successfully",
		"The item has been added to the inventory."
	);
	return newItem;
};

export const updateItem = (item: Item): void => {
	const items = getItems();
	const updatedItems = items.map((i) =>
		i.id === item.id ? { ...item, updated_at: new Date().toISOString() } : i
	);
	saveToStorage(KEYS.inventory, updatedItems);
};

export const deleteItem = (id: string): void => {
	const items = getItems();
	const updatedItems = items.filter((item) => item.id !== id);
	toastSuccess(
		"Item deleted successfully",
		"The item has been removed from the inventory."
	);
	saveToStorage(KEYS.inventory, updatedItems);
};

export const addCategory = (category: Omit<Category, "id">): Category => {
	const newCategory = { ...category, id: uuidv4() };
	const categories = getCategories();
	const updatedCategories = [...categories, newCategory];
	saveToStorage(KEYS.categories, updatedCategories);
	toastSuccess("Category added successfully", "The category has been added.");
	return newCategory;
};

export const updateCategory = (category: Category): void => {
	const categories = getCategories();
	const updatedCategories = categories.map((c) =>
		c.id === category.id ? category : c
	);
	toastSuccess(
		"Category updated successfully",
		"The category has been updated."
	);
	saveToStorage(KEYS.categories, updatedCategories);
};

export const deleteCategory = (id: string): void => {
	const categories = getCategories();
	const updatedCategories = categories.filter(
		(category) => category.id !== id
	);
	toastSuccess(
		"Category deleted successfully",
		"The category has been removed."
	);
	saveToStorage(KEYS.categories, updatedCategories);
};

export const addSupplier = (supplier: Omit<Supplier, "id">): Supplier => {
	const newSupplier = { ...supplier, id: uuidv4() };
	const suppliers = getSuppliers();
	const updatedSuppliers = [...suppliers, newSupplier];
	saveToStorage(KEYS.suppliers, updatedSuppliers);
	toastSuccess("Supplier added successfully", "The supplier has been added.");
	return newSupplier;
};

export const updateSupplier = (supplier: Supplier): void => {
	const suppliers = getSuppliers();
	const updatedSuppliers = suppliers.map((s) =>
		s.id === supplier.id ? supplier : s
	);
	toastSuccess(
		"Supplier updated successfully",
		"The supplier has been updated."
	);
	saveToStorage(KEYS.suppliers, updatedSuppliers);
};

export const deleteSupplier = (id: string): void => {
	const suppliers = getSuppliers();
	const updatedSuppliers = suppliers.filter((supplier) => supplier.id !== id);
	toastSuccess(
		"Supplier deleted successfully",
		"The supplier has been removed."
	);
	saveToStorage(KEYS.suppliers, updatedSuppliers);
};

// Helper function to get category name by ID
export const getCategoryName = (categoryId: string): string => {
	const categories = getCategories();
	const category = categories.find((c) => c.id === categoryId);
	return category ? category.name : "Unknown";
};

// Helper function to get supplier name by ID
export const getSupplierName = (supplierId: string): string => {
	const suppliers = getSuppliers();
	const supplier = suppliers.find((s) => s.id === supplierId);
	return supplier ? supplier.name : "Unknown";
};
