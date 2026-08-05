import { Header } from '../../components/common/Header';
import React, { useState } from 'react';
import { ArrowLeft, Landmark, Info, Shield, ExternalLink, Loader2, AlertTriangle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

export function OrderIntent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(25);
  const [nudge, setNudge] = useState<any>(null);

  const state = location.state || {
    holding_id: 'HDFCBANK',
    txn_type: 'buy',
    name: 'HDFC Bank Ltd',
    price: 1450.00
  };

  const handleContinue = async (ignoreSuitability = false) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (session) headers['Authorization'] = `Bearer ${session.access_token}`;
      
      const res = await fetch('/api/trade/intent', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          holding_id: state.holding_id,
          txn_type: state.txn_type,
          amount: quantity * state.price,
          units: quantity,
          ignore_suitability: ignoreSuitability
        })
      });
      const data = await res.json();
      if (data.suitability_nudge) {
        setNudge(data.suitability_nudge);
        return;
      }
      if (data.redirect_url) {
        navigate('/trade/redirect');
      }
    } catch (err) {
      console.error(err);
      navigate('/trade/redirect'); // Fallback
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md antialiased">
      {/* Top Navigation (Transactional intent - simplified) */}
      <header className="w-full sticky top-0 z-50 bg-surface dark:bg-surface-dim border-b border-outline-variant dark:border-outline flex items-center justify-between px-4 py-2 max-w-7xl mx-auto h-[64px]">
        <button 
          onClick={() => navigate(-1)}
          aria-label="Go back" 
          className="flex items-center justify-center w-11 h-11 text-on-surface-variant hover:bg-surface-container-low active:scale-95 transition-all rounded-full"
        >
          <ArrowLeft size={24} aria-hidden="true" />
        </button>
        <Header />
        <div className="w-11 h-11"></div> {/* Spacer for balance */}
      </header>
      
      {/* Main Content Canvas */}
      <main className="flex-grow w-full max-w-lg mx-auto px-4 py-6 md:py-8 flex flex-col items-center justify-center relative">
        
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
                <Landmark size={24} className="fill-current" />
              </div>
              <div>
                <h2 className="font-headline-sm text-on-surface">{state.name}</h2>
                <span className="font-label-sm text-on-surface-variant bg-surface-container-low px-2 py-1 rounded-full uppercase">NSE: {state.holding_id}</span>
              </div>
            </div>
            <div className="text-right">
              <span className={`font-label-md block font-bold ${state.txn_type === 'buy' ? 'text-primary' : 'text-error'}`}>{state.txn_type.toUpperCase()}</span>
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
              <input 
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-24 text-right bg-surface-container-low border border-outline-variant rounded px-2 py-1 font-headline-sm focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="font-body-md text-on-surface-variant">Est. Price</span>
              <span className="font-label-md text-on-surface">{formatCurrency(state.price)}</span>
            </div>
          </div>
          
          {/* Total Est Value */}
          <div className="mt-4 pt-4 border-t border-outline-variant flex justify-between items-center bg-surface-container-lowest">
            <span className="font-headline-sm text-on-surface">Est. Value</span>
            <span className="font-display-lg-mobile text-primary">{formatCurrency(quantity * state.price)}</span>
          </div>
          
          <p className="font-label-sm text-on-surface-variant mt-3 text-center flex items-center justify-center gap-1">
            <Info size={16} /> Actual execution price may vary slightly.
          </p>
        </section>
        
        {/* Broker Handoff Notice */}
        <div className="w-full bg-surface-container-low rounded-lg p-4 mb-8 flex items-start gap-3">
          <Shield size={24} className="text-primary mt-1 fill-current" />
          <div>
            <h3 className="font-label-md text-on-surface mb-1">Secure Broker Handoff</h3>
            <p className="font-body-md text-on-surface-variant text-sm">You will be securely redirected to your connected broker to complete this transaction. SahaVest does not hold your funds.</p>
          </div>
        </div>
        
        {/* Action Area */}
        <div className="w-full mt-auto mb-6">
          <button 
            onClick={() => handleContinue(false)}
            disabled={loading}
            className="w-full h-[56px] bg-primary text-on-primary font-headline-sm rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all shadow-sm"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <span>Continue on Zerodha</span>}
            {!loading && <ExternalLink size={20} />}
          </button>
          <button 
            onClick={() => navigate(-1)}
            className="w-full h-[48px] mt-3 text-on-surface-variant font-label-md rounded-lg flex items-center justify-center hover:bg-surface-container-low transition-colors"
          >
            Cancel Order
          </button>
        </div>
      </main>
      
      {/* Suitability Nudge Overlay */}
      {nudge && (
        <>
          <div className="absolute inset-0 bg-on-background/40 z-[60] backdrop-blur-[2px]"></div>
          <div className="absolute inset-0 z-[70] flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest w-full max-w-sm rounded-[24px] shadow-lg flex flex-col items-center p-8 text-center animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 rounded-full bg-tertiary-fixed flex items-center justify-center mb-6">
                <AlertTriangle size={32} className="text-on-tertiary-container" fill="currentColor" />
              </div>
              <h2 className="font-headline-md text-on-background mb-3">Risk Profile Mismatch</h2>
              <p className="font-body-md text-on-surface-variant mb-8">
                {nudge.message}
              </p>
              <div className="w-full flex flex-col gap-3">
                <button 
                  onClick={() => navigate('/onboarding/risk-profiling')}
                  className="w-full min-h-[48px] bg-primary text-on-primary font-label-md rounded-full hover:bg-primary-container transition-colors duration-200 active:scale-[0.98]"
                >
                  Review Risk Profile
                </button>
                <button 
                  onClick={() => { setNudge(null); handleContinue(true); }}
                  className="w-full min-h-[48px] bg-transparent border border-outline text-primary font-label-md rounded-full hover:bg-surface-container-low transition-colors duration-200 active:scale-[0.98]"
                >
                  Proceed Anyway
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Bottom Nav & FAB intentionally suppressed for Transactional Flow */}
    </div>
  );
}
