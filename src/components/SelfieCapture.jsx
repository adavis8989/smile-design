import { useState, useRef, useCallback, useEffect } from 'react';

export default function SelfieCapture({ onCapture, onBack }) {
  const [mode, setMode] = useState(null); // null | 'camera' | 'upload'
  const [preview, setPreview] = useState(null);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Clean up camera on unmount or mode change
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [cameraStream]);

  const startCamera = useCallback(async () => {
    setMode('camera');
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError('Could not access your camera. Please check permissions or try uploading a photo instead.');
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    // Mirror the image (front camera is mirrored in preview)
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setPreview(dataUrl);
    // Stop camera
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
      setCameraStream(null);
    }
  }, [cameraStream]);

  const handleFileUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      // Resize if needed
      const img = new Image();
      img.onload = () => {
        const maxDim = 1280;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setPreview(dataUrl);
        setMode('upload');
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleRetake = useCallback(() => {
    setPreview(null);
    setMode(null);
    setCameraError(null);
  }, []);

  const handleUsePhoto = useCallback(() => {
    if (preview) {
      onCapture(preview);
    }
  }, [preview, onCapture]);

  // Preview mode
  if (preview) {
    return (
      <div className="px-6 py-8 max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-spg-gray-dark mb-2 text-center">Looking good!</h2>
        <p className="text-gray-400 mb-6 text-center">Make sure your teeth are visible and the photo is clear</p>

        <div className="relative rounded-2xl overflow-hidden shadow-lg mb-6">
          <img src={preview} alt="Your selfie" className="w-full" />
        </div>

        <div className="space-y-3">
          <button onClick={handleUsePhoto} className="btn-primary">
            Use This Photo
          </button>
          <button onClick={handleRetake} className="btn-outline">
            Retake
          </button>
        </div>
      </div>
    );
  }

  // Camera mode
  if (mode === 'camera' && !cameraError) {
    return (
      <div className="px-6 py-8 max-w-md mx-auto">
        <button onClick={handleRetake} className="flex items-center gap-1 text-gray-400 text-sm mb-6 hover:text-gray-600 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="relative rounded-2xl overflow-hidden bg-black mb-4">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full"
            style={{ transform: 'scaleX(-1)' }}
          />
          {/* Guide overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-64 border-2 border-white/40 rounded-full" />
          </div>
        </div>

        {/* Tips */}
        <div className="bg-spg-gray rounded-xl p-4 mb-6">
          <div className="space-y-2 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <span className="text-spg-blue">&#10003;</span> Smile with your teeth showing
            </div>
            <div className="flex items-center gap-2">
              <span className="text-spg-blue">&#10003;</span> Face the camera straight on
            </div>
            <div className="flex items-center gap-2">
              <span className="text-spg-blue">&#10003;</span> Make sure you have good lighting
            </div>
          </div>
        </div>

        <button onClick={capturePhoto} className="btn-primary flex items-center justify-center gap-2">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Take Photo
        </button>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  // Selection mode (or camera error fallback)
  return (
    <div className="px-6 py-8 max-w-md mx-auto">
      <button onClick={onBack} className="flex items-center gap-1 text-gray-400 text-sm mb-6 hover:text-gray-600 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <h2 className="text-2xl font-bold text-spg-gray-dark mb-2">Take your selfie</h2>
      <p className="text-gray-400 mb-8">We&apos;ll use your photo to design your new smile</p>

      {cameraError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-600">
          {cameraError}
        </div>
      )}

      {/* Photo tips */}
      <div className="bg-spg-gray rounded-xl p-5 mb-8">
        <h3 className="font-semibold text-sm text-spg-gray-dark mb-3">For best results:</h3>
        <div className="space-y-2.5 text-sm text-gray-500">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-spg-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-base">😁</span>
            </div>
            Smile with your teeth showing
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-spg-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-base">👤</span>
            </div>
            Face the camera straight on
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-spg-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-base">💡</span>
            </div>
            Make sure you have good lighting
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="space-y-3">
        <button onClick={startCamera} className="btn-primary flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Take a Photo
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="btn-outline flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Upload a Photo
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="user"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    </div>
  );
}
