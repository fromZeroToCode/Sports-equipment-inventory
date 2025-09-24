"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const BASE_PATH = (process.env.BASE_PATH ?? "/Sports-equipment-inventory").replace(/\/$/, "");

function getCookie(name: string): string | null {
	if (typeof document === "undefined") return null;
	const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
	return m ? decodeURIComponent(m[1]) : null;
}

function stripBasePath(pathname: string): string {
	const bp = BASE_PATH === "/" ? "" : BASE_PATH.replace(/\/$/, "");
	if (!bp) return pathname;

	if (pathname.startsWith(bp)) {
		const stripped = pathname.slice(bp.length) || "/";
		return stripped.startsWith("/") ? stripped : `/${stripped}`;
	}
	return pathname;
}

// redirect to dashboard if session exists
export function useSessionRedirectToDashboard() {
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		if (typeof window === "undefined") return;

		const session = getCookie("session");
		if (!session) return;

		const current = stripBasePath(pathname ?? window.location.pathname).replace(/\/$/, "");

		if (current === "/" || current === "") {
			const target = `/dashboard`;
			console.log("Redirecting to dashboard:", target);
			router.replace(target);
		}
	}, [pathname, router]);
}

// redirect to login if session does not exist
export function useSessionRedirectToLogin() {
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		if (typeof window === "undefined") return;

		const session = getCookie("session");
		if (session) return;

		const current = stripBasePath(pathname ?? window.location.pathname).replace(/\/$/, "");

		if (current === "/dashboard" || current.startsWith("/dashboard/")) {
			const target = BASE_PATH || "/";
			console.log("Redirecting to login:", target);
			router.replace(target);
		}
	}, [pathname, router]);
}
