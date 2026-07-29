import { Header } from '../../components/common/Header';
import React from 'react';
import { Wallet, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function LinkingSummary() {
  const navigate = useNavigate();

  return (
    <div className="bg-surface text-on-surface antialiased min-h-screen flex flex-col items-center">
      {/* Minimal Header for Transactional Flow */}
      <header className="w-full max-w-lg mx-auto pt-6 pb-4 px-4 flex justify-center">
        <Header />
      </header>

      {/* Main Content Canvas */}
      <main className="flex-1 w-full max-w-lg mx-auto px-4 flex flex-col justify-center pb-8">
        
        {/* Status Indicator Graphic */}
        <div className="flex justify-center mb-6">
          <div className="relative w-24 h-24 rounded-full bg-surface-container flex items-center justify-center border-4 border-surface-container-lowest shadow-sm">
            <Wallet size={48} className="text-primary fill-current" />
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-surface-container-lowest rounded-full flex items-center justify-center shadow-sm">
              <Info size={24} className="text-tertiary-fixed-dim fill-current" />
            </div>
          </div>
        </div>

        {/* Messaging */}
        <div className="text-center mb-8">
          <h1 className="font-headline-sm text-on-surface mb-2">Partial Linkage Complete</h1>
          <p className="font-body-md text-on-surface-variant">
            We've successfully secured connections to most of your accounts. You can proceed to view your active portfolio while we retry the remaining links.
          </p>
        </div>

        {/* Checklist Card */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden mb-8 shadow-sm">
          
          {/* Success Item 1: Bank */}
          <div className="flex items-center justify-between p-4 border-b border-surface-variant">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-secondary-container/20 flex items-center justify-center">
                <CheckCircle2 size={24} className="text-secondary fill-current" />
              </div>
              <div>
                <h3 className="font-label-md text-on-surface">Bank Accounts</h3>
                <p className="font-label-sm text-on-surface-variant font-normal">Linked securely</p>
              </div>
            </div>
            <span className="font-label-sm text-secondary">Success</span>
          </div>

          {/* Success Item 2: Demat */}
          <div className="flex items-center justify-between p-4 border-b border-surface-variant">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-secondary-container/20 flex items-center justify-center">
                <CheckCircle2 size={24} className="text-secondary fill-current" />
              </div>
              <div>
                <h3 className="font-label-md text-on-surface">Demat Account</h3>
                <p className="font-label-sm text-on-surface-variant font-normal">Linked securely</p>
              </div>
            </div>
            <span className="font-label-sm text-secondary">Success</span>
          </div>

          {/* Failed Item: Mutual Funds */}
          <div className="flex items-center justify-between p-4 bg-error-container/10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-error-container/50 flex items-center justify-center">
                <AlertCircle size={24} className="text-error fill-current" />
              </div>
              <div>
                <h3 className="font-label-md text-on-surface">Mutual Funds</h3>
                <p className="font-label-sm text-error font-normal">Connection timed out</p>
              </div>
            </div>
            <button className="h-[44px] px-3 rounded-full flex items-center justify-center font-label-md text-primary bg-primary/10 hover:bg-primary/20 transition-colors">
              Retry
            </button>
          </div>
          
        </div>
      </main>

      {/* Bottom Action Area */}
      <div className="w-full max-w-lg mx-auto px-4 pb-4 sticky bottom-0 bg-gradient-to-t from-surface via-surface to-transparent pt-6">
        <button 
          onClick={() => navigate('/dashboard')}
          className="w-full h-[44px] bg-primary text-on-primary rounded-full flex items-center justify-center font-label-md mb-3 hover:bg-primary-container transition-colors shadow-sm active:scale-[0.98]"
        >
          Continue to Dashboard
        </button>
        <button className="w-full h-[44px] border border-outline-variant text-on-surface-variant rounded-full flex items-center justify-center font-label-md hover:bg-surface-container-low transition-colors active:scale-[0.98]">
          Retry Failed Linkages
        </button>
      </div>
    </div>
  );
}
