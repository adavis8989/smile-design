import { useState, useEffect, useRef } from 'react';
import { generateSmile } from '../services/smileAI';
import { saveLead } from '../services/sheets';

const messages = [
  'Analyzing your smile...',
  'Mapping your facial features...',
  'Designing your new teeth...',
  'Perfecting the details...',
  'Almost there...',
];

export default function Processing({ selfieImage, contactData, onComplete, onError }) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [error, setError] = useState(null);
  const hasStarted = useRef(false);

  // Rotate messages
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Process the image
  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    async function process() {
      try {
        // Generate the smile in parallel with saving the lead
        const [generatedImage] = await Promise.all([
          generateSmile(selfieImage),
          saveLead(contactData).catch((err) => {
            // Don't block the flow if lead save fails
            console.error('Failed to save lead:', err);
          }),
        ]);

        // Update the lead with generated photo URL
        saveLead({ ...contactData, generatedPhotoUrl: generatedImage }).catch(() => {});

        onComplete(generatedImage);
      } catch (err) {
        console.error('Smile generation failed:', err);
        setError(err.message || 'Something went wrong. Please try again.');
      }
    }

    process();
  }, [selfieImage, contactData, onComplete]);

  if (error) {
    return (
      <div className="px-6 py-16 max-w-md mx-auto text-center">
        <div className="w-16 h-16 mx-auto bg-red-50 rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-spg-gray-dark mb-3">Oops!</h2>
        <p className="text-gray-400 mb-8">{error}</p>
        <button onClick={onError} className="btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="px-6 py-16 max-w-md mx-auto text-center">
      {/* Animated smile icon */}
      <div className="relative w-32 h-32 mx-auto mb-10">
        {/* Outer ring */}
        <div className="absolute inset-0 border-4 border-spg-blue/20 rounded-full" />
        {/* Spinning arc */}
        <div className="absolute inset-0 border-4 border-transparent border-t-spg-blue rounded-full animate-spin" />
        {/* Inner content */}
        <div className="absolute inset-4 bg-spg-blue/5 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-spg-blue animate-pulse-ring" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" />
            <circle cx="17" cy="19" r="2" fill="currentColor" />
            <circle cx="31" cy="19" r="2" fill="currentColor" />
            <path d="M15 28C18 33 30 33 33 28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M18 28V31M22 28V32M26 28V32M30 28V31" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* Rotating message */}
      <h2 className="text-xl font-bold text-spg-gray-dark mb-3 transition-opacity duration-500">
        {messages[messageIndex]}
      </h2>
      <p className="text-gray-400 text-sm">This usually takes 5-15 seconds</p>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 mt-8">
        {messages.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === messageIndex ? 'bg-spg-blue w-6' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
