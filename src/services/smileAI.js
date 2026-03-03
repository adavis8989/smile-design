import { detectMouth } from './faceDetection';
import { generateMouthMask, generateFallbackMask } from '../utils/maskGenerator';

const MAX_DIMENSION = 1024;

/**
 * Generate an AI smile transformation.
 * 1. Resize image if too large (to stay within API payload limits)
 * 2. Detect face and mouth landmarks
 * 3. Generate mask for the mouth region
 * 4. Send to serverless function which proxies to fal.ai
 * 5. Return the generated image URL
 */
export async function generateSmile(selfieDataUrl) {
  // Step 0: Resize if needed to keep payload under Vercel's 4.5MB limit
  const resizedDataUrl = await resizeImage(selfieDataUrl, MAX_DIMENSION);

  // Step 1 & 2: Detect mouth and generate mask
  let maskDataUrl;
  try {
    const { mouthPoints, imageWidth, imageHeight, faceBox } = await detectMouth(resizedDataUrl);

    if (mouthPoints.length >= 10) {
      maskDataUrl = generateMouthMask(mouthPoints, imageWidth, imageHeight);
    } else {
      maskDataUrl = generateFallbackMask(faceBox, imageWidth, imageHeight);
    }
  } catch (err) {
    throw new Error(err.message || 'Could not detect your face. Please try a different photo.');
  }

  // Step 3: Call serverless function
  const response = await fetch('/api/generate-smile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image: resizedDataUrl,
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

/**
 * Resize an image data URL so the longest side is at most maxDimension.
 * Returns a JPEG data URL to minimize payload size.
 */
function resizeImage(dataUrl, maxDimension) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;

      // Only resize if larger than max
      if (width <= maxDimension && height <= maxDimension) {
        // Still re-encode as JPEG to compress
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
        return;
      }

      const scale = maxDimension / Math.max(width, height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => reject(new Error('Failed to load image for resizing'));
    img.src = dataUrl;
  });
}
