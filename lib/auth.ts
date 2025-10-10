import { hashSession } from "@/utils/encrypt";

export async function loginUser(username: string, password: string) {
	try {
		const defaultRoles = [
			{ id: 1, username: "admin", password: "admin123", role: "admin" },
			{ id: 2, username: "coach", password: "coach123", role: "coach" },
			{ id: 3, username: "staff", password: "staff123", role: "staff" },
		];

		let roles = defaultRoles;
		try {
			const raw = localStorage.getItem("roleAccess");
			const parsed = raw ? JSON.parse(raw) : null;
			if (Array.isArray(parsed)) {
				roles = parsed;
			}
		} catch (err) {
			roles = defaultRoles;
		}

		const match = roles.find(
			(r: any) => r.username === username && r.password === password
		);

		if (!match) {
			return false;
		}

		const session = await hashSession(
			JSON.stringify({
				username,
				role: match.role,
				timestamp: Date.now(),
			})
		);

		const maxAge = 60 * 60 * 24 * 7; // 7 days
		const secure =
			typeof window !== "undefined" && location.protocol === "https:"
				? "secure;"
				: "";

		document.cookie = `session=${encodeURIComponent(
			session
		)}; path=/; max-age=${maxAge}; samesite=Lax; ${secure}`;

		localStorage.setItem(
			"currentUser",
			JSON.stringify({
				username,
				role: match.role,
				loggedAt: Date.now(),
			})
		);

		return true;
	} catch (error) {
		console.log(error);
		return false;
	}
}

export async function changePassword(
	username: string,
	oldPassword: string,
	newPassword: string
): Promise<boolean> {
	try {
		if (typeof window === "undefined") return false;
		if (
			typeof username !== "string" ||
			typeof oldPassword !== "string" ||
			typeof newPassword !== "string"
		)
			return false;
		if (newPassword.length < 8) return false;

		const raw = localStorage.getItem("roleAccess");
		const parsed = raw ? JSON.parse(raw) : null;
		if (!Array.isArray(parsed)) return false;

		const roles = parsed as any[];
		const idx = roles.findIndex(
			(r) => r.username === username && r.password === oldPassword
		);
		if (idx === -1) return false;

		roles[idx].password = newPassword;
		localStorage.setItem("roleAccess", JSON.stringify(roles));

		try {
			const curRaw = localStorage.getItem("currentUser");
			const cur = curRaw ? JSON.parse(curRaw) : null;
			if (cur && cur.username === username) {
				localStorage.setItem(
					"currentUser",
					JSON.stringify({ ...cur, loggedAt: Date.now() })
				);
			}
		} catch {
			/* ignore */
		}

		return true;
	} catch (err) {
		console.error(err);
		return false;
	}
}

export async function resetPasswordByAdmin(
	targetUsername: string,
	newPassword: string
): Promise<boolean> {
	try {
		if (typeof window === "undefined") return false;
		if (
			typeof targetUsername !== "string" ||
			typeof newPassword !== "string"
		)
			return false;
		if (newPassword.length < 8) return false;

		const curRaw = localStorage.getItem("currentUser");
		const cur = curRaw ? JSON.parse(curRaw) : null;
		if (!cur || cur.role !== "admin") return false; // only admin allowed

		const raw = localStorage.getItem("roleAccess");
		const parsed = raw ? JSON.parse(raw) : null;
		if (!Array.isArray(parsed)) return false;

		const roles = parsed as any[];
		const idx = roles.findIndex((r) => r.username === targetUsername);
		if (idx === -1) return false;

		roles[idx].password = newPassword;
		localStorage.setItem("roleAccess", JSON.stringify(roles));
		return true;
	} catch (err) {
		console.error(err);
		return false;
	}
}

export async function resetPasswordByUsername(
	username: string,
	newPassword: string
): Promise<boolean> {
	try {
		if (typeof window === "undefined") return false;
		if (typeof username !== "string" || typeof newPassword !== "string")
			return false;
		if (newPassword.length < 8) return false;

		const raw = localStorage.getItem("roleAccess");
		const parsed = raw ? JSON.parse(raw) : null;
		if (!Array.isArray(parsed)) return false;

		const roles = parsed as any[];
		const idx = roles.findIndex((r) => r.username === username);
		if (idx === -1) return false;

		roles[idx].password = newPassword;
		localStorage.setItem("roleAccess", JSON.stringify(roles));

		// If the currently logged-in user is the same account, update currentUser loggedAt
		try {
			const curRaw = localStorage.getItem("currentUser");
			const cur = curRaw ? JSON.parse(curRaw) : null;
			if (cur && cur.username === username) {
				localStorage.setItem(
					"currentUser",
					JSON.stringify({ ...cur, loggedAt: Date.now() })
				);
			}
		} catch {
			/* ignore */
		}

		return true;
	} catch (err) {
		console.error(err);
		return false;
	}
}
