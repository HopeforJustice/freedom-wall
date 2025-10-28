import { useState, useEffect } from "react";
import { lockDataAPI } from "../modules/locks/lockDataAPI";
import StoryImage from "./StoryImage";
import { decodeHTML } from "../modules";
import { userLocation } from "../modules";

export default function Modal({
	lockInfo = null,
	setModalOpen,
	type = "story",
}) {
	const [loading, setLoading] = useState(true);
	const [lockData, setLockData] = useState(null);
	const [data, setData] = useState(null);
	const [fade, setFade] = useState(false);
	const [fadeContent, setFadeContent] = useState(false);
	const [country, setCountry] = useState(userLocation.getCountry());
	const [content, setContent] = useState(null);

	useEffect(() => {
		console.log("User country:", country);
		setLoading(true);
		setFadeContent(false);
		setFade(false);
		window.setTimeout(() => setFade(true), 10);
		if (!type || type !== "story") {
			fetch(
				"https://freedomwallcms.wpenginepowered.com/wp-json/wp/v2/pages/2?_embed"
			)
				.then((res) => res.json())
				.then((json) => {
					setData(json);
					if (country === "US") {
						setContent(
							json.acf.us_freedom_wall_explanation || "no us specific content"
						);
					} else {
						setContent(json.content.rendered || "no default content");
					}
					console.log("Modal fetched data:", json);
					setLoading(false);
				})
				.then(() => {
					// Fade in content after a short delay
					setTimeout(() => {
						setFadeContent(true);
					}, 100);
				});
			return;
		} else {
			lockDataAPI
				.getLock(lockInfo.id)
				.then((result) => {
					setLockData(result);
					setContent(result.content || "No content available.");
					setLoading(false);
				})
				.then(() => {
					setTimeout(() => {
						setFadeContent(true);
					}, 100);
				});
		}
	}, []);

	return (
		<>
			{/* <!-- modal --> */}
			<div
				className={`transition-all duration-200 ${
					fade ? "opacity-100 top-0" : "opacity-0 top-10"
				} w-full h-[calc(100%-60px)] xl:h-full fixed z-100`}
			>
				<div
					id="dialog"
					className="w-full h-full flex justify-center items-center p-2 md:p-8 pb-4 lg:pb-12 xl:p-0 xl:pt-28 xl:bg-black/40"
					onClick={(e) => {
						if (e.target.id === "dialog") {
							setFade(false);
							setFadeContent(false);
							window.setTimeout(() => {
								setModalOpen(false);
							}, 200);
						}
					}}
				>
					<div className="bg-[#fafafa] max-w-5xl rounded-2xl w-full h-full transition-all relative">
						<button
							className="absolute z-10 right-2 top-2 bg-hfj-black text-white p-2.5 px-4 rounded-full leading-none font-bold"
							onClick={() => {
								setFade(false);
								setFadeContent(false);
								window.setTimeout(() => {
									setModalOpen(false);
								}, 200);
							}}
						>
							Close
						</button>
						{/* content */}
						<div
							className={`transition-all duration-200 p-6 overflow-y-scroll h-full`}
							id="storyContent"
						>
							{loading && (
								<div className="min-h-[100vh] animate-pulse z-0">
									<div className="w-full h-64 md:h-96 bg-slate-200 overflow-hidden rounded-md"></div>

									<div className="max-w-3xl mx-auto">
										<div className="mt-8 w-full h-12 bg-slate-200 rounded-md"></div>
										<div className="mt-6 w-2/3 h-4 bg-slate-200 rounded-md"></div>
										<div className="mt-4 w-full h-4 bg-slate-200 rounded-md"></div>
										<div className="mt-4 w-[90%] h-4 bg-slate-200 rounded-md"></div>
										<div className="mt-4 w-full h-4 bg-slate-200 rounded-md"></div>
									</div>
								</div>
							)}
							{!loading && (lockData || data) && (
								<div
									className={`min-h-[100vh] transition-all duration-300 ${
										fadeContent ? "opacity-100" : "opacity-0"
									}`}
								>
									<div
										className={`w-full md:h-96 bg-slate-200 overflow-hidden rounded-md ${
											type === "info" ? "h-40 md:h-96" : "h-64 md:h-96"
										}`}
									>
										<StoryImage
											className={`w-full h-full object-cover object-center rounded-md ${
												type === "info" ? "object-left" : "object-center"
											}`}
											media={
												lockData?.media
													? lockData.media
													: data?._embedded?.["wp:featuredmedia"]?.[0] || null
											}
										/>
									</div>

									<div
										dangerouslySetInnerHTML={{
											__html: content,
										}}
										className="[&>p]:mb-4 [&>h2]:font-display [&>h2]:text-4xl lg:[&>h2]:text-5xl [&>h2]:mb-4 [&>h2]:mt-8 max-w-3xl mx-auto"
									></div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
