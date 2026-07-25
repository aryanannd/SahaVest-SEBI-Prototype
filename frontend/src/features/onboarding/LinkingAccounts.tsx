import React, { useEffect } from 'react';
import { Loader2, Timer, CheckCircle2, RefreshCw, Clock, BellRing } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

export function LinkingAccounts() {
  const navigate = useNavigate();
  const location = useLocation();
  const consent_id = location.state?.consent_id;

  useEffect(() => {
    let mounted = true;
    const fetchAA = async () => {
      if (consent_id) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}/aa/fetch`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
              },
              body: JSON.stringify({ consent_id })
            });
          }
        } catch (e) {
          console.error(e);
        }
      }
      if (mounted) {
        setTimeout(() => {
          navigate('/onboarding/linking-summary');
        }, 1500);
      }
    };
    fetchAA();
    return () => { mounted = false; };
  }, [navigate, consent_id]);

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md antialiased selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Main Content Canvas */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 w-full max-w-lg mx-auto">
        
        {/* Header Section */}
        <div className="w-full text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-fixed text-on-primary-fixed mb-6 relative">
            <RefreshCw size={32} className="animate-spin" style={{ animationDuration: '3s' }} />
            <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" style={{ animationDuration: '1.5s' }}></div>
          </div>
          <h1 className="font-headline-md text-on-surface mb-3">Linking your wealth</h1>
          <p className="font-body-md text-on-surface-variant max-w-[280px] mx-auto">
            Establishing secure connections to your financial institutions. Please don't close this screen.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="w-full bg-surface-container-lowest rounded-xl p-4 border border-outline-variant mb-6 shadow-sm">
          <div className="flex justify-between items-end mb-3">
            <div>
              <span className="font-label-sm text-on-surface-variant uppercase tracking-wider block mb-1">Status</span>
              <span className="font-headline-sm text-primary">50% Complete</span>
            </div>
            <div className="flex items-center gap-2 bg-surface-container-high rounded-full px-3 py-1">
              <Timer size={16} className="text-on-surface-variant" />
              <span className="font-label-sm text-on-surface-variant animate-subtle-pulse">Approx. 2 mins left</span>
            </div>
          </div>
          
          {/* Linear Progress Track */}
          <div className="w-full h-2 bg-surface-variant rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full animate-progress" style={{ width: '50%' }}></div>
          </div>
        </div>

        {/* Vertical Checklist */}
        <div className="w-full flex flex-col gap-3 mb-8">
          
          {/* Item 1: Bank (Done) */}
          <div className="flex items-center p-3 bg-surface-container-lowest rounded-lg border border-outline-variant transition-all">
            <div className="flex-shrink-0 mr-4">
              <CheckCircle2 size={24} className="text-secondary fill-secondary/20" />
            </div>
            <div className="flex-1">
              <h3 className="font-label-md text-on-surface">Bank Accounts</h3>
              <p className="font-body-md text-[13px] text-on-surface-variant">HDFC & SBI Verified</p>
            </div>
            <span className="font-label-sm text-secondary bg-secondary/10 px-2 py-1 rounded">Linked</span>
          </div>
          
          {/* Item 2: Demat (Done) */}
          <div className="flex items-center p-3 bg-surface-container-lowest rounded-lg border border-outline-variant transition-all">
            <div className="flex-shrink-0 mr-4">
              <CheckCircle2 size={24} className="text-secondary fill-secondary/20" />
            </div>
            <div className="flex-1">
              <h3 className="font-label-md text-on-surface">Demat Holdings</h3>
              <p className="font-body-md text-[13px] text-on-surface-variant">Zerodha Connected</p>
            </div>
            <span className="font-label-sm text-secondary bg-secondary/10 px-2 py-1 rounded">Linked</span>
          </div>
          
          {/* Item 3: Mutual Fund (In Progress) */}
          <div className="flex items-center p-3 bg-primary/5 rounded-lg border border-primary/20 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
            <div className="flex-shrink-0 mr-4">
              <Loader2 size={24} className="text-primary animate-spin" />
            </div>
            <div className="flex-1">
              <h3 className="font-label-md text-on-surface">Mutual Funds</h3>
              <p className="font-body-md text-[13px] text-on-surface-variant">Fetching CAS statement...</p>
            </div>
            <span className="font-label-sm text-primary animate-subtle-pulse">In-progress</span>
          </div>
          
          {/* Item 4: NPS (Pending) */}
          <div className="flex items-center p-3 bg-surface rounded-lg border border-transparent opacity-70">
            <div className="flex-shrink-0 mr-4">
              <Clock size={24} className="text-outline" />
            </div>
            <div className="flex-1">
              <h3 className="font-label-md text-on-surface text-outline">NPS Tier 1 & 2</h3>
              <p className="font-body-md text-[13px] text-outline">Waiting in queue</p>
            </div>
            <span className="font-label-sm text-outline">Pending</span>
          </div>
          
        </div>

        {/* Footer Action */}
        <div className="w-full mt-auto pb-6">
          <button className="w-full min-h-[48px] flex items-center justify-center gap-2 rounded-full border border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low transition-colors text-primary font-label-md">
            <BellRing size={20} />
            Notify me when done
          </button>
          <p className="text-center font-body-md text-[12px] text-on-surface-variant mt-3">
            You can safely minimize the app. We'll send a push notification once complete.
          </p>
        </div>
        
      </main>

      <style>{`
        @keyframes subtle-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
        }
        .animate-subtle-pulse {
            animation: subtle-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes progress-fill {
            from { width: 0%; }
            to { width: 50%; }
        }
        .animate-progress {
            animation: progress-fill 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
