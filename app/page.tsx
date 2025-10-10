"use client";

import React, { useState, useEffect } from "react";
import { toastError, toastSuccess } from "@/hooks/useToast";
import { Lock, Mail, Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSessionRedirectToDashboard } from "@/hooks/useSessionRedirect";
import DarkModeButton from "@/components/ui/DarkModeButton";

import { loginUser } from "@/lib/auth";

export default function login() {
	useSessionRedirectToDashboard();

	useEffect(() => {
		const defaultRoles = [
			{ id: 1, username: "admin", password: "admin123", role: "admin" },
			{ id: 2, username: "coach", password: "coach123", role: "coach" },
			{ id: 3, username: "staff", password: "staff123", role: "staff" },
		];
		try {
			const raw = localStorage.getItem("roleAccess");
			let roles = raw ? JSON.parse(raw) : null;

			if (!Array.isArray(roles)) {
				localStorage.setItem(
					"roleAccess",
					JSON.stringify(defaultRoles)
				);
				return;
			}

			let changed = false;
			for (const req of defaultRoles) {
				if (!roles.some((r: any) => r.role === req.role)) {
					const maxId = roles.reduce(
						(acc: number, r: any) =>
							Math.max(acc, Number(r.id) || 0),
						0
					);
					roles.push({ ...req, id: maxId + 1 });
					changed = true;
				}
			}

			if (changed) {
				localStorage.setItem("roleAccess", JSON.stringify(roles));
			}
		} catch (err) {
			localStorage.setItem("roleAccess", JSON.stringify(defaultRoles));
		}
	}, []);

	const router = useRouter();
	const [form, setForm] = useState({
		username: "",
		password: "",
	});

	const [submitting, setSubmitting] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [errors, setErrors] = useState({
		username: "",
		password: "",
	});

	const validateForm = () => {
		const newErrors = {
			username: "",
			password: "",
		};

		// username validation
		if (form.username.length === 0) {
			newErrors.username = "Username is required";
		} else if (form.username.length < 3) {
			newErrors.username = "Username must be at least 3 characters";
		}

		// password validation
		if (form.password.length === 0) {
			newErrors.password = "Password is required";
		} else if (form.password.length < 8) {
			newErrors.password = "Password must be at least 8 characters";
		}

		// type validation
		if (
			typeof form.username !== "string" ||
			typeof form.password !== "string"
		) {
			toastError(
				"Invalid form data",
				"Please check your input and try again."
			);
			return false;
		}

		setErrors(newErrors);
		return !newErrors.username && !newErrors.password;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			toastError(
				"Invalid form data",
				"Please check your input and try again."
			);
			return;
		}

		try {
			setSubmitting(true);

			const response = await loginUser(form.username, form.password);
			if (!response) {
				toastError(
					"Login failed",
					"Invalid username or password. Please try again."
				);
				return;
			}

			toastSuccess("Login successful", "Welcome back!");
			router.push("/dashboard");
		} catch (error) {
			toastError(
				"Login failed",
				"Invalid username or password. Please try again."
			);
		} finally {
			setSubmitting(false);
		}
	};

	const handleInputChange = (field: keyof typeof form, value: string) => {
		setForm({ ...form, [field]: value });

		if (errors[field]) {
			setErrors({ ...errors, [field]: "" });
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-indigo-50 dark:bg-gray-900 p-4">
			<div className="absolute top-4 right-4">
				<DarkModeButton />
			</div>
			<div className="w-full max-w-md">
				<div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
					<header className="text-center mb-6">
						<div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
							<Lock className="text-white" size={24} />
						</div>
						<h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
							GearSync
						</h1>
						<p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
							Sign in to manage your inventory
						</p>
					</header>

					{/* form */}
					<form onSubmit={handleSubmit} className="space-y-5">
						{/* username */}
						<div>
							<label
								htmlFor="username"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
							>
								Username
							</label>
							<div className="relative">
								<input
									id="username"
									placeholder="Enter your username"
									type="text"
									className={`w-full pr-3 pl-11 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors dark:text-gray-200 dark:border-gray-700 ${
										errors.username
											? "border-red-300 focus:ring-red-500"
											: "border-gray-300 focus:ring-blue-500"
									}`}
									value={form.username}
									onChange={(e) =>
										handleInputChange(
											"username",
											e.target.value
										)
									}
									required
								/>
								<Mail
									className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
										errors.username
											? "text-red-400"
											: "text-gray-400"
									}`}
									size={20}
								/>
							</div>
							{errors.username && (
								<p className="mt-1 text-sm text-red-600">
									{errors.username}
								</p>
							)}
						</div>

						{/* password */}
						<div>
							<label
								htmlFor="password"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
							>
								Password
							</label>
							<div className="relative">
								<input
									id="password"
									placeholder="Enter your password"
									type={showPassword ? "text" : "password"}
									className={`w-full pr-12 pl-11 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors dark:text-gray-200 dark:border-gray-700 ${
										errors.password
											? "border-red-300 focus:ring-red-500"
											: "border-gray-300 focus:ring-blue-500"
									}`}
									value={form.password}
									onChange={(e) =>
										handleInputChange(
											"password",
											e.target.value
										)
									}
									required
								/>
								<Lock
									className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
										errors.password
											? "text-red-400"
											: "text-gray-400"
									}`}
									size={20}
								/>
								<button
									type="button"
									className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
									onClick={() =>
										setShowPassword(!showPassword)
									}
									aria-label="Toggle password visibility"
								>
									{showPassword ? (
										<EyeOff size={20} />
									) : (
										<Eye size={20} />
									)}
								</button>
							</div>
							{errors.password && (
								<p className="mt-1 text-sm text-red-600">
									{errors.password}
								</p>
							)}
						</div>
						<div className="flex items-center justify-between text-sm">
							<button
								type="button"
								onClick={() => router.push("/forgot-password")}
								className="text-blue-600 hover:underline"
							>
								Forgot password?
							</button>
						</div>

						<button
							type="submit"
							disabled={submitting}
							className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors font-medium"
						>
							{submitting ? (
								<>
									<Loader2
										className="animate-spin"
										size={18}
									/>
									<span>Signing in...</span>
								</>
							) : (
								"Sign in"
							)}
						</button>
					</form>

					<div className="mt-6 text-center">
						<p className="text-sm text-gray-600 dark:text-gray-400">
							GearSync App &copy; 2025. All rights reserved.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
