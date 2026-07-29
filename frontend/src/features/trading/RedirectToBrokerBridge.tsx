import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Loader2 } from "lucide-react";
import { Header } from '../../components/common/Header';

export function RedirectToBrokerBridge() {
  const navigate = useNavigate();

  useEffect(() => {
    // Simulated redirect for demonstration purposes
    const timer = setTimeout(() => {
      navigate('/trade/sync-status');
    }, 3500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="h-full min-h-screen bg-background text-on-background flex flex-col items-center justify-center font-body-md antialiased">
      {/* Navigation intentionally suppressed as this is a linear/transactional flow */}
      <main className="w-full max-w-md px-4 flex flex-col items-center text-center">
        
        {/* Logo / Brand anchor */}
        <div className="mb-8 flex items-center justify-center">
          <Header />
        </div>
        
        {/* The Canvas / Card */}
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-surface-variant w-full flex flex-col items-center">
          
          {/* Loading Indicator */}
          <div className="w-16 h-16 mb-6 text-primary flex items-center justify-center">
            <Loader2 size={64} className="animate-spin" />
          </div>
          
          {/* Primary Message */}
          <h1 className="font-headline-sm text-on-surface mb-2">
            Redirecting you to Zerodha...
          </h1>
          
          {/* Secondary Context */}
          <p className="font-body-md text-on-surface-variant mb-8 max-w-[280px]">
            Please wait while we securely connect you to your broker.
          </p>
          
          {/* Trust / Security Note */}
          <div className="bg-surface-container-low rounded-lg p-4 w-full flex items-start text-left gap-3 border border-surface-variant">
            <Shield size={24} className="text-secondary shrink-0 mt-0.5" fill="currentColor" />
            <div>
              <h3 className="font-label-md text-on-surface mb-1">Secure Connection</h3>
              <p className="font-label-sm text-on-surface-variant leading-relaxed">
                SahaVest does not handle your funds. Your trade is executed securely on your broker's platform.
              </p>
            </div>
          </div>
        </div>
        
        {/* Cancel Action */}
        <button 
          onClick={() => navigate(-1)}
          className="mt-6 font-label-md text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center h-[44px] min-w-[44px]"
        >
          Cancel
        </button>
      </main>
    </div>
  );
}
