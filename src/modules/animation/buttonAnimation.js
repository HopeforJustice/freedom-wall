/**
 * ========================================
 * BUTTON ANIMATION MODULE
 * ========================================
 */

import * as THREE from "three";
import { scene } from "../globals/globals.js";

// 3D Story Buttons - supporting multiple buttons
let storyButtons = []; // Array to store all story buttons

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
}
