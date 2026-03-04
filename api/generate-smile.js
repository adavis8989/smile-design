import { fal } from '@fal-ai/client';

export const config = {
  maxDuration: 60,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { image } = req.body;

  if (!image) {
    return res.status(400).json({ error: 'Image is required' });
  }

  if (!process.env.FAL_KEY) {
    console.error('FAL_KEY environment variable is not set');
    return res.status(500).json({ error: 'AI service is not configured. FAL_KEY is missing.' });
  }

  fal.config({
    credentials: process.env.FAL_KEY,
  });

  try {
    // Step 1: Upload image to fal storage using their 2-step REST flow
    // (initiate → get presigned URL → PUT file)
    console.log('Uploading image to fal storage...');
    const imageUrl = await uploadToFalStorage(image);
    console.log('Upload complete:', imageUrl?.slice(0, 100));

    // Step 2: Call fal.ai Nano Banana (Google Gemini image model) for smile editing
    console.log('Calling fal.ai nano-banana edit...');
    const result = await fal.subscribe('fal-ai/nano-banana/edit', {
      input: {
        image_urls: [imageUrl],
        prompt:
          'Give this person a beautiful, bright white, straight Hollywood smile with perfect teeth',
        num_images: 1,
        output_format: 'jpeg',
        safety_tolerance: 4,
      },
    });

    console.log('fal.ai response keys:', Object.keys(result || {}));
    if (result?.data) {
      console.log('result.data keys:', Object.keys(result.data));
    }

    // Step 3: Extract generated image URL
    const generatedImageUrl =
      result?.data?.images?.[0]?.url ||
      result?.images?.[0]?.url;

    if (!generatedImageUrl) {
      console.error('Unexpected response:', JSON.stringify(result).slice(0, 2000));
      return res.status(500).json({
        error: 'AI returned unexpected data. Please try again.',
        debug: JSON.stringify(result).slice(0, 500),
      });
    }

    return res.status(200).json({ imageUrl: generatedImageUrl });
  } catch (err) {
    console.error('generate-smile error:', err);

    const errMsg = err?.message || String(err);
    const errStatus = err?.status;
    const errBody = err?.body;

    const debugInfo = `${errMsg} [status=${errStatus}] [body=${JSON.stringify(errBody).slice(0, 300)}]`;
    console.error('Debug:', debugInfo);

    if (errStatus === 401 || errMsg.includes('Unauthorized') || errMsg.includes('credentials')) {
      return res.status(500).json({ error: 'AI service auth failed. Check FAL_KEY.', debug: debugInfo });
    }
    if (errStatus === 422) {
      return res.status(422).json({ error: 'The image could not be processed. Try a different photo.', debug: debugInfo });
    }
    if (errStatus === 429) {
      return res.status(429).json({ error: 'Too many requests. Please wait and try again.', debug: debugInfo });
    }

    // Return the REAL error so we can see what's wrong
    return res.status(500).json({ error: errMsg, debug: debugInfo });
  }
}

/**
 * Upload a base64 data URL to fal.ai storage.
 * Uses fal's 2-step REST flow: initiate upload → PUT file to presigned URL.
 * This matches what fal.storage.upload() does internally.
 */
async function uploadToFalStorage(dataUrl) {
  if (dataUrl.startsWith('http')) {
    return dataUrl;
  }

  const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!matches) {
    throw new Error('Invalid data URL format');
  }

  const mimeType = matches[1];
  const base64Data = matches[2];
  const buffer = Buffer.from(base64Data, 'base64');
  const ext = mimeType.includes('png') ? 'png' : 'jpg';
  const fileName = `${Date.now()}.${ext}`;

  // Step 1: Initiate upload to get a presigned URL
  const initiateRes = await fetch(
    'https://rest.fal.ai/storage/upload/initiate?storage_type=fal-cdn-v3',
    {
      method: 'POST',
      headers: {
        'Authorization': `Key ${process.env.FAL_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content_type: mimeType,
        file_name: fileName,
      }),
    }
  );

  if (!initiateRes.ok) {
    const errText = await initiateRes.text().catch(() => 'unknown');
    throw new Error(`Storage initiate failed (${initiateRes.status}): ${errText}`);
  }

  const { upload_url, file_url } = await initiateRes.json();
  if (!upload_url || !file_url) {
    throw new Error('Storage initiate returned no upload_url or file_url');
  }

  // Step 2: PUT the file bytes to the presigned URL
  const putRes = await fetch(upload_url, {
    method: 'PUT',
    headers: {
      'Content-Type': mimeType,
    },
    body: buffer,
  });

  if (!putRes.ok) {
    const errText = await putRes.text().catch(() => 'unknown');
    throw new Error(`Storage PUT failed (${putRes.status}): ${errText}`);
  }

  return file_url;
}
