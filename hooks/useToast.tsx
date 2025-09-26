import { toast } from "react-toastify";
import React from "react";
import { Slide } from "react-toastify";

export function toastSuccess(message: string, description?: string) {
	toast.success(
		<div style={{ display: "flex" }}>
			<span className="mr-2" />
			<div>
				<strong>{message}</strong>
				{description && (
					<div style={{ fontSize: "0.9em", marginTop: "4px" }}>
						{description}
					</div>
				)}
			</div>
		</div>,
		{
			position: "bottom-right",
			autoClose: 3000,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
			theme: "colored",
			transition: Slide,
		}
	);
}

export function toastError(message: string, description?: string) {
	toast.error(
		<div style={{ display: "flex" }}>
			<span className="mr-2" />
			<div>
				<strong>{message}</strong>
				{description && (
					<div style={{ fontSize: "0.9em", marginTop: "4px" }}>
						{description}
					</div>
				)}
			</div>
		</div>,
		{
			position: "bottom-right",
			autoClose: 3000,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
			theme: "colored",
			transition: Slide,
		}
	);
}

export function toastInfo(message: string, description?: string) {
	toast.info(
		<div style={{ display: "flex" }}>
			<span className="mr-2" />
			<div>
				<strong>{message}</strong>
				{description && (
					<div style={{ fontSize: "0.9em", marginTop: "4px" }}>
						{description}
					</div>
				)}
			</div>
		</div>,
		{
			position: "bottom-right",
			autoClose: 3000,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
			theme: "colored",
			transition: Slide,
		}
	);
}

export function toastWarning(message: string, description?: string) {
	toast.warn(
		<div style={{ display: "flex" }}>
			<span className="mr-2" />
			<div>
				<strong>{message}</strong>
				{description && (
					<div style={{ fontSize: "0.9em", marginTop: "4px" }}>
						{description}
					</div>
				)}
			</div>
		</div>,
		{
			position: "bottom-right",
			autoClose: 3000,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
			theme: "colored",
			transition: Slide,
		}
	);
}
