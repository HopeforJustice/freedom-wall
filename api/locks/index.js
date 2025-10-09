/**
 * GET /api/locks - Get all locks
 */

import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
	// Enable CORS
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
	res.setHeader("Access-Control-Allow-Headers", "Content-Type");

	if (req.method === "OPTIONS") {
		res.status(200).end();
		return;
	}

	if (req.method !== "GET") {
		return res.status(405).json({
			success: false,
			error: "Method not allowed",
		});
	}

	try {
		const sql = neon(process.env.DATABASE_URL);
		const locks = await sql`SELECT * FROM locks ORDER BY lock_id`;

		res.status(200).json({
			success: true,
			data: locks,
			count: locks.length,
		});
	} catch (error) {
		console.error("Error fetching locks:", error);
		res.status(500).json({
			success: false,
			error: "Failed to fetch locks",
			details: error.message,
		});
	}
}
