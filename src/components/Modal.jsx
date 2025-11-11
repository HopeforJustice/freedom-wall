import { useState, useEffect, useRef } from "react";
import { lockDataAPI } from "../modules/locks/lockDataAPI";
import StoryImage from "./StoryImage";
import { userLocation, donationUrl } from "../modules";
import { track } from "@vercel/analytics";

export default function Modal({
	lockInfo = null,
	setModalOpen,
	type = "story",
	doubled = true,
}) {
	const [loading, setLoading] = useState(true);
	const [lockData, setLockData] = useState(null);
	const [data, setData] = useState(null);
	const [fade, setFade] = useState(false);
	const [fadeContent, setFadeContent] = useState(false);
	const [country, setCountry] = useState(userLocation.getCountry());
	const [content, setContent] = useState(null);
	const [donateURL, setDonateURL] = useState("#");
	const hasTrackedOpen = useRef(false);

	useEffect(() => {
		// Reset tracking flag when modal opens with new content
		hasTrackedOpen.current = false;
	}, [lockInfo?.id, type]);

	useEffect(() => {
		console.log("User country:", country);
		setLoading(true);
		setFadeContent(false);
		setFade(false);
		window.setTimeout(() => setFade(true), 50);
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
					// Only track once using ref
					if (!hasTrackedOpen.current) {
						hasTrackedOpen.current = true;
						track("lock_story_modal_opened", {
							lockId: lockInfo.id,
							lockName: lockInfo.name,
						});
					}
				})
				.then(() => {
					setTimeout(() => {
						setFadeContent(true);
					}, 100);
				});
		}
	}, []);

	useEffect(() => {
		if (lockData && lockData.askAmount) {
			donationUrl.getUrl(lockData.askAmount).then((url) => {
				setDonateURL(url);
			});
		}
	}, [lockData]);

	const redirectToDonate = () => {
		// window.location.href = donateURL;
		track("lock_donation_button_clicked", {
			lockId: lockInfo.id,
			lockName: lockInfo.name,
		});
	};

	return (
		<>
			{/* <!-- modal --> */}
			<div
				className={`transition-all duration-200 ${
					fade ? "opacity-100" : "opacity-0"
				} w-full h-[calc(100%-60px)] xl:h-full fixed z-100 top-0`}
			>
				<div
					id="dialog"
					className={`relative transition-all duration-200 w-full h-full flex justify-center items-center p-2 md:p-8 pb-4 lg:pb-12 xl:p-0 xl:pt-28 xl:bg-black/40`}
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
					<div
						className={`${
							fade ? "top-0" : "top-10"
						} bg-[#fafafa] max-w-5xl rounded-2xl w-full h-full transition-all relative`}
					>
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
									<div className="max-w-3xl mx-auto mb-[200px]">
										<div
											dangerouslySetInnerHTML={{
												__html: content,
											}}
											className="[&>p]:mb-4 [&>h2]:font-display [&>h2]:text-4xl lg:[&>h2]:text-5xl [&>h2]:mb-4 [&>h2]:mt-8"
										></div>
										{/* ask */}
										{lockData && lockData.askPullOut && (
											<div className="">
												<p className="font-bold text-2xl border-l-2 border-hfj-red pl-4 mt-12 lg:text-3xl">
													{lockData.askPullOut}
												</p>
												<div
													dangerouslySetInnerHTML={{
														__html: lockData.askReason,
													}}
													className="text-lg mt-6"
												></div>
												<div className="flex flex-wrap gap-4 gap-y-3 mt-6">
													<div className="bg-white border-[1px] border-hfj-black-tint2/50 rounded-lg px-4 py-2 flex justify-start items-center max-w-48 text-lg">
														<label
															htmlFor="Amount"
															className="font-bold text-xl mr-4 hidden"
														>
															Amount
														</label>
														<div>
															{lockData.askCurrency === "USD" ? (
																<span className="font-bold mr-2 opacity-50">
																	$
																</span>
															) : (
																<span className="font-bold mr-2 opacity-50">
																	£
																</span>
															)}
														</div>
														<input
															className="focus:outline-none w-full font-bold mt-[1px]"
															id="Amount"
															type="text"
															value={lockData.askAmount ?? ""}
															inputMode="decimal"
															pattern="^\\d*(\\.\\d*)?$"
															onChange={(e) => {
																// Only allow numbers or numbers with a decimal point
																const val = e.target.value;
																if (/^\d*(\.\d*)?$/.test(val) || val === "") {
																	setLockData({
																		...lockData,
																		askAmount: val,
																	});
																}
															}}
														/>
													</div>
													<div className="relative">
														<button
															onClick={redirectToDonate}
															disabled={lockData.askAmount ? false : true}
															className="rounded-full bg-hfj-red h-full p-2 px-6 font-bold cursor-pointer text-white disabled:opacity-50 disabled:cursor-not-allowed"
														>
															Donate{" "}
															{lockData.askCurrency === "USD" ? "$" : "£"}
															{lockData.askAmount}
														</button>
														{doubled && (
															<div className="bg-hfj-black text-[11px] sm:text-[12px] text-white rounded-full -bottom-5  absolute left-1/2 -translate-x-1/2 whitespace-nowrap p-1 px-2">
																Your gift will be doubled!
															</div>
														)}
													</div>
												</div>
											</div>
										)}
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
