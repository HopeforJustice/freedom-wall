/**
 * ========================================
 * CAMERA ANIMATION MODULE
 * ========================================
 */

import * as THREE from "three";
import { camera } from "../camera/camera.js";
import { scene } from "../globals/globals.js";
import { renderer } from "../globals/globals.js";
import { canvas } from "../globals/globals.js";
import {
	getRandomLock,
	getRandomLockWithStory,
	getLockById,
	getLockByIndex,
} from "../locks/lockUtils.js";

// Lock highlighting state
let highlightedLock = null;
let currentStoryLock = null; // Track the currently displayed story lock to avoid repeats

// Camera animation state
const cameraAnimation = {
	isAnimating: false,
	startPosition: null,
	startRotation: null,
	targetPosition: null,
	targetRotation: null,
	duration: 2000, // 2 seconds
	startTime: null,
	onComplete: null,

	// Easing functions
	easeOutQuart: (t) => 1 - Math.pow(1 - t, 4),
	easeInOutCubic: (t) =>
		t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
	easeOutExpo: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
};

/**
 * Animate camera to look at a specific lock
 * @param {THREE.Vector3} lockPosition - World position of the target lock
 * @param {Object} options - Animation options
 * @param {number} options.distance - Distance from the lock (default: 3)
 * @param {number} options.duration - Animation duration in ms (default: 2000)
 * @param {string} options.easing - Easing function name (default: 'easeOutQuart')
 * @param {Function} options.onComplete - Callback when animation completes
 * @param {THREE.Object3D} options.targetLock - The lock object to highlight (optional)
 * @param {boolean} options.highlight - Whether to highlight the target lock (default: true)
 */
export function animateCameraToLock(lockPosition, options = {}) {
	const {
		distance = 3,
		duration = 2000,
		easing = "easeOutQuart",
		onComplete = null,
		targetLock = null,
		highlight = true,
	} = options;

	// Don't start new animation if one is already running
	if (cameraAnimation.isAnimating) {
		console.warn("Camera animation already in progress");
		return;
	}

	// Note: Story buttons are now created automatically in lockGrid.js for all locks with stories

	// Update current story lock tracker if this lock has a story
	if (targetLock) {
		// Check if the target lock has a story
		let hasStory = false;
		targetLock.traverse((child) => {
			if (
				child.isMesh &&
				child.userData &&
				child.userData.lockInfo &&
				child.userData.lockInfo.story
			) {
				hasStory = true;
			}
		});
		if (hasStory) {
			currentStoryLock = targetLock;
			console.log("Updated current story lock tracker");
		}
	}

	cameraAnimation.isAnimating = true;
	cameraAnimation.startTime = Date.now();
	cameraAnimation.duration = duration;
	cameraAnimation.onComplete = onComplete;

	// Store starting position and rotation
	cameraAnimation.startPosition = camera.position.clone();
	cameraAnimation.startRotation = camera.rotation.clone();

	// Calculate target position - position camera in front of the wall looking at the lock
	// Since the wall is at z=0 and locks are flat on the wall, position camera with positive z
	cameraAnimation.targetPosition = new THREE.Vector3(
		lockPosition.x,
		lockPosition.y,
		distance // Position camera at specified distance from the wall
	);

	console.log(
		`Camera animation: distance=${distance}, target position:`,
		cameraAnimation.targetPosition
	);

	// Calculate target rotation - look directly at the wall/lock position
	// The target should be the lock position on the wall (z=0)
	const lookAtTarget = new THREE.Vector3(lockPosition.x, lockPosition.y, 0);
	const tempCamera = camera.clone();
	tempCamera.position.copy(cameraAnimation.targetPosition);
	tempCamera.lookAt(lookAtTarget);
	cameraAnimation.targetRotation = tempCamera.rotation.clone();
}

/**
 * Animate camera to a specific position and rotation
 * @param {THREE.Vector3} targetPosition - Target camera position
 * @param {THREE.Euler} targetRotation - Target camera rotation
 * @param {Object} options - Animation options
 */
export function animateCameraToPosition(
	targetPosition,
	targetRotation,
	options = {}
) {
	const {
		duration = 2000,
		easing = "easeOutQuart",
		onComplete = null,
	} = options;

	if (cameraAnimation.isAnimating) {
		console.warn("Camera animation already in progress");
		return;
	}

	cameraAnimation.isAnimating = true;
	cameraAnimation.startTime = Date.now();
	cameraAnimation.duration = duration;
	cameraAnimation.onComplete = onComplete;

	cameraAnimation.startPosition = camera.position.clone();
	cameraAnimation.startRotation = camera.rotation.clone();
	cameraAnimation.targetPosition = targetPosition.clone();
	cameraAnimation.targetRotation = targetRotation.clone();
}

/**
 * Parse URL parameters and handle lock ID if provided
 */
export function handleUrlParameters() {
	const urlParams = new URLSearchParams(window.location.search);
	const lockId = urlParams.get("lockId");

	if (lockId) {
		const parsedLockId = parseInt(lockId, 10);
		if (!isNaN(parsedLockId)) {
			console.log(`URL parameter found: lockId=${parsedLockId}`);
			// Wait a bit for the scene to be fully loaded
			setTimeout(() => {
				const targetLock = getLockById(parsedLockId);
				if (targetLock) {
					console.log(`Animating to lock with ID ${parsedLockId} (has story)`);
					animateCameraToLock(targetLock.position, {
						duration: 2000,
						distance: 20,
					});
				} else {
					console.warn(
						`Lock with ID ${parsedLockId} not found or has no story. Using random story lock instead.`
					);
					const randomLock = getRandomLockWithStory();
					if (randomLock) {
						animateCameraToLock(randomLock.position, {
							duration: 2000,
							distance: 20,
						});
					}
				}
			}, 200); // Give time for the scene to load
		} else {
			console.warn(`Invalid lockId parameter: ${lockId}`);
		}
	}
}

