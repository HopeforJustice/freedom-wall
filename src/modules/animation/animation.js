/**
 * ========================================
 * ANIMATION LOOP
 * ========================================
 */
import * as THREE from "three";
import { scene } from "../globals/globals.js";
import { camera } from "../camera/camera.js";
import { renderer } from "../globals/globals.js";
import { mixer } from "../globals/globals.js";
import { updateCameraAnimation } from "./cameraAnimation.js";
import { updateButtonAnimation } from "./buttonAnimation.js";

const clock = new THREE.Clock();

// Frame rate limiting
let lastTime = 0;
const targetFPS = 60;
const frameInterval = 1000 / targetFPS; // ~16.67ms between frames

export const tick = (currentTime = performance.now()) => {
	// Check if enough time has passed since last frame
	if (currentTime - lastTime < frameInterval) {
		window.requestAnimationFrame(tick);
		return;
	}

	// Update last time, accounting for any drift
	lastTime = currentTime - ((currentTime - lastTime) % frameInterval);

	const elapsedTime = clock.getElapsedTime();
	const deltaTime = clock.getDelta();

	// Update camera animation
	updateCameraAnimation();

	// Update button animation
	updateButtonAnimation(deltaTime);

	// Update mixer
	if (mixer !== null) {
		mixer.update(deltaTime);
	}

	// Render
	renderer.render(scene, camera);

	// Call tick again on the next frame
	window.requestAnimationFrame(tick);
};
