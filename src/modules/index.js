import { textSettings } from "./text/text";
import { textConfig } from "./text/textConfig";
import { waitForFontLoad } from "./text/text";
import { createLockTextTexture } from "./text/text";
import { createTextTexture } from "./text/text";
import { textPlanes } from "./text/text";
import { cameraMovement } from "./camera/cameraMovement";
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
	handleUrlParameters,
	findNewStory,
} from "./animation/cameraAnimation";
import { removeAllStoryButtons } from "./animation/buttonAnimation";
import {
	getRandomLock,
	getRandomLockWithStory,
	getLockByIndex,
	getLockById,
} from "./locks/lockUtils";
import { handleZoom } from "./camera/cameraControls";
import userLocation from "./utils/userLocation";
import decodeHTML from "./utils/decodeHtml";
import { mode } from "./globals/globals";
import donationUrl from "./utils/donationUrl";

export {
	textSettings,
	textConfig,
	waitForFontLoad,
	createLockTextTexture,
	createTextTexture,
	textPlanes,
	cameraMovement,
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
	getLockById,
	handleUrlParameters,
	removeAllStoryButtons,
	findNewStory,
	handleZoom,
	userLocation,
	decodeHTML,
	mode,
	donationUrl,
};
