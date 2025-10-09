/**
 * Database utility for Vercel serverless functions
 * Creates and manages SQLite database connection
 */

import Database from "better-sqlite3";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database path - in Vercel, this will be in /tmp
const DB_PATH =
	process.env.NODE_ENV === "production"
		? "/tmp/freedom-wall.db"
		: join(__dirname, "../database/freedom-wall.db");

let dbInstance = null;

export function getDatabase() {
	if (!dbInstance) {
		try {
			dbInstance = new Database(DB_PATH);
			dbInstance.pragma("journal_mode = WAL");

			// In production, initialize schema if database doesn't exist
			if (process.env.NODE_ENV === "production") {
				initializeSchema(dbInstance);
				// You might want to seed data here too
			}

			console.log("✅ Database connected:", DB_PATH);
		} catch (error) {
			console.error("❌ Database connection failed:", error);
			throw error;
		}
	}
	return dbInstance;
}

function initializeSchema(db) {
	try {
		// Create tables if they don't exist
		const schema = `
            CREATE TABLE IF NOT EXISTS locks (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                date TEXT NOT NULL,
                position_x REAL DEFAULT 0,
                position_y REAL DEFAULT 0,
                position_z REAL DEFAULT 0,
                rotation_x REAL DEFAULT 0,
                rotation_y REAL DEFAULT 0,
                rotation_z REAL DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS stories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                lock_id INTEGER NOT NULL,
                title TEXT,
                content TEXT NOT NULL,
                author TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (lock_id) REFERENCES locks (id) ON DELETE CASCADE
            );

            CREATE INDEX IF NOT EXISTS idx_locks_id ON locks (id);
            CREATE INDEX IF NOT EXISTS idx_stories_lock_id ON stories (lock_id);

            CREATE VIEW IF NOT EXISTS locks_with_stories AS
            SELECT 
                l.id,
                l.name,
                l.date,
                l.position_x,
                l.position_y,
                l.position_z,
                l.rotation_x,
                l.rotation_y,
                l.rotation_z,
                s.id as story_id,
                s.title as story_title,
                s.content as story_content,
                s.author as story_author,
                CASE WHEN s.id IS NOT NULL THEN 1 ELSE 0 END as has_story
            FROM locks l
            LEFT JOIN stories s ON l.id = s.lock_id;
        `;

		db.exec(schema);
		console.log("✅ Schema initialized");

		// Check if we need to seed data
		const lockCount = db.prepare("SELECT COUNT(*) as count FROM locks").get();
		if (lockCount.count === 0) {
			console.log("🌱 Database is empty, seeding with initial data...");
			seedInitialData(db);
		}
	} catch (error) {
		console.error("❌ Schema initialization failed:", error);
		throw error;
	}
}

// Seed initial data for production
function seedInitialData(db) {
	try {
		console.log("📦 Seeding initial lock data...");

		// Basic lock data structure (minimal set for production)
		const initialLocks = [
			{ id: 207, name: "PAVOL", date: "2020", story: true },
			{ id: 461, name: "DIANA", date: "2025", story: true },
			{ id: 568, name: "HAJI", date: "2023", story: true },
			{ id: 582, name: "VINCA", date: "2022", story: true },
			{ id: 585, name: "MESA", date: "2024", story: true },
			{ id: 654, name: "ELIZA", date: "2017", story: true },
			{ id: 723, name: "JERZY", date: "2018", story: true },
			{ id: 840, name: "STEFAN", date: "2024", story: true },
			{ id: 848, name: "THOMAS", date: "2025", story: true },
			{ id: 912, name: "ADANASZ", date: "2021", story: true },
		];

		// Insert locks
		const lockStmt = db.prepare(`
            INSERT INTO locks (id, name, date, position_x, position_y, position_z, rotation_x, rotation_y, rotation_z)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

		const storyStmt = db.prepare(`
            INSERT INTO stories (lock_id, title, content, author)
            VALUES (?, ?, ?, ?)
        `);

		const insertMany = db.transaction((locks) => {
			for (const lock of locks) {
				// Insert lock
				lockStmt.run(lock.id, lock.name, lock.date, 0, 0, 0, 0, 0, 0);

				// Insert story if applicable
				if (lock.story) {
					storyStmt.run(
						lock.id,
						`${lock.name}'s Story`,
						`This is a placeholder story for ${lock.name} (${lock.date}). The actual story content will be added through the admin interface.`,
						null
					);
				}
			}
		});

		insertMany(initialLocks);
		console.log(`✅ Seeded ${initialLocks.length} initial locks with stories`);
	} catch (error) {
		console.error("❌ Initial data seeding failed:", error);
		// Don't throw - let the app continue with empty database
	}
}

// Database operation helpers
export const dbOps = {
	getAllLocks() {
		const db = getDatabase();
		const stmt = db.prepare("SELECT * FROM locks ORDER BY id");
		return stmt.all();
	},

	getAllLocksWithStories() {
		const db = getDatabase();
		const stmt = db.prepare("SELECT * FROM locks_with_stories ORDER BY id");
		return stmt.all();
	},

	getLocksWithStories() {
		const db = getDatabase();
		const stmt = db.prepare(`
            SELECT DISTINCT l.* FROM locks l 
            INNER JOIN stories s ON l.id = s.lock_id 
            ORDER BY l.id
        `);
		return stmt.all();
	},

	getLockById(lockId) {
		const db = getDatabase();
		const stmt = db.prepare("SELECT * FROM locks WHERE id = ?");
		return stmt.get(lockId);
	},

	getStoryByLockId(lockId) {
		const db = getDatabase();
		const stmt = db.prepare("SELECT * FROM stories WHERE lock_id = ?");
		return stmt.get(lockId);
	},

	insertLock(lockData) {
		const db = getDatabase();
		const stmt = db.prepare(`
            INSERT INTO locks (id, name, date, position_x, position_y, position_z, rotation_x, rotation_y, rotation_z)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
		return stmt.run(
			lockData.id,
			lockData.name,
			lockData.date,
			lockData.position_x || 0,
			lockData.position_y || 0,
			lockData.position_z || 0,
			lockData.rotation_x || 0,
			lockData.rotation_y || 0,
			lockData.rotation_z || 0
		);
	},

	insertStory(storyData) {
		const db = getDatabase();
		const stmt = db.prepare(`
            INSERT OR REPLACE INTO stories (lock_id, title, content, author)
            VALUES (?, ?, ?, ?)
        `);
		return stmt.run(
			storyData.lock_id,
			storyData.title || null,
			storyData.content,
			storyData.author || null
		);
	},

	getStats() {
		const db = getDatabase();
		const lockCount = db.prepare("SELECT COUNT(*) as count FROM locks").get();
		const storyCount = db
			.prepare("SELECT COUNT(*) as count FROM stories")
			.get();
		const locksWithStoriesCount = db
			.prepare(
				`
            SELECT COUNT(DISTINCT lock_id) as count FROM stories
        `
			)
			.get();

		return {
			totalLocks: lockCount.count,
			totalStories: storyCount.count,
			locksWithStories: locksWithStoriesCount.count,
		};
	},
};
