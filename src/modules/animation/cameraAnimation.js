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

// Lock highlighting state
// 3D Story Buttons - now supporting multiple buttons
let storyButtons = []; // Array to store all story buttons
let highlightedLock = null;
let currentStoryLock = null; // Track the currently displayed story lock to avoid repeats

// Zoom control settings
const zoomSettings = {
	minDistance: 20,
	maxDistance: 50,
	zoomSpeed: 5.0,
	smoothFactor: 0.5, // For smooth zoom transitions
};

// Button animation state
const buttonAnimation = {
	hoveredButton: null, // Track which button is hovered
	pulseTime: 0,
	baseScale: 1,
	hoverScale: 1.15, // Moderate hover effect
	pulseSpeed: 2.5, // Comfortable pulsing speed
	pulseIntensity: 0.08, // Subtle but visible pulsing
	transitionSpeed: 8, // Speed of smooth transitions
};
let buttonText = null;

/**
 * Convert text to title case
 * @param {string} text - Text to convert
 * @returns {string} Title cased text
 */
function toTitleCase(text) {
	return text.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Create a 3D story button for a lock
 * @param {THREE.Object3D} lockObject - The lock object to create a button for
 * @returns {THREE.Mesh|null} - The created button or null if no story
 */
export function createStoryButton(lockObject) {
	// Get lock info from the text plane
	let lockInfo = null;
	lockObject.traverse((child) => {
		if (child.isMesh && child.userData && child.userData.lockInfo) {
			lockInfo = child.userData.lockInfo;
		}
	});

	if (!lockInfo) {
		console.warn("No lock info found for story button");
		return null;
	}

	// Check if this lock has a story - only create button if story is true
	if (!lockInfo.story) {
		return null;
	}

	// Create temporary canvas to measure text
	const tempCanvas = document.createElement("canvas");
	const tempContext = tempCanvas.getContext("2d");
	// Set font first to measure text
	tempContext.font = "bold 32px 'Segoe UI', Arial, sans-serif";
	const buttonText = `See ${toTitleCase(lockInfo.name)}'s Story`; // Measure text to determine canvas size
	const textMetrics = tempContext.measureText(buttonText);
	const textWidth = textMetrics.width;
	const textHeight = 32; // Font size

	// Calculate canvas dimensions with padding
	const padding = 24;
	const cornerRadius = 16;
	const canvasWidth = textWidth + padding * 2;
	const canvasHeight = textHeight + padding * 2;

	// Calculate button geometry size based on text
	const buttonWidth = (canvasWidth / canvasHeight) * 1.2; // Scale to maintain aspect ratio
	const buttonHeight = 1.2;

	// Create button geometry with dynamic width
	const buttonGeometry = new THREE.PlaneGeometry(buttonWidth, buttonHeight);
	const buttonMaterial = new THREE.MeshBasicMaterial({
		color: 0xffffff,
		transparent: true,
		side: THREE.DoubleSide,
		fog: false, // Disable fog effects
		depthTest: false, // Render on top, ignore depth
		depthWrite: false, // Don't write to depth buffer
	});

	// Create button mesh
	const storyButton3D = new THREE.Mesh(buttonGeometry, buttonMaterial);

	// Create text texture for the button
	const canvas = document.createElement("canvas");
	const context = canvas.getContext("2d", {
		colorSpace: "srgb", // Ensure sRGB color space
		alpha: true,
	});
	canvas.width = canvasWidth;
	canvas.height = canvasHeight;

	// Clear canvas
	context.clearRect(0, 0, canvas.width, canvas.height);

	// Re-set font after changing canvas size (canvas resets context)
	context.font = "bold 32px 'Segoe UI', Arial, sans-serif";
	context.textAlign = "center";
	context.textBaseline = "middle";

	// Draw rounded button background
	const margin = 4;

	// Create rounded rectangle path
	context.beginPath();
	context.roundRect(
		margin,
		margin,
		canvas.width - margin * 2,
		canvas.height - margin * 2,
		cornerRadius
	);

	context.fillStyle = "#fff";
	context.fill();

	// Draw white text
	context.fillStyle = "#000";

	// Add text shadow for better legibility
	context.shadowColor = "rgba(0, 0, 0, 0.3)";
	context.shadowBlur = 4;
	context.shadowOffsetX = 1;
	context.shadowOffsetY = 1;

	context.fillText(buttonText, canvas.width / 2, canvas.height / 2);

	// Create texture from canvas
	const texture = new THREE.CanvasTexture(canvas);
	texture.needsUpdate = true;

	// Apply texture to button
	storyButton3D.material.map = texture;
	storyButton3D.material.needsUpdate = true;

	// Position button relative to lock
	const lockPosition = new THREE.Vector3();
	lockObject.getWorldPosition(lockPosition);

	storyButton3D.position.set(
		lockPosition.x,
		lockPosition.y - 1.3, // Position at bottom of the lock (locks are about 4-5 units tall)
		lockPosition.z + 1.1 // Well in front of the wall and lock
	);

	// Match button rotation to lock's rotation
	// Use Z-axis rotation to match the lock's subtle Y rotation
	storyButton3D.rotation.set(0, 0, lockObject.rotation.y);

	// Store reference to lock info for click handling
	storyButton3D.userData = { lockInfo: lockInfo, isStoryButton: true };

	// Initialize button animation properties
	storyButton3D.currentScale = buttonAnimation.baseScale;

	// Add button to scene
	scene.add(storyButton3D);

	// Add to buttons array
	storyButtons.push(storyButton3D);

	return storyButton3D;
}

/**
 * Update 3D button animations (call this in the main animation loop)
 */
export function updateButtonAnimation(deltaTime) {
	if (storyButtons.length === 0) return;

	// Use performance.now() for more reliable timing
	const currentTime = performance.now() * 0.001; // Convert to seconds

	// Update each button
	storyButtons.forEach((button) => {
		if (!button || !button.parent) return; // Skip if button was removed

		let targetScale;
		if (buttonAnimation.hoveredButton === button) {
			// When hovered, scale to hover size and stop pulsing
			targetScale = buttonAnimation.hoverScale;
		} else {
			// When not hovered, pulse around base scale using current time
			const pulseOffset =
				Math.sin(currentTime * buttonAnimation.pulseSpeed) *
				buttonAnimation.pulseIntensity;
			targetScale = buttonAnimation.baseScale + pulseOffset;
		}

		// Use a fixed transition speed if deltaTime is too small
		const effectiveDeltaTime = deltaTime > 0 ? deltaTime : 0.016; // Fallback to ~60fps
		const lerpFactor = Math.min(
			1,
			effectiveDeltaTime * buttonAnimation.transitionSpeed
		);

		// Initialize currentScale if it doesn't exist
		if (!button.currentScale) {
			button.currentScale = buttonAnimation.baseScale;
		}

		button.currentScale = THREE.MathUtils.lerp(
			button.currentScale,
			targetScale,
			lerpFactor
		);

		// Apply scale to button
		button.scale.setScalar(button.currentScale);
	});
}

/**
 * Handle button hover state
 */
export function setButtonHover(hoveredButton) {
	buttonAnimation.hoveredButton = hoveredButton;
}

/**
 * Remove all 3D story buttons
 */
export function removeAllStoryButtons() {
	storyButtons.forEach((button) => {
		if (button) {
			scene.remove(button);
			if (button.material.map) {
				button.material.map.dispose();
			}
			button.material.dispose();
			button.geometry.dispose();
		}
	});
	storyButtons = [];
	buttonAnimation.hoveredButton = null;
	highlightedLock = null;
}

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
 * Get a random lock from the scene
 * @returns {THREE.Object3D|null} Random lock object or null if none found
 */
export function getRandomLock() {
	const locks = [];

	scene.traverse((child) => {
		// Look for objects that have children with text planes
		// The cloned lock models are added directly to the scene
		if (child.parent === scene && child.children.length > 0) {
			// Check if this object has a text plane child
			const hasTextPlane = child.children.some(
				(grandChild) =>
					grandChild.isMesh &&
					grandChild.geometry instanceof THREE.PlaneGeometry &&
					grandChild.userData &&
					typeof grandChild.userData.lockId !== "undefined"
			);
			if (hasTextPlane) {
				locks.push(child);
			}
		}
	});

	console.log(`Found ${locks.length} locks in scene`);

	if (locks.length === 0) return null;

	const randomIndex = Math.floor(Math.random() * locks.length);
	return locks[randomIndex];
}

/**
 * Get a random lock that has a story
 * @returns {THREE.Object3D|null} Random lock with story or null if none found
 */
/**
 * Get a random lock that has a story, excluding a specific lock
 * @param {THREE.Object3D} excludeLock - Lock to exclude from selection
 * @returns {THREE.Object3D|null} - Random lock object with story or null if none found
 */
export function getRandomLockWithStory(excludeLock = null) {
	const locksWithStories = [];

	scene.traverse((child) => {
		// Look for objects that have children with text planes
		if (child.parent === scene && child.children.length > 0) {
			// Check if this object has a text plane child with story: true
			const hasStoryTextPlane = child.children.some(
				(grandChild) =>
					grandChild.isMesh &&
					grandChild.geometry instanceof THREE.PlaneGeometry &&
					grandChild.userData &&
					grandChild.userData.lockInfo &&
					grandChild.userData.lockInfo.story === true
			);
			if (hasStoryTextPlane && child !== excludeLock) {
				locksWithStories.push(child);
			}
		}
	});

	console.log(
		`Found ${locksWithStories.length} locks with stories in scene${
			excludeLock ? " (excluding current)" : ""
		}`
	);

	if (locksWithStories.length === 0) return null;

	const randomIndex = Math.floor(Math.random() * locksWithStories.length);
	return locksWithStories[randomIndex];
}

/**
 * Get a specific lock by ID from the scene (only if it has a story)
 * @param {number} lockId - ID of the lock to retrieve
 * @returns {THREE.Object3D|null} Lock object or null if not found or no story
 */
export function getLockById(lockId) {
	let foundLock = null;

	scene.traverse((child) => {
		// Look for objects that have children with text planes
		if (child.parent === scene && child.children.length > 0) {
			// Check if this object has a text plane child with the matching lockId AND a story
			const textPlane = child.children.find(
				(grandChild) =>
					grandChild.isMesh &&
					grandChild.geometry instanceof THREE.PlaneGeometry &&
					grandChild.userData &&
					grandChild.userData.lockId === lockId &&
					grandChild.userData.lockInfo &&
					grandChild.userData.lockInfo.story === true
			);
			if (textPlane) {
				foundLock = child;
			}
		}
	});

	console.log(
		`Lock with ID ${lockId} ${
			foundLock ? "found (with story)" : "not found or has no story"
		}`
	);
	return foundLock;
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
						duration: 2500,
						distance: 20,
					});
				} else {
					console.warn(
						`Lock with ID ${parsedLockId} not found or has no story. Using random story lock instead.`
					);
					const randomLock = getRandomLockWithStory();
					if (randomLock) {
						animateCameraToLock(randomLock.position, {
							duration: 2500,
							distance: 20,
						});
					}
				}
			}, 2000); // Give time for the scene to load
		} else {
			console.warn(`Invalid lockId parameter: ${lockId}`);
		}
	}
}

