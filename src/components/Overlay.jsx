import { useEffect, useState } from "react";
import { isCameraAnimating, findNewStory } from "../modules";
import { userLocation } from "../modules";
import donationUrl from "../modules/utils/donationUrl";
import { track } from "@vercel/analytics";

export default function Overlay({
	mobile = false,
	doubled = true,
	isEmbedded = false,
}) {
	const [data, setData] = useState(null);
	const [explainerOpen, setExplainerOpen] = useState(true);
	const [findingStory, setFindingStory] = useState(false);
	const [donateUrl, setDonateUrl] = useState("#");

	useEffect(() => {
		fetch("https://freedomwallcms.wpenginepowered.com/wp-json/wp/v2/pages/2")
			.then((res) => res.json())
			.then((json) => {
				setData(json);
				console.log("Overlay fetched data:", json);
			});

		// Get the donation URL
		donationUrl.getUrl().then((url) => {
			setDonateUrl(url);
		});
	}, []);

	useEffect(() => {
		if (!mobile && !isEmbedded) {
			const timeout = setTimeout(() => {
				setExplainerOpen(false);
			}, 8000);

			return () => clearTimeout(timeout);
		}
	}, [mobile, isEmbedded]);

	// Listen for canvas clicks and drags in embedded mode to close explainer
	useEffect(() => {
		if (isEmbedded) {
			const handleCanvasInteraction = () => {
				setExplainerOpen(false);
			};

			window.addEventListener(
				"canvasClickInEmbeddedMode",
				handleCanvasInteraction
			);

			return () => {
				window.removeEventListener(
					"canvasClickInEmbeddedMode",
					handleCanvasInteraction
				);
			};
		}
	}, [isEmbedded]);

	const findStory = () => {
		setFindingStory(true);
		if (!isCameraAnimating()) {
			findNewStory({
				zoomOutDistance: 50,
				duration: 1500,
			});
			track("find_story_clicked");
		}
		setTimeout(() => {
			setFindingStory(false);
		}, 2500);
	};

	return (
		<>
			{/* <!-- left gradient --> */}
			<div className="w-full top-0 bg-gradient-to-b h-1/3 xl:w-1/4 xl:left-0 xl:h-full xl:bg-gradient-to-r from-black to-transparent opacity-80 fixed pointer-events-none"></div>

			{/* <!-- right gradient --> */}
			<div className="w-full bottom-0 bg-gradient-to-t h-1/3 xl:w-1/4 xl:right-0 xl:h-full xl:bg-gradient-to-l from-black to-transparent opacity-80 fixed pointer-events-none"></div>

			{/* <!-- logo --> */}
			<div className="fixed top-5 left-5 max-w-40 lg:max-w-none">
				<img src="/img/fw.svg" alt="Freedom Wall Logo" />
			</div>

			{/* just find story button for embeded */}
			{isEmbedded && (
				<button
					onClick={findStory}
					disabled={findingStory}
					className="bg-white disabled:opacity-70 disabled:cursor-not-allowed text-hfj-black lg:text-[20px] rounded-full py-3.5 px-8 lg:py-5 lg:px-10 flex justify-center items-center cursor-pointer leading-none fixed bottom-5 left-1/2 -translate-x-1/2 font-bold"
				>
					{data && data.acf.find_story_button_text}
				</button>
			)}

			{/* <!-- nav bar --> */}
			{isEmbedded === false && (
				<div className="bg-[#fafafa] flex font-bold xl:rounded-full fixed left-1/2 -translate-x-1/2 bottom-0 xl:left-auto xl:translate-x-0 xl:relative font-sans w-full xl:max-w-5xl p-1.5 pb-5 xl:pb-1.5 justify-center gap-4 xl:justify-between mx-auto mt-5 xl:shadow-xl xl:mb-8">
					<button
						onClick={findStory}
						disabled={findingStory}
						className="bg-hfj-black disabled:opacity-70 disabled:cursor-not-allowed text-white lg:text-[20px] rounded-full py-3.5 px-8 lg:py-5 lg:px-10 flex justify-center items-center cursor-pointer leading-none"
					>
						{data && data.acf.find_story_button_text}
					</button>
					<p className="font-apercu w-full text-center font-bold self-center max-w-xl hidden lg:block text-balance">
						{data && data.acf.nav_bar_text}
					</p>
					<div className="relative">
						<a
							className="bg-[#d21220] text-white lg:text-[20px] rounded-full py-3.5 px-8 lg:py-5 lg:px-10 flex font-bold justify-center items-center cursor-pointer leading-none"
							href={donateUrl}
							onClick={() => track("general_donation_button_clicked")}
						>
							{data && data.acf.donate_button_text}
						</a>
						{doubled && (
							<div className="bg-hfj-black text-[12px] text-white rounded-full -bottom-4 absolute left-1/2 -translate-x-1/2 whitespace-nowrap p-1 px-2">
								Your gift will be doubled!
							</div>
						)}
					</div>
				</div>
			)}

			{mobile && explainerOpen && (
				<div className="fixed bottom-20 max-w-[540px] left-[20px] w-[calc(100%-40px)] bg-white rounded-md p-4">
					<p className="font-bold mb-4">
						Pinch to zoom and drag to navigate the Freedom Wall.{" "}
						{data && data.acf.nav_bar_text}
					</p>
					<button
						className="bg-hfj-black text-white p-2.5 px-4 rounded-full leading-none font-bold"
						onClick={() => {
							setExplainerOpen(false);
						}}
					>
						Close
					</button>
				</div>
			)}

			{!mobile && explainerOpen && (
				<div
					className={`fixed ${
						isEmbedded ? "" : "animate-pulse"
					} left-[20px] bottom-[20px]`}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="200.192"
						height="148.64"
						viewBox="0 0 200.192 148.64"
					>
						<g
							id="Group_7723"
							data-name="Group 7723"
							transform="translate(-55 -798.964)"
						>
							<g
								id="Group_7704"
								data-name="Group 7704"
								transform="translate(-861.869 564)"
							>
								<g
									id="Rectangle_3699"
									data-name="Rectangle 3699"
									transform="translate(916.869 272)"
									fill="none"
									stroke="#fff"
									stroke-width="4"
								>
									<rect width="51" height="72" rx="22" stroke="none" />
									<rect
										x="2"
										y="2"
										width="47"
										height="68"
										rx="20"
										fill="none"
									/>
								</g>
								<g
									id="Rectangle_3700"
									data-name="Rectangle 3700"
									transform="translate(934.869 287)"
									fill="none"
									stroke="#fff"
									stroke-width="4"
								>
									<rect width="15" height="25" rx="7.5" stroke="none" />
									<rect
										x="2"
										y="2"
										width="11"
										height="21"
										rx="5.5"
										fill="none"
									/>
								</g>
								<line
									id="Line_80"
									data-name="Line 80"
									y2="14.668"
									transform="translate(942.524 274.852)"
									fill="none"
									stroke="#fff"
									stroke-width="4"
								/>
							</g>
							{!isEmbedded && (
								<path
									id="Path_17247"
									data-name="Path 17247"
									d="M7.99-9.877a3.609,3.609,0,0,0-3.434-2.159,3.18,3.18,0,0,0-3.247,3.23c0,3.774,4.981,3.383,4.981,5.355A1.39,1.39,0,0,1,4.743-1.9C3.451-1.9,2.737-3.043,2.38-4.318L.6-3.2A4.136,4.136,0,0,0,4.692.136,3.5,3.5,0,0,0,8.5-3.57c0-3.536-5.083-3.264-5.083-5.338A1.087,1.087,0,0,1,4.556-10c.7,0,1.19.374,1.649,1.258Zm8.3,6.8A2.138,2.138,0,0,1,14.28-1.666c-1.326,0-1.972-1.105-1.972-2.618S12.954-6.9,14.28-6.9a2.138,2.138,0,0,1,2.006,1.411l1.887-.765A3.84,3.84,0,0,0,14.28-8.7C11.492-8.7,10.1-6.7,10.1-4.284S11.492.136,14.28.136a3.84,3.84,0,0,0,3.893-2.448ZM21.981,0V-3.043c0-2.771,1.071-3.774,2.3-3.774a1.632,1.632,0,0,1,.884.238l.391-1.955a3.487,3.487,0,0,0-1.037-.17,2.987,2.987,0,0,0-2.533,1.53V-8.568H19.873V0Zm4.471-4.284A4.156,4.156,0,0,0,30.8.136a4.156,4.156,0,0,0,4.352-4.42A4.156,4.156,0,0,0,30.8-8.7,4.156,4.156,0,0,0,26.452-4.284Zm2.21,0c0-1.411.782-2.618,2.142-2.618S32.946-5.7,32.946-4.284,32.164-1.666,30.8-1.666,28.662-2.873,28.662-4.284Zm8.483-7.752V0h2.108V-12.036Zm4.165,0V0h2.108V-12.036ZM54.6-1.87a1.615,1.615,0,0,1-.816.2c-.714,0-1.122-.34-1.122-1.394V-6.766h2.261v-1.8H52.666v-3.468L50.558-10.71v2.142H49.232v1.8h1.326v3.74A2.846,2.846,0,0,0,53.7.136,3.236,3.236,0,0,0,55.1-.17Zm1.632-2.414A4.156,4.156,0,0,0,60.588.136a4.156,4.156,0,0,0,4.352-4.42A4.156,4.156,0,0,0,60.588-8.7,4.156,4.156,0,0,0,56.236-4.284Zm2.21,0c0-1.411.782-2.618,2.142-2.618S62.73-5.7,62.73-4.284s-.782,2.618-2.142,2.618S58.446-2.873,58.446-4.284Zm12.41-2.482H74.29L70.584-.816V0h6.562V-1.8h-3.91l3.672-5.95v-.816H70.856Zm7.5,2.482A4.156,4.156,0,0,0,82.705.136a4.156,4.156,0,0,0,4.352-4.42A4.156,4.156,0,0,0,82.705-8.7,4.156,4.156,0,0,0,78.353-4.284Zm2.21,0c0-1.411.782-2.618,2.142-2.618S84.847-5.7,84.847-4.284s-.782,2.618-2.142,2.618S80.563-2.873,80.563-4.284Zm8.075,0A4.156,4.156,0,0,0,92.99.136a4.156,4.156,0,0,0,4.352-4.42A4.156,4.156,0,0,0,92.99-8.7,4.156,4.156,0,0,0,88.638-4.284Zm2.21,0c0-1.411.782-2.618,2.142-2.618S95.132-5.7,95.132-4.284,94.35-1.666,92.99-1.666,90.848-2.873,90.848-4.284ZM106.488,0V-3.332c0-2.414.833-3.57,1.853-3.57.629,0,1.054.323,1.054,1.19V0H111.5V-6.069a2.383,2.383,0,0,0-2.55-2.635,3.069,3.069,0,0,0-2.618,1.768,2.368,2.368,0,0,0-2.4-1.768,2.827,2.827,0,0,0-2.465,1.513V-8.568H99.365V0h2.108V-3.145c0-2.55.816-3.757,1.853-3.757.629,0,1.054.323,1.054,1.19V0Z"
									transform="translate(55 811)"
									fill="#fff"
								/>
							)}

							<path
								id="Path_17248"
								data-name="Path 17248"
								d="M11.373,7.568a4.664,4.664,0,0,0-4.93-3.6C3.468,3.964.816,6.072.816,10.05s2.652,6.086,5.627,6.086a4.664,4.664,0,0,0,4.93-3.6l-1.989-.51A2.888,2.888,0,0,1,6.443,14.1C4.607,14.1,3.06,12.8,3.06,10.05S4.607,6,6.443,6A2.888,2.888,0,0,1,9.384,8.078Zm1.853-3.6V16h2.108V3.964Zm4.029,1a1.36,1.36,0,1,0,2.72,0,1.36,1.36,0,1,0-2.72,0Zm.306,2.465V16h2.108V7.432ZM27.9,12.923a2.138,2.138,0,0,1-2.006,1.411c-1.326,0-1.972-1.1-1.972-2.618S24.565,9.1,25.891,9.1A2.138,2.138,0,0,1,27.9,10.509l1.887-.765A3.84,3.84,0,0,0,25.891,7.3c-2.788,0-4.182,2.006-4.182,4.42s1.394,4.42,4.182,4.42a3.84,3.84,0,0,0,3.893-2.448Zm3.451-8.959V16h2.108V11.954L36.482,16h2.584l-3.655-4.624,3.434-3.944h-2.6L33.456,10.8V3.964Zm14.739,6.12A1.4,1.4,0,0,1,47.566,9.1c.782,0,1.5.306,1.5,1.258v.374H47.634c-2.159,0-3.655,1.105-3.655,2.805a2.435,2.435,0,0,0,2.6,2.6,3.194,3.194,0,0,0,2.635-1.224L49.436,16H51.17V10.883c0-2.737-1.564-3.587-3.6-3.587A3.072,3.072,0,0,0,44.3,9.676Zm.1,3.417c0-.765.561-1.1,1.462-1.1h1.411v.17a1.882,1.882,0,0,1-1.989,1.768A.826.826,0,0,1,46.189,13.5Zm6.953-6.069V16H55.25V12.583c0-2.261.935-3.485,1.955-3.485.714,0,1.224.391,1.224,1.411V16h2.108V9.88A2.406,2.406,0,0,0,57.9,7.3,3.242,3.242,0,0,0,55.25,8.809V7.432Zm9.282,4.284c0,2.635,1.326,4.42,3.91,4.42a2.432,2.432,0,0,0,2.074-1.02V16h2.108V3.964H68.408v4.25A2.8,2.8,0,0,0,66.334,7.3C63.75,7.3,62.424,9.081,62.424,11.716Zm2.21,0c0-1.7.884-2.618,1.989-2.618s1.972.918,1.972,2.618-.867,2.618-1.972,2.618S64.634,13.416,64.634,11.716Zm12.189,0c0,2.635,1.326,4.42,3.91,4.42a2.432,2.432,0,0,0,2.074-1.02V16h2.108V3.964H82.807v4.25A2.8,2.8,0,0,0,80.733,7.3C78.149,7.3,76.823,9.081,76.823,11.716Zm2.21,0c0-1.7.884-2.618,1.989-2.618s1.972.918,1.972,2.618-.867,2.618-1.972,2.618S79.033,13.416,79.033,11.716ZM89.743,16V12.957c0-2.771,1.071-3.774,2.295-3.774a1.632,1.632,0,0,1,.884.238l.391-1.955a3.487,3.487,0,0,0-1.037-.17,2.987,2.987,0,0,0-2.533,1.53V7.432H87.635V16Zm6.562-5.916A1.4,1.4,0,0,1,97.784,9.1c.782,0,1.5.306,1.5,1.258v.374H97.852c-2.159,0-3.655,1.105-3.655,2.805a2.435,2.435,0,0,0,2.6,2.6,3.194,3.194,0,0,0,2.635-1.224L99.654,16h1.734V10.883c0-2.737-1.564-3.587-3.6-3.587a3.072,3.072,0,0,0-3.264,2.38Zm.1,3.417c0-.765.561-1.1,1.462-1.1H99.28v.17a1.882,1.882,0,0,1-1.989,1.768A.826.826,0,0,1,96.407,13.5Zm7.259-3.315a2.737,2.737,0,0,0,.6,1.768,2.119,2.119,0,0,0-.612,3.128,2.264,2.264,0,0,0-.7,1.7c0,1.87,1.683,2.822,3.876,2.822,1.9,0,3.893-.85,3.893-2.958,0-1.649-1.207-2.516-3.009-2.516h-1.751c-.51,0-.8-.221-.8-.629a.749.749,0,0,1,.408-.646,4.128,4.128,0,0,0,1.241.187,2.875,2.875,0,0,0,3.145-2.856,2.736,2.736,0,0,0-.34-1.36l1.224-.612-.833-1.394-1.615.85a3.5,3.5,0,0,0-1.581-.374A2.911,2.911,0,0,0,103.666,10.186Zm3.57,5.712c.8,0,1.377.17,1.377.884,0,.765-.782,1.054-1.785,1.054-1.105,0-1.921-.408-1.921-1.224a1.369,1.369,0,0,1,.187-.782,5.989,5.989,0,0,0,.986.068Zm-1.6-5.712a1.173,1.173,0,1,1,2.346,0,1.173,1.173,0,0,1-2.346,0Zm15.3,3.944a1.615,1.615,0,0,1-.816.2c-.714,0-1.122-.34-1.122-1.394V9.234h2.261v-1.8H119V3.964L116.892,5.29V7.432h-1.326v1.8h1.326v3.74a2.846,2.846,0,0,0,3.145,3.162,3.236,3.236,0,0,0,1.394-.306Zm1.632-2.414a4.353,4.353,0,1,0,8.7,0,4.353,4.353,0,1,0-8.7,0Zm2.21,0c0-1.411.782-2.618,2.142-2.618s2.142,1.207,2.142,2.618-.782,2.618-2.142,2.618S124.78,13.127,124.78,11.716Zm12.8-4.284V16h2.108V12.583c0-2.261.935-3.485,1.955-3.485.714,0,1.224.391,1.224,1.411V16h2.108V9.88A2.406,2.406,0,0,0,142.341,7.3a3.242,3.242,0,0,0-2.652,1.513V7.432Zm11.373,2.652a1.4,1.4,0,0,1,1.479-.986c.782,0,1.5.306,1.5,1.258v.374H150.5c-2.159,0-3.655,1.105-3.655,2.805a2.435,2.435,0,0,0,2.6,2.6,3.194,3.194,0,0,0,2.635-1.224L152.3,16h1.734V10.883c0-2.737-1.564-3.587-3.6-3.587a3.072,3.072,0,0,0-3.264,2.38Zm.1,3.417c0-.765.561-1.1,1.462-1.1h1.411v.17a1.882,1.882,0,0,1-1.989,1.768A.826.826,0,0,1,149.056,13.5Zm5.865-6.069L157.828,16h1.9l2.907-8.568h-2.125L158.78,13.4l-1.734-5.967Zm8.772-2.465a1.36,1.36,0,0,0,2.72,0,1.36,1.36,0,0,0-2.72,0ZM164,7.432V16h2.108V7.432Zm4.556,2.754a2.737,2.737,0,0,0,.6,1.768,2.119,2.119,0,0,0-.612,3.128,2.264,2.264,0,0,0-.7,1.7c0,1.87,1.683,2.822,3.876,2.822,1.9,0,3.893-.85,3.893-2.958,0-1.649-1.207-2.516-3.009-2.516H170.85c-.51,0-.8-.221-.8-.629a.749.749,0,0,1,.408-.646,4.128,4.128,0,0,0,1.241.187,2.875,2.875,0,0,0,3.145-2.856,2.736,2.736,0,0,0-.34-1.36l1.224-.612L174.9,6.82l-1.615.85A3.5,3.5,0,0,0,171.7,7.3,2.911,2.911,0,0,0,168.555,10.186Zm3.57,5.712c.8,0,1.377.17,1.377.884,0,.765-.782,1.054-1.785,1.054-1.1,0-1.921-.408-1.921-1.224a1.369,1.369,0,0,1,.187-.782,5.99,5.99,0,0,0,.986.068Zm-1.6-5.712a1.173,1.173,0,1,1,2.346,0,1.173,1.173,0,0,1-2.346,0Zm8.16-.1a1.4,1.4,0,0,1,1.479-.986c.782,0,1.5.306,1.5,1.258v.374h-1.428c-2.159,0-3.655,1.105-3.655,2.805a2.435,2.435,0,0,0,2.6,2.6,3.194,3.194,0,0,0,2.635-1.224L182.036,16h1.734V10.883c0-2.737-1.564-3.587-3.6-3.587a3.072,3.072,0,0,0-3.264,2.38Zm.1,3.417c0-.765.561-1.1,1.462-1.1h1.411v.17a1.882,1.882,0,0,1-1.989,1.768A.826.826,0,0,1,178.789,13.5Zm11.662.629a1.615,1.615,0,0,1-.816.2c-.714,0-1.122-.34-1.122-1.394V9.234h2.261v-1.8h-2.261V3.964L186.4,5.29V7.432h-1.326v1.8H186.4v3.74a2.846,2.846,0,0,0,3.145,3.162,3.236,3.236,0,0,0,1.394-.306Zm9.741-2.6A3.977,3.977,0,0,0,196.2,7.3c-2.941,0-4.114,2.4-4.114,4.42s1.173,4.42,4.114,4.42a3.876,3.876,0,0,0,3.893-2.5l-1.7-.629a2.221,2.221,0,0,1-2.074,1.326,1.966,1.966,0,0,1-2.023-1.938h5.9ZM196.2,9.1a1.834,1.834,0,0,1,1.836,1.632h-3.689A1.893,1.893,0,0,1,196.2,9.1Z"
								transform="translate(55 928)"
								fill="#fff"
							/>
						</g>
					</svg>
				</div>
			)}
		</>
	);
}
