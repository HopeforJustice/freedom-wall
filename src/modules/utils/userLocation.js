class UserLocation {
	constructor() {
		this.country = null;
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
		} catch (error) {
			console.error("Error fetching user location:", error);
			this.country = "Default";
		}
	}

	getCountry() {
		return this.country;
	}
}

const userLocation = new UserLocation();
export default userLocation;
