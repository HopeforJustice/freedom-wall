import { neon } from "@neondatabase/serverless";

// Check if request is from localhost only
function isLocalhostRequest(req) {
	const forwardedFor = req.headers["x-forwarded-for"];
	const remoteAddress =
		req.connection?.remoteAddress || req.socket?.remoteAddress;
	const host = req.headers.host;

	// Check if running locally (development)
	const isLocalhost =
		host &&
		(host.startsWith("localhost") ||
			host.startsWith("127.0.0.1") ||
			host.startsWith("0.0.0.0"));

	// In development, allow localhost
	if (process.env.NODE_ENV !== "production" || isLocalhost) {
		return true;
	}

	// In production, deny access to admin endpoints
	return false;
}

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

	// Check if request is from localhost
	if (!isLocalhostRequest(req)) {
		return res.status(403).json({
			error: "Admin functionality is only available when running locally",
			message:
				"Access denied: Admin endpoints are restricted to localhost for security.",
		});
	}

	const sql = neon(process.env.DATABASE_URL);

	try {
		switch (req.method) {
			case "GET":
				// Get all locks with pagination
				const { page = 1, limit = 50, story: storyFilter } = req.query;
				const offset = (parseInt(page) - 1) * parseInt(limit);

				let whereClause = "";
				if (storyFilter !== undefined) {
					whereClause = `WHERE story = ${storyFilter === "true"}`;
				}

				const locks = await sql`
          SELECT l.*, s.title as story_title, s.body as story_body, s.author as story_author
          FROM locks l
          LEFT JOIN stories s ON l.lock_id = s.lock_id
          ${whereClause ? sql.unsafe(whereClause) : sql``}
          ORDER BY l.lock_id
          LIMIT ${parseInt(limit)} OFFSET ${offset}
        `;

				const total = await sql`SELECT COUNT(*) as count FROM locks ${
					whereClause ? sql.unsafe(whereClause) : sql``
				}`;

				return res.status(200).json({
					locks,
					pagination: {
						page: parseInt(page),
						limit: parseInt(limit),
						total: parseInt(total[0].count),
						pages: Math.ceil(parseInt(total[0].count) / parseInt(limit)),
					},
				});

			case "POST":
				// Create new lock
				const {
					lock_id,
					name,
					date,
					story: hasStory = false,
					position_x,
					position_y,
					position_z,
					story_title,
					story_body,
					story_author,
					story_featured = false,
				} = req.body;

				if (!lock_id || !name || !date) {
					return res
						.status(400)
						.json({ error: "lock_id, name, and date are required" });
				}

				const newLock = await sql`
          INSERT INTO locks (lock_id, name, date, story, position_x, position_y, position_z)
          VALUES (${lock_id}, ${name}, ${date}, ${hasStory}, ${position_x}, ${position_y}, ${position_z})
          RETURNING *
        `;

				// If story data is provided, create the story
				if (hasStory && (story_title || story_body)) {
					await sql`
            INSERT INTO stories (lock_id, title, body, author, featured)
            VALUES (${lock_id}, ${story_title}, ${story_body}, ${story_author}, ${story_featured})
          `;
				}

				return res.status(201).json({ lock: newLock[0] });

			case "PUT":
				// Update existing lock
				const { id } = req.query;
				const updateData = req.body;

				if (!id) {
					return res.status(400).json({ error: "Lock ID is required" });
				}

				// Start a transaction-like approach by handling lock and story separately
				const lockId = parseInt(id);

				// Update the lock data
				const updatedLock = await sql`
          UPDATE locks 
          SET 
            name = COALESCE(${updateData.name}, name),
            date = COALESCE(${updateData.date}, date),
            story = COALESCE(${updateData.story}, story),
            position_x = COALESCE(${updateData.position_x}, position_x),
            position_y = COALESCE(${updateData.position_y}, position_y),
            position_z = COALESCE(${updateData.position_z}, position_z),
            updated_at = CURRENT_TIMESTAMP
          WHERE lock_id = ${lockId}
          RETURNING *
        `;

				if (updatedLock.length === 0) {
					return res.status(404).json({ error: "Lock not found" });
				}

				// Handle story data if provided
				if (
					updateData.story &&
					(updateData.story_title || updateData.story_body)
				) {
					// Check if story already exists
					const existingStory = await sql`
            SELECT * FROM stories WHERE lock_id = ${lockId}
          `;

					if (existingStory.length > 0) {
						// Update existing story
						await sql`
              UPDATE stories 
              SET 
                title = COALESCE(${updateData.story_title}, title),
                body = COALESCE(${updateData.story_body}, body),
                author = COALESCE(${updateData.story_author}, author),
                featured = COALESCE(${
									updateData.story_featured || false
								}, featured),
                updated_at = CURRENT_TIMESTAMP
              WHERE lock_id = ${lockId}
            `;
					} else {
						// Create new story
						await sql`
              INSERT INTO stories (lock_id, title, body, author, featured)
              VALUES (${lockId}, ${updateData.story_title}, ${
							updateData.story_body
						}, ${updateData.story_author}, ${
							updateData.story_featured || false
						})
            `;
					}
				} else if (updateData.story === false) {
					// If story is explicitly set to false, remove any existing story
					await sql`DELETE FROM stories WHERE lock_id = ${lockId}`;
				}

				return res.status(200).json({ lock: updatedLock[0] });

			case "DELETE":
				// Delete lock
				const { id: deleteId } = req.query;

				if (!deleteId) {
					return res.status(400).json({ error: "Lock ID is required" });
				}

				// Delete associated stories first
				await sql`DELETE FROM stories WHERE lock_id = ${parseInt(deleteId)}`;

				const deletedLock = await sql`
          DELETE FROM locks WHERE lock_id = ${parseInt(deleteId)}
          RETURNING *
        `;

				if (deletedLock.length === 0) {
					return res.status(404).json({ error: "Lock not found" });
				}

				return res
					.status(200)
					.json({ message: "Lock deleted successfully", lock: deletedLock[0] });

			default:
				return res.status(405).json({ error: "Method not allowed" });
		}
	} catch (error) {
		console.error("Admin locks error:", error);
		return res.status(500).json({
			error: "Internal server error",
			details: error.message,
		});
	}
}