/**
 * Get a specific lock by index from the scene
 * @param {number} index - Index of the lock to retrieve
 * @returns {THREE.Object3D|null} Lock object or null if not found
 */
export function getLockByIndex(index) {
	const locks = [];

	scene.traverse((child) => {
		// Look for objects that have children with text planes
		// The cloned lock models are added directly to the scene
		if (child.parent === scene && child.children.length > 0) {
			// Check if this object has a text plane child
			const hasTextPlane = child.children.some(
				(grandChild) =>
					grandChild.isMesh &&
					grandChild.geometry instanceof THREE.PlaneGeometry &&
					grandChild.userData &&
					typeof grandChild.userData.lockId !== "undefined"
			);
			if (hasTextPlane) {
				locks.push(child);
			}
		}
	});

	console.log(`Found ${locks.length} locks in scene for index ${index}`);
	return locks[index] || null;
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
 * Handle mouse wheel zoom
 * @param {WheelEvent} event - The wheel event
 */
export function handleZoom(event) {
	// Don't zoom during camera animations
	if (cameraAnimation.isAnimating) {
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
		duration = 2500,
		targetLockIndex = null,
		distance = 8, // Default distance for intro animation
	} = options;

	setTimeout(() => {
		console.log("Starting intro animation...");
		console.log("Scene children count:", scene.children.length);

		let targetLock;

		if (targetLockIndex !== null) {
			console.log(`Trying to get lock by index: ${targetLockIndex}`);
			targetLock = getLockByIndex(targetLockIndex);
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
		duration: duration,
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
