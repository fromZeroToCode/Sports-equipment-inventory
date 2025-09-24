"use client";
import React, { createContext, useContext, useState, useCallback, useRef } from "react";

interface LoadingContextType {
	isLoading: boolean;
	startLoading: () => void;
	stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [isLoading, setIsLoading] = useState(false);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	const startLoading = useCallback(() => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}

		timeoutRef.current = setTimeout(() => {
			setIsLoading(true);
		}, 500);
	}, []);

	const stopLoading = useCallback(() => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}
		setIsLoading(false);
	}, []);

	return (
		<LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>{children}</LoadingContext.Provider>
	);
};

export const useLoading = () => {
	const context = useContext(LoadingContext);
	if (context === undefined) {
		throw new Error("useLoading must be used within a LoadingProvider");
	}
	return context;
};
