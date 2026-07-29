import { Header } from '../../components/common/Header';
import React from 'react';
import { Bell, ArrowRight, AlertTriangle, Shield, ScrollText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function SafetyNotifications() {
  const navigate = useNavigate();

  return (
    <div className="bg-background text-on-background antialiased min-h-screen flex flex-col">
      {/* TopAppBar */}
      <header className="w-full top-0 sticky bg-surface dark:bg-surface-dim border-b border-outline-variant dark:border-outline shadow-sm dark:shadow-none z-40">
        <div className="flex justify-between items-center h-14 px-4">
          <div className="flex-shrink-0">
            <img 
              alt="User profile" 
              className="h-8 w-8 rounded-full object-cover border border-outline-variant" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYqo0JZP7HGQByt1GRVj6qdn635tUuAS2F04eDamPP0lt2j1C4frhRmdY3fstqmYMOeRLjM4TqzjOhETytzxjpGXYwfkF-pIBA_QQwyYlt2eK3C1SfF0hywhE-jmJAR5LnlDV7T8MRZClY7lVAoJODu1YSPReXl8aNZXgLfqcWLZUStJZwfgc9BtY0VQRPvXBvzs5xWNhum7qQFljnLR1XyoDYo3L6hyEbWer7g0TEHhyqIjp4VT6WMGD6WauB_BJ2Q4Kkyfzc4xI"
            />
          </div>
          <Header />
          <button 
            aria-label="notifications" 
            className="h-[44px] w-[44px] flex items-center justify-center text-primary dark:text-primary-fixed-dim hover:bg-surface-container dark:hover:bg-surface-container-high transition-colors duration-200 rounded-full"
            onClick={() => navigate('/profile/notifications')}
          >
            <Bell size={24} />
          </button>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 pt-6 pb-[96px] md:pb-6 flex flex-col gap-4">
        
        {/* Page Header */}
        <div className="mb-3">
          <h2 className="font-headline-md text-on-background mb-1">Trust & Safety</h2>
          <p className="font-body-md text-on-surface-variant">Important alerts and security updates for your protection.</p>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
          <button className="flex-shrink-0 h-[44px] px-6 rounded-full bg-primary text-on-primary font-label-md flex items-center justify-center border border-primary transition-all">All Alerts</button>
          <button className="flex-shrink-0 h-[44px] px-6 rounded-full bg-surface-container-lowest text-on-surface-variant font-label-md flex items-center justify-center border border-outline-variant hover:bg-surface-container transition-all">Regulatory</button>
          <button className="flex-shrink-0 h-[44px] px-6 rounded-full bg-surface-container-lowest text-on-surface-variant font-label-md flex items-center justify-center border border-outline-variant hover:bg-surface-container transition-all">Security</button>
          <button className="flex-shrink-0 h-[44px] px-6 rounded-full bg-surface-container-lowest text-on-surface-variant font-label-md flex items-center justify-center border border-outline-variant hover:bg-surface-container transition-all">Account</button>
        </div>

        {/* Notifications List */}
        <div className="flex flex-col gap-3">
          
          {/* High Priority Alert Card (Unread) */}
          <div className="relative bg-surface-container-lowest border border-error/30 rounded-xl p-4 shadow-sm flex flex-col gap-3 cursor-pointer hover:bg-surface-container-low transition-colors group">
            <div className="absolute top-4 right-4 w-3 h-3 bg-primary rounded-full"></div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-error-container text-on-error-container flex items-center justify-center">
                <AlertTriangle size={20} className="fill-current stroke-white" />
              </div>
              <div className="flex-1 pr-6">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-label-sm text-error uppercase tracking-wider">Urgent Alert</span>
                  <span className="font-label-sm text-on-surface-variant">2 hours ago</span>
                </div>
                <h3 className="font-headline-sm text-on-background mb-1 group-hover:text-primary transition-colors">Advisor Flagged by SEBI</h3>
                <p className="font-body-md text-on-surface-variant leading-relaxed">
                  A financial advisor you interacted with recently has been flagged by the Securities and Exchange Board of India for non-compliance.
                </p>
              </div>
            </div>
            <div className="mt-2 flex justify-end">
              <button className="font-label-md text-primary hover:text-primary-container transition-colors flex items-center gap-1 h-[44px] px-4 rounded-lg">
                Read Details <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Security Tip Card (Unread) */}
          <div className="relative bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm flex flex-col gap-3 cursor-pointer hover:bg-surface-container-low transition-colors group">
            <div className="absolute top-4 right-4 w-3 h-3 bg-primary rounded-full"></div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
                <Shield size={20} className="fill-current stroke-white" />
              </div>
              <div className="flex-1 pr-6">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-label-sm text-secondary uppercase tracking-wider">Security Tip</span>
                  <span className="font-label-sm text-on-surface-variant">Yesterday</span>
                </div>
                <h3 className="font-headline-sm text-on-background mb-1 group-hover:text-primary transition-colors">New Phishing Scam Detected</h3>
                <p className="font-body-md text-on-surface-variant leading-relaxed">
                  Be aware of emails claiming to be from SahaVest Support asking for your portfolio recovery phrase. We will never ask for this information.
                </p>
              </div>
            </div>
          </div>

          {/* Standard Update Card (Read) */}
          <div className="relative bg-surface-bright border border-outline-variant/50 rounded-xl p-4 flex flex-col gap-3 opacity-80 cursor-pointer hover:bg-surface-container-lowest hover:opacity-100 transition-all group">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center">
                <ScrollText size={20} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-label-sm text-on-surface-variant uppercase tracking-wider">Policy Update</span>
                  <span className="font-label-sm text-on-surface-variant">Oct 12</span>
                </div>
                <h3 className="font-headline-sm text-on-background mb-1 group-hover:text-primary transition-colors">Updated Data Privacy Guidelines</h3>
                <p className="font-body-md text-on-surface-variant leading-relaxed">
                  We have updated our terms of service to reflect the new Digital Personal Data Protection Act requirements.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
