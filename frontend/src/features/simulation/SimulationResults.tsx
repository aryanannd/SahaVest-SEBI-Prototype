import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Info } from "lucide-react";

export function SimulationResults() {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    futureValue = 12450000, 
    totalInvested = 9000000, 
    wealthGained = 3450000, 
    duration = 15,
    expectedRate = 10,
    optimisticValue = 18520000,
    conservativeValue = 8430000
  } = location.state || {};

  const formatCurrency = (val: number) => {
     return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="bg-surface text-on-surface antialiased flex flex-col min-h-screen">
      {/* Nav Suppressed: Transactional/Task-Focused View */}
      <header className="w-full sticky top-0 z-50 bg-surface border-b border-outline-variant px-4 py-2 flex items-center h-16">
        <button 
          onClick={() => navigate(-1)}
          aria-label="Go back" 
          className="w-[44px] h-[44px] flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors"
        >
          <ArrowLeft className="text-on-surface" size={24} />
        </button>
        <h1 className="font-headline-md text-primary ml-2 tracking-tight">Simulator Results</h1>
        <div className="flex-grow"></div>
      </header>
      
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-6 pb-[100px] md:pb-8 flex flex-col gap-6">
        
        {/* Summary Section */}
        <section className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant relative overflow-hidden">
          <div className="relative z-10 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-secondary">
              <CheckCircle2 size={24} fill="currentColor" className="text-surface-container-lowest" strokeWidth={1} style={{ stroke: 'var(--color-secondary)' }} />
              {/* Wait, fill checkcircle might look different. I'll just use CheckCircle2 with regular color */}
              <span className="font-label-md uppercase tracking-widest text-on-surface-variant font-semibold">Projection Complete</span>
            </div>
            <p className="font-body-lg text-on-surface-variant">In {duration} years, your investment could grow to</p>
            <div className="flex items-end gap-2">
              <h2 className="font-display-lg-mobile md:font-display-lg text-primary">₹{formatCurrency(futureValue)}</h2>
              <span className="font-label-md text-on-surface-variant mb-2">Expected</span>
            </div>
          </div>
        </section>

        {/* Chart Section */}
        <section className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="font-headline-sm text-on-surface">Growth Scenarios</h3>
            <div className="flex gap-3">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-secondary"></div>
                <span className="font-label-sm text-on-surface-variant">Optimistic</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span className="font-label-sm text-on-surface-variant">Expected</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-outline"></div>
                <span className="font-label-sm text-on-surface-variant">Conservative</span>
              </div>
            </div>
          </div>
          
          {/* Simulated SVG Chart */}
          <div className="w-full h-64 md:h-80 relative mt-4">
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 800 300">
              <style>
                {`
                  .chart-path {
                      stroke-dasharray: 1000;
                      stroke-dashoffset: 1000;
                      animation: drawPath 2s ease-out forwards;
                  }
                  .chart-area {
                      opacity: 0;
                      animation: fadeInArea 2s ease-out 1s forwards;
                  }
                  @keyframes drawPath {
                      to { stroke-dashoffset: 0; }
                  }
                  @keyframes fadeInArea {
                      to { opacity: 0.15; }
                  }
                `}
              </style>
              
              {/* Grid Lines */}
              <line stroke="#e1e3e4" strokeWidth="1" x1="0" x2="800" y1="250" y2="250"></line>
              <line stroke="#e1e3e4" strokeWidth="1" x1="0" x2="800" y1="175" y2="175"></line>
              <line stroke="#e1e3e4" strokeWidth="1" x1="0" x2="800" y1="100" y2="100"></line>
              <line stroke="#e1e3e4" strokeWidth="1" x1="0" x2="800" y1="25" y2="25"></line>
              
              {/* Optimistic Area (Shaded Band) */}
              <path className="chart-area" d="M 0 250 Q 200 230, 400 160 T 800 20 L 800 250 Z" fill="#006d42"></path>
              {/* Optimistic Line */}
              <path className="chart-path" d="M 0 250 Q 200 230, 400 160 T 800 20" fill="none" stroke="#006d42" strokeWidth="2"></path>
              
              {/* Expected Area (Shaded Band) */}
              <path className="chart-area" d="M 0 250 Q 200 240, 400 180 T 800 70 L 800 250 Z" fill="#002653"></path>
              {/* Expected Line */}
              <path className="chart-path" d="M 0 250 Q 200 240, 400 180 T 800 70" fill="none" stroke="#002653" strokeWidth="3"></path>
              
              {/* Conservative Area (Shaded Band) */}
              <path className="chart-area" d="M 0 250 Q 200 245, 400 210 T 800 140 L 800 250 Z" fill="#747780"></path>
              {/* Conservative Line */}
              <path className="chart-path" d="M 0 250 Q 200 245, 400 210 T 800 140" fill="none" stroke="#747780" strokeDasharray="6,4" strokeWidth="2"></path>
            </svg>
            
            {/* X-Axis Labels */}
            <div className="absolute bottom-[-24px] left-0 w-full flex justify-between px-2">
              <span className="font-label-sm text-on-surface-variant">Today</span>
              <span className="font-label-sm text-on-surface-variant">Year {Math.round(duration / 3)}</span>
              <span className="font-label-sm text-on-surface-variant">Year {Math.round((duration * 2) / 3)}</span>
              <span className="font-label-sm text-on-surface-variant">Year {duration}</span>
            </div>
          </div>
        </section>

        {/* Scenario Breakdown Details */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant flex flex-col gap-1">
            <span className="font-label-md text-secondary uppercase">Optimistic ({(expectedRate + 2).toFixed(1)}% CAGR)</span>
            <span className="font-headline-sm text-on-surface">₹{formatCurrency(optimisticValue)}</span>
            <p className="font-body-md text-on-surface-variant text-sm">Assuming strong market performance.</p>
          </div>
          
          <div className="bg-primary-container rounded-xl p-4 border border-primary-container flex flex-col gap-1 relative overflow-hidden">
            {/* Highlighted Card */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-primary-fixed opacity-10 rounded-bl-full"></div>
            <span className="font-label-md text-primary-fixed uppercase">Expected ({expectedRate.toFixed(1)}% CAGR)</span>
            <span className="font-headline-sm text-on-primary">₹{formatCurrency(futureValue)}</span>
            <p className="font-body-md text-on-primary-container text-sm">Based on historical average returns.</p>
          </div>
          
          <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant flex flex-col gap-1">
            <span className="font-label-md text-outline uppercase">Conservative ({Math.max(expectedRate - 2, 0).toFixed(1)}% CAGR)</span>
            <span className="font-headline-sm text-on-surface">₹{formatCurrency(conservativeValue)}</span>
            <p className="font-body-md text-on-surface-variant text-sm">A protective stance against volatility.</p>
          </div>
        </section>

        {/* Breakdown Section */}
        <section className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant flex flex-col gap-2">
          <div className="flex items-start gap-4 p-4 border-b border-outline-variant">
            <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0"></div>
            <div>
              <p className="font-label-sm text-on-surface-variant uppercase mb-1">Total Invested (Inc. current)</p>
              <p className="font-headline-sm text-on-surface">₹{formatCurrency(totalInvested)}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 p-4">
            <div className="w-2 h-2 rounded-full bg-secondary mt-2 shrink-0"></div>
            <div>
              <p className="font-label-sm text-on-surface-variant uppercase mb-1">Wealth Gained</p>
              <p className="font-headline-sm text-on-surface">₹{formatCurrency(wealthGained)}</p>
            </div>
          </div>
        </section>

        {/* Disclaimer & Reassurance */}
        <section className="bg-surface-container-low rounded-xl p-4 flex gap-4 items-start mt-4">
          <Info className="text-outline shrink-0 mt-1" size={24} />
          <p className="font-body-md text-on-surface-variant text-sm leading-relaxed">
            This is an educational simulation based on historical data and does not guarantee future results. Markets fluctuate, but steady, disciplined investing historically builds resilience. Your capital is monitored carefully.
          </p>
        </section>

        {/* Action Buttons */}
        <section className="flex flex-col md:flex-row gap-4 mt-6">
          <button 
            onClick={() => navigate('/portfolio/goals')}
            className="flex-1 bg-primary text-on-primary h-14 rounded-full font-label-md flex items-center justify-center hover:bg-primary/90 transition-colors"
          >
            Save This Plan
          </button>
          <button 
            onClick={() => navigate(-1)}
            className="flex-1 bg-surface-container-lowest text-primary border border-primary h-14 rounded-full font-label-md flex items-center justify-center hover:bg-surface-container-low transition-colors"
          >
            Adjust Parameters
          </button>
        </section>

      </main>
    </div>
  );
}
