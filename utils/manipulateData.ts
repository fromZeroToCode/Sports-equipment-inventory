import {
	Item,
	Category,
	Supplier,
	Settings,
	BorrowRecord,
	HistoryRecord,
	NotificationRecord,
} from "@/utils/types";
import { v4 as uuidv4 } from "uuid";
import {
	isLocalStorageAvailable,
	getFromStorage,
	saveToStorage,
	KEYS,
} from "@/utils/localStorageManipulation";
import { toastError, toastSuccess } from "@/hooks/useToast";
import { isBorrowOverdue, daysPastDue } from "@/utils/borrowHelpers";

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
export const getSettings = (): Settings => {
	return getFromStorage<Settings>(KEYS.settings, {
		lowStockThreshold: 5,
		currency: "PHP",
	});
};
export const getItem = (id: string): Item | undefined => {
	const items = getItems();
	return items.find((item) => item.id === id);
};

export const addItem = (
	item: Omit<Item, "id" | "created_at" | "updated_at">
): Item => {
	const currentUser = getCurrentUser();
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

	// Add history record
	addHistory({
		action: "add",
		entityType: "item",
		entityId: newItem.id,
		entityName: newItem.name,
		details: `Added item with quantity: ${newItem.quantity}`,
		performedBy: currentUser?.username || "Unknown",
	});

	toastSuccess(
		"Item added successfully",
		"The item has been added to the inventory."
	);
	return newItem;
};

export const updateItem = (item: Item): void => {
	const currentUser = getCurrentUser();
	const items = getItems();
	const updatedItems = items.map((i) =>
		i.id === item.id ? { ...item, updated_at: new Date().toISOString() } : i
	);

	// Add history record
	addHistory({
		action: "update",
		entityType: "item",
		entityId: item.id,
		entityName: item.name,
		details: `Updated item details`,
		performedBy: currentUser?.username || "Unknown",
	});

	toastSuccess(
		"Item updated successfully",
		"The item has been updated in the inventory."
	);
	saveToStorage(KEYS.inventory, updatedItems);
};

export const deleteItem = (id: string): void => {
	const currentUser = getCurrentUser();
	const items = getItems();
	const itemToDelete = items.find((item) => item.id === id);
	const updatedItems = items.filter((item) => item.id !== id);

	// Add history record
	if (itemToDelete) {
		addHistory({
			action: "delete",
			entityType: "item",
			entityId: itemToDelete.id,
			entityName: itemToDelete.name,
			details: `Deleted item`,
			performedBy: currentUser?.username || "Unknown",
		});
	}

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

	// Add history record
	const currentUser = getCurrentUser();
	addHistory({
		entityId: newCategory.id,
		action: "add",
		entityType: "category",
		entityName: newCategory.name,
		details: `Category "${newCategory.name}" created`,
		performedBy: currentUser?.username || "Unknown",
	});

	toastSuccess("Category added successfully", "The category has been added.");
	return newCategory;
};

export const updateCategory = (category: Category): void => {
	const categories = getCategories();
	const updatedCategories = categories.map((c) =>
		c.id === category.id ? category : c
	);

	// Add history record
	const currentUser = getCurrentUser();
	addHistory({
		entityId: category.id,
		action: "update",
		entityType: "category",
		entityName: category.name,
		details: `Category "${category.name}" updated`,
		performedBy: currentUser?.username || "Unknown",
	});

	toastSuccess(
		"Category updated successfully",
		"The category has been updated."
	);
	saveToStorage(KEYS.categories, updatedCategories);
};

export const deleteCategory = (id: string): void => {
	const categories = getCategories();
	const categoryToDelete = categories.find((c) => c.id === id);
	const updatedCategories = categories.filter(
		(category) => category.id !== id
	);

	// Add history record
	if (categoryToDelete) {
		const currentUser = getCurrentUser();
		addHistory({
			entityId: categoryToDelete.id,
			action: "delete",
			entityType: "category",
			entityName: categoryToDelete.name,
			details: `Category "${categoryToDelete.name}" deleted`,
			performedBy: currentUser?.username || "Unknown",
		});
	}

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

	// Add history record
	const currentUser = getCurrentUser();
	addHistory({
		entityId: newSupplier.id,
		action: "add",
		entityType: "supplier",
		entityName: newSupplier.name,
		details: `Supplier "${newSupplier.name}" created`,
		performedBy: currentUser?.username || "Unknown",
	});

	toastSuccess("Supplier added successfully", "The supplier has been added.");
	return newSupplier;
};

export const updateSupplier = (supplier: Supplier): void => {
	const suppliers = getSuppliers();
	const updatedSuppliers = suppliers.map((s) =>
		s.id === supplier.id ? supplier : s
	);

	// Add history record
	const currentUser = getCurrentUser();
	addHistory({
		entityId: supplier.id,
		action: "update",
		entityType: "supplier",
		entityName: supplier.name,
		details: `Supplier "${supplier.name}" updated`,
		performedBy: currentUser?.username || "Unknown",
	});

	toastSuccess(
		"Supplier updated successfully",
		"The supplier has been updated."
	);
	saveToStorage(KEYS.suppliers, updatedSuppliers);
};

