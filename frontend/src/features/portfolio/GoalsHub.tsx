import { useNavigate } from 'react-router-dom';
import { 
  Search, User, Plus, Mountain, MoreVertical, 
  TrendingUp, Calendar, Home, ShieldCheck, 
  CheckCircle2, Lightbulb
} from 'lucide-react';

export function GoalsHub() {
  const navigate = useNavigate();

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col antialiased w-full relative">
      {/* TopAppBar */}
      <header className="bg-surface text-primary w-full sticky top-0 z-50 border-b border-outline-variant">
        <div className="flex items-center justify-between px-4 py-3 w-full max-w-7xl mx-auto">
          <button 
            className="text-on-surface-variant hover:bg-surface-container-low transition-colors active:scale-95 duration-100 p-2 rounded-full flex items-center justify-center min-w-[44px] min-h-[44px]"
            aria-label="Search"
          >
            <Search className="w-6 h-6" />
          </button>
          <h1 className="font-headline-md text-primary tracking-tight">SahaVest</h1>
          <button 
            className="text-on-surface-variant hover:bg-surface-container-low transition-colors active:scale-95 duration-100 p-2 rounded-full flex items-center justify-center min-w-[44px] min-h-[44px]"
            aria-label="Account"
          >
            <User className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-6 pb-[100px] md:pb-6 flex flex-col gap-6 md:gap-8">
        
        {/* Page Header & Action */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2 className="font-display-lg-mobile md:font-display-lg text-primary mb-2">Your Financial Goals</h2>
            <p className="font-body-md text-on-surface-variant max-w-2xl">
              Track and manage the milestones that matter. Guided prosperity built on clarity and security.
            </p>
          </div>
          <button className="bg-primary text-on-primary hover:bg-primary/90 rounded-full px-6 h-[48px] md:h-[56px] font-label-md flex items-center gap-2 transition-colors active:scale-95 shadow-sm">
            <Plus className="w-5 h-5" />
            Add New Goal
          </button>
        </div>

        {/* Goals Grid (Bento/Card Style) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          
          {/* Goal Card: Retirement */}
          <article 
            onClick={() => navigate('/portfolio/goals/retirement')}
            className="cursor-pointer bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col gap-4 relative overflow-hidden group hover:border-primary/30 transition-colors shadow-sm hover:shadow-md"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-fixed-dim/20 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
                  <Mountain className="w-6 h-6" />
                </div>
                <h3 className="font-headline-sm text-on-surface">Retirement Fund</h3>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); }}
                className="text-outline hover:text-on-surface-variant p-1"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-2">
              <div className="flex justify-between items-end mb-2">
                <span className="font-headline-md text-primary">₹ 45,00,000</span>
                <span className="font-label-md text-on-surface-variant">of ₹ 2,00,00,000</span>
              </div>
              <div className="w-full bg-surface-container-high rounded-full h-2.5 mb-2 overflow-hidden">
                <div className="bg-primary h-2.5 rounded-full" style={{ width: '22.5%' }}></div>
              </div>
              <div className="flex justify-between items-center mt-3">
                <span className="font-label-sm text-secondary flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" /> On Track
                </span>
                <span className="font-label-sm text-on-surface-variant flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> Target: 2045
                </span>
              </div>
            </div>
          </article>

          {/* Goal Card: House Down Payment */}
          <article 
            onClick={() => navigate('/portfolio/goals/house')}
            className="cursor-pointer bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col gap-4 relative overflow-hidden group hover:border-primary/30 transition-colors shadow-sm hover:shadow-md"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-fixed-dim/20 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
                  <Home className="w-6 h-6" />
                </div>
                <h3 className="font-headline-sm text-on-surface">House Down Payment</h3>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); }}
                className="text-outline hover:text-on-surface-variant p-1"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-2">
              <div className="flex justify-between items-end mb-2">
                <span className="font-headline-md text-primary">₹ 12,50,000</span>
                <span className="font-label-md text-on-surface-variant">of ₹ 20,00,000</span>
              </div>
              <div className="w-full bg-surface-container-high rounded-full h-2.5 mb-2 overflow-hidden">
                <div className="bg-secondary h-2.5 rounded-full" style={{ width: '62.5%' }}></div>
              </div>
              <div className="flex justify-between items-center mt-3">
                <span className="font-label-sm text-secondary flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" /> Ahead
                </span>
                <span className="font-label-sm text-on-surface-variant flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> Target: 2026
                </span>
              </div>
            </div>
          </article>

          {/* Goal Card: Emergency Fund */}
          <article 
            onClick={() => navigate('/portfolio/goals/emergency')}
            className="cursor-pointer bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col gap-4 relative overflow-hidden group hover:border-primary/30 transition-colors shadow-sm hover:shadow-md"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-tertiary-fixed-dim/20 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-headline-sm text-on-surface">Emergency Fund</h3>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); }}
                className="text-outline hover:text-on-surface-variant p-1"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-2">
              <div className="flex justify-between items-end mb-2">
                <span className="font-headline-md text-primary">₹ 5,00,000</span>
                <span className="font-label-md text-on-surface-variant">of ₹ 5,00,000</span>
              </div>
              <div className="w-full bg-surface-container-high rounded-full h-2.5 mb-2 overflow-hidden">
                <div className="bg-tertiary h-2.5 rounded-full" style={{ width: '100%' }}></div>
              </div>
              <div className="flex justify-between items-center mt-3">
                <span className="font-label-sm text-secondary flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Completed
                </span>
                <span className="font-label-sm text-on-surface-variant flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> Target: Achieved
                </span>
              </div>
            </div>
          </article>

        </div>

        {/* Insights / Empty State Area */}
        <div className="mt-6 p-6 bg-primary-fixed rounded-xl flex items-center gap-4">
          <Lightbulb className="text-primary w-10 h-10 flex-shrink-0" />
          <div>
            <h4 className="font-headline-sm text-on-primary-fixed">Strategic Insight</h4>
            <p className="font-body-md text-on-primary-fixed-variant mt-2">
              Increasing your monthly SIP for the House Down Payment by ₹5,000 could help you reach your target 3 months earlier.
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}
