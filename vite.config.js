import { resolve } from "path";

export default ({ mode }) => {
	const isProduction = mode === "production";

	return {
		root: "src/",
		publicDir: "../static/",
		base: "./",
		build: {
			rollupOptions: {
				input: isProduction
					? { main: resolve(__dirname, "src/index.html") }
					: {
							main: resolve(__dirname, "src/index.html"),
							admin: resolve(__dirname, "src/admin/index.html"),
					  },
			},
			outDir: "../dist",
			emptyOutDir: true,
			sourcemap: true,
		},
		server: {
			host: true,
			open: !(
				"SANDBOX_URL" in process.env || "CODESANDBOX_HOST" in process.env
			),
			proxy: {
				// Proxy API requests to the backend server
				"/api": {
					target: "http://localhost:3001",
					changeOrigin: true,
					secure: false,
				},
			},
		},
	};
};
