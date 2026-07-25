import React from 'react';
import { useNavigate } from 'react-router-dom';

export function ReturnsDetail() {
  const navigate = useNavigate();

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md antialiased selection:bg-primary-container selection:text-on-primary-container">
      {/* Mobile Header (Minimal Contextual) */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-surface w-full sticky top-0 z-50 border-b border-outline-variant">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-full hover:bg-surface-container-low transition-colors flex items-center justify-center min-w-[44px] min-h-[44px]"
        >
          <span className="material-symbols-outlined text-on-surface text-[24px]">arrow_back</span>
        </button>
        <h1 className="font-headline-sm text-on-surface">Returns Detail</h1>
        <div className="w-[44px]"></div> {/* Spacer for centering */}
      </header>

      {/* Main Canvas */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 flex flex-col gap-6 pb-[100px] md:pb-6">
        
        {/* Hero Section */}
        <section className="flex flex-col gap-2 md:gap-4 mb-4">
          <h1 className="font-display-lg-mobile md:font-display-lg text-on-surface">XIRR &amp; Returns</h1>
          <p className="font-body-md text-on-surface-variant max-w-2xl">A detailed breakdown of your annualized performance across all invested asset classes.</p>
        </section>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-4 md:grid-cols-8 gap-4 md:gap-6">
          
          {/* Global Portfolio Summary Card */}
          <div className="col-span-4 md:col-span-8 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
            {/* Abstract visual element */}
            <div className="absolute right-0 top-0 w-64 h-64 bg-primary-fixed-dim opacity-20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            <div className="flex flex-col gap-1 relative z-10">
              <span className="font-label-sm text-on-surface-variant uppercase tracking-wider">Total Portfolio XIRR</span>
              <div className="flex items-baseline gap-3">
                <span className="font-display-lg-mobile md:font-display-lg text-secondary">14.82%</span>
                <span className="material-symbols-outlined text-secondary text-[24px]">trending_up</span>
              </div>
            </div>
            <div className="flex flex-col gap-1 relative z-10 md:text-right">
              <span className="font-label-sm text-on-surface-variant uppercase tracking-wider">Absolute Returns</span>
              <div className="font-headline-md text-secondary">+₹3,42,890</div>
            </div>
          </div>

          {/* Asset Class Cards */}
          {/* Equity Card */}
          <div className="col-span-4 md:col-span-4 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-surface-variant pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed">
                  <span className="material-symbols-outlined icon-fill">monitoring</span>
                </div>
                <h3 className="font-headline-sm text-on-surface">Direct Equity</h3>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex flex-col gap-1">
                <span className="font-label-sm text-on-surface-variant">XIRR</span>
                <span className="font-headline-sm text-secondary">18.4%</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-label-sm text-on-surface-variant">Absolute</span>
                <span className="font-body-lg text-secondary">+₹2,10,400</span>
              </div>
            </div>
          </div>

          {/* Mutual Funds Card */}
          <div className="col-span-4 md:col-span-4 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-surface-variant pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed">
                  <span className="material-symbols-outlined icon-fill">pie_chart</span>
                </div>
                <h3 className="font-headline-sm text-on-surface">Mutual Funds</h3>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex flex-col gap-1">
                <span className="font-label-sm text-on-surface-variant">XIRR</span>
                <span className="font-headline-sm text-secondary">12.1%</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-label-sm text-on-surface-variant">Absolute</span>
                <span className="font-body-lg text-secondary">+₹1,45,600</span>
              </div>
            </div>
          </div>

          {/* SGB / Gold Card */}
          <div className="col-span-4 md:col-span-4 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-surface-variant pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-tint/20 flex items-center justify-center text-surface-tint">
                  <span className="material-symbols-outlined icon-fill">diamond</span>
                </div>
                <h3 className="font-headline-sm text-on-surface">Digital Gold (SGB)</h3>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex flex-col gap-1">
                <span className="font-label-sm text-on-surface-variant">XIRR</span>
                <span className="font-headline-sm text-secondary">8.5%</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-label-sm text-on-surface-variant">Absolute</span>
                <span className="font-body-lg text-secondary">+₹12,450</span>
              </div>
            </div>
          </div>

          {/* International Equity (Negative Return Example) */}
          <div className="col-span-4 md:col-span-4 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-surface-variant pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-error-container flex items-center justify-center text-on-error-container">
                  <span className="material-symbols-outlined icon-fill">public</span>
                </div>
                <h3 className="font-headline-sm text-on-surface">International Equity</h3>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex flex-col gap-1">
                <span className="font-label-sm text-on-surface-variant">XIRR</span>
                <span className="font-headline-sm text-error">-4.2%</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-label-sm text-on-surface-variant">Absolute</span>
                <span className="font-body-lg text-error">-₹25,560</span>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 bg-surface-container rounded-lg p-4 flex items-start gap-3">
          <span className="material-symbols-outlined text-outline mt-0.5">info</span>
          <p className="font-label-md text-on-surface-variant">
            XIRR may be less accurate for portfolios with less than 3 months of history.
          </p>
        </div>
      </main>
    </div>
  );
}
