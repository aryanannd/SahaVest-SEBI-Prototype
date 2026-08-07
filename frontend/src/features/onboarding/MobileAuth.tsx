import React, { useState } from 'react';
import { ArrowLeft, Check, ArrowRight, Mail, Phone, Loader2, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

export function MobileAuth() {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState<'mobile' | 'email'>('mobile');
  const [emailStep, setEmailStep] = useState<'email_input' | 'password_input' | 'signup_password' | 'check_email'>('email_input');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleEmailCheck = async () => {
    setIsProcessing(true);
    setAuthError('');
    try {
      // Use RPC to check if email exists in public.users
      const { data, error } = await supabase.rpc('check_email_registered', { lookup_email: email });
      if (error) throw error;
      
      if (data === true) {
        // User exists, show password login
        setEmailStep('password_input');
      } else {
        // User does not exist, show password signup
        setEmailStep('signup_password');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Failed to verify email');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEmailLogin = async () => {
    setIsProcessing(true);
    setAuthError('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      if (data.session) {
        localStorage.setItem('sahavest_demo_session', JSON.stringify(data.session));
        localStorage.setItem('sahavest_user', JSON.stringify(data.user));
      }

      const { data: userData } = await supabase.from('users').select('onboarding_status, kyc_status').eq('id', data.user.id).single();
      
      if (userData?.kyc_status === 'pending' || userData?.kyc_status === 'complete') {
        if (userData.onboarding_status !== 'personal_info_pending' && userData.onboarding_status !== 'kyc_pending') {
           navigate('/dashboard');
           return;
        }
      }
      
      if (userData?.onboarding_status === 'personal_info_pending') {
        navigate('/onboarding/personal-info');
      } else if (userData?.onboarding_status === 'kyc_pending') {
        navigate('/onboarding/kyc-upload');
      } else {
        navigate('/onboarding/personal-info');
      }
      
    } catch (err: any) {
      setAuthError(err.message || 'Invalid login credentials');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEmailSignup = async () => {
    setIsProcessing(true);
    setAuthError('');
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) throw error;
      
      if (data.session) {
        localStorage.setItem('sahavest_demo_session', JSON.stringify(data.session));
        localStorage.setItem('sahavest_user', JSON.stringify(data.user));
        navigate('/onboarding/personal-info');
        return;
      }
      
      setEmailStep('check_email');
    } catch (err: any) {
      setAuthError(err.message || 'Failed to sign up');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!agreed && authMode === 'mobile') return;
    if (!agreed && authMode === 'email' && emailStep === 'signup_password') return; // Only require terms on signup/mobile

    if (authMode === 'mobile') {
      if (mobileNumber.length >= 10) {
        setIsProcessing(true);
        const isMock = import.meta.env.VITE_MOCK_OTP === 'true';
        if (isMock) {
          navigate('/onboarding/otp', { state: { phone: mobileNumber } });
        } else {
          try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/auth/otp`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ mobile: mobileNumber })
            });
            if (res.ok) {
              navigate('/onboarding/otp', { state: { phone: mobileNumber } });
            } else {
              setAuthError('Failed to send OTP');
            }
          } catch (err) {
            setAuthError('Error sending OTP');
          }
        }
        setIsProcessing(false);
      }
    } else {
      // Email Mode
      if (emailStep === 'email_input' && email) {
        await handleEmailCheck();
      } else if (emailStep === 'password_input' && password) {
        await handleEmailLogin();
      } else if (emailStep === 'signup_password' && password) {
        await handleEmailSignup();
      }
    }
  };

  // Check Email success state
  if (emailStep === 'check_email') {
    return (
      <div className="bg-background text-on-background min-h-screen flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-surface-container-lowest rounded-xl p-8 text-center border border-outline-variant">
          <div className="w-16 h-16 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail size={32} />
          </div>
          <h2 className="font-display-sm mb-2 text-on-surface">Check your email</h2>
          <p className="font-body-md text-on-surface-variant mb-6">
            We sent a confirmation link to <span className="font-medium text-on-surface">{email}</span>. Click it to verify your account.
          </p>
          <p className="font-body-sm text-outline mb-6">
            You can safely close this window or return to login after verifying.
          </p>
          <button 
            onClick={() => {
              setEmail('');
              setPassword('');
              setEmailStep('email_input');
            }}
            className="text-primary font-label-lg hover:underline"
          >
            Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md antialiased md:items-center md:justify-center">
      <main className="flex-1 flex flex-col px-4 pt-16 pb-8 w-full max-w-md mx-auto relative z-10 md:bg-surface-container-lowest md:rounded-xl md:shadow-sm md:border md:border-outline-variant md:min-h-[600px] md:pt-8">
        <button 
          aria-label="Go back" 
          onClick={() => {
            if (authMode === 'email' && emailStep !== 'email_input') {
              setEmailStep('email_input');
              setPassword('');
              setAuthError('');
            } else {
              navigate(-1);
            }
          }}
          className="w-[44px] h-[44px] flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors absolute top-4 left-4 md:static md:mb-6"
        >
          <ArrowLeft size={24} />
        </button>

        <header className="mt-8 md:mt-0 mb-6">
          <h1 className="font-display-lg-mobile text-on-surface mb-2">
            {authMode === 'mobile' ? 'Enter Mobile Number' : 
             emailStep === 'email_input' ? 'Enter Email Address' : 
             emailStep === 'password_input' ? 'Welcome Back' : 'Create Password'}
          </h1>
          <p className="font-body-md text-on-surface-variant">
            {authMode === 'mobile' ? 'We will send an OTP for verification' : 
             emailStep === 'email_input' ? 'We will verify if you have an account' :
             emailStep === 'password_input' ? 'Enter your password to securely log in' : 'Set a password for your new account'}
          </p>
        </header>

        {/* Auth Mode Toggle (Only show on first steps) */}
        {(authMode === 'mobile' || emailStep === 'email_input') && (
          <div className="flex bg-surface-container-low p-1 rounded-lg mb-6">
            <button
              type="button"
              onClick={() => { setAuthMode('mobile'); setAuthError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${authMode === 'mobile' ? 'bg-surface text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              <Phone size={16} />
              Mobile
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('email'); setAuthError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${authMode === 'email' ? 'bg-surface text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              <Mail size={16} />
              Email
            </button>
          </div>
        )}

        {authError && (
          <div className="mb-4 p-3 bg-error-container text-on-error-container text-sm rounded-lg">
            {authError}
          </div>
        )}

        <form className="flex-1 flex flex-col" onSubmit={handleSubmit}>
          <div className="mb-auto space-y-4">
            {authMode === 'mobile' ? (
              <div>
                <label className="block font-label-md text-on-surface mb-1" htmlFor="mobile-number">Mobile Number</label>
                <div className="relative flex items-center bg-surface-container-lowest border border-outline-variant rounded-lg focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-shadow h-[56px] overflow-hidden">
                  <div className="flex items-center justify-center h-full px-4 bg-surface-container-low border-r border-outline-variant text-on-surface font-body-lg">
                    +91
                  </div>
                  <input 
                    autoComplete="tel-national" 
                    className="flex-1 h-full bg-transparent border-none focus:ring-0 px-4 font-body-lg text-on-surface placeholder:text-outline outline-none" 
                    id="mobile-number" 
                    inputMode="numeric" 
                    maxLength={10} 
                    pattern="[0-9]*" 
                    placeholder="99999 99999" 
                    required={authMode === 'mobile'} 
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                  />
                </div>
                {import.meta.env.VITE_MOCK_OTP === 'true' && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-warning px-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse"></div>
                    Demo Mode Active: Enter any OTP
                  </div>
                )}
              </div>
            ) : (
              <div>
                {emailStep === 'email_input' ? (
                  <>
                    <label className="block font-label-md text-on-surface mb-1" htmlFor="email-input">Email Address</label>
                    <input 
                      autoComplete="email" 
                      className="w-full h-[56px] bg-surface-container-lowest border border-outline-variant rounded-lg px-4 font-body-lg text-on-surface placeholder:text-outline outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow" 
                      id="email-input" 
                      type="email"
                      placeholder="name@example.com" 
                      required={authMode === 'email'}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </>
                ) : (
                  <>
                    <div className="mb-4 p-3 bg-surface-container-low rounded-lg border border-outline-variant flex items-center justify-between">
                      <span className="text-on-surface font-medium truncate">{email}</span>
                      <button 
                        type="button" 
                        onClick={() => { setEmailStep('email_input'); setPassword(''); }}
                        className="text-primary text-sm font-label-md"
                      >
                        Change
                      </button>
                    </div>
                    <label className="block font-label-md text-on-surface mb-1" htmlFor="password-input">Password</label>
                    <div className="relative">
                      <input 
                        autoComplete={emailStep === 'password_input' ? "current-password" : "new-password"}
                        className="w-full h-[56px] bg-surface-container-lowest border border-outline-variant rounded-lg pl-4 pr-12 font-body-lg text-on-surface placeholder:text-outline outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow" 
                        id="password-input" 
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••" 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-on-surface-variant hover:text-on-surface focus:outline-none"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="mt-8 space-y-6">
            {/* Terms Checkbox - Only for mobile or signup */}
            {(authMode === 'mobile' || emailStep === 'signup_password') && (
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center w-[24px] h-[24px] shrink-0 mt-1">
                  <input 
                    className="peer appearance-none w-[20px] h-[20px] border-2 border-outline rounded bg-surface-container-lowest checked:bg-primary checked:border-primary transition-colors focus:ring-2 focus:ring-primary-container focus:ring-offset-2 focus:ring-offset-background outline-none" 
                    required 
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                  />
                  <Check size={14} className="absolute text-on-primary opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity stroke-[3]" />
                </div>
                <span className="font-label-sm text-on-surface-variant pt-1 leading-relaxed">
                  By continuing, you agree to our <a className="text-primary hover:underline" href="#">Terms of Service</a> and <a className="text-primary hover:underline" href="#">Privacy Policy</a>.
                </span>
              </label>
            )}

            <button 
              disabled={isProcessing || 
                (authMode === 'mobile' && (!agreed || mobileNumber.length < 10)) ||
                (authMode === 'email' && emailStep === 'email_input' && !email) ||
                (authMode === 'email' && emailStep === 'password_input' && !password) ||
                (authMode === 'email' && emailStep === 'signup_password' && (!agreed || !password))
              }
              className="w-full h-[56px] bg-primary text-on-primary font-headline-sm rounded-full flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-30 disabled:pointer-events-none shadow-sm" 
              type="submit"
            >
              {isProcessing ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  {authMode === 'mobile' ? 'Send OTP' : 
                   emailStep === 'email_input' ? 'Next' :
                   emailStep === 'password_input' ? 'Log In' : 'Create Account'}
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </div>
        </form>
      </main>

      <div 
        className="hidden md:block fixed inset-0 z-0 pointer-events-none opacity-20" 
        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--tw-colors-outline-variant) 1px, transparent 0)', backgroundSize: '32px 32px' }}
      ></div>
    </div>
  );
}
