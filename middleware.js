export default function middleware(request) {
	// Helper to parse cookies from the request
	function getCookie(name) {
		const cookieHeader = request.headers.get("cookie") || "";
		const cookies = Object.fromEntries(
			cookieHeader.split(";").map((s) => {
				const [k, ...v] = s.trim().split("=");
				return [k, v.join("=")];
			})
		);
		return cookies[name];
	}

	const ip =
		request.ip || request.headers.get("x-forwarded-for")?.split(",")[0];
	const headerCountry = request.headers.get("x-vercel-ip-country") || "Default";
	const headerCity = request.headers.get("x-vercel-ip-city") || "Default City";

	const country = headerCountry;
	const city = headerCity;

	const hasIpCookie = !!getCookie("user-ip");
	const hasCountryCookie = !!getCookie("user-country");
	const hasCityCookie = !!getCookie("user-city");

	// If all cookies are present, let the request proceed (no redirect, no new response)
	if (hasIpCookie && hasCountryCookie && hasCityCookie) {
		return;
	}

	// Otherwise, set cookies and redirect
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
