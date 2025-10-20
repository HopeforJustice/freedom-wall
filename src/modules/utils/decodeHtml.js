export default function decodeHTML(str) {
	const doc = new DOMParser().parseFromString(str, "text/html");
	return doc.documentElement.textContent;
}
