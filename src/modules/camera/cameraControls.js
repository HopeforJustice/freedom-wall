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
	zoomSpeed: 5.0,
	smoothFactor: 0.5, // For smooth zoom transitions
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

	// Get the current camera position
	const currentPosition = camera.position.clone();

	// Calculate the direction from camera to the point it's looking at
	// We'll assume the camera is looking at z=0 (the wall plane)
	const lookAtPoint = new THREE.Vector3(
		currentPosition.x,
		currentPosition.y,
		0
	);
	const direction = new THREE.Vector3()
		.subVectors(lookAtPoint, currentPosition)
		.normalize();

	// Calculate zoom delta based on wheel movement
	// Normalize deltaY for different devices/browsers
	// Flip the direction: negative deltaY (scroll down) zooms in, positive deltaY (scroll up) zooms out
	const normalizedDelta =
		(-Math.sign(event.deltaY) * Math.min(Math.abs(event.deltaY), 100)) / 100;
	const delta = normalizedDelta * zoomSettings.zoomSpeed;

	// Calculate new position by moving along the direction vector
	const newPosition = currentPosition
		.clone()
		.add(direction.clone().multiplyScalar(delta));

	// Calculate distance from the wall (z=0)
	const distanceFromWall = Math.abs(newPosition.z);

	// Clamp the distance within our limits
	const clampedDistance = Math.max(
		zoomSettings.minDistance,
		Math.min(zoomSettings.maxDistance, distanceFromWall)
	);

	// Set the final position with clamped distance
	const finalPosition = new THREE.Vector3(
		currentPosition.x,
		currentPosition.y,
		Math.sign(newPosition.z) * clampedDistance
	);

	// Smoothly transition to new position
	camera.position.lerp(finalPosition, zoomSettings.smoothFactor);
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
