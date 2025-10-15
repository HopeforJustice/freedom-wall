/**
 * ========================================
 * LOCK UTILITIES MODULE
 * ========================================
 */

import * as THREE from "three";
import { scene } from "../globals/globals.js";

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
					grandChild.userData.lockInfo &&
					grandChild.userData.lockInfo.id === lockId && // Use lockInfo.id instead of lockId
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
