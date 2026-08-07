import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase, getAuthSession } from '../../lib/supabaseClient';
import { Loader2 } from 'lucide-react';

export function AuthGuard({ children, requireKyc = false }: { children: React.ReactNode, requireKyc?: boolean }) {
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated' | 'kyc_pending'>('loading');
  const location = useLocation();

  useEffect(() => {
    async function checkAuth() {
      const session = await getAuthSession();
      
      if (!session) {
        setStatus('unauthenticated');
        return;
      }

      if (requireKyc) {
        const userId = session.user?.id || (session as any).user_id;
        if (userId) {
          try {
            const { data: user } = await supabase.from('users').select('kyc_status, onboarding_status').eq('id', userId).single();
            if (user && user.kyc_status !== 'complete' && user.kyc_status !== 'verified') {
              setStatus('kyc_pending');
              return;
            }
          } catch {
            // In demo mode or offline, pass through
          }
        }
      }

      setStatus('authenticated');
    }
    
    checkAuth();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        const demoSession = localStorage.getItem('sahavest_demo_session');
        if (!demoSession) {
          setStatus('unauthenticated');
        } else {
          setStatus('authenticated');
        }
      } else {
        checkAuth();
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [requireKyc]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 size={32} className="text-primary animate-spin mb-4" />
        <p className="font-body-md text-on-surface-variant">Checking access...</p>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    // Redirect to login, saving the current location they tried to access
    return <Navigate to="/onboarding/mobile" state={{ from: location }} replace />;
  }
  
  if (status === 'kyc_pending') {
    // Redirect to KYC processing or onboarding flow
    return <Navigate to="/onboarding/kyc-processing" replace />;
  }

  return <>{children}</>;
}
