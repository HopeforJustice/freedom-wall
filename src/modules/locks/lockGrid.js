/**
 * ========================================
 * LOCK GRID GENERATION
 * ========================================
 */

import * as THREE from "three";
import {
	scene,
	gltfLoader,
	textSettings,
	textPlanes,
	createLockTextTexture,
} from "../index.js";
import { createStoryButton } from "../animation/buttonAnimation.js";
import { lockDataAPI } from "./lockDataAPI.js";
import { clearInteractiveObjects } from "../canvasEvents/canvasEvents.js";

// Array to store loaded lock models
let lockModels = [];
let currentLockMeshes = []; // Track current lock meshes for cleanup

// Material cache for better performance
const textMaterialCache = new Map();

const lockModelPaths = [
	"/models/lockOne-no-text.glb",
	"/models/lockTwo-no-text.glb",
];

// Function to load all lock models
export async function loadLockModels() {
	const loadPromises = lockModelPaths.map((path) => {
		return new Promise((resolve, reject) => {
				gltfLoader.load(
					path,
					(gltf) => {
						// Set up shadow settings for the model
						gltf.scene.traverse(function (node) {
							if (node.isMesh) {
								node.castShadow = true;
								node.receiveShadow = true;
								// Optimize: don't update materials every frame
								if (node.material) {
									node.material.needsUpdate = false;
								}
							}
						});
						resolve(gltf.scene);
					},
				undefined,
				reject
			);
		});
	});

	try {
		lockModels = await Promise.all(loadPromises);
		console.log(`Loaded ${lockModels.length} lock models successfully`);
		await generateLockGrid();

		return lockModels;
	} catch (error) {
		console.error("Error loading lock models:", error);
		return null;
	}
}

// Function to clear existing locks from the scene
function clearLockGrid() {
	// Clear interactive objects registry
	clearInteractiveObjects();
	
	// Remove all current lock meshes from scene
	currentLockMeshes.forEach((mesh) => {
		scene.remove(mesh);
		// Dispose of geometries and materials to free memory
		if (mesh.geometry) mesh.geometry.dispose();
		if (mesh.material) {
			if (Array.isArray(mesh.material)) {
				mesh.material.forEach((mat) => {
					if (mat.map) mat.map.dispose();
					mat.dispose();
				});
			} else {
				if (mesh.material.map) mesh.material.map.dispose();
				mesh.material.dispose();
			}
		}
	});

	// Clear the arrays
	currentLockMeshes.length = 0;
	textPlanes.length = 0;
	
	// Clear material cache
	textMaterialCache.clear();

	console.log("Cleared existing lock grid");
}

// Function to regenerate the lock grid (useful after lock deletions)
export async function regenerateLockGrid() {
	if (lockModels.length === 0) {
		console.warn("Lock models not loaded yet, cannot regenerate grid");
		return;
	}

	// Clear cache to ensure fresh data
	lockDataAPI.clearCache();

	// Clear existing grid
	clearLockGrid();

	// Generate new grid
	await generateLockGrid();

	console.log("Lock grid regenerated successfully");
}

// Function to randomly select a lock model
function getRandomLockModel() {
	const randomIndex = Math.floor(Math.random() * lockModels.length);
	return lockModels[randomIndex];
}

