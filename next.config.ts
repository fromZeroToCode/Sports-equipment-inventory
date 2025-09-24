import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	turbopack: {
		root: process.cwd(),
	},
	// basePath: "/Sports-equipment-inventory",
	// assetPrefix: "/Sports-equipment-inventory",
	output: "export",
	trailingSlash: true,
};

export default nextConfig;
