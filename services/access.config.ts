export function getSession(): string | null {
	if (typeof window === "undefined") return null;
	const match = document.cookie.match(new RegExp("(?:^|; )" + "session" + "=([^;]*)"));
	return match ? decodeURIComponent(match[1]) : null;
}
