export default function middleware(request) {
	const ip =
		request.ip || request.headers.get("x-forwarded-for")?.split(",")[0];
	console.log("Detected IP:", ip);
	const headerCountry = request.headers.get("x-vercel-ip-country") || "Default";
	const headerCity = request.headers.get("x-vercel-ip-city") || "Default City";
	console.log("Detected Country from header:", headerCountry);
	console.log("Detected City from header:", headerCity);

	const existingCountry =
		request.cookies.get("user-country")?.value || "Default";
	const existingCity =
		request.cookies.get("user-city")?.value || "Default City";

	const country = existingCountry || headerCountry;
	const city = existingCity || headerCity;
	const response = new Response("OK");
	console.log("Middleware executed for IP:", ip);

	if (ip) {
		response.cookies.set("user-ip", ip, { path: "/" });
		response.cookies.set("user-country", country, { path: "/" });
		response.cookies.set("user-city", city, { path: "/" });
		console.log("Set cookies - IP:", ip, "Country:", country, "City:", city);
	}
	return response;
}
