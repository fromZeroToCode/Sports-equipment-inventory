import { toastError } from "@/hooks/useToast";

//utility functions to handle localStorage operations with error handling
const KEYS = {
	inventory: "inventory",
	categories: "categories",
	suppliers: "suppliers",
	settings: "settings",
	borrows: "borrows",
	history: "history",
};

const isBrowser = () =>
	typeof window !== "undefined" && typeof localStorage !== "undefined";

// Check if localStorage is available
export const isLocalStorageAvailable = (): boolean => {
	if (!isBrowser()) return false;
	try {
		const testKey = "__test__";
		localStorage.setItem(testKey, testKey);
		localStorage.removeItem(testKey);
		return true;
	} catch (e) {
		console.error("localStorage is not available:", e);
		return false;
	}
};

// Get data from localStorage
export const getFromStorage = <T>(key: string, defaultValue: T): T => {
	if (!isBrowser()) return defaultValue;
	try {
		const item = localStorage.getItem(key);
		return item ? (JSON.parse(item) as T) : defaultValue;
	} catch (e) {
		console.error(`Error getting ${key} from localStorage:`, e);
		return defaultValue;
	}
};

// Save data to localStorage
export const saveToStorage = <T>(key: string, value: T): void => {
	if (!isBrowser()) {
		console.warn("saveToStorage called outside browser, ignoring.");
		return;
	}
	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch (e) {
		console.error(`Error saving ${key} to localStorage:`, e);
		try {
			toastError(
				"Failed to save data",
				"Or browser may have localStorage disabled or full."
			);
		} catch {}
	}
};

// Clear all application data from localStorage
export const clearAllData = (): void => {
	if (!isBrowser()) return;
	try {
		localStorage.removeItem(KEYS.inventory);
		localStorage.removeItem(KEYS.categories);
		localStorage.removeItem(KEYS.suppliers);
		localStorage.removeItem(KEYS.settings);
		localStorage.removeItem(KEYS.borrows);
		localStorage.removeItem(KEYS.history);
	} catch (e) {
		toastError(
			"Error clearing data",
			"An error occurred while clearing data."
		);
		console.error("Error clearing localStorage:", e);
	}
};

// Clear specific data from localStorage
export const clearData = (key: string): void => {
	if (!isBrowser()) return;
	try {
		localStorage.removeItem(key);
	} catch (e) {
		toastError(
			`Error clearing ${key} from localStorage`,
			"An error occurred while clearing data."
		);
		console.error(`Error clearing ${key} from localStorage:`, e);
	}
};

export { KEYS };
