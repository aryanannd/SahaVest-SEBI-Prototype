import { Header } from '../../components/common/Header';
import React, { useState, useMemo, useEffect } from 'react';
import { Search, User, Activity, Info, Play, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

export function Simulator() {
  const [sip, setSip] = useState(50000);
  const [years, setYears] = useState(15);
  const [rate, setRate] = useState(12);
  const [simulated, setSimulated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiData, setApiData] = useState<any>(null);
  // Live portfolio corpus (fetched from same endpoint as Dashboard)
  const [corpus, setCorpus] = useState<number>(0);
  const [corpusLoading, setCorpusLoading] = useState(true);

  const navigate = useNavigate();

  // Fetch real portfolio net worth on mount
  useEffect(() => {
    async function fetchNetWorth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const headers: HeadersInit = {};
        if (session) headers['Authorization'] = `Bearer ${session.access_token}`;
        const res = await fetch('http://localhost:3000/api/portfolio/exposure/me', { headers });
        const data = await res.json();
        if (data.totalValue != null && data.totalValue > 0) {
          setCorpus(Math.round(data.totalValue));
        } else {
          setCorpus(0);
        }
      } catch (err) {
        console.error('Failed to fetch portfolio value:', err);
        setCorpus(0);
      } finally {
        setCorpusLoading(false);
      }
    }
    fetchNetWorth();
  }, []);

  const data = useMemo(() => {
    let current = corpus;
    let optCurrent = corpus;
    let consCurrent = corpus;
    const pts = [];
    
    for (let i = 0; i <= years; i++) {
      pts.push({ 
        year: i, 
        expected: Math.round(current),
        optimistic: Math.round(optCurrent),
        conservative: Math.round(consCurrent)
      });
      current = (current + (sip * 12)) * (1 + rate / 100);
      optCurrent = (optCurrent + (sip * 12)) * (1 + (rate + 2) / 100);
      consCurrent = (consCurrent + (sip * 12)) * (1 + (rate - 2) / 100);
    }
    return pts;
  }, [sip, years, rate, corpus]);


  const finalValue = data[data.length - 1]?.expected || 0;
  const optFinalValue = data[data.length - 1]?.optimistic || 0;
  const consFinalValue = data[data.length - 1]?.conservative || 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(value);
  };
  const formatCrore = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
    return `₹${value.toLocaleString('en-IN')}`;
  };

  return (
    <div className="bg-surface text-on-surface antialiased flex flex-col min-h-screen">
      {!simulated ? (
        <>
          <header className="w-full sticky top-0 z-50 bg-surface text-primary border-b border-outline-variant">
            <div className="flex items-center justify-between px-4 py-2 w-full max-w-7xl mx-auto">
              <button aria-label="Search" className="h-[44px] w-[44px] flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors active:scale-95 duration-100 text-on-surface-variant">
                <Search size={24} />
              </button>
              <Header />
              <button aria-label="Account" className="h-[44px] w-[44px] flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors active:scale-95 duration-100 text-on-surface-variant">
                <User size={24} />
              </button>
            </div>
          </header>
          
          <main className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-lg py-6 md:py-xl pb-24 md:pb-lg">
            <div className="mb-8">
              <h1 className="font-display-lg-mobile md:font-display-lg text-primary mb-1">Investor Twin Simulator</h1>
              <p className="font-body-md text-on-surface-variant max-w-2xl">Model potential futures based on historical data. Adjust your inputs to see how your portfolio might evolve.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4 order-2 lg:order-1">
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 flex flex-col h-full shadow-sm">
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-outline-variant">
                    <Activity className="text-primary w-6 h-6" />
                    <h2 className="font-headline-sm text-on-surface">Current Context</h2>
                  </div>
                  <div className="space-y-4 flex-grow">
                    <div>
                      <p className="font-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Active SIPs</p>
                      <p className="font-headline-md text-primary">₹25,000 <span className="font-body-md text-on-surface-variant">/ mo</span></p>
                    </div>
                    <div>
                      <p className="font-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Current Portfolio Value</p>
                      {corpusLoading ? (
                        <div className="flex items-center gap-2 text-on-surface-variant">
                          <Loader2 size={16} className="animate-spin" />
                          <span className="font-body-md">Fetching from portfolio...</span>
                        </div>
                      ) : corpus > 0 ? (
                        <div>
                          <p className="font-headline-sm text-on-surface">{formatCrore(corpus)}</p>
                          <p className="font-label-sm text-secondary mt-0.5">✓ Live from portfolio</p>
                        </div>
                      ) : (
                        <div>
                          <p className="font-headline-sm text-on-surface">₹0</p>
                          <p className="font-label-sm text-outline mt-0.5">No holdings found — add holdings to see real value</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-6 bg-surface-container p-3 rounded-lg flex items-start gap-3">
                    <Info className="text-secondary w-5 h-5 shrink-0 mt-0.5" />
                    <p className="font-label-md text-on-surface-variant">The simulation will build upon your existing portfolio value by default.</p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-8 order-1 lg:order-2">
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm">
                  <h2 className="font-headline-sm text-on-surface mb-6">Simulation Parameters</h2>
                  <div className="space-y-8">
                    <div>
                      <div className="flex justify-between items-end mb-3">
                        <label className="font-label-md text-on-surface">Monthly SIP Amount (₹)</label>
                        <span className="font-headline-sm text-primary">{formatCurrency(sip)}</span>
                      </div>
                      <div className="relative pt-3 pb-4">
                        <input type="range" min="5000" max="200000" step="1000" value={sip} onChange={(e) => setSip(Number(e.target.value))} className="w-full accent-primary" />
                        <div className="flex justify-between mt-2 font-label-sm text-outline">
                          <span>₹5K</span><span>₹200K</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-end mb-3">
                        <label className="font-label-md text-on-surface">Investment Duration (Years)</label>
                        <span className="font-headline-sm text-primary">{years}</span>
                      </div>
                      <div className="relative pt-3 pb-4">
                        <input type="range" min="5" max="40" step="1" value={years} onChange={(e) => setYears(Number(e.target.value))} className="w-full accent-primary" />
                        <div className="flex justify-between mt-2 font-label-sm text-outline">
                          <span>5 Yrs</span><span>40 Yrs</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-end mb-3">
                        <label className="font-label-md text-on-surface">Expected Annual Return (%)</label>
                        <span className="font-headline-sm text-primary">{rate.toFixed(1)}%</span>
                      </div>
                      <div className="relative pt-3 pb-4">
                        <input type="range" min="6" max="20" step="0.5" value={rate} onChange={(e) => setRate(Number(e.target.value))} className="w-full accent-primary z-10 relative" />
                        <div className="absolute w-full h-[4px] bg-secondary-fixed-dim/30 top-[17px] rounded-full pointer-events-none z-0">
                          <div className="absolute h-full bg-secondary-container rounded-full" style={{ left: '28.5%', width: '35.7%' }}></div>
                        </div>
                        <div className="flex justify-between mt-2 font-label-sm text-outline relative">
                          <span>6%</span><span className="absolute left-[46%] -ml-[40px] text-secondary">Historical Avg (10-15%)</span><span>20%</span>
                        </div>
                      </div>
                    </div>
                    <div className="pt-6 border-t border-outline-variant flex justify-end">
                      <button onClick={async () => {
                         setLoading(true);
                         try {
                           const { data: { session } } = await supabase.auth.getSession();
                           const headers: HeadersInit = { 'Content-Type': 'application/json' };
                           if (session) headers['Authorization'] = `Bearer ${session.access_token}`;
                           
                           const res = await fetch('http://localhost:3000/api/simulation/run', {
                             method: 'POST',
                             headers,
                             body: JSON.stringify({ sipAmount: sip, duration: years, returnRate: rate })
                           });
                           const data = await res.json();
                           setApiData(data);
                           setSimulated(true);
                         } catch (e) {
                           console.error(e);
                           setSimulated(true);
                         } finally {
                           setLoading(false);
                         }
                      }} disabled={loading} className="bg-primary text-on-primary font-label-md h-[48px] px-6 rounded-full hover:bg-primary-container transition-colors active:scale-95 duration-100 flex items-center gap-2 shadow-sm">
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Play size={20} />} 
                        {loading ? 'Running...' : 'Run Simulation'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </>
      ) : (
        <>
          <header className="w-full sticky top-0 z-50 bg-surface border-b border-outline-variant px-4 py-2 flex items-center h-16">
            <button onClick={() => setSimulated(false)} aria-label="Go back" className="w-[44px] h-[44px] flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors">
              <ArrowLeft className="text-on-surface" size={24} />
            </button>
            <h1 className="font-headline-md text-primary ml-2 tracking-tight">Simulator Results</h1>
            <div className="flex-grow"></div>
          </header>

          <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-6 pb-[100px] md:pb-6 flex flex-col gap-6">
            <section className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant relative overflow-hidden">
              <div className="relative z-10 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-secondary">
                  <CheckCircle2 size={24} className="fill-secondary text-surface" />
                  <span className="font-label-md uppercase tracking-widest text-on-surface-variant">Projection Complete</span>
                </div>
                <p className="font-body-lg text-on-surface-variant">In {years} years, your investment could grow to</p>
                <div className="flex items-end gap-2">
                  <h2 className="font-display-lg-mobile md:font-display-lg text-primary">{formatCurrency(finalValue)}</h2>
                  <span className="font-label-md text-on-surface-variant mb-2">Expected</span>
                </div>
              </div>
            </section>

            <section className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="font-headline-sm text-on-surface">Growth Scenarios</h3>
                <div className="flex gap-3">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-secondary"></div>
                    <span className="font-label-sm text-on-surface-variant">Optimistic</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                    <span className="font-label-sm text-on-surface-variant">Expected</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-outline"></div>
                    <span className="font-label-sm text-on-surface-variant">Conservative</span>
                  </div>
                </div>
              </div>
              <div className="w-full h-64 md:h-80 relative mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data} margin={{ top: 10, right: 0, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="colorOpt" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#006d42" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#006d42" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#002653" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#002653" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorCons" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#747780" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#747780" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e1e3e4" />
                    <Tooltip formatter={(value: any) => [`₹${(value / 100000).toFixed(1)}L`, 'Portfolio Value']} labelFormatter={(label) => `Year ${label}`} />
                    <Area type="monotone" dataKey="optimistic" stroke="#006d42" strokeWidth={2} fillOpacity={1} fill="url(#colorOpt)" />
                    <Area type="monotone" dataKey="expected" stroke="#002653" strokeWidth={3} fillOpacity={1} fill="url(#colorExp)" />
                    <Area type="monotone" dataKey="conservative" stroke="#747780" strokeDasharray="6 4" strokeWidth={2} fillOpacity={1} fill="url(#colorCons)" />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="absolute bottom-[-24px] left-0 w-full flex justify-between px-2">
                  <span className="font-label-sm text-on-surface-variant">Today</span>
                  <span className="font-label-sm text-on-surface-variant">Year {Math.floor(years/3)}</span>
                  <span className="font-label-sm text-on-surface-variant">Year {Math.floor((years*2)/3)}</span>
                  <span className="font-label-sm text-on-surface-variant">Year {years}</span>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant flex flex-col gap-1">
                <span className="font-label-md text-secondary uppercase">Optimistic ({(rate + 2).toFixed(1)}% CAGR)</span>
                <span className="font-headline-sm text-on-surface">{formatCurrency(optFinalValue)}</span>
                <p className="font-body-md text-on-surface-variant text-sm">Assuming strong market performance.</p>
              </div>
              <div className="bg-primary-container rounded-xl p-4 border border-primary-container flex flex-col gap-1 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-primary-fixed opacity-10 rounded-bl-full"></div>
                <span className="font-label-md text-primary-fixed uppercase">Expected ({rate.toFixed(1)}% CAGR)</span>
                <span className="font-headline-sm text-on-primary">{formatCurrency(finalValue)}</span>
                <p className="font-body-md text-on-primary-container text-sm">Based on historical average returns.</p>
              </div>
              <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant flex flex-col gap-1">
                <span className="font-label-md text-outline uppercase">Conservative ({(rate - 2).toFixed(1)}% CAGR)</span>
                <span className="font-headline-sm text-on-surface">{formatCurrency(consFinalValue)}</span>
                <p className="font-body-md text-on-surface-variant text-sm">A protective stance against volatility.</p>
              </div>
            </section>

            {apiData && (
              <section className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant flex flex-col gap-2 mt-4">
                <div className="flex items-start gap-4 p-4 border-b border-outline-variant">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0"></div>
                  <div>
                    <p className="font-label-sm text-on-surface-variant uppercase mb-1">Total Invested (Inc. current)</p>
                    <p className="font-headline-sm text-on-surface">₹{formatCurrency(apiData.totalInvested)}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4">
                  <div className="w-2 h-2 rounded-full bg-secondary mt-2 shrink-0"></div>
                  <div>
                    <p className="font-label-sm text-on-surface-variant uppercase mb-1">Wealth Gained</p>
                    <p className="font-headline-sm text-on-surface">₹{formatCurrency(apiData.wealthGained)}</p>
                  </div>
                </div>
              </section>
            )}

            <section className="bg-surface-container-low rounded-xl p-4 flex gap-4 items-start mt-4">
              <Info className="text-outline mt-1 shrink-0" size={24} />
              <p className="font-body-md text-on-surface-variant text-sm leading-relaxed">
                This is an educational simulation based on historical data and does not guarantee future results. Markets fluctuate, but steady, disciplined investing historically builds resilience. Your capital is monitored carefully.
              </p>
            </section>

            <section className="flex flex-col md:flex-row gap-4 mt-6">
              <button className="flex-1 bg-primary text-on-primary h-14 rounded-full font-label-md flex items-center justify-center hover:bg-primary/90 transition-colors">
                Save This Plan
              </button>
              <button onClick={() => setSimulated(false)} className="flex-1 bg-surface-container-lowest text-primary border border-primary h-14 rounded-full font-label-md flex items-center justify-center hover:bg-surface-container-low transition-colors">
                Adjust Parameters
              </button>
            </section>
          </main>
        </>
      )}
    </div>
  );
}