export const deleteSupplier = (id: string): void => {
	const suppliers = getSuppliers();
	const supplierToDelete = suppliers.find((s) => s.id === id);
	const updatedSuppliers = suppliers.filter((supplier) => supplier.id !== id);

	// Add history record
	if (supplierToDelete) {
		const currentUser = getCurrentUser();
		addHistory({
			entityId: supplierToDelete.id,
			action: "delete",
			entityType: "supplier",
			entityName: supplierToDelete.name,
			details: `Supplier "${supplierToDelete.name}" deleted`,
			performedBy: currentUser?.username || "Unknown",
		});
	}

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
	return category ? category.name : "Other";
};

// Helper function to get supplier name by ID
export const getSupplierName = (supplierId: string): string => {
	const suppliers = getSuppliers();
	const supplier = suppliers.find((s) => s.id === supplierId);
	return supplier ? supplier.name : "Other";
};

export const getCurrency = (): string => {
	const settings = getSettings();
	if (settings.currency === "PHP") return "₱";
	if (settings.currency === "USD") return "$";
	if (settings.currency === "EUR") return "€";
	if (settings.currency === "CAD") return "$";
	if (settings.currency === "GBP") return "£";
	if (settings.currency === "AUD") return "$";

	return settings.currency || "PHP";
};

// Helper function to get current user
const getCurrentUser = () => {
	try {
		const raw = localStorage.getItem("currentUser");
		return raw ? JSON.parse(raw) : null;
	} catch {
		return null;
	}
};

// History functions
export const addHistory = (
	record: Omit<HistoryRecord, "id" | "timestamp">
): HistoryRecord => {
	const newRecord: HistoryRecord = {
		...record,
		id: uuidv4(),
		timestamp: new Date().toISOString(),
	};

	const history = getHistory();
	history.unshift(newRecord); // Add to beginning for chronological order
	saveToStorage(KEYS.history, history);

	return newRecord;
};

export const getHistory = (): HistoryRecord[] => {
	return getFromStorage<HistoryRecord[]>(KEYS.history, []);
};

// Borrow functions
export const getBorrows = (): BorrowRecord[] => {
	return getFromStorage<BorrowRecord[]>(KEYS.borrows, []);
};

export const getBorrow = (id: string): BorrowRecord | undefined => {
	const borrows = getBorrows();
	return borrows.find((borrow) => borrow.id === id);
};

export const addBorrow = (
	borrow: Omit<BorrowRecord, "id" | "created_at" | "updated_at">
): BorrowRecord => {
	const currentUser = getCurrentUser();
	const newBorrow: BorrowRecord = {
		...borrow,
		id: uuidv4(),
		borrowedBy: currentUser?.username || "Unknown",
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	};

	const borrows = getBorrows();
	borrows.push(newBorrow);
	saveToStorage(KEYS.borrows, borrows);

	// Update item quantity
	const item = getItem(borrow.itemId);
	if (item) {
		const updatedItem = {
			...item,
			quantity: item.quantity - borrow.quantityBorrowed,
			updated_at: new Date().toISOString(),
		};
		updateItem(updatedItem);

		// Add history record
		addHistory({
			action: "borrow",
			entityType: "item",
			entityId: item.id,
			entityName: item.name,
			details: `Borrowed ${borrow.quantityBorrowed} units by ${borrow.borrowerName}`,
			performedBy: currentUser?.username || "Unknown",
		});

		// Add notification
		addNotification({
			type: "borrow",
			title: "Item Borrowed",
			message: `${borrow.borrowerName} borrowed ${borrow.quantityBorrowed} units of ${item.name}`,
			isRead: false,
			entityId: newBorrow.id,
			entityType: "borrow",
			createdBy: currentUser?.username || "Unknown",
		});
	}

	return newBorrow;
};

export const returnBorrow = (
	borrowId: string,
	returnNotes?: string
): { success: boolean; error?: string } => {
	const currentUser = getCurrentUser();
	const borrows = getBorrows();
	const borrowIndex = borrows.findIndex((b) => b.id === borrowId);

	if (borrowIndex === -1)
		return { success: false, error: "Borrow record not found" };

	const borrow = borrows[borrowIndex];
	if (borrow.status === "returned")
		return { success: false, error: "Item has already been returned" };

	// Check if the current user is the one who borrowed the item
	const currentUsername = currentUser?.username || "";
	if (borrow.borrowedBy !== currentUsername) {
		return {
			success: false,
			error: "Only the person who borrowed this item can return it",
		};
	}

	// Update borrow record
	borrows[borrowIndex] = {
		...borrow,
		status: "returned",
		actualReturnDate: new Date().toISOString(),
		returnedBy: currentUser?.username || "Unknown",
		notes: returnNotes || borrow.notes,
		updated_at: new Date().toISOString(),
	};

	saveToStorage(KEYS.borrows, borrows);

	// Update item quantity
	const item = getItem(borrow.itemId);
	if (item) {
		const updatedItem = {
			...item,
			quantity: item.quantity + borrow.quantityBorrowed,
			updated_at: new Date().toISOString(),
		};
		updateItem(updatedItem);

		// Add history record
		addHistory({
			action: "return",
			entityType: "item",
			entityId: item.id,
			entityName: item.name,
			details: `Returned ${borrow.quantityBorrowed} units by ${borrow.borrowerName}`,
			performedBy: currentUser?.username || "Unknown",
		});

		// Add notification
		addNotification({
			type: "return",
			title: "Item Returned",
			message: `${borrow.borrowerName} returned ${borrow.quantityBorrowed} units of ${item.name}`,
			isRead: false,
			entityId: borrowId,
			entityType: "borrow",
			createdBy: currentUser?.username || "Unknown",
		});
	}

	return { success: true };
};

