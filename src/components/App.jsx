import { useState, useEffect } from "react";
import Loading from "./Loading";
import Overlay from "./Overlay";
import Modal from "./Modal";
import { Analytics } from "@vercel/analytics/react";
import { track } from "@vercel/analytics";

function App() {
	const [modalOpen, setModalOpen] = useState(false);
	const [modalType, setModalType] = useState("story");
	const [lockInfo, setLockInfo] = useState(null);
	const windowSize = typeof window !== "undefined" ? window.innerWidth : 0;
	const doubled = true;
	const [isEmbedded, setIsEmbedded] = useState(false);

	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		setIsEmbedded(urlParams.has("embed"));

		// Helper function to set cookies that work in both development and production
		const setCookie = (name, value, days = 10) => {
			const isLocalhost =
				window.location.hostname === "localhost" ||
				window.location.hostname === "127.0.0.1";

			const domainPart = isLocalhost ? "" : "; domain=.hopeforjustice.org";
			const expires = new Date(
				Date.now() + days * 24 * 60 * 60 * 1000
			).toUTCString();

			document.cookie = `${name}=${value}${domainPart}; expires=${expires}; path=/`;
		};

		// Set UTM cookies if present in URL parameters
		const utmParams = [
			{ param: "utm_medium", cookieName: "wordpress_utm_medium" },
			{ param: "utm_source", cookieName: "wordpress_utm_source" },
			{ param: "utm_campaign", cookieName: "wordpress_utm_campaign" },
		];

		utmParams.forEach(({ param, cookieName }) => {
			const value = urlParams.get(param);
			if (value) {
				setCookie(cookieName, value);
			}
		});
	}, []);

	// Listen for the showLockStory event to open the modal
	useEffect(() => {
		function handler(e) {
			const info = e.detail;
			setLockInfo(info);
			setModalType("story");
			setModalOpen(true);
		}
		window.addEventListener("showLockStory", handler);
		return () => window.removeEventListener("showLockStory", handler);
	}, []);

	return (
		<>
			<div>
				<Analytics />
				<Loading />
				{windowSize < 1280 && (
					<Overlay isEmbedded={isEmbedded} mobile="true" doubled={doubled} />
				)}
				{windowSize >= 1280 && (
					<Overlay isEmbedded={isEmbedded} doubled={doubled} />
				)}
				{/* info button */}
				<div
					onClick={() => {
						setModalType("info");
						setModalOpen(true);
						track("info_button_clicked");
					}}
					className="fixed z-0 left-[20px] cursor-pointer top-[250px] lg:top-[350px] w-[40px] h-[40px] rounded-full bg-[#707070] flex items-center justify-center"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="19.5"
						height="19.5"
						viewBox="0 0 19.5 19.5"
					>
						<path
							id="Path_17244"
							data-name="Path 17244"
							d="M11.25,11.25l.041-.02a.75.75,0,0,1,1.063.852l-.708,2.836a.75.75,0,0,0,1.063.853l.041-.021M21,12a9,9,0,1,1-9-9,9,9,0,0,1,9,9ZM12,8.25h.008v.008H12Z"
							transform="translate(-2.25 -2.25)"
							fill="none"
							stroke="#fff"
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="1.5"
						/>
					</svg>
				</div>
				{modalOpen && (
					<Modal
						isEmbedded={isEmbedded}
						doubled={doubled}
						lockInfo={lockInfo}
						setModalOpen={setModalOpen}
						type={modalType}
					/>
				)}
			</div>
		</>
	);
}

export default App;
