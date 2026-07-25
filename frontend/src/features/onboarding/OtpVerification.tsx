import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Shield, AlertCircle, Loader2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

export function OtpVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const phone = location.state?.phone || '';
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [timeLeft]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError(false);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const otpValue = otp.join('');
    if (otpValue.length === 6) {
      setIsProcessing(true);
      const isMock = import.meta.env.VITE_MOCK_OTP === 'true';
      try {
        if (isMock && otpValue === '123456') {
          const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}/auth/demo-login`, { method: 'POST' });
          const data = await res.json();
          if (data.session) {
            await supabase.auth.setSession({
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token
            });
            navigate('/onboarding/welcome');
          } else {
            setError(true);
          }
        } else {
          const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}/auth/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mobile: phone, otp: otpValue })
          });
          const data = await res.json();
          if (data.session) {
            await supabase.auth.setSession({
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token
            });
            navigate('/onboarding/welcome');
          } else {
            setError(true);
          }
        }
      } catch (err) {
        setError(true);
      }
      setIsProcessing(false);
    } else {
      setError(true);
    }
  };

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col items-center justify-center p-4">
      {/* Top Navigation */}
      <div className="fixed top-0 left-0 w-full p-4 flex justify-start z-50 max-w-lg mx-auto md:max-w-none">
        <button 
          onClick={() => navigate(-1)}
          className="w-[44px] h-[44px] flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors text-on-surface-variant"
        >
          <ArrowLeft size={24} />
        </button>
      </div>

      <main className="w-full max-w-md bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 p-6 sm:p-8 flex flex-col gap-6 z-10 relative overflow-hidden">
        {/* Subtle Background Accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
        
        {/* Header Section */}
        <div className="flex flex-col gap-3 text-center">
          <div className="mx-auto w-16 h-16 bg-primary-fixed rounded-full flex items-center justify-center text-on-primary-fixed-variant mb-2">
            <Shield size={32} className="fill-current stroke-white" />
          </div>
          <h1 className="font-display-lg-mobile md:font-display-lg text-on-surface tracking-tight">Verify OTP</h1>
          <p className="font-body-lg text-on-surface-variant">
            Enter the 6-digit code sent to<br />
            <span className="font-headline-sm text-on-surface">+91 9XXXXX1234</span>
          </p>
        </div>

        {/* OTP Input Form */}
        <form className="flex flex-col gap-6 w-full" onSubmit={handleSubmit}>
          <div className="flex justify-between gap-2 sm:gap-3">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <input 
                key={index}
                ref={(el) => inputRefs.current[index] = el}
                aria-label={`Digit ${index + 1}`} 
                className={`otp-input w-full h-[56px] text-center font-headline-md bg-surface rounded-lg transition-all text-on-surface outline-none border ${
                  error 
                    ? 'border-error focus:border-error focus:ring-2 focus:ring-error-container text-error' 
                    : 'border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary-fixed'
                }`}
                maxLength={1} 
                pattern="\d*" 
                required 
                type="text" 
                inputMode="numeric"
                value={otp[index]}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
              />
            ))}
          </div>

          {/* Error State */}
          {error && (
            <div className="flex items-center gap-2 text-error font-label-md justify-center mt-[-8px]">
              <AlertCircle size={16} className="fill-current stroke-white" />
              <span>Incorrect code. Please try again.</span>
            </div>
          )}

          {/* Auto-read hint & Timer */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2 text-on-surface-variant font-body-md">
              <Loader2 size={18} className="animate-spin" />
              <span>Waiting for OTP...</span>
            </div>
            <p className="font-label-md text-on-surface-variant">
              Resend OTP in <span className="font-headline-sm text-on-surface ml-1">00:{timeLeft.toString().padStart(2, '0')}</span>
            </p>
          </div>

          {/* Action Button */}
          <button 
            className="w-full h-[56px] bg-primary text-on-primary font-headline-sm rounded-full flex items-center justify-center mt-2 hover:bg-primary-container hover:text-on-primary-container active:scale-[0.98] transition-all disabled:opacity-30 disabled:pointer-events-none" 
            type="submit"
            disabled={otp.join('').length < 6}
          >
            Verify & Proceed
          </button>
        </form>

        {/* Secondary Action */}
        <div className="text-center mt-2 border-t border-outline-variant/30 pt-4">
          <button className="font-label-md text-primary hover:text-primary-container hover:underline underline-offset-4 min-h-[44px] px-4 transition-colors">
            Having trouble? Get help
          </button>
        </div>
      </main>
      
      <style>{`
        .otp-input::-webkit-outer-spin-button,
        .otp-input::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }
      `}</style>
    </div>
  );
}
