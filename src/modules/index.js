import { textSettings } from "./text/text";
import { lockData } from "./locks/lockData";
import { textConfig } from "./text/textConfig";
import { waitForFontLoad } from "./text/text";
import { createLockTextTexture } from "./text/text";
import { createTextTexture } from "./text/text";
import { textPlanes } from "./text/text";
import { wallControls } from "./wall/wallControls";
import { camera } from "./camera/camera";
import { gui } from "./globals/globals";
import { canvas } from "./globals/globals";
import { scene } from "./globals/globals";
import { mixer } from "./globals/globals";
import { sizes } from "./globals/globals";
import { ambientLight } from "./lights/lights";
import { directionalLight } from "./lights/lights";
import { gltfLoader } from "./globals/globals";
import { wall } from "./wall/wall";
import { loadLockModels } from "./locks/lockGrid";
import { renderer } from "./globals/globals";
import { tick } from "./animation/animation";
import { createCanvasEvents } from "./canvasEvents/canvasEvents";
import {
	animateCameraToLock,
	animateCameraToPosition,
	createIntroAnimation,
	isCameraAnimating,
	stopCameraAnimation,
	getRandomLock,
	getRandomLockWithStory,
	getLockByIndex,
	removeAllStoryButtons,
	findNewStory,
	handleZoom,
} from "./animation/cameraAnimation";

export {
	textSettings,
	lockData,
	textConfig,
	waitForFontLoad,
	createLockTextTexture,
	createTextTexture,
	textPlanes,
	wallControls,
	camera,
	gui,
	canvas,
	scene,
	mixer,
	sizes,
	ambientLight,
	directionalLight,
	gltfLoader,
	wall,
	loadLockModels,
	renderer,
	tick,
	createCanvasEvents,
	animateCameraToLock,
	animateCameraToPosition,
	createIntroAnimation,
	isCameraAnimating,
	stopCameraAnimation,
	getRandomLock,
	getRandomLockWithStory,
	getLockByIndex,
	removeAllStoryButtons,
	findNewStory,
	handleZoom,
};
