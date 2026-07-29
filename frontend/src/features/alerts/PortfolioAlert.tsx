import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, X, Info, ShieldCheck, Lightbulb } from "lucide-react";

export function PortfolioAlert() {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate(-1); // or to '/dashboard'
  };

  return (
    <div className="bg-surface text-on-surface font-body-md h-screen w-full flex flex-col overflow-hidden">
      
      {/* Scrim / Overlay for Modal Context */}
      <div className="fixed inset-0 bg-inverse-surface/60 backdrop-blur-sm z-40 flex items-center justify-center p-4 md:p-8">
        
        {/* Main Alert Modal (Bento-style layout) */}
        <main className="w-full max-w-3xl bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant z-50 flex flex-col max-h-full overflow-hidden animate-in fade-in zoom-in duration-300">
          
          {/* Modal Header */}
          <header className="flex items-center justify-between p-6 border-b border-surface-variant bg-surface-container-lowest sticky top-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed">
                <AlertTriangle size={24} fill="currentColor" className="text-on-tertiary-fixed" />
              </div>
              <div>
                <h1 className="font-headline-sm text-on-surface">Portfolio Check-in</h1>
                <p className="font-label-md text-on-surface-variant">Concentration Alert</p>
              </div>
            </div>
            <button 
              onClick={handleClose}
              aria-label="Close alert" 
              className="w-[44px] h-[44px] flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors text-on-surface-variant"
            >
              <X size={24} />
            </button>
          </header>

          {/* Modal Body (Scrollable) */}
          <div className="overflow-y-auto p-6 flex flex-col gap-6">
            
            {/* Primary Insight Card */}
            <div className="bg-surface rounded-lg p-6 border border-surface-variant flex flex-col md:flex-row gap-6 items-start">
              
              {/* Visual Representation (Donut Chart placeholder built with CSS) */}
              <div className="relative w-32 h-32 flex-shrink-0 mx-auto md:mx-0">
                {/* CSS Donut Chart showing 45% */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {/* Background Circle */}
                  <path className="text-surface-variant" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4"></path>
                  {/* 45% Segment */}
                  <path className="text-on-tertiary-container" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="45, 100" strokeWidth="4"></path>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="font-headline-md text-on-surface">45%</span>
                </div>
              </div>
              
              {/* Insight Text */}
              <div className="flex-1 space-y-3">
                <h2 className="font-headline-sm text-on-surface">High Exposure to Reliance Industries</h2>
                <p className="font-body-md text-on-surface-variant">
                  Currently, 45% of your total equity portfolio is concentrated in a single asset. While conviction is good, high concentration increases your vulnerability to specific company risks.
                </p>
                <button className="inline-flex items-center gap-2 font-label-md text-primary hover:text-primary-container transition-colors mt-3">
                  <Info size={18} />
                  Learn why this matters
                </button>
              </div>
            </div>

            {/* Bento Grid for Details & Action */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Current State */}
              <div className="bg-surface-container-low rounded-lg p-4 border border-surface-variant flex flex-col gap-3">
                <h3 className="font-label-sm uppercase text-on-surface-variant tracking-wider">Current Holding</h3>
                <div className="flex justify-between items-baseline">
                  <span className="font-headline-md text-on-surface">₹4,50,000</span>
                  <span className="font-label-md text-on-surface-variant">of ₹10,00,000</span>
                </div>
                <div className="w-full bg-surface-variant rounded-full h-2 mt-auto">
                  <div className="bg-on-tertiary-container h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
              
              {/* Recommendation */}
              <div className="bg-surface-container-lowest border-l-4 border-l-secondary rounded-r-lg p-4 shadow-sm flex flex-col gap-3">
                <h3 className="font-label-sm uppercase text-on-surface-variant tracking-wider">Guided Target</h3>
                <div className="flex justify-between items-baseline">
                  <span className="font-headline-md text-on-surface">&lt; 15%</span>
                  <span className="font-label-md text-secondary flex items-center gap-1">
                    <ShieldCheck size={16} />
                    Recommended
                  </span>
                </div>
                <p className="font-label-md text-on-surface-variant mt-auto">
                  Most robust portfolios cap single-stock exposure to 10-15% to maintain stability.
                </p>
              </div>
            </div>

            {/* Educational Nudge */}
            <div className="bg-primary-fixed rounded-lg p-4 flex items-start gap-4">
              <div className="mt-1 text-primary-container">
                <Lightbulb size={24} fill="currentColor" />
              </div>
              <div>
                <h4 className="font-label-md text-primary-container font-semibold mb-2">Diversification Step</h4>
                <p className="font-body-md text-on-primary-fixed-variant text-sm">
                  You don't need to sell immediately. Consider directing future investments into other sectors or broad-market index funds to naturally dilute this concentration over time.
                </p>
              </div>
            </div>

          </div>

          {/* Modal Footer / Actions */}
          <footer className="p-6 border-t border-surface-variant bg-surface-container-lowest flex flex-col md:flex-row gap-3 md:justify-end">
            <button 
              onClick={handleClose}
              className="min-h-[48px] px-6 rounded-full font-label-md text-primary bg-transparent hover:bg-surface-container-low transition-colors border border-outline-variant md:border-none w-full md:w-auto"
            >
              Acknowledge
            </button>
            <button 
              onClick={() => navigate('/learning')}
              className="min-h-[48px] px-6 rounded-full font-label-md text-on-primary bg-primary hover:bg-primary-container transition-colors shadow-sm w-full md:w-auto"
            >
              Explore Diversification Options
            </button>
          </footer>
        </main>
      </div>
    </div>
  );
}
