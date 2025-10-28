import { useState, useEffect } from "react";
import { lockDataAPI } from "../modules/locks/lockDataAPI";
import StoryImage from "./StoryImage";

export default function Modal({ lockInfo, setModalOpen }) {
	const [loading, setLoading] = useState(true);
	const [lockData, setLockData] = useState(null);

	useEffect(() => {
		console.log("Modal received lockInfo:", lockInfo);
		if (!lockInfo?.id) return;
		setLoading(true);
		lockDataAPI.getLock(lockInfo.id).then((result) => {
			setLockData(result);
			setLoading(false);
		});
	}, [lockInfo?.id]);

	return (
		<>
			{/* <!-- story modal --> */}
			<div className="top-0 w-full h-full fixed pb-10" id="storyModal">
				<div
					id="storyDialog"
					className="w-full h-full flex justify-center items-center p-2 md:p-8 pb-8 lg:pb-16 xl:p-0 xl:pt-28"
					onClick={(e) => {
						if (e.target.id === "storyDialog") {
							setModalOpen(false);
						}
					}}
				>
					<div className="bg-[#fafafa] max-w-5xl rounded-2xl w-full h-full transition-all relative">
						<button
							className="absolute right-2 top-2 bg-hfj-black text-white p-2.5 px-4 rounded-full leading-none font-bold"
							onClick={() => {
								setModalOpen(false);
							}}
						>
							Close
						</button>
						{/* story content */}
						<div className="p-6 overflow-y-scroll h-full" id="storyContent">
							{loading && <p>Loading story...</p>}
							{!loading && lockData && (
								<div className="h-[200vh]">
									<div className="w-full h-64 md:h-96 bg-slate-200 overflow-hidden rounded-md">
										<StoryImage
											className="w-full h-full object-cover object-center rounded-md"
											media={lockData.media}
										/>
									</div>

									<div
										dangerouslySetInnerHTML={{
											__html: lockData.content
												? lockData.content
												: "No content available.",
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
