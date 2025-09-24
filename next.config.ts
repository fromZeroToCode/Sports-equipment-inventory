/** @type {import('next').NextConfig} */
const basePath = process.env.BASE_PATH || "";
module.exports = {
	output: "export",
	trailingSlash: true,
	basePath,
	assetPrefix: basePath || "",
};
