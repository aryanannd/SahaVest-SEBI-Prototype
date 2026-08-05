import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { 
  ArrowLeft, ArrowUp, TrendingUp, Info, Percent, Wallet, 
  ShieldCheck, Loader2, Sparkles, AlertCircle, BarChart3, CheckCircle2, Clock
} from "lucide-react";
import { 
  ResponsiveContainer, AreaChart, Area, Line, XAxis, YAxis, 
  Tooltip, CartesianGrid, ReferenceLine 
} from 'recharts';

type TimeRange = '1M' | '3M' | '6M' | '1Y' | 'ALL';

interface PerformanceDataPoint {
  date: string;
  timestamp: string;
  portfolioValue: number;
  investedValue: number;
  benchmarkValue: number;
  portfolioReturnPct: number;
  benchmarkReturnPct: number;
}

interface PerformanceResponse {
  currentNetWorth: number;
  investedAmount: number;
  totalReturns: number;
  totalReturnsPercent: number;
  todayChange: {
    value: number;
    percentage: number;
  };
  returns1M: number;
  returns3M: number;
  returns6M: number;
  returns1Y: number;
  returnsAllTime: number;
  xirr: number;
  benchmarkComparison: {
    portfolio: number;
    nifty50: number;
    alpha: number;
  };
  range: TimeRange;
  chartData: PerformanceDataPoint[];
  source: 'LIVE_DELAYED' | 'CACHE_STALE';
  is_delayed: boolean;
  delay_label: string;
  cached_at: string;
  disclaimer: string;
}

