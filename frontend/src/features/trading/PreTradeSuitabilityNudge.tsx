import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Bell, PieChart, Search, Shield, AlertTriangle } from "lucide-react";
import { Header } from '../../components/common/Header';

export function PreTradeSuitabilityNudge() {
  const navigate = useNavigate();

  return (
    <div className="bg-background text-on-background min-h-screen font-body-md relative overflow-hidden flex flex-col">
      
      {/* Blurred Background Context (Dashboard Simulation) */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40 blur-sm flex flex-col">
        {/* TopAppBar Placeholder */}
        <header className="w-full top-0 sticky bg-surface dark:bg-surface-dim border-b border-outline-variant dark:border-outline shadow-sm dark:shadow-none flex justify-between items-center h-14 px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center">
              <User size={20} className="text-on-surface-variant" />
            </div>
          </div>
          <Header />
          <div className="flex items-center">
            <Bell size={24} className="text-primary dark:text-primary-fixed-dim" />
          </div>
        </header>
        <main className="flex-1 p-4 flex flex-col gap-4 pt-6">
          {/* Simulated Dashboard Content */}
          <div className="h-32 bg-surface rounded-xl border border-outline-variant p-4">
            <div className="w-1/3 h-6 bg-surface-variant rounded mb-2"></div>
            <div className="w-1/2 h-8 bg-surface-variant rounded"></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 bg-surface rounded-xl border border-outline-variant p-3"></div>
            <div className="h-24 bg-surface rounded-xl border border-outline-variant p-3"></div>
          </div>
          <div className="h-48 bg-surface rounded-xl border border-outline-variant p-4"></div>
        </main>
      </div>
      
      {/* Overlay Scrim */}
      <div className="absolute inset-0 bg-on-background/40 z-40 backdrop-blur-[2px]"></div>
      
      {/* Modal Container */}
      <div className="relative z-50 flex-1 flex items-center justify-center p-4">
        {/* The Modal Card */}
        <div className="bg-surface-container-lowest w-full max-w-sm rounded-[24px] shadow-lg flex flex-col items-center p-8 text-center animate-in fade-in zoom-in duration-300">
          {/* Icon */}
          <div className="w-16 h-16 rounded-full bg-tertiary-fixed flex items-center justify-center mb-6">
            <AlertTriangle size={32} className="text-on-tertiary-container" fill="currentColor" />
          </div>
          
          {/* Content */}
          <h2 className="font-headline-md text-on-background mb-3">Risk Profile Mismatch</h2>
          <p className="font-body-md text-on-surface-variant mb-8">
            This trade is categorized as High Risk, while your profile is set to Conservative. Proceeding may lead to higher volatility than your stated preference.
          </p>
          
          {/* Actions */}
          <div className="w-full flex flex-col gap-3">
            <button 
              onClick={() => navigate('/profile/risk/step1')}
              className="w-full min-h-[48px] bg-primary text-on-primary font-label-md rounded-full hover:bg-primary-container transition-colors duration-200 active:scale-[0.98]"
            >
              Review Risk Profile
            </button>
            <button 
              onClick={() => navigate('/trade/order-intent')}
              className="w-full min-h-[48px] bg-transparent border border-outline text-primary font-label-md rounded-full hover:bg-surface-container-low transition-colors duration-200 active:scale-[0.98]"
            >
              Proceed Anyway
            </button>
          </div>
        </div>
      </div>
      
      {/* Bottom Navigation Shell (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 w-full z-30 bg-surface-container-lowest dark:bg-inverse-surface shadow-lg flex justify-around items-center h-16 px-2 pb-safe">
        <button onClick={() => navigate('/portfolio')} className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-1 hover:bg-surface-container active:scale-95 transition-transform duration-150 min-h-[44px] min-w-[44px]">
          <PieChart size={24} className="mb-1" />
          <span className="font-label-sm">Portfolio</span>
        </button>
        {/* Active Tab */}
        <button onClick={() => navigate('/explore')} className="flex flex-col items-center justify-center bg-secondary-container text-on-secondary-container rounded-full px-4 py-1 hover:bg-surface-container active:scale-95 transition-transform duration-150 min-h-[44px] min-w-[44px]">
          <Search size={24} className="mb-1" fill="currentColor" />
          <span className="font-label-sm">Explore</span>
        </button>
        <button onClick={() => navigate('/protection')} className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-1 hover:bg-surface-container active:scale-95 transition-transform duration-150 min-h-[44px] min-w-[44px]">
          <Shield size={24} className="mb-1" />
          <span className="font-label-sm">Shield</span>
        </button>
        <button onClick={() => navigate('/profile')} className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-1 hover:bg-surface-container active:scale-95 transition-transform duration-150 min-h-[44px] min-w-[44px]">
          <User size={24} className="mb-1" />
          <span className="font-label-sm">Profile</span>
        </button>
      </nav>
    </div>
  );
}