// Function to generate the lock grid after models are loaded
async function generateLockGrid() {
	// Fetch lock data from API
	console.log("Fetching lock data from database...");
	const lockData = await lockDataAPI.getAllLocks();
	console.log(`Loaded ${lockData.length} locks from database`);

	// Calculate grid dimensions based on actual number of locks
	const totalLocks = lockData.length;
	const gridSize = Math.ceil(Math.sqrt(totalLocks)); // Square grid that fits all locks
	const spacing = 9; // Distance between locks - increased to prevent touching
	const minDistance = 6; // Minimum distance between lock centers to prevent overlap
	let lockIndex = 0;

	console.log(`Creating ${gridSize}x${gridSize} grid for ${totalLocks} locks`);

	// Array to store all lock positions for collision detection
	const lockPositions = [];

	for (let row = 0; row < gridSize && lockIndex < totalLocks; row++) {
		for (let col = 0; col < gridSize && lockIndex < totalLocks; col++) {
			// Randomly select a lock model for this position
			const selectedModel = getRandomLockModel();
			const cloned = selectedModel.clone();

			cloned.rotation.x = Math.PI * 0.5;

			// Add very subtle random Y rotation to each lock (between -2 and +2 degrees)
			const randomYRotation = (Math.random() - 0.5) * 0.15;
			cloned.rotation.y = randomYRotation;

			// Flip the lock geometry horizontally using scale instead of rotation
			cloned.scale.x = -1;

			// Position locks in a grid pattern with row offset and smart collision avoidance
			const rowOffset = (row % 2) * (spacing * 0.5); // Offset every other row by half spacing

			let validPosition = false;
			let attempts = 0;
			let finalX, finalY;

			while (!validPosition && attempts < 20) {
				// Add random variation to position - reduced for fewer collisions
				const maxVariation = spacing * 0.125;
				const randomXOffset = (Math.random() - 0.5) * maxVariation;
				const randomYOffset = (Math.random() - 0.5) * maxVariation;

				finalX =
					col * spacing -
					(gridSize - 1) * spacing * 0.5 +
					rowOffset +
					randomXOffset;
				finalY = row * spacing - (gridSize - 1) * spacing * 0.5 + randomYOffset;

				// Check if this position conflicts with existing locks
				validPosition = true;
				for (const existingPos of lockPositions) {
					const distance = Math.sqrt(
						Math.pow(finalX - existingPos.x, 2) +
							Math.pow(finalY - existingPos.y, 2)
					);
					if (distance < minDistance) {
						validPosition = false;
						break;
					}
				}
				attempts++;
			}

			// If we couldn't find a valid position after attempts, use grid position with minimal offset
			if (!validPosition) {
				finalX = col * spacing - (gridSize - 1) * spacing * 0.5 + rowOffset;
				finalY = row * spacing - (gridSize - 1) * spacing * 0.5;
			}

			cloned.position.x = finalX;
			cloned.position.y = finalY;
			cloned.position.z = 0;

			// Store this position for future collision checks
			lockPositions.push({ x: finalX, y: finalY });

			// Track this mesh for cleanup
			currentLockMeshes.push(cloned);

			scene.add(cloned);

			// Add text plane to each model - only use real lock data
			const lockInfo = lockData[lockIndex];

			const textTexture = await createLockTextTexture(lockInfo);
			const textMaterial = new THREE.MeshBasicMaterial({
				map: textTexture,
				transparent: true,
				alphaTest: 0.1,
				side: THREE.DoubleSide,
			});
			// Mark material as not needing updates after initial creation
			textMaterial.needsUpdate = false;

			const textGeometry = new THREE.PlaneGeometry(4, 2);
			const textPlane = new THREE.Mesh(textGeometry, textMaterial);

			// Position the text plane using textSettings values
			textPlane.position.set(
				textSettings.positionX,
				textSettings.positionY,
				textSettings.positionZ
			);
			textPlane.rotation.set(
				textSettings.rotationX,
				textSettings.rotationY,
				textSettings.rotationZ
			);
			textPlane.scale.set(textSettings.scaleX, textSettings.scaleY, 1);

			// Counter-flip the text to appear normal since the lock is flipped
			textPlane.scale.x = textPlane.scale.x * -1;

			textPlane.receiveShadow = false;
			textPlane.castShadow = false;

			// Store reference to this text plane
			textPlane.userData = { lockId: lockIndex, lockInfo: lockInfo };
			textPlanes.push(textPlane);

			cloned.add(textPlane);

			// Create story button if this lock has a story
			if (lockInfo.story) {
				const button = createStoryButton(cloned);
			}

			lockIndex++;
		}
	}
}
