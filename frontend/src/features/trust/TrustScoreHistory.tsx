import { Header } from '../../components/common/Header';
import React from 'react';
import { Menu, Bell, ChevronRight, Calendar, BadgeCheck, AlertTriangle, AlertOctagon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function TrustScoreHistory() {
  const navigate = useNavigate();

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md antialiased pb-24 md:pb-0">
      {/* TopAppBar */}
      <header className="w-full top-0 sticky bg-surface dark:bg-surface-dim border-b border-outline-variant dark:border-outline shadow-sm dark:shadow-none z-40">
        <div className="flex justify-between items-center h-14 px-4 max-w-3xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate(-1)}
              aria-label="Back" 
              className="h-11 w-11 -ml-2 flex items-center justify-center text-on-surface-variant hover:bg-surface-container rounded-full transition-colors duration-200"
            >
              <Menu size={24} />
            </button>
            <Header />
          </div>
          <button aria-label="Notifications" className="h-11 w-11 -mr-2 flex items-center justify-center text-primary dark:text-primary-fixed-dim hover:bg-surface-container rounded-full transition-colors duration-200">
            <Bell size={24} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow px-4 py-6 pb-24 max-w-3xl mx-auto w-full">
        {/* Header Section */}
        <div className="mb-6">
          <h1 className="font-headline-md text-[24px] text-on-background mb-1 font-semibold">Trust Score History</h1>
          <p className="font-body-md text-on-surface-variant">Review all past verifications and advisor checks.</p>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-1 scrollbar-hide">
          <button className="px-4 py-2 rounded-full bg-primary text-on-primary font-label-md whitespace-nowrap min-h-[44px]">All Checks</button>
          <button className="px-4 py-2 rounded-full bg-surface-container text-on-surface-variant border border-outline-variant hover:bg-surface-container-high transition-colors font-label-md whitespace-nowrap min-h-[44px]">Advisors</button>
          <button className="px-4 py-2 rounded-full bg-surface-container text-on-surface-variant border border-outline-variant hover:bg-surface-container-high transition-colors font-label-md whitespace-nowrap min-h-[44px]">Brokers</button>
          <button className="px-4 py-2 rounded-full bg-surface-container text-on-surface-variant border border-outline-variant hover:bg-surface-container-high transition-colors font-label-md whitespace-nowrap min-h-[44px]">Funds</button>
        </div>

        {/* History List */}
        <div className="space-y-3">
          {/* Card 1: High Trust */}
          <button className="w-full text-left block bg-surface-container-lowest rounded-xl border border-outline-variant p-4 hover:bg-surface-container-low transition-colors duration-200 active:scale-[0.98]">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h2 className="font-headline-sm text-on-background">Rajesh Sharma Advisory</h2>
                <span className="font-label-sm text-on-surface-variant uppercase tracking-wider text-[12px]">Independent Advisor</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-headline-md text-[24px] text-secondary font-bold">92</span>
                <span className="font-label-sm text-on-surface-variant text-[12px]">Score</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <BadgeCheck className="text-secondary shrink-0" size={16} />
              <p className="font-body-md text-on-surface-variant">Verified SEBI registered - No regulatory red flags.</p>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-outline-variant">
              <span className="font-label-sm text-on-surface-variant flex items-center gap-1.5 text-[12px]">
                <Calendar size={14} /> Oct 12, 2023
              </span>
              <ChevronRight size={20} className="text-outline" />
            </div>
          </button>

          {/* Card 2: Medium Trust */}
          <button className="w-full text-left block bg-surface-container-lowest rounded-xl border border-outline-variant p-4 hover:bg-surface-container-low transition-colors duration-200 active:scale-[0.98]">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h2 className="font-headline-sm text-on-background">Apex Wealth Builders</h2>
                <span className="font-label-sm text-on-surface-variant uppercase tracking-wider text-[12px]">Mutual Fund Distributor</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-headline-md text-[24px] text-tertiary-container font-bold">74</span>
                <span className="font-label-sm text-on-surface-variant text-[12px]">Score</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="text-tertiary-container shrink-0" size={16} />
              <p className="font-body-md text-on-surface-variant">Minor past complaint resolved; high fee structure noted.</p>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-outline-variant">
              <span className="font-label-sm text-on-surface-variant flex items-center gap-1.5 text-[12px]">
                <Calendar size={14} /> Sep 28, 2023
              </span>
              <ChevronRight size={20} className="text-outline" />
            </div>
          </button>

          {/* Card 3: Low Trust */}
          <button className="w-full text-left block bg-surface-container-lowest rounded-xl border border-error p-4 hover:bg-surface-container-low transition-colors duration-200 active:scale-[0.98]">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h2 className="font-headline-sm text-on-background">Global FX Trading Ltd</h2>
                <span className="font-label-sm text-on-surface-variant uppercase tracking-wider text-[12px]">Forex Platform</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-headline-md text-[24px] text-error font-bold">31</span>
                <span className="font-label-sm text-on-surface-variant text-[12px]">Score</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <AlertOctagon className="text-error shrink-0" size={16} />
              <p className="font-body-md text-on-surface-variant">Unregistered entity. High risk of capital loss.</p>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-outline-variant">
              <span className="font-label-sm text-on-surface-variant flex items-center gap-1.5 text-[12px]">
                <Calendar size={14} /> Sep 05, 2023
              </span>
              <ChevronRight size={20} className="text-outline" />
            </div>
          </button>

          {/* Card 4: High Trust */}
          <button className="w-full text-left block bg-surface-container-lowest rounded-xl border border-outline-variant p-4 hover:bg-surface-container-low transition-colors duration-200 active:scale-[0.98]">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h2 className="font-headline-sm text-on-background">SafeGuard Bluechip Fund</h2>
                <span className="font-label-sm text-on-surface-variant uppercase tracking-wider text-[12px]">Equity Fund</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-headline-md text-[24px] text-secondary font-bold">88</span>
                <span className="font-label-sm text-on-surface-variant text-[12px]">Score</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <BadgeCheck className="text-secondary shrink-0" size={16} />
              <p className="font-body-md text-on-surface-variant">Consistent top quartile performance, transparent holdings.</p>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-outline-variant">
              <span className="font-label-sm text-on-surface-variant flex items-center gap-1.5 text-[12px]">
                <Calendar size={14} /> Aug 19, 2023
              </span>
              <ChevronRight size={20} className="text-outline" />
            </div>
          </button>
        </div>
      </main>
    </div>
  );
}
