import React from 'react';
import { ArrowLeft, MoreVertical, Search, TrendingUp, ChevronRight, ArrowUp, ArrowDown, ChevronDown } from "lucide-react";
import { useParams, useNavigate } from 'react-router-dom';

export function FundDetail() {
  const { type } = useParams();
  const navigate = useNavigate();

  // Format type string
  const formatType = (t: string | undefined) => {
    if (!t) return 'Holdings';
    if (t.toLowerCase() === 'mf') return 'Mutual Funds Holdings';
    return t.charAt(0).toUpperCase() + t.slice(1) + ' Holdings';
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col antialiased">
      {/* TopAppBar */}
      <header className="w-full sticky top-0 z-50 bg-surface border-b border-outline-variant">
        <div className="flex items-center justify-between px-4 py-3 w-full max-w-7xl mx-auto h-[64px]">
          <button 
            onClick={() => navigate(-1)} 
            aria-label="Go back" 
            className="flex items-center justify-center min-w-[44px] min-h-[44px] text-primary hover:bg-surface-container-low transition-colors rounded-full active:scale-95 duration-100"
          >
            <ArrowLeft className="text-[24px]" />
          </button>
          <h1 className="font-headline-md text-primary tracking-tight truncate flex-1 text-center px-4">
            {formatType(type)}
          </h1>
          <button 
            aria-label="Account" 
            className="flex items-center justify-center min-w-[44px] min-h-[44px] text-primary hover:bg-surface-container-low transition-colors rounded-full active:scale-95 duration-100"
          >
            <MoreVertical className="text-[24px]" />
          </button>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 pb-24 md:pb-6 pt-4 md:pt-6 flex flex-col gap-6">
        
        {/* Search and Filter Bar */}
        <div className="w-full relative sticky top-[64px] z-40 bg-background pt-2 pb-4">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input 
              className="w-full h-12 pl-12 pr-4 bg-surface rounded-full border border-outline-variant text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow placeholder:text-on-surface-variant" 
              placeholder="Search instruments..." 
              type="text" 
            />
          </div>
          
          {/* Quick Filters */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
            <button className="px-4 py-2 min-h-[36px] bg-secondary-container text-on-secondary-container rounded-full font-label-md whitespace-nowrap border border-transparent">
              All
            </button>
            <button className="px-4 py-2 min-h-[36px] bg-surface text-on-surface-variant rounded-full font-label-md whitespace-nowrap border border-outline-variant hover:bg-surface-container-low transition-colors">
              Large Cap
            </button>
            <button className="px-4 py-2 min-h-[36px] bg-surface text-on-surface-variant rounded-full font-label-md whitespace-nowrap border border-outline-variant hover:bg-surface-container-low transition-colors">
              Mid Cap
            </button>
            <button className="px-4 py-2 min-h-[36px] bg-surface text-on-surface-variant rounded-full font-label-md whitespace-nowrap border border-outline-variant hover:bg-surface-container-low transition-colors">
              Small Cap
            </button>
          </div>
        </div>

        {/* Portfolio Summary Card (Glassmorphism inspired) */}
        <div className="w-full bg-surface-container-low rounded-xl p-5 border border-outline-variant/50 relative overflow-hidden shadow-sm">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary-container/10 rounded-full blur-2xl"></div>
          <div class="absolute -left-10 -bottom-10 w-32 h-32 bg-secondary-container/20 rounded-full blur-xl"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="font-body-md text-on-surface-variant mb-1">Total {type === 'equity' ? 'Equity' : 'Asset'} Value</h2>
              <p className="font-display-lg-mobile md:font-display-lg text-primary">₹14,85,230.50</p>
            </div>
            <div className="text-left md:text-right">
              <h2 className="font-body-md text-on-surface-variant mb-1">Day's Change</h2>
              <p className="font-headline-sm text-secondary flex items-center md:justify-end gap-1">
                <TrendingUp className="text-[20px]" />
                +₹12,450.00 (+0.85%)
              </p>
            </div>
          </div>
        </div>

        {/* Holdings List */}
        <div className="w-full bg-surface rounded-xl border border-outline-variant/30 overflow-hidden shadow-sm">
          {/* List Header (Desktop Only) */}
          <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-outline-variant/50 bg-surface-container-low/50">
            <div className="col-span-5 font-label-sm text-on-surface-variant uppercase tracking-wider">Instrument</div>
            <div className="col-span-3 text-right font-label-sm text-on-surface-variant uppercase tracking-wider">Qty &amp; Avg. Price</div>
            <div className="col-span-4 text-right font-label-sm text-on-surface-variant uppercase tracking-wider">Current Value &amp; Change</div>
          </div>

          {/* Holding Item 1 */}
          <div 
            onClick={() => navigate(`/fund/${type}/HDFC`)} 
            className="group border-b border-outline-variant/30 last:border-0 hover:bg-surface-container-low transition-colors cursor-pointer"
          >
            <div className="p-4 flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-4 md:items-center">
              <div className="md:col-span-5 flex items-center justify-between md:justify-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-headline-sm">H</div>
                  <div>
                    <h3 className="font-headline-sm text-on-surface">HDFC Bank Ltd.</h3>
                    <p className="font-body-md text-on-surface-variant md:hidden">150 Qty · Avg: ₹1,450.00</p>
                  </div>
                </div>
                <ChevronRight className="text-outline md:hidden" />
              </div>
              <div className="hidden md:block md:col-span-3 text-right">
                <p className="font-body-md text-on-surface">150</p>
                <p className="font-label-sm text-on-surface-variant">Avg. ₹1,450.00</p>
              </div>
              <div className="flex justify-between md:col-span-4 md:text-right items-end md:items-center">
                <div className="md:hidden">
                  <p className="font-label-sm text-on-surface-variant uppercase">Value &amp; Change</p>
                </div>
                <div className="text-right">
                  <p className="font-headline-sm text-on-surface">₹2,25,000.00</p>
                  <p className="font-body-md text-secondary flex items-center justify-end gap-1">
                    <ArrowUp className="text-[16px]" />
                    ₹1,200 (+0.54%)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Holding Item 2 */}
          <div 
            onClick={() => navigate(`/fund/${type}/RELIANCE`)} 
            className="group border-b border-outline-variant/30 last:border-0 hover:bg-surface-container-low transition-colors cursor-pointer"
          >
            <div className="p-4 flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-4 md:items-center">
              <div className="md:col-span-5 flex items-center justify-between md:justify-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-headline-sm">R</div>
                  <div>
                    <h3 className="font-headline-sm text-on-surface">Reliance Industries</h3>
                    <p className="font-body-md text-on-surface-variant md:hidden">50 Qty · Avg: ₹2,100.50</p>
                  </div>
                </div>
                <ChevronRight className="text-outline md:hidden" />
              </div>
              <div className="hidden md:block md:col-span-3 text-right">
                <p className="font-body-md text-on-surface">50</p>
                <p className="font-label-sm text-on-surface-variant">Avg. ₹2,100.50</p>
              </div>
              <div className="flex justify-between md:col-span-4 md:text-right items-end md:items-center">
                <div className="md:hidden">
                  <p className="font-label-sm text-on-surface-variant uppercase">Value &amp; Change</p>
                </div>
                <div className="text-right">
                  <p className="font-headline-sm text-on-surface">₹1,05,025.00</p>
                  <p className="font-body-md text-error flex items-center justify-end gap-1">
                    <ArrowDown className="text-[16px]" />
                    -₹450 (-0.42%)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Holding Item 3 */}
          <div 
            onClick={() => navigate(`/fund/${type}/INFY`)} 
            className="group border-b border-outline-variant/30 last:border-0 hover:bg-surface-container-low transition-colors cursor-pointer"
          >
            <div className="p-4 flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-4 md:items-center">
              <div className="md:col-span-5 flex items-center justify-between md:justify-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-headline-sm">I</div>
                  <div>
                    <h3 className="font-headline-sm text-on-surface">Infosys Ltd.</h3>
                    <p className="font-body-md text-on-surface-variant md:hidden">200 Qty · Avg: ₹1,250.00</p>
                  </div>
                </div>
                <ChevronRight className="text-outline md:hidden" />
              </div>
              <div className="hidden md:block md:col-span-3 text-right">
                <p className="font-body-md text-on-surface">200</p>
                <p className="font-label-sm text-on-surface-variant">Avg. ₹1,250.00</p>
              </div>
              <div className="flex justify-between md:col-span-4 md:text-right items-end md:items-center">
                <div className="md:hidden">
                  <p className="font-label-sm text-on-surface-variant uppercase">Value &amp; Change</p>
                </div>
                <div className="text-right">
                  <p className="font-headline-sm text-on-surface">₹3,04,000.00</p>
                  <p className="font-body-md text-secondary flex items-center justify-end gap-1">
                    <ArrowUp className="text-[16px]" />
                    ₹5,200 (+1.74%)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Load More */}
          <div className="p-4 flex justify-center border-t border-outline-variant/30">
            <button className="text-primary font-label-md hover:underline flex items-center gap-1 min-h-[44px]">
              Load More Holdings
              <ChevronDown className="text-[18px]" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
