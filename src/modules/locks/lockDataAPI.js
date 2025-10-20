// API-based lock data fetcher
// Replaces the hardcoded lockData with database calls

// Determine API base URL based on environment
const getApiBase = () => {
	return "https://freedomwallcms.wpenginepowered.com/wp-json/wp/v2";
};

const API_BASE = getApiBase();

class LockDataAPI {
	constructor() {
		this.allLocks = null;
	}
	// Fetch all locks
	async getAllLocks() {
		try {
			if (this.allLocks) {
				return this.allLocks;
			}

			const perPage = 2000; //upped the limit in functions.php on wp side
			let page = 1;
			let allLocks = [];
			let totalPages = 1;

			do {
				const response = await fetch(
					`${API_BASE}/lock?per_page=${perPage}&page=${page}&_fields[]=title&_fields[]=acf&_fields[]=id`
				);
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				const data = await response.json();

				// Map and add to allLocks
				const locks = data.map((lock) => ({
					id: lock.id,
					name: lock.title.rendered,
					date: lock.acf?.lock_date,
					story: lock.acf?.show_lock_story,
				}));
				allLocks = allLocks.concat(locks);

				// Get total pages from header
				const totalPagesHeader = response.headers.get("X-WP-TotalPages");
				totalPages = totalPagesHeader ? parseInt(totalPagesHeader, 10) : page;

				page++;
			} while (page <= totalPages);

			this.allLocks = allLocks;
			return allLocks;
		} catch (error) {
			console.error("Failed to fetch locks:", error);
			return [];
		}
	}

	// Fetch a specific lock by ID
	async getLock(id) {
		try {
			const response = await fetch(`${API_BASE}/lock/${id}`);
			console.log(`response for lock ${id}:`, response);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const lock = await response.json();

			// Convert to the format expected by the frontend
			const formattedLock = {
				id: lock.id,
				name: lock.title.rendered,
				date: lock.acf.lock_date,
				content: lock.content.rendered,
			};

			return formattedLock;
		} catch (error) {
			console.error(`Failed to fetch lock ${id}:`, error);
			return null;
		}
	}

	// // Fetch all story locks
	// async getStories() {
	// 	if (this.storiesCache) {
	// 		return this.storiesCache;
	// 	}

	// 	try {
	// 		const response = await fetch(`${API_BASE}/stories`);
	// 		if (!response.ok) {
	// 			throw new Error(`HTTP error! status: ${response.status}`);
	// 		}
	// 		const data = await response.json();

	// 		// Convert to frontend format
	// 		this.storiesCache = data.stories.map((story) => ({
	// 			id: story.lock_id,
	// 			name: story.name,
	// 			date: story.date,
	// 			story: true,
	// 			storyTitle: story.title,
	// 			storyBody: story.body,
	// 			storyAuthor: story.author,
	// 			featured: story.featured,
	// 			position: {
	// 				x: story.position_x,
	// 				y: story.position_y,
	// 				z: story.position_z,
	// 			},
	// 		}));

	// 		return this.storiesCache;
	// 	} catch (error) {
	// 		console.error("Failed to fetch stories:", error);
	// 		return [];
	// 	}
	// }

	// // Get locks in the old array format for compatibility
	// async getLockData() {
	// 	const locks = await this.getAllLocks();
	// 	return locks.map((lock) => ({
	// 		id: lock.lock_id,
	// 		name: lock.name,
	// 		date: lock.date,
	// 		story: lock.story,
	// 	}));
	// }

	// // Clear cache (useful for development)
	// clearCache() {
	// 	this.cache.clear();
	// 	this.allLocksCache = null;
	// 	this.storiesCache = null;
	// }
}

// Create a singleton instance
const lockDataAPI = new LockDataAPI();

export { lockDataAPI };

// // For backward compatibility, export a function that returns the lock data array
// export async function getLockData() {
// 	return await lockDataAPI.getLockData();
// }

// // Export the old lockData format as a promise for immediate compatibility
// export const lockData = lockDataAPI.getLockData();
