/**
 * Generate a binary mask image from mouth landmark points.
 * White = area to regenerate (mouth/teeth), Black = area to keep.
 * Uses an elliptical shape derived from landmarks for smooth, natural edges.
 *
 * @param {Array<{x: number, y: number}>} mouthPoints - Mouth landmark coordinates
 * @param {number} imageWidth - Original image width
 * @param {number} imageHeight - Original image height
 * @param {number} padding - Expansion factor (0.3 = 30% padding around mouth)
 * @returns {string} Data URL of the mask image
 */
export function generateMouthMask(mouthPoints, imageWidth, imageHeight, padding = 0.3) {
  const canvas = document.createElement('canvas');
  canvas.width = imageWidth;
  canvas.height = imageHeight;
  const ctx = canvas.getContext('2d');

  // Fill entire canvas black (keep everything)
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, imageWidth, imageHeight);

  // Calculate bounding box and centroid of mouth points
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  let sumX = 0, sumY = 0;
  for (const p of mouthPoints) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
    sumX += p.x;
    sumY += p.y;
  }

  const cx = sumX / mouthPoints.length;
  const cy = sumY / mouthPoints.length;

  // Ellipse radii with padding for generous coverage
  const rx = ((maxX - minX) / 2) * (1 + padding);
  const ry = ((maxY - minY) / 2) * (1 + padding);

  // Scale blur relative to mask size for consistent feathering across image sizes
  const blurRadius = Math.max(Math.round(Math.min(rx, ry) * 0.35), 4);

  // Draw the mask as a solid white ellipse with feathered edges.
  // We draw at full opacity first, then apply a multi-pass blur to create
  // a smooth gradient at the edges that blends naturally with the original image.
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();

  // Apply blur for feathered edges — draw the blurred result back onto itself
  // two passes for a smoother falloff
  ctx.filter = `blur(${blurRadius}px)`;
  ctx.drawImage(canvas, 0, 0);
  ctx.drawImage(canvas, 0, 0);
  ctx.filter = 'none';

  // Boost the center back to full white so the core mask area is solid.
  // Use a smaller ellipse with no blur to reinforce the center.
  const coreRx = rx * 0.7;
  const coreRy = ry * 0.7;
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.ellipse(cx, cy, coreRx, coreRy, 0, 0, Math.PI * 2);
  ctx.fill();

  // One more light blur to blend the core reinforcement
  ctx.filter = `blur(${Math.round(blurRadius * 0.5)}px)`;
  ctx.drawImage(canvas, 0, 0);
  ctx.filter = 'none';

  return canvas.toDataURL('image/png');
}

/**
 * Generate an elliptical mask as a fallback when landmark detection
 * provides limited data. Centers the mask on the lower portion of the face box.
 */
export function generateFallbackMask(faceBox, imageWidth, imageHeight) {
  const canvas = document.createElement('canvas');
  canvas.width = imageWidth;
  canvas.height = imageHeight;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, imageWidth, imageHeight);

  // Estimate mouth region: lower third of face, centered horizontally
  const cx = faceBox.x + faceBox.width * 0.5;
  const cy = faceBox.y + faceBox.height * 0.72;
  const rx = faceBox.width * 0.35;
  const ry = faceBox.height * 0.15;
  const blurRadius = Math.max(Math.round(Math.min(rx, ry) * 0.35), 4);

  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.filter = `blur(${blurRadius}px)`;
  ctx.drawImage(canvas, 0, 0);
  ctx.drawImage(canvas, 0, 0);
  ctx.filter = 'none';

  // Reinforce center
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx * 0.7, ry * 0.7, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.filter = `blur(${Math.round(blurRadius * 0.5)}px)`;
  ctx.drawImage(canvas, 0, 0);
  ctx.filter = 'none';

  return canvas.toDataURL('image/png');
}
