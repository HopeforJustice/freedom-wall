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
	const response = new Response("OK");
	console.log("Middleware executed for IP:", ip);

	if (ip) {
		response.cookies.set("user-ip", ip, { path: "/" });
		response.cookies.set("user-country", headerCountry, { path: "/" });
		response.cookies.set("user-city", headerCity, { path: "/" });
		console.log("Set cookies - IP:", ip, "Country:", country, "City:", city);
	}
	return response;
}
