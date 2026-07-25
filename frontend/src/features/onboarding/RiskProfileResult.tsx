import React from 'react';
import { Scale, Clock, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function RiskProfileResult() {
  const navigate = useNavigate();

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-sans">
      {/* TopAppBar */}
      <header className="w-full sticky top-0 z-50 bg-surface border-b border-outline-variant">
        <div className="flex items-center justify-between px-4 py-3 w-full max-w-7xl mx-auto">
          <button 
            onClick={() => navigate('/onboarding/welcome')}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors active:scale-95 duration-100"
          >
            <X size={24} className="text-primary" />
          </button>
          <h1 className="font-headline-md text-primary tracking-tight">SahaVest</h1>
          <div className="w-10 h-10"></div> {/* Placeholder to balance header */}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 py-8 max-w-7xl mx-auto w-full relative overflow-hidden">
        {/* Abstract Background Element */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-secondary-container via-surface to-background"></div>
        
        <div className="relative z-10 w-full max-w-lg flex flex-col items-center text-center space-y-8">
          
          {/* Result Badge */}
          <div className="flex flex-col items-center space-y-3">
            <div className="w-24 h-24 rounded-full bg-secondary-container flex items-center justify-center shadow-sm">
              <Scale size={48} className="text-on-secondary-container" strokeWidth={1.5} />
            </div>
            <h2 className="font-display-lg-mobile md:font-display-lg text-primary">MODERATE RISK</h2>
          </div>

          {/* Explanation Card */}
          <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant shadow-sm w-full">
            <p className="font-body-lg text-on-surface">
              You prefer a balance of growth and safety, accepting some market fluctuations.
            </p>
            <div className="mt-6 pt-4 border-t border-surface-container-highest">
              <p className="font-body-md text-on-surface-variant flex items-center justify-center gap-2">
                <Clock size={16} />
                Your profile should be retaken in 12 months
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="w-full flex flex-col space-y-4 pt-6">
            <button 
              onClick={() => navigate('/onboarding/account-aggregator')}
              className="w-full h-[56px] rounded-lg bg-primary text-on-primary font-label-md hover:bg-on-primary-fixed-variant transition-colors active:scale-[0.98]"
            >
              Continue
            </button>
            <button 
              onClick={() => navigate('/onboarding/risk-profiling')}
              className="w-full h-[48px] rounded-lg bg-surface text-primary border border-outline-variant font-label-md hover:bg-surface-container-low transition-colors active:scale-[0.98]"
            >
              Retake Test
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
