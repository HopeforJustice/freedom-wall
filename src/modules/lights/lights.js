// Lights
import * as THREE from "three";
export const ambientLight = new THREE.AmbientLight(0xffffff, 1.8); // Reduced from 2.4 to make shadows stronger

const createDirectionalLight = () => {
	const directionalLight = new THREE.DirectionalLight(0xffffff, 2.2);
	directionalLight.castShadow = true;
	directionalLight.shadow.mapSize.set(2048, 2048); // Optimized resolution for performance
	directionalLight.shadow.camera.far = 1000; // Optimized distance
	directionalLight.shadow.camera.left = -150; // Optimized to cover visible grid area
	directionalLight.shadow.camera.top = 150; // Optimized to cover visible grid area
	directionalLight.shadow.camera.right = 150; // Optimized to cover visible grid area
	directionalLight.shadow.camera.bottom = -150; // Optimized to cover visible grid area
	directionalLight.shadow.bias = -0.00005; // Less negative bias for darker shadows
	directionalLight.shadow.radius = 2; // Soften shadow edges slightly
	directionalLight.position.set(-60, 50, 100); // Positioned for nice angled shadows
	return directionalLight;
};

export const directionalLight = createDirectionalLight();
