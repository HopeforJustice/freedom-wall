export default function middleware(request) {
	const ip =
		request.ip || request.headers.get("x-forwarded-for")?.split(",")[0];
	console.log("Detected IP:", ip);
	const headerCountry = request.headers.get("x-vercel-ip-country") || "Default";
	const headerCity = request.headers.get("x-vercel-ip-city") || "Default City";
	console.log("Detected Country from header:", headerCountry);
	console.log("Detected City from header:", headerCity);

	const country = headerCountry;
	const city = headerCity;

	const headers = new Headers();

	if (ip) {
		headers.append(
			"Set-Cookie",
			`user-ip=${encodeURIComponent(ip)}; Path=/; HttpOnly; SameSite=Lax`
		);
		headers.append(
			"Set-Cookie",
			`user-country=${encodeURIComponent(
				country
			)}; Path=/; HttpOnly; SameSite=Lax`
		);
		headers.append(
			"Set-Cookie",
			`user-city=${encodeURIComponent(city)}; Path=/; HttpOnly; SameSite=Lax`
		);
		console.log("Set cookies - IP:", ip, "Country:", country, "City:", city);
	}

	headers.set("Location", request.url);
	return new Response(null, { status: 302, headers });
}
