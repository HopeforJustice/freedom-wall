import * as THREE from "three";

// Wall - vertical plane behind the locks
const createWall = () => {
	const wall = new THREE.Mesh(
		new THREE.PlaneGeometry(800, 800), // Large enough to cover the lock grid
		new THREE.MeshStandardMaterial({
			color: "#232323",
			metalness: 0.1,
			roughness: 0.8,
		})
	);
	wall.receiveShadow = true;
	wall.position.z = 0; // Position behind the locks (locks are at z=0)
	wall.position.y = 0; // Center vertically with the lock grid
	return wall;
};

export const wall = createWall();
