import React from 'react';
import { Scale, Clock, X, TrendingUp, Shield, Target } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Header } from '../../components/common/Header';

const CATEGORY_CONFIG = {
  Conservative: {
    icon: <Shield size={48} strokeWidth={1.5} />,
    iconBg: 'bg-secondary-container',
    iconColor: 'text-on-secondary-container',
    color: 'text-secondary',
    title: 'CONSERVATIVE',
    description: 'You prioritize capital preservation over growth. Low-risk instruments like debt funds, FDs, and government bonds are best suited for you.',
    allocation: 'Suggested: 70% Debt · 20% Hybrid · 10% Equity',
  },
  Moderate: {
    icon: <Scale size={48} strokeWidth={1.5} />,
    iconBg: 'bg-tertiary-container',
    iconColor: 'text-on-tertiary-container',
    color: 'text-tertiary',
    title: 'MODERATE',
    description: 'You prefer a balance of growth and safety, accepting some market fluctuations for better returns over time.',
    allocation: 'Suggested: 40% Equity · 40% Debt · 20% Hybrid',
  },
  Aggressive: {
    icon: <TrendingUp size={48} strokeWidth={1.5} />,
    iconBg: 'bg-primary-container',
    iconColor: 'text-on-primary-container',
    color: 'text-primary',
    title: 'AGGRESSIVE',
    description: 'You seek maximum growth and are comfortable with significant market volatility. Equity-heavy portfolios with high-growth potential are your fit.',
    allocation: 'Suggested: 75% Equity · 15% Hybrid · 10% Alternatives',
  },
};

export function RiskProfileResult() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get computed category from navigation state (set by RiskProfiling.tsx)
  const riskCategory: 'Conservative' | 'Moderate' | 'Aggressive' =
    location.state?.riskCategory || 'Moderate';
  const avg: number | undefined = location.state?.avg;

  const config = CATEGORY_CONFIG[riskCategory];

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-sans">
      {/* TopAppBar */}
      <header className="w-full sticky top-0 z-50 bg-surface border-b border-outline-variant">
        <div className="flex items-center justify-between px-4 py-3 w-full max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/onboarding/welcome')}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors active:scale-95 duration-100"
          >
            <X size={24} className="text-primary" />
          </button>
          <Header />
          <div className="w-10 h-10"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 py-8 max-w-7xl mx-auto w-full relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-secondary-container via-surface to-background"></div>

        <div className="relative z-10 w-full max-w-lg flex flex-col items-center text-center space-y-8">

          {/* Result Badge */}
          <div className="flex flex-col items-center space-y-3">
            <div className={`w-24 h-24 rounded-full ${config.iconBg} flex items-center justify-center shadow-sm`}>
              <span className={config.iconColor}>{config.icon}</span>
            </div>
            <h2 className={`font-display-lg-mobile md:font-display-lg ${config.color}`}>
              {config.title} RISK
            </h2>
            {avg != null && (
              <p className="font-label-md text-on-surface-variant">
                Average score: {avg} / 5.0
              </p>
            )}
          </div>

          {/* Explanation Card */}
          <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant shadow-sm w-full text-left">
            <p className="font-body-lg text-on-surface mb-4">
              {config.description}
            </p>
            <div className="bg-surface-container rounded-lg p-3 mb-4">
              <p className="font-label-md text-on-surface-variant flex items-center gap-2">
                <Target size={16} className="text-primary shrink-0" />
                {config.allocation}
              </p>
            </div>
            <div className="pt-4 border-t border-surface-container-highest">
              <p className="font-body-md text-on-surface-variant flex items-center justify-center gap-2">
                <Clock size={16} />
                Your profile should be retaken in 12 months
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="w-full flex flex-col space-y-4 pt-2">
            <button
              onClick={() => navigate('/onboarding/account-aggregator')}
              className="w-full h-[56px] rounded-lg bg-primary text-on-primary font-label-md hover:bg-on-primary-fixed-variant transition-colors active:scale-[0.98]"
            >
              Continue to Account Linking
            </button>
            <button
              onClick={() => navigate('/onboarding/risk-profiling')}
              className="w-full h-[48px] rounded-lg bg-surface text-primary border border-outline-variant font-label-md hover:bg-surface-container-low transition-colors active:scale-[0.98]"
            >
              Retake Test
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
