import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { CheckCircle2, Loader2, MailCheck } from 'lucide-react';

export function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Supabase client automatically handles the session hash in the URL on load
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setStatus('success');
        localStorage.setItem('sahavest_demo_session', JSON.stringify(session));
        if (session.user) localStorage.setItem('sahavest_user', JSON.stringify(session.user));
        
        // Wait a moment so the user sees the success state before redirecting
        setTimeout(async () => {
          // Check user onboarding status
          const { data } = await supabase.from('users').select('onboarding_status').eq('id', session.user.id).single();
          
          if (data?.onboarding_status === 'personal_info_pending' || !data) {
            navigate('/onboarding/personal-info');
          } else {
            navigate('/dashboard'); // fallback
          }
        }, 2000);
      }
    });

    // Handle case where URL doesn't have a valid hash or it fails
    const hash = window.location.hash;
    if (!hash || !hash.includes('access_token')) {
      // It might be a password recovery link or error
      if (window.location.search.includes('error=')) {
        setStatus('error');
        setErrorMessage('Invalid or expired confirmation link.');
      } else {
        // If they just navigate to /auth/callback without hash but have session
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session) {
             setStatus('success');
             setTimeout(() => navigate('/onboarding/personal-info'), 2000);
          } else {
             setStatus('error');
             setErrorMessage('No authentication session found.');
          }
        });
      }
    }

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-surface-container-lowest rounded-xl p-8 text-center border border-outline-variant shadow-sm">
        
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Loader2 size={32} className="text-on-surface-variant animate-spin" />
            </div>
            <h2 className="font-display-sm mb-2 text-on-surface">Verifying your email...</h2>
            <p className="font-body-md text-on-surface-variant">
              Please wait while we securely confirm your account.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center mx-auto mb-6">
              <MailCheck size={32} />
            </div>
            <h2 className="font-display-sm mb-2 text-on-surface">Email confirmed!</h2>
            <div className="bg-surface-container-low border border-outline-variant p-4 rounded-lg flex items-start gap-3 text-left mb-6">
              <CheckCircle2 className="text-primary shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-label-md text-on-surface">Next step: KYC</p>
                <p className="font-body-md text-on-surface-variant text-sm mt-1">
                  Complete your personal information and verify your identity to unlock investing.
                </p>
              </div>
            </div>
            <div className="flex justify-center">
              <Loader2 size={24} className="text-primary animate-spin" />
            </div>
            <p className="font-label-sm text-outline mt-4">Redirecting...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-error-container text-on-error-container rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="font-display-md">!</span>
            </div>
            <h2 className="font-display-sm mb-2 text-error">Verification Failed</h2>
            <p className="font-body-md text-on-surface-variant mb-6">
              {errorMessage}
            </p>
            <button 
              onClick={() => navigate('/onboarding/mobile')}
              className="w-full h-[48px] bg-primary text-on-primary font-headline-sm rounded-full"
            >
              Back to Login
            </button>
          </>
        )}

      </div>
    </div>
  );
}
