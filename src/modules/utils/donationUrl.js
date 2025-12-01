import userLocation from "./userLocation";

class DonationUrl {
	constructor() {
		this._ready = this.initialize();
	}

	async initialize() {
		// Wait for userLocation to be ready
		await userLocation.ready();
	}

	getCurrency() {
		const country = userLocation.getCountry();
		return country === "US" ? "usd" : "gbp";
	}

	getCampaign() {
		const params = new URLSearchParams(window.location.search);
		const campaign = params.get("campaign");
		return campaign ? campaign : "2025 EOY";
	}

	async getUrl(amount = null) {
		// Ensure userLocation is ready
		await this._ready;

		let donateURL = "https://donate.hopeforjustice.org/?";
		let wordpressURL = "https://hopeforjustice.org/2025-eoy/";
		const campaign = this.getCampaign();
		const currency = this.getCurrency();
		const image =
			"https://hopeforjustice.org/wp-content/uploads/2025/11/fw-close-nosp.jpg";
		donateURL += `image=${encodeURIComponent(image)}&givingFrequency=once&`;

		if (!amount) {
			return wordpressURL; // no amount -> go to wordpress site
		}

		if (amount && currency) {
			const encodedAmount = encodeURIComponent(amount);
			const encodedCampaign = encodeURIComponent(campaign);
			const encodedCurrency = encodeURIComponent(currency);
			donateURL += `amount=${encodedAmount}&campaign=${encodedCampaign}&currency=${encodedCurrency}`;
		} else if (currency) {
			const encodedCampaign = encodeURIComponent(campaign);
			const encodedCurrency = encodeURIComponent(currency);
			donateURL += `currency=${encodedCurrency}&campaign=${encodedCampaign}`;
		} else {
			const encodedCampaign = encodeURIComponent(campaign);
			donateURL += `campaign=${encodedCampaign}`;
		}
		return donateURL;
	}

	ready() {
		return this._ready;
	}
}

// Singleton instance
const donationUrl = new DonationUrl();

export default donationUrl;
