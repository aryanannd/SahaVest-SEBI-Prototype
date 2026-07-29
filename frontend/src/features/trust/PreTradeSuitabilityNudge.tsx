import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface PreTradeSuitabilityNudgeProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;
  onReviewProfile: () => void;
}

export function PreTradeSuitabilityNudge({
  isOpen,
  onClose,
  onProceed,
  onReviewProfile
}: PreTradeSuitabilityNudgeProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay Scrim */}
      <div 
        className="fixed inset-0 bg-on-background/40 z-40 backdrop-blur-[2px]" 
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        {/* The Modal Card */}
        <div className="bg-surface-container-lowest w-full max-w-sm rounded-[24px] shadow-lg flex flex-col items-center p-8 text-center animate-in fade-in zoom-in-95 duration-200 pointer-events-auto">
          
          {/* Icon */}
          <div className="w-16 h-16 rounded-full bg-tertiary-fixed flex items-center justify-center mb-6">
            <AlertTriangle className="text-[32px] text-on-tertiary-container shrink-0" size={32} />
          </div>
          
          {/* Content */}
          <h2 className="font-headline-md text-on-background mb-3">Risk Profile Mismatch</h2>
          <p className="font-body-md text-on-surface-variant mb-8">
            This trade is categorized as High Risk, while your profile is set to Conservative. Proceeding may lead to higher volatility than your stated preference.
          </p>
          
          {/* Actions */}
          <div className="w-full flex flex-col gap-3">
            <button 
              onClick={onReviewProfile}
              className="w-full min-h-[48px] bg-primary text-on-primary font-label-md rounded-full hover:bg-primary-container transition-colors duration-200 active:scale-[0.98]"
            >
              Review Risk Profile
            </button>
            <button 
              onClick={onProceed}
              className="w-full min-h-[48px] bg-transparent border border-outline text-primary font-label-md rounded-full hover:bg-surface-container-low transition-colors duration-200 active:scale-[0.98]"
            >
              Proceed Anyway
            </button>
          </div>
          
        </div>
      </div>
    </>
  );
}
