import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Info } from "lucide-react";

export function HoldingDetail() {
  const navigate = useNavigate();
  const { holdingId } = useParams();

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md antialiased pb-[80px] md:pb-0">
      {/* TopAppBar */}
      <header className="bg-surface dark:bg-surface-dim w-full sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3 w-full max-w-7xl mx-auto">
          <button 
            onClick={() => navigate(-1)}
            aria-label="Go Back" 
            className="w-[44px] h-[44px] flex items-center justify-center text-on-surface-variant dark:text-on-surface-variant hover:bg-surface-container-low dark:hover:bg-surface-container-highest transition-colors rounded-full active:scale-95 duration-100"
          >
            <ArrowLeft />
          </button>
          <h1 className="font-headline-md text-primary dark:text-primary-fixed tracking-tight truncate px-2">
            Reliance Industries
          </h1>
          <div className="w-[44px] h-[44px]"></div> {/* Spacer for alignment */}
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-8 grid grid-cols-4 md:grid-cols-8 gap-4 md:gap-6 md:grid-flow-row-dense">
        
        {/* Header Info Card */}
        <div className="col-span-4 md:col-span-8 bg-surface-container-lowest rounded-xl p-4 md:p-6 border border-outline-variant shadow-sm flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-primary-container text-on-primary-container font-label-sm px-2 py-1 rounded-full">EQ</span>
              <span className="text-on-surface-variant font-label-md">RELIANCE</span>
            </div>
            <h2 className="font-display-lg-mobile md:font-display-lg text-primary mb-1">₹2,845.30</h2>
            <div className="flex items-center gap-2">
              <span className="text-secondary font-label-md flex items-center">
                <TrendingUp size={16} className="mr-1" />
                +45.20 (1.61%)
              </span>
              <span className="text-outline font-label-sm">ISIN: INE002A01018</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => navigate('/trade/intent', { state: { holding_id: 'RELIANCE', txn_type: 'sell', name: 'Reliance Industries', price: 2845.30 } })}
              className="h-[48px] px-6 bg-surface-container hover:bg-surface-container-high transition-colors text-primary font-label-md rounded-lg flex-1 md:flex-none"
            >
              Sell
            </button>
            <button 
              onClick={() => navigate('/trade/intent', { state: { holding_id: 'RELIANCE', txn_type: 'buy', name: 'Reliance Industries', price: 2845.30 } })}
              className="h-[48px] px-6 bg-primary hover:bg-primary-container transition-colors text-on-primary font-label-md rounded-lg flex-1 md:flex-none shadow-sm"
            >
              Buy
            </button>
          </div>
        </div>

        {/* Key Stats Grid */}
        <div className="col-span-4 md:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-surface-container-lowest rounded-xl p-3 md:p-4 border border-outline-variant">
            <p className="text-on-surface-variant font-label-sm mb-2">Quantity</p>
            <p className="font-headline-sm text-on-surface">150</p>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-3 md:p-4 border border-outline-variant">
            <p className="text-on-surface-variant font-label-sm mb-2">Avg. Cost</p>
            <p className="font-headline-sm text-on-surface">₹2,610.50</p>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-3 md:p-4 border border-outline-variant">
            <p className="text-on-surface-variant font-label-sm mb-2">Current Value</p>
            <p className="font-headline-sm text-on-surface">₹4,26,795</p>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-3 md:p-4 border border-outline-variant bg-secondary-container/10">
            <p className="text-on-surface-variant font-label-sm mb-2">Total P&L</p>
            <p className="font-headline-sm text-secondary">+₹35,220 (9.0%)</p>
          </div>
        </div>

        {/* Performance Chart Area */}
        <div className="col-span-4 md:col-span-5 bg-surface-container-lowest rounded-xl p-4 border border-outline-variant shadow-sm h-[300px] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-headline-sm text-primary">Performance</h3>
            <div className="flex gap-1 bg-surface-container-low p-1 rounded-md">
              <button className="px-2 py-1 font-label-sm rounded text-on-surface-variant hover:bg-surface-container">1D</button>
              <button className="px-2 py-1 font-label-sm rounded bg-surface-container text-primary">1M</button>
              <button className="px-2 py-1 font-label-sm rounded text-on-surface-variant hover:bg-surface-container">1Y</button>
              <button className="px-2 py-1 font-label-sm rounded text-on-surface-variant hover:bg-surface-container">ALL</button>
            </div>
          </div>
          <div className="flex-grow w-full relative flex items-center justify-center bg-surface-container-low rounded-lg overflow-hidden border border-outline-variant/30">
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 19px, var(--tw-colors-outline-variant) 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, var(--tw-colors-outline-variant) 20px)', backgroundSize: '20px 20px' }}></div>
            <svg className="w-full h-full absolute inset-0" preserveAspectRatio="none" viewBox="0 0 100 100">
              <path d="M0,80 Q20,70 40,50 T80,30 T100,10" fill="none" stroke="var(--tw-colors-primary)" strokeWidth="2" vectorEffect="non-scaling-stroke"></path>
              <path d="M0,100 L0,80 Q20,70 40,50 T80,30 T100,10 L100,100 Z" fill="var(--tw-colors-primary-container)" opacity="0.1"></path>
            </svg>
            <span className="text-on-surface-variant font-label-md opacity-50">Chart Visualization Area</span>
          </div>
        </div>

        {/* Insights / News Panel */}
        <div className="col-span-4 md:col-span-3 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm flex flex-col h-[300px]">
          <div className="p-4 border-b border-outline-variant">
            <h3 className="font-headline-sm text-primary">Insights & News</h3>
          </div>
          <div className="flex-grow overflow-y-auto p-4 space-y-3">
            {/* News Item */}
            <a className="block p-3 rounded-lg hover:bg-surface-container-low transition-colors group" href="#">
              <div className="flex justify-between items-start mb-1">
                <span className="font-label-sm text-on-surface-variant">2 hrs ago • Reuters</span>
              </div>
              <p className="font-body-md text-on-surface line-clamp-2 group-hover:text-primary transition-colors">Reliance announces major investment in renewable energy sector, aiming for net-zero by 2035.</p>
            </a>
            
            <div className="w-full h-[1px] bg-outline-variant mx-3 w-auto"></div>
            
            {/* News Item */}
            <a className="block p-3 rounded-lg hover:bg-surface-container-low transition-colors group" href="#">
              <div className="flex justify-between items-start mb-1">
                <span className="font-label-sm text-on-surface-variant">5 hrs ago • Bloomberg</span>
              </div>
              <p className="font-body-md text-on-surface line-clamp-2 group-hover:text-primary transition-colors">Quarterly earnings report exceeds expectations driven by retail and telecom segments.</p>
            </a>
          </div>
        </div>

        {/* Fallback State Example (Hidden by default, shown for demonstration) */}
        <div className="col-span-4 md:col-span-8 bg-surface-container-lowest rounded-xl border border-outline-variant p-8 flex flex-col items-center justify-center text-center mt-4 hidden">
          <div className="w-[64px] h-[64px] bg-surface-container rounded-full flex items-center justify-center mb-4">
            <Info size={32} className="text-outline" />
          </div>
          <h3 className="font-headline-sm text-on-surface mb-2">Extended Details Unavailable</h3>
          <p className="font-body-md text-on-surface-variant max-w-md">We couldn't retrieve full fundamental data or recent news for this specific instrument at this time. Basic holding information is displayed above.</p>
        </div>

      </main>
    </div>
  );
}
