import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, FileText, Sparkles, CheckCircle2, BookOpen, LayoutDashboard, Wallet, Shield } from "lucide-react";

export function DocumentSimplifier() {
  const navigate = useNavigate();

  return (
    <div className="bg-background text-on-background min-h-screen pb-[80px] md:pb-0 font-body-md text-body-md antialiased">
      {/* TopAppBar */}
      <header className="w-full sticky top-0 z-50 bg-surface border-b border-outline-variant">
        <div className="flex items-center justify-between px-4 py-3 w-full max-w-7xl mx-auto">
          <button className="w-[44px] h-[44px] flex items-center justify-center text-primary active:scale-95 duration-100 hover:bg-surface-container-low transition-colors rounded-full">
            <Search size={24} />
          </button>
          <h1 
            className="font-headline-md text-primary tracking-tight cursor-pointer"
            onClick={() => navigate('/')}
          >
            SahaVest
          </h1>
          <button className="w-[44px] h-[44px] flex items-center justify-center text-primary active:scale-95 duration-100 hover:bg-surface-container-low transition-colors rounded-full">
            <User size={24} fill="currentColor" />
          </button>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-6 w-full flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex flex-col gap-2 mb-3">
          <div className="flex items-center gap-2 text-on-surface-variant font-label-md">
            <FileText size={18} />
            <span>Document Simplifier</span>
          </div>
          <h2 className="font-display-lg-mobile md:font-display-lg text-primary">Mutual Fund Scheme Information Document</h2>
          <p className="font-body-md text-on-surface-variant max-w-2xl">Understanding complex financial jargon simplified into clear, actionable insights.</p>
        </div>

        {/* Main Content Area: Side by side on Desktop, Stacked on Mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          
          {/* Original Text Panel */}
          <div className="flex flex-col gap-3 bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-sm">
            <div className="bg-surface-container-low px-4 py-3 border-b border-outline-variant flex justify-between items-center">
              <h3 className="font-headline-sm text-on-surface">Original Document Excerpt</h3>
              <span className="bg-surface-variant text-on-surface-variant px-2 py-1 rounded font-label-sm">Section 4.2.1</span>
            </div>
            <div className="p-4 text-on-surface-variant font-body-md leading-relaxed h-[400px] overflow-y-auto">
              <p className="mb-4">The Scheme shall be subject to an Expense Ratio, which is calculated as a percentage of the daily net assets of the scheme. The AMC may charge the scheme with investment and advisory fees which shall be within the limits prescribed under Regulation 52 of the SEBI (Mutual Funds) Regulations, 1996.</p>
              <p className="mb-4">Furthermore, an Exit Load may be applicable if units are redeemed or switched out before the completion of a specified holding period from the date of allotment. The Exit Load, if any, will be deducted from the Nav applicable for redemption.</p>
              <p>The Total Expense Ratio (TER) encompasses all recurring expenses including the investment management and advisory fee, sales and routing charges, audit fees, custodian fees, registrar and transfer agent fees, and marketing and selling expenses.</p>
            </div>
          </div>

          {/* Simplified Text Panel */}
          <div className="flex flex-col gap-3 bg-surface-container-lowest rounded-xl border border-primary-fixed overflow-hidden shadow-sm relative">
            {/* Decorative AI indicator */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-fixed opacity-20 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none"></div>
            
            <div className="bg-primary-container px-4 py-3 border-b border-outline-variant flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles size={20} className="text-on-primary" fill="currentColor" />
                <h3 className="font-headline-sm text-on-primary">AI Plain-English Summary</h3>
              </div>
            </div>
            
            <div className="p-4 h-[400px] overflow-y-auto flex flex-col gap-4">
              <p className="font-body-md text-on-surface">Here is what the original text means in simple terms:</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 bg-surface-container-low p-3 rounded-lg">
                  <CheckCircle2 size={24} className="text-secondary mt-0.5 shrink-0" />
                  <div>
                    <span className="font-label-md font-bold text-on-surface block mb-1">Ongoing Costs (Expense Ratio)</span>
                    <span className="font-body-md text-on-surface-variant">The fund charges a yearly fee to manage your money. This fee is automatically deducted from the fund's value; you don't pay it directly from your pocket.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3 bg-surface-container-low p-3 rounded-lg">
                  <CheckCircle2 size={24} className="text-secondary mt-0.5 shrink-0" />
                  <div>
                    <span className="font-label-md font-bold text-on-surface block mb-1">Early Withdrawal Fee (Exit Load)</span>
                    <span className="font-body-md text-on-surface-variant">If you take your money out too soon (usually within a year), you might have to pay a small penalty fee.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3 bg-surface-container-low p-3 rounded-lg">
                  <CheckCircle2 size={24} className="text-secondary mt-0.5 shrink-0" />
                  <div>
                    <span className="font-label-md font-bold text-on-surface block mb-1">What's Included in Costs</span>
                    <span className="font-body-md text-on-surface-variant">The yearly fee covers everything needed to run the fund: paying the fund manager, administrative costs, and marketing.</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Glossary Section */}
        <div className="mt-4 bg-surface-container-lowest rounded-xl border border-outline-variant p-4 md:p-6">
          <h3 className="font-headline-md text-primary mb-4 flex items-center gap-2">
            <BookOpen size={24} />
            Key Terms Explained
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Term 1 */}
            <div className="bg-surface-container border border-outline-variant rounded-lg p-4">
              <h4 className="font-headline-sm mb-2 text-primary">Expense Ratio</h4>
              <p className="font-body-md text-on-surface-variant">The annual fee that all funds or ETFs charge their shareholders. It is expressed as a percentage of assets deducted each fiscal year for fund expenses. Lower is better for your returns.</p>
            </div>
            {/* Term 2 */}
            <div className="bg-surface-container border border-outline-variant rounded-lg p-4">
              <h4 className="font-headline-sm mb-2 text-primary">Exit Load</h4>
              <p className="font-body-md text-on-surface-variant">A fee charged to an investor for redeeming (selling) units of a mutual fund before a specified period. It's designed to discourage early withdrawals and protect long-term investors.</p>
            </div>
            {/* Term 3 */}
            <div className="bg-surface-container border border-outline-variant rounded-lg p-4">
              <h4 className="font-headline-sm mb-2 text-primary">NAV (Net Asset Value)</h4>
              <p className="font-body-md text-on-surface-variant">The price of one unit of a mutual fund. It is calculated by dividing the total value of all the assets in a portfolio, minus any liabilities, by the number of outstanding units.</p>
            </div>
            {/* Term 4 */}
            <div className="bg-surface-container border border-outline-variant rounded-lg p-4">
              <h4 className="font-headline-sm mb-2 text-primary">AMC (Asset Management Company)</h4>
              <p className="font-body-md text-on-surface-variant">The company that pools money from investors and invests it in a variety of securities. They are responsible for making investment decisions for the mutual fund.</p>
            </div>
          </div>
        </div>
      </main>

      {/* BottomNavBar (Mobile only) */}
      <nav className="fixed bottom-0 w-full z-50 border-t border-outline-variant bg-surface md:hidden">
        <div className="flex justify-around items-center w-full h-[64px] px-2 pb-safe">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex flex-col items-center justify-center text-on-surface-variant p-2 active:scale-90 duration-200 hover:bg-surface-container-high rounded-full w-[44px] h-[44px]"
          >
            <LayoutDashboard size={24} />
            <span className="font-label-sm mt-1">Dashboard</span>
          </button>
          <button 
            onClick={() => navigate('/portfolio')}
            className="flex flex-col items-center justify-center text-on-surface-variant p-2 active:scale-90 duration-200 hover:bg-surface-container-high rounded-full w-[44px] h-[44px]"
          >
            <Wallet size={24} />
            <span className="font-label-sm mt-1">Portfolio</span>
          </button>
          {/* Active State */}
          <button 
            onClick={() => navigate('/protection')}
            className="flex flex-col items-center justify-center bg-secondary-container text-on-secondary-container rounded-full px-4 py-1 active:scale-90 duration-200 h-[44px]"
          >
            <Shield size={24} fill="currentColor" />
            <span className="font-label-sm mt-1">Protection</span>
          </button>
          <button 
            onClick={() => navigate('/profile')}
            className="flex flex-col items-center justify-center text-on-surface-variant p-2 active:scale-90 duration-200 hover:bg-surface-container-high rounded-full w-[44px] h-[44px]"
          >
            <User size={24} />
            <span className="font-label-sm mt-1">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
