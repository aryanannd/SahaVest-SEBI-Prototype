import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { Search, User, Activity, Info, Play, LayoutDashboard, Wallet, Shield, Loader2 } from "lucide-react";

export function InvestorTwinSimulator() {
  const navigate = useNavigate();
  
  const [sipAmount, setSipAmount] = useState<number>(50000);
  const [duration, setDuration] = useState<number>(15);
  const [returnRate, setReturnRate] = useState<number>(12);
  const [loading, setLoading] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(value);
  };

  const handleRunSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (session) headers['Authorization'] = `Bearer ${session.access_token}`;
      
      const res = await fetch('http://localhost:3000/api/simulation/run', {
        method: 'POST',
        headers,
        body: JSON.stringify({ sipAmount, duration, returnRate })
      });
      const data = await res.json();
      navigate('/portfolio/simulation-results', { state: { ...data, duration } });
    } catch (err) {
      console.error(err);
      navigate('/portfolio/simulation-results'); // Fallback
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-background antialiased min-h-screen flex flex-col font-body-md">
      {/* TopAppBar */}
      <header className="w-full sticky top-0 z-50 bg-surface text-primary border-b border-outline-variant">
        <div className="flex items-center justify-between px-4 py-3 w-full max-w-7xl mx-auto">
          <button className="h-[44px] w-[44px] flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors active:scale-95 duration-100 text-on-surface-variant">
            <Search size={24} />
          </button>
          <div 
            className="font-headline-md text-primary tracking-tight cursor-pointer"
            onClick={() => navigate('/')}
          >
            SahaVest
          </div>
          <button className="h-[44px] w-[44px] flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors active:scale-95 duration-100 text-on-surface-variant">
            <User size={24} />
          </button>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 pb-24 md:pb-8">
        <div className="mb-6">
          <h1 className="font-display-lg-mobile md:font-display-lg text-primary mb-2">Investor Twin Simulator</h1>
          <p className="font-body-md text-on-surface-variant max-w-2xl">Model potential futures based on historical data. Adjust your inputs to see how your portfolio might evolve.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Context Side Card (Current Portfolio) */}
          <div className="lg:col-span-4 order-2 lg:order-1">
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 flex flex-col h-full shadow-sm">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-outline-variant">
                <Activity size={24} className="text-primary" />
                <h2 className="font-headline-sm text-on-surface">Current Context</h2>
              </div>
              <div className="space-y-4 flex-grow">
                <div>
                  <p className="font-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Active SIPs</p>
                  <p className="font-headline-md text-primary">₹25,000 <span className="font-body-md text-on-surface-variant">/ mo</span></p>
                </div>
                <div>
                  <p className="font-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Current Portfolio Value</p>
                  <p className="font-headline-sm text-on-surface">₹14,50,000</p>
                </div>
              </div>
              <div className="mt-6 bg-surface-container p-3 rounded-lg flex items-start gap-3">
                <Info size={20} className="text-secondary shrink-0 mt-1" />
                <p className="font-label-md text-on-surface-variant">The simulation will build upon your existing portfolio value by default.</p>
              </div>
            </div>
          </div>

          {/* Simulator Input Form */}
          <div className="lg:col-span-8 order-1 lg:order-2">
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm">
              <h2 className="font-headline-sm text-on-surface mb-6">Simulation Parameters</h2>
              <form className="space-y-8" onSubmit={handleRunSimulation}>
                
                {/* Slider 1: Monthly SIP */}
                <div>
                  <div className="flex justify-between items-end mb-3">
                    <label className="font-label-md text-on-surface" htmlFor="sipAmount">Monthly SIP Amount (₹)</label>
                    <span className="font-headline-sm text-primary">{formatCurrency(sipAmount)}</span>
                  </div>
                  <div className="relative pt-3 pb-4">
                    <input 
                      className="w-full accent-primary h-1 bg-surface-variant rounded-full outline-none appearance-none cursor-pointer" 
                      id="sipAmount" 
                      max="200000" min="5000" step="1000" type="range" 
                      value={sipAmount}
                      onChange={(e) => setSipAmount(Number(e.target.value))}
                    />
                    <div className="flex justify-between mt-2 font-label-sm text-outline">
                      <span>₹5K</span>
                      <span>₹200K</span>
                    </div>
                  </div>
                </div>

                {/* Slider 2: Duration */}
                <div>
                  <div className="flex justify-between items-end mb-3">
                    <label className="font-label-md text-on-surface" htmlFor="duration">Investment Duration (Years)</label>
                    <span className="font-headline-sm text-primary">{duration}</span>
                  </div>
                  <div className="relative pt-3 pb-4">
                    <input 
                      className="w-full accent-primary h-1 bg-surface-variant rounded-full outline-none appearance-none cursor-pointer" 
                      id="duration" 
                      max="40" min="5" step="1" type="range" 
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                    />
                    <div className="flex justify-between mt-2 font-label-sm text-outline">
                      <span>5 Yrs</span>
                      <span>40 Yrs</span>
                    </div>
                  </div>
                </div>

                {/* Slider 3: Expected Return */}
                <div>
                  <div className="flex justify-between items-end mb-3">
                    <label className="font-label-md text-on-surface" htmlFor="returnRate">Expected Annual Return (%)</label>
                    <span className="font-headline-sm text-primary">{returnRate.toFixed(1)}%</span>
                  </div>
                  <div className="relative pt-3 pb-4">
                    <input 
                      className="w-full accent-primary h-1 bg-surface-variant rounded-full outline-none appearance-none cursor-pointer relative z-10" 
                      id="returnRate" 
                      max="20" min="6" step="0.5" type="range" 
                      value={returnRate}
                      onChange={(e) => setReturnRate(Number(e.target.value))}
                    />
                    {/* Sane Historical Range Indicators */}
                    <div className="absolute w-full h-[4px] bg-secondary-fixed-dim/30 top-[16px] rounded-full pointer-events-none" style={{ left: '0%', width: '100%' }}>
                      {/* Highlight 10-15% range */}
                      <div className="absolute h-full bg-secondary-container rounded-full" style={{ left: '28.5%', width: '35.7%' }}></div>
                    </div>
                    <div className="flex justify-between mt-2 font-label-sm text-outline relative">
                      <span>6%</span>
                      <span className="absolute left-[46%] -ml-[40px] text-secondary hidden sm:inline-block">Historical Avg (10-15%)</span>
                      <span>20%</span>
                    </div>
                  </div>
                </div>

                {/* Action Area */}
                <div className="pt-4 border-t border-outline-variant mt-8">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-on-primary font-headline-sm py-4 rounded-full shadow-sm hover:bg-primary/90 hover:shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Play size={20} className="fill-current" />}
                    {loading ? 'Running Simulation...' : 'Run Simulation'}
                  </button>
                  <p className="font-label-sm text-on-surface-variant text-center mt-3 flex items-center justify-center gap-1">
                    <Shield size={16} /> Data is secured and anonymized
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 bg-surface border-t border-outline-variant">
        <div className="flex justify-around items-center w-full h-[64px] px-2 pb-safe">
          <a className="flex flex-col items-center justify-center bg-secondary-container text-on-secondary-container rounded-full px-4 py-1 hover:bg-surface-container-high active:scale-90 duration-200 ease-in-out" href="#">
            <LayoutDashboard size={24} />
            <span className="font-label-sm mt-1">Dashboard</span>
          </a>
          <a className="flex flex-col items-center justify-center text-on-surface-variant p-2 hover:bg-surface-container-high rounded-full active:scale-90 duration-200 ease-in-out" href="#">
            <Wallet size={24} />
            <span className="font-label-sm mt-1">Portfolio</span>
          </a>
          <a className="flex flex-col items-center justify-center text-on-surface-variant p-2 hover:bg-surface-container-high rounded-full active:scale-90 duration-200 ease-in-out" href="#">
            <Shield size={24} />
            <span className="font-label-sm mt-1">Protection</span>
          </a>
          <a className="flex flex-col items-center justify-center text-on-surface-variant p-2 hover:bg-surface-container-high rounded-full active:scale-90 duration-200 ease-in-out" href="#">
            <User size={24} />
            <span className="font-label-sm mt-1">Profile</span>
          </a>
        </div>
      </nav>
    </div>
  );
}
