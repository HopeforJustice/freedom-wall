import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	try {
		const sql = neon(process.env.DATABASE_URL);

		// Drop existing tables to ensure clean schema
		await sql`DROP TABLE IF EXISTS stories CASCADE`;
		await sql`DROP TABLE IF EXISTS locks CASCADE`;

		// Create locks table
		await sql`
      CREATE TABLE IF NOT EXISTS locks (
        id SERIAL PRIMARY KEY,
        lock_id INTEGER UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        date VARCHAR(255) NOT NULL,
        story BOOLEAN DEFAULT FALSE,
        position_x REAL,
        position_y REAL,
        position_z REAL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

		// Create stories table for rich story content
		await sql`
      CREATE TABLE IF NOT EXISTS stories (
        id SERIAL PRIMARY KEY,
        lock_id INTEGER UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        body TEXT NOT NULL,
        author VARCHAR(255),
        featured BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (lock_id) REFERENCES locks(lock_id)
      )
    `;

		// Create index on lock_id for faster queries
		await sql`CREATE INDEX IF NOT EXISTS idx_locks_lock_id ON locks(lock_id)`;
		await sql`CREATE INDEX IF NOT EXISTS idx_locks_story ON locks(story)`;
		await sql`CREATE INDEX IF NOT EXISTS idx_stories_lock_id ON stories(lock_id)`;

		res.status(200).json({
			message: "Database setup completed successfully",
			tables: ["locks", "stories"],
			indexes: ["idx_locks_lock_id", "idx_locks_story", "idx_stories_lock_id"],
		});
	} catch (error) {
		console.error("Database setup error:", error);
		res.status(500).json({
			error: "Failed to setup database",
			details: error.message,
		});
	}
}
