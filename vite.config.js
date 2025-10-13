import { resolve } from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default ({ mode }) => {
	const isProduction = mode === "production";
	const adminExists = existsSync(resolve(__dirname, "src/admin/index.html"));

	const input = { main: resolve(__dirname, "src/index.html") };

	// Only add admin if it exists and we're not in production
	if (!isProduction && adminExists) {
		input.admin = resolve(__dirname, "src/admin/index.html");
	}

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
