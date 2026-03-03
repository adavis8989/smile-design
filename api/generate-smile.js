import { fal } from '@fal-ai/client';

// Configure fal.ai with API key from environment
fal.config({
  credentials: process.env.FAL_KEY,
});

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Increase body size awareness — Vercel allows up to 4.5MB by default
  const { image, mask } = req.body;

  if (!image || !mask) {
    return res.status(400).json({ error: 'Image and mask are required' });
  }

  try {
    // Upload base64 images to fal storage
    const [imageUrl, maskUrl] = await Promise.all([
      uploadBase64ToFal(image),
      uploadBase64ToFal(mask),
    ]);

    // Call fal.ai FLUX inpainting model
    const result = await fal.subscribe('fal-ai/flux-lora/inpainting', {
      input: {
        image_url: imageUrl,
        mask_url: maskUrl,
        prompt:
          'Perfect straight white natural teeth, beautiful healthy smile, dental veneers, photorealistic, same person, matching skin tone, matching lighting, natural gums, high detail',
        num_inference_steps: 28,
        guidance_scale: 3.5,
        strength: 0.65,
        output_format: 'jpeg',
      },
    });

    // Extract the generated image URL from the response
    const generatedImageUrl =
      result.data?.images?.[0]?.url ||
      result.images?.[0]?.url;

    if (!generatedImageUrl) {
      console.error('Unexpected fal.ai response structure:', JSON.stringify(result).slice(0, 1000));
      return res.status(500).json({ error: 'Failed to generate image. Unexpected response format.' });
    }

    return res.status(200).json({ imageUrl: generatedImageUrl });
  } catch (err) {
    console.error('fal.ai error:', err?.message || err);
    console.error('fal.ai error body:', JSON.stringify(err?.body || err).slice(0, 500));

    if (err.status === 401) {
      console.error('FAL_KEY is invalid or not set. Current key prefix:', process.env.FAL_KEY?.slice(0, 8) || 'NOT SET');
      return res.status(500).json({ error: 'AI service authentication failed. Please contact support.' });
    }
    if (err.status === 422) {
      return res.status(422).json({ error: 'The image could not be processed. Please try a different photo.' });
    }
    if (err.status === 429) {
      return res.status(429).json({ error: 'Too many requests. Please wait a moment and try again.' });
    }

    return res.status(500).json({
      error: 'Something went wrong generating your smile. Please try again.',
      detail: process.env.NODE_ENV === 'development' ? err?.message : undefined,
    });
  }
}

/**
 * Convert a base64 data URL to a Blob and upload it to fal.ai storage.
 * Works in Node.js serverless environment (no browser fetch of data URLs).
 */
async function uploadBase64ToFal(dataUrl) {
  // If it's already a URL, return as-is
  if (dataUrl.startsWith('http')) {
    return dataUrl;
  }

  // Parse the data URL: "data:image/png;base64,<data>"
  const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!matches) {
    throw new Error('Invalid data URL format');
  }

  const mimeType = matches[1];
  const base64Data = matches[2];
  const buffer = Buffer.from(base64Data, 'base64');

  // Create a Blob from the buffer
  const blob = new Blob([buffer], { type: mimeType });

  // Upload to fal storage
  const url = await fal.storage.upload(blob);
  return url;
}