export function PerformanceHistory() {
  const navigate = useNavigate();
  const [selectedRange, setSelectedRange] = useState<TimeRange>('1Y');
  const [compareBenchmark, setCompareBenchmark] = useState<boolean>(true);
  const [data, setData] = useState<PerformanceResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPerformance() {
      setLoading(true);
      setError(null);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const headers: HeadersInit = {};
        if (session) headers['Authorization'] = `Bearer ${session.access_token}`;

        const res = await fetch(`/api/portfolio/performance/me?range=${selectedRange}`, { headers });
        if (!res.ok) throw new Error('Failed to fetch performance data');
        const result: PerformanceResponse = await res.json();
        setData(result);
      } catch (err: any) {
        console.error('Error fetching performance:', err);
        setError(err.message || 'Error loading performance');
      } finally {
        setLoading(false);
      }
    }
    fetchPerformance();
  }, [selectedRange]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const formatYAxis = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(0)}k`;
    return `₹${val}`;
  };

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const pData: PerformanceDataPoint = payload[0].payload;
      return (
        <div className="bg-surface-container-lowest/95 backdrop-blur-md p-3 rounded-xl border border-outline-variant shadow-lg text-xs space-y-1.5 min-w-[170px] pointer-events-none">
          <p className="font-label-sm text-on-surface-variant font-semibold border-b border-outline-variant/40 pb-1">
            {pData.date}
          </p>
          <div className="flex items-center justify-between gap-3">
            <span className="text-primary font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
              Portfolio
            </span>
            <span className="font-bold text-on-surface">{formatCurrency(pData.portfolioValue)}</span>
          </div>
          {pData.investedValue && (
            <div className="flex items-center justify-between gap-3 text-on-surface-variant">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-outline inline-block"></span>
                Invested
              </span>
              <span>{formatCurrency(pData.investedValue)}</span>
            </div>
          )}
          {compareBenchmark && pData.benchmarkValue && (
            <div className="flex items-center justify-between gap-3 pt-1 border-t border-outline-variant/30 text-amber-600 dark:text-amber-400">
              <span className="flex items-center gap-1 font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                NIFTY 50
              </span>
              <span className="font-semibold">{formatCurrency(pData.benchmarkValue)}</span>
            </div>
          )}
          <div className="flex items-center justify-between pt-1 text-[11px] text-secondary font-semibold">
            <span>Return ({selectedRange})</span>
            <span>+{pData.portfolioReturnPct}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col font-body-md relative pb-20 md:pb-8">
      {/* TopAppBar */}
      <header className="bg-surface sticky top-0 z-50 border-b border-outline-variant">
        <div className="flex items-center justify-between px-4 py-3 w-full max-w-7xl mx-auto">
          <button 
            onClick={() => navigate(-1)}
            aria-label="Back"
            className="text-on-surface hover:bg-surface-container-low transition-colors active:scale-95 duration-100 p-2 rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-headline-sm text-primary tracking-tight font-bold">
            Portfolio Performance
          </h1>
          <div className="w-[44px]"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-6 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        
        {/* Stale Cache Banner (Honesty requirement) */}
        {data?.source === 'CACHE_STALE' && (
          <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl flex items-center gap-3 text-amber-800 dark:text-amber-200 text-xs">
            <Clock size={16} className="shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              Showing cached data as of <strong>{new Date(data.cached_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</strong>. Live updates temporarily paused.
            </span>
          </div>
        )}

        {/* Hero Net Worth Header Card */}
        <section className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-label-sm text-on-surface-variant uppercase tracking-wider">Total Portfolio Value</span>
                <span className="inline-flex items-center gap-1 bg-secondary-container/40 text-secondary text-[11px] font-semibold px-2 py-0.5 rounded-full">
                  <TrendingUp size={12} /> Live / delayed
                </span>
              </div>
              <div className="font-display-lg text-primary font-extrabold tracking-tight">
                {data ? formatCurrency(data.currentNetWorth) : '₹13,55,000'}
              </div>
            </div>

            {/* Quick Metrics Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="bg-surface-container-low border border-outline-variant/40 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <ArrowUp size={14} className="text-secondary" />
                <span className="text-xs text-on-surface-variant">Today:</span>
                <span className="text-xs font-bold text-secondary">
                  +{data?.todayChange ? formatCurrency(data.todayChange.value) : '₹15,989'} (+{data?.todayChange?.percentage || 1.18}%)
                </span>
              </div>

              <div className="bg-primary-container/30 border border-primary/20 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <Sparkles size={14} className="text-primary" />
                <span className="text-xs text-on-surface-variant">XIRR:</span>
                <span className="text-xs font-bold text-primary">{data?.xirr || 16.4}%</span>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Performance Chart Section */}
        <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-4 md:p-6 shadow-sm space-y-4">
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant/40 pb-4">
            <div className="flex items-center gap-2">
              <BarChart3 size={20} className="text-primary" />
              <h2 className="font-headline-sm text-on-surface">Growth Trajectory</h2>
            </div>

            {/* Time Range Selector */}
            <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl border border-outline-variant/40 self-start sm:self-auto">
              {(['1M', '3M', '6M', '1Y', 'ALL'] as TimeRange[]).map((range) => (
                <button
                  key={range}
                  onClick={() => setSelectedRange(range)}
                  className={`font-label-sm px-3 py-1.5 rounded-lg transition-all duration-150 ${
                    selectedRange === range
                      ? 'bg-primary text-on-primary font-bold shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          {/* Benchmark Comparison Toggle */}
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-on-surface-variant pt-1">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 font-medium text-primary">
                <span className="w-3 h-3 rounded-sm bg-primary"></span>
                <span>Portfolio ({data?.benchmarkComparison?.portfolio ? `+${data.benchmarkComparison.portfolio}%` : '+18.4%'})</span>
              </div>

              {compareBenchmark && (
                <div className="flex items-center gap-1.5 font-medium text-amber-600 dark:text-amber-400">
                  <span className="w-3 h-3 rounded-sm bg-amber-500"></span>
                  <span>NIFTY 50 ({data?.benchmarkComparison?.nifty50 ? `+${data.benchmarkComparison.nifty50}%` : '+13.9%'})</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setCompareBenchmark(!compareBenchmark)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors ${
                compareBenchmark 
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-700 dark:text-amber-300 font-semibold' 
                  : 'bg-surface-container-low border-outline-variant text-on-surface-variant'
              }`}
            >
              {compareBenchmark ? <CheckCircle2 size={13} /> : <div className="w-3 h-3 rounded-sm border border-outline-variant"></div>}
              Compare NIFTY 50
              {compareBenchmark && data?.benchmarkComparison && (
                <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded font-bold ml-1">
                  +{data.benchmarkComparison.alpha}% Alpha
                </span>
              )}
            </button>
          </div>

          {/* Chart Display Area */}
          <div className="w-full h-72 md:h-88 pt-2 relative">
            {loading ? (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-on-surface-variant">
                <Loader2 className="animate-spin text-primary" size={28} />
                <span className="text-xs">Updating chart data...</span>
              </div>
            ) : data?.chartData && data.chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#002653" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#002653" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="benchmarkGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d97706" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#d97706" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
                  
                  <XAxis 
                    dataKey="date" 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                    dy={5}
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={formatYAxis} 
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    domain={['auto', 'auto']}
                  />

                  <Tooltip content={<CustomTooltip />} />

                  {/* Invested Capital Line */}
                  <Line 
                    type="monotone" 
                    dataKey="investedValue" 
                    stroke="#94a3b8" 
                    strokeDasharray="4 4" 
                    strokeWidth={1.5} 
                    dot={false}
                    name="Invested Cost Basis"
                  />

                  {/* Benchmark Area / Line */}
                  {compareBenchmark && (
                    <Area 
                      type="monotone" 
                      dataKey="benchmarkValue" 
                      stroke="#d97706" 
                      strokeWidth={2} 
                      fillOpacity={1} 
                      fill="url(#benchmarkGradient)"
                      name="NIFTY 50"
                    />
                  )}

                  {/* Portfolio Main Area */}
                  <Area 
                    type="monotone" 
                    dataKey="portfolioValue" 
                    stroke="#002653" 
                    strokeWidth={2.5} 
                    fillOpacity={1} 
                    fill="url(#portfolioGradient)"
                    name="Portfolio Value"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-on-surface-variant text-sm">
                No chart history available for this timeframe.
              </div>
            )}
          </div>
        </section>

        {/* Bento Breakdown Cards */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {/* Total Invested */}
          <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm space-y-1">
            <div className="flex items-center gap-1.5 text-on-surface-variant text-xs">
              <Wallet size={14} />
              <span>Invested Capital</span>
            </div>
            <div className="font-headline-sm font-bold text-on-surface">
              {data ? formatCurrency(data.investedAmount) : '₹11,95,000'}
            </div>
            <div className="text-[11px] text-outline">Across 10 holdings</div>
          </div>

          {/* Total Returns */}
          <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm space-y-1">
            <div className="flex items-center gap-1.5 text-on-surface-variant text-xs">
              <TrendingUp size={14} />
              <span>Total Returns</span>
            </div>
            <div className="font-headline-sm font-bold text-secondary">
              +{data ? formatCurrency(data.totalReturns) : '₹1,60,000.50'}
            </div>
            <div className="text-[11px] text-secondary font-semibold">
              +{data?.totalReturnsPercent || 13.57}% all-time
            </div>
          </div>

          {/* Annualized XIRR */}
          <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm space-y-1">
            <div className="flex items-center gap-1.5 text-on-surface-variant text-xs">
              <Percent size={14} />
              <span>Annualized XIRR</span>
            </div>
            <div className="font-headline-sm font-bold text-primary">
              {data?.xirr || 16.4}%
            </div>
            <div className="text-[11px] text-outline">Time-weighted yield</div>
          </div>

          {/* Benchmark Alpha */}
          <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm space-y-1">
            <div className="flex items-center gap-1.5 text-on-surface-variant text-xs">
              <ShieldCheck size={14} />
              <span>Benchmark Alpha</span>
            </div>
            <div className="font-headline-sm font-bold text-amber-600 dark:text-amber-400">
              +{data?.benchmarkComparison?.alpha || 4.5}%
            </div>
            <div className="text-[11px] text-outline">Outperforming NIFTY 50</div>
          </div>
        </section>

        {/* Disclaimer Card (Mandatory honesty requirement) */}
        <footer className="bg-surface-container-low/60 rounded-xl p-4 border border-outline-variant/40 flex items-start gap-3">
          <Info size={16} className="text-on-surface-variant shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-on-surface-variant leading-relaxed">
            <p className="font-semibold text-on-surface">Data Disclaimer & Information Notice</p>
            <p>
              {data?.disclaimer || "This is informational context only, not investment advice or a prediction. Market price data is live/delayed (typically 15-20 min). Past performance does not guarantee future results."}
            </p>
          </div>
        </footer>

      </main>
    </div>
  );
}
