import { useState, useCallback } from 'react';
import LandingPage from './components/LandingPage';
import ContactForm from './components/ContactForm';
import SelfieCapture from './components/SelfieCapture';
import Processing from './components/Processing';
import ResultView from './components/ResultView';

const STEPS = {
  LANDING: 'landing',
  CONTACT: 'contact',
  SELFIE: 'selfie',
  PROCESSING: 'processing',
  RESULT: 'result',
};

export default function App() {
  const [step, setStep] = useState(STEPS.LANDING);
  const [contactData, setContactData] = useState(null);
  const [selfieImage, setSelfieImage] = useState(null);
  const [resultImage, setResultImage] = useState(null);

  const handleStart = useCallback(() => {
    setStep(STEPS.CONTACT);
  }, []);

  const handleContactSubmit = useCallback((data) => {
    setContactData(data);
    setStep(STEPS.SELFIE);
  }, []);

  const handleSelfieCapture = useCallback((imageDataUrl) => {
    setSelfieImage(imageDataUrl);
    setStep(STEPS.PROCESSING);
  }, []);

  const handleProcessingComplete = useCallback((generatedImageUrl) => {
    setResultImage(generatedImageUrl);
    setStep(STEPS.RESULT);
  }, []);

  const handleProcessingError = useCallback(() => {
    setStep(STEPS.SELFIE);
  }, []);

  const handleTryAgain = useCallback(() => {
    setSelfieImage(null);
    setResultImage(null);
    setStep(STEPS.SELFIE);
  }, []);

  const handleStartOver = useCallback(() => {
    setContactData(null);
    setSelfieImage(null);
    setResultImage(null);
    setStep(STEPS.LANDING);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-spg-blue py-3 px-4 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <svg className="w-8 h-8 text-white" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2" />
            <path d="M10 20C12 22 20 22 22 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <rect x="11" y="14" width="2" height="3" rx="0.5" fill="currentColor" />
            <rect x="14" y="13" width="2" height="4" rx="0.5" fill="currentColor" />
            <rect x="17" y="13" width="2" height="4" rx="0.5" fill="currentColor" />
            <rect x="20" y="14" width="2" height="3" rx="0.5" fill="currentColor" />
          </svg>
          <span className="text-white font-bold text-lg tracking-tight">SPG Dental Implants</span>
        </div>
      </header>

      {/* Content */}
      <main>
        {step === STEPS.LANDING && (
          <LandingPage onStart={handleStart} />
        )}
        {step === STEPS.CONTACT && (
          <ContactForm onSubmit={handleContactSubmit} onBack={() => setStep(STEPS.LANDING)} />
        )}
        {step === STEPS.SELFIE && (
          <SelfieCapture onCapture={handleSelfieCapture} onBack={() => setStep(STEPS.CONTACT)} />
        )}
        {step === STEPS.PROCESSING && (
          <Processing
            selfieImage={selfieImage}
            contactData={contactData}
            onComplete={handleProcessingComplete}
            onError={handleProcessingError}
          />
        )}
        {step === STEPS.RESULT && (
          <ResultView
            originalImage={selfieImage}
            resultImage={resultImage}
            onTryAgain={handleTryAgain}
            onStartOver={handleStartOver}
          />
        )}
      </main>
    </div>
  );
}
