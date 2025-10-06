import {
	wallControls,
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
	createIntroAnimation,
	findNewStory,
	isCameraAnimating,
} from "./modules/index.js";

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
	.add(wallControls, "sensitivity", 0.001, 0.05, 0.001)
	.name("Mouse Sensitivity");

//lights
scene.add(ambientLight);
scene.add(directionalLight);

//Camera
scene.add(camera);

// Wall - vertical plane behind the locks
scene.add(wall);

// Start loading the lock models
loadLockModels().then(() => {
	// Start the intro animation after locks are generated
	createIntroAnimation({
		delay: 800, // Small delay to ensure everything is rendered
		duration: 2500,
		distance: 20, // Distance from the wall
		targetLockIndex: null, // null for random lock, or specify index like 0, 15, etc.
	});
});

// Initialize wall controls
wallControls.basePosition = camera.position.clone();
wallControls.baseRotation = camera.rotation.clone();
wallControls.init();

// Setup canvas event listeners for camera controls
createCanvasEvents(wallControls);

// Setup Find New Story button
const findNewStoryBtn = document.getElementById("findNewStoryBtn");
if (findNewStoryBtn) {
	findNewStoryBtn.addEventListener("click", () => {
		if (!isCameraAnimating()) {
			// Disable button during animation
			findNewStoryBtn.disabled = true;
			findNewStoryBtn.textContent = "Finding Story...";

			findNewStory({
				zoomOutDistance: 50,
				duration: 1500,
			});

			// Re-enable button after animation completes (total time = 2 phases * 1500ms each)
			setTimeout(() => {
				findNewStoryBtn.disabled = false;
				findNewStoryBtn.textContent = "Find New Story";
			}, 3000);
		}
	});
}

// Start the animation loop
tick();
