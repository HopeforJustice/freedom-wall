import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
	if (req.method !== "GET") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	const { id } = req.query;

	if (!id) {
		return res.status(400).json({ error: "Lock ID is required" });
	}

	try {
		console.log(`Fetching lock with ID: ${id}`);
		const startTime = Date.now();

		const sql = neon(process.env.DATABASE_URL);

		// Simplified query - get lock first, then story if needed
		const lock = await sql`
      SELECT lock_id, name, date, story, position_x, position_y, position_z
      FROM locks 
      WHERE lock_id = ${parseInt(id)}
    `;

		if (lock.length === 0) {
			return res.status(404).json({ error: "Lock not found" });
		}

		let result = lock[0];

		// Only fetch story if this lock has a story
		if (result.story) {
			const story = await sql`
        SELECT title, body, author
        FROM stories 
        WHERE lock_id = ${parseInt(id)}
      `;

			if (story.length > 0) {
				result.story_title = story[0].title;
				result.story_body = story[0].body;
				result.story_author = story[0].author;
			}
		} else {
			result.story_title = null;
			result.story_body = null;
			result.story_author = null;
		}

		const endTime = Date.now();
		console.log(`Lock fetch took ${endTime - startTime}ms`);

		res.status(200).json({ lock: result });
	} catch (error) {
		console.error("Error fetching lock:", error);
		res.status(500).json({
			error: "Failed to fetch lock",
			details: error.message,
		});
	}
}
