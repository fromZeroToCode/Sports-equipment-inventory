"use client";

import React, { useState } from "react";
import { toastError, toastSuccess } from "@/hooks/useToast";
import { Lock, Mail, Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSessionRedirectToDashboard } from "@/hooks/useSessionRedirect";
import DarkModeButton from "@/components/ui/DarkModeButton";

import { loginUser } from "@/lib/auth";

export default function login() {
	useSessionRedirectToDashboard();

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
		<div className="min-h-screen flex items-center justify-center  bg-indigo-50 dark:bg-gray-900 relative">
			<div className="absolute top-4 right-4">
				<DarkModeButton />
			</div>

			<div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-200 dark:border-gray-700">
				<div className="text-center mb-8">
					<div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
						<Lock className="text-white" size={24} />
					</div>
					<h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100	">
						GearSync
					</h1>
					<p className="text-gray-600 dark:text-gray-400 mt-2">
						Sign in to manage your inventory
					</p>
				</div>

				{/* form */}
				<form onSubmit={handleSubmit} className="space-y-6">
					{/* username field */}
					<div>
						<label
							className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2"
							htmlFor="username"
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

					{/* password field */}
					<div>
						<label
							className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2"
							htmlFor="password"
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
								onClick={() => setShowPassword(!showPassword)}
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

					<button
						type="submit"
						disabled={submitting}
						className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
					>
						{submitting ? (
							<>
								<Loader2
									className="animate-spin mr-2"
									size={20}
								/>
								Signing in...
							</>
						) : (
							"Sign In"
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
	);
}