// Additional history utility function
export const getHistoryByEntity = (entityId: string): HistoryRecord[] => {
	const history = getHistory();
	return history.filter((record) => record.entityId === entityId);
};

// Notification functions
export const getNotifications = (): NotificationRecord[] => {
	return getFromStorage<NotificationRecord[]>(KEYS.notifications, []);
};

export const addNotification = (
	notification: Omit<NotificationRecord, "id" | "timestamp">
): NotificationRecord => {
	const newNotification: NotificationRecord = {
		...notification,
		id: uuidv4(),
		timestamp: new Date().toISOString(),
	};
	const notifications = getNotifications();
	const updatedNotifications = [newNotification, ...notifications];
	saveToStorage(KEYS.notifications, updatedNotifications);
	return newNotification;
};

export function markNotificationAsRead(id: string) {
	const notifications = getNotifications();
	const idx = notifications.findIndex((n) => n.id === id);
	if (idx === -1) return false;
	notifications[idx].isRead = true;
	try {
		localStorage.setItem("notifications", JSON.stringify(notifications));
		window.dispatchEvent(new CustomEvent("notifications:changed"));
	} catch {}
	return true;
}

export function markAllNotificationsAsRead() {
	const notifications = getNotifications().map((n) => ({
		...n,
		isRead: true,
	}));
	try {
		localStorage.setItem("notifications", JSON.stringify(notifications));
		window.dispatchEvent(new CustomEvent("notifications:changed"));
	} catch {}
	return true;
}

export function deleteNotification(id: string) {
	let notifications = getNotifications();
	notifications = notifications.filter((n) => n.id !== id);
	try {
		localStorage.setItem("notifications", JSON.stringify(notifications));
		window.dispatchEvent(new CustomEvent("notifications:changed"));
	} catch {}
	return true;
}

export const getUnreadNotificationsCount = (): number => {
	const notifications = getNotifications();
	return notifications.filter((n) => !n.isRead).length;
};

// Check for overdue borrows and create notifications
export const checkAndCreateOverdueNotifications = (): void => {
	const borrows = getBorrows();
	const currentUser = getCurrentUser();
	let hasUpdates = false;

	const updatedBorrows = borrows.map((borrow) => {
		// Check if the item is overdue (for both borrowed and already overdue items)
		if (
			(borrow.status === "borrowed" || borrow.status === "overdue") &&
			isBorrowOverdue(borrow)
		) {
			let shouldUpdate = false;

			// Update status if it was borrowed and now overdue
			if (borrow.status === "borrowed") {
				hasUpdates = true;
				shouldUpdate = true;
			}

			// Check if we already created an overdue notification for this borrow
			const existingNotifications = getNotifications();
			const hasOverdueNotification = existingNotifications.some(
				(n) => n.type === "overdue" && n.entityId === borrow.id
			);

			// Create overdue notification if it doesn't exist
			if (!hasOverdueNotification) {
				const days = daysPastDue(borrow);

				addNotification({
					type: "overdue",
					title: "Item Overdue",
					message: `${borrow.itemName} borrowed by ${borrow.borrowerName} is ${days} day(s) overdue`,
					isRead: false,
					entityId: borrow.id,
					entityType: "borrow",
					createdBy: currentUser?.username || "System",
				});
			}

			// Return updated borrow with overdue status if needed
			return shouldUpdate
				? { ...borrow, status: "overdue" as const }
				: borrow;
		}
		return borrow;
	});

	// Save updated borrows if there were changes
	if (hasUpdates) {
		saveToStorage(KEYS.borrows, updatedBorrows);
	}
};

// Get recent notifications for dropdown (limit to 5)
export const getRecentNotifications = (
	limit: number = 5
): NotificationRecord[] => {
	const notifications = getNotifications();
	return notifications.slice(0, limit);
};

// Get overdue borrows
export const getOverdueBorrows = (): BorrowRecord[] => {
	const borrows = getBorrows();
	return borrows.filter((borrow) => borrow.status === "overdue");
};
