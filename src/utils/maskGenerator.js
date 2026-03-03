/**
 * Generate a binary mask image from mouth landmark points.
 * White = area to regenerate (mouth/teeth), Black = area to keep.
 *
 * @param {Array<{x: number, y: number}>} mouthPoints - Mouth landmark coordinates
 * @param {number} imageWidth - Original image width
 * @param {number} imageHeight - Original image height
 * @param {number} padding - Expansion factor (0.15 = 15% padding around mouth)
 * @returns {string} Data URL of the mask image
 */
export function generateMouthMask(mouthPoints, imageWidth, imageHeight, padding = 0.15) {
  const canvas = document.createElement('canvas');
  canvas.width = imageWidth;
  canvas.height = imageHeight;
  const ctx = canvas.getContext('2d');

  // Fill entire canvas black (keep everything)
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, imageWidth, imageHeight);

  // Calculate centroid of mouth points
  const centroid = {
    x: mouthPoints.reduce((sum, p) => sum + p.x, 0) / mouthPoints.length,
    y: mouthPoints.reduce((sum, p) => sum + p.y, 0) / mouthPoints.length,
  };

  // Expand points outward from centroid for padding
  const expandedPoints = mouthPoints.map((p) => ({
    x: centroid.x + (p.x - centroid.x) * (1 + padding),
    y: centroid.y + (p.y - centroid.y) * (1 + padding),
  }));

  // Draw white filled polygon over mouth region
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.moveTo(expandedPoints[0].x, expandedPoints[0].y);
  for (let i = 1; i < expandedPoints.length; i++) {
    ctx.lineTo(expandedPoints[i].x, expandedPoints[i].y);
  }
  ctx.closePath();
  ctx.fill();

  // Apply blur for smoother blending at edges
  // Use multiple passes of a soft edge to simulate Gaussian blur
  ctx.filter = 'blur(8px)';
  ctx.drawImage(canvas, 0, 0);
  ctx.filter = 'none';

  // Re-threshold after blur to keep the mask clean but with soft edges
  // We draw the mask again on top with slight transparency
  const softCanvas = document.createElement('canvas');
  softCanvas.width = imageWidth;
  softCanvas.height = imageHeight;
  const softCtx = softCanvas.getContext('2d');
  softCtx.fillStyle = 'black';
  softCtx.fillRect(0, 0, imageWidth, imageHeight);

  // Draw the blurred version
  softCtx.filter = 'blur(6px)';
  softCtx.fillStyle = 'white';
  softCtx.beginPath();
  softCtx.moveTo(expandedPoints[0].x, expandedPoints[0].y);
  for (let i = 1; i < expandedPoints.length; i++) {
    softCtx.lineTo(expandedPoints[i].x, expandedPoints[i].y);
  }
  softCtx.closePath();
  softCtx.fill();
  softCtx.filter = 'none';

  return softCanvas.toDataURL('image/png');
}

/**
 * Generate a simple rectangular mask as a fallback when landmark detection
 * provides limited data. Centers the mask on the provided face bounding box.
 */
export function generateFallbackMask(faceBox, imageWidth, imageHeight) {
  const canvas = document.createElement('canvas');
  canvas.width = imageWidth;
  canvas.height = imageHeight;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, imageWidth, imageHeight);

  // Estimate mouth region: lower third of face, centered horizontally
  const mouthX = faceBox.x + faceBox.width * 0.2;
  const mouthY = faceBox.y + faceBox.height * 0.6;
  const mouthW = faceBox.width * 0.6;
  const mouthH = faceBox.height * 0.25;

  ctx.filter = 'blur(6px)';
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.ellipse(
    mouthX + mouthW / 2,
    mouthY + mouthH / 2,
    mouthW / 2,
    mouthH / 2,
    0, 0, Math.PI * 2
  );
  ctx.fill();
  ctx.filter = 'none';

  return canvas.toDataURL('image/png');
}
