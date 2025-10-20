import { useState, useEffect } from "react";
import Loading from "./Loading";
import Overlay from "./Overlay";
import Modal from "./Modal";

function App() {
	const [modalOpen, setModalOpen] = useState(false);
	const [lockInfo, setLockInfo] = useState(null);

	// Listen for the showLockStory event to open the modal
	useEffect(() => {
		function handler(e) {
			const info = e.detail;
			setLockInfo(info);
			setModalOpen(true);
		}
		window.addEventListener("showLockStory", handler);
		return () => window.removeEventListener("showLockStory", handler);
	}, []);

	return (
		<>
			<div>
				<canvas className="webgl"></canvas>
				<Loading />
				<Overlay />
				{modalOpen && <Modal lockInfo={lockInfo} setModalOpen={setModalOpen} />}
			</div>
		</>
	);
}

export default App;
