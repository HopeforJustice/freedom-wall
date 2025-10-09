/**
 * Data service for Freedom Wall frontend
 * Handles API communication with the backend
 */

const API_BASE =
	window.location.hostname === "localhost"
		? "http://localhost:3001/api"
		: "/api";

class FreedomWallDataService {
	/**
	 * Get all locks with their story information
	 */
	async getAllLocks() {
		try {
			const response = await fetch(`${API_BASE}/locks/with-stories`);
			const data = await response.json();

			if (!data.success) {
				throw new Error(data.error || "Failed to fetch locks");
			}

			// Transform data to match existing frontend format
			return data.data.map((lock) => ({
				id: lock.id,
				name: lock.name,
				date: lock.date,
				story: lock.story_id !== null, // Convert to boolean for compatibility
				storyData: lock.story_id
					? {
							id: lock.story_id,
							title: lock.story_title,
							content: lock.story_content,
							author: lock.story_author,
					  }
					: null,
			}));
		} catch (error) {
			console.error("Error fetching all locks:", error);
			// Fallback to empty array or could fallback to static data
			return [];
		}
	}

	/**
	 * Get only locks that have stories
	 */
	async getLocksWithStories() {
		try {
			const response = await fetch(`${API_BASE}/locks/stories-only`);
			const data = await response.json();

			if (!data.success) {
				throw new Error(data.error || "Failed to fetch story locks");
			}

			return data.data.map((lock) => ({
				id: lock.id,
				name: lock.name,
				date: lock.date,
				story: true,
			}));
		} catch (error) {
			console.error("Error fetching story locks:", error);
			return [];
		}
	}

	/**
	 * Get a specific lock by ID
	 */
	async getLockById(lockId) {
		try {
			const response = await fetch(`${API_BASE}/locks/${lockId}`);
			const data = await response.json();

			if (!data.success) {
				return null;
			}

			return {
				id: data.data.id,
				name: data.data.name,
				date: data.data.date,
				story: false, // Individual lock endpoint doesn't include story info
			};
		} catch (error) {
			console.error("Error fetching lock:", error);
			return null;
		}
	}

	/**
	 * Get story content for a specific lock
	 */
	async getStoryByLockId(lockId) {
		try {
			const response = await fetch(`${API_BASE}/stories/${lockId}`);
			const data = await response.json();

			if (!data.success) {
				return null;
			}

			return {
				id: data.data.id,
				title: data.data.title,
				content: data.data.content,
				author: data.data.author,
				lockId: data.data.lock_id,
			};
		} catch (error) {
			console.error("Error fetching story:", error);
			return null;
		}
	}

	/**
	 * Get database statistics
	 */
	async getStats() {
		try {
			const response = await fetch(`${API_BASE}/stats`);
			const data = await response.json();

			if (!data.success) {
				throw new Error(data.error || "Failed to fetch stats");
			}

			return data.data;
		} catch (error) {
			console.error("Error fetching stats:", error);
			return {
				totalLocks: 0,
				totalStories: 0,
				locksWithStories: 0,
			};
		}
	}

	/**
	 * Check if the API server is available
	 */
	async isAvailable() {
		try {
			const response = await fetch(`${API_BASE.replace("/api", "/health")}`);
			return response.ok;
		} catch (error) {
			return false;
		}
	}
}

// Export singleton instance
export const dataService = new FreedomWallDataService();
