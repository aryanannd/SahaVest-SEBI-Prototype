import { Header } from '../../components/common/Header';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Landmark, Info, Shield, ExternalLink } from "lucide-react";

export function OrderIntentScreen() {
  const navigate = useNavigate();

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md antialiased">
      {/* Top Navigation (Transactional intent - simplified) */}
      <header className="w-full sticky top-0 z-50 bg-surface dark:bg-surface-dim border-b border-outline-variant dark:border-outline flex items-center justify-between px-4 py-3 max-w-7xl mx-auto h-[64px]">
        <button 
          onClick={() => navigate(-1)}
          aria-label="Go back" 
          className="flex items-center justify-center w-11 h-11 text-on-surface-variant hover:bg-surface-container-low active:scale-95 transition-all rounded-full"
        >
          <ArrowLeft size={24} />
        </button>
        <Header />
        <div className="w-11 h-11"></div> {/* Spacer for balance */}
      </header>
      
      {/* Main Content Canvas */}
      <main className="flex-grow w-full max-w-lg mx-auto px-4 py-8 md:py-10 flex flex-col items-center justify-center relative">
        
        {/* Header Intent */}
        <div className="text-center mb-6 w-full">
          <h1 className="font-display-lg-mobile md:font-display-lg text-on-surface mb-2">Review Order</h1>
          <p className="font-body-md text-on-surface-variant">Verify details before proceeding to your broker.</p>
        </div>
        
        {/* Order Summary Card */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl w-full p-4 shadow-sm mb-6">
          {/* Asset Header */}
          <div className="flex items-center justify-between pb-4 border-b border-outline-variant mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary">
                <Landmark size={24} fill="currentColor" />
              </div>
              <div>
                <h2 className="font-headline-sm text-on-surface">HDFC Bank Ltd</h2>
                <span className="font-label-sm text-on-surface-variant bg-surface-container-low px-2 py-1 rounded-full uppercase">NSE: HDFCBANK</span>
              </div>
            </div>
            <div className="text-right">
              <span className="font-label-md text-secondary block">BUY</span>
            </div>
          </div>
          
          {/* Order Details */}
          <div className="space-y-3">
            <div className="flex justify-between items-center py-1">
              <span className="font-body-md text-on-surface-variant">Order Type</span>
              <span className="font-label-md text-on-surface">Market (Delivery)</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="font-body-md text-on-surface-variant">Quantity</span>
              <span className="font-headline-sm text-on-surface">25</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="font-body-md text-on-surface-variant">Est. Price</span>
              <span className="font-label-md text-on-surface">₹ 1,450.00</span>
            </div>
          </div>
          
          {/* Total Est Value */}
          <div className="mt-4 pt-4 border-t border-outline-variant flex justify-between items-center bg-surface-container-lowest">
            <span className="font-headline-sm text-on-surface">Est. Value</span>
            <span className="font-display-lg-mobile text-primary">₹ 36,250.00</span>
          </div>
          
          <p className="font-label-sm text-on-surface-variant mt-3 text-center flex items-center justify-center gap-1">
            <Info size={16} /> Actual execution price may vary slightly.
          </p>
        </section>
        
        {/* Broker Handoff Notice */}
        <div className="w-full bg-surface-container-low rounded-lg p-4 mb-8 flex items-start gap-4">
          <Shield size={24} className="text-primary mt-1 shrink-0" fill="currentColor" />
          <div>
            <h3 className="font-label-md text-on-surface mb-1">Secure Broker Handoff</h3>
            <p className="font-body-md text-on-surface-variant text-sm">You will be securely redirected to your connected broker to complete this transaction. SahaVest does not hold your funds.</p>
          </div>
        </div>
        
        {/* Action Area */}
        <div className="w-full mt-auto mb-6">
          <button 
            onClick={() => navigate('/trade/redirect-broker')}
            className="w-full h-[56px] bg-primary text-on-primary font-headline-sm rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all shadow-sm"
          >
            <span>Continue on Zerodha</span>
            <ExternalLink size={20} />
          </button>
          <button 
            onClick={() => navigate(-1)}
            className="w-full h-[48px] mt-3 text-on-surface-variant font-label-md rounded-lg flex items-center justify-center hover:bg-surface-container-low transition-colors"
          >
            Cancel Order
          </button>
        </div>
      </main>
    </div>
  );
}
