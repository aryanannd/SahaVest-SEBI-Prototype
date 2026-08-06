import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { Search, User, Download, ChevronDown, Info, Activity, Globe, Coins, Loader2 } from "lucide-react";

export function TaxSummary() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const headers: HeadersInit = {};
        if (session) headers['Authorization'] = `Bearer ${session.access_token}`;
        
        const res = await fetch('/api/portfolio/tax-summary/me', { headers });
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
    <div className="bg-background text-on-background min-h-screen pb-[64px] md:pb-0">
      {/* TopAppBar */}
      <header className="w-full sticky top-0 z-50 bg-surface border-b border-outline-variant flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <button className="w-[44px] h-[44px] flex items-center justify-center text-primary active:scale-95 duration-100 hover:bg-surface-container-low transition-colors rounded-full">
            <Search />
          </button>
        </div>
        <h1 className="font-headline-md text-primary tracking-tight cursor-pointer" onClick={() => navigate('/')}>
          SahaVest
        </h1>
        <div className="flex items-center gap-2">
          <button className="w-[44px] h-[44px] flex items-center justify-center text-primary active:scale-95 duration-100 hover:bg-surface-container-low transition-colors rounded-full">
            <User />
          </button>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-8">
        
        {/* Header Section */}
        <section className="flex flex-col gap-3 md:flex-row md:items-end justify-between">
          <div>
            <h2 className="font-display-lg-mobile md:font-display-lg text-on-surface">
              Tax Summary FY {data?.financialYear || '2025-2026'}
            </h2>
            <p className="font-body-md text-on-surface-variant mt-1">Capital gains overview based on your actual portfolio holdings and transactions.</p>
          </div>
          <div className="flex gap-3 mt-3 md:mt-0">
            <button className="flex-1 md:flex-none h-[48px] px-6 rounded-lg bg-surface-container border border-outline-variant font-label-md text-on-surface flex items-center justify-center gap-2 hover:bg-surface-container-highest transition-colors min-w-[120px]">
              <Download size={18} /> Download
            </button>
          </div>
        </section>

        {/* Disclaimer Banner */}
        <div className="bg-surface-container-low border border-outline-variant rounded-lg p-4 flex items-start gap-3">
          <Info className="text-outline mt-1 shrink-0" size={20} />
          <p className="font-body-md text-on-surface-variant">
            <strong>Unrealized gains are computed from your live portfolio.</strong>{' '}
            {data?.realized?.is_illustrative
              ? <span className="text-warning font-medium">Realized gains will appear here once you record sell transactions — no sell transactions found this FY.</span>
              : 'Realized gains are computed from your actual sell transactions this FY.'}{' '}
            Always consult a CA for accurate tax filing.
          </p>
        </div>

        {/* High-Level Overview Bento Grid */}
        {loading ? (
           <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" size={32} /></div>
        ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Total Realized Gains */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm col-span-1 md:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-label-md text-on-surface-variant uppercase tracking-wider">Total Realized Capital Gains</h3>
                {data?.realized?.is_illustrative && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-outline/20 text-on-surface-variant">No sells yet</span>
                )}
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="font-display-lg-mobile md:font-display-lg text-on-surface">₹ {(data?.realized?.total || 0).toLocaleString('en-IN')}</span>
              </div>
              {data?.realized?.note && (
                <p className="font-label-sm text-outline mt-1">{data.realized.note}</p>
              )}
            </div>
            <div className="mt-4 pt-3 border-t border-outline-variant grid grid-cols-2 gap-3">
              <div>
                <span className="font-label-sm text-on-surface-variant block">STCG</span>
                <span className="font-body-md text-on-surface font-semibold">₹ {(data?.realized?.stcg || 0).toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="font-label-sm text-on-surface-variant block">LTCG</span>
                <span className="font-body-md text-on-surface font-semibold">₹ {(data?.realized?.ltcg || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Total Unrealized Gains */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm col-span-1 md:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-label-md text-on-surface-variant uppercase tracking-wider">Total Unrealized Gains</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-container text-on-primary-container">Live Prices</span>
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className={`font-display-lg-mobile md:font-display-lg ${(data?.unrealized?.total || 0) >= 0 ? 'text-on-surface' : 'text-error'}`}>
                  {(data?.unrealized?.total || 0) >= 0 ? '' : '−'}₹ {Math.abs(data?.unrealized?.total || 0).toLocaleString('en-IN')}
                </span>
              </div>
              {data?.unrealized?.note && (
                <p className="font-label-sm text-outline mt-1">{data.unrealized.note}</p>
              )}
            </div>
            <div className="mt-4 pt-3 border-t border-outline-variant grid grid-cols-2 gap-3">
              <div>
                <span className="font-label-sm text-on-surface-variant block">Short Term (&lt;12 mo)</span>
                <span className="font-body-md text-on-surface font-semibold">₹ {Math.abs(data?.unrealized?.shortTerm || 0).toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="font-label-sm text-on-surface-variant block">Long Term (&gt;12 mo)</span>
                <span className="font-body-md text-on-surface font-semibold">₹ {Math.abs(data?.unrealized?.longTerm || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Tax Loss Harvesting Opportunity */}
          {(data?.taxLossHarvestingOpportunity || 0) > 0 && (
            <div className="bg-surface-container-lowest border border-secondary/30 rounded-xl p-4 shadow-sm col-span-1 md:col-span-4 flex items-start gap-3">
              <Info size={20} className="text-secondary mt-1 shrink-0" />
              <div>
                <p className="font-label-md text-secondary font-semibold">Tax Loss Harvesting Opportunity</p>
                <p className="font-body-md text-on-surface-variant mt-1">
                  You have <strong>₹ {(data.taxLossHarvestingOpportunity).toLocaleString('en-IN')}</strong> in unrealized losses that could offset capital gains if you sell those holdings this FY.
                </p>
              </div>
            </div>
          )}

        </section>
        )}

        {/* Asset Class breakdown note */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-outline-variant pb-2">
            <h3 className="font-headline-sm text-on-surface">Portfolio Summary</h3>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-label-sm text-on-surface-variant">Holdings Analysed</span>
                <p className="font-headline-sm text-primary mt-1">{data?.holdingsAnalyzed || 0}</p>
              </div>
              <div>
                <span className="font-label-sm text-on-surface-variant">Sell Transactions (FY)</span>
                <p className="font-headline-sm text-primary mt-1">{data?.sellTransactionsThisFY || 0}</p>
              </div>
              <div>
                <span className="font-label-sm text-on-surface-variant">Unrealized STCG (est. tax @15%)</span>
                <p className="font-headline-sm text-on-surface mt-1">₹ {Math.round(Math.max(0, data?.unrealized?.shortTerm || 0) * 0.15).toLocaleString('en-IN')}</p>
              </div>
              <div>
                <span className="font-label-sm text-on-surface-variant">Unrealized LTCG (est. tax @10%)</span>
                <p className="font-headline-sm text-on-surface mt-1">₹ {Math.round(Math.max(0, data?.unrealized?.longTerm || 0) * 0.10).toLocaleString('en-IN')}</p>
              </div>
            </div>
            <p className="font-label-sm text-outline mt-4">* Estimated taxes assume flat STCG (15%) and LTCG (10%) rates on equity. Consult a CA for accurate filing.</p>
          </div>
        </section>

      </main>
    </div>
  );
}
