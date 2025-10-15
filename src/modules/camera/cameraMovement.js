import * as THREE from "three";
import { camera } from "./camera.js";
import { isCameraAnimating } from "../animation/cameraAnimation.js";

// Camera movement controls for panning around the wall
export const cameraMovement = {
	mouseX: 0,
	mouseY: 0,
	isMouseDown: false,
	sensitivity: 0.025,
	basePosition: new THREE.Vector3(1, 1, 10),
	baseRotation: new THREE.Euler(),

	// Movement boundaries based on lock grid
	boundaries: {
		minX: -110, //to the left
		maxX: 115,
		minY: -125,
		maxY: 130, // to the top
	},

	// Define the plane normal and up vector for parallel movement
	planeNormal: new THREE.Vector3(0, 0, 1), // Wall normal (facing camera)
	planeUp: new THREE.Vector3(0, 1, 0), // Up direction
	planeRight: new THREE.Vector3(1, 0, 0), // Right direction

	// Function to clamp camera position within boundaries
	clampPosition() {
		camera.position.x = Math.max(
			this.boundaries.minX,
			Math.min(this.boundaries.maxX, camera.position.x)
		);
		camera.position.y = Math.max(
			this.boundaries.minY,
			Math.min(this.boundaries.maxY, camera.position.y)
		);
	},

	init() {
		// Calculate plane vectors based on camera orientation
		const forward = new THREE.Vector3(0, 0, -1);
		forward.applyQuaternion(camera.quaternion);

		this.planeRight
			.crossVectors(forward, new THREE.Vector3(0, 1, 0))
			.normalize();
		this.planeUp.crossVectors(this.planeRight, forward).normalize();
	},

	onMouseMove(event) {
		if (!this.isMouseDown || isCameraAnimating()) return;

		const deltaX = event.clientX - this.mouseX;
		const deltaY = event.clientY - this.mouseY;

		// Move camera parallel to the wall plane (inverted for dragging feel)
		const rightMovement = this.planeRight
			.clone()
			.multiplyScalar(-deltaX * this.sensitivity);
		const upMovement = this.planeUp
			.clone()
			.multiplyScalar(deltaY * this.sensitivity);

		camera.position.add(rightMovement);
		camera.position.add(upMovement);

		// Apply boundary constraints
		this.clampPosition();

		this.mouseX = event.clientX;
		this.mouseY = event.clientY;
	},

	onMouseDown(event) {
		if (isCameraAnimating()) return;
		this.isMouseDown = true;
		this.mouseX = event.clientX;
		this.mouseY = event.clientY;
	},

	onMouseUp() {
		this.isMouseDown = false;
	},

	// Touch event handlers for mobile/tablet support
	onTouchStart(event) {
		event.preventDefault(); // Prevent scrolling
		if (isCameraAnimating()) return;
		// Only handle single touch for camera movement
		if (event.touches.length === 1) {
			const touch = event.touches[0];
			this.isMouseDown = true;
			this.mouseX = touch.clientX;
			this.mouseY = touch.clientY;
		} else {
			// Multi-touch - disable camera movement
			this.isMouseDown = false;
		}
	},

	onTouchMove(event) {
		event.preventDefault(); // Prevent scrolling
		// Only handle single touch camera movement
		if (!this.isMouseDown || event.touches.length !== 1 || isCameraAnimating())
			return;

		const touch = event.touches[0];
		const deltaX = touch.clientX - this.mouseX;
		const deltaY = touch.clientY - this.mouseY;

		// Move camera parallel to the wall plane (inverted for dragging feel)
		// Use higher sensitivity for touch devices (2x multiplier)
		const touchSensitivity = this.sensitivity * 2.0;
		const rightMovement = this.planeRight
			.clone()
			.multiplyScalar(-deltaX * touchSensitivity);
		const upMovement = this.planeUp
			.clone()
			.multiplyScalar(deltaY * touchSensitivity);

		camera.position.add(rightMovement);
		camera.position.add(upMovement);

		// Apply boundary constraints
		this.clampPosition();

		this.mouseX = touch.clientX;
		this.mouseY = touch.clientY;
	},

	onTouchEnd(event) {
		event.preventDefault(); // Prevent scrolling
		this.isMouseDown = false;
	},
};
