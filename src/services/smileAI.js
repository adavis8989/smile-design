import { detectMouth } from './faceDetection';
import { generateMouthMask, generateFallbackMask } from '../utils/maskGenerator';

/**
 * Generate an AI smile transformation.
 * 1. Detect face and mouth landmarks
 * 2. Generate mask for the mouth region
 * 3. Send to serverless function which proxies to fal.ai
 * 4. Return the generated image URL
 */
export async function generateSmile(selfieDataUrl) {
  // Step 1 & 2: Detect mouth and generate mask
  let maskDataUrl;
  try {
    const { mouthPoints, imageWidth, imageHeight, faceBox } = await detectMouth(selfieDataUrl);

    if (mouthPoints.length >= 10) {
      maskDataUrl = generateMouthMask(mouthPoints, imageWidth, imageHeight);
    } else {
      // Fallback to rectangular mask if not enough landmarks
      maskDataUrl = generateFallbackMask(faceBox, imageWidth, imageHeight);
    }
  } catch (err) {
    // If face detection fails completely, throw a user-friendly error
    throw new Error(err.message || 'Could not detect your face. Please try a different photo.');
  }

  // Step 3: Call serverless function
  const response = await fetch('/api/generate-smile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image: selfieDataUrl,
      mask: maskDataUrl,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to generate your new smile. Please try again.');
  }

  const data = await response.json();
  return data.imageUrl;
}
