import React from 'react';
import { useNavigate } from 'react-router-dom';

export function PortfolioHub() {
  const navigate = useNavigate();

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col pb-[80px] md:pb-0">
      {/* TopAppBar */}
      <header className="w-full sticky top-0 z-50 bg-surface border-b border-outline-variant flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
        <button onClick={() => navigate(-1)} className="w-[44px] h-[44px] flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors rounded-full active:scale-95 duration-100">
          <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0"}}>arrow_back</span>
        </button>
        <h1 className="font-headline-md text-primary tracking-tight">SahaVest</h1>
        <div className="w-[44px] h-[44px] flex items-center justify-center text-primary cursor-pointer hover:bg-surface-container-low transition-colors rounded-full active:scale-95 duration-100">
          <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0"}}>more_vert</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <h2 className="font-headline-sm text-on-surface">Asset Allocation</h2>
            {/* Keeping shortcuts to Returns and Goals so they remain accessible */}
            <div className="flex gap-2">
              <button onClick={() => navigate('/portfolio/returns')} className="text-xs font-label-sm text-secondary bg-secondary-container px-2 py-1 rounded">Returns</button>
              <button onClick={() => navigate('/portfolio/goals')} className="text-xs font-label-sm text-primary bg-primary-fixed px-2 py-1 rounded">Goals</button>
            </div>
          </div>
          <p className="font-body-md text-on-surface-variant">Breakdown of your current portfolio across different asset classes.</p>
        </div>

        {/* Total Value Summary Card */}
        <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant shadow-sm flex flex-col gap-3">
          <p className="font-label-sm text-on-surface-variant uppercase">Total Portfolio Value</p>
          <div className="flex items-baseline gap-2">
            <span className="font-display-lg text-on-surface">₹24,50,000</span>
            <span className="font-label-md text-secondary bg-secondary-container px-2 py-1 rounded-full flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span> 12.4%
            </span>
          </div>
        </div>

        {/* Allocation Breakdown Cards (Bento Style) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Equity */}
          <button onClick={() => navigate('/fund/equity')} className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant shadow-sm flex items-center justify-between hover:bg-surface-container-low transition-colors active:scale-[0.98] duration-200 text-left min-h-[44px] group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#002653] flex items-center justify-center text-white shrink-0">
                <span className="material-symbols-outlined">trending_up</span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-on-surface">Equity</span>
                <span className="font-label-sm text-on-surface-variant">Direct Stocks</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="font-body-md font-semibold text-on-surface">₹10,29,000</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-surface-variant rounded-full overflow-hidden">
                  <div className="h-full bg-[#002653] w-[42%]"></div>
                </div>
                <span className="font-label-sm text-on-surface-variant">42%</span>
              </div>
            </div>
          </button>

          {/* Mutual Funds */}
          <button onClick={() => navigate('/fund/mf')} className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant shadow-sm flex items-center justify-between hover:bg-surface-container-low transition-colors active:scale-[0.98] duration-200 text-left min-h-[44px] group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#006d42] flex items-center justify-center text-white shrink-0">
                <span className="material-symbols-outlined">pie_chart</span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-on-surface">Mutual Funds</span>
                <span className="font-label-sm text-on-surface-variant">SIPs & Lumpsum</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="font-body-md font-semibold text-on-surface">₹7,35,000</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-surface-variant rounded-full overflow-hidden">
                  <div className="h-full bg-[#006d42] w-[30%]"></div>
                </div>
                <span className="font-label-sm text-on-surface-variant">30%</span>
              </div>
            </div>
          </button>

          {/* Bonds */}
          <button onClick={() => navigate('/fund/bonds')} className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant shadow-sm flex items-center justify-between hover:bg-surface-container-low transition-colors active:scale-[0.98] duration-200 text-left min-h-[44px] group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#ffb95f] flex items-center justify-center text-white shrink-0">
                <span className="material-symbols-outlined">account_balance</span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-on-surface">Bonds</span>
                <span className="font-label-sm text-on-surface-variant">Corporate & Gov</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="font-body-md font-semibold text-on-surface">₹3,67,500</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-surface-variant rounded-full overflow-hidden">
                  <div className="h-full bg-[#ffb95f] w-[15%]"></div>
                </div>
                <span className="font-label-sm text-on-surface-variant">15%</span>
              </div>
            </div>
          </button>

          {/* NPS */}
          <button onClick={() => navigate('/fund/nps')} className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant shadow-sm flex items-center justify-between hover:bg-surface-container-low transition-colors active:scale-[0.98] duration-200 text-left min-h-[44px] group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#405e92] flex items-center justify-center text-white shrink-0">
                <span className="material-symbols-outlined">savings</span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-on-surface">NPS</span>
                <span className="font-label-sm text-on-surface-variant">Retirement</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="font-body-md font-semibold text-on-surface">₹1,96,000</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-surface-variant rounded-full overflow-hidden">
                  <div className="h-full bg-[#405e92] w-[8%]"></div>
                </div>
                <span className="font-label-sm text-on-surface-variant">8%</span>
              </div>
            </div>
          </button>

          {/* SGB */}
          <button onClick={() => navigate('/fund/sgb')} className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant shadow-sm flex items-center justify-between hover:bg-surface-container-low transition-colors active:scale-[0.98] duration-200 text-left min-h-[44px] group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#e89500] flex items-center justify-center text-white shrink-0">
                <span className="material-symbols-outlined">diamond</span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-on-surface">SGB</span>
                <span className="font-label-sm text-on-surface-variant">Sovereign Gold Bonds</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="font-body-md font-semibold text-on-surface">₹98,000</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-surface-variant rounded-full overflow-hidden">
                  <div className="h-full bg-[#e89500] w-[4%]"></div>
                </div>
                <span className="font-label-sm text-on-surface-variant">4%</span>
              </div>
            </div>
          </button>

          {/* REIT / InvIT */}
          <button onClick={() => navigate('/fund/reit')} className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant shadow-sm flex items-center justify-between hover:bg-surface-container-low transition-colors active:scale-[0.98] duration-200 text-left min-h-[44px] group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#573500] flex items-center justify-center text-white shrink-0">
                <span className="material-symbols-outlined">domain</span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-on-surface">REIT/InvIT</span>
                <span className="font-label-sm text-on-surface-variant">Real Estate & Infra</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="font-body-md font-semibold text-on-surface">₹24,500</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-surface-variant rounded-full overflow-hidden">
                  <div className="h-full bg-[#573500] w-[1%]"></div>
                </div>
                <span className="font-label-sm text-on-surface-variant">1%</span>
              </div>
            </div>
          </button>
        </div>
      </main>
    </div>
  );
}
