import React, { useEffect, useState } from 'react';
import { Shield, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function BrokerRedirect() {
  const navigate = useNavigate();
  const [redirecting, setRedirecting] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRedirecting(false);
      navigate('/trade/success');
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-surface px-6 pb-20">
      <div className="w-full max-w-sm flex flex-col items-center text-center">
        <h1 className="font-headline-md text-primary tracking-tight mb-8">SahaVest</h1>

        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-surface-variant w-full flex flex-col items-center">
          {redirecting ? (
            <>
              <div className="mb-6">
                <Loader2 className="animate-spin text-primary" size={48} />
              </div>
              <h2 className="font-headline-sm text-on-surface mb-2">Redirecting to Zerodha...</h2>
              <p className="font-body-md text-on-surface-variant text-sm mb-6">
                Please wait while we securely connect you to your broker to execute this trade.
              </p>
            </>
          ) : (
            <h2 className="font-headline-sm text-on-surface mb-2">Connected!</h2>
          )}

          <div className="bg-surface-container-low rounded-lg p-4 w-full flex items-start text-left gap-3 border border-surface-variant">
            <Shield className="text-secondary mt-1 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-label-md text-on-surface mb-1">Secure Connection</h3>
              <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">
                SahaVest does not handle your funds. Your trade is executed securely on your broker's platform.
              </p>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => navigate(-1)}
          className="mt-6 font-label-md text-on-surface-variant hover:text-primary transition-colors h-11 px-4"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
