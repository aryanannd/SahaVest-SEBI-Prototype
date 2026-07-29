import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, FileSearch, Lightbulb, BookOpen, ShieldAlert, Flag } from "lucide-react";
import { Header } from '../../components/common/Header';

export function ScamCheckResult() {
  const navigate = useNavigate();

  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen flex flex-col antialiased selection:bg-primary-container selection:text-on-primary-container">
      {/* TopAppBar */}
      <header className="w-full sticky top-0 z-50 bg-surface dark:bg-surface-dim border-b border-outline-variant dark:border-outline flex items-center justify-between px-4 py-3 max-w-7xl mx-auto h-[64px]">
        <button 
          onClick={() => navigate(-1)}
          aria-label="Go back" 
          className="w-11 h-11 flex items-center justify-center text-on-surface-variant dark:text-on-surface-variant hover:bg-surface-container-low dark:hover:bg-surface-container-highest transition-colors rounded-full active:scale-95 duration-100"
        >
          <ArrowLeft size={24} />
        </button>
        <Header />
        <div className="w-11 h-11 flex items-center justify-center text-on-surface-variant">
          {/* Empty div for balance */}
        </div>
      </header>
      
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8 flex flex-col gap-6 pb-32">
        
        {/* Score Section (Bento Card 1) */}
        <section className="bg-surface-container-lowest rounded-xl border border-error-container shadow-sm p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
          {/* Subtle animated background for danger */}
          <div className="absolute inset-0 bg-error-container/20 animate-pulse pointer-events-none"></div>
          <div className="relative z-10 flex flex-col items-center">
            <AlertTriangle size={64} className="text-error mb-3" fill="currentColor" />
            <h1 className="font-display-lg-mobile md:font-display-lg text-on-surface mb-1">
              High Risk Detected
            </h1>
            <p className="font-body-lg text-on-surface-variant mb-4 max-w-md">
              This message shows strong signs of a <strong>'Pump and Dump'</strong> scheme.
            </p>
            
            {/* Trust Score Ring */}
            <div className="relative w-48 h-48 flex items-center justify-center my-4">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle className="text-surface-variant" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeWidth="8"></circle>
                <circle 
                  className="text-error transition-all duration-1000 ease-out" 
                  cx="50" cy="50" 
                  fill="transparent" 
                  r="40" 
                  stroke="currentColor" 
                  strokeDasharray="251.2" 
                  strokeDashoffset="200.96" 
                  strokeWidth="8"
                ></circle> {/* 20/100 score */}
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="font-display-lg text-error">20</span>
                <span className="font-label-sm text-on-surface-variant uppercase tracking-wider">Trust Score</span>
              </div>
            </div>
          </div>
        </section>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Analysis Section (Left/Top) */}
          <section className="md:col-span-7 bg-surface-container-lowest rounded-xl border border-outline-variant p-4 flex flex-col">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-surface-variant">
              <FileSearch size={24} className="text-primary" fill="currentColor" />
              <h2 className="font-headline-sm text-on-surface">Analysis Report</h2>
            </div>
            
            <div className="bg-surface-container-low rounded-lg p-4 overflow-y-auto max-h-[300px] font-body-md text-on-surface leading-relaxed relative">
              {/* Original pasted text with highlights */}
              <p>
                "URGENT: <mark className="bg-error-container text-on-error-container px-1 rounded font-medium cursor-help group relative">Guaranteed 500% returns<span className="absolute hidden group-hover:block bottom-full left-0 mb-1 w-48 bg-inverse-surface text-inverse-on-surface font-label-sm p-2 rounded shadow-lg z-20">Red Flag: Unrealistic guarantee of returns.</span></mark> on a secret micro-cap stock! Insider information reveals institutional buying starts TOMORROW. 
                <mark className="bg-tertiary-fixed text-on-tertiary-fixed px-1 rounded font-medium cursor-help group relative">Act now before it's too late.<span className="absolute hidden group-hover:block bottom-full left-0 mb-1 w-48 bg-inverse-surface text-inverse-on-surface font-label-sm p-2 rounded shadow-lg z-20">Yellow Flag: Creates false sense of urgency.</span></mark> 
                Click the link below to download the app and deposit your funds directly to secure your shares. 
                <mark className="bg-error-container text-on-error-container px-1 rounded font-medium cursor-help group relative">Zero risk involved.<span className="absolute hidden group-hover:block bottom-full right-0 mb-1 w-48 bg-inverse-surface text-inverse-on-surface font-label-sm p-2 rounded shadow-lg z-20">Red Flag: All investments carry risk.</span></mark>"
              </p>
            </div>
            
            <div className="mt-4 flex gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-error-container border border-error"></div>
                <span className="font-label-sm text-on-surface-variant">Critical Red Flags</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-tertiary-fixed border border-tertiary"></div>
                <span className="font-label-sm text-on-surface-variant">Suspicious Phrasing</span>
              </div>
            </div>
          </section>
          
          {/* Explanation & Actions Section (Right/Bottom) */}
          <section className="md:col-span-5 flex flex-col gap-4">
            {/* What is this? Card */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4">
              <div className="flex items-center gap-3 mb-3">
                <Lightbulb size={24} className="text-tertiary" fill="currentColor" />
                <h3 className="font-headline-sm text-on-surface">What is a 'Pump and Dump'?</h3>
              </div>
              <p className="font-body-md text-on-surface-variant mb-4">
                Scammers heavily promote ("pump") an obscure stock using false or misleading statements to artificially inflate its price. Once the price rises, they sell ("dump") their shares, causing the price to crash and leaving new investors with massive losses.
              </p>
              <button className="w-full flex items-center justify-center gap-2 bg-surface-container text-on-surface font-label-md py-3 px-4 rounded-full hover:bg-surface-container-highest transition-colors min-h-[48px]">
                <BookOpen size={18} />
                Learn More About This Scam
              </button>
            </div>
            
            {/* Primary Action Card */}
            <div className="bg-error-container rounded-xl border border-error/20 p-4 flex flex-col items-center text-center">
              <ShieldAlert size={40} className="text-on-error-container mb-3" />
              <h3 className="font-headline-sm text-on-error-container mb-2">Help Protect Others</h3>
              <p className="font-body-md text-on-error-container/80 mb-4">
                Reporting this helps authorities track down scammers and prevents other investors from falling victim.
              </p>
              <button 
                onClick={() => navigate('/trust/report-scam')}
                className="w-full flex items-center justify-center gap-2 bg-error text-on-error font-label-md py-3 px-4 rounded-full hover:bg-error/90 transition-colors shadow-sm min-h-[48px] active:scale-[0.98]"
              >
                <Flag size={18} />
                Report to Authorities
              </button>
            </div>
          </section>
          
        </div>
      </main>
    </div>
  );
}
