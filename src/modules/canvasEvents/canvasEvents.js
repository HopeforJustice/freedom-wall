/**
 * ========================================
 * EVENT LISTENERS SETUP
 * ========================================
 */
import * as THREE from "three";
import { canvas, camera, scene, decodeHTML } from "../index.js";
import { setButtonHover } from "../animation/buttonAnimation.js";
import { handleZoom } from "../camera/cameraControls.js";
import { lockDataAPI } from "../locks/lockDataAPI.js";
import { mode } from "../index.js";

// Raycaster for 3D object interaction
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const isInEditMode = mode.isEditMode();
const isEmbedMode = mode.isEmbedMode();
const showIdMode = mode.isShowIdMode();

console.log("Embed mode:", isEmbedMode);

// Drag detection state
let dragState = {
	isDragging: false,
	dragStart: { x: 0, y: 0 },
	dragThreshold: 5, // px
};

// Touch state for pinch-to-zoom and button interactions
let touchState = {
	isFirstTouch: false,
	lastTouchDistance: 0,
	lastTouchTime: 0,
	touchStartPosition: { x: 0, y: 0 },
};

/**
 * Handle mouse move for hover detection
 */
function handleCanvasMouseMove(event) {
	// Drag detection
	if (dragState.dragStart.x !== null && dragState.dragStart.y !== null) {
		const dx = event.clientX - dragState.dragStart.x;
		const dy = event.clientY - dragState.dragStart.y;
		if (
			Math.abs(dx) > dragState.dragThreshold ||
			Math.abs(dy) > dragState.dragThreshold
		) {
			dragState.isDragging = true;
		}
	}

	// Calculate mouse position in normalized device coordinates
	const rect = canvas.getBoundingClientRect();
	mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
	mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

	// Update the raycaster
	raycaster.setFromCamera(mouse, camera);

	// Find intersected objects
	const intersects = raycaster.intersectObjects(scene.children, true);

	let hoveredButton = null;
	for (let intersect of intersects) {
		const object = intersect.object;

		// Check if this is a story button
		if (object.userData && object.userData.isStoryButton) {
			hoveredButton = object;
			canvas.style.cursor = "pointer";
			break;
		}
	}

	if (!hoveredButton) {
		canvas.style.cursor = "default";
	}

	// Update button hover state - pass the specific button or null
	setButtonHover(hoveredButton);
}

/**
 * Handle click events on 3D objects
 */
function handleCanvasClick(event) {
	// Only handle click if not dragging
	if (dragState.isDragging) {
		return;
	}

	// Calculate mouse position in normalized device coordinates
	const rect = canvas.getBoundingClientRect();
	mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
	mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

	// Update the raycaster
	raycaster.setFromCamera(mouse, camera);

	// Find intersected objects
	const intersects = raycaster.intersectObjects(scene.children, true);

	for (let intersect of intersects) {
		const object = intersect.object;

		// Check if we are in edit mode
		if (isInEditMode) {
			// find lock id and open wordpress in new tab
			if (object.userData && object.userData.lockInfo) {
				const lockId = object.userData.lockInfo.id;
				const wordpressUrl = `https://freedomwallcms.wpenginepowered.com/wp-admin/post.php?post=${lockId}&action=edit`;
				window.open(wordpressUrl, "_blank");
				break;
			}
		} else if (showIdMode) {
			// find lock id and open wordpress in new tab
			if (object.userData && object.userData.lockInfo) {
				const lockId = object.userData.lockInfo.id;
				alert(`Lock ID: ${lockId}`);
			}
		}
		// Check if this is a story button
		if (object.userData && object.userData.isStoryButton) {
			// Handle story button click
			showLockStory(object.userData.lockInfo);
			break;
		}
	}
}

/**
 * Handle touch events for button interaction and pinch zoom
 */
function handleTouchStart(event) {
	const touches = event.touches;

	if (touches.length === 1) {
		// Single touch - potential button tap
		const touch = touches[0];
		touchState.isFirstTouch = true;
		touchState.lastTouchTime = Date.now();
		touchState.touchStartPosition = {
			x: touch.clientX,
			y: touch.clientY,
		};
	} else if (touches.length === 2) {
		// Two touches - pinch zoom
		event.preventDefault();
		const touch1 = touches[0];
		const touch2 = touches[1];
		const distance = Math.sqrt(
			Math.pow(touch2.clientX - touch1.clientX, 2) +
				Math.pow(touch2.clientY - touch1.clientY, 2)
		);
		touchState.lastTouchDistance = distance;
		touchState.isFirstTouch = false;
	}
}

function handleTouchMove(event) {
	const touches = event.touches;

	if (touches.length === 2) {
		// Pinch zoom
		event.preventDefault();
		const touch1 = touches[0];
		const touch2 = touches[1];
		const distance = Math.sqrt(
			Math.pow(touch2.clientX - touch1.clientX, 2) +
				Math.pow(touch2.clientY - touch1.clientY, 2)
		);

		if (touchState.lastTouchDistance > 0) {
			const deltaDistance = distance - touchState.lastTouchDistance;
			// Create a synthetic wheel event for zoom
			const syntheticEvent = {
				deltaY: -deltaDistance * 2, // Scale and invert for zoom
				preventDefault: () => {},
			};
			handleZoom(syntheticEvent);
		}

		touchState.lastTouchDistance = distance;
		touchState.isFirstTouch = false;
	} else if (touches.length === 1 && touchState.isFirstTouch) {
		// Check if the touch moved too much (not a tap)
		const touch = touches[0];
		const moveDistance = Math.sqrt(
			Math.pow(touch.clientX - touchState.touchStartPosition.x, 2) +
				Math.pow(touch.clientY - touchState.touchStartPosition.y, 2)
		);

		// If moved more than 10px, it's not a tap
		if (moveDistance > 10) {
			touchState.isFirstTouch = false;
		}
	}
}

