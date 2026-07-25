import React from 'react';
import { ShieldCheck, Info, TrendingUp, Download, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function TrustScore() {
  const navigate = useNavigate();
  return (
    <div className="flex-1 flex flex-col bg-surface overflow-y-auto px-4 pt-4 pb-20">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-surface-container-low transition-colors">
          <span className="material-symbols-outlined text-on-surface">arrow_back</span>
        </button>
        <h1 className="font-headline-sm text-primary">Trust Detail</h1>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="text-secondary" size={24} />
          <h2 className="font-headline-md text-on-surface">AlphaTech Solutions Pvt Ltd</h2>
        </div>
        <p className="font-body-md text-on-surface-variant text-sm">Entity Registration & Operational Integrity Check</p>
      </div>

      <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-surface-container flex flex-col items-center justify-center mb-4">
        <h3 className="font-headline-sm text-on-surface mb-6 text-center">Aggregate Trust Score</h3>
        <div className="relative w-40 h-40 flex items-center justify-center mb-4">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle className="text-surface-container stroke-current" cx="50" cy="50" fill="none" r="45" strokeWidth="8" />
            <circle className="text-secondary stroke-current" cx="50" cy="50" fill="none" r="45" strokeDasharray="282.7" strokeDashoffset="42.4" strokeLinecap="round" strokeWidth="8" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display-lg text-primary text-4xl font-bold">85</span>
            <span className="font-label-sm text-on-surface-variant uppercase tracking-widest text-[10px]">/ 100</span>
          </div>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-secondary-container rounded-full">
          <ShieldCheck className="text-[#087347]" size={16} />
          <span className="font-label-md text-[#087347]">High Confidence</span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="bg-primary-container rounded-xl p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <Info className="text-on-primary-container mt-0.5 flex-shrink-0" size={20} />
            <div>
              <h4 className="font-label-md text-on-primary-container mb-1">Analysis Summary</h4>
              <p className="font-body-md text-on-primary-container/90 text-sm">
                The score of 85 indicates a strong foundational integrity. The entity maintains perfect compliance with corporate registries. Minor deductions stem from brief anomalies in language patterns within recent public filings.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-surface-container">
          <h3 className="font-headline-sm text-on-surface mb-4">Category Contribution</h3>
          
          <div className="mb-4">
            <div className="flex justify-between items-end mb-1">
              <span className="font-label-md text-on-surface">Registry Check</span>
              <span className="font-label-sm text-primary">100%</span>
            </div>
            <div className="w-full bg-surface-container rounded-full h-2">
              <div className="bg-secondary h-2 rounded-full" style={{ width: '100%' }} />
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between items-end mb-1">
              <span className="font-label-md text-on-surface">Language Patterns</span>
              <span className="font-label-sm text-primary">80%</span>
            </div>
            <div className="w-full bg-surface-container rounded-full h-2">
              <div className="bg-[#ffb95f] h-2 rounded-full" style={{ width: '80%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-end mb-1">
              <span className="font-label-md text-on-surface">Historical Data</span>
              <span className="font-label-sm text-primary">75%</span>
            </div>
            <div className="w-full bg-surface-container rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }} />
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-surface-container mt-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-headline-sm text-on-surface">Score History (6 Mo)</h3>
            <span className="font-label-sm text-secondary flex items-center gap-1">
              <TrendingUp size={16} /> +5 pts
            </span>
          </div>
          <div className="h-24 bg-surface-container/50 rounded-lg flex items-center justify-center border border-outline-variant/30">
            <span className="text-on-surface-variant font-label-sm">Chart Placeholder</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-4">
          <button className="h-[48px] rounded-full border border-outline text-primary font-label-md hover:bg-surface-container-low transition-colors flex items-center justify-center gap-2">
            <Download size={20} /> Download Report
          </button>
          <button className="h-[48px] rounded-full bg-primary text-on-primary font-label-md hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-sm">
            <Search size={20} /> Investigate Flags
          </button>
        </div>
      </div>
    </div>
  );
}
