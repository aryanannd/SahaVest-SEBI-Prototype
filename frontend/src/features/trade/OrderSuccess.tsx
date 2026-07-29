import React from 'react';
import { CheckCircle2, Info, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function OrderSuccess() {
  const navigate = useNavigate();

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col items-center justify-center font-body-md antialiased p-4 md:p-8">
      {/* Note: TopAppBar and BottomNavBar are suppressed as this is a transactional "Success/Confirmation" screen */}
      
      <main className="w-full max-w-[480px] mx-auto flex flex-col items-center text-center">
        
        {/* Status Icon Container */}
        <div className="relative w-24 h-24 mb-8 animate-in slide-in-from-bottom-4 fade-in duration-500">
          {/* Pulsing background rings for active sync indication */}
          <div className="absolute inset-0 rounded-full bg-secondary-container animate-[pulse_3s_cubic-bezier(0.4,0,0.6,1)_infinite]"></div>
          <div className="absolute inset-2 rounded-full bg-secondary opacity-20"></div>
          
          {/* Icon */}
          <div className="absolute inset-0 flex items-center justify-center text-secondary">
            <CheckCircle2 size={48} className="fill-current text-white" />
          </div>
          
          {/* Floating Sync Badge */}
          <div className="absolute -bottom-2 -right-2 bg-surface shadow-sm border border-outline-variant rounded-full p-2 flex items-center justify-center">
            <RefreshCw size={20} className="text-primary animate-[spin_3s_linear_infinite]" />
          </div>
        </div>

        {/* Headline & Welcome Back */}
        <div className="animate-in slide-in-from-bottom-4 fade-in duration-500 delay-100 mb-2 fill-mode-both">
          <span className="font-label-sm text-secondary uppercase tracking-wider mb-2 block">Status: Processing</span>
          <h1 className="font-display-lg-mobile md:font-display-lg text-primary mb-3">
            Trade Initiated
          </h1>
        </div>

        {/* Reassurance Message */}
        <p className="font-body-lg text-on-surface-variant max-w-sm mx-auto mb-8 animate-in slide-in-from-bottom-4 fade-in duration-500 delay-200 fill-mode-both">
          Welcome back. We'll update your SahaVest portfolio as soon as your broker syncs the data (usually within 2-4 hours).
        </p>

        {/* Information Card */}
        <div className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm mb-8 text-left animate-in slide-in-from-bottom-4 fade-in duration-500 delay-300 fill-mode-both">
          <div className="flex items-start gap-3">
            <Info size={24} className="text-on-surface-variant mt-1 shrink-0" />
            <div>
              <h3 className="font-headline-sm text-on-surface mb-1">What happens next?</h3>
              <p className="font-body-md text-on-surface-variant">
                Your trade is securely recorded. Once the broker clears the transaction, your dashboard will reflect the updated holdings automatically. No further action is required from you.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <button 
          onClick={() => navigate('/dashboard')}
          className="w-full bg-primary text-on-primary font-headline-sm h-[56px] min-h-[44px] rounded-full flex items-center justify-center transition-transform hover:scale-[1.02] active:scale-95 animate-in slide-in-from-bottom-4 fade-in duration-500 delay-300 fill-mode-both"
        >
          Return to Dashboard
        </button>

      </main>
    </div>
  );
}
