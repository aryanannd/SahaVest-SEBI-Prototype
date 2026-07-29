import React, { useState } from 'react';
import { Menu, Bell, Settings, Sliders, Info, Brain, Search, AlertTriangle, Gavel, ArrowRight, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/common/Header';

export function AIExplainability() {
  const [threshold, setThreshold] = useState(85);
  const navigate = useNavigate();

  const getThresholdColor = () => {
    if (threshold < 70) return 'text-error';
    if (threshold < 85) return 'text-tertiary';
    return 'text-primary';
  };

  return (
    <div className="min-h-screen pb-safe bg-background text-on-background antialiased">
      <header className="bg-surface fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 h-[56px] border-b border-outline-variant shadow-sm">
        <button className="text-on-surface-variant hover:bg-surface-container-low w-[44px] h-[44px] flex items-center justify-center rounded-full transition-colors active:scale-95 duration-150">
          <Menu size={24} />
        </button>
        <Header />
        <button className="text-on-surface-variant hover:bg-surface-container-low w-[44px] h-[44px] flex items-center justify-center rounded-full transition-colors active:scale-95 duration-150">
          <Bell size={24} />
        </button>
      </header>

      <main className="pt-[72px] pb-[96px] px-4 max-w-4xl mx-auto md:px-6 grid grid-cols-4 md:grid-cols-8 gap-3 md:gap-4">
        <div className="col-span-4 md:col-span-8 mb-3">
          <div className="flex items-center gap-2 text-primary mb-1">
            <Settings size={20} />
            <span className="font-label-md uppercase tracking-wider text-on-surface-variant">Advanced Settings</span>
          </div>
          <h2 className="font-display-lg-mobile md:font-display-lg text-on-surface mb-2">Explainability Panel</h2>
          <p className="font-body-md text-on-surface-variant">Review the autonomous decisions made by your SahaVest agent and adjust sensitivity parameters to match your risk profile.</p>
        </div>

        <div className="col-span-4 md:col-span-3 flex flex-col gap-3">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline-sm text-primary flex items-center gap-2">
                <Sliders size={24} /> AI Confidence Threshold
              </h3>
            </div>
            <p className="font-body-md text-on-surface-variant mb-6">Determine the minimum certainty required for the AI to execute an automated alert or block a high-risk transaction.</p>
            
            <div className="mb-6">
              <div className="flex justify-between items-end mb-2">
                <span className="font-label-md text-on-surface-variant">Conservative</span>
                <span className={`font-headline-md ${getThresholdColor()}`}>{threshold}%</span>
              </div>
              <input 
                type="range" min="50" max="99" value={threshold} 
                onChange={e => setThreshold(Number(e.target.value))} 
                className="w-full h-2 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-primary" 
              />
              <div className="flex justify-between mt-2 font-label-sm text-outline">
                <span>50% (High Alert)</span>
                <span>99% (Strict)</span>
              </div>
            </div>

            <div className="bg-surface-container-low rounded-lg p-3 border border-outline-variant/50">
              <div className="flex items-start gap-3">
                <Info className="text-secondary shrink-0 mt-0.5" size={20} />
                <div>
                  <span className="font-label-md text-on-surface block mb-1">Current Setting: Guarded</span>
                  <span className="font-body-sm text-on-surface-variant text-sm">Alerts will trigger only when the AI is highly confident (85%+) that a transaction contains speculative risk patterns.</span>
                </div>
              </div>
            </div>
          </div>

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

        <div className="col-span-4 md:col-span-5 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-outline-variant bg-surface-bright flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Brain className="text-primary" size={24} />
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

          <div className="p-4 flex-grow overflow-y-auto max-h-[600px] relative">
            
            <div className="relative mb-6">
              <div className="absolute left-[23px] top-[40px] bottom-[-24px] w-[2px] bg-outline-variant"></div>
              <div className="flex gap-4 relative z-10">
                <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center border-4 border-surface-container-lowest shrink-0">
                  <Search size={20} />
                </div>
                <div className="flex-grow pt-1">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-label-md text-on-surface">Step 1: Context Analysis</span>
                    <span className="font-label-sm text-outline">10:42 AM</span>
                  </div>
                  <div className="bg-surface-container-low rounded-lg p-3 border border-outline-variant/30">
                    <p className="font-body-md text-on-surface-variant font-mono text-sm leading-relaxed">
                      Analyzed pending transaction: ₹50,000 to "NextGen Crypto Fund".<br/>
                      Scanning descriptive metadata against known high-risk terminology databases.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative mb-6">
              <div className="absolute left-[23px] top-[40px] bottom-[-24px] w-[2px] bg-outline-variant"></div>
              <div className="flex gap-4 relative z-10">
                <div className="w-12 h-12 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center border-4 border-surface-container-lowest shrink-0">
                  <AlertTriangle size={20} />
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

            <div className="relative mb-6">
              <div className="absolute left-[23px] top-[40px] bottom-[-24px] w-[2px] bg-outline-variant"></div>
              <div className="flex gap-4 relative z-10">
                <div className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center border-4 border-surface-container-lowest shrink-0">
                  <Gavel size={20} />
                </div>
                <div className="flex-grow pt-1">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-label-md text-on-surface">Step 3: Resolution & Action</span>
                    <span className="font-label-sm text-outline">10:42 AM</span>
                  </div>
                  <div className="bg-surface-container-low rounded-lg p-3 border border-outline-variant/30">
                    <p className="font-body-md text-on-surface-variant font-mono text-sm mb-2 leading-relaxed">
                      Confidence (92%) exceeds user threshold ({threshold}%).<br/>
                      Action: Initiated cooling-off period prompt and applied temporary hold.
                    </p>
                    <button className="mt-2 text-primary font-label-md hover:underline flex items-center gap-1">
                      View Full Trace Data <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="flex gap-4 relative z-10 opacity-70">
                <div className="w-12 h-12 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center border-4 border-surface-container-lowest shrink-0">
                  <CheckCircle size={20} />
                </div>
                <div className="flex-grow pt-1">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-label-md text-on-surface">Routine Check: SIP Auto-Pay</span>
                    <span className="font-label-sm text-outline">09:00 AM</span>
                  </div>
                  <div className="bg-surface-container-low rounded-lg p-3 border border-outline-variant/30">
                    <p className="font-body-md text-on-surface-variant font-mono text-sm leading-relaxed">
                      Analyzed ₹10,000 transfer to "Nifty 50 Index Fund".<br/>
                      Result: Established routine. Risk score: 2%. Cleared.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
