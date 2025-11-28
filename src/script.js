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
	userLocation,
} from "./modules/index.js";

// If you need to wait for location to be ready:
userLocation.ready().then(() => {
	console.log(userLocation.getCountry());
});

// Window resize handling with debouncing
let resizeTimeout;
window.addEventListener("resize", () => {
	clearTimeout(resizeTimeout);
	resizeTimeout = setTimeout(() => {
		// Update sizes
		sizes.width = window.innerWidth;
		sizes.height = window.innerHeight;

		// Update camera
		camera.aspect = sizes.width / sizes.height;
		camera.updateProjectionMatrix();

		// Update renderer
		renderer.setSize(sizes.width, sizes.height);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	}, 150); // Debounce resize events
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
			delay: 1000, // Small delay to ensure everything is rendered
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

// Also listen for localStorage changes (optimized with longer interval)
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
}, 5000); // Reduced frequency from 1s to 5s for better performance

// Start the animation loop
tick();
