import { Header } from '../../components/common/Header';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, User, Link as LinkIcon, TrendingUp, Shield, 
  ShieldCheck, Compass, ArrowUp, Landmark, Gem, Minus, AlertTriangle, Bell, ChevronRight
} from "lucide-react";
import { supabase } from '../../lib/supabaseClient';

export function Dashboard() {
  const navigate = useNavigate();
  // Toggle for testing both states
  const [hasLinkedAccounts, setHasLinkedAccounts] = useState(true);
  const [exposureData, setExposureData] = useState<{
    totalValue: number;
    sectorBreakdown: any[];
    assetClassBreakdown?: any[];
    flags: string[];
  } | null>(null);

  useEffect(() => {
    async function loadExposure() {
      if (!hasLinkedAccounts) return;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const headers: HeadersInit = {};
        if (session) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }
        
        const res = await fetch('/api/portfolio/exposure/me', {
          headers
        });
        const data = await res.json();
        setExposureData(data);
      } catch (err) {
        console.error(err);
      }
    }
    loadExposure();
  }, [hasLinkedAccounts]);

  if (!hasLinkedAccounts) {
    return (
      <div className="bg-surface text-on-background min-h-screen flex flex-col">
        {/* TopAppBar */}
        <header className="w-full sticky top-0 z-50 bg-surface border-b border-outline-variant flat no-shadows">
          <div className="flex items-center justify-between px-4 py-3 w-full max-w-7xl mx-auto">
            <button aria-label="Search" className="text-primary hover:bg-surface-container-low transition-colors active:scale-95 duration-100 p-2 rounded-full">
              <Search />
            </button>
            <Header />
            <div className="flex gap-2">
              <button onClick={() => navigate('/trust/alerts')} aria-label="Alerts" className="text-primary hover:bg-surface-container-low transition-colors active:scale-95 duration-100 p-2 rounded-full relative">
                <Bell />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full"></span>
              </button>
              <button onClick={() => navigate('/profile')} aria-label="Account" className="text-primary hover:bg-surface-container-low transition-colors active:scale-95 duration-100 p-2 rounded-full">
                <User />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Canvas (Empty State) */}
        <main className="flex-grow flex flex-col items-center justify-center p-4 max-w-md mx-auto text-center w-full pb-32 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="mb-8 w-48 h-48 rounded-full bg-surface-container-low flex items-center justify-center shadow-sm relative overflow-hidden border border-outline-variant/30">
            <img 
              alt="Secure Vault Illustration" 
              className="w-full h-full object-cover opacity-80" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAfqaayInJL_4WrbotpVPyVNxMUH_nXZIsgFmxiAMqXQT3UwWbNJijbLI9YJ792Bgw7OLseiFiPE7jgeW5wzEN--zeRRCqa3nynR3E8QW8NPQEgrXWVngcuFcUszeQIB28Bq3_n5eYWh97vZAsY4_lz_14sDHc6vmn6z-Q55Sf39gCaqzftANBipMSQ5XQ-CvvUZQACBo4kWrZlCFsAm65FqVjIMLIDe_fdMWpO6XXrIi13mntmYqbvSz3EFhmTq3vW2o2ecsEIlvE" 
            />
          </div>
          <h2 className="font-headline-sm text-on-surface mb-2">Welcome to Guided Prosperity</h2>
          <p className="font-body-md text-on-surface-variant mb-8 px-4">
            Your investment journey starts here. Link your accounts to see your unified net worth and gain crystal-clear insights.
          </p>
          <button 
            onClick={() => setHasLinkedAccounts(true)}
            className="bg-primary text-on-primary w-full h-[48px] rounded-lg font-label-md hover:opacity-90 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <LinkIcon size={20} />
            Link Accounts Now
          </button>
        </main>
      </div>
    );
  }

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  const totalNetWorth = exposureData?.totalValue ?? null;

  return (
    <div className="bg-surface text-on-surface pb-[80px] md:pb-0 min-h-screen">
      {/* TopAppBar */}
      <header className="w-full sticky top-0 z-50 bg-surface dark:bg-surface-dim border-b border-outline-variant dark:border-outline">
        <div className="flex items-center justify-between px-4 py-3 w-full max-w-7xl mx-auto transition-colors duration-200">
          <button aria-label="Search" className="text-primary hover:bg-surface-container-low dark:hover:bg-surface-container-highest transition-colors active:scale-95 duration-100 p-2 rounded-full">
            <Search />
          </button>
          <Header />
          <div className="flex gap-2">
            <button onClick={() => navigate('/trust/alerts')} aria-label="Alerts" className="text-primary hover:bg-surface-container-low transition-colors active:scale-95 duration-100 p-2 rounded-full relative">
              <Bell />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full"></span>
            </button>
            <button onClick={() => navigate('/profile')} aria-label="Account" className="text-primary dark:text-primary-fixed-dim hover:bg-surface-container-low dark:hover:bg-surface-container-highest transition-colors active:scale-95 duration-100 p-2 rounded-full">
              <User />
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
        {/* Exposure/Concentration Risk Alerts from API */}
        {exposureData && exposureData.flags.length > 0 && (
          <div className="bg-error-container/20 border border-error/30 p-4 rounded-xl flex flex-col gap-2">
            <div className="flex items-center gap-2 text-error">
              <AlertTriangle size={20} />
              <span className="font-headline-sm">Concentration Risk Detected</span>
            </div>
            <ul className="list-disc pl-5 font-body-sm text-on-surface-variant space-y-1">
              {exposureData.flags.map((flag, idx) => (
                <li key={idx}>{flag}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Net Worth Header Area (Clickable -> Performance Chart) */}
        <section 
          onClick={() => navigate('/portfolio/performance')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/portfolio/performance'); }}
          className="bg-surface-container-lowest rounded-2xl p-5 md:p-6 border border-outline-variant/60 shadow-sm hover:border-primary/40 hover:shadow-md transition-all cursor-pointer text-center space-y-2 group active:scale-[0.99] duration-150 relative overflow-hidden"
        >
          <div className="flex items-center justify-center gap-2">
            <span className="font-label-md text-on-surface-variant uppercase tracking-wider">Total Net Worth</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary bg-primary-container/40 px-2 py-0.5 rounded-full group-hover:bg-primary group-hover:text-on-primary transition-colors">
              Performance Chart <ChevronRight size={12} />
            </span>
          </div>
          <div className="font-display-lg-mobile md:font-display-lg text-primary tracking-tight font-bold group-hover:scale-[1.01] transition-transform">
            {totalNetWorth === null
              ? <span className="inline-block w-40 h-9 bg-surface-container animate-pulse rounded-lg align-middle" />
              : formatCurrency(totalNetWorth)
            }
          </div>
          <div className="flex items-center justify-center gap-2 text-secondary font-label-md">
            <span className="inline-flex items-center gap-1 bg-secondary-container/40 text-secondary px-2.5 py-1 rounded-full text-xs font-semibold">
              <TrendingUp size={14} /> {exposureData?.dayChangePercent != null ? `${exposureData.dayChangePercent > 0 ? '+' : ''}${exposureData.dayChangePercent.toFixed(1)}% (Today)` : 'Live Pricing'}
            </span>
            <span className="text-outline text-xs">•</span>
            <span className="text-outline text-xs">Live/delayed pricing (15–20 min)</span>
          </div>
        </section>

        {/* Donut Chart & Legend Bento */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Chart Card */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-4 flex flex-col items-center justify-center aspect-square md:aspect-auto">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Circle */}
                <circle cx="50" cy="50" fill="transparent" r="40" stroke="#f3f4f5" strokeWidth="12" className="dark:stroke-surface-container-highest" />
                
                {(() => {
                  if (!exposureData || !exposureData.assetClassBreakdown) return null;
                  let currentOffset = 0;
                  const circumference = 251.2;
                  
                  // Map of colors for different asset classes
                  const colorMap: Record<string, string> = {
                    'Equity': '#002653',
                    'Mutual Fund': '#002653',
                    'Debt': '#006d42',
                    'Bond': '#006d42',
                    'Gold': '#e89500',
                    'Cash': '#abc7ff',
                    'Other': '#7b828a'
                  };

                  return exposureData.assetClassBreakdown.map((item: any, idx: number) => {
                    const strokeLen = (item.percentage / 100) * circumference;
                    const strokeDasharray = `${strokeLen} ${circumference}`;
                    const strokeDashoffset = -currentOffset;
                    currentOffset += strokeLen;
                    
                    // Determine color
                    let color = colorMap['Other'];
                    for (const [key, val] of Object.entries(colorMap)) {
                      if (item.assetClass.includes(key)) {
                        color = val;
                        break;
                      }
                    }

                    return (
                      <circle 
                        key={idx}
                        className="transition-all duration-1000 ease-out" 
                        cx="50" cy="50" fill="transparent" r="40" 
                        stroke={color} 
                        strokeDasharray={strokeDasharray} 
                        strokeDashoffset={strokeDashoffset} 
                        strokeWidth="12" 
                      />
                    );
                  });
                })()}
              </svg>
              {/* Center Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="font-headline-sm text-primary">{exposureData?.assetClassBreakdown?.length || 0}</span>
                <span className="font-label-sm text-on-surface-variant">Asset Classes</span>
              </div>
            </div>
          </div>
          
          {/* Legend/Details */}
          <div className="flex flex-col gap-3 justify-center">
            {exposureData?.assetClassBreakdown?.map((item: any, idx: number) => {
              const colorMap: Record<string, string> = {
                'Equity': 'bg-primary',
                'Mutual Fund': 'bg-primary',
                'Debt': 'bg-secondary',
                'Bond': 'bg-secondary',
                'Gold': 'bg-[#e89500]',
                'Cash': 'bg-[#abc7ff]',
                'Other': 'bg-surface-variant'
              };
              
              let bgColor = colorMap['Other'];
              for (const [key, val] of Object.entries(colorMap)) {
                if (item.assetClass.includes(key)) {
                  bgColor = val;
                  break;
                }
              }

              return (
                <div key={idx} className="bg-surface-container-lowest rounded-lg p-3 border border-outline-variant flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${bgColor}`}></div>
                    <span className="font-body-md text-on-surface">{item.assetClass}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-headline-sm text-primary">{Math.round(item.percentage)}%</div>
                    <div className="font-label-sm text-on-surface-variant">{formatCurrency(item.value)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Quick Actions Row */}
        <section className="flex flex-wrap justify-center gap-4 py-3">
          <button 
            onClick={() => navigate('/fraud')}
            className="flex flex-col items-center gap-2 p-3 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm min-w-[100px] active:scale-95 transition-transform"
          >
            <div className="w-10 h-10 rounded-full bg-error-container text-on-error-container flex items-center justify-center">
              <Shield size={24} />
            </div>
            <span className="font-label-sm text-on-surface">Scam Checker</span>
          </button>
          
          <button 
            onClick={() => navigate('/trust/score')}
            className="flex flex-col items-center gap-2 p-3 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm min-w-[100px] active:scale-95 transition-transform"
          >
            <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
              <ShieldCheck size={24} />
            </div>
            <span className="font-label-sm text-on-surface">Trust Score</span>
          </button>
          
          <button 
            onClick={() => navigate('/twin/simulator')}
            className="flex flex-col items-center gap-2 p-3 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm min-w-[100px] active:scale-95 transition-transform"
          >
            <div className="w-10 h-10 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center">
              <Compass size={24} />
            </div>
            <span className="font-label-sm text-on-surface">Simulator</span>
          </button>
        </section>

        {/* Detailed Summary Cards */}
        <section className="space-y-4">
          <h3 className="font-headline-sm text-primary">Asset Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {exposureData?.assetClassBreakdown?.map((item: any, idx: number) => {
              // Select an icon and style based on asset class
              let Icon = TrendingUp;
              let iconStyle = "text-primary bg-primary-fixed";
              
              if (item.assetClass.includes('Debt') || item.assetClass.includes('Bond')) {
                Icon = Landmark;
                iconStyle = "text-secondary bg-secondary-fixed";
              } else if (item.assetClass.includes('Gold')) {
                Icon = Gem;
                iconStyle = "text-[#e89500] bg-[#e89500]/20";
              } else if (item.assetClass.includes('Cash')) {
                Icon = Landmark;
                iconStyle = "text-[#abc7ff] bg-[#abc7ff]/20";
              }

              return (
                <div 
                  key={idx}
                  onClick={() => navigate('/fund/equity')} // can be made dynamic later
                  className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant shadow-sm flex flex-col gap-3 cursor-pointer hover:bg-surface-container-low transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Icon size={24} className={`${iconStyle} p-1 rounded-full`} />
                    <h4 className="font-headline-sm text-on-surface">{item.assetClass}</h4>
                    <span className="ml-auto bg-surface-container-low px-2 py-1 rounded font-label-sm text-on-surface-variant">{Math.round(item.percentage)}%</span>
                  </div>
                  <div className="font-display-lg-mobile text-primary">{formatCurrency(item.value)}</div>
                  <div className="flex items-center gap-2 text-secondary font-label-sm">
                    <ArrowUp size={14} />
                    <span>+4.2% Total Returns</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
