import { Header } from '../../components/common/Header';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { 
  Search, User, Plus, MoreVertical, TrendingUp, Calendar, 
  Mountain, Home, ShieldAlert, CheckCircle, Lightbulb, Loader2 
} from "lucide-react";

export function GoalsHub() {
  const navigate = useNavigate();
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGoals() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const headers: HeadersInit = {};
        if (session) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }
        
        const res = await fetch('http://localhost:3000/api/goals', { headers });
        const data = await res.json();
        setGoals(data.goals || []);
      } catch (err) {
        console.error("Failed to fetch goals", err);
      } finally {
        setLoading(false);
      }
    }
    fetchGoals();
  }, []);

  const getIcon = (name: string) => {
    const l = name.toLowerCase();
    if (l.includes('retire')) return <Mountain size={20} />;
    if (l.includes('house') || l.includes('home')) return <Home size={20} />;
    if (l.includes('emergency')) return <ShieldAlert size={20} />;
    return <CheckCircle size={20} />;
  };

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col antialiased">
      {/* TopAppBar */}
      <header className="bg-surface dark:bg-surface-dim text-primary dark:text-primary-fixed w-full sticky top-0 z-50 border-b border-outline-variant dark:border-outline flat no-shadows">
        <div className="flex items-center justify-between px-4 py-3 w-full max-w-7xl mx-auto">
          <button className="text-on-surface-variant dark:text-on-surface-variant hover:bg-surface-container-low dark:hover:bg-surface-container-highest transition-colors active:scale-95 duration-100 p-2 rounded-full flex items-center justify-center min-w-[44px] min-h-[44px]">
            <Search />
          </button>
          <Header />
          <button className="text-on-surface-variant dark:text-on-surface-variant hover:bg-surface-container-low dark:hover:bg-surface-container-highest transition-colors active:scale-95 duration-100 p-2 rounded-full flex items-center justify-center min-w-[44px] min-h-[44px]">
            <User />
          </button>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-6 pb-[100px] md:pb-8 flex flex-col gap-6 md:gap-8">
        
        {/* Page Header & Action */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2 className="font-display-lg-mobile md:font-display-lg text-primary mb-2">Your Financial Goals</h2>
            <p className="font-body-md text-on-surface-variant max-w-2xl">Track and manage the milestones that matter. Guided prosperity built on clarity and security.</p>
          </div>
          <button 
            onClick={() => navigate('/portfolio/goals/new')}
            className="bg-primary text-on-primary hover:bg-primary/90 rounded-full px-6 h-[48px] md:h-[56px] font-label-md flex items-center gap-2 transition-colors active:scale-95 shadow-sm">
            <Plus size={20} />
            Add New Goal
          </button>
        </div>

        {/* Goals Grid (Bento/Card Style) */}
        {loading ? (
          <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" size={32} /></div>
        ) : goals.length === 0 ? (
          <div className="text-center p-8 text-on-surface-variant bg-surface-container-low rounded-xl">
            <Mountain size={48} className="mx-auto mb-4 opacity-50" />
            <p>No goals defined yet. Start planning your future today!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {goals.map((goal: any) => {
              const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100) || 0;
              const isCompleted = progress >= 100;
              return (
                <article 
                  key={goal.id}
                  onClick={() => navigate(`/portfolio/goals/${goal.id}`)}
                  className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col gap-4 relative overflow-hidden group hover:border-primary/30 transition-colors shadow-sm hover:shadow-md cursor-pointer"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary-fixed-dim/20 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
                        {getIcon(goal.name)}
                      </div>
                      <h3 className="font-headline-sm text-on-surface">{goal.name}</h3>
                    </div>
                    <button className="text-outline hover:text-on-surface-variant p-1">
                      <MoreVertical size={20} />
                    </button>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between items-end mb-2">
                      <span className="font-headline-md text-primary">₹ {goal.current_amount.toLocaleString('en-IN')}</span>
                      <span className="font-label-md text-on-surface-variant">of ₹ {goal.target_amount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="w-full bg-surface-container-high rounded-full h-2.5 mb-2 overflow-hidden">
                      <div className="bg-primary h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <span className="font-label-sm text-secondary flex items-center gap-1">
                        {isCompleted ? <CheckCircle size={16} /> : <TrendingUp size={16} />} 
                        {isCompleted ? 'Completed' : 'On Track'}
                      </span>
                      <span className="font-label-sm text-on-surface-variant flex items-center gap-1">
                        <Calendar size={16} /> Target: {goal.target_date ? new Date(goal.target_date).getFullYear() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Insights / Empty State Area (Optional layout variation) */}
        <div className="mt-6 p-6 bg-primary-fixed rounded-xl flex items-center gap-4">
          <Lightbulb size={40} className="text-primary shrink-0" />
          <div>
            <h4 className="font-headline-sm text-on-primary-fixed">Strategic Insight</h4>
            <p className="font-body-md text-on-primary-fixed-variant mt-2">Increasing your monthly SIP for the House Down Payment by ₹5,000 could help you reach your target 3 months earlier.</p>
          </div>
        </div>

      </main>
    </div>
  );
}
