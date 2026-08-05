import React, { useEffect, useState } from 'react';
import { Loader2, Timer, CheckCircle2, RefreshCw, Clock, BellRing, ShieldAlert, ArrowRight, FileText, RotateCcw } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

export function LinkingAccounts() {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const consent_id = location.state?.consent_id || queryParams.get('consent_id') || queryParams.get('id') || queryParams.get('consentId');
  const queryStatus = (queryParams.get('status') || queryParams.get('error') || '').toUpperCase();

  const [linkingState, setLinkingState] = useState<'POLLING' | 'SUCCESS' | 'DECLINED'>('POLLING');
  const [statusMessage, setStatusMessage] = useState('Waiting for consent confirmation...');
  const [progressPercent, setProgressPercent] = useState(30);

  useEffect(() => {
    // If URL already carries explicit rejection/denial from Setu redirect
    if (queryStatus.includes('REJECT') || queryStatus.includes('DENIED') || queryStatus.includes('CANCEL') || queryStatus.includes('DECLINE')) {
      setLinkingState('DECLINED');
      setStatusMessage('Data sharing consent was declined.');
      return;
    }

    let mounted = true;
    let pollInterval: ReturnType<typeof setInterval> | null = null;
    let pollCount = 0;
    const maxPolls = 25; // ~60 seconds max

    const checkStatusAndFetch = async () => {
      if (!consent_id) {
        // Fallback simulation if no consent ID was passed
        if (mounted) {
          setTimeout(() => {
            navigate('/onboarding/linking-summary');
          }, 2000);
        }
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (session) headers['Authorization'] = `Bearer ${session.access_token}`;

        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
        const res = await fetch(`${baseUrl}/aa/consent/${consent_id}/status`, { headers });

        if (res.ok) {
          const data = await res.json();
          const currentStatus = (data.status || '').toUpperCase();

          if (currentStatus === 'ACTIVE' || currentStatus === 'APPROVED') {
            if (pollInterval) clearInterval(pollInterval);
            if (mounted) {
              setLinkingState('SUCCESS');
              setProgressPercent(100);
              setStatusMessage('Consent approved! Aggregating portfolio data...');

              // Trigger background data fetch
              await fetch(`${baseUrl}/aa/fetch`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ consent_id })
              }).catch(() => {});

              setTimeout(() => {
                if (mounted) navigate('/onboarding/linking-summary');
              }, 1500);
            }
            return;
          } else if (['REJECTED', 'DENIED', 'EXPIRED', 'REVOKED', 'FAILED'].includes(currentStatus)) {
            if (pollInterval) clearInterval(pollInterval);
            if (mounted) {
              setLinkingState('DECLINED');
              setStatusMessage(`Consent was ${currentStatus.toLowerCase()}.`);
            }
            return;
          } else {
            // Still PENDING
            if (mounted) {
              setProgressPercent((prev) => Math.min(prev + 5, 85));
            }
          }
        }
      } catch (e) {
        console.error('[AA Linking] Poll error:', e);
      }

      pollCount++;
      if (pollCount >= maxPolls && mounted) {
        if (pollInterval) clearInterval(pollInterval);
        // If timed out, allow user to proceed or retry
        setStatusMessage('Consent verification taking longer than usual.');
      }
    };

    // Initial check
    checkStatusAndFetch();

    // Poll every 2.5 seconds
    pollInterval = setInterval(checkStatusAndFetch, 2500);

    return () => {
      mounted = false;
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [navigate, consent_id, queryStatus]);

  // Render Explicit Declined / Rejected Screen
  if (linkingState === 'DECLINED') {
    return (
      <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md antialiased p-4">
        <main className="flex-1 flex flex-col items-center justify-center p-4 w-full max-w-lg mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-error-container text-on-error-container flex items-center justify-center mb-6 shadow-sm">
            <ShieldAlert size={32} className="text-error" />
          </div>

          <h1 className="font-headline-md text-on-surface mb-3">Data Sharing Not Approved</h1>
          <p className="font-body-md text-on-surface-variant max-w-md mx-auto mb-8">
            You declined or canceled the Account Aggregator consent request. No financial statements or account data were accessed or stored.
          </p>

          <div className="w-full bg-surface-container-lowest rounded-xl p-5 border border-outline-variant mb-8 text-left">
            <h3 className="font-label-lg text-on-surface mb-2">Alternative Options</h3>
            <p className="font-body-sm text-on-surface-variant mb-4">
              You can try linking again via Setu AA, or upload a CAS statement PDF to import your portfolio offline without linking bank accounts.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate('/onboarding/select-institutions')}
                className="w-full min-h-[48px] font-label-md text-on-primary bg-primary rounded-lg flex items-center justify-center gap-2 hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm"
              >
                <RotateCcw size={18} />
                Try Linking Again
              </button>
              <button
                onClick={() => navigate('/onboarding/link-accounts')}
                className="w-full min-h-[48px] font-label-md text-primary bg-surface-container-lowest border border-outline-variant rounded-lg flex items-center justify-center gap-2 hover:bg-surface-container-low transition-colors"
              >
                <FileText size={18} />
                Upload CAS PDF Statement Instead
              </button>
            </div>
          </div>

          <button
            onClick={() => navigate('/portfolio')}
            className="text-on-surface-variant hover:text-on-surface font-label-md underline underline-offset-4"
          >
            Skip and go to Dashboard
          </button>
        </main>
      </div>
    );
  }

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
            Establishing secure connections via Account Aggregator. Please don't close this screen.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="w-full bg-surface-container-lowest rounded-xl p-4 border border-outline-variant mb-6 shadow-sm">
          <div className="flex justify-between items-end mb-3">
            <div>
              <span className="font-label-sm text-on-surface-variant uppercase tracking-wider block mb-1">Status</span>
              <span className="font-headline-sm text-primary">{progressPercent}% Complete</span>
            </div>
            <div className="flex items-center gap-2 bg-surface-container-high rounded-full px-3 py-1">
              <Timer size={16} className="text-on-surface-variant" />
              <span className="font-label-sm text-on-surface-variant animate-subtle-pulse">{statusMessage}</span>
            </div>
          </div>
          
          {/* Linear Progress Track */}
          <div className="w-full h-2 bg-surface-variant rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-500" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Vertical Checklist */}
        <div className="w-full flex flex-col gap-3 mb-8">
          
          {/* Item 1: Bank */}
          <div className="flex items-center p-3 bg-surface-container-lowest rounded-lg border border-outline-variant transition-all">
            <div className="flex-shrink-0 mr-4">
              {progressPercent >= 50 ? (
                <CheckCircle2 size={24} className="text-secondary fill-secondary/20" />
              ) : (
                <Loader2 size={24} className="text-primary animate-spin" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-label-md text-on-surface">Bank & Deposit Accounts</h3>
              <p className="font-body-md text-[13px] text-on-surface-variant">
                {progressPercent >= 50 ? 'Connected via Setu AA' : 'Verifying consent & fetching balances...'}
              </p>
            </div>
            <span className={`font-label-sm px-2 py-1 rounded ${
              progressPercent >= 50 ? 'text-secondary bg-secondary/10' : 'text-primary bg-primary/10 animate-pulse'
            }`}>
              {progressPercent >= 50 ? 'Linked' : 'In-progress'}
            </span>
          </div>
          
          {/* Item 2: Demat & Investments */}
          <div className="flex items-center p-3 bg-surface-container-lowest rounded-lg border border-outline-variant transition-all">
            <div className="flex-shrink-0 mr-4">
              {progressPercent >= 90 ? (
                <CheckCircle2 size={24} className="text-secondary fill-secondary/20" />
              ) : (
                <Clock size={24} className="text-outline" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-label-md text-on-surface">Demat & Mutual Funds</h3>
              <p className="font-body-md text-[13px] text-on-surface-variant">
                {progressPercent >= 90 ? 'Holdings aggregated' : 'Awaiting account aggregation'}
              </p>
            </div>
            <span className={`font-label-sm px-2 py-1 rounded ${
              progressPercent >= 90 ? 'text-secondary bg-secondary/10' : 'text-outline bg-surface-variant'
            }`}>
              {progressPercent >= 90 ? 'Linked' : 'Queued'}
            </span>
          </div>
          
        </div>

        {/* Footer Action */}
        <div className="w-full mt-auto pb-6">
          <button 
            onClick={() => navigate('/portfolio')}
            className="w-full min-h-[48px] flex items-center justify-center gap-2 rounded-full border border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low transition-colors text-primary font-label-md"
          >
            <BellRing size={20} />
            Notify me & continue in background
          </button>
          <p className="text-center font-body-md text-[12px] text-on-surface-variant mt-3">
            You can safely navigate away. Your portfolio will refresh once aggregation completes.
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
      `}</style>
    </div>
  );
}
