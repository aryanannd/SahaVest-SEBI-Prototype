import { Header } from '../../components/common/Header';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MoreVertical, ArrowUp, TrendingUp, PieChart,
  Landmark, PiggyBank, Gem, Building2, ChevronRight, Loader2
} from "lucide-react";
import { supabase } from '../../lib/supabaseClient';

type AssetClass = { assetClass: string; value: number; percentage: number };

const ASSET_CONFIG: Record<string, { icon: React.ElementType; color: string; route: string; subtitle: string }> = {
  'Equity': { icon: TrendingUp, color: '#002653', route: '/fund/equity', subtitle: 'Direct Stocks' },
  'Mutual Fund': { icon: PieChart, color: '#006d42', route: '/fund/mf', subtitle: 'SIPs & Lumpsum' },
  'Bond': { icon: Landmark, color: '#ffb95f', route: '/fund/bonds', subtitle: 'Corporate & Gov' },
  'Debt': { icon: Landmark, color: '#ffb95f', route: '/fund/bonds', subtitle: 'Fixed Income' },
  'NPS': { icon: PiggyBank, color: '#405e92', route: '/fund/nps', subtitle: 'Retirement' },
  'Gold': { icon: Gem, color: '#e89500', route: '/fund/sgb', subtitle: 'Sovereign Gold Bonds' },
  'REIT': { icon: Building2, color: '#573500', route: '/fund/reit', subtitle: 'Real Estate & Infra' },
  'Other': { icon: ChevronRight, color: '#7b828a', route: '/portfolio', subtitle: 'Other Assets' },
};

function getAssetConfig(assetClass: string) {
  for (const [key, val] of Object.entries(ASSET_CONFIG)) {
    if (assetClass.includes(key)) return val;
  }
  return ASSET_CONFIG['Other'];
}

export function PortfolioHub() {
  const navigate = useNavigate();
  const [totalValue, setTotalValue] = useState<number | null>(null);
  const [breakdown, setBreakdown] = useState<AssetClass[]>([]);
  const [loading, setLoading] = useState(true);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  useEffect(() => {
    async function fetchPortfolio() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const headers: HeadersInit = {};
        if (session) headers['Authorization'] = `Bearer ${session.access_token}`;
        const res = await fetch('/api/portfolio/exposure/me', { headers });
        const data = await res.json();
        if (data.totalValue != null) setTotalValue(data.totalValue);
        if (data.assetClassBreakdown?.length) setBreakdown(data.assetClassBreakdown);
      } catch (err) {
        console.error('PortfolioHub fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPortfolio();
  }, []);

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      {/* TopAppBar */}
      <header className="w-full sticky top-0 z-50 bg-surface border-b border-outline-variant flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="w-[44px] h-[44px] flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors rounded-full active:scale-95 duration-100"
        >
          <ArrowLeft />
        </button>
        <Header />
        <button className="w-[44px] h-[44px] flex items-center justify-center text-primary hover:bg-surface-container-low transition-colors rounded-full active:scale-95 duration-100">
          <MoreVertical />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-6 pb-[96px] md:pb-6 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">

        {/* Header Section */}
        <div className="flex flex-col gap-2">
          <h1 className="font-headline-sm text-on-surface">Asset Allocation</h1>
          <p className="font-body-md text-on-surface-variant">Breakdown of your current portfolio across different asset classes.</p>
        </div>

        {/* Total Value Summary Card */}
        <div
          onClick={() => navigate('/portfolio/performance')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/portfolio/performance'); }}
          className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant shadow-sm flex flex-col gap-3 hover:border-primary/40 hover:shadow-md transition-all cursor-pointer group active:scale-[0.99] duration-150"
        >
          <div className="flex items-center justify-between">
            <p className="font-label-sm text-on-surface-variant uppercase tracking-wider">Total Portfolio Value</p>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-primary group-hover:translate-x-0.5 transition-transform">
              View Chart <ChevronRight size={14} />
            </span>
          </div>
          {loading ? (
            <div className="h-9 w-40 bg-surface-container animate-pulse rounded-lg" />
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="font-display-lg text-on-surface">{formatCurrency(totalValue ?? 0)}</span>
              <span className="font-label-md text-secondary bg-secondary-container px-2 py-1 rounded-full flex items-center gap-1">
                <ArrowUp size={14} /> Live
              </span>
            </div>
          )}
        </div>

        {/* Allocation Breakdown Cards — Live from API */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            // Skeleton
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant shadow-sm h-[80px] animate-pulse" />
            ))
          ) : breakdown.length > 0 ? (
            breakdown.map((item, idx) => {
              const cfg = getAssetConfig(item.assetClass);
              const Icon = cfg.icon;
              const pct = Math.round(item.percentage);
              return (
                <button
                  key={idx}
                  onClick={() => navigate(cfg.route)}
                  className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant shadow-sm flex items-center justify-between hover:bg-surface-container-low transition-colors active:scale-[0.98] duration-200 text-left min-h-[44px] group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white shrink-0" style={{ backgroundColor: cfg.color }}>
                      <Icon size={24} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-headline-sm text-on-surface">{item.assetClass}</span>
                      <span className="font-label-sm text-on-surface-variant">{cfg.subtitle}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-body-md font-semibold text-on-surface">{formatCurrency(item.value)}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-surface-variant rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: cfg.color }} />
                      </div>
                      <span className="font-label-sm text-on-surface-variant">{pct}%</span>
                    </div>
                  </div>
                </button>
              );
            })
          ) : (
            // Fallback: static representative cards when no breakdown data
            [
              { assetClass: 'Equity', value: 0, percentage: 0 },
              { assetClass: 'Mutual Fund', value: 0, percentage: 0 },
            ].map((item, idx) => {
              const cfg = getAssetConfig(item.assetClass);
              const Icon = cfg.icon;
              return (
                <button key={idx} onClick={() => navigate(cfg.route)}
                  className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant shadow-sm flex items-center justify-between hover:bg-surface-container-low transition-colors active:scale-[0.98] duration-200 text-left min-h-[44px]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white shrink-0" style={{ backgroundColor: cfg.color }}>
                      <Icon size={24} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-headline-sm text-on-surface">{item.assetClass}</span>
                      <span className="font-label-sm text-on-surface-variant">{cfg.subtitle}</span>
                    </div>
                  </div>
                  <span className="font-label-sm text-on-surface-variant">Link accounts to see data</span>
                </button>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
