import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { Search, User, ArrowUp, TrendingUp, Info, Percent, Wallet, PlusCircle, Loader2 } from "lucide-react";

export function PerformanceHistory() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const headers: HeadersInit = {};
        if (session) headers['Authorization'] = `Bearer ${session.access_token}`;
        
        const res = await fetch('http://localhost:3000/api/portfolio/performance/me', { headers });
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="bg-background text-on-background antialiased min-h-screen flex flex-col font-body-md relative">
      {/* TopAppBar */}
      <header className="bg-surface dark:bg-surface-dim w-full sticky top-0 z-50 border-b border-outline-variant dark:border-outline">
        <div className="flex items-center justify-between px-4 py-3 w-full max-w-7xl mx-auto">
          <button className="text-primary dark:text-primary-fixed hover:bg-surface-container-low dark:hover:bg-surface-container-highest transition-colors active:scale-95 duration-100 p-2 rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center">
            <Search />
          </button>
          <h1 className="font-headline-md text-primary dark:text-primary-fixed tracking-tight cursor-pointer" onClick={() => navigate('/')}>
            SahaVest
          </h1>
          <button className="text-primary dark:text-primary-fixed hover:bg-surface-container-low dark:hover:bg-surface-container-highest transition-colors active:scale-95 duration-100 p-2 rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center">
            <User />
          </button>
        </div>
        {/* Desktop Nav Cluster (Hidden on mobile) */}
        <nav className="hidden md:flex justify-center space-x-6 py-2 border-t border-outline-variant/30">
          <a className="font-label-md text-on-surface-variant hover:text-primary transition-colors py-2 px-4 rounded-full hover:bg-surface-container-low" href="#">Dashboard</a>
          <a className="font-label-md text-primary bg-surface-container-low py-2 px-4 rounded-full" href="#">Portfolio</a>
          <a className="font-label-md text-on-surface-variant hover:text-primary transition-colors py-2 px-4 rounded-full hover:bg-surface-container-low" href="#">Protection</a>
          <a className="font-label-md text-on-surface-variant hover:text-primary transition-colors py-2 px-4 rounded-full hover:bg-surface-container-low" href="#">Profile</a>
        </nav>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-6 pb-32">
        
        {/* Page Header */}
        {loading ? (
           <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" size={32} /></div>
        ) : (
        <div className="mb-8 flex flex-col items-center justify-center text-center">
          <h2 className="font-body-md text-on-surface-variant mb-2">Current Net Worth</h2>
          <div className="font-display-lg-mobile md:font-display-lg text-primary">₹{(data?.currentNetWorth || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
          <div className="flex items-center mt-2 text-secondary">
            <ArrowUp size={16} className="mr-1" />
            <span className="font-label-md">₹{(data?.todayChange?.value || 0).toLocaleString('en-IN')} ({(data?.todayChange?.percentage || 0)}%) Today</span>
          </div>
        </div>
        )}

        {/* Performance Chart Section */}
        <section className="bg-surface-container-lowest rounded-xl border border-outline-variant/50 p-4 mb-8 shadow-sm relative overflow-hidden">
          {/* Time Range Selectors */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-headline-sm text-on-surface">Performance History</h3>
            <div className="flex bg-surface-container p-1 rounded-full space-x-1">
              <button className="font-label-sm min-w-[44px] min-h-[32px] px-3 py-1 rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors">1M</button>
              <button className="font-label-sm min-w-[44px] min-h-[32px] px-3 py-1 rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors">3M</button>
              <button className="font-label-sm min-w-[44px] min-h-[32px] px-3 py-1 rounded-full bg-primary text-on-primary shadow-sm transition-colors">1Y</button>
              <button className="font-label-sm min-w-[44px] min-h-[32px] px-3 py-1 rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors">All</button>
            </div>
          </div>
          
          {/* SVG Line Chart (Simulated) */}
          <div className="w-full h-64 md:h-80 relative mb-4">
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 800 300">
              <defs>
                <linearGradient id="blueGradient" x1="0%" x2="0%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#002653" stopOpacity="0.15"></stop>
                  <stop offset="100%" stopColor="#002653" stopOpacity="0"></stop>
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line stroke="#e1e3e4" strokeWidth="1" strokeDasharray="4" x1="40" x2="780" y1="50" y2="50"></line>
              <line stroke="#e1e3e4" strokeWidth="1" strokeDasharray="4" x1="40" x2="780" y1="125" y2="125"></line>
              <line stroke="#e1e3e4" strokeWidth="1" strokeDasharray="4" x1="40" x2="780" y1="200" y2="200"></line>
              <line stroke="#c4c6d0" strokeWidth="1" x1="40" x2="780" y1="275" y2="275"></line>
              
              {/* Y-Axis Labels */}
              <text fill="#747780" fontSize="10" fontFamily="'Inter', sans-serif" textAnchor="end" x="30" y="55">25L</text>
              <text fill="#747780" fontSize="10" fontFamily="'Inter', sans-serif" textAnchor="end" x="30" y="130">20L</text>
              <text fill="#747780" fontSize="10" fontFamily="'Inter', sans-serif" textAnchor="end" x="30" y="205">15L</text>
              
              {/* X-Axis Labels */}
              <text fill="#747780" fontSize="10" fontFamily="'Inter', sans-serif" textAnchor="middle" x="80" y="295">Jan</text>
              <text fill="#747780" fontSize="10" fontFamily="'Inter', sans-serif" textAnchor="middle" x="220" y="295">Apr</text>
              <text fill="#747780" fontSize="10" fontFamily="'Inter', sans-serif" textAnchor="middle" x="360" y="295">Jul</text>
              <text fill="#747780" fontSize="10" fontFamily="'Inter', sans-serif" textAnchor="middle" x="500" y="295">Oct</text>
              <text fill="#747780" fontSize="10" fontFamily="'Inter', sans-serif" textAnchor="middle" x="640" y="295">Dec</text>
              <text fill="#747780" fontSize="10" fontFamily="'Inter', sans-serif" textAnchor="middle" x="760" y="295">Now</text>
              
              {/* Data Area */}
              <path fill="url(#blueGradient)" d="M40,250 Q100,240 150,220 T250,180 T350,190 T450,140 T550,110 T650,80 T760,40 L760,275 L40,275 Z"></path>
              
              {/* Data Line */}
              <path stroke="#002653" strokeWidth="2" fill="none" d="M40,250 Q100,240 150,220 T250,180 T350,190 T450,140 T550,110 T650,80 T760,40"></path>
              
              {/* Current Point Indicator */}
              <circle cx="760" cy="40" fill="#002653" r="6" stroke="#ffffff" strokeWidth="2"></circle>
              
              {/* Interactive Hover Line (Simulated active state) */}
              <line stroke="#747780" strokeDasharray="2" strokeWidth="1" x1="550" x2="550" y1="30" y2="275"></line>
              <circle cx="550" cy="110" fill="#002653" r="4"></circle>
              <g transform="translate(500, 10)">
                <rect fill="#191c1d" height="24" rx="4" width="100"></rect>
                <text fill="#ffffff" fontFamily="'Inter', sans-serif" fontSize="10" fontWeight="600" textAnchor="middle" x="50" y="16">₹{(data?.history?.[4] || 2140000).toLocaleString('en-IN')}</text>
              </g>
            </svg>
          </div>
        </section>

        {/* Key Metrics Bento Grid */}
        <h3 className="font-headline-sm text-on-surface mb-4">Portfolio Highlights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Metric Card 1 */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/50 p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <span className="font-label-md text-on-surface-variant flex items-center">
                <TrendingUp size={18} className="mr-2" />
                Absolute Gain (1Y)
              </span>
              <button aria-label="Info" className="text-outline hover:text-primary transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2">
                <Info size={18} />
              </button>
            </div>
            <div className="font-headline-sm text-on-surface mb-1">₹4,20,500</div>
            <div className="font-body-md text-secondary">Wealth generated</div>
          </div>

          {/* Metric Card 2 */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/50 p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <span className="font-label-md text-on-surface-variant flex items-center">
                <Percent size={18} className="mr-2" />
                Percentage Change
              </span>
              <button aria-label="Info" className="text-outline hover:text-primary transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2">
                <Info size={18} />
              </button>
            </div>
            <div className="font-headline-sm text-on-surface mb-1">+ 20.6%</div>
            <div className="font-body-md text-secondary">Annualized return</div>
          </div>

          {/* Metric Card 3 */}
          <div className="bg-primary text-on-primary rounded-xl p-6 shadow-sm flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-container/20 to-transparent pointer-events-none"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="font-label-md text-primary-fixed-dim flex items-center">
                  <Wallet size={18} className="mr-2" />
                  Total Invested
                </span>
              </div>
              <div className="font-headline-sm mb-1">₹20,36,390</div>
              <div className="font-body-md text-primary-fixed-dim">Principal amount</div>
            </div>
          </div>

        </div>

        {/* Action Button */}
        <div className="mt-8 flex justify-center">
          <button className="bg-primary hover:bg-primary-container text-on-primary font-label-md h-[48px] px-8 rounded-full transition-colors flex items-center shadow-sm">
            <PlusCircle size={18} className="mr-2" />
            Invest More
          </button>
        </div>

      </main>
    </div>
  );
}
