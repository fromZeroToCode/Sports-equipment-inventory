import { hashSession } from "@/utils/encrypt";

export async function loginUser(username: string, password: string) {
	try {
		const usernameT = "admin";
		const passwordT = "admin123";

		if (username === usernameT && password === passwordT) {
			const session = await hashSession(JSON.stringify({ username, timestamp: Date.now() }));
			const maxAge = 60 * 60 * 24 * 7; // 7 days
			const secure = typeof window !== "undefined" && location.protocol === "https:" ? "secure;" : "";
			document.cookie = `session=${encodeURIComponent(
				session
			)}; path=/; max-age=${maxAge}; samesite=Lax; ${secure}`;
			return true;
		}
		return false;
	} catch (error) {
		console.log(error);
		return false;
	}
}
