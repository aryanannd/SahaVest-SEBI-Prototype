import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, MoreVertical, Search, TrendingUp, ChevronRight, ArrowUp, ArrowDown, ChevronDown, PackageOpen
} from "lucide-react";

export function FundDetail() {
  const navigate = useNavigate();
  const { type } = useParams();

  const [holdings, setHoldings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeCap, setActiveCap] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [globalMenuOpen, setGlobalMenuOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc'|'desc'} | null>(null);
  const LIMIT = 10;

  const title = type === 'equity' ? 'Equity Holdings' : type === 'mf' ? 'Mutual Funds' : type === 'bonds' ? 'Bonds' : 'Holdings';

  useEffect(() => {
    // Reset state on type change
    setHoldings([]);
    setOffset(0);
    setHasMore(true);
    setLoading(true);

    const fetchInitialHoldings = async () => {
      try {
        const res = await fetch(`/api/portfolio/holdings/me?type=${type || ''}&limit=${LIMIT}&offset=0`);
        if (res.ok) {
          const data = await res.json();
          setHoldings(data.holdings || []);
          if (data.holdings?.length < LIMIT) setHasMore(false);
          setOffset(LIMIT);
        }
      } catch (err) {
        console.error('Failed to fetch holdings', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialHoldings();
  }, [type]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/portfolio/holdings/me?type=${type || ''}&limit=${LIMIT}&offset=${offset}`);
      if (res.ok) {
        const data = await res.json();
        if (data.holdings && data.holdings.length > 0) {
          setHoldings(prev => [...prev, ...data.holdings]);
          setOffset(prev => prev + LIMIT);
          if (data.holdings.length < LIMIT) setHasMore(false);
        } else {
          setHasMore(false);
        }
      }
    } catch (err) {
      console.error('Failed to fetch more holdings', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const totalValue = holdings.reduce((acc, curr) => acc + (curr.currentValue || curr.current_value || 0), 0);
  const totalDayChange = holdings.reduce((acc, curr) => acc + (curr.dayChange || 0), 0);
  const totalDayChangePercent = totalValue > 0 ? (totalDayChange / (totalValue - totalDayChange)) * 100 : 0;

  const sortedHoldings = [...holdings].sort((a, b) => {
    if (!sortConfig) return 0;
    const aVal = a.currentValue || a.current_value || 0;
    const bVal = b.currentValue || b.current_value || 0;
    return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
  });

  const filteredHoldings = sortedHoldings
    .filter((h) => activeCap === 'All' || h.market_cap_category === activeCap)
    .filter((h) => h.instrument_name.toLowerCase().includes(searchQuery.toLowerCase()));

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
            <ArrowLeft />
          </button>
          <h1 className="font-headline-md text-primary dark:text-primary-fixed tracking-tight truncate flex-1 text-center px-4">
            {title}
          </h1>
          <div className="relative">
            <button 
              onClick={() => setGlobalMenuOpen(!globalMenuOpen)}
              aria-label="More options" 
              className="flex items-center justify-center min-w-[44px] min-h-[44px] text-primary dark:text-primary-fixed hover:bg-surface-container-low dark:hover:bg-surface-container-highest transition-colors rounded-full active:scale-95 duration-100"
            >
              <MoreVertical />
            </button>
            {globalMenuOpen && (
              <>
                <div className="fixed inset-0 z-[90]" onClick={() => setGlobalMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-outline-variant rounded-xl shadow-lg z-[100] py-2 overflow-hidden">
                  <button 
                    onClick={() => { setSortConfig({key: 'value', direction: 'desc'}); setGlobalMenuOpen(false); }}
                    className="w-full text-left px-4 py-3 font-body-md text-on-surface hover:bg-surface-container-low transition-colors"
                  >
                    Sort by Value (High to Low)
                  </button>
                  <button 
                    onClick={() => { setSortConfig({key: 'value', direction: 'asc'}); setGlobalMenuOpen(false); }}
                    className="w-full text-left px-4 py-3 font-body-md text-on-surface hover:bg-surface-container-low transition-colors"
                  >
                    Sort by Value (Low to High)
                  </button>
                  <div className="h-[1px] w-full bg-outline-variant/30 my-1" />
                  <button 
                    onClick={() => { alert('Exporting to CSV...'); setGlobalMenuOpen(false); }}
                    className="w-full text-left px-4 py-3 font-body-md text-on-surface hover:bg-surface-container-low transition-colors"
                  >
                    Export to CSV
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 pb-24 md:pb-6 pt-4 md:pt-6 flex flex-col gap-6">
        
        {/* Search and Filter Bar */}
        <div className="w-full relative sticky top-[72px] z-40 bg-background pt-2 pb-4">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
            <input 
              className="w-full h-12 pl-12 pr-4 bg-surface rounded-full border border-outline-variant text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow placeholder-on-surface-variant" 
              placeholder="Search instruments..." 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Quick Filters */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
            {['All', 'Large Cap', 'Mid Cap', 'Small Cap'].map((cap) => (
              <button 
                key={cap}
                onClick={() => setActiveCap(cap)}
                className={`px-4 py-2 min-h-[36px] rounded-full font-label-md whitespace-nowrap transition-colors ${
                  activeCap === cap 
                    ? 'bg-secondary-container text-on-secondary-container border border-transparent' 
                    : 'bg-surface text-on-surface-variant border border-outline-variant hover:bg-surface-container-low'
                }`}
              >
                {cap}
              </button>
            ))}
          </div>
        </div>

        {/* Portfolio Summary Card (Glassmorphism inspired) */}
        <div className="w-full bg-surface-container-low rounded-xl p-5 border border-outline-variant/50 relative overflow-hidden shadow-sm">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary-container/10 rounded-full blur-2xl"></div>
          <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-secondary-container/20 rounded-full blur-xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="font-body-md text-on-surface-variant mb-1">Total {title} Value</h2>
              <p className="font-display-lg-mobile md:font-display-lg text-primary">
                ₹{totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-left md:text-right">
              <h2 className="font-body-md text-on-surface-variant mb-1">Day's Change</h2>
              <p className={`font-headline-sm flex items-center md:justify-end gap-1 ${totalDayChange >= 0 ? 'text-secondary' : 'text-error'}`}>
                <TrendingUp size={20} />
                {totalDayChange >= 0 ? '+' : '-'}₹{Math.abs(totalDayChange).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 
                ({totalDayChangePercent >= 0 ? '+' : ''}{totalDayChangePercent.toFixed(2)}%)
              </p>
            </div>
          </div>
        </div>

        {/* Holdings List */}
        <div className="w-full bg-surface rounded-xl border border-outline-variant/30 overflow-hidden shadow-sm">
          {/* List Header (Desktop Only) */}
          {holdings.length > 0 && (
            <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-outline-variant/50 bg-surface-container-low/50">
              <div className="col-span-5 font-label-sm text-on-surface-variant uppercase tracking-wider">Instrument</div>
              <div className="col-span-3 text-right font-label-sm text-on-surface-variant uppercase tracking-wider">Qty & Avg. Price</div>
              <div className="col-span-4 text-right font-label-sm text-on-surface-variant uppercase tracking-wider">Current Value & Change</div>
            </div>
          )}

          {loading ? (
            <div className="p-8 flex justify-center">
              <p className="text-on-surface-variant font-body-md">Loading...</p>
            </div>
          ) : holdings.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mb-4">
                <PackageOpen className="text-on-surface-variant opacity-50" size={32} />
              </div>
              <h3 className="font-headline-sm text-on-surface mb-2">No Holdings Found</h3>
              <p className="font-body-md text-on-surface-variant max-w-sm">
                You don't have any {type} investments matching these filters.
              </p>
            </div>
          ) : (
            filteredHoldings.map((holding) => {
              const symbolParam = holding.symbol ? holding.symbol.split('.')[0].toLowerCase() : holding.instrument_name.toLowerCase().replace(/[^a-z0-9]/g, '');
              
              return (
                <div 
                  key={holding.id}
                  onClick={() => navigate(`/fund/${type}/${symbolParam}`)}
                  className="group border-b border-outline-variant/30 last:border-0 hover:bg-surface-container-low transition-colors cursor-pointer"
                >
                  <div className="p-4 flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-4 md:items-center">
                    <div className="md:col-span-5 flex items-center justify-between md:justify-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-headline-sm uppercase">
                          {holding.instrument_name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-headline-sm text-on-surface truncate max-w-[200px] md:max-w-[250px]">{holding.instrument_name}</h3>
                          <p className="font-body-md text-on-surface-variant md:hidden">
                            {holding.quantity ? `${holding.quantity} Qty · ` : ''}Avg: ₹{(holding.avg_cost || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="text-outline md:hidden" />
                    </div>
                    
                    <div className="hidden md:block md:col-span-3 text-right">
                      <p className="font-body-md text-on-surface">{holding.quantity || '-'}</p>
                      <p className="font-label-sm text-on-surface-variant">Avg. ₹{(holding.avg_cost || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                    </div>
                    
                    <div className="flex justify-between md:col-span-4 md:text-right items-end md:items-center">
                      <div className="md:hidden">
                        <p className="font-label-sm text-on-surface-variant uppercase">Value & Change</p>
                      </div>
                      <div className="text-right">
                        <p className="font-headline-sm text-on-surface">
                          ₹{(holding.currentValue || holding.current_value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        {holding.isLive ? (
                          <p className={`font-body-md flex items-center justify-end gap-1 ${holding.dayChange >= 0 ? 'text-secondary' : 'text-error'}`}>
                            {holding.dayChange >= 0 ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                            ₹{Math.abs(holding.dayChange || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })} ({holding.dayChangePercent > 0 ? '+' : ''}{(holding.dayChangePercent || 0).toFixed(2)}%)
                          </p>
                        ) : (
                          <p className="font-label-sm text-on-surface-variant mt-1">
                            Value as of {new Date(holding.asOfDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </p>
                        )}
                      </div>
                      
                      {/* Context Menu */}
                      <div className="relative ml-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === holding.id ? null : holding.id); }}
                          className="flex items-center justify-center w-8 h-8 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-full active:scale-95 duration-100"
                        >
                          <MoreVertical size={20} />
                        </button>
                        {menuOpenId === holding.id && (
                          <>
                            <div className="fixed inset-0 z-[90]" onClick={(e) => { e.stopPropagation(); setMenuOpenId(null); }} />
                            <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-outline-variant rounded-xl shadow-lg z-[100] py-2 overflow-hidden">
                              <button 
                                onClick={(e) => { e.stopPropagation(); navigate(`/fund/${type}/${symbolParam}`); }}
                                className="w-full text-left px-4 py-3 font-body-md text-on-surface hover:bg-surface-container-low transition-colors"
                              >
                                View Details
                              </button>
                              <button 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  navigate('/trade/intent', { state: { holding_id: symbolParam, txn_type: 'buy', name: holding.instrument_name, price: holding.livePrice || 0 }}); 
                                }}
                                className="w-full text-left px-4 py-3 font-body-md text-on-surface hover:bg-surface-container-low transition-colors"
                              >
                                Trade Intent (Buy/Sell)
                              </button>
                              <div className="h-[1px] w-full bg-outline-variant/30 my-1" />
                              <button 
                                onClick={(e) => { e.stopPropagation(); alert(`Holding ${holding.instrument_name} removed`); setMenuOpenId(null); }}
                                className="w-full text-left px-4 py-3 font-body-md text-error hover:bg-error-container transition-colors"
                              >
                                Remove Holding
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Load More */}
          {hasMore && holdings.length > 0 && (
            <div className="p-4 flex justify-center border-t border-outline-variant/30">
              <button 
                onClick={loadMore}
                disabled={loadingMore}
                className="text-primary font-label-md hover:underline flex items-center gap-1 min-h-[44px] disabled:opacity-50"
              >
                {loadingMore ? 'Loading...' : 'Load More Holdings'}
                {!loadingMore && <ChevronDown size={18} />}
              </button>
            </div>
          )}
          
          {!hasMore && holdings.length > 0 && (
            <div className="p-4 flex justify-center border-t border-outline-variant/30">
              <p className="text-on-surface-variant font-label-sm">No more holdings to load.</p>
            </div>
          )}
          
        </div>
      </main>
    </div>
  );
}
