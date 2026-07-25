import React from 'react';
import { AlertTriangle, ArrowRight, ShieldAlert, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function PortfolioAlerts() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col bg-surface overflow-y-auto px-4 pt-6 pb-20">
      <div className="mb-6">
        <h1 className="font-display-lg-mobile text-on-surface mb-2">Exposure Analytics</h1>
        <p className="font-body-md text-on-surface-variant text-sm">Portfolio concentration and risk alerts.</p>
      </div>

      <div className="flex flex-col gap-4">
        {/* Active Alert */}
        <div className="bg-[#FAECE7] border border-error-container rounded-xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex gap-3 mb-3">
            <AlertTriangle className="text-error flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="font-headline-sm text-[#4A1B0C]">High Sector Concentration</h3>
              <p className="font-body-md text-[#4A1B0C]/80 mt-1 text-sm">
                3 of your Mutual Fund folios have a 60% overlap in the Banking & Financial Services sector.
              </p>
            </div>
          </div>
          
          <div className="bg-white/50 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-label-md text-[#4A1B0C]">Financial Sector Exposure</span>
              <span className="font-headline-sm text-error">42%</span>
            </div>
            <div className="w-full bg-surface-variant rounded-full h-2 overflow-hidden">
              <div className="bg-error h-2 rounded-full" style={{ width: '42%' }} />
            </div>
            <p className="text-[11px] text-[#4A1B0C]/70 mt-2">Recommended maximum: 20-25% for a Moderate risk profile.</p>
          </div>

          <button 
            onClick={() => navigate('/twin/simulator')}
            className="w-full bg-error text-white font-label-md py-3 rounded-full flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <BarChart2 size={18} /> Simulate Rebalancing
          </button>
        </div>

        {/* Resolved or Info Alerts */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm opacity-70">
          <div className="flex gap-3">
            <ShieldAlert className="text-secondary flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="font-headline-sm text-on-surface">AMC Diversification Good</h3>
              <p className="font-body-md text-on-surface-variant mt-1 text-sm">
                Your investments are well distributed across 4 different AMCs. No single AMC concentration risk detected.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
