import { useState, useEffect } from "react";
import { lockDataAPI } from "../modules/locks/lockDataAPI";

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
					className="w-full h-full flex justify-center items-center pt-28"
				>
					<div className="bg-[#fafafa] max-w-5xl rounded-2xl w-full h-full transition-all overflow-y-scroll relative">
						<button
							className="absolute right-2 top-2 bg-hfj-black text-white p-2.5 px-4 rounded-full leading-none font-bold"
							onClick={() => {
								setModalOpen(false);
							}}
						>
							Close
						</button>
						{/* story content */}
						<div className="p-6 h-[200vh]" id="storyContent">
							{loading && <p>Loading story...</p>}
							{!loading && lockData && (
								<>
									<div className="w-full h-48 bg-slate-200" id="storyImage">
										Story Image
									</div>
									<h2 id="storyTitle"></h2>
									<p id="storyText"></p>
								</>
							)}
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
