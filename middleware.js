export function middleware(request) {
	const ip =
		request.ip || request.headers.get("x-forwarded-for")?.split(",")[0];

	const headerCountry = request.headers.get("x-vercel-ip-country") || "Default";
	const headerCity = request.headers.get("x-vercel-ip-city") || "Default City";

	const existingCountry = request.cookies.get("user-country")?.value;
	const existingCity = request.cookies.get("user-city")?.value;

	const country = existingCountry || headerCountry;
	const city = existingCity || headerCity;

	if (ip) {
		response.cookies.set("user-ip", ip, { path: "/" });
		response.cookies.set("user-country", country, { path: "/" });
		response.cookies.set("user-city", city, { path: "/" });
	}
}
