import "./globals.css";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { LoadingProvider } from "@/hooks/useLoadingManager";
import { GlobalLoading } from "@/components/GlobalLoader";
import { ConfirmProvider } from "@/components/ui/ConfirmProvider";

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
			<link rel="icon" type="image/png" href="/icon.png" />
			<body className="bg-slate-50 dark:bg-black ">
				<ConfirmProvider>
					<LoadingProvider>
						{children}
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
