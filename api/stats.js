/**
 * GET /api/stats - Get database statistics
 */

import { neon } from "@neondatabase/serverless";

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
		const sql = neon(process.env.DATABASE_URL);

		// Get statistics from Neon database
		const lockCount = await sql`SELECT COUNT(*) as count FROM locks`;
		const storyCount = await sql`SELECT COUNT(*) as count FROM stories`;
		const locksWithStoriesCount = await sql`
			SELECT COUNT(DISTINCT lock_id) as count FROM stories
		`;

		const stats = {
			totalLocks: lockCount[0].count,
			totalStories: storyCount[0].count,
			locksWithStories: locksWithStoriesCount[0].count,
		};

		res.status(200).json({
			success: true,
			data: stats,
		});
	} catch (error) {
		console.error("Error fetching stats:", error);
		res.status(500).json({
			success: false,
			error: "Failed to fetch statistics",
			details: error.message,
		});
	}
}
