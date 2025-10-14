"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toastError, toastSuccess } from "@/hooks/useToast";
import { Loader2, Eye, EyeOff, FileText } from "lucide-react";
import { resetPasswordByUsername } from "@/lib/auth";
import DarkModeButton from "@/components/ui/DarkModeButton";

export default function ForgotPasswordPage() {
	const router = useRouter();
	const [username, setUsername] = useState("");
	const [step, setStep] = useState<"lookup" | "reset">("lookup");
	const [userExists, setUserExists] = useState(false);
	const [loading, setLoading] = useState(false);

	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showNew, setShowNew] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);

	useEffect(() => {
		setUsername((u) => u.trim());
	}, []);

	const handleLookup = () => {
		if (typeof window === "undefined") return;
		const raw = localStorage.getItem("roleAccess");
		let parsed = null;
		try {
			parsed = raw ? JSON.parse(raw) : null;
		} catch {
			parsed = null;
		}
		if (!Array.isArray(parsed)) {
			toastError("Not found", "No users configured.");
			return;
		}
		const found = parsed.find((r: any) => r.username === username);
		if (!found) {
			toastError("Not found", "Username does not exist.");
			return;
		}
		setUserExists(true);
		setStep("reset");
		toastSuccess("User found", "You may now reset the password.");
	};

	const handleReset = async (e?: React.FormEvent) => {
		if (e) e.preventDefault();
		if (newPassword.length < 8) {
			toastError(
				"Invalid password",
				"Password must be at least 8 characters."
			);
			return;
		}
		if (newPassword !== confirmPassword) {
			toastError("Mismatch", "Passwords do not match.");
			return;
		}
		try {
			setLoading(true);
			const ok = await resetPasswordByUsername(username, newPassword);
			if (!ok) {
				toastError("Failed", "Could not reset password. Try again.");
				return;
			}
			toastSuccess(
				"Password reset",
				"You can now sign in with your new password."
			);
			router.push("/");
		} catch (err) {
			toastError("Error", "An unexpected error occurred.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-[#f3f3f3] dark:bg-[#11111d] p-4">
			<div className="absolute top-4 right-4">
				<DarkModeButton />
			</div>
			<div className="w-full max-w-md">
				<div className="bg-white dark:bg-[#1d1d28] p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">
					<header className="mb-4 text-center">
						<div className="mx-auto w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-3">
							<FileText className="text-white" size={18} />
						</div>
						<h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
							Forgot Password
						</h1>
						<p className="text-md text-gray-600 dark:text-gray-300 mt-1">
							Find your account by username, then reset your
							password.
						</p>
					</header>

					{step === "lookup" && (
						<form
							onSubmit={(e) => {
								e.preventDefault();
								handleLookup();
							}}
							className="space-y-4"
						>
							<div>
								<label className="block text-md font-medium text-gray-700 dark:text-gray-300">
									Username
								</label>
								<input
									type="text"
									value={username}
									onChange={(e) =>
										setUsername(e.target.value.trim())
									}
									placeholder="e.g. admin"
									className="mt-2 block w-full rounded-md border-gray-500 dark:border-gray-700 bg-slate-50 dark:bg-[#2A2A3B] text-gray-900 dark:text-gray-100 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
									required
									aria-label="Username"
								/>
							</div>

							<div className="flex items-center justify-between gap-3">
								<button
									type="button"
									onClick={() => router.push("/")}
									className=" text-sm text-gray-600 dark:text-gray-400 hover:underline"
								>
									Back to sign in
								</button>

								<button
									type="submit"
									className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
									disabled={!username}
								>
									Lookup
								</button>
							</div>
						</form>
					)}

					{step === "reset" && userExists && (
						<form onSubmit={handleReset} className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
									New Password
								</label>
								<div className="relative mt-2">
									<input
										type={showNew ? "text" : "password"}
										value={newPassword}
										onChange={(e) =>
											setNewPassword(e.target.value)
										}
										placeholder="Enter new password"
										className="block w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-[#2A2A3B] text-gray-900 dark:text-gray-100 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
										required
										minLength={8}
										aria-label="New password"
									/>
									<button
										type="button"
										onClick={() => setShowNew((s) => !s)}
										className="absolute inset-y-0 right-2 pr-2 flex items-center text-gray-500"
										aria-label="Toggle new password visibility"
									>
										{showNew ? (
											<EyeOff className="h-5 w-5" />
										) : (
											<Eye className="h-5 w-5" />
										)}
									</button>
								</div>
								<p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
									Minimum 8 characters.
								</p>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
									Confirm Password
								</label>
								<div className="relative mt-2">
									<input
										type={showConfirm ? "text" : "password"}
										value={confirmPassword}
										onChange={(e) =>
											setConfirmPassword(e.target.value)
										}
										placeholder="Confirm new password"
										className="block w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-[#2A2A3B] text-gray-900 dark:text-gray-100 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
										required
										minLength={8}
										aria-label="Confirm password"
									/>
									<button
										type="button"
										onClick={() =>
											setShowConfirm((s) => !s)
										}
										className="absolute inset-y-0 right-2 pr-2 flex items-center text-gray-500"
										aria-label="Toggle confirm password visibility"
									>
										{showConfirm ? (
											<EyeOff className="h-5 w-5" />
										) : (
											<Eye className="h-5 w-5" />
										)}
									</button>
								</div>
							</div>

							<div className="flex items-center justify-between gap-3">
								<button
									type="button"
									onClick={() => {
										setStep("lookup");
										setUserExists(false);
										setNewPassword("");
										setConfirmPassword("");
									}}
									className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
								>
									Back
								</button>

								<button
									type="submit"
									disabled={loading}
									className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
								>
									{loading ? (
										<>
											<Loader2
												className="animate-spin mr-2"
												size={16}
											/>
											Resetting...
										</>
									) : (
										"Reset Password"
									)}
								</button>
							</div>
						</form>
					)}

					{/* footer */}
					<div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
						Remembered your password?{" "}
						<button
							onClick={() => router.push("/")}
							className="text-blue-600 hover:underline"
						>
							Sign in
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
