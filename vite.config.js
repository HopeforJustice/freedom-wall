import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default ({ command, mode }) => {
	return {
		plugins: [react()],
		root: "src/",
		publicDir: "../static/",
		base: "./",
		build: {
			outDir: "../dist",
			emptyOutDir: true,
			sourcemap: true,
		},
		define: {
			"%VITE_VERCEL_ENV%": JSON.stringify(
				process.env.VERCEL_ENV || process.env.NODE_ENV || "development"
			),
		},
	};
};
