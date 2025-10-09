/**
 * GET /api/locks/[id] - Get a specific lock by ID
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
		const { id } = req.query;
		const lockId = parseInt(id);

		if (isNaN(lockId)) {
			return res.status(400).json({
				success: false,
				error: "Invalid lock ID",
			});
		}

		const lock = dbOps.getLockById(lockId);
		if (!lock) {
			return res.status(404).json({
				success: false,
				error: "Lock not found",
			});
		}

		res.status(200).json({
			success: true,
			data: lock,
		});
	} catch (error) {
		console.error("Error fetching lock:", error);
		res.status(500).json({
			success: false,
			error: "Failed to fetch lock",
		});
	}
}
