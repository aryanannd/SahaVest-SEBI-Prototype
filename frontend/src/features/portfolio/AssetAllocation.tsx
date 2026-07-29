import { Header } from '../../components/common/Header';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { ArrowLeft, MoreVertical, ArrowUp, TrendingUp, PieChart, Landmark, PiggyBank, Gem, Building2, LayoutDashboard, Wallet, Shield, User, Loader2 } from "lucide-react";

export function AssetAllocation() {
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
        if (data) setHoldings(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchHoldings();
  }, []);

  const hasHoldings = holdings.length > 0;
  const totalValue = hasHoldings ? holdings.reduce((sum, h) => sum + (Number(h.current_value) || 0), 0) : 2450000;
  
  const getAssetClassTotal = (...assetClasses: string[]) => {
    return holdings.filter(h => assetClasses.some(ac => h.asset_class?.toLowerCase().includes(ac))).reduce((sum, h) => sum + (Number(h.current_value) || 0), 0);
  };

  const equityTotal = hasHoldings ? getAssetClassTotal('eq') : 1029000;
  const mfTotal = hasHoldings ? getAssetClassTotal('mutual', 'mf') : 735000;
  const bondTotal = hasHoldings ? getAssetClassTotal('bond', 'sgb') : 490000;

  const pEq = totalValue ? (equityTotal / totalValue) * 100 : 42;
  const pMf = totalValue ? (mfTotal / totalValue) * 100 : 30;
  const pBond = totalValue ? (bondTotal / totalValue) * 100 : 20;

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col font-body-md antialiased">
      {/* TopAppBar */}
      <header className="w-full sticky top-0 z-50 bg-surface border-b border-outline-variant flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="w-11 h-11 flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors rounded-full active:scale-95 duration-100"
        >
          <ArrowLeft size={24} />
        </button>
        <Header />
        <button className="w-11 h-11 flex items-center justify-center text-primary">
          <MoreVertical size={24} />
        </button>
      </header>
      
      {/* Main Content */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-6 pb-[96px] md:pb-6 flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex flex-col gap-1">
          <h2 className="font-headline-sm text-on-surface">Asset Allocation</h2>
          <p className="font-body-md text-on-surface-variant">Breakdown of your current portfolio across different asset classes.</p>
        </div>
        
        {/* Total Value Summary Card */}
        {loading ? (
          <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" size={32} /></div>
        ) : (
          <>
        <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant shadow-sm flex flex-col gap-3">
          <p className="font-label-sm text-on-surface-variant uppercase">Total Portfolio Value</p>
          <div className="flex items-baseline gap-2">
            <span className="font-display-lg text-on-surface">₹{totalValue.toLocaleString('en-IN', {maximumFractionDigits: 0})}</span>
            <span className="font-label-md text-secondary bg-secondary-container px-2 py-1 rounded-full flex items-center gap-1">
              <ArrowUp size={14} strokeWidth={3} /> 12.4%
            </span>
          </div>
        </div>
        
        {/* Allocation Breakdown Cards (Bento Style) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Equity */}
          <button onClick={() => navigate('/portfolio/equity')} className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant shadow-sm flex items-center justify-between hover:bg-surface-container-low transition-colors active:scale-[0.98] duration-200 text-left min-h-[44px] group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#002653] flex items-center justify-center text-white shrink-0">
                <TrendingUp size={24} />
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-on-surface">Equity</span>
                <span className="font-label-sm text-on-surface-variant">Direct Stocks</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="font-body-md font-semibold text-on-surface">₹{equityTotal.toLocaleString('en-IN')}</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-surface-variant rounded-full overflow-hidden">
                  <div className="h-full bg-[#002653]" style={{width: `${pEq}%`}}></div>
                </div>
                <span className="font-label-sm text-on-surface-variant">{Math.round(pEq)}%</span>
              </div>
            </div>
          </button>
          
          {/* Mutual Funds */}
          <button className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant shadow-sm flex items-center justify-between hover:bg-surface-container-low transition-colors active:scale-[0.98] duration-200 text-left min-h-[44px] group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#006d42] flex items-center justify-center text-white shrink-0">
                <PieChart size={24} />
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-on-surface">Mutual Funds</span>
                <span className="font-label-sm text-on-surface-variant">SIPs & Lumpsum</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="font-body-md font-semibold text-on-surface">₹{mfTotal.toLocaleString('en-IN')}</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-surface-variant rounded-full overflow-hidden">
                  <div className="h-full bg-[#006d42]" style={{width: `${pMf}%`}}></div>
                </div>
                <span className="font-label-sm text-on-surface-variant">{Math.round(pMf)}%</span>
              </div>
            </div>
          </button>
          
          {/* Bonds */}
          <button className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant shadow-sm flex items-center justify-between hover:bg-surface-container-low transition-colors active:scale-[0.98] duration-200 text-left min-h-[44px] group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#ffb95f] flex items-center justify-center text-white shrink-0">
                <Landmark size={24} />
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-on-surface">Bonds</span>
                <span className="font-label-sm text-on-surface-variant">Corporate & Gov</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="font-body-md font-semibold text-on-surface">₹{bondTotal.toLocaleString('en-IN')}</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-surface-variant rounded-full overflow-hidden">
                  <div className="h-full bg-[#ffb95f]" style={{width: `${pBond}%`}}></div>
                </div>
                <span className="font-label-sm text-on-surface-variant">{Math.round(pBond)}%</span>
              </div>
            </div>
          </button>
          
          {/* NPS */}
          <button className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant shadow-sm flex items-center justify-between hover:bg-surface-container-low transition-colors active:scale-[0.98] duration-200 text-left min-h-[44px] group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#405e92] flex items-center justify-center text-white shrink-0">
                <PiggyBank size={24} />
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-on-surface">NPS</span>
                <span className="font-label-sm text-on-surface-variant">Retirement</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="font-body-md font-semibold text-on-surface">₹1,96,000</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-surface-variant rounded-full overflow-hidden">
                  <div className="h-full bg-[#405e92] w-[8%]"></div>
                </div>
                <span className="font-label-sm text-on-surface-variant">8%</span>
              </div>
            </div>
          </button>
          
          {/* SGB */}
          <button className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant shadow-sm flex items-center justify-between hover:bg-surface-container-low transition-colors active:scale-[0.98] duration-200 text-left min-h-[44px] group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#e89500] flex items-center justify-center text-white shrink-0">
                <Gem size={24} />
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-on-surface">SGB</span>
                <span className="font-label-sm text-on-surface-variant">Sovereign Gold Bonds</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="font-body-md font-semibold text-on-surface">₹98,000</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-surface-variant rounded-full overflow-hidden">
                  <div className="h-full bg-[#e89500] w-[4%]"></div>
                </div>
                <span className="font-label-sm text-on-surface-variant">4%</span>
              </div>
            </div>
          </button>
          
          {/* REIT / InvIT */}
          <button className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant shadow-sm flex items-center justify-between hover:bg-surface-container-low transition-colors active:scale-[0.98] duration-200 text-left min-h-[44px] group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#573500] flex items-center justify-center text-white shrink-0">
                <Building2 size={24} />
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-on-surface">REIT/InvIT</span>
                <span className="font-label-sm text-on-surface-variant">Real Estate & Infra</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="font-body-md font-semibold text-on-surface">₹24,500</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-surface-variant rounded-full overflow-hidden">
                  <div className="h-full bg-[#573500] w-[1%]"></div>
                </div>
                <span className="font-label-sm text-on-surface-variant">1%</span>
              </div>
            </div>
          </button>
        </div>
          </>
        )}
      </main>
      
      {/* BottomNavBar */}
      <nav className="fixed bottom-0 w-full z-50 bg-surface border-t border-outline-variant flex justify-around items-center h-[64px] px-2 pb-safe md:hidden">
        <button onClick={() => navigate('/dashboard')} className="flex flex-col items-center justify-center text-on-surface-variant p-2 hover:bg-surface-container-high rounded-full active:scale-90 duration-200 ease-in-out min-w-[44px] min-h-[44px]">
          <LayoutDashboard size={24} />
          <span className="font-label-sm mt-1">Dashboard</span>
        </button>
        <button onClick={() => navigate('/portfolio')} className="flex flex-col items-center justify-center bg-secondary-container text-on-secondary-container rounded-full px-4 py-1 hover:bg-surface-container-high active:scale-90 duration-200 ease-in-out min-h-[44px]">
          <Wallet size={24} fill="currentColor" />
          <span className="font-label-sm mt-1">Portfolio</span>
        </button>
        <button onClick={() => navigate('/protection')} className="flex flex-col items-center justify-center text-on-surface-variant p-2 hover:bg-surface-container-high rounded-full active:scale-90 duration-200 ease-in-out min-w-[44px] min-h-[44px]">
          <Shield size={24} />
          <span className="font-label-sm mt-1">Protection</span>
        </button>
        <button onClick={() => navigate('/profile')} className="flex flex-col items-center justify-center text-on-surface-variant p-2 hover:bg-surface-container-high rounded-full active:scale-90 duration-200 ease-in-out min-w-[44px] min-h-[44px]">
          <User size={24} />
          <span className="font-label-sm mt-1">Profile</span>
        </button>
      </nav>
    </div>
  );
}
