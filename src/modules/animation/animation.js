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
import { updateSmoothZoom } from "../camera/cameraControls.js";

const clock = new THREE.Clock();

export const tick = () => {
	const deltaTime = clock.getDelta();

	// Update camera animation
	updateCameraAnimation();

	// Update smooth zoom
	updateSmoothZoom();

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
