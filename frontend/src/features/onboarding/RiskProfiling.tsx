import React, { useState } from 'react';
import { X, TrendingUp, Landmark, PersonStanding, Shield, ArrowLeft, ArrowRight, AlertTriangle, Clock, DollarSign, BarChart2, Brain, Briefcase, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { Header } from '../../components/common/Header';

// =========================================================
// SCORING SYSTEM
// Each question has answers with a score 1–5:
//   1–2 = Conservative bias
//   3   = Moderate bias
//   4–5 = Aggressive bias
//
// Final weighted average:
//   <= 2.4  → Conservative
//   <= 3.4  → Moderate
//   > 3.4   → Aggressive
// =========================================================

const QUESTIONS = [
  {
    id: 'goal',
    title: 'What is your primary goal for investing?',
    subtitle: 'This helps us tailor your portfolio strategy to match your expectations.',
    options: [
      { label: 'Emergency Fund', description: 'High liquidity and capital safety.', icon: <Shield size={24} />, score: 1 },
      { label: 'Stable Income', description: 'Regular payouts with lower risk.', icon: <Landmark size={24} />, score: 2 },
      { label: 'Retirement Planning', description: 'Build a corpus for later years.', icon: <PersonStanding size={24} />, score: 3 },
      { label: 'Wealth Creation', description: 'Maximize long-term growth.', icon: <TrendingUp size={24} />, score: 5 },
    ],
  },
  {
    id: 'horizon',
    title: 'What is your investment time horizon?',
    subtitle: 'How long can you stay invested without needing this money?',
    options: [
      { label: 'Less than 1 year', description: 'I need liquidity soon.', icon: <Clock size={24} />, score: 1 },
      { label: '1–3 years', description: 'Short-term goals.', icon: <Clock size={24} />, score: 2 },
      { label: '3–7 years', description: 'Medium-term commitment.', icon: <Clock size={24} />, score: 3 },
      { label: '7+ years', description: 'Long-term wealth building.', icon: <Clock size={24} />, score: 5 },
    ],
  },
  {
    id: 'loss_tolerance',
    title: 'If your portfolio dropped 20% in a month, what would you do?',
    subtitle: 'Your reaction to losses tells us a lot about your risk tolerance.',
    options: [
      { label: 'Sell everything immediately', description: 'Protect capital at all costs.', icon: <AlertTriangle size={24} />, score: 1 },
      { label: 'Sell some to reduce exposure', description: 'Reduce but not exit.', icon: <AlertTriangle size={24} />, score: 2 },
      { label: 'Hold and wait for recovery', description: 'Stay the course.', icon: <BarChart2 size={24} />, score: 4 },
      { label: 'Buy more at lower prices', description: 'Opportunity to invest more.', icon: <TrendingUp size={24} />, score: 5 },
    ],
  },
  {
    id: 'income_stability',
    title: 'How stable is your current income?',
    subtitle: 'Income stability affects your ability to absorb portfolio losses.',
    options: [
      { label: 'Very unstable (freelance/startup)', description: 'Income varies significantly.', icon: <AlertTriangle size={24} />, score: 2 },
      { label: 'Somewhat stable', description: 'Occasional income gaps.', icon: <Briefcase size={24} />, score: 3 },
      { label: 'Stable (salaried)', description: 'Predictable monthly income.', icon: <Briefcase size={24} />, score: 4 },
      { label: 'Very stable + additional income', description: 'Multiple income streams.', icon: <DollarSign size={24} />, score: 5 },
    ],
  },
  {
    id: 'experience',
    title: 'What is your investing experience?',
    subtitle: 'Your background influences how comfortably you can navigate market complexity.',
    options: [
      { label: 'No experience', description: 'New to investing.', icon: <Brain size={24} />, score: 1 },
      { label: 'Some experience', description: 'Have invested in FDs or basic MFs.', icon: <Brain size={24} />, score: 2 },
      { label: 'Moderate experience', description: 'Invested in equity MFs or stocks.', icon: <Brain size={24} />, score: 4 },
      { label: 'Expert', description: 'Active equity/derivatives trading.', icon: <Brain size={24} />, score: 5 },
    ],
  },
  {
    id: 'savings_percent',
    title: 'What percentage of your monthly income can you invest?',
    subtitle: 'Higher investable surplus allows for better diversification.',
    options: [
      { label: 'Less than 5%', description: 'Very limited investable amount.', icon: <DollarSign size={24} />, score: 1 },
      { label: '5–15%', description: 'Moderate savings capacity.', icon: <DollarSign size={24} />, score: 2 },
      { label: '15–30%', description: 'Good savings discipline.', icon: <DollarSign size={24} />, score: 4 },
      { label: 'More than 30%', description: 'High savings rate.', icon: <DollarSign size={24} />, score: 5 },
    ],
  },
  {
    id: 'emergency_fund',
    title: 'Do you have an emergency fund in place?',
    subtitle: 'An emergency fund means you won\'t need to liquidate investments during crises.',
    options: [
      { label: 'No', description: 'No separate emergency reserve.', icon: <Shield size={24} />, score: 1 },
      { label: 'Partial (1–2 months expenses)', description: 'Some buffer but not enough.', icon: <Shield size={24} />, score: 2 },
      { label: 'Adequate (3–6 months)', description: 'Reasonable safety net.', icon: <Shield size={24} />, score: 4 },
      { label: 'Full (6+ months)', description: 'Well protected.', icon: <Shield size={24} />, score: 5 },
    ],
  },
  {
    id: 'asset_preference',
    title: 'Which asset class excites you most?',
    subtitle: 'This reveals your natural affinity for risk vs. reward.',
    options: [
      { label: 'Fixed Deposits / Bonds', description: 'Guaranteed returns, low risk.', icon: <Landmark size={24} />, score: 1 },
      { label: 'Balanced Mutual Funds', description: 'Mix of equity and debt.', icon: <Target size={24} />, score: 3 },
      { label: 'Equity Stocks / Small-cap MFs', description: 'High growth potential.', icon: <TrendingUp size={24} />, score: 4 },
      { label: 'Crypto / Alternatives', description: 'High risk, high reward.', icon: <BarChart2 size={24} />, score: 5 },
    ],
  },
];

// Compute risk category from scores
function computeRiskCategory(scores: number[]): 'Conservative' | 'Moderate' | 'Aggressive' {
  if (scores.length === 0) return 'Moderate';
  const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  if (avg <= 2.4) return 'Conservative';
  if (avg <= 3.4) return 'Moderate';
  return 'Aggressive';
}

export function RiskProfiling() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({}); // questionId → score
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const TOTAL_STEPS = QUESTIONS.length;
  const currentQ = QUESTIONS[currentStep];
  const progress = ((currentStep) / TOTAL_STEPS) * 100;

  const handleNext = async () => {
    if (selectedOption === null) return;

    const score = currentQ.options[selectedOption].score;
    const newAnswers = { ...answers, [currentQ.id]: score };
    setAnswers(newAnswers);

    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep(prev => prev + 1);
      setSelectedOption(null);
    } else {
      // Final step — compute result and save
      setSaving(true);
      const scores = Object.values(newAnswers);
      const category = computeRiskCategory(scores);

      try {
        // Save via API endpoint (POST /api/users/me/risk-profile)
        const { data: { session } } = await supabase.auth.getSession();
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (session) headers['Authorization'] = `Bearer ${session.access_token}`;

        await fetch('http://localhost:3000/api/users/me/risk-profile', {
          method: 'POST',
          headers,
          body: JSON.stringify({ risk_profile: category })
        });
      } catch (e) {
        console.error('Failed to save risk profile:', e);
      } finally {
        setSaving(false);
      }

      // Navigate to result with computed category
      navigate('/onboarding/risk-profile-result', {
        state: {
          riskCategory: category,
          scores: newAnswers,
          avg: Math.round(
            Object.values(newAnswers).reduce((s, v) => s + v, 0) /
            Object.values(newAnswers).length * 10
          ) / 10
        }
      });
    }
  };

  const handleBack = () => {
    if (currentStep === 0) {
      navigate(-1);
    } else {
      setCurrentStep(prev => prev - 1);
      // Restore previous selection if exists
      const prevQ = QUESTIONS[currentStep - 1];
      const prevScore = answers[prevQ.id];
      if (prevScore != null) {
        const prevIdx = prevQ.options.findIndex(o => o.score === prevScore);
        setSelectedOption(prevIdx >= 0 ? prevIdx : null);
      } else {
        setSelectedOption(null);
      }
    }
  };

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
          <Header />
          <div className="w-[44px]"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col max-w-2xl mx-auto w-full px-4 pt-6 pb-8">

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="font-label-md text-on-surface-variant">Step {currentStep + 1} of {TOTAL_STEPS}</span>
            <span className="font-label-md text-primary font-medium">Risk Profiling</span>
          </div>
          <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500 ease-in-out"
              style={{ width: `${progress + (1 / TOTAL_STEPS) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="mb-8 text-center md:text-left">
          <h1 className="font-display-lg-mobile md:font-display-lg text-on-surface mb-4">
            {currentQ.title}
          </h1>
          <p className="font-body-md text-on-surface-variant">
            {currentQ.subtitle}
          </p>
        </div>

        {/* Answer Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 flex-grow">
          {currentQ.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedOption(idx)}
              className={`group bg-surface-container-lowest border rounded-xl p-6 flex flex-col items-center justify-center text-center transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 min-h-[140px] shadow-sm hover:shadow-md ${
                selectedOption === idx
                  ? 'border-primary ring-1 ring-primary bg-primary-fixed/10'
                  : 'border-outline-variant hover:border-primary hover:bg-surface-container-low'
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${
                selectedOption === idx
                  ? 'bg-primary text-on-primary'
                  : 'bg-primary-container text-on-primary-container group-hover:bg-primary group-hover:text-on-primary'
              }`}>
                {option.icon}
              </div>
              <span className="font-headline-sm text-on-surface mb-1">{option.label}</span>
              <span className="font-body-md text-on-surface-variant text-sm">{option.description}</span>
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-4 border-t border-outline-variant mt-auto">
          <button
            onClick={handleBack}
            className="px-6 py-3 min-h-[48px] rounded-full border border-outline text-on-surface font-label-md hover:bg-surface-container-low transition-colors active:scale-95 focus:outline-none flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={selectedOption === null || saving}
            className={`px-6 py-3 min-h-[48px] rounded-full font-label-md transition-colors active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 flex items-center gap-2 ${
              selectedOption !== null && !saving
                ? 'bg-primary text-on-primary hover:bg-primary/90 cursor-pointer'
                : 'bg-primary text-on-primary opacity-50 cursor-not-allowed'
            }`}
          >
            {saving ? 'Saving...' : currentStep === TOTAL_STEPS - 1 ? 'See My Profile' : 'Next'}
            {!saving && <ArrowRight size={16} />}
          </button>
        </div>

      </main>
    </div>
  );
}
