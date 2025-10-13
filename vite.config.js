import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default ({ command, mode }) => {
	// For production builds, only include main entry point
	const input =
		process.env.NODE_ENV === "production" || mode === "production"
			? { main: resolve(__dirname, "src/index.html") }
			: {
					main: resolve(__dirname, "src/index.html"),
					admin: resolve(__dirname, "src/admin/index.html"),
			  };

	return {
		root: "src/",
		publicDir: "../static/",
		base: "./",
		build: {
			rollupOptions: {
				input,
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
