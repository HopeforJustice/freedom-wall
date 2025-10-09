/**
 * GET /api/locks/with-stories - Get all locks with their story data
 */

import { dbOps } from "../_db.js";

export default async function handler(req, res) {
	// Enable CORS
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
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
		const locks = dbOps.getAllLocksWithStories();
		res.status(200).json({
			success: true,
			data: locks,
			count: locks.length,
		});
	} catch (error) {
		console.error("Error fetching locks with stories:", error);
		res.status(500).json({
			success: false,
			error: "Failed to fetch locks with stories",
		});
	}
}
