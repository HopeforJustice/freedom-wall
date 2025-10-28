/**
 * ========================================
 * GLOBAL VARIABLES AND SETUP
 * ========================================
 */
import GUI from "lil-gui";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");

export const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

export const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};

class Mode {
	constructor() {
		this.editMode = false;
		this.showIdMode = false;
	}
	isEditMode() {
		if (this.editMode === true) return true;
		let params = new URLSearchParams(document.location.search);
		let edit = params.get("edit");
		if (edit === "true") {
			this.editMode = true;
			return this.editMode;
		}
		return false;
	}
	isShowIdMode() {
		if (this.showIdMode === true) return true;
		let params = new URLSearchParams(document.location.search);
		this.showIdMode = params.has("showId");
		return this.showIdMode;
	}
}

export const mode = new Mode();
export const gui = new GUI();
export const canvas = document.querySelector("canvas.webgl");
export const scene = new THREE.Scene();
export let mixer = null;

/**
 * ========================================
 * RENDERER SETUP
 * ========================================
 */
const createRenderer = () => {
	const renderer = new THREE.WebGLRenderer({
		canvas: canvas,
		antialias: true,
	});
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	return renderer;
};
export const renderer = createRenderer();
