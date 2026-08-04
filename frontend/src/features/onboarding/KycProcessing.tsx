import React, { useEffect } from 'react';
import { Shield, CheckCircle2, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/common/Header';

export function KycProcessing() {
  const navigate = useNavigate();

  useEffect(() => {
    // Automatically navigate to risk profiling after fake processing delay
    const timer = setTimeout(() => {
      navigate('/onboarding/risk-profiling');
    }, 4000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="bg-background text-on-background h-screen flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="w-full flex items-center justify-center py-6 border-b border-surface-variant bg-surface sticky top-0 z-50">
        <Header />
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center p-4 md:px-6 max-w-md mx-auto w-full text-center">
        {/* Central Animated Progress Ring */}
        <div className="relative w-48 h-48 mb-8">
          {/* Background Ring */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle className="text-surface-container-high" cx="50" cy="50" fill="none" r="45" stroke="currentColor" strokeWidth="6"></circle>
            {/* Animated Progress */}
            <circle 
              className="text-secondary timer-progress" 
              cx="50" cy="50" fill="none" r="45" stroke="currentColor" strokeLinecap="round" strokeWidth="6"
            ></circle>
          </svg>
          {/* Inner Icon / Shield */}
          <div className="absolute inset-0 flex items-center justify-center pulse-soft">
            <Shield size={64} className="text-primary opacity-80" strokeWidth={1} />
          </div>
        </div>

        {/* Primary Message */}
        <h1 className="font-display-lg-mobile md:font-display-lg text-on-surface mb-3">Verifying your details...</h1>
        <p className="font-body-lg text-on-surface-variant mb-8 max-w-[280px]">
          Please wait a moment while we securely process your information.
        </p>

        {/* Reassurance Banner */}
        <div className="bg-surface-container-low border border-outline-variant rounded-xl p-4 flex items-start gap-4 mb-4 w-full text-left shadow-sm">
          <CheckCircle2 className="text-secondary mt-1" size={24} />
          <div>
            <p className="font-label-md text-on-surface mb-1">Secure &amp; Compliant</p>
            <p className="font-body-md text-on-surface-variant">SahaVest is safe and uses RBI-regulated protocols for all data verification.</p>
          </div>
        </div>
        <div className="bg-surface-container border border-outline-variant/50 rounded-lg px-4 py-2 mb-8 w-full">
          <p className="font-label-sm text-outline text-center">
            🔬 Demo mode — production eKYC requires DigiLocker / CKYC (CERSAI) / NSDL PAN verification partnership
          </p>
        </div>
      </main>

      {/* Timeout / Fallback Section (Fixed at bottom) */}
      <div className="w-full bg-surface-container-lowest border-t border-surface-variant p-4 md:p-6">
        <div className="max-w-md mx-auto text-center">
          <p className="font-label-sm text-outline uppercase tracking-wider mb-3">Taking too long?</p>
          <button className="w-full h-[56px] min-h-[56px] flex items-center justify-center gap-2 rounded-full border border-outline text-on-surface hover:bg-surface-container-low transition-colors duration-200 active:scale-[0.98]">
            <Upload size={20} />
            <span className="font-label-md">Try alternate KYC via Aadhaar upload</span>
          </button>
        </div>
      </div>
      
      <style>{`
        .pulse-soft {
            animation: pulse-op 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse-op {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
        }
        .timer-progress {
            stroke-dasharray: 283;
            stroke-dashoffset: 283;
            animation: countdown 4s linear forwards;
        }
        @keyframes countdown {
            from { stroke-dashoffset: 283; }
            to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
}
