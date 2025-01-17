/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		domains: [
			"upload.wikimedia.org",
			"motorgas-testing.s3.us-east-2.amazonaws.com",
		],
		unoptimized: true,
	},
	webpack: (config) => {
		config.module.rules.push({
			test: /\.(glb|gltf)$/,
			type: "asset/resource",
			generator: {
				filename: "static/models/[hash][ext]",
			},
		});
		return config;
	},
	publicRuntimeConfig: {
		NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
	},
};

export default nextConfig;
