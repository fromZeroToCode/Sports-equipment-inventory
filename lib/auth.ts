import { hashSession } from "@/utils/encrypt";

export async function loginUser(username: string, password: string) {
	try {
		const usernameT = process.env.NEXT_PUBLIC_USERNAME;
		const passwordT = process.env.NEXT_PUBLIC_PASSWORD;

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