function handleTouchEnd(event) {
	const touches = event.touches;

	// If this was a single touch that didn't move much and was quick, treat as tap
	if (touches.length === 0 && touchState.isFirstTouch) {
		const touchDuration = Date.now() - touchState.lastTouchTime;

		// If touch was less than 300ms, treat as button tap
		if (touchDuration < 300) {
			handleTouchTap(touchState.touchStartPosition);
		}
	}

	// Reset touch state
	touchState.isFirstTouch = false;
	touchState.lastTouchDistance = 0;
}

function handleTouchTap(position) {
	// Convert touch position to normalized device coordinates
	const rect = canvas.getBoundingClientRect();
	mouse.x = ((position.x - rect.left) / rect.width) * 2 - 1;
	mouse.y = -((position.y - rect.top) / rect.height) * 2 + 1;

	// Update the raycaster
	raycaster.setFromCamera(mouse, camera);

	// Find intersected objects
	const intersects = raycaster.intersectObjects(scene.children, true);

	for (let intersect of intersects) {
		const object = intersect.object;

		// Check if this is a story button
		if (object.userData && object.userData.isStoryButton) {
			// Handle story button tap
			showLockStory(object.userData.lockInfo);
			break;
		}
	}
}

/**
 * Show lock story by fetching it from the API
 * @param {Object} lockInfo - Lock information object
 */
async function showLockStory(lockInfo) {
	// Dispatch a custom event to show the story modal
	window.dispatchEvent(new CustomEvent("showLockStory", { detail: lockInfo }));

	//switched to event-based handling in Modal.jsx
	// try {
	// 	const storyModal = document.getElementById("storyModal");
	// 	const storyText = document.getElementById("storyText");
	// 	const storyTitle = document.getElementById("storyTitle");
	// 	const closeStoryBtn = document.getElementById("closeStory");
	// 	const storyDialog = document.getElementById("storyDialog");
	// 	console.log("Fetching story for lock:", lockInfo);

	// 	storyModal.classList.remove("hidden", "opacity-0");

	// 	closeStoryBtn.onclick = () => {
	// 		storyModal.classList.add("opacity-0", "hidden");
	// 	};

	// 	storyModal.onclick = (e) => {
	// 		if (e.target === storyDialog) {
	// 			storyModal.classList.add("opacity-0", "hidden");
	// 		}
	// 	};

	// 	// Fetch story from API
	// 	const result = await lockDataAPI.getLock(lockInfo.id);

	// 	console.log("API response data:", result);

	// 	if (result) {
	// 		//fill the modal with story data
	// 		const decodedHtmlContent = decodeHTML(result.content);
	// 		storyText.innerHTML = decodedHtmlContent;
	// 	} else {
	// 		alert(
	// 			`Story for ${lockInfo.name}\n\nNo story content available for this lock.`
	// 		);
	// 	}
	// } catch (error) {
	// 	console.error("Error fetching story:", error);
	// 	alert(
	// 		`Story for ${lockInfo.name}\n\nError loading story: ${error.message}\n\nPlease try again later.`
	// 	);
	// }
}

export const createCanvasEvents = (cameraMovement) => {
	// Camera control event listeners
	canvas.addEventListener("mousedown", (event) => {
		dragState.isDragging = false;
		dragState.dragStart = { x: event.clientX, y: event.clientY };
		cameraMovement.onMouseDown(event);
	});
	canvas.addEventListener("mousemove", (event) => {
		// Handle wall controls
		cameraMovement.onMouseMove(event);
		// Handle hover detection
		handleCanvasMouseMove(event);
	});
	canvas.addEventListener("mouseup", (event) => {
		cameraMovement.onMouseUp(event);
		dragState.dragStart = { x: null, y: null };
		setTimeout(() => {
			dragState.isDragging = false;
		}, 0); // reset after click
	});
	canvas.addEventListener("mouseleave", () => {
		cameraMovement.onMouseUp();
		dragState.dragStart = { x: null, y: null };
		dragState.isDragging = false;
	});

	// Click event listener for 3D object interaction
	canvas.addEventListener("click", handleCanvasClick);

	// Wheel event listener for zoom functionality
	if (!isEmbedMode) {
		canvas.addEventListener("wheel", handleZoom);
	}

	// Touch event listeners for mobile/tablet support
	canvas.addEventListener("touchstart", (event) => {
		// Handle button interaction and pinch zoom
		handleTouchStart(event);
		// Only pass single touches to camera movement
		if (event.touches.length === 1) {
			cameraMovement.onTouchStart(event);
		}
	});
	canvas.addEventListener("touchmove", (event) => {
		// Handle pinch zoom and tap detection
		handleTouchMove(event);
		// Only pass single touches to camera movement
		if (event.touches.length === 1 && touchState.isFirstTouch === false) {
			cameraMovement.onTouchMove(event);
		}
	});
	canvas.addEventListener("touchend", (event) => {
		// Handle tap detection
		handleTouchEnd(event);
		// Always pass to camera movement
		cameraMovement.onTouchEnd(event);
	});
	canvas.addEventListener("touchcancel", (event) => {
		// Reset touch state
		touchState.isFirstTouch = false;
		touchState.lastTouchDistance = 0;
		// Pass to camera movement
		cameraMovement.onTouchEnd(event);
	});

	// Prevent context menu on right click
	canvas.addEventListener("contextmenu", (event) => event.preventDefault());
};
