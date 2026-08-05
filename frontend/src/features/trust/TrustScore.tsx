import { Header } from '../../components/common/Header';
import React, { useEffect, useState } from 'react';
import { ShieldCheck, Info, TrendingUp, ArrowLeft, Bell, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

export function TrustScore() {
  const navigate = useNavigate();
  const [progressOffset, setProgressOffset] = useState(282.7);
  const [apiData, setApiData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchScore() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (session) headers['Authorization'] = `Bearer ${session.access_token}`;
        const searchParams = new URLSearchParams(window.location.search);
        const entity = searchParams.get('entity') || 'SNEHA DESAI';
        const res = await fetch(`/api/trust/score?entity=${encodeURIComponent(entity)}`, { headers });
        const data = await res.json();
        setApiData(data);
        
        const offset = 282.7 * (1 - (data.score || 85) / 100);
        setTimeout(() => setProgressOffset(offset), 100);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchScore();
  }, []);

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col antialiased pb-24 md:pb-0 md:pt-14 selection:bg-primary-container selection:text-on-primary-container">
      {/* TopAppBar (Web) */}
      <header className="hidden md:flex justify-between items-center h-14 px-4 w-full top-0 sticky bg-surface dark:bg-surface-dim border-b border-outline-variant dark:border-outline shadow-sm dark:shadow-none z-40">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors">
            <ArrowLeft className="text-primary dark:text-primary-fixed-dim" size={24} />
          </button>
          <Header />
        </div>
        <div className="flex items-center gap-4">
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors text-primary dark:text-primary-fixed-dim">
            <Bell size={24} />
          </button>
        </div>
      </header>

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between h-14 px-4 bg-surface sticky top-0 z-40 shadow-sm border-b border-outline-variant">
        <button onClick={() => navigate(-1)} className="flex items-center justify-center w-11 h-11 -ml-2 rounded-full hover:bg-surface-container transition-colors">
          <ArrowLeft className="text-primary" size={24} />
        </button>
        <h1 className="font-headline-sm text-primary">Trust Detail</h1>
        <div className="w-11 h-11"></div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-4 md:grid-cols-8 gap-4 md:gap-6 w-full flex-grow">
        <div className="col-span-4 md:col-span-8 mb-3">
          <div className="flex items-center gap-3 mb-1">
            <ShieldCheck className="text-secondary fill-secondary/20" size={28} />
            <h2 className="font-headline-md text-on-surface">
              {loading ? <Loader2 className="animate-spin inline" size={20} /> : apiData?.entity?.name || 'AlphaTech Solutions Pvt Ltd'}
            </h2>
          </div>
          <p className="font-body-md text-on-surface-variant">Entity Registration & Operational Integrity Check</p>
        </div>

        <div className="col-span-4 md:col-span-3 bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-surface-container flex flex-col items-center justify-center h-full">
          <h3 className="font-headline-sm text-on-surface mb-6 text-center w-full">Aggregate Trust Score</h3>
          <div className="relative w-48 h-48 flex items-center justify-center mb-4">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle className="text-surface-container" cx="50" cy="50" fill="none" r="45" stroke="currentColor" strokeWidth="8"></circle>
              <circle 
                className="text-secondary transition-all duration-1000 ease-out" 
                cx="50" cy="50" fill="none" r="45" stroke="currentColor" 
                strokeDasharray="282.7" 
                strokeDashoffset={progressOffset} 
                strokeLinecap="round" strokeWidth="8"
              ></circle>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display-lg text-primary text-[40px]">
                {loading ? '--' : apiData?.score || '85'}
              </span>
              <span className="font-label-sm text-on-surface-variant uppercase tracking-widest mt-1">/ 100</span>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-secondary-container rounded-full mt-3">
            <ShieldCheck className="text-on-secondary-container" size={18} />
            <span className="font-label-md text-on-secondary-container">High Confidence</span>
          </div>
        </div>

        <div className="col-span-4 md:col-span-5 flex flex-col gap-4">
          <div className="bg-primary-container rounded-xl p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <Info className="text-on-primary-container mt-1 shrink-0" size={20} />
              <div>
                <h4 className="font-label-md text-on-primary-container mb-1">Analysis Summary</h4>
                <p className="font-body-md text-on-primary-container/90">
                  The score of 85 indicates a strong foundational integrity. The entity maintains perfect compliance with corporate registries. Minor deductions stem from brief anomalies in language patterns within recent public filings, though historical data remains highly consistent and reliable.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-4 md:p-6 shadow-sm border border-surface-container flex-grow">
            <h3 className="font-headline-sm text-on-surface mb-6">Category Contribution</h3>
            <div className="flex flex-col gap-6">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="font-label-md text-on-surface">Registry Check</span>
                  <span className="font-label-sm text-primary">100%</span>
                </div>
                <div className="w-full bg-surface-container rounded-full h-2">
                  <div className="bg-secondary h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="font-label-md text-on-surface">Language Patterns</span>
                  <span className="font-label-sm text-primary">80%</span>
                </div>
                <div className="w-full bg-surface-container rounded-full h-2">
                  <div className="bg-tertiary-fixed-dim h-2 rounded-full" style={{ width: '80%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="font-label-md text-on-surface">Historical Data</span>
                  <span className="font-label-sm text-primary">75%</span>
                </div>
                <div className="w-full bg-surface-container rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-4 md:col-span-8 bg-surface-container-lowest rounded-xl p-4 md:p-6 shadow-sm border border-surface-container relative overflow-hidden mt-2">
          <div className="flex justify-between items-center mb-6 relative z-10">
            <h3 className="font-headline-sm text-on-surface">Score History (6 Months)</h3>
            <span className="font-label-sm text-secondary flex items-center gap-1">
              <TrendingUp size={16} />
              +5 pts
            </span>
          </div>
          
          <div className="h-32 w-full relative z-10 flex items-end justify-between px-2">
            <svg className="w-full h-full absolute inset-0 preserve-aspect-ratio-none" preserveAspectRatio="none" viewBox="0 0 100 40">
              <path className="text-primary/40" d="M0,30 C10,25 20,35 30,20 C40,5 50,15 60,10 C70,5 80,20 90,15 L100,5" fill="none" stroke="currentColor" strokeWidth="2"></path>
              <path className="text-primary/10" d="M0,30 C10,25 20,35 30,20 C40,5 50,15 60,10 C70,5 80,20 90,15 L100,5 L100,40 L0,40 Z" fill="currentColor"></path>
              <circle className="text-primary" cx="30" cy="20" fill="currentColor" r="1.5"></circle>
              <circle className="text-primary" cx="60" cy="10" fill="currentColor" r="1.5"></circle>
              <circle className="text-primary" cx="90" cy="15" fill="currentColor" r="1.5"></circle>
              <circle className="text-secondary" cx="100" cy="5" fill="currentColor" r="2"></circle>
            </svg>
            <div className="w-full flex justify-between absolute bottom-0 text-on-surface-variant font-label-sm opacity-60 pb-1 px-1">
              <span>Oct</span>
              <span>Nov</span>
              <span>Dec</span>
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
            </div>
          </div>
        </div>

        <div className="col-span-4 md:col-span-8 flex flex-col sm:flex-row justify-end mt-4 gap-3">
          <button className="h-[48px] px-6 rounded-full border border-outline text-primary font-label-md hover:bg-surface-container-low transition-colors w-full sm:w-auto">
            Download Report
          </button>
          <button className="h-[48px] px-6 rounded-full bg-primary text-on-primary font-label-md hover:bg-primary-fixed-variant transition-colors shadow-sm w-full sm:w-auto">
            Investigate Flags
          </button>
        </div>
      </main>
    </div>
  );
}
