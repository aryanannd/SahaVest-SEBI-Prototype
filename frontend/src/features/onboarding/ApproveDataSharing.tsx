import { Header } from '../../components/common/Header';
import React from 'react';
import { Search, UserCircle, Shield, BarChart2, Landmark, TrendingUp, CheckCircle2, Calendar, Clock, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

export function ApproveDataSharing() {
  const navigate = useNavigate();

  return (
    <div className="bg-background text-on-background min-h-screen pb-24 md:pb-0 font-body-md antialiased">
      {/* TopAppBar */}
      <header className="bg-surface text-primary w-full sticky top-0 z-50 border-b border-outline-variant flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
        <button 
          onClick={() => {}}
          className="text-on-surface-variant hover:bg-surface-container-low transition-colors active:scale-95 duration-100 p-2 rounded-full flex items-center justify-center min-w-[44px] min-h-[44px]"
        >
          <Search size={24} />
        </button>
        <Header />
        <button 
          onClick={() => {}}
          className="text-on-surface-variant hover:bg-surface-container-low transition-colors active:scale-95 duration-100 p-2 rounded-full flex items-center justify-center min-w-[44px] min-h-[44px]"
        >
          <UserCircle size={24} />
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="mb-8 text-center md:text-left">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-fixed mb-4">
            <Shield size={32} className="text-primary fill-current" />
          </div>
          <h1 className="font-display-lg-mobile md:font-display-lg text-on-background mb-2">
            Data Consent Request
          </h1>
          <p className="font-body-md text-on-surface-variant mb-4">
            Review the details below to authorize data sharing via Account Aggregator.
          </p>
          <div className="flex items-center space-x-2 text-warning bg-warning-container/20 py-2 px-3 rounded-lg border border-warning/30 md:max-w-md md:mx-0 mx-auto text-left">
            <Shield size={16} className="text-warning flex-shrink-0" />
            <span className="font-label-sm text-on-warning-container leading-tight">
              <b>Sandbox Mode:</b> This connects to mock data providers. No real financial credentials are required.
            </span>
          </div>
        </div>

        {/* Consent Card */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 md:p-6 mb-8 shadow-sm">
          
          {/* Purpose Section */}
          <div className="mb-6 pb-4 border-b border-surface-variant">
            <h2 className="font-label-md text-on-surface-variant uppercase tracking-wider mb-3">Purpose of Request</h2>
            <div className="flex items-start gap-3">
              <BarChart2 size={24} className="text-secondary mt-1" />
              <div>
                <p className="font-headline-sm text-on-surface mb-1">Financial Planning & Aggregation</p>
                <p className="font-body-md text-on-surface-variant">To provide comprehensive portfolio insights and personalized financial recommendations.</p>
              </div>
            </div>
          </div>

          {/* FIP Section */}
          <div className="mb-6 pb-4 border-b border-surface-variant">
            <h2 className="font-label-md text-on-surface-variant uppercase tracking-wider mb-3">Information Providers (FIPs)</h2>
            <ul className="space-y-3">
              <li className="flex items-center gap-4 bg-surface-container-low p-3 rounded-lg">
                <div className="w-10 h-10 bg-surface-container-lowest rounded-full flex items-center justify-center border border-outline-variant">
                  <Landmark size={20} className="text-primary fill-current" />
                </div>
                <div className="flex-1">
                  <p className="font-label-md text-on-surface">HDFC Bank Ltd.</p>
                  <p className="font-label-sm text-on-surface-variant">Savings Account</p>
                </div>
              </li>
              <li className="flex items-center gap-4 bg-surface-container-low p-3 rounded-lg">
                <div className="w-10 h-10 bg-surface-container-lowest rounded-full flex items-center justify-center border border-outline-variant">
                  <TrendingUp size={20} className="text-primary fill-current" />
                </div>
                <div className="flex-1">
                  <p className="font-label-md text-on-surface">Zerodha Broking Ltd.</p>
                  <p className="font-label-sm text-on-surface-variant">Demat Account</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Data Types Section */}
          <div className="mb-6 pb-4 border-b border-surface-variant">
            <h2 className="font-label-md text-on-surface-variant uppercase tracking-wider mb-3">Requested Data Types</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={20} className="text-primary" />
                <span className="font-body-md text-on-surface">Profile Information</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={20} className="text-primary" />
                <span className="font-body-md text-on-surface">Account Balances</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={20} className="text-primary" />
                <span className="font-body-md text-on-surface">Transaction History</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={20} className="text-primary" />
                <span className="font-body-md text-on-surface">Holding Details</span>
              </div>
            </div>
          </div>

          {/* Duration & Frequency */}
          <div className="mb-6">
            <h2 className="font-label-md text-on-surface-variant uppercase tracking-wider mb-3">Consent Parameters</h2>
            <div className="flex flex-col md:flex-row gap-4">
              
              <div className="bg-surface-container-low p-4 rounded-lg flex-1 border border-transparent hover:border-outline-variant transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={20} className="text-on-surface-variant" />
                  <span className="font-label-md text-on-surface-variant">Duration</span>
                </div>
                <p className="font-headline-sm text-on-surface">1 Year</p>
                <p className="font-label-sm text-on-surface-variant mt-1">Expires 24 Oct 2024</p>
              </div>
              
              <div className="bg-surface-container-low p-4 rounded-lg flex-1 border border-transparent hover:border-outline-variant transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={20} className="text-on-surface-variant" />
                  <span className="font-label-md text-on-surface-variant">Frequency</span>
                </div>
                <p className="font-headline-sm text-on-surface">Daily</p>
                <p className="font-label-sm text-on-surface-variant mt-1">Automated fetch</p>
              </div>
            </div>
          </div>

          {/* Regulatory Note */}
          <div className="bg-surface p-4 rounded-lg flex items-start gap-3 border border-outline-variant">
            <Info size={20} className="text-on-surface-variant mt-0.5 shrink-0" />
            <p className="font-label-sm text-on-surface-variant leading-relaxed">
              This consent is mandated by RBI guidelines. You have the right to revoke this consent at any time from your account settings. Your data is encrypted and securely transmitted via the Account Aggregator framework.
            </p>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse md:flex-row gap-4 w-full">
          <button 
            onClick={() => navigate(-1)}
            className="flex-1 min-h-[48px] md:min-h-[56px] font-label-md text-primary bg-surface-container-lowest border-2 border-primary rounded-lg flex items-center justify-center hover:bg-surface-container-low transition-colors min-w-[44px] active:scale-[0.98]"
          >
            Deny
          </button>
          <button 
            onClick={async () => {
              try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                  const currentOrigin = window.location.origin;
                  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/aa/consent`, {
                    method: 'POST',
                    headers: { 
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${session.access_token}`
                    },
                    body: JSON.stringify({ 
                      fip_list: ['HDFC', 'Zerodha'],
                      redirect_url: `${currentOrigin}/onboarding/linking`
                    })
                  });
                  const data = await res.json();
                  if (data.aa_redirect_url && (data.aa_redirect_url.startsWith('https://') || data.aa_redirect_url.startsWith('http://'))) {
                    // If real Setu webview URL, redirect there directly
                    if (data.aa_redirect_url.includes('setu.co') && !data.aa_redirect_url.includes('localhost')) {
                      window.location.href = data.aa_redirect_url;
                      return;
                    }
                    navigate('/onboarding/linking', { state: { consent_id: data.consent_id } });
                    return;
                  }
                  if (data.consent_id) {
                    navigate('/onboarding/linking', { state: { consent_id: data.consent_id } });
                    return;
                  }
                }
              } catch (e) {
                console.error("Consent error:", e);
              }
              // Fallback if it fails
              navigate('/onboarding/linking');
            }}
            className="flex-1 min-h-[48px] md:min-h-[56px] font-label-md text-on-primary bg-primary rounded-lg flex items-center justify-center hover:bg-primary-container transition-colors min-w-[44px] active:scale-[0.98] shadow-sm"
          >
            Approve & Secure Data
          </button>
        </div>
        
      </main>
    </div>
  );
}
