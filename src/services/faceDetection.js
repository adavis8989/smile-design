import * as faceapi from 'face-api.js';

let modelsLoaded = false;

/**
 * Load face-api.js models from /models directory.
 * Models required: tinyFaceDetector and faceLandmark68TinyNet
 */
export async function loadModels() {
  if (modelsLoaded) return;

  const MODEL_URL = '/models';
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
  ]);
  modelsLoaded = true;
}

/**
 * Detect face and extract mouth landmarks from an image element or data URL.
 * Tries multiple detector configurations to maximize detection success rate.
 */
export async function detectMouth(imageSource) {
  await loadModels();

  let imageElement = imageSource;
  if (typeof imageSource === 'string') {
    imageElement = await createImageElement(imageSource);
  }

  // Try multiple configurations — different input sizes and thresholds
  // work better for different photo sizes, angles, and lighting conditions
  const configs = [
    { inputSize: 416, scoreThreshold: 0.3 },
    { inputSize: 512, scoreThreshold: 0.3 },
    { inputSize: 320, scoreThreshold: 0.25 },
    { inputSize: 608, scoreThreshold: 0.2 },
  ];

  let detection = null;
  for (const cfg of configs) {
    detection = await faceapi
      .detectSingleFace(imageElement, new faceapi.TinyFaceDetectorOptions(cfg))
      .withFaceLandmarks(true);
    if (detection) break;
  }

  if (!detection) {
    throw new Error(
      "We couldn't detect your face clearly. Please try again with better lighting and face the camera directly."
    );
  }

  const mouth = detection.landmarks.getMouth();
  if (!mouth || mouth.length === 0) {
    throw new Error(
      'Please smile with your teeth showing so we can design your new smile.'
    );
  }

  return {
    mouthPoints: mouth.map((p) => ({ x: p.x, y: p.y })),
    imageWidth: imageElement.width || imageElement.naturalWidth,
    imageHeight: imageElement.height || imageElement.naturalHeight,
    faceBox: detection.detection.box,
  };
}

function createImageElement(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}
