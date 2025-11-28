/**
 * ========================================
 * CAMERA SETUP
 * ========================================
 */
import * as THREE from "three";
import { scene } from "../globals/globals";
import { sizes } from "../globals/globals";

// Base camera
const createCamera = () => {
	const camera = new THREE.PerspectiveCamera(
		75,
		sizes.width / sizes.height,
		0.1,
		1000 // Reduced from 100000 for better performance
	);
	camera.position.x = 0;
	camera.position.y = 0;
	camera.position.z = 40;
	return camera;
};
export const camera = createCamera();
