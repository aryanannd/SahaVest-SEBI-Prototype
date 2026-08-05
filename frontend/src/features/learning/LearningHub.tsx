import { Header } from '../../components/common/Header';
import React, { useState, useEffect } from 'react';
import { User, Bell, Flame, Medal, ShieldAlert, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

export function LearningHub() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProgress() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const headers: HeadersInit = {};
        if (session) headers['Authorization'] = `Bearer ${session.access_token}`;
        
        const res = await fetch('/api/learning-progress', { headers });
        const result = await res.json();
        if (result.progress) {
           setProgress(result.progress);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProgress();
  }, []);

  const completedModules = progress.filter(p => p.status === 'completed').length;
  // If no data, fallback to 3 badges for the prototype
  const badgesEarned = progress.length > 0 ? completedModules : 3;

  return (
    <div className="bg-background text-on-background antialiased pb-24 md:pb-0 min-h-screen flex flex-col font-body-md">
      {/* TopAppBar */}
      <header className="w-full top-0 sticky bg-surface border-b border-outline-variant shadow-sm flex justify-between items-center h-14 px-4 z-40 transition-colors duration-200">
        <button className="w-[44px] h-[44px] flex items-center justify-center rounded-full hover:bg-surface-container transition-colors duration-200 text-primary md:hidden">
          <User className="fill-current" size={24} />
        </button>
        <div className="hidden md:flex items-center gap-2">
          <User className="text-primary fill-current" size={24} />
          <Header />
        </div>
        <Header />
        <button className="w-[44px] h-[44px] flex items-center justify-center rounded-full hover:bg-surface-container transition-colors duration-200 text-primary">
          <Bell size={24} />
        </button>
      </header>

      {/* Main Content Canvas */}
      <main className="max-w-7xl mx-auto px-4 pt-6 pb-8 grid grid-cols-4 md:grid-cols-8 gap-4 flex-grow">
        
        {/* Header & Stats Section (Spans full width) */}
        <section className="col-span-4 md:col-span-8 flex flex-col gap-4 mb-4">
          <div>
            <h1 className="font-headline-md text-on-background mb-1">Learning Hub</h1>
            <p className="font-body-md text-on-surface-variant">Master the essentials of guided prosperity.</p>
          </div>
          
          <div className="bg-surface-container border border-outline-variant/50 rounded-lg px-3 py-2 inline-block">
            <p className="font-label-sm text-outline">
              🌍 Content currently available in English. Full translation rolling out.
            </p>
          </div>
          
          {/* Gamification Cards (Bento style) */}
          <div className="grid grid-cols-2 gap-3">
            {/* Streak Card */}
            <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/30 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-tertiary-fixed/20 to-transparent opacity-50"></div>
              <Flame size={36} className="text-tertiary-container fill-tertiary-container mb-2 relative z-10" />
              <span className="font-label-sm text-on-surface-variant uppercase tracking-wider relative z-10">Learning Streak</span>
              <span className="font-headline-md text-primary mt-1 relative z-10">5 Days</span>
            </div>
            {/* Badges Card */}
            <div 
              onClick={() => navigate('/learn/badges')}
              className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/30 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden cursor-pointer hover:bg-surface-container-low transition-colors active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-secondary-container/20 to-transparent opacity-50 pointer-events-none"></div>
              <Medal size={36} className="text-secondary fill-secondary mb-2 relative z-10" />
              <span className="font-label-sm text-on-surface-variant uppercase tracking-wider relative z-10">Badges Earned</span>
              {loading ? (
                <div className="mt-1 relative z-10"><Loader2 className="animate-spin text-primary" size={20} /></div>
              ) : (
                <span className="font-headline-md text-primary mt-1 relative z-10">{badgesEarned}</span>
              )}
            </div>
          </div>
        </section>

        {/* Course Modules (Bento Grid) */}
        <section className="col-span-4 md:col-span-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* High Priority Module: Fraud Awareness */}
          <div 
            onClick={() => navigate('/learn/module')} 
            className="bg-surface-container-lowest rounded-xl p-4 border border-error-container shadow-sm relative overflow-hidden flex flex-col md:col-span-2 lg:col-span-2 row-span-1 min-h-[200px] cursor-pointer hover:bg-surface-container-low transition-colors group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-error/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="text-error" size={20} />
                  <span className="font-label-sm text-error uppercase tracking-wider">High Priority</span>
                </div>
                <h2 className="font-headline-sm text-primary">Fraud Awareness</h2>
                <p className="font-body-md text-on-surface-variant max-w-sm">Learn to identify and avoid common financial scams targeting retail investors.</p>
              </div>
              
              {/* Progress Ring */}
              <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
                <svg className="w-full h-full -rotate-90" height="64" width="64">
                  <circle className="text-surface-container-high" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeWidth="4"></circle>
                  <circle className="text-error transition-all duration-500 ease-in-out" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeDasharray="175.93" strokeDashoffset="140.74" strokeLinecap="round" strokeWidth="4"></circle>
                </svg>
                <span className="absolute font-label-sm text-on-background">20%</span>
              </div>
            </div>
            
            <div className="mt-auto flex items-center justify-between">
              <span className="font-label-md text-on-surface-variant">2/10 Lessons</span>
              <button className="bg-primary text-on-primary px-6 py-2 rounded-full font-label-md min-h-[44px] hover:bg-primary/90 transition-colors">Continue</button>
            </div>
          </div>

          {/* Standard Module 1: Financial Basics */}
          <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/30 shadow-sm flex flex-col relative overflow-hidden cursor-pointer hover:bg-surface-container-low transition-colors group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary-container/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="font-headline-sm text-primary mb-1">Financial Basics</h2>
                <p className="font-body-md text-on-surface-variant line-clamp-2 text-sm">The core principles of investing and saving for the future.</p>
              </div>
              {/* Progress Ring */}
              <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0 ml-3">
                <svg className="w-full h-full -rotate-90" height="48" width="48">
                  <circle className="text-surface-container-high" cx="24" cy="24" fill="transparent" r="20" stroke="currentColor" strokeWidth="3"></circle>
                  <circle className="text-primary transition-all duration-500 ease-in-out" cx="24" cy="24" fill="transparent" r="20" stroke="currentColor" strokeDasharray="125.66" strokeDashoffset="75.4" strokeLinecap="round" strokeWidth="3"></circle>
                </svg>
                <span className="absolute font-label-sm text-on-background text-[10px]">40%</span>
              </div>
            </div>
            <div className="mt-auto pt-4 flex items-center justify-between border-t border-surface-container">
              <span className="font-label-sm text-on-surface-variant">4/10 Lessons</span>
              <ArrowRight className="text-primary group-hover:translate-x-1 transition-transform" size={20} />
            </div>
          </div>

          {/* Standard Module 2: Tax Optimization */}
          <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/30 shadow-sm flex flex-col relative overflow-hidden cursor-pointer hover:bg-surface-container-low transition-colors group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-secondary-container/10 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="font-headline-sm text-primary mb-1">Tax Optimization</h2>
                <p className="font-body-md text-on-surface-variant line-clamp-2 text-sm">Maximize your returns through smart tax planning strategies.</p>
              </div>
              {/* Progress Ring */}
              <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0 ml-3">
                <svg className="w-full h-full -rotate-90" height="48" width="48">
                  <circle className="text-surface-container-high" cx="24" cy="24" fill="transparent" r="20" stroke="currentColor" strokeWidth="3"></circle>
                  <circle className="text-secondary transition-all duration-500 ease-in-out" cx="24" cy="24" fill="transparent" r="20" stroke="currentColor" strokeDasharray="125.66" strokeDashoffset="125.66" strokeLinecap="round" strokeWidth="3"></circle>
                </svg>
                <span className="absolute font-label-sm text-on-background text-[10px]">0%</span>
              </div>
            </div>
            <div className="mt-auto pt-4 flex items-center justify-between border-t border-surface-container">
              <span className="font-label-sm text-on-surface-variant">0/8 Lessons</span>
              <ArrowRight className="text-primary group-hover:translate-x-1 transition-transform" size={20} />
            </div>
          </div>

        </section>

        {/* Leaderboard Callout */}
        <section className="col-span-4 md:col-span-8 mt-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-headline-sm text-on-surface">Community Leaderboard</h2>
          </div>
          <div 
            onClick={() => navigate('/learn/leaderboard')}
            className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm cursor-pointer hover:bg-surface-container-low transition-colors active:scale-95 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
                <Medal size={24} />
              </div>
              <div>
                <h3 className="font-headline-sm text-primary mb-1">View Rankings</h3>
                <p className="font-body-md text-on-surface-variant text-sm">See how your portfolio compares</p>
              </div>
            </div>
            <ArrowRight className="text-primary" size={20} />
          </div>
        </section>
      </main>
    </div>
  );
}
