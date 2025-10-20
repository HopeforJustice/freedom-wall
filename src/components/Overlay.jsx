export default function Overlay() {
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

			{/* <!-- nav bar --> */}
			<div className="bg-[#fafafa] flex font-bold xl:rounded-full fixed left-1/2 -translate-x-1/2 bottom-0 xl:left-auto xl:translate-x-0 xl:relative font-sans w-full xl:max-w-5xl p-1.5 justify-center gap-4 xl:justify-between mx-auto mt-5 xl:shadow-xl xl:mb-8">
				<button
					id="findNewStoryBtn"
					className="find-story-btn bg-hfj-black text-white lg:text-[20px] rounded-full py-3.5 px-8 lg:py-5 lg:px-10 flex justify-center items-center cursor-pointer leading-none"
				>
					Find&nbsp;Story
				</button>
				<p className="font-apercu w-full text-center font-bold self-center max-w-xl hidden lg:block">
					Every Lock on our Freedom Wall represents a real life changed.
					<br />
					Give to unlock more freedom this Christmas
				</p>
				<button
					id="findNewStoryBtn"
					className="find-story-btn bg-[#d21220] text-white lg:text-[20px] rounded-full py-3.5 px-8 lg:py-5 lg:px-10 flex justify-center items-center cursor-pointer leading-none"
				>
					Donate
				</button>
			</div>
		</>
	);
}
