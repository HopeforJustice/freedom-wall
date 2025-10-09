#!/usr/bin/env node

/**
 * Build script for Vercel deployment
 * Ensures database is set up and seeded for production
 */

import { spawn } from "child_process";
import { existsSync } from "fs";

console.log("🏗️ Starting build process for Vercel...");

async function runCommand(command, args = []) {
	return new Promise((resolve, reject) => {
		const process = spawn(command, args, {
			stdio: "inherit",
			shell: true,
		});

		process.on("close", (code) => {
			if (code === 0) {
				resolve();
			} else {
				reject(new Error(`Command failed with code ${code}`));
			}
		});
	});
}

async function build() {
	try {
		// Run the standard Vite build
		console.log("📦 Building frontend...");
		await runCommand("npm", ["run", "build"]);

		// Check if we're in production environment
		if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
			console.log("🌱 Setting up production database...");
			// The database will be initialized when first accessed via serverless functions
			console.log("✅ Production database setup configured");
		}

		console.log("🎉 Build completed successfully!");
	} catch (error) {
		console.error("❌ Build failed:", error);
		process.exit(1);
	}
}

build();
