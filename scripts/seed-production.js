#!/usr/bin/env node

/**
 * Production data seeding script
 * Seeds the database with lock and story data for production deployment
 */

import { dbOps, getDatabase } from "../api/_db.js";
import { lockData } from "../src/modules/locks/lockData.js";

console.log("🌱 Starting production data seeding...");

try {
	// Initialize database connection
	const db = getDatabase();

	// Check if data already exists
	const existingLocks = dbOps.getAllLocks();
	if (existingLocks.length > 0) {
		console.log(`📊 Database already contains ${existingLocks.length} locks`);
		console.log("✅ Seeding skipped - data already exists");
		process.exit(0);
	}

	console.log("🗃️ Seeding locks...");

	// Prepare lock data for seeding
	const locks = lockData.map((lock) => ({
		id: lock.id,
		name: lock.name,
		date: lock.date,
		position_x: 0,
		position_y: 0,
		position_z: 0,
		rotation_x: 0,
		rotation_y: 0,
		rotation_z: 0,
	}));

	// Insert locks in batches
	const batchSize = 100;
	for (let i = 0; i < locks.length; i += batchSize) {
		const batch = locks.slice(i, i + batchSize);
		const stmt = db.prepare(`
            INSERT INTO locks (id, name, date, position_x, position_y, position_z, rotation_x, rotation_y, rotation_z)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

		const insertMany = db.transaction((locks) => {
			for (const lock of locks) {
				stmt.run(
					lock.id,
					lock.name,
					lock.date,
					lock.position_x,
					lock.position_y,
					lock.position_z,
					lock.rotation_x,
					lock.rotation_y,
					lock.rotation_z
				);
			}
		});

		insertMany(batch);
		console.log(
			`✅ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
				locks.length / batchSize
			)}`
		);
	}

	// Add placeholder stories for locks that have story: true
	console.log("📝 Creating placeholder stories...");
	const storyLocks = lockData.filter((lock) => lock.story === true);

	const stories = storyLocks.map((lock) => ({
		lock_id: lock.id,
		title: `${lock.name}'s Story`,
		content: `This is a placeholder story for ${lock.name} (${lock.date}). The actual story content will be added through the admin interface.`,
		author: null,
	}));

	for (const story of stories) {
		dbOps.insertStory(story);
	}

	// Get final statistics
	const stats = dbOps.getStats();
	console.log("\n✅ Production seeding completed successfully!");
	console.log("📈 Final Statistics:");
	console.log(`   Total Locks: ${stats.totalLocks}`);
	console.log(`   Total Stories: ${stats.totalStories}`);
	console.log(`   Locks with Stories: ${stats.locksWithStories}`);
} catch (error) {
	console.error("❌ Production seeding failed:", error);
	process.exit(1);
}
