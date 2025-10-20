class UserLocation {
	constructor() {
		this.country = null;
		this.city = null;
		// Start fetching immediately
		this._fetchPromise = this.fetchLocation();
	}

	async fetchLocation() {
		if (this.country) return; // already fetched
		try {
			const response = await fetch("/api/getLocation");
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			const data = await response.json();
			this.city = data.city;
			this.country = data.country;
		} catch (error) {
			console.error("Error fetching user location:", error);
			this.country = "Default";
		}
	}

	getCountry() {
		return this.country;
	}

	// Optional: expose a promise for when location is ready
	ready() {
		return this._fetchPromise;
	}
}

// Singleton instance
const userLocation = new UserLocation();

export default userLocation;
