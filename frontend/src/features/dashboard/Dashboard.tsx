import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, TrendingUp, Shield, Activity, Lock, Wallet, ArrowUpRight, Link, FileBadge, ShieldCheck, Compass, ArrowUp, Landmark, Gem, Minus } from "lucide-react";

export function Dashboard() {
  const navigate = useNavigate();
  // Using local state to toggle between dashboard_1 (empty) and dashboard_2 (populated)
  const [hasLinkedAccounts, setHasLinkedAccounts] = useState(true);

  if (!hasLinkedAccounts) {
    return (
      <div className="flex-1 flex flex-col bg-surface pb-[80px] md:pb-0 text-on-background">
        {/* TopAppBar */}
        <header className="w-full sticky top-0 z-50 bg-surface border-b border-outline-variant flat no-shadows">
          <div className="flex items-center justify-between px-4 py-3 w-full max-w-7xl mx-auto">
            <button aria-label="Search" className="text-primary hover:bg-surface-container-low transition-colors active:scale-95 duration-100 p-2 rounded-full">
              <Search />
            </button>
            <h1 className="font-headline-md text-primary tracking-tight">SahaVest</h1>
            <button aria-label="Account" className="text-primary hover:bg-surface-container-low transition-colors active:scale-95 duration-100 p-2 rounded-full">
              <User />
            </button>
          </div>
        </header>

        {/* Main Content Canvas (Empty State) */}
        <main className="flex-grow flex flex-col items-center justify-center p-4 max-w-md mx-auto text-center w-full pb-32">
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
            <Link className="text-[20px]" />
            Link Accounts Now
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-surface text-on-surface pb-[80px] md:pb-0 overflow-y-auto">
      {/* TopAppBar */}
      <header className="w-full sticky top-0 z-50 bg-surface border-b border-outline-variant">
        <div className="flex items-center justify-between px-4 py-3 w-full max-w-7xl mx-auto">
          <button className="h-[44px] w-[44px] flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors active:scale-95 duration-100 rounded-full">
            <Search />
          </button>
          <div className="font-headline-md text-primary tracking-tight">SahaVest</div>
          <button className="h-[44px] w-[44px] flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors active:scale-95 duration-100 rounded-full">
            <User />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-8 w-full">
        {/* Net Worth Header Area */}
        <section className="text-center space-y-2 pt-4">
          <h2 className="font-label-md text-on-surface-variant">Total Net Worth</h2>
          <div className="font-display-lg-mobile md:font-display-lg text-primary">₹14,50,000</div>
          <div className="flex items-center justify-center gap-1 text-secondary font-label-md">
            <TrendingUp className="text-[16px]" />
            <span>+2.4% (1M)</span>
          </div>
          <div className="font-label-sm text-outline pt-3">Last updated: 5 mins ago</div>
        </section>

        {/* Donut Chart & Legend Bento */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Chart Card */}
          <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.04)] border border-outline-variant p-4 flex flex-col items-center justify-center aspect-square md:aspect-auto">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Circle */}
                <circle cx="50" cy="50" fill="transparent" r="40" stroke="#f3f4f5" strokeWidth="12"></circle>
                {/* Equity Segment (50%) */}
                <circle className="transition-all duration-1000 ease-out" cx="50" cy="50" fill="transparent" r="40" stroke="#002653" strokeDasharray="125.6 251.2" strokeDashoffset="0" strokeWidth="12"></circle>
                {/* Debt Segment (30%) */}
                <circle className="transition-all duration-1000 ease-out" cx="50" cy="50" fill="transparent" r="40" stroke="#006d42" strokeDasharray="75.36 251.2" strokeDashoffset="-125.6" strokeWidth="12"></circle>
                {/* Gold Segment (15%) */}
                <circle className="transition-all duration-1000 ease-out" cx="50" cy="50" fill="transparent" r="40" stroke="#e89500" strokeDasharray="37.68 251.2" strokeDashoffset="-200.96" strokeWidth="12"></circle>
                {/* Cash Segment (5%) */}
                <circle className="transition-all duration-1000 ease-out" cx="50" cy="50" fill="transparent" r="40" stroke="#abc7ff" strokeDasharray="12.56 251.2" strokeDashoffset="-238.64" strokeWidth="12"></circle>
              </svg>
              {/* Center Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="font-headline-sm text-primary">4</span>
                <span className="font-label-sm text-on-surface-variant">Asset Classes</span>
              </div>
            </div>
          </div>

          {/* Legend/Details */}
          <div className="flex flex-col gap-3 justify-center">
            <div onClick={() => navigate('/fund/equity')} className="cursor-pointer bg-surface-container-lowest rounded-lg p-3 border border-outline-variant flex items-center justify-between active:scale-[0.98] transition-transform">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span className="font-body-md text-on-surface">Equity</span>
              </div>
              <div className="text-right">
                <div className="font-headline-sm text-primary">50%</div>
                <div className="font-label-sm text-on-surface-variant">₹7,25,000</div>
              </div>
            </div>
            
            <div onClick={() => navigate('/fund/debt')} className="cursor-pointer bg-surface-container-lowest rounded-lg p-3 border border-outline-variant flex items-center justify-between active:scale-[0.98] transition-transform">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-secondary"></div>
                <span className="font-body-md text-on-surface">Debt</span>
              </div>
              <div className="text-right">
                <div className="font-headline-sm text-primary">30%</div>
                <div className="font-label-sm text-on-surface-variant">₹4,35,000</div>
              </div>
            </div>
            
            <div onClick={() => navigate('/fund/gold')} className="cursor-pointer bg-surface-container-lowest rounded-lg p-3 border border-outline-variant flex items-center justify-between active:scale-[0.98] transition-transform">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-tertiary-container"></div>
                <span className="font-body-md text-on-surface">Gold</span>
              </div>
              <div className="text-right">
                <div className="font-headline-sm text-primary">15%</div>
                <div className="font-label-sm text-on-surface-variant">₹2,17,500</div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions Row */}
        <section className="flex flex-wrap justify-center gap-4 py-3">
          <button onClick={() => navigate('/fraud')} className="flex flex-col items-center gap-2 p-3 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-[0px_4px_12px_rgba(0,0,0,0.04)] min-w-[100px] active:scale-95 transition-transform">
            <div className="w-10 h-10 rounded-full bg-error-container text-on-error-container flex items-center justify-center">
              <FileBadge />
            </div>
            <span className="font-label-sm text-on-surface">Scam Checker</span>
          </button>
          
          <button onClick={() => navigate('/trust')} className="flex flex-col items-center gap-2 p-3 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-[0px_4px_12px_rgba(0,0,0,0.04)] min-w-[100px] active:scale-95 transition-transform">
            <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
              <ShieldCheck />
            </div>
            <span className="font-label-sm text-on-surface">Trust Score</span>
          </button>
          
          <button onClick={() => navigate('/twin/simulator')} className="flex flex-col items-center gap-2 p-3 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-[0px_4px_12px_rgba(0,0,0,0.04)] min-w-[100px] active:scale-95 transition-transform">
            <div className="w-10 h-10 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center">
              <Compass />
            </div>
            <span className="font-label-sm text-on-surface">Simulator</span>
          </button>
        </section>

        {/* Detailed Summary Cards */}
        <section className="space-y-4">
          <h3 className="font-headline-sm text-primary">Asset Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Equity Card */}
            <div onClick={() => navigate('/fund/equity')} className="cursor-pointer bg-surface-container-lowest rounded-xl p-4 border border-outline-variant shadow-[0px_4px_12px_rgba(0,0,0,0.04)] flex flex-col gap-3 active:scale-[0.98] transition-transform">
              <div className="flex items-center gap-3">
                <TrendingUp className="text-primary bg-primary-fixed p-2 rounded-full" />
                <h4 className="font-headline-sm text-on-surface">Equity</h4>
                <span className="ml-auto bg-surface-container-low px-2 py-1 rounded font-label-sm text-on-surface-variant">50%</span>
              </div>
              <div className="font-display-lg-mobile text-primary">₹7,25,000</div>
              <div className="flex items-center gap-2 text-secondary font-label-sm">
                <ArrowUp className="text-[14px]" />
                <span>+4.2% Total Returns</span>
              </div>
            </div>

            {/* Debt Card */}
            <div onClick={() => navigate('/fund/debt')} className="cursor-pointer bg-surface-container-lowest rounded-xl p-4 border border-outline-variant shadow-[0px_4px_12px_rgba(0,0,0,0.04)] flex flex-col gap-3 active:scale-[0.98] transition-transform">
              <div className="flex items-center gap-3">
                <Landmark className="text-secondary bg-secondary-fixed p-2 rounded-full" />
                <h4 className="font-headline-sm text-on-surface">Debt</h4>
                <span className="ml-auto bg-surface-container-low px-2 py-1 rounded font-label-sm text-on-surface-variant">30%</span>
              </div>
              <div className="font-display-lg-mobile text-primary">₹4,35,000</div>
              <div className="flex items-center gap-2 text-secondary font-label-sm">
                <ArrowUp className="text-[14px]" />
                <span>+6.5% Yield</span>
              </div>
            </div>

            {/* Gold Card */}
            <div onClick={() => navigate('/fund/gold')} className="cursor-pointer bg-surface-container-lowest rounded-xl p-4 border border-outline-variant shadow-[0px_4px_12px_rgba(0,0,0,0.04)] flex flex-col gap-3 active:scale-[0.98] transition-transform">
              <div className="flex items-center gap-3">
                <Gem className="text-tertiary-container bg-tertiary-fixed p-2 rounded-full" />
                <h4 className="font-headline-sm text-on-surface">Gold</h4>
                <span className="ml-auto bg-surface-container-low px-2 py-1 rounded font-label-sm text-on-surface-variant">15%</span>
              </div>
              <div className="font-display-lg-mobile text-primary">₹2,17,500</div>
              <div className="flex items-center gap-2 text-on-surface-variant font-label-sm">
                <Minus className="text-[14px]" />
                <span>Stable</span>
              </div>
            </div>

          </div>
        </section>
      </main>
    </div>
  );
}
