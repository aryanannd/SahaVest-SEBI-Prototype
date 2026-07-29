import React, { useState } from 'react';
import { Sparkles, BadgeCheck } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/common/Header';

const MOCK_OTP = import.meta.env.VITE_MOCK_OTP === 'true';
const AA_LIVE = import.meta.env.VITE_AA_LIVE === 'true';

export function OnboardingFlow() {
  const [step, setStep] = useState(0);
  const [lang, setLang] = useState('English');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [fips, setFips] = useState({ bank: true, demat: true, mf: true });
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  
  const navigate = useNavigate();

  const questions = [
    { q: "If your portfolio dropped 20% in a month, you would:", opts: ["Sell everything", "Sell some", "Hold", "Invest more"] },
    { q: "Your primary investing goal is:", opts: ["Capital protection", "Steady growth", "High growth, can accept swings"] },
    { q: "Your investment horizon is:", opts: ["Under 1 year", "1-5 years", "5+ years"] },
  ];

  const calculateRiskScore = () => {
    const vals = Object.values(answers);
    const sum = vals.reduce((a, b) => a + b, 0);
    if (sum <= 2) return "Conservative";
    if (sum <= 4) return "Moderate";
    return "Aggressive";
  };

  const finishSetup = async () => {
    setIsProcessing(true);
    const risk = calculateRiskScore();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('users').update({ risk_profile: risk }).eq('id', user.id);
      }
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (e) {
      console.error(e);
      navigate('/dashboard'); // Fallback for demo
    }
    setIsProcessing(false);
  };

  const handleMobileAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      if (MOCK_OTP && otp === '123456') {
        // Use demo-login bypass endpoint which returns a real session
        const res = await fetch('http://localhost:3000/api/auth/demo-login', { method: 'POST' });
        const data = await res.json();
        if (data.session) {
          // Set the session into the Supabase client so it works globally
          await supabase.auth.setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token
          });
          setStep(step + 1);
        } else {
          alert("Demo login failed");
        }
      } else {
        // Real OTP verify (to be fully integrated next)
        const res = await fetch('http://localhost:3000/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mobile: phone, otp })
        });
        const data = await res.json();
        if (data.session) {
          await supabase.auth.setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token
          });
          setStep(step + 1);
        } else {
          alert("Invalid OTP");
        }
      }
    } catch (e) {
      console.error(e);
      alert("Error during login");
    }
    setIsProcessing(false);
  };

  const handleDigilocker = () => {
    setIsProcessing(true);
    // Fake 2 second loading overlay
    setTimeout(() => {
      setIsProcessing(false);
      setStep(step + 1);
    }, 2000);
  };

  const handleAAConsent = () => {
    if (!AA_LIVE) {
      // Mock AA linking
      setStep(step + 1);
    } else {
      // Real Setu/Finvu call would happen here
    }
  };

  const steps = [
    // Step 0: Splash
    <div key="splash" className="flex-1 flex flex-col items-center justify-center gap-4 px-8 bg-surface">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-secondary">
        <Sparkles color="#fff" size={32} />
      </div>
      <Header />
      <p className="font-body-md text-on-surface-variant text-center">
        One app for every investment you make, and every risk you should know about.
      </p>
      <button 
        onClick={() => setStep(step + 1)}
        className="mt-8 w-full h-[56px] bg-primary text-on-primary rounded-full font-headline-sm transition-transform active:scale-[0.98]"
      >
        Get Started
      </button>
    </div>,

    // Step 1: Language
    <div key="lang" className="flex-1 flex flex-col px-margin-mobile pt-[64px]">
      <h1 className="font-display-lg-mobile text-primary mb-6">Choose language</h1>
      <div className="flex flex-col gap-3">
        {["English", "हिन्दी", "ગુજરાતી", "मराठी"].map((l) => (
          <button 
            key={l} 
            onClick={() => setLang(l)} 
            className={`text-left px-4 py-4 rounded-xl border font-body-lg ${lang === l ? 'border-secondary bg-secondary-container text-on-secondary-container' : 'border-outline-variant bg-surface-container-lowest'}`}
          >
            {l}
          </button>
        ))}
      </div>
      <div className="mt-auto pb-6 pt-4">
        <button 
          onClick={() => setStep(step + 1)}
          className="w-full h-[56px] bg-primary text-on-primary rounded-full font-headline-sm transition-transform active:scale-[0.98]"
        >
          Continue
        </button>
      </div>
    </div>,

    // Step 2: Mobile Auth
    <div key="otp" className="flex-1 flex flex-col px-margin-mobile pt-[64px]">
      <h1 className="font-display-lg-mobile text-primary mb-2">Enter Mobile Number</h1>
      <p className="font-body-md text-on-surface-variant mb-6">We will send an OTP for verification</p>
      
      <form className="flex-1 flex flex-col" onSubmit={handleMobileAuth}>
        <div className="mb-4">
          <label className="block font-label-md text-on-surface mb-1">Mobile Number</label>
          <div className="flex items-center bg-surface-container-lowest border border-outline-variant rounded-lg h-[56px] focus-within:border-primary overflow-hidden">
            <div className="px-4 bg-surface-container-low border-r border-outline-variant h-full flex items-center">+91</div>
            <input 
              value={phone} onChange={(e) => setPhone(e.target.value)}
              className="flex-1 bg-transparent px-4 font-body-lg outline-none" 
              placeholder="99999 99999" required 
            />
          </div>
        </div>
        
        <div className="mb-auto">
          <label className="block font-label-md text-on-surface mb-1">OTP</label>
          <div className="flex items-center bg-surface-container-lowest border border-outline-variant rounded-lg h-[56px] focus-within:border-primary overflow-hidden">
            <input 
              value={otp} onChange={(e) => setOtp(e.target.value)}
              className="flex-1 bg-transparent px-4 font-body-lg outline-none tracking-[0.5em]" 
              placeholder="••••••" required 
            />
          </div>
          {MOCK_OTP && <p className="text-xs text-secondary mt-1">Hint: Use 123456</p>}
        </div>

        <div className="mt-auto pb-6">
          <button type="submit" className="w-full h-[56px] bg-primary text-on-primary rounded-full font-headline-sm transition-transform active:scale-[0.98]">
            Verify OTP
          </button>
        </div>
      </form>
    </div>,

    // Step 3: CKYC (DigiLocker)
    <div key="ckyc" className="flex-1 flex flex-col px-margin-mobile pt-[64px]">
      <div className="flex justify-center items-center mb-6">
        <BadgeCheck className="text-secondary w-16 h-16" />
      </div>
      <h1 className="font-display-lg-mobile text-center text-primary mb-2">DigiLocker Consent</h1>
      <p className="font-body-md text-center text-on-surface-variant mb-6">
        SahaVest requires access to your official documents to complete your KYC securely.
      </p>

      <div className="bg-primary-container/10 rounded-lg p-4 border border-primary-container/20 mb-6">
        <p className="font-label-md text-primary-container mb-1">Secure & Encrypted</p>
        <p className="font-body-md text-sm text-on-surface-variant">SahaVest will use this only for identity verification. We do not store your raw document files.</p>
      </div>

      <div className="mt-auto pb-6 flex flex-col gap-3">
        <button 
          onClick={handleDigilocker}
          disabled={isProcessing}
          className="w-full h-[56px] bg-primary text-on-primary rounded-full font-headline-sm transition-transform active:scale-[0.98] flex items-center justify-center"
        >
          {isProcessing ? 'Fetching securely...' : 'Approve Request'}
        </button>
        <button className="w-full h-[48px] bg-transparent text-on-surface-variant border border-outline-variant rounded-full font-label-md">
          Deny
        </button>
      </div>
    </div>,

    // Step 4: AA Consent
    <div key="aa" className="flex-1 flex flex-col px-margin-mobile pt-[64px]">
      <h1 className="font-display-lg-mobile text-primary mb-2">Link your accounts</h1>
      <p className="font-body-md text-on-surface-variant mb-6">Via Account Aggregator consent — your existing broker and AMC stay the same, SahaVest only reads balances.</p>
      
      <div className="flex flex-col gap-3 mb-auto">
        {[["bank", "Bank accounts"], ["demat", "Demat / broker holdings"], ["mf", "Mutual fund folios"]].map(([k, label]) => (
          <label key={k} className="flex items-center gap-3 px-4 py-4 rounded-xl border border-outline-variant bg-surface-container-lowest">
            <input 
              type="checkbox" 
              checked={fips[k as keyof typeof fips]} 
              onChange={(e) => setFips({ ...fips, [k]: e.target.checked })} 
              className="w-5 h-5 text-primary border-outline rounded focus:ring-primary"
            />
            <span className="font-body-md text-on-surface">{label}</span>
          </label>
        ))}
      </div>

      <div className="mt-auto pb-6 pt-4">
        <button 
          onClick={handleAAConsent}
          className="w-full h-[56px] bg-primary text-on-primary rounded-full font-headline-sm transition-transform active:scale-[0.98]"
        >
          Link Accounts
        </button>
      </div>
    </div>,

    // Step 5: Risk Profiling
    <div key="risk" className="flex-1 flex flex-col px-margin-mobile pt-[64px] overflow-y-auto">
      <h1 className="font-display-lg-mobile text-primary mb-6">A few questions about you</h1>
      
      <div className="flex flex-col gap-6 mb-6">
        {questions.map((qq, qi) => (
          <div key={qi}>
            <p className="font-body-md font-medium text-on-surface mb-3">{qq.q}</p>
            <div className="flex flex-col gap-2">
              {qq.opts.map((o, oi) => (
                <button 
                  key={oi} 
                  onClick={() => setAnswers({ ...answers, [qi]: oi })}
                  className={`text-left px-4 py-3 rounded-lg border font-body-md ${answers[qi] === oi ? 'border-secondary bg-secondary-container text-on-secondary-container' : 'border-outline-variant bg-surface-container-lowest'}`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto pb-6">
        <button
          onClick={() => Object.keys(answers).length === questions.length ? finishSetup() : null}
          disabled={Object.keys(answers).length < questions.length || isProcessing}
          className="w-full h-[56px] bg-primary text-on-primary rounded-full font-headline-sm transition-transform active:scale-[0.98] disabled:opacity-50"
        >
          {isProcessing ? 'Saving Profile...' : 'Finish setup'}
        </button>
      </div>
    </div>
  ];

  return (
    <div className="flex-1 flex flex-col bg-surface h-full">
      {steps[step]}
    </div>
  );
}
