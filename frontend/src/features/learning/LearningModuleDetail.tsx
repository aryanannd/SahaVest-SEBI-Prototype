import React from 'react';
import { X, Users, Briefcase, ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function LearningModuleDetail() {
  const navigate = useNavigate();

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col antialiased">
      {/* Top Navigation (Task-Focused, simplified) */}
      <header className="w-full sticky top-0 z-50 bg-surface dark:bg-surface-dim border-b border-outline-variant dark:border-outline">
        <div className="flex items-center justify-between px-4 py-2 w-full max-w-7xl mx-auto h-[56px]">
          <button 
            onClick={() => navigate(-1)}
            aria-label="Close Learning Module" 
            className="text-on-surface-variant dark:text-on-surface-variant hover:bg-surface-container-low dark:hover:bg-surface-container-highest transition-colors rounded-full p-2 min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-95 duration-100"
          >
            <X size={24} />
          </button>
          <div className="flex-1 flex justify-center items-center space-x-2">
            {/* Progress Dots */}
            <div className="w-2 h-2 rounded-full bg-primary"></div>
            <div className="w-2 h-2 rounded-full bg-primary"></div>
            <div className="w-2 h-2 rounded-full bg-primary-fixed-dim"></div>
            <div className="w-2 h-2 rounded-full bg-surface-variant"></div>
            <div className="w-2 h-2 rounded-full bg-surface-variant"></div>
          </div>
          <div className="min-w-[44px]"></div> {/* Spacer for balance */}
        </div>
        
        {/* Localization Banner */}
        <div className="bg-surface-container-high py-2 px-4 text-center">
          <span className="font-label-sm text-on-surface-variant">Content currently available in English only</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-4 py-6 max-w-3xl mx-auto w-full pb-32 md:pb-6">
        <article className="bg-surface-container-lowest rounded-xl p-4 md:p-6 border border-outline-variant shadow-sm mb-6">
          <header className="mb-6">
            <span className="font-label-sm text-primary uppercase tracking-wider mb-2 block">Module 2: Basics</span>
            <h1 className="font-display-lg-mobile md:font-display-lg text-primary tracking-tight mb-4">Understanding Mutual Funds</h1>
            <p className="font-body-lg text-on-surface-variant">A mutual fund is a pool of money managed by a professional Fund Manager.</p>
          </header>

          {/* Illustration Block */}
          <div className="w-full aspect-video rounded-lg overflow-hidden bg-surface-container-low mb-6 flex items-center justify-center border border-outline-variant relative">
            <img 
              className="object-cover w-full h-full" 
              alt="Mutual Fund pool illustration" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBe_rBuytBHXDopDtT8riTdDGyJFY29LJuqaOGvk5-vt6b8e8yyO0rPEBNH7jfcgJDBtIgpBcwQ9tGhBfrY3BodRe4daFpKJQGwK9Bv3v07V_Hqpovbq9H9hqMEUrwD7MycO969eAsdEvgXy_WTA66FvOWUU_LasQ5Ev29Oey9W3nEZTg1zEGBwkGmfFW_YMxQF96a8Q1nQtx6-Dk-JOT1lM_0oFVsA02BfjR0absoTtBZX9Rd1HHLlQ-OEzBoeVkfnGjLSM2jeLkc" 
            />
          </div>

          {/* Digestible Text Blocks */}
          <section className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="mt-1 min-w-[32px] h-[32px] rounded-full bg-primary-fixed flex items-center justify-center text-primary-container">
                <Users size={18} className="fill-current" />
              </div>
              <div>
                <h2 className="font-headline-sm text-primary mb-1">Collective Power</h2>
                <p className="font-body-md text-on-surface-variant text-sm">Instead of buying individual stocks, you join thousands of other investors. This collective approach allows you to buy a small slice of many different companies.</p>
              </div>
            </div>
            
            <div className="w-full h-px bg-outline-variant/30 my-4"></div>
            
            <div className="flex items-start gap-4">
              <div className="mt-1 min-w-[32px] h-[32px] rounded-full bg-primary-fixed flex items-center justify-center text-primary-container">
                <Briefcase size={18} className="fill-current" />
              </div>
              <div>
                <h2 className="font-headline-sm text-primary mb-1">Professional Management</h2>
                <p className="font-body-md text-on-surface-variant text-sm">Experts research and select the investments, saving you time and reducing the complexity of monitoring daily market movements.</p>
              </div>
            </div>
          </section>
        </article>
      </main>

      {/* Bottom Action Bar (Fixed) */}
      <div className="fixed bottom-0 w-full z-50 bg-surface dark:bg-surface-dim border-t border-outline-variant dark:border-outline px-4 py-4 pb-6 flex justify-between items-center shadow-sm">
        <button 
          onClick={() => navigate(-1)}
          className="font-label-md text-on-surface-variant hover:text-primary transition-colors min-h-[44px] px-4 py-2 rounded-lg active:scale-95 duration-100 flex items-center gap-2"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <button 
          onClick={() => navigate('/learn/quiz')}
          className="bg-primary text-on-primary font-label-md min-h-[48px] px-8 rounded-lg active:scale-95 duration-100 transition-all shadow-sm hover:bg-primary-container flex items-center gap-2"
        >
          Next
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
