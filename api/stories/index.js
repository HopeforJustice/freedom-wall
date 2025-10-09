/**
 * POST /api/stories - Create/update a story
 */

import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
	// Enable CORS
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
	res.setHeader("Access-Control-Allow-Headers", "Content-Type");

	if (req.method === "OPTIONS") {
		res.status(200).end();
		return;
	}

	if (req.method !== "POST") {
		return res.status(405).json({
			success: false,
			error: "Method not allowed",
		});
	}

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
}
