"use client";
import { useEffect, useState } from "react";

export default function ThemeProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);

		const theme = localStorage.getItem("theme");
		if (
			theme === "dark" &&
			!document.documentElement.classList.contains("dark")
		) {
			document.documentElement.classList.add("dark");
		} else if (
			theme === "light" &&
			document.documentElement.classList.contains("dark")
		) {
			document.documentElement.classList.remove("dark");
		}

		const onStorage = (e: StorageEvent) => {
			if (e.key === "theme") {
				if (e.newValue === "dark")
					document.documentElement.classList.add("dark");
				else if (e.newValue === "light")
					document.documentElement.classList.remove("dark");
				else {
					const prefersDark =
						window.matchMedia &&
						window.matchMedia("(prefers-color-scheme: dark)")
							.matches;
					document.documentElement.classList.toggle(
						"dark",
						prefersDark
					);
				}
			}
		};

		window.addEventListener("storage", onStorage);
		return () => window.removeEventListener("storage", onStorage);
	}, []);

	if (!mounted) {
		return <div style={{ visibility: "hidden" }}>{children}</div>;
	}

	return <>{children}</>;
}
