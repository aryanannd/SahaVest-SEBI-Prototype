import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, Bell, Settings, SlidersHorizontal, Info, 
  Brain, Search, AlertTriangle, Gavel, ArrowRight, 
  CheckCircle2, LayoutGrid, Wallet, Shield, User 
} from "lucide-react";

export function AIExplainabilityHub() {
  const navigate = useNavigate();
  const [threshold, setThreshold] = useState<number>(85);

  const getThresholdColor = (val: number) => {
    if (val < 70) return 'text-error';
    if (val < 85) return 'text-tertiary';
    return 'text-primary';
  };

  return (
    <div className="min-h-screen pb-safe bg-background text-on-background font-body-md antialiased">
      {/* TopAppBar */}
      <header className="bg-surface dark:bg-on-background fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 h-[56px] border-b border-outline-variant dark:border-outline shadow-sm">
        <button aria-label="Menu" className="text-on-surface-variant dark:text-outline hover:bg-surface-container-low dark:hover:bg-surface-variant w-[44px] h-[44px] flex items-center justify-center rounded-full transition-colors active:scale-95 duration-150">
          <Menu size={24} />
        </button>
        <h1 
          className="font-headline-sm-mobile font-bold text-primary dark:text-primary-fixed-dim cursor-pointer"
          onClick={() => navigate('/')}
        >
          SahaVest
        </h1>
        <button aria-label="Notifications" className="text-on-surface-variant dark:text-outline hover:bg-surface-container-low dark:hover:bg-surface-variant w-[44px] h-[44px] flex items-center justify-center rounded-full transition-colors active:scale-95 duration-150">
          <Bell size={24} />
        </button>
      </header>

      {/* Main Content Canvas */}
      <main className="pt-[72px] pb-[96px] px-4 max-w-4xl mx-auto md:px-6 grid grid-cols-4 md:grid-cols-8 gap-4 md:gap-6">
        
        {/* Page Header */}
        <div className="col-span-4 md:col-span-8 mb-3">
          <div className="flex items-center gap-2 text-primary mb-1">
            <Settings size={20} />
            <span className="font-label-md uppercase tracking-wider text-on-surface-variant">Advanced Settings</span>
          </div>
          <h2 className="font-display-lg-mobile md:font-display-lg text-on-surface mb-2">Explainability Panel</h2>
          <p className="font-body-md text-on-surface-variant">Review the autonomous decisions made by your SahaVest agent and adjust sensitivity parameters to match your risk profile.</p>
        </div>

        {/* Left Column: Confidence Threshold & Controls */}
        <div className="col-span-4 md:col-span-3 flex flex-col gap-3">
          
          {/* Threshold Card */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline-sm text-primary flex items-center gap-2">
                <SlidersHorizontal size={20} />
                AI Confidence Threshold
              </h3>
            </div>
            <p className="font-body-md text-on-surface-variant mb-6">Determine the minimum certainty required for the AI to execute an automated alert or block a high-risk transaction.</p>
            
            <div className="mb-6">
              <div className="flex justify-between items-end mb-2">
                <span className="font-label-md text-on-surface-variant">Conservative</span>
                <span className={`font-headline-md ${getThresholdColor(threshold)}`}>{threshold}%</span>
              </div>
              <input 
                className="w-full h-2 accent-primary bg-surface-variant rounded-lg appearance-none cursor-pointer" 
                id="thresholdSlider" 
                max="99" min="50" type="range" 
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
              />
              <div className="flex justify-between mt-2 font-label-sm text-outline">
                <span>50% (High Alert)</span>
                <span>99% (Strict)</span>
              </div>
            </div>
            
            <div className="bg-surface-container-low rounded-lg p-3 border border-outline-variant/50">
              <div className="flex items-start gap-3">
                <Info size={20} className="text-secondary shrink-0 mt-0.5" />
                <div>
                  <span className="font-label-md text-on-surface block mb-1">Current Setting: Guarded</span>
                  <span className="text-[14px] leading-[20px] text-on-surface-variant block">Alerts will trigger only when the AI is highly confident (85%+) that a transaction contains speculative risk patterns.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Focus Areas Filter */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 shadow-sm">
            <h3 className="font-headline-sm text-primary mb-4">Agent Focus Areas</h3>
            <div className="flex flex-wrap gap-2">
              <button className="px-4 py-2 rounded-full border-2 border-primary bg-primary-container text-on-primary-container font-label-md transition-colors">FOMO Detection</button>
              <button className="px-4 py-2 rounded-full border border-outline-variant text-on-surface-variant hover:bg-surface-container font-label-md transition-colors">Volatility</button>
              <button className="px-4 py-2 rounded-full border border-outline-variant text-on-surface-variant hover:bg-surface-container font-label-md transition-colors">Liquidity Risk</button>
              <button className="px-4 py-2 rounded-full border border-outline-variant text-on-surface-variant hover:bg-surface-container font-label-md transition-colors">Scam Patterns</button>
            </div>
          </div>
        </div>

        {/* Right Column: Agent Decision Log */}
        <div className="col-span-4 md:col-span-5 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden flex flex-col">
          
          {/* Log Header */}
          <div className="px-4 py-3 border-b border-outline-variant bg-surface-bright flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Brain size={24} className="text-primary" />
              <h3 className="font-headline-sm text-primary">Live Agent Log</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
              </span>
              <span className="font-label-sm text-on-surface-variant uppercase tracking-wider">Active</span>
            </div>
          </div>

          {/* Log Entries */}
          <div className="p-4 flex-grow overflow-y-auto max-h-[600px] relative">
            <style>
              {`
                .log-connector {
                    position: absolute;
                    left: 23px;
                    top: 40px;
                    bottom: -16px;
                    width: 2px;
                    background-color: var(--color-outline-variant, #c4c6d0);
                }
                .log-item:last-child .log-connector {
                    display: none;
                }
              `}
            </style>
            
            {/* Log Item 1 */}
            <div className="log-item relative mb-6">
              <div className="log-connector"></div>
              <div className="flex gap-4 relative z-10">
                <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center border-4 border-surface-container-lowest shrink-0">
                  <Search size={24} />
                </div>
                <div className="flex-grow pt-1">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-label-md text-on-surface">Step 1: Context Analysis</span>
                    <span className="font-label-sm text-outline">10:42 AM</span>
                  </div>
                  <div className="bg-surface-container-low rounded-lg p-3 border border-outline-variant/30">
                    <p className="font-body-md text-on-surface-variant font-mono text-sm">
                        Analyzed pending transaction: ₹50,000 to "NextGen Crypto Fund".<br />
                        Scanning descriptive metadata against known high-risk terminology databases.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Log Item 2 */}
            <div className="log-item relative mb-6">
              <div className="log-connector"></div>
              <div className="flex gap-4 relative z-10">
                <div className="w-12 h-12 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center border-4 border-surface-container-lowest shrink-0">
                  <AlertTriangle size={24} />
                </div>
                <div className="flex-grow pt-1">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-label-md text-on-surface">Step 2: Pattern Recognition</span>
                    <span className="font-label-sm text-outline">10:42 AM</span>
                  </div>
                  <div className="bg-surface-container-low rounded-lg p-3 border border-outline-variant/30">
                    <p className="font-body-md text-on-surface-variant font-mono text-sm mb-2">
                        Identified keywords: "Guaranteed 10x returns", "limited time offer", "FOMO".
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-error-container text-on-error-container rounded font-label-sm">High Match (92%)</span>
                      <span className="font-label-sm text-outline">Risk Vector: Speculative Hype</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Log Item 3 */}
            <div className="log-item relative mb-6">
              <div className="log-connector"></div>
              <div className="flex gap-4 relative z-10">
                <div className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center border-4 border-surface-container-lowest shrink-0">
                  <Gavel size={24} />
                </div>
                <div className="flex-grow pt-1">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-label-md text-on-surface">Step 3: Resolution & Action</span>
                    <span className="font-label-sm text-outline">10:42 AM</span>
                  </div>
                  <div className="bg-surface-container-low rounded-lg p-3 border border-outline-variant/30">
                    <p className="font-body-md text-on-surface-variant font-mono text-sm mb-2">
                        Confidence (92%) exceeds user threshold (85%).<br />
                        Action: Initiated cooling-off period prompt and applied temporary hold.
                    </p>
                    <button className="mt-2 text-primary font-label-md hover:underline flex items-center gap-1">
                        View Full Trace Data <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Log Item 4 (Benign) */}
            <div className="log-item relative">
              <div className="log-connector"></div>
              <div className="flex gap-4 relative z-10 opacity-70">
                <div className="w-12 h-12 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center border-4 border-surface-container-lowest shrink-0">
                  <CheckCircle2 size={24} />
                </div>
                <div className="flex-grow pt-1">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-label-md text-on-surface">Routine Check: SIP Auto-Pay</span>
                    <span className="font-label-sm text-outline">09:00 AM</span>
                  </div>
                  <div className="bg-surface-container-low rounded-lg p-3 border border-outline-variant/30">
                    <p className="font-body-md text-on-surface-variant font-mono text-sm">
                        Analyzed ₹10,000 transfer to "Nifty 50 Index Fund".<br />
                        Result: Established routine. Risk score: 2%. Cleared.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* BottomNavBar */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 pb-safe h-[80px] bg-surface-container dark:bg-on-background shadow-[0_-4px_12px_rgba(0,0,0,0.04)] rounded-t-xl">
        <button 
          onClick={() => navigate('/dashboard')}
          aria-label="Dashboard" 
          className="flex flex-col items-center justify-center text-on-surface-variant dark:text-outline px-5 py-1 hover:bg-surface-variant dark:hover:bg-inverse-surface min-w-[44px] min-h-[44px]"
        >
          <LayoutGrid size={24} />
          <span className="font-label-sm mt-1">Dashboard</span>
        </button>
        <button 
          onClick={() => navigate('/portfolio')}
          aria-label="Portfolio" 
          className="flex flex-col items-center justify-center text-on-surface-variant dark:text-outline px-5 py-1 hover:bg-surface-variant dark:hover:bg-inverse-surface min-w-[44px] min-h-[44px]"
        >
          <Wallet size={24} />
          <span className="font-label-sm mt-1">Portfolio</span>
        </button>
        <button 
          onClick={() => navigate('/protection')}
          aria-label="Protection" 
          className="flex flex-col items-center justify-center text-on-surface-variant dark:text-outline px-5 py-1 hover:bg-surface-variant dark:hover:bg-inverse-surface min-w-[44px] min-h-[44px]"
        >
          <Shield size={24} />
          <span className="font-label-sm mt-1">Protection</span>
        </button>
        {/* Active Tab: Profile (Settings fall under Profile domain) */}
        <button 
          onClick={() => navigate('/profile')}
          aria-label="Profile" 
          className="flex flex-col items-center justify-center bg-primary-container dark:bg-primary text-on-primary-container dark:text-on-primary rounded-full px-5 py-1 scale-90 transition-all duration-200 min-w-[44px] min-h-[44px]"
        >
          <User size={24} />
          <span className="font-label-sm mt-1">Profile</span>
        </button>
      </nav>
    </div>
  );
}
