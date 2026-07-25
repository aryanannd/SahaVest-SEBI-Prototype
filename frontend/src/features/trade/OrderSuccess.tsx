import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function OrderSuccess() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-surface px-6 pb-20">
      <div className="w-full max-w-sm flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-[#E6F4EA] rounded-full flex items-center justify-center mb-6 shadow-sm">
          <CheckCircle2 className="text-[#0D532A]" size={40} />
        </div>
        
        <h1 className="font-display-lg-mobile text-on-surface mb-2">Order Placed!</h1>
        <p className="font-body-md text-on-surface-variant text-sm mb-8 max-w-[280px]">
          Your trade has been successfully initiated via your broker. It may take up to 24 hours to reflect in your portfolio.
        </p>
        
        <div className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-4 text-left shadow-sm mb-8">
          <div className="flex justify-between items-center mb-3">
            <span className="font-label-md text-on-surface-variant">Asset</span>
            <span className="font-label-md text-on-surface">SGB Series IV 2023-24</span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="font-label-md text-on-surface-variant">Quantity</span>
            <span className="font-label-md text-on-surface">10 Units</span>
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-surface-variant">
            <span className="font-label-md text-on-surface-variant">Est. Amount</span>
            <span className="font-headline-sm text-primary">₹62,450</span>
          </div>
        </div>

        <button 
          onClick={() => navigate('/dashboard')}
          className="w-full h-12 bg-primary text-on-primary font-label-md rounded-full shadow-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          Back to Dashboard <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
