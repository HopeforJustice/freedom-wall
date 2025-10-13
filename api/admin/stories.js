import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
	// Set CORS headers
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader(
		"Access-Control-Allow-Methods",
		"GET, POST, PUT, DELETE, OPTIONS"
	);
	res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

	if (req.method === "OPTIONS") {
		return res.status(200).end();
	}

	const sql = neon(process.env.DATABASE_URL);

	try {
		switch (req.method) {
			case "GET":
				// Get all stories with lock information
				const { page = 1, limit = 50 } = req.query;
				const offset = (parseInt(page) - 1) * parseInt(limit);

				const stories = await sql`
          SELECT s.*, l.name as lock_name, l.date as lock_date
          FROM stories s
          JOIN locks l ON s.lock_id = l.lock_id
          ORDER BY s.lock_id
          LIMIT ${parseInt(limit)} OFFSET ${offset}
        `;

				const total = await sql`SELECT COUNT(*) as count FROM stories`;

				return res.status(200).json({
					stories,
					pagination: {
						page: parseInt(page),
						limit: parseInt(limit),
						total: parseInt(total[0].count),
						pages: Math.ceil(parseInt(total[0].count) / parseInt(limit)),
					},
				});

			case "POST":
				// Create new story
				const { lock_id, title, body, author, featured = false } = req.body;

				if (!lock_id || !title || !body) {
					return res
						.status(400)
						.json({ error: "lock_id, title, and body are required" });
				}

				// Check if lock exists and update it to have story=true
				const lockExists = await sql`
          SELECT lock_id FROM locks WHERE lock_id = ${lock_id}
        `;

				if (lockExists.length === 0) {
					return res.status(404).json({ error: "Lock not found" });
				}

				// Update lock to mark it as having a story
				await sql`
          UPDATE locks SET story = true, updated_at = CURRENT_TIMESTAMP 
          WHERE lock_id = ${lock_id}
        `;

				const newStory = await sql`
          INSERT INTO stories (lock_id, title, body, author, featured)
          VALUES (${lock_id}, ${title}, ${body}, ${author}, ${featured})
          RETURNING *
        `;

				return res.status(201).json({ story: newStory[0] });

			case "PUT":
				// Update existing story
				const { lock_id: updateLockId } = req.query;
				const updateData = req.body;

				if (!updateLockId) {
					return res.status(400).json({ error: "Lock ID is required" });
				}

				const updatedStory = await sql`
          UPDATE stories 
          SET 
            title = COALESCE(${updateData.title}, title),
            body = COALESCE(${updateData.body}, body),
            author = COALESCE(${updateData.author}, author),
            featured = COALESCE(${updateData.featured}, featured),
            updated_at = CURRENT_TIMESTAMP
          WHERE lock_id = ${parseInt(updateLockId)}
          RETURNING *
        `;

				if (updatedStory.length === 0) {
					return res.status(404).json({ error: "Story not found" });
				}

				return res.status(200).json({ story: updatedStory[0] });

			case "DELETE":
				// Delete story
				const { lock_id: deleteLockId } = req.query;

				if (!deleteLockId) {
					return res.status(400).json({ error: "Lock ID is required" });
				}

				const deletedStory = await sql`
          DELETE FROM stories WHERE lock_id = ${parseInt(deleteLockId)}
          RETURNING *
        `;

				if (deletedStory.length === 0) {
					return res.status(404).json({ error: "Story not found" });
				}

				// Update lock to mark it as not having a story
				await sql`
          UPDATE locks SET story = false, updated_at = CURRENT_TIMESTAMP 
          WHERE lock_id = ${parseInt(deleteLockId)}
        `;

				return res.status(200).json({
					message: "Story deleted successfully",
					story: deletedStory[0],
				});

			default:
				return res.status(405).json({ error: "Method not allowed" });
		}
	} catch (error) {
		console.error("Admin stories error:", error);
		return res.status(500).json({
			error: "Internal server error",
			details: error.message,
		});
	}
}
