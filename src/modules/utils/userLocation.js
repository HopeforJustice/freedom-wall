class UserLocation {
	constructor() {
		this.country = null;
		// Start fetching immediately
		this._fetchPromise = this.fetchLocation();
	}

	async fetchLocation() {
		// Check for spoofed country in URL
		const params = new URLSearchParams(window.location.search);
		const usaGroup = [
			"AG",
			"AR",
			"BB",
			"BS",
			"BO",
			"BR",
			"BZ",
			"CA",
			"CL",
			"CO",
			"CR",
			"DO",
			"DM",
			"EC",
			"KH",
			"LC",
			"GD",
			"GF",
			"GP",
			"GT",
			"GY",
			"HN",
			"HT",
			"JM",
			"MQ",
			"MX",
			"NI",
			"PA",
			"PE",
			"PR",
			"PY",
			"SR",
			"SV",
			"TT",
			"US",
			"UM",
			"UY",
			"VC",
			"VE",
			"VI",
		];

		const spoofCountry = params.get("country");
		if (spoofCountry) {
			if (usaGroup.includes(spoofCountry)) {
				this.country = "US";
			} else {
				this.country = spoofCountry;
			}
			return;
		}

		if (this.country) return; // already fetched

		try {
			const response = await fetch("/api/getLocation");
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			const data = await response.json();
			if (usaGroup.includes(data.country)) {
				this.country = "US";
			} else {
				this.country = data.country;
			}
			this.city = data.city;
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
