import "./globals.css";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { LoadingProvider } from "@/hooks/useLoadingManager";
import { GlobalLoading } from "@/components/GlobalLoader";
import { ConfirmProvider } from "@/components/ui/ConfirmProvider";
import ThemeProvider from "@/hooks/useThemeProvider";

export const metadata = {
	title: "Sports Equipment Inventory",
	description: "Sports equipment inventory management system",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning={true}>
			<link
				rel="icon"
				type="image/x-icon"
				href="/Sports-equipment-inventory/logo.svg"
			/>
			<body className="bg-slate-50 dark:bg-black ">
				<ConfirmProvider>
					<LoadingProvider>
						<ThemeProvider>{children}</ThemeProvider>
						<GlobalLoading />
					</LoadingProvider>
				</ConfirmProvider>

				<ToastContainer
					position="bottom-right"
					autoClose={2000}
					hideProgressBar={false}
					newestOnTop={false}
					closeOnClick
					pauseOnFocusLoss={false}
					rtl={false}
					draggable
					pauseOnHover
					theme="colored"
					transition={Slide}
				/>
			</body>
		</html>
	);
}
