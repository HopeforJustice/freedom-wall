/**
 * GET /api/stories/[lockId] - Get story for a specific lock
 * POST /api/stories - Create/update a story
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

	if (req.method === "GET") {
		try {
			console.log("Story endpoint called with lockId:", req.query.lockId);
			console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);

			const { lockId } = req.query;
			const parsedLockId = parseInt(lockId);

			if (isNaN(parsedLockId)) {
				console.log("Invalid lockId provided:", lockId);
				return res.status(400).json({
					success: false,
					error: "Invalid lock ID",
				});
			}

			console.log("Connecting to Neon database for lockId:", parsedLockId);
			const sql = neon(process.env.DATABASE_URL);

			console.log("Executing query for stories...");
			const stories = await sql`
				SELECT * FROM stories WHERE lock_id = ${parsedLockId}
			`;

			console.log("Query result:", stories);

			if (!stories || stories.length === 0) {
				console.log("No stories found for lockId:", parsedLockId);
				return res.status(404).json({
					success: false,
					error: "Story not found for this lock",
				});
			}

			const story = stories[0];
			console.log("Found story:", story);

			res.status(200).json({
				success: true,
				data: {
					id: story.id,
					lock_id: story.lock_id,
					title: story.title,
					content: story.body, // Note: using 'body' from DB but returning as 'content'
					author: story.author,
					created_at: story.created_at,
					updated_at: story.updated_at,
				},
			});
		} catch (error) {
			console.error("Error fetching story:", error);
			console.error("Error stack:", error.stack);
			res.status(500).json({
				success: false,
				error: "Failed to fetch story",
				details: error.message,
			});
		}
	} else if (req.method === "POST") {
		try {
			const { lock_id, title, content, author } = req.body;

			if (!lock_id || !content) {
				return res.status(400).json({
					success: false,
					error: "Missing required fields: lock_id, content",
				});
			}

			const sql = neon(process.env.DATABASE_URL);

			// Insert or update story
			const result = await sql`
				INSERT INTO stories (lock_id, title, body, author)
				VALUES (${lock_id}, ${title || null}, ${content}, ${author || null})
				ON CONFLICT (lock_id) 
				DO UPDATE SET 
					title = EXCLUDED.title,
					body = EXCLUDED.body,
					author = EXCLUDED.author,
					updated_at = CURRENT_TIMESTAMP
				RETURNING id
			`;

			res.status(201).json({
				success: true,
				data: { id: result[0].id },
			});
		} catch (error) {
			console.error("Error creating story:", error);
			res.status(500).json({
				success: false,
				error: "Failed to create story",
				details: error.message,
			});
		}
	} else {
		res.status(405).json({
			success: false,
			error: "Method not allowed",
		});
	}
}
