import React from 'react';
import { Target, TrendingUp, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function PortfolioHub() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col bg-surface overflow-y-auto px-4 pt-6 pb-20">
      <div className="mb-6">
        <h1 className="font-display-lg-mobile text-on-surface mb-2">Portfolio Insights</h1>
        <p className="font-body-md text-on-surface-variant">Deep dive into your financial progress.</p>
      </div>

      <div className="flex flex-col gap-4">
        <button 
          onClick={() => navigate('/portfolio/returns')}
          className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex items-center justify-between shadow-sm hover:bg-surface-container-low transition-colors text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
            <div>
              <h3 className="font-headline-sm text-on-surface">Returns & XIRR</h3>
              <p className="font-label-sm text-on-surface-variant">Detailed performance breakdown</p>
            </div>
          </div>
          <ChevronRight className="text-on-surface-variant" size={24} />
        </button>

        <button 
          onClick={() => navigate('/portfolio/goals')}
          className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex items-center justify-between shadow-sm hover:bg-surface-container-low transition-colors text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
              <Target size={24} />
            </div>
            <div>
              <h3 className="font-headline-sm text-on-surface">Financial Goals</h3>
              <p className="font-label-sm text-on-surface-variant">Track milestones like Retirement</p>
            </div>
          </div>
          <ChevronRight className="text-on-surface-variant" size={24} />
        </button>
      </div>
    </div>
  );
}
