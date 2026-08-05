import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { ArrowLeft, MoreVertical, Search, TrendingUp, ChevronRight, ArrowUp, ArrowDown, ChevronDown, Loader2 } from "lucide-react";

export function EquityHoldings() {
  const navigate = useNavigate();
  const [holdings, setHoldings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHoldings() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        let query = supabase.from('holdings').select('*');
        if (session) {
           query = query.eq('user_id', session.user.id);
        } else {
           query = query.eq('user_id', '716691b9-939e-4118-aafb-9246a3923250');
        }
        
        const { data } = await query;
        if (data) {
           setHoldings(data.filter(h => h.asset_class?.toLowerCase().includes('eq')));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchHoldings();
  }, []);

  const hasHoldings = holdings.length > 0;
  const displayHoldings = hasHoldings ? holdings : [
    { id: 1, instrument_name: 'HDFC Bank Ltd.', quantity: 150, average_price: 1450.00, current_value: 232500.00, day_change_val: 1500, day_change_pct: 1.2 },
    { id: 2, instrument_name: 'Reliance Industries Ltd.', quantity: 50, average_price: 2450.00, current_value: 125000.00, day_change_val: -850, day_change_pct: -0.8 },
    { id: 3, instrument_name: 'Infosys Ltd.', quantity: 100, average_price: 1420.00, current_value: 145000.00, day_change_val: 3000, day_change_pct: 2.1 },
  ];

  const totalValue = hasHoldings 
    ? holdings.reduce((sum, h) => sum + (Number(h.current_value) || 0), 0) 
    : 1485230.50;

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col antialiased">
      {/* TopAppBar */}
      <header className="w-full sticky top-0 z-50 bg-surface dark:bg-surface-dim border-b border-outline-variant dark:border-outline">
        <div className="flex items-center justify-between px-4 py-3 w-full max-w-7xl mx-auto h-[64px]">
          <button 
            onClick={() => navigate(-1)}
            aria-label="Go back" 
            className="flex items-center justify-center min-w-[44px] min-h-[44px] text-primary dark:text-primary-fixed hover:bg-surface-container-low dark:hover:bg-surface-container-highest transition-colors rounded-full active:scale-95 duration-100"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="font-headline-md text-primary dark:text-primary-fixed tracking-tight truncate flex-1 text-center px-4">
            Equity Holdings
          </h1>
          <button 
            aria-label="Account" 
            className="flex items-center justify-center min-w-[44px] min-h-[44px] text-primary dark:text-primary-fixed hover:bg-surface-container-low dark:hover:bg-surface-container-highest transition-colors rounded-full active:scale-95 duration-100"
          >
            <MoreVertical size={24} />
          </button>
        </div>
      </header>
      
      {/* Main Content Canvas */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 pb-24 md:pb-6 pt-4 md:pt-6 flex flex-col gap-6">
        
        {/* Search and Filter Bar */}
        <div className="w-full relative sticky top-[72px] z-40 bg-background pt-2 pb-4">
          <div className="relative w-full">
            <Search size={24} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input 
              className="w-full h-12 pl-12 pr-4 bg-surface rounded-full border border-outline-variant font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow placeholder-on-surface-variant" 
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
        {loading ? (
          <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" size={32} /></div>
        ) : (
        <div className="w-full bg-surface-container-low rounded-xl p-5 border border-outline-variant/50 relative overflow-hidden shadow-sm">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary-container/10 rounded-full blur-2xl"></div>
          <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-secondary-container/20 rounded-full blur-xl"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="font-body-md text-on-surface-variant mb-1">Total Equity Value</h2>
              <p className="font-display-lg-mobile md:font-display-lg text-primary">₹{totalValue.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
            </div>
            <div className="text-left md:text-right">
              <h2 className="font-body-md text-on-surface-variant mb-1">Day's Change</h2>
              <p className="font-headline-sm text-secondary flex items-center md:justify-end gap-1">
                <TrendingUp size={20} />
                +₹12,450.00 (+0.85%)
              </p>
            </div>
          </div>
        </div>
        )}
        
        {/* Holdings List */}
        <div className="w-full bg-surface rounded-xl border border-outline-variant/30 overflow-hidden shadow-sm">
          {/* List Header (Desktop Only) */}
          <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-outline-variant/50 bg-surface-container-low/50">
            <div className="col-span-5 font-label-sm text-on-surface-variant uppercase tracking-wider">Instrument</div>
            <div className="col-span-3 text-right font-label-sm text-on-surface-variant uppercase tracking-wider">Qty & Avg. Price</div>
            <div className="col-span-4 text-right font-label-sm text-on-surface-variant uppercase tracking-wider">Current Value & Change</div>
          </div>
          
          {/* Dynamic Holdings List */}
          {displayHoldings.map((h, i) => {
            const isPositive = (h.day_change_val || 0) >= 0;
            return (
              <div 
                key={h.id || i} 
                onClick={() => navigate(`/portfolio/holding/${h.symbol || (h.instrument_name === 'Reliance Industries Ltd.' ? 'RELIANCE' : h.instrument_name === 'Infosys Ltd.' ? 'INFY' : 'HDFCBANK')}`)}
                className="group border-b border-outline-variant/30 last:border-0 hover:bg-surface-container-low transition-colors cursor-pointer"
              >
                <div className="p-4 flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-4 md:items-center">
                  <div className="md:col-span-5 flex items-center justify-between md:justify-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-headline-sm">
                        {h.instrument_name ? h.instrument_name.charAt(0).toUpperCase() : 'E'}
                      </div>
                      <div>
                        <h3 className="font-headline-sm text-on-surface truncate max-w-[200px] md:max-w-xs">{h.instrument_name}</h3>
                        <p className="font-body-md text-on-surface-variant md:hidden">
                          {h.quantity} Qty · Avg: ₹{Number(h.average_price || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Desktop Only Fields */}
                  <div className="hidden md:block col-span-3 text-right">
                    <p className="font-body-md text-on-surface">{h.quantity}</p>
                    <p className="font-body-md text-on-surface-variant">₹{Number(h.average_price || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</p>
                  </div>
                  
                  <div className="md:col-span-4 flex justify-between md:justify-end items-center md:gap-4 w-full">
                    {/* Mobile Only: Value and Change grouped */}
                    <div className="flex flex-col md:items-end">
                      <p className="font-headline-sm text-on-surface text-left md:text-right">
                        ₹{Number(h.current_value || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}
                      </p>
                      <p className={`font-label-md flex items-center gap-1 ${isPositive ? 'text-secondary' : 'text-error'}`}>
                        {isPositive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                        ₹{Math.abs(h.day_change_val || 0).toLocaleString('en-IN')} ({Math.abs(h.day_change_pct || 0).toFixed(2)}%)
                      </p>
                    </div>
                    <ChevronRight size={20} className="text-on-surface-variant opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Load More */}
          <div className="p-4 flex justify-center border-t border-outline-variant/30">
            <button className="text-primary font-label-md hover:underline flex items-center gap-1 min-h-[44px]">
              Load More Holdings
              <ChevronDown size={18} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
