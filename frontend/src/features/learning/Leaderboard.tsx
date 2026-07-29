import { Header } from '../../components/common/Header';
import React, { useState } from 'react';
import { Search, User, Shield, ShieldCheck } from 'lucide-react';

export function Leaderboard() {
  const [isPublic, setIsPublic] = useState(true);

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col antialiased">
      {/* TopAppBar */}
      <header className="w-full sticky top-0 z-50 bg-surface text-primary border-b border-outline-variant">
        <div className="flex items-center justify-between px-4 py-2 w-full max-w-7xl mx-auto h-[56px]">
          <div className="flex items-center">
            <button aria-label="Search" className="w-[44px] h-[44px] flex items-center justify-center text-primary hover:bg-surface-container-low transition-colors rounded-full active:scale-95 duration-100">
              <Search size={24} />
            </button>
          </div>
          <Header />
          <div className="flex items-center">
            <button aria-label="Account" className="w-[44px] h-[44px] flex items-center justify-center text-primary hover:bg-surface-container-low transition-colors rounded-full active:scale-95 duration-100">
              <User size={24} className="fill-current" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-3xl mx-auto px-4 py-6 pb-24 flex flex-col gap-6">
        
        {/* Header Section */}
        <div className="flex flex-col gap-2">
          <h2 className="font-display-lg-mobile md:font-display-lg text-on-surface">Community Leaderboard</h2>
          <p className="font-body-md text-on-surface-variant">See how your portfolio performance compares to the SahaVest community.</p>
        </div>

        {/* Privacy Control Card */}
        <section className="bg-white/85 backdrop-blur-md border border-white/40 shadow-sm rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-secondary" size={24} />
              <h3 className="font-headline-sm text-on-surface">Public Profile</h3>
            </div>
            <p className="font-body-md text-on-surface-variant text-sm">Only your initials are shown to others.</p>
          </div>
          {/* Toggle */}
          <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in flex-shrink-0">
            <input 
              checked={isPublic}
              onChange={() => setIsPublic(!isPublic)}
              className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-outline-variant appearance-none cursor-pointer focus:ring-0 focus:outline-none z-10 transition-transform duration-200 ease-in-out left-0 checked:right-0 checked:border-primary checked:translate-x-6" 
              id="privacy-toggle" 
              name="toggle" 
              type="checkbox" 
            />
            <label 
              className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${isPublic ? 'bg-primary' : 'bg-outline-variant'}`} 
              htmlFor="privacy-toggle"
            ></label>
          </div>
        </section>

        {/* Leaderboard List */}
        <section className="bg-white/85 backdrop-blur-md border border-white/40 shadow-sm rounded-xl overflow-hidden flex flex-col">
          {/* Header Row */}
          <div className="flex items-center px-4 py-3 border-b border-surface-variant bg-surface-container-lowest">
            <div className="w-12 font-label-md text-on-surface-variant">Rank</div>
            <div className="flex-1 font-label-md text-on-surface-variant">Investor</div>
            <div className="text-right font-label-md text-on-surface-variant">Return</div>
          </div>
          
          {/* List Items */}
          <div className="flex flex-col">
            
            {/* Rank 1 */}
            <div className="flex items-center px-4 py-4 border-b border-surface-variant hover:bg-surface-container-lowest transition-colors">
              <div className="w-12 font-headline-sm text-primary flex items-center">
                <span className="w-8 h-8 rounded-full bg-primary-fixed text-primary flex items-center justify-center font-label-sm">1</span>
              </div>
              <div className="flex-1 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center font-headline-sm text-on-surface">A.K.</div>
                <span className="font-body-lg text-on-surface font-medium">A.K.</span>
              </div>
              <div className="text-right flex flex-col">
                <span className="font-body-lg text-secondary font-medium">+14.2%</span>
              </div>
            </div>

            {/* Rank 2 */}
            <div className="flex items-center px-4 py-4 border-b border-surface-variant hover:bg-surface-container-lowest transition-colors">
              <div className="w-12 font-headline-sm text-on-surface-variant flex items-center">
                <span className="w-8 h-8 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center font-label-sm">2</span>
              </div>
              <div className="flex-1 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center font-headline-sm text-on-surface">S.M.</div>
                <span className="font-body-lg text-on-surface font-medium">S.M.</span>
              </div>
              <div className="text-right flex flex-col">
                <span className="font-body-lg text-secondary font-medium">+12.8%</span>
              </div>
            </div>

            {/* Rank 3 (Current User Highlighted) */}
            <div className="flex items-center px-4 py-4 border-b border-surface-variant bg-secondary-fixed-dim bg-opacity-20 relative overflow-hidden group">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary"></div>
              <div className="w-12 font-headline-sm text-on-surface flex items-center">
                <span className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-label-sm">3</span>
              </div>
              <div className="flex-1 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-headline-sm">R.S.</div>
                <div className="flex flex-col">
                  <span className="font-body-lg text-on-surface font-semibold">You (R.S.)</span>
                </div>
              </div>
              <div className="text-right flex flex-col">
                <span className="font-body-lg text-secondary font-semibold">+11.5%</span>
              </div>
            </div>

            {/* Rank 4 */}
            <div className="flex items-center px-4 py-4 border-b border-surface-variant hover:bg-surface-container-lowest transition-colors">
              <div className="w-12 font-headline-sm text-on-surface-variant flex items-center">
                <span className="w-8 h-8 flex items-center justify-center font-body-md">4</span>
              </div>
              <div className="flex-1 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center font-headline-sm text-on-surface">P.D.</div>
                <span className="font-body-lg text-on-surface font-medium">P.D.</span>
              </div>
              <div className="text-right flex flex-col">
                <span className="font-body-lg text-secondary font-medium">+9.4%</span>
              </div>
            </div>

            {/* Rank 5 */}
            <div className="flex items-center px-4 py-4 hover:bg-surface-container-lowest transition-colors">
              <div className="w-12 font-headline-sm text-on-surface-variant flex items-center">
                <span className="w-8 h-8 flex items-center justify-center font-body-md">5</span>
              </div>
              <div className="flex-1 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center font-headline-sm text-on-surface">N.J.</div>
                <span className="font-body-lg text-on-surface font-medium">N.J.</span>
              </div>
              <div className="text-right flex flex-col">
                <span className="font-body-lg text-secondary font-medium">+8.1%</span>
              </div>
            </div>

          </div>
        </section>
      </main>
    </div>
  );
}
