import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Flag, CalendarDays, Check, Save
} from 'lucide-react';

export function GoalDetail() {
  const navigate = useNavigate();

  return (
    <div className="bg-surface text-on-surface min-h-screen font-body-md text-body-md pb-[100px] antialiased w-full relative">
      
      {/* Task-Focused Header (Suppresses global nav) */}
      <header className="sticky top-0 z-50 bg-surface/90 backdrop-blur-sm border-b border-outline-variant/30 flex items-center h-[64px] px-4 md:px-8">
        <button 
          onClick={() => navigate(-1)}
          aria-label="Go back" 
          className="h-[44px] w-[44px] flex items-center justify-start text-on-surface hover:text-primary transition-colors group"
        >
          <ArrowLeft className="w-6 h-6 group-active:scale-90 transition-transform" />
        </button>
        <h1 className="font-headline-md flex-1 text-center pr-[44px] tracking-tight">Edit Goal</h1>
      </header>
      
      <main className="w-full max-w-2xl mx-auto px-4 md:px-0 py-6 flex flex-col gap-6">
        
        {/* Progress Visualization Card (Existing Goal Context) */}
        <section className="shadow-[0px_4px_12px_rgba(0,0,0,0.04)] border border-gray-200 bg-surface-container-lowest rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-fixed-dim/20 rounded-bl-full blur-2xl pointer-events-none"></div>
          
          <div className="relative w-[140px] h-[140px] flex items-center justify-center mb-3">
            {/* SVG Progress Ring */}
            <svg className="w-full h-full transform -rotate-90 transition-all duration-800 ease-in-out" viewBox="0 0 120 120">
              {/* Background Ring */}
              <circle className="text-surface-container-high" cx="60" cy="60" fill="transparent" r="54" stroke="currentColor" strokeWidth="8"></circle>
              {/* Progress Ring (65% filled) */}
              <circle className="text-secondary" cx="60" cy="60" fill="transparent" r="54" stroke="currentColor" strokeDasharray="339.292" strokeDashoffset="118.75" strokeLinecap="round" strokeWidth="8"></circle>
            </svg>
            {/* Center Text */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="font-display-lg text-secondary tracking-tight">65%</span>
              <span className="font-label-sm text-on-surface-variant uppercase tracking-wider">Funded</span>
            </div>
          </div>
          
          <div className="text-center">
            <h2 className="font-headline-sm text-on-surface mb-2">European Vacation</h2>
            <p className="font-body-md text-on-surface-variant">
              <span className="font-semibold text-on-surface">₹6,50,000</span> / ₹10,00,000
            </p>
            <p className="font-label-sm text-outline mt-1">Target: Dec 2025</p>
          </div>
        </section>

        {/* Form Details */}
        <section className="shadow-[0px_4px_12px_rgba(0,0,0,0.04)] border border-gray-200 bg-surface-container-lowest rounded-xl p-4 flex flex-col gap-4">
          <h3 className="font-headline-sm text-on-surface mb-1">Goal Parameters</h3>
          
          {/* Goal Name Input */}
          <div className="flex flex-col gap-2">
            <label className="font-label-md text-on-surface pl-1" htmlFor="goal-name">Goal Name</label>
            <div className="border border-outline-variant focus-within:border-primary focus-within:border-2 focus-within:px-[15px] transition-all duration-200 rounded-[16px] bg-surface-bright flex items-center px-4 h-[56px]">
              <Flag className="text-outline mr-3 w-6 h-6" />
              <input 
                className="w-full bg-transparent border-none p-0 text-on-surface font-body-lg placeholder-outline focus:ring-0" 
                id="goal-name" 
                placeholder="e.g. Dream Home" 
                type="text" 
                defaultValue="European Vacation" 
              />
            </div>
          </div>

          {/* Target Amount Input */}
          <div className="flex flex-col gap-2">
            <label className="font-label-md text-on-surface pl-1" htmlFor="target-amount">Target Amount (₹)</label>
            <div className="border border-outline-variant focus-within:border-primary focus-within:border-2 focus-within:px-[15px] transition-all duration-200 rounded-[16px] bg-surface-bright flex items-center px-4 h-[56px]">
              <span className="font-body-lg text-outline mr-2">₹</span>
              <input 
                className="w-full bg-transparent border-none p-0 text-on-surface font-body-lg placeholder-outline focus:ring-0" 
                id="target-amount" 
                inputMode="numeric" 
                placeholder="0.00" 
                type="text" 
                defaultValue="10,00,000" 
              />
            </div>
          </div>

          {/* Target Date Input */}
          <div className="flex flex-col gap-2">
            <label className="font-label-md text-on-surface pl-1" htmlFor="target-date">Target Date</label>
            <div className="border border-outline-variant focus-within:border-primary focus-within:border-2 focus-within:px-[15px] transition-all duration-200 rounded-[16px] bg-surface-bright flex items-center px-4 h-[56px]">
              <CalendarDays className="text-outline mr-3 w-6 h-6" />
              <input 
                className="w-full bg-transparent border-none p-0 text-on-surface font-body-lg focus:ring-0" 
                id="target-date" 
                type="date" 
                defaultValue="2025-12-15" 
              />
            </div>
          </div>
        </section>

        {/* Linked Investments Section (Progressive Disclosure / List) */}
        <section className="shadow-[0px_4px_12px_rgba(0,0,0,0.04)] border border-gray-200 bg-surface-container-lowest rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-headline-sm text-on-surface">Linked Investments</h3>
            <span className="font-label-sm text-primary bg-primary-fixed px-3 py-1 rounded-full">2 Selected</span>
          </div>
          <p className="font-body-md text-on-surface-variant mb-1">Select the portfolios contributing to this goal.</p>
          
          <div className="flex flex-col gap-0 border border-outline-variant/50 rounded-lg overflow-hidden">
            
            {/* Investment Item 1 (Selected) */}
            <label className="flex items-center p-4 border-b border-outline-variant/30 hover:bg-surface-container-low transition-colors cursor-pointer group bg-primary-fixed-dim/10">
              <div className="relative flex items-center justify-center w-6 h-6 mr-4">
                <input defaultChecked className="peer appearance-none w-6 h-6 border-2 border-outline-variant rounded-[6px] checked:bg-primary checked:border-primary transition-all" type="checkbox" />
                <Check className="absolute text-on-primary w-4 h-4 opacity-0 peer-checked:opacity-100 pointer-events-none" />
              </div>
              <div className="flex-1 flex flex-col">
                <span className="font-label-md text-on-surface">Core Equity Portfolio</span>
                <span className="font-label-sm text-on-surface-variant">Current Value: ₹4,20,000</span>
              </div>
            </label>

            {/* Investment Item 2 (Selected) */}
            <label className="flex items-center p-4 border-b border-outline-variant/30 hover:bg-surface-container-low transition-colors cursor-pointer group bg-primary-fixed-dim/10">
              <div className="relative flex items-center justify-center w-6 h-6 mr-4">
                <input defaultChecked className="peer appearance-none w-6 h-6 border-2 border-outline-variant rounded-[6px] checked:bg-primary checked:border-primary transition-all" type="checkbox" />
                <Check className="absolute text-on-primary w-4 h-4 opacity-0 peer-checked:opacity-100 pointer-events-none" />
              </div>
              <div className="flex-1 flex flex-col">
                <span className="font-label-md text-on-surface">Liquid Mutual Funds</span>
                <span className="font-label-sm text-on-surface-variant">Current Value: ₹2,30,000</span>
              </div>
            </label>

            {/* Investment Item 3 (Unselected) */}
            <label className="flex items-center p-4 hover:bg-surface-container-low transition-colors cursor-pointer group">
              <div className="relative flex items-center justify-center w-6 h-6 mr-4">
                <input className="peer appearance-none w-6 h-6 border-2 border-outline-variant rounded-[6px] checked:bg-primary checked:border-primary transition-all" type="checkbox" />
                <Check className="absolute text-on-primary w-4 h-4 opacity-0 peer-checked:opacity-100 pointer-events-none" />
              </div>
              <div className="flex-1 flex flex-col">
                <span className="font-label-md text-on-surface">Gold Sovereign Bonds</span>
                <span className="font-label-sm text-on-surface-variant">Current Value: ₹1,50,000</span>
              </div>
            </label>
            
          </div>
        </section>
      </main>

      {/* Fixed Bottom Action Area */}
      <div className="fixed bottom-0 left-0 w-full bg-surface/95 backdrop-blur-md border-t border-outline-variant/30 p-4 z-50 flex items-center justify-center shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
        <button className="w-full max-w-2xl h-[56px] bg-primary text-on-primary font-label-md rounded-full shadow-sm hover:shadow-md hover:bg-primary-container transition-all active:scale-[0.98] flex items-center justify-center gap-2">
          <Save className="w-5 h-5" />
          Update Goal Details
        </button>
      </div>

    </div>
  );
}
