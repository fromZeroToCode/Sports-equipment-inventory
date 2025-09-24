export type InventoryItem = {
	id: string;
	itemName: string;
	category: string;
	quantity: number;
	location: string;
	supplier: string;
	purchaseDate: string;
	price: number;
	created_at: string;
	updated_at: string;
};

export type Supplier = {
	id: string;
	name: string;
	contact: string;
	email: string;
	phone: string;
};

export type Category = {
	id: string;
	name: string;
	description: string;
};

export type Settings = {
	currency: string;
	lowStockThreshold: number;
};

function uid() {
	if (typeof crypto !== "undefined" && (crypto as any).randomUUID) {
		return (crypto as any).randomUUID();
	}
	return `${Date.now().toString(36)}-${Math.floor(
		Math.random() * 1e6
	).toString(36)}`;
}

function rand<T>(arr: T[]) {
	return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randDateWithin(daysBack = 365) {
	const now = Date.now();
	const past = now - randInt(0, daysBack) * 24 * 60 * 60 * 1000;
	return new Date(past).toISOString();
}

export default function generateMockData(opts?: {
	items?: number;
	suppliers?: number;
	categories?: number;
	overwrite?: boolean;
}) {
	const {
		items = randInt(30, 80),
		suppliers = randInt(3, 12),
		categories = randInt(4, 10),
		overwrite = true,
	} = opts || {};

	if (typeof window === "undefined" || typeof localStorage === "undefined") {
		throw new Error("generateMockData must run in a browser environment");
	}

	if (!overwrite) {
		const existing = {
			inventory: localStorage.getItem("inventory"),
			suppliers: localStorage.getItem("suppliers"),
			categories: localStorage.getItem("categories"),
			settings: localStorage.getItem("settings"),
		};
		if (
			existing.inventory ||
			existing.suppliers ||
			existing.categories ||
			existing.settings
		) {
			return {
				inventory: existing.inventory
					? JSON.parse(existing.inventory)
					: [],
				suppliers: existing.suppliers
					? JSON.parse(existing.suppliers)
					: [],
				categories: existing.categories
					? JSON.parse(existing.categories)
					: [],
				settings: existing.settings
					? JSON.parse(existing.settings)
					: null,
			};
		}
	}

	const sampleItemNames = [
		"Soccer Ball",
		"Basketball",
		"Tennis Racket",
		"Baseball Glove",
		"Volleyball",
		"Hockey Stick",
		"Yoga Mat",
		"Dumbbell",
		"Skipping Rope",
		"Training Cone",
		"Whistle",
		"Goal Net",
	];

	const sampleLocations = [
		"Storage A",
		"Storage B",
		"Warehouse 1",
		"Warehouse 2",
		"Backroom",
		"Front Desk",
	];

	const sampleSupplierNames = [
		"Ace Sports Co",
		"ProGear Supplies",
		"Champion Distributors",
		"AllStar Imports",
		"PlayHard Ltd",
		"FitEquip LLC",
		"OutdoorGoods",
		"PrimeSports",
	];

	const sampleCategoryNames = [
		"Balls",
		"Rackets",
		"Protective Gear",
		"Fitness",
		"Accessories",
		"Team Gear",
	];

	// create categories
	const cats: Category[] = Array.from({ length: categories }).map((_, i) => {
		const name =
			sampleCategoryNames[i % sampleCategoryNames.length] +
			(i >= sampleCategoryNames.length ? ` ${i}` : "");
		return {
			id: uid(),
			name,
			description: `${name} for sporting activities`,
		};
	});

	const sups: Supplier[] = Array.from({ length: suppliers }).map((_, i) => {
		const name =
			sampleSupplierNames[i % sampleSupplierNames.length] +
			(i >= sampleSupplierNames.length ? ` ${i}` : "");
		return {
			id: uid(),
			name,
			contact: `Contact ${i + 1}`,
			email: `${name.toLowerCase().replace(/\s+/g, "")}@example.com`,
			phone: `+1-555-${randInt(1000, 9999).toString().padStart(4, "0")}`,
		};
	});

	const inventory: InventoryItem[] = Array.from({ length: items }).map(() => {
		const itemName = `${rand(sampleItemNames)}${
			Math.random() < 0.3 ? ` ${randInt(1, 200)}` : ""
		}`;
		const category = rand(cats).name;
		const supplier = rand(sups).name;
		const quantity = Math.random() < 0.15 ? randInt(0, 5) : randInt(1, 200);
		const location = rand(sampleLocations);
		const purchaseDate = randDateWithin(720);
		const price = Number((Math.random() * 300 + 1).toFixed(2));
		const created_at = randDateWithin(1000);
		const updated_at = randDateWithin(30);

		return {
			id: uid(),
			itemName,
			category,
			quantity,
			location,
			supplier,
			purchaseDate,
			price,
			created_at,
			updated_at,
		};
	});

	const currencies = ["USD", "EUR", "GBP", "PHP", "AUD", "CAD"];
	const settings: Settings = {
		currency: rand(currencies),
		lowStockThreshold: randInt(3, 20),
	};

	localStorage.setItem("categories", JSON.stringify(cats));
	localStorage.setItem("suppliers", JSON.stringify(sups));
	localStorage.setItem("inventory", JSON.stringify(inventory));
	localStorage.setItem("settings", JSON.stringify(settings));

	return { inventory, suppliers: sups, categories: cats, settings };
}
