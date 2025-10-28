export default function Loading() {
	return (
		<div
			id="loadingCircle"
			className="text-white text-center w-[100vw] h-[100vh] bg-hfj-black fixed top-0 left-0 flex flex-col justify-center items-center z-50"
		>
			{/* Loading bar */}
			<div className="w-64 h-2 bg-gray-700 rounded-full mb-8 overflow-hidden">
				<div
					className="h-full bg-hfj-red animate-loading-bar"
					style={{ width: "100%" }}
				></div>
			</div>
			<span className="text-3xl font-bold max-w-[30ch]">
				Every lock on our Freedom Wall represents a real life changed.
			</span>
		</div>
	);
}
