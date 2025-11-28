/**
 * ========================================
 * TEXT SETTINGS AND GUI FUNCTIONS
 * ========================================
 */
import { textConfig } from "./textConfig";
import * as THREE from "three";

export const textSettings = {
	text: "",
	fontSize: 64,
	color: "#ff6b6b",
	positionZ: -3,
	positionY: 1.1, // Set to the value that works for you
	positionX: 0,
	rotationX: -Math.PI * 0.5,
	rotationY: 0,
	rotationZ: 0,
	scaleX: 2,
	scaleY: 2,
	visible: true,

	async updateText() {
		if (textPlanes.length > 0 && textPlanes[this.selectedLock]) {
			// Create new texture with updated settings (for manual text override)
			const newTexture = await createTextTexture(
				this.text,
				this.fontSize,
				this.color
			);
			textPlanes[this.selectedLock].material.map = newTexture;
			textPlanes[this.selectedLock].material.needsUpdate = true;
		}
	},

	updatePosition() {
		// Update all text planes
		textPlanes.forEach((plane) => {
			plane.position.set(this.positionX, this.positionY, this.positionZ);
		});
	},

	updateRotation() {
		// Update all text planes
		textPlanes.forEach((plane) => {
			plane.rotation.set(this.rotationX, this.rotationY, this.rotationZ);
		});
	},

	updateScale() {
		// Update all text planes
		textPlanes.forEach((plane) => {
			plane.scale.set(this.scaleX, this.scaleY, 1);
		});
	},

	updateVisibility() {
		// Update all text planes
		textPlanes.forEach((plane) => {
			plane.visible = this.visible;
		});
	},

	resetToModel() {
		// Reset to model position and rotation
		this.positionX = 0;
		this.positionY = 1.1;
		this.positionZ = -3;
		this.rotationX = -Math.PI * 0.5;
		this.rotationY = 0;
		this.rotationZ = 0;
		this.scaleX = 2;
		this.scaleY = 2;
		this.updatePosition();
		this.updateRotation();
		this.updateScale();
	},

	refreshLockData() {
		// Refresh text for all locks with their original data
		textPlanes.forEach(async (plane, index) => {
			if (plane.userData.lockInfo) {
				const newTexture = await createLockTextTexture(plane.userData.lockInfo);
				plane.material.map = newTexture;
				plane.material.needsUpdate = true;
			}
		});
		this.refreshLockData();
	},
};

export const textPlanes = []; // Store all text planes

// Global font loading cache
let fontLoaded = false;
let fontLoadPromise = null;

export async function waitForFontLoad(fontFamily, timeout = 3000) {
	// Return cached result if already loaded
	if (fontLoaded) {
		return true;
	}

	// Return existing promise if already loading
	if (fontLoadPromise) {
		return fontLoadPromise;
	}

	// Start loading and cache the promise
	fontLoadPromise = (async () => {
		try {
			await document.fonts.load(`16px ${fontFamily}`);
			await document.fonts.load(`bold 16px ${fontFamily}`);
			fontLoaded = true;
			return true;
		} catch (error) {
			console.warn(`Font ${fontFamily} failed to load:`, error);
			return false;
		}
	})();

	return fontLoadPromise;
}

// Function to create text texture for lock with name and date
export async function createLockTextTexture(lockInfo, config = textConfig) {
	const canvas = document.createElement("canvas");
	const context = canvas.getContext("2d");

	// Set canvas size
	canvas.width = config.canvasWidth;
	canvas.height = config.canvasHeight;

	// Clear canvas
	if (config.backgroundColor !== "transparent") {
		context.fillStyle = config.backgroundColor;
		context.fillRect(0, 0, canvas.width, canvas.height);
	}

	// Wait for font to load if not already loaded (uses cached result)
	await waitForFontLoad(config.fontFamily);

	// Determine which font to use
	const fontToUse = fontLoaded
		? `${config.fontFamily}, ${config.fallbackFont}`
		: config.fallbackFont;

	// Calculate dynamic font size based on name length and add slight variation
	const nameLength = lockInfo.name.length;
	let baseFontSize = textConfig.fontSize;

	// Reduce font size for longer names
	if (nameLength > 8) {
		baseFontSize = textConfig.fontSize * 0.8; // 20% smaller for long names
	} else if (nameLength > 6) {
		baseFontSize = textConfig.fontSize * 0.9; // 10% smaller for medium names
	}

	// Add slight random variation (±5%)
	const randomVariation = 0.95 + Math.random() * 0.1; // 0.95 to 1.05
	const finalFontSize = Math.floor(baseFontSize * randomVariation);
	const dateFontSize = Math.floor(finalFontSize * 0.7);

	// Calculate text positioning
	const centerX = canvas.width / 2;
	const centerY = canvas.height / 2;

	const uppercaseName = lockInfo.name.toUpperCase();

	// Draw name (larger, top line) - use dynamic font size
	context.fillStyle = config.nameColor;
	context.font = `bold ${finalFontSize}px ${fontToUse}`;
	context.textAlign = "center";
	context.textBaseline = "middle";
	if (lockInfo.story) {
		context.fillText(
			`${uppercaseName}'S`,
			centerX,
			centerY - textConfig.lineSpacing
		);
	} else {
		context.fillText(uppercaseName, centerX, centerY - textConfig.lineSpacing);
	}

	// Draw date (smaller, bottom line) - proportional to name font size
	context.fillStyle = config.dateColor;
	context.font = `${dateFontSize}px ${fontToUse}`;
	if (lockInfo.story) {
		context.fillText("STORY", centerX, centerY + textConfig.lineSpacing);
	} else {
		context.fillText(lockInfo.date, centerX, centerY + textConfig.lineSpacing);
	}

	// Create texture
	const texture = new THREE.CanvasTexture(canvas);
	texture.needsUpdate = true;

	return texture;
}

// Function to create text texture (keeping for GUI controls)
export async function createTextTexture(
	text,
	fontSize = 64,
	textColor = "#ff6b6b",
	backgroundColor = "transparent"
) {
	const canvas = document.createElement("canvas");
	const context = canvas.getContext("2d");

	// Set canvas size
	canvas.width = textConfig.canvasWidth;
	canvas.height = textConfig.canvasHeight;

	// Clear canvas
	context.clearRect(0, 0, canvas.width, canvas.height);

	// Set background (if needed)
	if (backgroundColor !== "transparent") {
		context.fillStyle = backgroundColor;
		context.fillRect(0, 0, canvas.width, canvas.height);
	}

	// Wait for font to load if not already loaded (uses cached result)
	await waitForFontLoad(textConfig.fontFamily);

	// Determine which font to use
	const fontToUse = fontLoaded
		? `${textConfig.fontFamily}, ${textConfig.fallbackFont}`
		: textConfig.fallbackFont;

	// Set text properties
	context.font = `${fontSize}px ${fontToUse}`;
	context.fillStyle = textColor;
	context.textAlign = "center";
	context.textBaseline = "middle";

	// Handle multi-line text
	const lines = text.split("\n");
	const lineHeight = fontSize * 1.2;
	const startY = canvas.height / 2 - ((lines.length - 1) * lineHeight) / 2;

	lines.forEach((line, index) => {
		const y = startY + index * lineHeight;
		context.fillText(line, canvas.width / 2, y);
	});

	// Create texture
	const texture = new THREE.CanvasTexture(canvas);
	texture.flipY = false;
	return texture;
}
