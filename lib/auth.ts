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
