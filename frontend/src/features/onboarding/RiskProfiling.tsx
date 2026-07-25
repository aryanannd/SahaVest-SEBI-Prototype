import React, { useState } from 'react';
import { X, TrendingUp, Landmark, PersonStanding, Shield, ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

export function RiskProfiling() {
  const navigate = useNavigate();
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-sans">
      {/* TopAppBar */}
      <header className="bg-surface text-primary font-headline-sm w-full sticky top-0 z-50 border-b border-outline-variant">
        <div className="flex items-center justify-between px-4 py-3 w-full max-w-7xl mx-auto">
          <button 
            onClick={() => navigate('/onboarding/welcome')}
            className="text-on-surface-variant hover:bg-surface-container-low transition-colors active:scale-95 duration-100 p-2 rounded-full flex items-center justify-center"
          >
            <X size={24} />
          </button>
          <span className="font-headline-md text-primary tracking-tight">SahaVest</span>
          <div className="w-[44px]"></div> {/* Spacer to balance flex layout */}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col max-w-2xl mx-auto w-full px-4 pt-6 pb-8">
        
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="font-label-md text-on-surface-variant">Step 1 of 8</span>
            <span className="font-label-md text-primary font-medium">Risk Profiling</span>
          </div>
          <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500 ease-in-out" style={{ width: '12.5%' }}></div>
          </div>
        </div>

        {/* Question */}
        <div className="mb-8 text-center md:text-left">
          <h1 className="font-display-lg-mobile md:font-display-lg text-on-surface mb-4">
            What is your primary goal for investing?
          </h1>
          <p className="font-body-md text-on-surface-variant">
            This helps us tailor your portfolio strategy to match your expectations.
          </p>
        </div>

        {/* Answer Options (Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 flex-grow">
          
          {/* Option 1: Wealth Creation */}
          <button 
            onClick={() => setSelectedGoal('wealth')}
            className={`group bg-surface-container-lowest border rounded-xl p-6 flex flex-col items-center justify-center text-center transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 min-h-[160px] shadow-sm hover:shadow-md ${
              selectedGoal === 'wealth' 
                ? 'border-primary ring-1 ring-primary bg-primary-fixed/10' 
                : 'border-outline-variant hover:border-primary hover:bg-surface-container-low'
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors ${
              selectedGoal === 'wealth'
                ? 'bg-primary text-on-primary'
                : 'bg-primary-container text-on-primary-container group-hover:bg-primary group-hover:text-on-primary'
            }`}>
              <TrendingUp size={24} />
            </div>
            <span className="font-headline-sm text-on-surface mb-2">Wealth Creation</span>
            <span className="font-body-md text-on-surface-variant text-sm">Maximize long-term growth.</span>
          </button>

          {/* Option 2: Stable Income */}
          <button 
            onClick={() => setSelectedGoal('income')}
            className={`group bg-surface-container-lowest border rounded-xl p-6 flex flex-col items-center justify-center text-center transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 min-h-[160px] shadow-sm hover:shadow-md ${
              selectedGoal === 'income' 
                ? 'border-primary ring-1 ring-primary bg-primary-fixed/10' 
                : 'border-outline-variant hover:border-primary hover:bg-surface-container-low'
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors ${
              selectedGoal === 'income'
                ? 'bg-primary text-on-primary'
                : 'bg-primary-container text-on-primary-container group-hover:bg-primary group-hover:text-on-primary'
            }`}>
              <Landmark size={24} />
            </div>
            <span className="font-headline-sm text-on-surface mb-2">Stable Income</span>
            <span className="font-body-md text-on-surface-variant text-sm">Regular payouts with lower risk.</span>
          </button>

          {/* Option 3: Retirement Planning */}
          <button 
            onClick={() => setSelectedGoal('retirement')}
            className={`group bg-surface-container-lowest border rounded-xl p-6 flex flex-col items-center justify-center text-center transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 min-h-[160px] shadow-sm hover:shadow-md ${
              selectedGoal === 'retirement' 
                ? 'border-primary ring-1 ring-primary bg-primary-fixed/10' 
                : 'border-outline-variant hover:border-primary hover:bg-surface-container-low'
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors ${
              selectedGoal === 'retirement'
                ? 'bg-primary text-on-primary'
                : 'bg-primary-container text-on-primary-container group-hover:bg-primary group-hover:text-on-primary'
            }`}>
              <PersonStanding size={24} />
            </div>
            <span className="font-headline-sm text-on-surface mb-2">Retirement Planning</span>
            <span className="font-body-md text-on-surface-variant text-sm">Build a corpus for later years.</span>
          </button>

          {/* Option 4: Emergency Fund */}
          <button 
            onClick={() => setSelectedGoal('emergency')}
            className={`group bg-surface-container-lowest border rounded-xl p-6 flex flex-col items-center justify-center text-center transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 min-h-[160px] shadow-sm hover:shadow-md ${
              selectedGoal === 'emergency' 
                ? 'border-primary ring-1 ring-primary bg-primary-fixed/10' 
                : 'border-outline-variant hover:border-primary hover:bg-surface-container-low'
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors ${
              selectedGoal === 'emergency'
                ? 'bg-primary text-on-primary'
                : 'bg-primary-container text-on-primary-container group-hover:bg-primary group-hover:text-on-primary'
            }`}>
              <Shield size={24} />
            </div>
            <span className="font-headline-sm text-on-surface mb-2">Emergency Fund</span>
            <span className="font-body-md text-on-surface-variant text-sm">High liquidity and capital safety.</span>
          </button>

        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-4 border-t border-outline-variant mt-auto">
          <button 
            onClick={() => navigate(-1)}
            className="px-6 py-3 min-h-[48px] rounded-full border border-outline text-on-surface font-label-md hover:bg-surface-container-low transition-colors active:scale-95 focus:outline-none focus:ring-2 focus:ring-outline flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          
          <button 
            onClick={async () => {
              if (selectedGoal) {
                try {
                  const { data: { user } } = await supabase.auth.getUser();
                  if (user) {
                    await supabase.from('users').update({ risk_profile: 'Moderate' }).eq('id', user.id);
                  }
                } catch(e) {
                  console.error(e);
                }
                navigate('/onboarding/risk-profile-result', { state: { goal: selectedGoal } });
              }
            }}
            disabled={!selectedGoal}
            className={`px-6 py-3 min-h-[48px] rounded-full font-label-md transition-colors active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 flex items-center gap-2 ${
              selectedGoal 
                ? 'bg-primary text-on-primary hover:bg-primary/90 cursor-pointer' 
                : 'bg-primary text-on-primary opacity-50 cursor-not-allowed'
            }`}
          >
            Next
            <ArrowRight size={16} />
          </button>
        </div>

      </main>
    </div>
  );
}
