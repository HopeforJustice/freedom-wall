import { geolocation } from "@vercel/functions";

export function GET(request) {
	const data = geolocation(request);
	return new Response(JSON.stringify(data), {
		headers: { "content-type": "application/json" },
	});
}
