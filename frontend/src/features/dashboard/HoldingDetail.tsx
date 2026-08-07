import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { 
  ArrowLeft, TrendingUp, TrendingDown, Info, Loader2, 
  Newspaper, AlertTriangle, Sparkles, Clock, LineChart
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts';

interface Holding {
  id: string;
  instrument_name: string;
  symbol: string;
  quantity: number;
  average_price: number;
  current_value: number;
  invested_amount: number;
  day_change_val?: number;
  day_change_pct?: number;
}

export function HoldingDetail() {
  const navigate = useNavigate();
  const { holdingId } = useParams<{ holdingId: string }>(); // e.g. RELIANCE
  
  const [holding, setHolding] = useState<Holding | null>(null);
  const [quote, setQuote] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [aiSummary, setAiSummary] = useState<string>('');
  
  const [timeRange, setTimeRange] = useState<'1M'|'3M'|'6M'|'1Y'|'ALL'>('6M');
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStale, setIsStale] = useState(false);

  // 1. Fetch initial holding + quote + news + AI summary
  useEffect(() => {
    async function fetchAll() {
      if (!holdingId) return;
      try {
        setLoading(true);
        setError(null);
        
        // A. Fetch holding info from Supabase
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id || '716691b9-939e-4118-aafb-9246a3923250';
        
        const { data: holdingsData } = await supabase
          .from('holdings')
          .select('*')
          .eq('user_id', userId)
          .eq('symbol', holdingId)
          .single();
          
        if (holdingsData) {
          setHolding(holdingsData);
        } else {
          // Mock a basic holding if user doesn't actually own it but is exploring
          setHolding({
            id: 'mock',
            instrument_name: holdingId,
            symbol: holdingId,
            quantity: 0,
            average_price: 0,
            current_value: 0,
            invested_amount: 0
          });
        }

        // B. Fetch live quote
        const companyName = holdingsData?.instrument_name || holdingId;
        const [qRes, nRes, aiRes] = await Promise.all([
          fetch(`/api/market/quote/${holdingId}`),
          fetch(`/api/market/news/${holdingId}?company=${encodeURIComponent(companyName)}`),
          fetch(`/api/market/ai-summary/${holdingId}?company=${encodeURIComponent(companyName)}`)
        ]);

        if (qRes.ok) {
          const qData = await qRes.json();
          setQuote(qData);
          if (qData.source === 'CACHE_STALE') setIsStale(true);
        }
        
        if (nRes.ok) {
          const nData = await nRes.json();
          setNews(nData.articles || nData.news || []);
        }
        
        if (aiRes.ok) {
          const aiData = await aiRes.json();
          const summaryText = [aiData.sentiment_summary, aiData.volatility_context].filter(Boolean).join('\n\n');
          setAiSummary(summaryText || 'Summary unavailable.');
        }

      } catch (err) {
        console.error(err);
        setError("Failed to load company details.");
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, [holdingId]);

  // 2. Fetch chart data when timeRange changes
  useEffect(() => {
    async function fetchChart() {
      if (!holdingId) return;
      try {
        setChartLoading(true);
        // Map UI range to Yahoo range format
        let yRange = '6mo';
        let yInterval = '1d';
        if (timeRange === '1M') yRange = '1mo';
        if (timeRange === '3M') yRange = '3mo';
        if (timeRange === '1Y') yRange = '1y';
        if (timeRange === 'ALL') yRange = '5y';

        const res = await fetch(`/api/market/candles/${holdingId}?range=${yRange}&interval=${yInterval}`);
        if (res.ok) {
          const data = await res.json();
          setChartData(data.candles || []);
          if (data.source === 'CACHE_STALE') setIsStale(true);
        }
      } catch (err) {
        console.error("Failed to load chart", err);
      } finally {
        setChartLoading(false);
      }
    }
    fetchChart();
  }, [holdingId, timeRange]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-primary mb-4" size={32} />
        <p className="text-on-surface-variant font-body-md">Loading company details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle className="text-error mb-4" size={48} />
        <h2 className="font-headline-md text-on-surface mb-2">Data Unavailable</h2>
        <p className="text-on-surface-variant font-body-md mb-6">{error}</p>
        <button onClick={() => navigate(-1)} className="px-6 py-2 bg-primary text-on-primary rounded-full font-label-md">
          Go Back
        </button>
      </div>
    );
  }

  // Derive display values
  const currentPrice = quote?.price || 0;
  const priceChange = quote?.change || 0;
  const priceChangePct = quote?.changePercent || 0;
  const isPositive = priceChange >= 0;
  
  // Calculate total P&L based on holdings and live price
  const qty = holding?.quantity || 0;
  const avgCost = holding?.average_price || 0;
  const invested = holding?.invested_amount || (qty * avgCost);
  const currentValue = qty * currentPrice;
  const totalGain = currentValue - invested;
  const totalGainPct = invested > 0 ? (totalGain / invested) * 100 : 0;
  const isTotalGainPositive = totalGain >= 0;

  // Chart configuration
  const minChartPrice = chartData.length > 0 ? Math.min(...chartData.map(d => Number(d.close) || 0)) * 0.95 : 0;
  const maxChartPrice = chartData.length > 0 ? Math.max(...chartData.map(d => Number(d.close) || 0)) * 1.05 : 'auto';

  // Format AI Summary paragraphs
  const renderAiSummary = (text: string) => {
    return text.split('\n\n').map((paragraph, i) => (
      <p key={i} className="mb-2 last:mb-0" dangerouslySetInnerHTML={{ __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
    ));
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md antialiased pb-[80px] md:pb-0">
      {/* TopAppBar */}
      <header className="bg-surface dark:bg-surface-dim w-full sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3 w-full max-w-7xl mx-auto">
          <button 
            onClick={() => navigate(-1)}
            aria-label="Go Back" 
            className="w-[44px] h-[44px] flex items-center justify-center text-on-surface-variant dark:text-on-surface-variant hover:bg-surface-container-low transition-colors rounded-full active:scale-95 duration-100"
          >
            <ArrowLeft />
          </button>
          <h1 className="font-headline-md text-primary dark:text-primary-fixed tracking-tight truncate px-2">
            {holding?.instrument_name || holding?.symbol}
          </h1>
          <div className="w-[44px] h-[44px]"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-8 flex flex-col gap-4 md:gap-6">
        
        {isStale && (
          <div className="w-full bg-[#3D2E00] text-[#FFD870] px-4 py-2 rounded-lg flex items-center gap-2 border border-[#6B5000] shadow-sm">
            <Clock size={16} />
            <span className="font-label-sm">Showing data as of last available cache due to upstream limits.</span>
          </div>
        )}

        {/* Header Info Card */}
        <div className="w-full bg-surface-container-lowest rounded-xl p-4 md:p-6 border border-outline-variant shadow-sm flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-primary-container text-on-primary-container font-label-sm px-2 py-1 rounded-full">EQ</span>
              <span className="text-on-surface-variant font-label-md">{holding?.symbol}</span>
              <span className="bg-surface-container text-on-surface-variant font-label-sm px-2 py-1 rounded-full flex items-center gap-1">
                Live / delayed
              </span>
            </div>
            <h2 className="font-display-lg-mobile md:font-display-lg text-primary mb-1">
              ₹{currentPrice.toLocaleString('en-IN', {minimumFractionDigits: 2})}
            </h2>
            <div className="flex items-center gap-2">
              <span className={`font-label-md flex items-center ${isPositive ? 'text-secondary' : 'text-error'}`}>
                {isPositive ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
                {isPositive ? '+' : ''}{priceChange.toLocaleString('en-IN', {minimumFractionDigits: 2})} 
                ({isPositive ? '+' : ''}{priceChangePct.toFixed(2)}%)
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => navigate('/trade/intent', { state: { holding_id: holding?.symbol, txn_type: 'sell', name: holding?.instrument_name, price: currentPrice } })}
              className="h-[48px] px-6 bg-surface-container hover:bg-surface-container-high transition-colors text-primary font-label-md rounded-lg flex-1 md:flex-none disabled:opacity-50"
              disabled={qty <= 0}
            >
              Sell
            </button>
            <button 
              onClick={() => navigate('/trade/intent', { state: { holding_id: holding?.symbol, txn_type: 'buy', name: holding?.instrument_name, price: currentPrice } })}
              className="h-[48px] px-6 bg-primary hover:bg-primary-container transition-colors text-on-primary font-label-md rounded-lg flex-1 md:flex-none shadow-sm"
            >
              Buy
            </button>
          </div>
        </div>

        {/* Key Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-surface-container-lowest rounded-xl p-3 md:p-4 border border-outline-variant">
            <p className="text-on-surface-variant font-label-sm mb-2">Quantity</p>
            <p className="font-headline-sm text-on-surface">{qty}</p>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-3 md:p-4 border border-outline-variant">
            <p className="text-on-surface-variant font-label-sm mb-2">Avg. Cost</p>
            <p className="font-headline-sm text-on-surface">₹{avgCost.toLocaleString('en-IN', {minimumFractionDigits: 2})}</p>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-3 md:p-4 border border-outline-variant">
            <p className="text-on-surface-variant font-label-sm mb-2">Current Value</p>
            <p className="font-headline-sm text-on-surface">₹{currentValue.toLocaleString('en-IN', {minimumFractionDigits: 0})}</p>
          </div>
          <div className={`rounded-xl p-3 md:p-4 border border-outline-variant ${isTotalGainPositive ? 'bg-secondary-container/10' : 'bg-error-container/10'}`}>
            <p className="text-on-surface-variant font-label-sm mb-2">Total P&L</p>
            <p className={`font-headline-sm ${isTotalGainPositive ? 'text-secondary' : 'text-error'}`}>
              {isTotalGainPositive ? '+' : ''}₹{Math.abs(totalGain).toLocaleString('en-IN', {minimumFractionDigits: 0})} 
              ({isTotalGainPositive ? '+' : ''}{totalGainPct.toFixed(2)}%)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
          {/* Performance Chart Area */}
          <div className="col-span-1 md:col-span-8 bg-surface-container-lowest rounded-xl p-4 md:p-6 border border-outline-variant shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline-sm text-primary flex items-center gap-2">
                <LineChart size={20} /> Performance
              </h3>
              <div className="flex gap-1 bg-surface-container-low p-1 rounded-md">
                {(['1M', '3M', '6M', '1Y', 'ALL'] as const).map(range => (
                  <button 
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 font-label-sm rounded ${timeRange === range ? 'bg-surface-container-highest text-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container'}`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="h-[300px] w-full relative">
              {chartLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-surface-container-lowest/50 z-10 rounded-lg">
                  <Loader2 className="animate-spin text-primary" size={24} />
                </div>
              ) : null}
              
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={isPositive ? "var(--tw-colors-secondary)" : "var(--tw-colors-primary)"} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={isPositive ? "var(--tw-colors-secondary)" : "var(--tw-colors-primary)"} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'var(--tw-colors-on-surface-variant)', fontSize: 12 }}
                    tickFormatter={(val) => {
                      const d = new Date(val);
                      return !isNaN(d.getTime()) ? d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : val;
                    }}
                    minTickGap={30}
                  />
                  <YAxis 
                    domain={[minChartPrice, maxChartPrice]} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'var(--tw-colors-on-surface-variant)', fontSize: 12 }}
                    tickFormatter={(val) => '₹' + val.toLocaleString('en-IN')}
                    width={80}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--tw-colors-surface-container-highest)', borderColor: 'var(--tw-colors-outline-variant)', borderRadius: '8px', color: 'var(--tw-colors-on-surface)' }}
                    itemStyle={{ color: 'var(--tw-colors-on-surface)' }}
                    labelStyle={{ color: 'var(--tw-colors-on-surface-variant)', marginBottom: '4px' }}
                    formatter={(value: any) => [`₹${Number(value || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}`, 'Close Price']}
                    labelFormatter={(label: any) => new Date(label).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  />
                  {avgCost > 0 && avgCost >= minChartPrice && (typeof maxChartPrice === 'number' ? avgCost <= maxChartPrice : true) && (
                    <ReferenceLine y={avgCost} stroke="var(--tw-colors-outline-variant)" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Avg Cost', fill: 'var(--tw-colors-on-surface-variant)', fontSize: 10 }} />
                  )}
                  <Area 
                    type="monotone" 
                    dataKey="close" 
                    stroke={isPositive ? "var(--tw-colors-secondary)" : "var(--tw-colors-primary)"} 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorPrice)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Context Summary & News Area */}
          <div className="col-span-1 md:col-span-4 flex flex-col gap-4 md:gap-6">
            
            {/* AI Context Summary */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles size={64} className="text-primary" />
              </div>
              <div className="p-4 border-b border-outline-variant flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Sparkles size={16} />
                </div>
                <h3 className="font-headline-sm text-primary">AI Context Summary</h3>
              </div>
              <div className="p-4 text-on-surface font-body-md relative z-10 text-sm leading-relaxed">
                {aiSummary ? renderAiSummary(aiSummary) : <p className="text-on-surface-variant italic">No context available.</p>}
              </div>
              <div className="bg-surface-container px-4 py-3 border-t border-outline-variant flex gap-3 items-start">
                <Info size={16} className="text-on-surface-variant mt-0.5 flex-shrink-0" />
                <p className="text-xs text-on-surface-variant leading-tight font-medium">
                  This is informational context, not investment advice or a prediction. Market price data is live/delayed. Past performance does not guarantee future results.
                </p>
              </div>
            </div>

            {/* Recent News */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm flex flex-col max-h-[400px]">
              <div className="p-4 border-b border-outline-variant flex items-center gap-2">
                <Newspaper size={18} className="text-on-surface-variant" />
                <h3 className="font-headline-sm text-on-surface-variant">Recent News</h3>
              </div>
              <div className="flex-grow overflow-y-auto p-4 space-y-3">
                {news.length > 0 ? (
                  news.map((item, idx) => (
                    <React.Fragment key={idx}>
                      <a 
                        href={item.link} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="block p-3 rounded-lg hover:bg-surface-container-low transition-colors group border border-transparent hover:border-outline-variant/50"
                      >
                        <div className="flex justify-between items-start mb-1 gap-2">
                          <span className="font-label-sm text-on-surface-variant truncate flex-1">
                            {item.source || item.publisher?.name || 'News Source'}
                          </span>
                          <span className="font-label-sm text-on-surface-variant opacity-70 whitespace-nowrap">
                            {item.pubDate || item.published_utc ? new Date(item.pubDate || item.published_utc).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : ''}
                          </span>
                        </div>
                        <p className="font-body-sm font-medium text-on-surface line-clamp-2 group-hover:text-primary transition-colors">
                          {item.title}
                        </p>
                      </a>
                      {idx < news.length - 1 && <div className="w-full h-[1px] bg-outline-variant/30"></div>}
                    </React.Fragment>
                  ))
                ) : (
                  <p className="text-on-surface-variant font-body-sm italic p-2">No recent news found for this holding.</p>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
