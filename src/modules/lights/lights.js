// Lights
import * as THREE from "three";
export const ambientLight = new THREE.AmbientLight(0xffffff, 1.8); // Reduced from 2.4 to make shadows stronger

const createDirectionalLight = () => {
	const directionalLight = new THREE.DirectionalLight(0xffffff, 2.2);
	directionalLight.castShadow = true;
	directionalLight.shadow.mapSize.set(4048, 4048); // High resolution for crisp shadows
	directionalLight.shadow.camera.far = 1500; // Increased distance
	directionalLight.shadow.camera.left = -1000; // Expanded to cover full 20x20 grid with margin
	directionalLight.shadow.camera.top = 1000; // Expanded to cover full 20x20 grid with margin
	directionalLight.shadow.camera.right = 1000; // Expanded to cover full 20x20 grid with margin
	directionalLight.shadow.camera.bottom = -1000; // Expanded to cover full 20x20 grid with margin
	directionalLight.shadow.bias = -0.00005; // Less negative bias for darker shadows
	directionalLight.shadow.radius = 2; // Soften shadow edges slightly
	directionalLight.position.set(-60, 50, 100); // Positioned for nice angled shadows
	return directionalLight;
};

export const directionalLight = createDirectionalLight();