/**
 * Update camera animation - should be called in the main animation loop
 */
export function updateCameraAnimation() {
	if (!cameraAnimation.isAnimating) {
		return;
	}

	const elapsed = Date.now() - cameraAnimation.startTime;
	const progress = Math.min(elapsed / cameraAnimation.duration, 1);

	// Apply easing
	const easedProgress = cameraAnimation.easeOutQuart(progress);

	// Interpolate position
	camera.position.lerpVectors(
		cameraAnimation.startPosition,
		cameraAnimation.targetPosition,
		easedProgress
	);

	// Interpolate rotation
	camera.rotation.x =
		cameraAnimation.startRotation.x +
		(cameraAnimation.targetRotation.x - cameraAnimation.startRotation.x) *
			easedProgress;
	camera.rotation.y =
		cameraAnimation.startRotation.y +
		(cameraAnimation.targetRotation.y - cameraAnimation.startRotation.y) *
			easedProgress;
	camera.rotation.z =
		cameraAnimation.startRotation.z +
		(cameraAnimation.targetRotation.z - cameraAnimation.startRotation.z) *
			easedProgress;

	// Animation complete check

	// End animation
	if (progress >= 1) {
		cameraAnimation.isAnimating = false;

		// Call completion callback if provided
		if (cameraAnimation.onComplete) {
			cameraAnimation.onComplete();
		}
	}
}

/**
 * Check if camera animation is currently running
 * @returns {boolean} True if animation is active
 */
export function isCameraAnimating() {
	return cameraAnimation.isAnimating;
}

/**
 * Stop current camera animation
 */
export function stopCameraAnimation() {
	cameraAnimation.isAnimating = false;
}

/**
 * Create an intro animation that zooms to a random lock
 * @param {Object} options - Animation options
 */
export function createIntroAnimation(options = {}) {
	const {
		delay = 0,
		duration = 200,
		targetLockId = null, // Changed from targetLockIndex to targetLockId
		distance = 8, // Default distance for intro animation
	} = options;

	setTimeout(() => {
		console.log("Starting intro animation...");
		console.log("Scene children count:", scene.children.length);

		let targetLock;

		if (targetLockId !== null) {
			console.log(`Trying to get lock by ID: ${targetLockId}`);
			targetLock = getLockById(targetLockId);
		} else {
			console.log("Trying to get random lock with story...");
			targetLock = getRandomLockWithStory();
		}

		if (targetLock) {
			console.log("Found target lock:", targetLock);
			const lockPosition = new THREE.Vector3();
			targetLock.getWorldPosition(lockPosition);
			console.log("Lock position:", lockPosition);

			animateCameraToLock(lockPosition, {
				distance: distance,
				duration: duration,
				easing: "easeOutQuart",
				targetLock: targetLock,
				highlight: true,
				onComplete: () => {
					console.log("Intro animation completed");
					// Set the current story lock so "Find New Story" won't repeat it
					currentStoryLock = targetLock;
				},
			});
		} else {
			console.warn("No locks found for intro animation");
			// Debug: Let's see what's actually in the scene
			console.log("Scene structure:");
			scene.traverse((child) => {
				if (child.parent === scene) {
					console.log("Scene child:", child.type, child.children.length, child);
				}
			});
		}
	}, delay);
}

/**
 * Find a new story by zooming out and then into a random story lock
 * @param {Object} options - Animation options
 * @param {number} options.zoomOutDistance - How far to zoom out (default: 50)
 * @param {number} options.duration - Duration for each phase in ms (default: 1500)
 */
export function findNewStory(options = {}) {
	const { zoomOutDistance = 50, duration = 1500 } = options;

	// Don't start if animation is already running
	if (isCameraAnimating()) {
		console.warn("Camera animation already in progress");
		return;
	}

	// Store the current camera position to calculate zoom out position
	const currentPosition = camera.position.clone();

	// Calculate zoom out position - move camera back along Z axis
	const zoomOutPosition = new THREE.Vector3(
		currentPosition.x,
		currentPosition.y,
		currentPosition.z + zoomOutDistance
	);

	console.log("Starting find new story animation...");
	console.log("Current position:", currentPosition);
	console.log("Zoom out position:", zoomOutPosition);

	// Phase 1: Zoom out
	animateCameraToPosition(zoomOutPosition, camera.rotation.clone(), {
		duration: duration / 2,
		easing: "easeInOutCubic",
		onComplete: () => {
			// Phase 2: Find a new random story lock (excluding current one) and zoom into it
			const newStoryLock = getRandomLockWithStory(currentStoryLock);

			if (newStoryLock) {
				const lockPosition = new THREE.Vector3();
				newStoryLock.getWorldPosition(lockPosition);

				console.log("Found new story lock, zooming in to:", lockPosition);

				// Update the current story lock tracker
				currentStoryLock = newStoryLock;

				// Zoom into the new story lock
				animateCameraToLock(lockPosition, {
					distance: 20, // Same distance as intro animation
					duration: duration,
					easing: "easeOutQuart",
					targetLock: newStoryLock,
					highlight: true,
					onComplete: () => {
						console.log("Find new story animation completed");
					},
				});
			} else {
				console.warn("No other story locks found for new story animation");
			}
		},
	});
}
