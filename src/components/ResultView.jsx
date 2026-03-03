import { useState } from 'react';
import BeforeAfterSlider from './BeforeAfterSlider';

const SPG_BOOKING_URL = 'https://www.spgdentalimplants.com/book';
const SPG_PHONE = '1-888-SPG-SMILE';
const SPG_PHONE_TEL = 'tel:+18887747645';

export default function ResultView({ originalImage, resultImage, onTryAgain, onStartOver }) {
  const [shareMessage, setShareMessage] = useState('');

  const handleShare = async () => {
    const shareData = {
      title: 'My New Smile Preview - SPG Dental Implants',
      text: 'Check out my AI-generated smile preview from SPG Dental Implants! See yours free at',
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(
          `${shareData.text} ${shareData.url}`
        );
        setShareMessage('Link copied to clipboard!');
        setTimeout(() => setShareMessage(''), 3000);
      }
    } catch (err) {
      // User cancelled share, no action needed
      if (err.name !== 'AbortError') {
        console.error('Share failed:', err);
      }
    }
  };

  return (
    <div className="px-6 py-8 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-spg-gray-dark mb-1">Your New Smile!</h2>
        <p className="text-gray-400">Drag the slider to compare</p>
      </div>

      {/* Before/After Slider */}
      <BeforeAfterSlider
        beforeImage={originalImage}
        afterImage={resultImage}
      />

      {/* CTAs */}
      <div className="mt-8 space-y-3">
        {/* Primary CTA */}
        <a
          href={SPG_BOOKING_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary block text-center"
        >
          Book Your Free Consultation
        </a>

        {/* Call CTA */}
        <a
          href={SPG_PHONE_TEL}
          className="btn-secondary block text-center flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          Call Now: {SPG_PHONE}
        </a>

        {/* Share */}
        <button onClick={handleShare} className="btn-outline flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share Your New Smile
        </button>

        {shareMessage && (
          <p className="text-center text-sm text-green-600 font-medium">{shareMessage}</p>
        )}
      </div>

      {/* Secondary actions */}
      <div className="mt-8 pt-6 border-t border-gray-100 flex gap-3">
        <button onClick={onTryAgain} className="flex-1 text-sm text-gray-400 hover:text-spg-blue transition-colors py-2">
          Try a different photo
        </button>
        <button onClick={onStartOver} className="flex-1 text-sm text-gray-400 hover:text-spg-blue transition-colors py-2">
          Start over
        </button>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-gray-300 text-center mt-6 leading-relaxed">
        This is an AI-generated preview for illustration purposes only. Actual results may vary.
        Consult with an SPG dental professional for a personalized treatment plan.
      </p>
    </div>
  );
}
