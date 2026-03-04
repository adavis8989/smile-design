export default function LandingPage({ onStart }) {
  return (
    <div className="flex flex-col min-h-[calc(100dvh-52px)]">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
        {/* Smile Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-spg-blue/10 rounded-full flex items-center justify-center">
            <svg className="w-14 h-14 text-spg-blue" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="2.5" />
              <circle cx="20" cy="22" r="2.5" fill="currentColor" />
              <circle cx="36" cy="22" r="2.5" fill="currentColor" />
              <path d="M17 32C20 38 36 38 39 32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M21 32V35M25 32V36M29 32V36M33 32V35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-spg-gray-dark leading-tight mb-4">
          See Your New Smile
          <br />
          <span className="text-spg-blue">in 30 Seconds</span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg text-gray-500 max-w-md mb-10 leading-relaxed">
          Our AI designs a preview of your smile with dental implants — free and instant
        </p>

        {/* CTA */}
        <div className="w-full max-w-sm">
          <button onClick={onStart} className="btn-primary text-xl py-5 shadow-lg shadow-spg-blue/25">
            Get Started
          </button>
        </div>

        {/* Trust Elements */}
        <div className="mt-10 flex flex-col items-center gap-4">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <p className="text-sm text-gray-400">
            Join <span className="font-semibold text-gray-500">10,000+</span> people who&apos;ve previewed their new smile
          </p>
        </div>
      </div>

      {/* Features Strip */}
      <div className="bg-spg-gray px-6 py-6">
        <div className="max-w-md mx-auto grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl mb-1">📸</div>
            <p className="text-xs text-gray-500 font-medium">Take a Selfie</p>
          </div>
          <div>
            <div className="text-2xl mb-1">✨</div>
            <p className="text-xs text-gray-500 font-medium">AI Designs Your Smile</p>
          </div>
          <div>
            <div className="text-2xl mb-1">😁</div>
            <p className="text-xs text-gray-500 font-medium">See Your New Look</p>
          </div>
        </div>
      </div>
    </div>
  );
}
