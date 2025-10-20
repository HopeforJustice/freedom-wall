import {
	cameraMovement,
	camera,
	gui,
	canvas,
	scene,
	sizes,
	ambientLight,
	directionalLight,
	wall,
	loadLockModels,
	tick,
	renderer,
	createCanvasEvents,
	animateCameraToLock,
	getRandomLock,
	getLockByIndex,
	getLockById,
	handleUrlParameters,
	createIntroAnimation,
	findNewStory,
	isCameraAnimating,
} from "./modules/index.js";

async function getUserLocation() {
	try {
		const res = await fetch("/api/getLocation");
		if (!res.ok) throw new Error("API error");
		const data = await res.json(); // if your API returns JSON
		// Or: const text = await res.text(); if it returns HTML/text

		// Check for default/fallback values
		if (!data.city || data.city === "Default") {
			console.log("Geolocation not available on localhost or missing headers.");
			// Fallback logic here
		} else {
			console.log("User city:", data.city);
			// Use the city value in your UI
		}
	} catch (err) {
		console.log("Could not fetch geolocation:", err);
		// Fallback logic here
	}
}

getUserLocation();

// Window resize handling
window.addEventListener("resize", () => {
	// Update sizes
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	// Update camera
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	// Update renderer
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// GUI controls
const cameraFolder = gui.addFolder("Camera Controls");
cameraFolder
	.add(cameraMovement, "sensitivity", 0.001, 0.05, 0.001)
	.name("Mouse Sensitivity");
gui.hide(); // Hide the GUI by default

//lights
scene.add(ambientLight);
scene.add(directionalLight);

//Camera
scene.add(camera);

// Wall - vertical plane behind the locks
scene.add(wall);

// Start loading the lock models
loadLockModels().then(() => {
	// Hide loading circle when ready
	const loadingCircle = document.getElementById("loadingCircle");
	if (loadingCircle) {
		// Remove from DOM after fade animation
		setTimeout(() => {
			loadingCircle.classList.add("fade-out");
		}, 10);
	}

	// Check for URL parameters first
	handleUrlParameters();

	// Start the intro animation after locks are generated (only if no URL params handled it)
	const urlParams = new URLSearchParams(window.location.search);
	if (!urlParams.has("lockId")) {
		createIntroAnimation({
			delay: 0, // Small delay to ensure everything is rendered
			duration: 1000,
			distance: 20, // Distance from the wall
			targetLockId: null, // null for random lock, or specify lock ID like 253
		});
	}
});

// Initialize wall controls
cameraMovement.basePosition = camera.position.clone();
cameraMovement.baseRotation = camera.rotation.clone();
cameraMovement.init();

// Set up canvas events
createCanvasEvents(cameraMovement);

// Setup Find New Story button
const findNewStoryBtn = document.getElementById("findNewStoryBtn");
if (findNewStoryBtn) {
	findNewStoryBtn.addEventListener("click", () => {
		if (!isCameraAnimating()) {
			// Disable button during animation
			findNewStoryBtn.disabled = true;

			findNewStory({
				zoomOutDistance: 50,
				duration: 2000,
			});

			// Re-enable button after animation completes (total time = 2 phases * 1500ms each)
			setTimeout(() => {
				findNewStoryBtn.disabled = false;
			}, 1500);
		}
	});
}

// Listen for lock grid regeneration requests from admin interface
window.addEventListener("message", (event) => {
	if (event.data && event.data.type === "REGENERATE_LOCK_GRID") {
		console.log("Received lock grid regeneration request");
		import("./modules/locks/lockGrid.js").then((module) => {
			module.regenerateLockGrid();
		});
	}
});

// Also listen for localStorage changes as fallback
let lastRegenerateTime = localStorage.getItem("lockGridRegenerate");
setInterval(() => {
	const currentRegenerateTime = localStorage.getItem("lockGridRegenerate");
	if (currentRegenerateTime && currentRegenerateTime !== lastRegenerateTime) {
		lastRegenerateTime = currentRegenerateTime;
		console.log("Detected lock grid regeneration request via localStorage");
		import("./modules/locks/lockGrid.js").then((module) => {
			module.regenerateLockGrid();
		});
	}
}, 1000);

// Start the animation loop
tick();
