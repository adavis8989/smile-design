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

  const { image, mask } = req.body;

  if (!image || !mask) {
    return res.status(400).json({ error: 'Image and mask are required' });
  }

  try {
    // Upload images to fal storage for faster processing
    const [imageUrl, maskUrl] = await Promise.all([
      uploadToFal(image),
      uploadToFal(mask),
    ]);

    // Call fal.ai inpainting model
    const result = await fal.subscribe('fal-ai/flux/dev/inpainting', {
      input: {
        image_url: imageUrl,
        mask_url: maskUrl,
        prompt:
          'Perfect straight white natural teeth, beautiful healthy smile, dental veneers, photorealistic, same person, matching skin tone, matching lighting, natural gums, high detail',
        negative_prompt:
          'braces, metal, wire, discolored teeth, yellow teeth, missing teeth, distorted face, blurry, cartoon, anime, painting, crooked teeth, unnatural, different person',
        num_inference_steps: 28,
        guidance_scale: 7.5,
        strength: 0.65,
        seed: -1,
      },
      logs: false,
    });

    // Extract the generated image URL
    const generatedImageUrl =
      result.data?.images?.[0]?.url ||
      result.images?.[0]?.url ||
      result.data?.image?.url ||
      result.image?.url;

    if (!generatedImageUrl) {
      console.error('Unexpected fal.ai response:', JSON.stringify(result).slice(0, 500));
      return res.status(500).json({ error: 'Failed to generate image. Unexpected response format.' });
    }

    return res.status(200).json({ imageUrl: generatedImageUrl });
  } catch (err) {
    console.error('fal.ai error:', err);

    // Provide user-friendly error messages
    if (err.status === 422) {
      return res.status(422).json({ error: 'The image could not be processed. Please try a different photo.' });
    }
    if (err.status === 429) {
      return res.status(429).json({ error: 'Too many requests. Please wait a moment and try again.' });
    }

    return res.status(500).json({
      error: 'Something went wrong generating your smile. Please try again.',
    });
  }
}

/**
 * Upload a base64 data URL to fal.ai storage.
 * Returns a URL that can be used in fal.ai API calls.
 */
async function uploadToFal(dataUrl) {
  // If it's already a URL (not base64), return as-is
  if (dataUrl.startsWith('http')) {
    return dataUrl;
  }

  // Convert data URL to blob
  const response = await fetch(dataUrl);
  const blob = await response.blob();

  // Upload to fal storage
  const url = await fal.storage.upload(blob);
  return url;
}
