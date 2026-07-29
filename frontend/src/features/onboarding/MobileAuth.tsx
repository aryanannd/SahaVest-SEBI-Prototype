import React, { useState } from 'react';
import { ArrowLeft, Check, ArrowRight, Mail, Phone, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

export function MobileAuth() {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState<'mobile' | 'email'>('mobile');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!agreed) return;

    if (authMode === 'mobile') {
      if (mobileNumber.length >= 10) {
        setIsProcessing(true);
        const isMock = import.meta.env.VITE_MOCK_OTP === 'true';
        if (isMock) {
          navigate('/onboarding/otp', { state: { phone: mobileNumber } });
        } else {
          try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}/auth/otp`, {
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
      if (email) {
        setIsProcessing(true);
        const isMock = import.meta.env.VITE_MOCK_OTP === 'true';
        
        if (isMock && email === 'demo@example.com') {
          navigate('/onboarding/otp', { state: { email } });
        } else {
          try {
            const { error } = await supabase.auth.signInWithOtp({ email });
            if (error) {
              setAuthError(error.message);
            } else {
              navigate('/onboarding/otp', { state: { email } });
            }
          } catch (err) {
            setAuthError('An unexpected error occurred');
          }
        }
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md antialiased md:items-center md:justify-center">
      {/* Main Container */}
      <main className="flex-1 flex flex-col px-4 pt-16 pb-8 w-full max-w-md mx-auto relative z-10 md:bg-surface-container-lowest md:rounded-xl md:shadow-sm md:border md:border-outline-variant md:min-h-[600px] md:pt-8">
        {/* Back Button */}
        <button 
          aria-label="Go back" 
          onClick={() => navigate(-1)}
          className="w-[44px] h-[44px] flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors absolute top-4 left-4 md:static md:mb-6"
        >
          <ArrowLeft size={24} />
        </button>

        {/* Header Section */}
        <header className="mt-8 md:mt-0 mb-6">
          <h1 className="font-display-lg-mobile text-on-surface mb-2">
            {authMode === 'mobile' ? 'Enter Mobile Number' : 'Enter Email Address'}
          </h1>
          <p className="font-body-md text-on-surface-variant">
            {authMode === 'mobile' ? 'We will send an OTP for verification' : 'We will send a confirmation code to your email'}
          </p>
        </header>

        {/* Auth Mode Toggle */}
        <div className="flex bg-surface-container-low p-1 rounded-lg mb-6">
          <button
            type="button"
            onClick={() => setAuthMode('mobile')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${authMode === 'mobile' ? 'bg-surface text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            <Phone size={16} />
            Mobile
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('email')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${authMode === 'email' ? 'bg-surface text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            <Mail size={16} />
            Email
          </button>
        </div>

        {authError && (
          <div className="mb-4 p-3 bg-error-container text-on-error-container text-sm rounded-lg">
            {authError}
          </div>
        )}

        {/* Form Section */}
        <form className="flex-1 flex flex-col" onSubmit={handleSubmit}>
          {/* Input Group */}
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
              </div>
            ) : (
              <div>
                <label className="block font-label-md text-on-surface mb-1" htmlFor="email-input">Email Address</label>
                <input 
                  autoComplete="email" 
                  className="w-full h-[56px] bg-surface-container-lowest border border-outline-variant rounded-lg px-4 font-body-lg text-on-surface placeholder:text-outline outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow" 
                  id="email-input" 
                  type="email"
                  placeholder="demo@example.com" 
                  required={authMode === 'email'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="mt-8 space-y-6">
            {/* Terms Checkbox */}
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

            {/* CTA Button */}
            <button 
              disabled={!agreed || isProcessing || (authMode === 'mobile' ? mobileNumber.length < 10 : (!email || !password))}
              className="w-full h-[56px] bg-primary text-on-primary font-headline-sm rounded-full flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-30 disabled:pointer-events-none shadow-sm" 
              type="submit"
            >
              {isProcessing ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  {authMode === 'mobile' ? 'Send OTP' : 'Continue'}
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </div>
        </form>
      </main>

      {/* Subtle Background Pattern for Desktop */}
      <div 
        className="hidden md:block fixed inset-0 z-0 pointer-events-none opacity-20" 
        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--tw-colors-outline-variant) 1px, transparent 0)', backgroundSize: '32px 32px' }}
      ></div>
    </div>
  );
}
