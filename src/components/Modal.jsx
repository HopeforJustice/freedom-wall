import { useState, useEffect, useRef } from "react";
import { lockDataAPI } from "../modules/locks/lockDataAPI";
import StoryImage from "./StoryImage";
import { userLocation, donationUrl } from "../modules";
import { track } from "@vercel/analytics";

export default function Modal({
	lockInfo = null,
	setModalOpen,
	setModalType,
	type = "story",
	doubled = true,
	isEmbedded = false,
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

	// Handle modal type changes (for in-modal navigation)
	useEffect(() => {
		if (type === "info" || (type === "story" && !lockInfo)) {
			// Restart the loading and animation process for modal type changes
			console.log("Modal type changed to:", type);
			setLoading(true);
			setFadeContent(false);

			// Scroll modal to top
			const storyContent = document.getElementById("storyContent");
			if (storyContent) {
				storyContent.scrollTop = 0;
			}

			// Trigger content reload
			if (type === "info") {
				fetch(
					"https://freedomwallcms.wpenginepowered.com/wp-json/wp/v2/pages/2?_embed"
				)
					.then((res) => res.json())
					.then((json) => {
						setData(json);
						// Set Freedom Wall explanation content based on country
						if (country === "US") {
							setContent(
								json.acf.us_freedom_wall_explanation ||
									json.acf.freedom_wall_explanation ||
									json.content.rendered ||
									"No Freedom Wall explanation available."
							);
						} else {
							setContent(
								json.acf.freedom_wall_explanation ||
									json.content.rendered ||
									"No Freedom Wall explanation available."
							);
						}
						setLoading(false);
					})
					.then(() => {
						// Fade in content after a short delay
						setTimeout(() => {
							setFadeContent(true);
						}, 100);
					});
			}
		}
	}, [type, country]);

	useEffect(() => {
		console.log("User country:", country);
		setLoading(true);
		setFadeContent(false);
		setFade(false);
		// Scroll modal to top
		const storyContent = document.getElementById("storyContent");
		if (storyContent) {
			storyContent.scrollTop = 0;
		}
		window.setTimeout(() => setFade(true), 50);
		if (!type || type !== "story") {
			fetch(
				"https://freedomwallcms.wpenginepowered.com/wp-json/wp/v2/pages/2?_embed"
			)
				.then((res) => res.json())
				.then((json) => {
					setData(json);
					// Set Freedom Wall explanation content based on country
					if (country === "US") {
						setContent(
							json.acf.us_freedom_wall_explanation ||
								json.acf.freedom_wall_explanation ||
								json.content.rendered ||
								"No Freedom Wall explanation available."
						);
					} else {
						setContent(
							json.acf.freedom_wall_explanation ||
								json.content.rendered ||
								"No Freedom Wall explanation available."
						);
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
	}, [type, lockInfo?.id, country]);

	useEffect(() => {
		if (lockData && lockData.askAmount && type === "story") {
			donationUrl.getUrl(lockData.askAmount).then((url) => {
				setDonateURL(url);
			});
		} else {
			donationUrl.getUrl().then((url) => {
				setDonateURL(url);
			});
		}
	}, [lockData, type]);

	const redirectToDonate = () => {
		window.location.href = donateURL;
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
					className={`relative transition-all duration-200 w-full h-full flex justify-center items-center p-2 md:p-8 pb-4 lg:pb-12 xl:p-0 xl:bg-black/40 ${
						isEmbedded ? "xl:pt-2 xl:pb-2" : "xl:pt-28"
					}`}
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
												type === "story" && lockData?.media
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
											className="[&>p]:mb-4 [&>h2]:font-display [&>h2]:font-normal [&>h2]:text-4xl lg:[&>h2]:text-5xl [&>h2]:mb-4 [&>h2]:mt-8"
										></div>
										{/* ask */}
										{type === "story" &&
											lockData &&
											lockData.askPullOut &&
											isEmbedded === false && (
												<div className="">
													<p className="font-bold text-2xl border-l-2 border-hfj-red pl-4 mt-12 lg:text-3xl">
														{lockData.askPullOut}
													</p>
													<div
														className="[&>ul]:list-disc [&>ul]:pl-6 [&>ul>li]:mb-2 [&>h3]:text-xl [&>h3]:mb-6 [&>h3]:mt-8 text-lg"
														dangerouslySetInnerHTML={{
															__html: lockData.askReason,
														}}
													></div>
													<div className="flex flex-wrap gap-4 gap-y-3 mt-8">
														<div className="bg-white border-[1px] border-hfj-black-tint2/50 rounded-lg px-4 py-4 flex justify-start items-center max-w-36 md:max-w-48 text-2xl">
															<label
																htmlFor="Amount"
																className="font-bold mr-4 hidden"
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
																className="rounded-full bg-hfj-red h-full p-4 px-8 font-bold text-xl cursor-pointer text-white disabled:opacity-50 disabled:cursor-not-allowed"
															>
																Donate{" "}
																{lockData.askCurrency === "USD" ? "$" : "£"}
																{lockData.askAmount}
															</button>
															{doubled && (
																<div className="bg-hfj-black text-[11px] sm:text-[12px] text-white rounded-full -bottom-4  absolute left-1/2 -translate-x-1/2 whitespace-nowrap p-1 px-3">
																	Your gift will be doubled!
																</div>
															)}
														</div>
													</div>
												</div>
											)}
										{/* switch to info modal */}
										{type === "story" && (
											<div
												onClick={() => {
													// Use fade transition to switch to info modal
													setFade(false);
													setFadeContent(false);

													setTimeout(() => {
														// Switch to info modal with history
														if (setModalType) {
															setModalType("info");
															// Restart the fade-in animation
															setTimeout(() => {
																setFade(true);
															}, 50);
														} else {
															// Fallback to event-based approach
															window.dispatchEvent(
																new CustomEvent("openInfoModal")
															);
														}
													}, 200);

													track("freedom_wall_explanation_clicked", {
														from: "story_modal",
													});
												}}
												className="w-full p-4 bg-hfj-yellow-tint3 text-hfj-black font-bold cursor-pointertransition-colors duration-200 rounded-lg mt-10 flex items-center gap-4 hover:cursor-pointer hover:bg-hfj-yellow-tint3/20"
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													width="19.5"
													height="19.5"
													viewBox="0 0 19.5 19.5"
													className="min-w-10"
												>
													<path
														id="Path_17244"
														data-name="Path 17244"
														d="M11.25,11.25l.041-.02a.75.75,0,0,1,1.063.852l-.708,2.836a.75.75,0,0,0,1.063.853l.041-.021M21,12a9,9,0,1,1-9-9,9,9,0,0,1,9,9ZM12,8.25h.008v.008H12Z"
														transform="translate(-2.25 -2.25)"
														fill="none"
														stroke="#000"
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth="1.5"
													/>
												</svg>
												<p>
													Click here to find out more about Hope for Justice’s
													work and what the locks on this Freedom Wall
													represent.
												</p>
											</div>
										)}
										{/* doubling disclaimer */}
										{type === "story" &&
											lockData &&
											lockData.askPullOut &&
											isEmbedded === false &&
											doubled && (
												<p className="text-sm mt-10">
													Name and image changed to protect the survivor’s
													identity. Gifts given before December 31st 2025 will
													be doubled up to a global total of $650,000 /
													£500,000.{" "}
												</p>
											)}
										{type === "info" && isEmbedded === false && (
											<div className="flex flex-wrap gap-4 gap-y-3">
												<div className="relative">
													<button
														onClick={redirectToDonate}
														className="rounded-full bg-hfj-red h-full p-4 px-8 font-bold text-xl cursor-pointer text-white disabled:opacity-50 disabled:cursor-not-allowed"
													>
														Give
													</button>
													{doubled && (
														<div className="bg-hfj-black text-[11px] sm:text-[12px] text-white rounded-full -bottom-4  absolute left-1/2 -translate-x-1/2 whitespace-nowrap p-1 px-3">
															Your gift will be doubled!
														</div>
													)}
												</div>
												<a
													href="https://hopeforjustice.org/what-we-do"
													className="rounded-full bg-hfj-black h-full p-4 px-8 font-bold text-xl cursor-pointer text-white disabled:opacity-50 disabled:cursor-not-allowed"
												>
													Learn more about our work
												</a>
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
