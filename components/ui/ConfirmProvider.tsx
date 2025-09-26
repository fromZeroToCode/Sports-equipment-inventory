"use client";
import React, { createContext, useContext, useRef, useState } from "react";

type ConfirmOptions = {
	title?: string;
	description?: string;
	confirmText?: string;
	cancelText?: string;
};

type ConfirmFn = (opts?: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
	const [open, setOpen] = useState(false);
	const [opts, setOpts] = useState<ConfirmOptions>({});
	const resolverRef = useRef<(value: boolean) => void | null>(null);

	const confirm: ConfirmFn = (options = {}) => {
		setOpts(options);
		setOpen(true);
		return new Promise<boolean>((resolve) => {
			resolverRef.current = resolve;
		});
	};

	const close = (result: boolean) => {
		setOpen(false);
		// resolve promise
		resolverRef.current?.(result);
		resolverRef.current = null;
	};

	return (
		<ConfirmContext.Provider value={confirm}>
			{children}
			{open && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
					<div className="w-full max-w-md bg-white rounded-lg shadow-lg ">
						<div className="px-6 py-4 border-b border-gray-200">
							<h3 className="text-lg font-medium text-gray-900">
								{opts.title ?? "Confirm"}
							</h3>
						</div>
						<div className="p-6">
							<p className="text-sm text-gray-600">
								{opts.description ??
									"Are you sure you want to continue?"}
							</p>
							<div className="mt-6 flex justify-end space-x-3">
								<button
									onClick={() => close(false)}
									className="px-3 py-2 rounded-md border bg-white text-sm text-gray-700 hover:bg-gray-50"
								>
									{opts.cancelText ?? "Cancel"}
								</button>
								<button
									onClick={() => close(true)}
									className="px-4 py-2 rounded-md bg-red-600 text-white text-sm hover:bg-red-700"
								>
									{opts.confirmText ?? "Confirm"}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</ConfirmContext.Provider>
	);
}

export function useConfirm(): ConfirmFn {
	const ctx = useContext(ConfirmContext);
	if (!ctx)
		throw new Error("useConfirm must be used within a ConfirmProvider");
	return ctx;
}
