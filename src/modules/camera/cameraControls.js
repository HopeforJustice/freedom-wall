/**
 * ========================================
 * CAMERA CONTROLS MODULE
 * ========================================
 */

import * as THREE from "three";
import { camera } from "./camera.js";
import { isCameraAnimating } from "../animation/cameraAnimation.js";

// Zoom control settings
const zoomSettings = {
	minDistance: 20,
	maxDistance: 50,
	zoomSpeed: 3.0, // Reduced for smoother feel
	smoothFactor: 0.1, // Slower lerp for smoother transitions
};

// Smooth zoom state
const zoomState = {
	targetDistance: null,
	currentVelocity: 0,
	lastUpdateTime: performance.now(),
};

/**
 * Handle mouse wheel zoom
 * @param {WheelEvent} event - The wheel event
 */
export function handleZoom(event) {
	// Don't zoom during camera animations
	if (isCameraAnimating()) {
		return;
	}

	event.preventDefault();

	// Initialize target distance if not set
	if (zoomState.targetDistance === null) {
		zoomState.targetDistance = Math.abs(camera.position.z);
	}

	// Calculate zoom delta based on wheel movement
	// Normalize deltaY for different devices/browsers
	const normalizedDelta =
		(Math.sign(event.deltaY) * Math.min(Math.abs(event.deltaY), 100)) / 100;
	const delta = normalizedDelta * zoomSettings.zoomSpeed;

	// Update target distance (zoom in = decrease distance, zoom out = increase distance)
	zoomState.targetDistance = Math.max(
		zoomSettings.minDistance,
		Math.min(zoomSettings.maxDistance, zoomState.targetDistance + delta)
	);
}

/**
 * Update smooth zoom - call this in the animation loop
 */
export function updateSmoothZoom() {
	if (zoomState.targetDistance === null || isCameraAnimating()) {
		return;
	}

	const currentDistance = Math.abs(camera.position.z);
	const distanceDiff = zoomState.targetDistance - currentDistance;

	// Only update if there's a meaningful difference
	if (Math.abs(distanceDiff) > 0.01) {
		// Smooth lerp to target distance
		const newDistance = THREE.MathUtils.lerp(
			currentDistance,
			zoomState.targetDistance,
			zoomSettings.smoothFactor
		);

		// Maintain x and y position, only update z
		camera.position.z = Math.sign(camera.position.z) * newDistance;
	} else {
		// Snap to target when close enough
		camera.position.z = Math.sign(camera.position.z) * zoomState.targetDistance;
	}
}

/**
 * Get zoom settings for external access
 * @returns {Object} Zoom settings object
 */
export function getZoomSettings() {
	return { ...zoomSettings };
}

/**
 * Update zoom settings
 * @param {Object} newSettings - New zoom settings to merge
 */
export function updateZoomSettings(newSettings) {
	Object.assign(zoomSettings, newSettings);
}
