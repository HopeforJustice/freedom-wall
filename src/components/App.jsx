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

	// Helper function to update URL and history state
	const updateHistoryState = (type, lockId = null) => {
		const url = new URL(window.location);

		if (type === null) {
			// Modal closed - remove modal params
			url.searchParams.delete("modal");
			url.searchParams.delete("lockId");
		} else if (type === "info") {
			// Info modal - set modal param
			url.searchParams.set("modal", "info");
			url.searchParams.delete("lockId");
		} else if (type === "story") {
			// Story modal - set modal param and lockId if available
			url.searchParams.set("modal", "story");
			if (lockId) {
				url.searchParams.set("lockId", lockId.toString());
			} else {
				url.searchParams.delete("lockId");
			}
		}

		window.history.pushState(
			{ modalOpen: type !== null, modalType: type, lockId },
			"",
			url.toString()
		);
	};

	// Enhanced setModalOpen that manages history
	const setModalOpenWithHistory = (open, skipHistory = false) => {
		setModalOpen(open);
		if (!skipHistory) {
			if (open) {
				updateHistoryState(modalType, lockInfo?.id);
			} else {
				updateHistoryState(null);
			}
		}
	};

	// Enhanced modal type setter that manages history
	const setModalTypeWithHistory = (type, skipHistory = false) => {
		setModalType(type);
		if (!skipHistory && modalOpen) {
			updateHistoryState(type, lockInfo?.id);
		}
	};

	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		setIsEmbedded(urlParams.has("embed"));

		// Check for modal state in URL on initial load
		const modalParam = urlParams.get("modal");
		const lockIdParam = urlParams.get("lockId");

		if (modalParam === "info") {
			setModalType("info");
			setLockInfo(null);
			setModalOpen(true);
		} else if (modalParam === "story" && lockIdParam) {
			// Set up story modal from URL parameters
			const lockInfo = {
				id: parseInt(lockIdParam),
				name: `Lock ${lockIdParam}`,
			};
			setLockInfo(lockInfo);
			setModalType("story");
			setModalOpen(true);
		}

		// Handle browser back/forward navigation
		const handlePopState = (event) => {
			const state = event.state;

			if (state) {
				// State exists from our navigation
				if (state.modalOpen) {
					if (state.lockId && state.modalType === "story") {
						// Create lock info and set up story modal
						const lockInfo = { id: state.lockId, name: `Lock ${state.lockId}` };
						setLockInfo(lockInfo);
						setModalType("story");
						setModalOpen(true);
					} else if (state.modalType === "info") {
						// Set up info modal
						setLockInfo(null);
						setModalType("info");
						setModalOpen(true);
					}
				} else {
					// Close modal
					setModalOpen(false);
				}
			} else {
				// No state - check URL params
				const currentUrl = new URL(window.location);
				const currentModal = currentUrl.searchParams.get("modal");
				const currentLockId = currentUrl.searchParams.get("lockId");

				if (!currentModal) {
					// No modal in URL - close modal
					setModalOpen(false);
				} else if (currentModal === "info") {
					// Set up info modal
					setLockInfo(null);
					setModalType("info");
					setModalOpen(true);
				} else if (currentModal === "story" && currentLockId) {
					// Set up story modal
					const lockInfo = {
						id: parseInt(currentLockId),
						name: `Lock ${currentLockId}`,
					};
					setLockInfo(lockInfo);
					setModalType("story");
					setModalOpen(true);
				}
			}
		};

		window.addEventListener("popstate", handlePopState);

		// Set initial history state if no modal params
		if (!modalParam) {
			window.history.replaceState(
				{ modalOpen: false, modalType: null, lockId: null },
				"",
				window.location.href
			);
		}

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

		return () => {
			window.removeEventListener("popstate", handlePopState);
		};
	}, []);

	// Listen for the showLockStory event to open the modal
	useEffect(() => {
		function handler(e) {
			const info = e.detail;
			setLockInfo(info);
			setModalType("story");
			setModalOpen(true);
			// Update history with the lock ID directly
			updateHistoryState("story", info.id);
		}
		window.addEventListener("showLockStory", handler);
		return () => window.removeEventListener("showLockStory", handler);
	}, []);

	// Listen for the showLockStoryById event (for back button navigation)
	useEffect(() => {
		function handler(e) {
			const lockId = e.detail.id;
			const skipHistory = e.detail.skipHistory || false;
			// Create mock lock info with the ID - in a real app you'd fetch this
			const mockLockInfo = { id: lockId, name: `Lock ${lockId}` };
			setLockInfo(mockLockInfo);
			if (skipHistory) {
				setModalType("story");
				setModalOpen(true);
			} else {
				setModalTypeWithHistory("story");
				setModalOpenWithHistory(true);
			}
		}
		window.addEventListener("showLockStoryById", handler);
		return () => window.removeEventListener("showLockStoryById", handler);
	}, [lockInfo, modalOpen]);

	// Listen for the openInfoModal event to open the info modal
	useEffect(() => {
		function handler() {
			setLockInfo(null);
			setModalTypeWithHistory("info");
			setModalOpenWithHistory(true);
		}
		window.addEventListener("openInfoModal", handler);
		return () => window.removeEventListener("openInfoModal", handler);
	}, [lockInfo, modalOpen]);

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
						setLockInfo(null);
						setModalTypeWithHistory("info");
						setModalOpenWithHistory(true);
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
						setModalOpen={setModalOpenWithHistory}
						setModalType={setModalTypeWithHistory}
						type={modalType}
					/>
				)}
			</div>
		</>
	);
}

export default App;
