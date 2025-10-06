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
	lockData,
	createLockTextTexture,
} from "../index.js";
import { createStoryButton } from "../animation/cameraAnimation.js";

// Array to store loaded lock models
let lockModels = [];
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

// Function to randomly select a lock model
function getRandomLockModel() {
	const randomIndex = Math.floor(Math.random() * lockModels.length);
	return lockModels[randomIndex];
}

// Function to generate the lock grid after models are loaded
async function generateLockGrid() {
	// Create a grid of locks to fill the plane
	const gridSize = 32; //32*32 = 1024 locks
	const spacing = 9; // Distance between locks - increased to prevent touching
	const minDistance = 6; // Minimum distance between lock centers to prevent overlap
	let lockIndex = 0;

	// Array to store all lock positions for collision detection
	const lockPositions = [];

	for (let row = 0; row < gridSize; row++) {
		for (let col = 0; col < gridSize; col++) {
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

			scene.add(cloned);

			// Add text plane to each model
			let lockInfo;
			if (lockIndex < lockData.length) {
				lockInfo = lockData[lockIndex];
			} else {
				// Use default data when we run out of lock data
				lockInfo = {
					name: "NAME",
					date: "2025",
					id: lockIndex,
					story: false, // Default locks don't have stories
				};
			}

			const textTexture = await createLockTextTexture(lockInfo);
			const textMaterial = new THREE.MeshBasicMaterial({
				map: textTexture,
				transparent: true,
				alphaTest: 0.1,
				side: THREE.DoubleSide,
			});

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
				console.log(
					`Creating story button for lock ${lockIndex} (${lockInfo.name}) with story: ${lockInfo.story}`
				);
				const button = createStoryButton(cloned);
				if (button) {
					console.log(
						`Story button created successfully for lock ${lockIndex}`
					);
				} else {
					console.log(`Story button creation failed for lock ${lockIndex}`);
				}
			}

			lockIndex++;
		}
	}
}
